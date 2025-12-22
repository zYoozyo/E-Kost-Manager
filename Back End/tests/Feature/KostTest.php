<?php

namespace Tests\Feature;

use App\Models\Kost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class KostTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
    }

    /**
     * Test create kost memerlukan authentication
     */
    public function test_create_kost_requires_authentication(): void
    {
        // Act: Kirim request tanpa token
        $response = $this->postJson('/api/kost', [
            'user_id' => $this->admin->id,
            'nama_kost' => 'Kost Test',
            'alamat_kost' => 'Jl. Test No. 123',
            'jumlah_kamar' => 10,
            'harga' => 500000,
        ]);

        // Assert: Verifikasi unauthenticated error
        $response->assertStatus(401);
    }

    /**
     * Test create kost dengan data valid
     */
    public function test_create_kost_with_valid_data(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create kost
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', [
                'user_id' => $this->admin->id,
                'nama_kost' => 'Kost Test',
                'alamat_kost' => 'Jl. Test No. 123',
                'jumlah_kamar' => 10,
                'harga' => 500000,
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'kost' => [
                    'id',
                    'user_id',
                    'nama_kost',
                    'alamat_kost',
                    'jumlah_kamar',
                    'harga',
                ],
            ]);

        // Verifikasi kost dibuat di database
        $this->assertDatabaseHas('kosts', [
            'user_id' => $this->admin->id,
            'nama_kost' => 'Kost Test',
            'jumlah_kamar' => 10,
        ]);
    }

    /**
     * Test create kost memerlukan semua field wajib
     */
    public function test_create_kost_requires_all_fields(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create kost tanpa field wajib
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', []);

        // Assert: Verifikasi validation errors
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user_id', 'nama_kost', 'alamat_kost', 'jumlah_kamar', 'harga']);
    }

    /**
     * Test create kost dengan user_id yang tidak valid
     */
    public function test_create_kost_with_invalid_user_id(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create kost dengan user_id yang tidak ada
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', [
                'user_id' => 99999,
                'nama_kost' => 'Kost Test',
                'alamat_kost' => 'Jl. Test No. 123',
                'jumlah_kamar' => 10,
                'harga' => 500000,
            ]);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user_id']);
    }

    /**
     * Test create kost dengan jumlah_kamar negatif
     */
    public function test_create_kost_with_negative_jumlah_kamar(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create kost dengan jumlah_kamar negatif
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', [
                'user_id' => $this->admin->id,
                'nama_kost' => 'Kost Test',
                'alamat_kost' => 'Jl. Test No. 123',
                'jumlah_kamar' => -1,
                'harga' => 500000,
            ]);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['jumlah_kamar']);
    }

    /**
     * Test create kost dengan harga negatif
     */
    public function test_create_kost_with_negative_harga(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Create kost dengan harga negatif
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/kost', [
                'user_id' => $this->admin->id,
                'nama_kost' => 'Kost Test',
                'alamat_kost' => 'Jl. Test No. 123',
                'jumlah_kamar' => 10,
                'harga' => -1000,
            ]);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['harga']);
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

