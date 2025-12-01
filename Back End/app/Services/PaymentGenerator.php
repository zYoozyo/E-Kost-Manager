<?php

namespace App\Services;

use App\Models\Kamar;
use App\Models\Pembayaran;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PaymentGenerator
{
    public static function generateMonthlyInvoices(?Carbon $referenceDate = null): int
    {
        $date = $referenceDate ?? now();
        $start = $date->copy()->startOfMonth();
        $end = $date->copy()->endOfMonth();

        $rooms = Kamar::with('kost')->whereNotNull('tenant_id')->get();

        $created = 0;

        foreach ($rooms as $room) {
            if (! $room->kost) {
                continue;
            }

            // Skip jika sudah ada tagihan untuk periode ini
            $exists = Pembayaran::where('kamar_id', $room->id)
                ->whereDate('periode_mulai', $start)
                ->whereDate('periode_selesai', $end)
                ->exists();

            if ($exists) {
                continue;
            }

            // Smart logic: hanya generate tagihan jika penyewa sudah mulai sewa
            $shouldGenerate = false;
            $periodeMulai = $start;
            $periodeSelesai = $end;

            if ($room->tanggal_mulai_sewa) {
                $sewaStartDate = $room->tanggal_mulai_sewa;
                $durasiSewa = $room->durasi_sewa ?? 1; // default 1 bulan
                $sewaEndDate = $sewaStartDate->copy()->addMonths($durasiSewa);
                
                // Generate invoice untuk setiap bulan dalam durasi sewa
                for ($month = 0; $month < $durasiSewa; $month++) {
                    $currentMonthStart = $sewaStartDate->copy()->addMonths($month);
                    $currentMonthEnd = $currentMonthStart->copy()->endOfMonth();
                    
                    // Skip jika sudah ada tagihan untuk bulan ini
                    $exists = Pembayaran::where('kamar_id', $room->id)
                        ->whereDate('periode_mulai', $currentMonthStart)
                        ->whereDate('periode_selesai', $currentMonthEnd)
                        ->exists();

                    if ($exists) {
                        continue;
                    }

                    // Generate invoice untuk bulan ini
                    Pembayaran::create([
                        'invoice_code' => self::generateInvoiceCode(),
                        'owner_id' => $room->kost->user_id,
                        'tenant_id' => $room->tenant_id,
                        'kamar_id' => $room->id,
                        'periode_mulai' => $currentMonthStart->toDateString(),
                        'periode_selesai' => $currentMonthEnd->toDateString(),
                        'due_date' => $currentMonthStart->copy()->addDays(7)->toDateString(),
                        'nominal_tagihan' => $room->harga_sewa,
                        'status' => Pembayaran::STATUS_PENDING,
                        'metode_pembayaran' => 'transfer',
                    ]);

                    $created++;
                }
                
                // Skip ke next room (karena sudah generate semua bulan)
                continue;
            }
        }

        return $created;
    }

    public static function generateInvoiceCode(): string
    {
        return 'INV-'.now()->format('Ym').'-'.Str::upper(Str::random(6));
    }
}
