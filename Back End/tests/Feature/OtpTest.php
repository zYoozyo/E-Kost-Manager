<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class OtpTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test request OTP dengan email valid
     */
    public function test_request_otp_with_valid_email(): void
    {
        // Act: Kirim request OTP
        $response = $this->postJson('/api/otp/request', [
            'email' => 'test@example.com',
        ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'email',
            ])
            ->assertJson([
                'success' => true,
            ]);

        // Verifikasi OTP tersimpan di cache (hanya di testing/local)
        // Di production, OTP tidak dikembalikan di response
        if (app()->environment('local', 'testing')) {
            $this->assertArrayHasKey('otp', $response->json());
        }
        
        // Verifikasi OTP tersimpan di cache
        $this->assertTrue(Cache::has('otp_email_test@example.com'));
    }

    /**
     * Test request OTP memerlukan email
     */
    public function test_request_otp_requires_email(): void
    {
        // Act: Kirim request tanpa email
        $response = $this->postJson('/api/otp/request', []);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test request OTP dengan email format tidak valid
     */
    public function test_request_otp_with_invalid_email_format(): void
    {
        // Act: Kirim request dengan email format salah
        $response = $this->postJson('/api/otp/request', [
            'email' => 'not-an-email',
        ]);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test verify OTP dengan kode yang valid
     */
    public function test_verify_otp_with_valid_code(): void
    {
        // Arrange: Generate OTP terlebih dahulu
        $email = 'test@example.com';
        $otpResponse = $this->postJson('/api/otp/request', [
            'email' => $email,
        ]);

        // Get OTP from cache (karena di response hanya ada di testing/local)
        $otp = Cache::get('otp_email_' . $email);
        $this->assertNotNull($otp, 'OTP harus ada di cache');

        // Act: Verifikasi OTP
        $response = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $otp,
        ]);

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'OTP valid. Silakan lanjutkan registrasi.',
            ]);

        // Verifikasi OTP sudah dihapus dari cache
        $this->assertFalse(Cache::has('otp_email_' . $email));
    }

    /**
     * Test verify OTP dengan kode yang salah
     */
    public function test_verify_otp_with_invalid_code(): void
    {
        // Arrange: Generate OTP terlebih dahulu
        $email = 'test@example.com';
        $this->postJson('/api/otp/request', [
            'email' => $email,
        ]);

        // Act: Verifikasi dengan OTP yang salah
        $response = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => '000000',
        ]);

        // Assert: Verifikasi error response
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'OTP tidak valid atau sudah kadaluarsa.',
            ]);
    }

    /**
     * Test verify OTP dengan kode yang sudah kadaluarsa
     */
    public function test_verify_otp_with_expired_code(): void
    {
        // Arrange: Generate OTP dan hapus dari cache (simulasi expired)
        $email = 'test@example.com';
        $this->postJson('/api/otp/request', [
            'email' => $email,
        ]);

        // Get OTP from cache before deleting
        $otp = Cache::get('otp_email_' . $email);
        $this->assertNotNull($otp, 'OTP harus ada di cache');
        Cache::forget('otp_email_' . $email);

        // Act: Verifikasi OTP yang sudah expired
        $response = $this->postJson('/api/otp/verify', [
            'email' => $email,
            'otp' => $otp,
        ]);

        // Assert: Verifikasi error response
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'OTP tidak valid atau sudah kadaluarsa.',
            ]);
    }

    /**
     * Test verify OTP memerlukan email dan OTP
     */
    public function test_verify_otp_requires_email_and_otp(): void
    {
        // Act: Kirim request tanpa email
        $response = $this->postJson('/api/otp/verify', [
            'otp' => '123456',
        ]);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Act: Kirim request tanpa OTP
        $response = $this->postJson('/api/otp/verify', [
            'email' => 'test@example.com',
        ]);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['otp']);
    }
}

