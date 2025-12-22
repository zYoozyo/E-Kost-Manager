<?php

namespace Tests\Feature;

use App\Models\Kamar;
use App\Models\Kost;
use App\Models\Pembayaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PembayaranTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $tenant;
    protected $kost;
    protected $kamar;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $this->tenant = User::factory()->create([
            'email' => 'tenant@example.com',
            'password' => Hash::make('password123'),
            'role' => 'tenant',
        ]);

        $this->kost = Kost::create([
            'user_id' => $this->admin->id,
            'nama_kost' => 'Kost Test',
            'alamat_kost' => 'Jl. Test No. 123',
            'jumlah_kamar' => 10,
            'harga' => 500000,
        ]);

        $this->kamar = Kamar::create([
            'kost_id' => $this->kost->id,
            'tenant_id' => $this->tenant->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'terisi',
        ]);
    }

    /**
     * Test list pembayaran memerlukan authentication
     */
    public function test_list_payments_requires_authentication(): void
    {
        // Act: Kirim request tanpa token
        $response = $this->getJson('/api/payments');

        // Assert: Verifikasi unauthenticated error
        $response->assertStatus(401);
    }

    /**
     * Test admin dapat melihat semua pembayaran
     */
    public function test_admin_can_view_all_payments(): void
    {
        // Arrange: Login sebagai admin dan buat pembayaran
        $token = $this->getAuthToken($this->admin);
        Pembayaran::create([
            'invoice_code' => 'INV-202401-ABC123',
            'owner_id' => $this->admin->id,
            'tenant_id' => $this->tenant->id,
            'kamar_id' => $this->kamar->id,
            'periode_mulai' => now()->startOfMonth(),
            'periode_selesai' => now()->endOfMonth(),
            'due_date' => now()->addDays(7),
            'nominal_tagihan' => 500000,
            'status' => 'pending',
        ]);

        // Act: List pembayaran
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/payments');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'invoice_code',
                            'nominal_tagihan',
                            'status',
                        ],
                    ],
                ],
                'summary',
            ]);
    }

    /**
     * Test tenant dapat melihat pembayaran mereka
     */
    public function test_tenant_can_view_their_payments(): void
    {
        // Arrange: Login sebagai tenant dan buat pembayaran
        $token = $this->getAuthToken($this->tenant);
        Pembayaran::create([
            'invoice_code' => 'INV-202401-ABC123',
            'owner_id' => $this->admin->id,
            'tenant_id' => $this->tenant->id,
            'kamar_id' => $this->kamar->id,
            'periode_mulai' => now()->startOfMonth(),
            'periode_selesai' => now()->endOfMonth(),
            'due_date' => now()->addDays(7),
            'nominal_tagihan' => 500000,
            'status' => 'pending',
        ]);

        // Act: List pembayaran
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/payments');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'invoice_code',
                        'nominal_tagihan',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * Test create pembayaran dengan data valid
     */
    public function test_create_payment_with_valid_data(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create pembayaran
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/payments', [
                'tenant_id' => $this->tenant->id,
                'kamar_id' => $this->kamar->id,
                'periode_mulai' => now()->startOfMonth()->toDateString(),
                'periode_selesai' => now()->endOfMonth()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
                'nominal_tagihan' => 500000,
                'metode_pembayaran' => 'transfer',
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'invoice_code',
                    'nominal_tagihan',
                    'status',
                ],
            ]);

        // Verifikasi pembayaran dibuat di database
        $this->assertDatabaseHas('pembayaran', [
            'tenant_id' => $this->tenant->id,
            'kamar_id' => $this->kamar->id,
            'nominal_tagihan' => 500000,
        ]);
    }

    /**
     * Test generate monthly invoices
     */
    public function test_generate_monthly_invoices(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Generate monthly invoices
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/payments/generate-monthly');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'created',
                ],
            ]);
    }

    /**
     * Test upload payment proof
     */
    public function test_upload_payment_proof(): void
    {
        // Skip test jika GD extension tidak tersedia
        if (!function_exists('imagecreatetruecolor')) {
            $this->markTestSkipped('GD extension is not installed.');
        }

        // Arrange: Login sebagai tenant dan buat pembayaran
        $token = $this->getAuthToken($this->tenant);
        $pembayaran = Pembayaran::create([
            'invoice_code' => 'INV-202401-ABC123',
            'owner_id' => $this->admin->id,
            'tenant_id' => $this->tenant->id,
            'kamar_id' => $this->kamar->id,
            'periode_mulai' => now()->startOfMonth(),
            'periode_selesai' => now()->endOfMonth(),
            'due_date' => now()->addDays(7),
            'nominal_tagihan' => 500000,
            'status' => 'pending',
        ]);

        // Act: Upload proof (simulasi dengan file dummy)
        $file = \Illuminate\Http\UploadedFile::fake()->image('proof.jpg');
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->post("/api/payments/{$pembayaran->id}/proof", [
                'bukti' => $file,
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);
    }

    /**
     * Test view payment history
     */
    public function test_view_payment_history(): void
    {
        // Arrange: Login sebagai tenant dan buat beberapa pembayaran
        $token = $this->getAuthToken($this->tenant);
        Pembayaran::create([
            'invoice_code' => 'INV-202401-ABC123',
            'owner_id' => $this->admin->id,
            'tenant_id' => $this->tenant->id,
            'kamar_id' => $this->kamar->id,
            'periode_mulai' => now()->startOfMonth(),
            'periode_selesai' => now()->endOfMonth(),
            'due_date' => now()->addDays(7),
            'nominal_tagihan' => 500000,
            'status' => 'paid',
        ]);

        // Act: View payment history
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/payments/history');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'invoice_code',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * Helper method untuk mendapatkan auth token
     */
    protected function getAuthToken(User $user): string
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        return $response->json('access_token');
    }
}

