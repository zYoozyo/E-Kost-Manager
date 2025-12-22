<?php

namespace Tests\Feature;

use App\Models\Testimoni;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestimoniTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test list testimoni (public endpoint)
     */
    public function test_list_testimonis(): void
    {
        // Arrange: Buat beberapa testimoni
        Testimoni::create([
            'nama' => 'John Doe',
            'email' => 'john@example.com',
            'pesan' => 'Kost ini sangat nyaman dan harganya terjangkau.',
        ]);

        Testimoni::create([
            'nama' => 'Jane Doe',
            'email' => 'jane@example.com',
            'pesan' => 'Pelayanan sangat baik dan lokasi strategis.',
        ]);

        // Act: List testimoni
        $response = $this->getJson('/api/testimoni');

        // Assert: Verifikasi response
        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'nama',
                    'email',
                    'pesan',
                ],
            ]);
    }

    /**
     * Test create testimoni dengan data valid
     */
    public function test_create_testimoni_with_valid_data(): void
    {
        // Act: Create testimoni
        $response = $this->postJson('/api/testimoni', [
            'nama' => 'John Doe',
            'email' => 'john@example.com',
            'pesan' => 'Kost ini sangat nyaman dan harganya terjangkau.',
        ]);

        // Assert: Verifikasi response
        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'nama',
                'email',
                'pesan',
            ]);

        // Verifikasi testimoni dibuat di database
        $this->assertDatabaseHas('testimonis', [
            'nama' => 'John Doe',
            'email' => 'john@example.com',
        ]);
    }

    /**
     * Test create testimoni memerlukan semua field wajib
     */
    public function test_create_testimoni_requires_all_fields(): void
    {
        // Act: Create testimoni tanpa field wajib
        $response = $this->postJson('/api/testimoni', []);

        // Assert: Verifikasi validation errors
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nama', 'email', 'pesan']);
    }

    /**
     * Test create testimoni dengan email format tidak valid
     */
    public function test_create_testimoni_with_invalid_email_format(): void
    {
        // Act: Create testimoni dengan email format salah
        $response = $this->postJson('/api/testimoni', [
            'nama' => 'John Doe',
            'email' => 'not-an-email',
            'pesan' => 'Test message',
        ]);

        // Assert: Verifikasi validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}

