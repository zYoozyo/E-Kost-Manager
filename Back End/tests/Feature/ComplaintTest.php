<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\Kamar;
use App\Models\Kost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ComplaintTest extends TestCase
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
     * Test create complaint memerlukan authentication
     */
    public function test_create_complaint_requires_authentication(): void
    {
        // Act: Kirim request tanpa token
        $response = $this->postJson('/api/tenant/complaints', [
            'title' => 'Test Complaint',
            'description' => 'This is a test complaint',
        ]);

        // Assert: Verifikasi unauthenticated error
        $response->assertStatus(401);
    }

    /**
     * Test create complaint memerlukan role tenant
     */
    public function test_create_complaint_requires_tenant_role(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create complaint
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tenant/complaints', [
                'title' => 'Test Complaint',
                'description' => 'This is a test complaint',
            ]);

        // Assert: Verifikasi unauthorized error
        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat membuat aduan',
            ]);
    }

    /**
     * Test create complaint dengan data valid
     */
    public function test_create_complaint_with_valid_data(): void
    {
        // Arrange: Login sebagai tenant
        $token = $this->getAuthToken($this->tenant);

        // Act: Create complaint
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tenant/complaints', [
                'title' => 'Test Complaint',
                'description' => 'This is a test complaint',
                'priority' => 'high',
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'title',
                    'description',
                    'priority',
                    'status',
                ],
            ]);

        // Verifikasi complaint dibuat di database
        $this->assertDatabaseHas('complaints', [
            'tenant_id' => $this->tenant->id,
            'kost_id' => $this->kost->id,
            'title' => 'Test Complaint',
            'status' => 'pending',
        ]);
    }

    /**
     * Test create complaint memerlukan semua field wajib
     */
    public function test_create_complaint_requires_all_fields(): void
    {
        // Arrange: Login sebagai tenant
        $token = $this->getAuthToken($this->tenant);

        // Act: Create complaint tanpa field wajib
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tenant/complaints', []);

        // Assert: Verifikasi validation errors
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description']);
    }

    /**
     * Test tenant dapat melihat complaints mereka
     */
    public function test_tenant_can_view_their_complaints(): void
    {
        // Arrange: Login sebagai tenant dan buat complaint
        $token = $this->getAuthToken($this->tenant);
        Complaint::create([
            'tenant_id' => $this->tenant->id,
            'kost_id' => $this->kost->id,
            'title' => 'Test Complaint',
            'description' => 'This is a test complaint',
            'priority' => 'medium',
            'status' => 'pending',
        ]);

        // Act: List complaints
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/tenant/complaints');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'description',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * Test admin dapat melihat semua complaints
     */
    public function test_admin_can_view_all_complaints(): void
    {
        // Arrange: Login sebagai admin dan buat complaint
        $token = $this->getAuthToken($this->admin);
        Complaint::create([
            'tenant_id' => $this->tenant->id,
            'kost_id' => $this->kost->id,
            'title' => 'Test Complaint',
            'description' => 'This is a test complaint',
            'priority' => 'medium',
            'status' => 'pending',
        ]);

        // Act: List complaints
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/complaints');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'status',
                    ],
                ],
            ]);
    }

    /**
     * Test update complaint status oleh admin
     */
    public function test_admin_can_update_complaint_status(): void
    {
        // Arrange: Login sebagai admin dan buat complaint
        $token = $this->getAuthToken($this->admin);
        $complaint = Complaint::create([
            'tenant_id' => $this->tenant->id,
            'kost_id' => $this->kost->id,
            'title' => 'Test Complaint',
            'description' => 'This is a test complaint',
            'priority' => 'medium',
            'status' => 'pending',
        ]);

        // Act: Update status
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/admin/complaints/{$complaint->id}/status", [
                'status' => 'resolved',
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        // Verifikasi status terupdate
        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'status' => 'resolved',
        ]);
    }

    /**
     * Test tenant dapat update complaint mereka
     */
    public function test_tenant_can_update_their_complaint(): void
    {
        // Arrange: Login sebagai tenant dan buat complaint
        $token = $this->getAuthToken($this->tenant);
        $complaint = Complaint::create([
            'tenant_id' => $this->tenant->id,
            'kost_id' => $this->kost->id,
            'title' => 'Test Complaint',
            'description' => 'This is a test complaint',
            'priority' => 'medium',
            'status' => 'pending',
        ]);

        // Act: Update complaint
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/tenant/complaints/{$complaint->id}", [
                'title' => 'Updated Complaint',
                'description' => 'Updated description',
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        // Verifikasi complaint terupdate
        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'title' => 'Updated Complaint',
        ]);
    }

    /**
     * Test delete complaint oleh tenant
     */
    public function test_tenant_can_delete_their_complaint(): void
    {
        // Arrange: Login sebagai tenant dan buat complaint
        $token = $this->getAuthToken($this->tenant);
        $complaint = Complaint::create([
            'tenant_id' => $this->tenant->id,
            'kost_id' => $this->kost->id,
            'title' => 'Test Complaint',
            'description' => 'This is a test complaint',
            'priority' => 'medium',
            'status' => 'pending',
        ]);

        // Act: Delete complaint
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/tenant/complaints/{$complaint->id}");

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // Verifikasi complaint terhapus
        $this->assertDatabaseMissing('complaints', [
            'id' => $complaint->id,
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

