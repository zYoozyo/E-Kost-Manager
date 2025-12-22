<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Pembayaran;
use App\Services\PaymentGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PembayaranController extends Controller
{
    // Menampilkan semua pembayaran (owner => summary, tenant => daftar pribadi)
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return $this->ownerPayments($request);
        }

        if ($user->role === 'tenant') {
            return $this->tenantPayments($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Role tidak dikenali untuk akses pembayaran',
        ], 403);
    }

    public function ownerPayments(Request $request)
    {
        $owner = $request->user();

        try {
            $query = Pembayaran::with([
                'tenant:id,name,whatsapp',
                'kamar:id,nomor_kamar,kost_id',
                'kamar.kost:id,nama_kost',
            ])
                ->forOwner($owner->id)
                ->when($request->filled('status'), function ($q) use ($request) {
                    $q->where('status', $request->status);
                })
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where(function ($inner) use ($request) {
                        $search = '%'.$request->search.'%';
                        $inner->where('invoice_code', 'like', $search)
                            ->orWhereHas('tenant', function ($tenantQuery) use ($search) {
                                $tenantQuery->where('name', 'like', $search);
                            })
                            ->orWhereHas('kamar', function ($roomQuery) use ($search) {
                                $roomQuery->where('nomor_kamar', 'like', $search);
                            });
                    });
                })
                ->orderByDesc('due_date');

            $perPage = (int) ($request->get('per_page', 15));
            $payments = $query->paginate($perPage);

            $summary = $this->ownerSummary($owner->id);

            return response()->json([
                'success' => true,
                'data' => $payments,
                'summary' => $summary,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in ownerPayments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat data pembayaran',
                'data' => [],
                'summary' => []
            ]);
        }
    }

    protected function tenantPayments(Request $request)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat mengakses daftar pembayaran ini',
            ], 403);
        }

        $payments = Pembayaran::with(['owner:id,name,whatsapp', 'kamar:id,nomor_kamar'])
            ->where('tenant_id', $tenant->id)
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->orderByDesc('due_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    // Membuat invoice pembayaran baru (owner)
    public function store(Request $request)
    {
        $owner = $request->user();

        if ($owner->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik yang dapat membuat tagihan',
            ], 403);
        }

        $validated = $request->validate([
            'kamar_id' => ['required', 'exists:kamars,id'],
            'periode_mulai' => ['required', 'date'],
            'periode_selesai' => ['required', 'date', 'after_or_equal:periode_mulai'],
            'due_date' => ['nullable', 'date', 'after_or_equal:periode_mulai'],
            'nominal_tagihan' => ['nullable', 'integer', 'min:0'],
            'metode_pembayaran' => ['nullable', Rule::in(['transfer', 'tunai', 'qris', 'other'])],
            'catatan' => ['nullable', 'string'],
        ]);

        $kamar = Kamar::with('kost')->findOrFail($validated['kamar_id']);

        if (! $kamar->kost || $kamar->kost->user_id !== $owner->id) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar ini tidak dimiliki oleh Anda',
            ], 403);
        }

        if (! $kamar->tenant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar belum memiliki penyewa aktif',
            ], 422);
        }

        $duplicate = Pembayaran::where('kamar_id', $kamar->id)
            ->whereDate('periode_mulai', $validated['periode_mulai'])
            ->whereDate('periode_selesai', $validated['periode_selesai'])
            ->exists();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'Tagihan untuk periode tersebut sudah ada',
            ], 422);
        }

        $dueDate = $validated['due_date'] ?? now()->parse($validated['periode_mulai'])->addDays(7);
        $nominal = $validated['nominal_tagihan'] ?? $kamar->harga_sewa;

        $payment = Pembayaran::create([
            'invoice_code' => $this->generateInvoiceCode(),
            'owner_id' => $owner->id,
            'tenant_id' => $kamar->tenant_id,
            'kamar_id' => $kamar->id,
            'periode_mulai' => $validated['periode_mulai'],
            'periode_selesai' => $validated['periode_selesai'],
            'due_date' => $dueDate,
            'nominal_tagihan' => $nominal,
            'status' => Pembayaran::STATUS_PENDING,
            'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'transfer',
            'catatan' => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invoice pembayaran berhasil dibuat',
            'data' => $payment->load(['tenant:id,name', 'kamar:id,nomor_kamar']),
        ], 201);
    }

    // Menampilkan detail pembayaran tertentu
    public function show(Request $request, Pembayaran $pembayaran)
    {
        if (! $this->canAccessPayment($request->user(), $pembayaran)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pembayaran ini',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $pembayaran->load(['tenant:id,name,whatsapp', 'owner:id,name', 'kamar:id,nomor_kamar']),
        ]);
    }

    // Mengupdate status pembayaran (owner)
    public function update(Request $request, Pembayaran $pembayaran)
    {
        $owner = $request->user();

        if ($owner->role !== 'admin' || $pembayaran->owner_id !== $owner->id) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik terkait yang dapat memperbarui pembayaran ini',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                Pembayaran::STATUS_PENDING,
                Pembayaran::STATUS_WAITING_VERIFICATION,
                Pembayaran::STATUS_PAID,
                Pembayaran::STATUS_LATE,
                Pembayaran::STATUS_REJECTED,
            ])],
            'nominal_dibayar' => ['nullable', 'integer', 'min:0'],
            'catatan' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'metode_pembayaran' => ['nullable', Rule::in(['transfer', 'tunai', 'qris', 'other'])],
        ]);

        if ($validated['status'] === Pembayaran::STATUS_PAID) {
            $amount = $validated['nominal_dibayar'] ?? $pembayaran->nominal_dibayar ?? $pembayaran->nominal_tagihan;
            $pembayaran->nominal_dibayar = $amount;
            $pembayaran->markAsPaid($amount);
        } else {
            $pembayaran->status = $validated['status'];
            if ($validated['status'] !== Pembayaran::STATUS_PAID) {
                $pembayaran->paid_at = null;
            }
            $pembayaran->nominal_dibayar = $validated['nominal_dibayar'] ?? $pembayaran->nominal_dibayar;
            $pembayaran->save();
        }

        $pembayaran->catatan = $validated['catatan'] ?? $pembayaran->catatan;
        $pembayaran->due_date = $validated['due_date'] ?? $pembayaran->due_date;
        if (isset($validated['metode_pembayaran'])) {
            $pembayaran->metode_pembayaran = $validated['metode_pembayaran'];
        }
        $pembayaran->save();

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil diperbarui',
            'data' => $pembayaran->fresh(['tenant:id,name', 'kamar:id,nomor_kamar']),
        ]);
    }

    // Menghapus pembayaran
    public function destroy(Request $request, Pembayaran $pembayaran)
    {
        $owner = $request->user();

        if ($owner->role !== 'admin' || $pembayaran->owner_id !== $owner->id) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik terkait yang dapat menghapus pembayaran ini',
            ], 403);
        }

        if ($pembayaran->status === Pembayaran::STATUS_PAID) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran yang sudah lunas tidak dapat dihapus',
            ], 422);
        }

        if ($pembayaran->bukti_pembayaran_path) {
            Storage::disk('public')->delete($pembayaran->bukti_pembayaran_path);
        }

        $pembayaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dihapus',
        ]);
    }

    // Upload bukti pembayaran oleh tenant
    public function uploadProof(Request $request, Pembayaran $pembayaran)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant' || $pembayaran->tenant_id !== $tenant->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat mengunggah bukti untuk pembayaran ini',
            ], 403);
        }

        if (! in_array($pembayaran->status, [
            Pembayaran::STATUS_PENDING,
            Pembayaran::STATUS_LATE,
            Pembayaran::STATUS_REJECTED,
        ])) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran sudah ditinjau, tidak dapat mengunggah ulang',
            ], 422);
        }

        $validated = $request->validate([
            'bukti' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'nominal_dibayar' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($pembayaran->bukti_pembayaran_path) {
            Storage::disk('public')->delete($pembayaran->bukti_pembayaran_path);
        }

        $path = $validated['bukti']->store('bukti-pembayaran', 'public');

        $pembayaran->update([
            'bukti_pembayaran_path' => $path,
            'nominal_dibayar' => $validated['nominal_dibayar'] ?? $pembayaran->nominal_dibayar,
            'status' => Pembayaran::STATUS_WAITING_VERIFICATION,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah dan menunggu verifikasi',
            'data' => $pembayaran->fresh(['owner:id,name', 'kamar:id,nomor_kamar']),
        ]);
    }

    // ===== QRIS STUBS to satisfy FE contracts =====
    public function createQris(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string',
        ]);

        $expiresAt = now()->addMinutes(10)->toIso8601String();

        return response()->json([
            'message' => 'QRIS created (stub)',
            'data' => [
                'qris_string' => '00020101021226680014ID.CO.QRIS.WWW01189360091600000000000300303UMI51470015ID1020025303350540'.rand(1000, 9999),
                'invoice_id' => $validated['invoice_id'],
                'amount' => (float) $validated['amount'],
                'status' => 'pending',
                'expires_at' => $expiresAt,
                'payment_url' => null,
            ],
        ]);
    }

    public function checkQrisStatus(string $invoiceId)
    {
        // Stub: always pending
        return response()->json([
            'message' => 'QRIS status fetched (stub)',
            'data' => [
                'invoice_id' => $invoiceId,
                'status' => 'pending',
                'paid_at' => null,
                'payment_method' => 'qris',
            ],
        ]);
    }

    public function history(Request $request)
    {
        // Alias ke index() agar kompatibel dengan kontrak FE lama
        return $this->index($request);
    }

    // Generate monthly invoices for all occupied rooms
    public function generateMonthlyInvoices(Request $request)
    {
        $owner = $request->user();

        if ($owner->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik yang dapat generate tagihan',
            ], 403);
        }

        $validated = $request->validate([
            'reference_date' => ['nullable', 'date'],
        ]);

        $referenceDate = !empty($validated['reference_date']) 
            ? \Carbon\Carbon::parse($validated['reference_date'])
            : now();

        try {
            $created = PaymentGenerator::generateMonthlyInvoices($referenceDate);

            $message = $created > 0 
                ? "Berhasil generate {$created} tagihan baru untuk bulan {$referenceDate->format('F Y')}"
                : "Tidak ada tagihan baru yang di-generate untuk bulan {$referenceDate->format('F Y')}";

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'created' => $created,
                    'message' => $message,
                    'reference_month' => $referenceDate->format('F Y'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate tagihan: '.$e->getMessage(),
            ], 500);
        }
    }

    protected function ownerSummary(int $ownerId): array
    {
        $baseQuery = Pembayaran::query()->where('owner_id', $ownerId);
        $now = now();

        return [
            'total_due_this_month' => (clone $baseQuery)
                ->whereMonth('due_date', $now->month)
                ->whereYear('due_date', $now->year)
                ->sum('nominal_tagihan'),
            'paid_this_month' => (clone $baseQuery)
                ->whereMonth('paid_at', $now->month)
                ->whereYear('paid_at', $now->year)
                ->where('status', Pembayaran::STATUS_PAID)
                ->sum('nominal_dibayar'),
            'late_count' => (clone $baseQuery)
                ->where('status', Pembayaran::STATUS_LATE)
                ->count(),
            'pending_count' => (clone $baseQuery)
                ->whereIn('status', [
                    Pembayaran::STATUS_PENDING,
                    Pembayaran::STATUS_WAITING_VERIFICATION,
                ])->count(),
        ];
    }

    protected function canAccessPayment($user, Pembayaran $pembayaran): bool
    {
        if ($user->role === 'admin' && $pembayaran->owner_id === $user->id) {
            return true;
        }

        if ($user->role === 'tenant' && $pembayaran->tenant_id === $user->id) {
            return true;
        }

        return false;
    }

    protected function generateInvoiceCode(): string
    {
        return 'INV-'.now()->format('Ym').'-'.Str::upper(Str::random(6));
    }
}
