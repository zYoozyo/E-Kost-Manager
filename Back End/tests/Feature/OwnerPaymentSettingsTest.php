<?php

namespace Tests\Feature;

use App\Models\OwnerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OwnerPaymentSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $tenant;

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
    }

    /**
     * Test get payment settings memerlukan authentication
     */
    public function test_get_payment_settings_requires_authentication(): void
    {
        // Act: Kirim request tanpa token
        $response = $this->getJson('/api/admin/payment-settings');

        // Assert: Verifikasi unauthenticated error
        $response->assertStatus(401);
    }

    /**
     * Test get payment settings untuk admin
     */
    public function test_get_payment_settings_for_admin(): void
    {
        // Arrange: Login sebagai admin dan buat payment settings
        $token = $this->getAuthToken($this->admin);
        OwnerProfile::create([
            'user_id' => $this->admin->id,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'John Doe',
        ]);

        // Act: Get payment settings
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/admin/payment-settings');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'bank_name',
                    'bank_account_number',
                    'bank_account_holder',
                ],
            ]);
    }

    /**
     * Test update payment settings dengan data valid
     */
    public function test_update_payment_settings_with_valid_data(): void
    {
        // Arrange: Login sebagai admin
        $token = $this->getAuthToken($this->admin);

        // Act: Update payment settings
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/admin/payment-settings', [
                'bank_name' => 'Mandiri',
                'bank_account_number' => '9876543210',
                'bank_account_holder' => 'Jane Doe',
            ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        // Verifikasi payment settings terupdate
        $this->assertDatabaseHas('owner_profiles', [
            'user_id' => $this->admin->id,
            'bank_name' => 'Mandiri',
            'bank_account_number' => '9876543210',
        ]);
    }

    /**
     * Test tenant dapat melihat payment settings owner
     */
    public function test_tenant_can_view_owner_payment_settings(): void
    {
        // Arrange: Login sebagai tenant dan buat payment settings untuk admin
        $token = $this->getAuthToken($this->tenant);
        OwnerProfile::create([
            'user_id' => $this->admin->id,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'John Doe',
        ]);

        // Act: Get payment settings
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/tenant/payment-settings');

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

