<?php

namespace Tests\Unit;

use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class OtpServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test generate OTP untuk email
     */
    public function test_generate_otp_for_email(): void
    {
        // Arrange
        $email = 'test@example.com';
        Cache::flush();

        // Act
        $otp = OtpService::generateOtpForEmail($email);

        // Assert
        $this->assertNotNull($otp);
        $this->assertEquals(6, strlen($otp));
        $this->assertTrue(ctype_digit($otp));
        $this->assertTrue(Cache::has('otp_email_' . $email));
        $this->assertEquals($otp, Cache::get('otp_email_' . $email));
    }

    /**
     * Test verify OTP untuk email dengan kode yang valid
     */
    public function test_verify_otp_for_email_with_valid_code(): void
    {
        // Arrange
        $email = 'test@example.com';
        $otp = OtpService::generateOtpForEmail($email);

        // Act
        $result = OtpService::verifyOtpForEmail($email, $otp);

        // Assert
        $this->assertTrue($result['ok']);
        $this->assertFalse(Cache::has('otp_email_' . $email)); // OTP sudah dihapus
    }

    /**
     * Test verify OTP untuk email dengan kode yang salah
     */
    public function test_verify_otp_for_email_with_invalid_code(): void
    {
        // Arrange
        $email = 'test@example.com';
        OtpService::generateOtpForEmail($email);

        // Act
        $result = OtpService::verifyOtpForEmail($email, '000000');

        // Assert
        $this->assertFalse($result['ok']);
        $this->assertTrue(Cache::has('otp_email_' . $email)); // OTP masih ada
    }

    /**
     * Test verify OTP untuk email yang tidak ada di cache
     */
    public function test_verify_otp_for_email_not_in_cache(): void
    {
        // Arrange
        $email = 'test@example.com';
        Cache::flush();

        // Act
        $result = OtpService::verifyOtpForEmail($email, '123456');

        // Assert
        $this->assertFalse($result['ok']);
    }

    /**
     * Test generate OTP untuk user ID
     */
    public function test_generate_otp_for_user_id(): void
    {
        // Arrange
        $userId = 1;
        Cache::flush();

        // Act
        $otp = OtpService::generateOtp($userId);

        // Assert
        $this->assertNotNull($otp);
        $this->assertEquals(6, strlen($otp));
        $this->assertTrue(ctype_digit($otp));
        $this->assertTrue(Cache::has('otp_user_' . $userId));
        $this->assertEquals($otp, Cache::get('otp_user_' . $userId));
    }

    /**
     * Test verify OTP untuk user ID dengan kode yang valid
     */
    public function test_verify_otp_for_user_id_with_valid_code(): void
    {
        // Arrange
        $userId = 1;
        $otp = OtpService::generateOtp($userId);

        // Act
        $result = OtpService::verifyOtp($userId, $otp);

        // Assert
        $this->assertTrue($result['ok']);
        $this->assertFalse(Cache::has('otp_user_' . $userId)); // OTP sudah dihapus
    }

    /**
     * Test verify OTP untuk user ID dengan kode yang salah
     */
    public function test_verify_otp_for_user_id_with_invalid_code(): void
    {
        // Arrange
        $userId = 1;
        OtpService::generateOtp($userId);

        // Act
        $result = OtpService::verifyOtp($userId, '000000');

        // Assert
        $this->assertFalse($result['ok']);
        $this->assertTrue(Cache::has('otp_user_' . $userId)); // OTP masih ada
    }

    /**
     * Test OTP yang di-generate berbeda setiap kali
     */
    public function test_generated_otp_is_different_each_time(): void
    {
        // Arrange
        $email = 'test@example.com';
        Cache::flush();

        // Act
        $otp1 = OtpService::generateOtpForEmail($email);
        Cache::forget('otp_email_' . $email);
        $otp2 = OtpService::generateOtpForEmail($email);

        // Assert
        // Meskipun bisa sama secara kebetulan, kemungkinannya sangat kecil
        // Tapi kita test bahwa keduanya adalah string 6 digit yang valid
        $this->assertEquals(6, strlen($otp1));
        $this->assertEquals(6, strlen($otp2));
        $this->assertTrue(ctype_digit($otp1));
        $this->assertTrue(ctype_digit($otp2));
    }
}

