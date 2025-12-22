<?php

namespace Tests\Feature;

use App\Models\Kamar;
use App\Models\Kost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class KamarTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $tenant;
    protected $kost;

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
    }

    /**
     * Test list kamar milik owner memerlukan authentication
     */
    public function test_owner_rooms_requires_authentication(): void
    {
        // Act: Kirim request tanpa token
        $response = $this->getJson('/api/admin/rooms');

        // Assert: Verifikasi unauthenticated error
        $response->assertStatus(401);
    }

    /**
     * Test list kamar milik owner memerlukan role admin
     */
    public function test_owner_rooms_requires_admin_role(): void
    {
        // Arrange: Login sebagai tenant
        $token = $this->getAuthToken($this->tenant);

        // Act: Akses endpoint admin
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/rooms');

        // Assert: Verifikasi unauthorized error
        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Hanya pemilik kost yang dapat mengakses data ini',
            ]);
    }

    /**
     * Test list kamar milik owner dengan role admin
     */
    public function test_owner_rooms_with_admin_role(): void
    {
        // Arrange: Login sebagai admin dan buat kamar
        $token = $this->getAuthToken($this->admin);
        Kamar::create([
            'kost_id' => $this->kost->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'tersedia',
        ]);

        // Act: List kamar
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/rooms');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'nomor_kamar',
                        'tipe_kamar',
                        'harga_sewa',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * Test create kamar dengan data valid
     */
    public function test_create_kamar_with_valid_data(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create kamar
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/rooms', [
                'kost_id' => $this->kost->id,
                'nomor_kamar' => 'A1',
                'tipe_kamar' => 'Standard',
                'harga_sewa' => 500000,
                'status' => 'tersedia',
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'nomor_kamar',
                    'tipe_kamar',
                    'harga_sewa',
                    'status',
                ],
            ]);

        // Verifikasi kamar dibuat di database
        $this->assertDatabaseHas('kamars', [
            'kost_id' => $this->kost->id,
            'nomor_kamar' => 'A1',
            'status' => 'tersedia',
        ]);
    }

    /**
     * Test create kamar memerlukan semua field wajib
     */
    public function test_create_kamar_requires_all_fields(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create kamar tanpa field wajib
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/admin/rooms', []);

        // Assert: Verifikasi validation errors
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nomor_kamar', 'tipe_kamar', 'harga_sewa']);
    }

    /**
     * Test update kamar dengan data valid
     */
    public function test_update_kamar_with_valid_data(): void
    {
        // Arrange: Login sebagai admin dan buat kamar
        $token = $this->getAuthToken($this->admin);
        $kamar = Kamar::create([
            'kost_id' => $this->kost->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'tersedia',
        ]);

        // Act: Update kamar
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/admin/rooms/{$kamar->id}", [
                'harga_sewa' => 600000,
                'status' => 'terisi',
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        // Verifikasi kamar terupdate di database
        $this->assertDatabaseHas('kamars', [
            'id' => $kamar->id,
            'harga_sewa' => 600000,
            'status' => 'terisi',
        ]);
    }

    /**
     * Test delete kamar
     */
    public function test_delete_kamar(): void
    {
        // Arrange: Login sebagai admin dan buat kamar
        $token = $this->getAuthToken($this->admin);
        $kamar = Kamar::create([
            'kost_id' => $this->kost->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'tersedia',
        ]);

        // Act: Delete kamar
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/admin/rooms/{$kamar->id}");

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // Verifikasi kamar terhapus dari database
        $this->assertDatabaseMissing('kamars', [
            'id' => $kamar->id,
        ]);
    }

    /**
     * Test assign tenant ke kamar
     */
    public function test_assign_tenant_to_kamar(): void
    {
        // Arrange: Login sebagai admin dan buat kamar
        $token = $this->getAuthToken($this->admin);
        $kamar = Kamar::create([
            'kost_id' => $this->kost->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'tersedia',
        ]);

        // Act: Assign tenant
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/admin/rooms/{$kamar->id}/assign-tenant", [
                'tenant_id' => $this->tenant->id,
                'tanggal_mulai_sewa' => now()->toDateString(),
                'durasi_sewa' => 12,
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        // Verifikasi tenant terassign
        $this->assertDatabaseHas('kamars', [
            'id' => $kamar->id,
            'tenant_id' => $this->tenant->id,
            'status' => 'terisi',
        ]);
    }

    /**
     * Test tenant dapat melihat kamar mereka
     */
    public function test_tenant_can_view_their_room(): void
    {
        // Arrange: Login sebagai tenant dan assign kamar
        $tenantToken = $this->getAuthToken($this->tenant);
        $kamar = Kamar::create([
            'kost_id' => $this->kost->id,
            'tenant_id' => $this->tenant->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'terisi',
        ]);

        // Act: View kamar tenant
        $response = $this->withHeader('Authorization', 'Bearer ' . $tenantToken)
            ->getJson('/api/tenant/my-room');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
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

