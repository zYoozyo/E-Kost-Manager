<?php

namespace Tests\Unit;

use App\Models\Kamar;
use App\Models\Kost;
use App\Models\Pembayaran;
use App\Models\User;
use App\Services\PaymentGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentGeneratorTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test generate invoice code
     */
    public function test_generate_invoice_code(): void
    {
        // Act: Generate invoice code
        $code = PaymentGenerator::generateInvoiceCode();

        // Assert: Verifikasi format invoice code
        $this->assertStringStartsWith('INV-', $code);
        $this->assertGreaterThan(10, strlen($code));
    }

    /**
     * Test generate invoice code menghasilkan kode yang berbeda setiap kali
     */
    public function test_generate_invoice_code_is_unique(): void
    {
        // Act: Generate beberapa invoice codes
        $code1 = PaymentGenerator::generateInvoiceCode();
        $code2 = PaymentGenerator::generateInvoiceCode();
        $code3 = PaymentGenerator::generateInvoiceCode();

        // Assert: Verifikasi semua kode berbeda
        $this->assertNotEquals($code1, $code2);
        $this->assertNotEquals($code2, $code3);
        $this->assertNotEquals($code1, $code3);
    }

    /**
     * Test generate monthly invoices untuk kamar yang sudah ada tenant
     */
    public function test_generate_monthly_invoices_for_occupied_rooms(): void
    {
        // Arrange: Buat user, kost, dan kamar dengan tenant
        $owner = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        
        $kost = Kost::create([
            'user_id' => $owner->id,
            'nama_kost' => 'Test Kost',
            'alamat_kost' => 'Jl. Test',
            'jumlah_kamar' => 1,
            'harga' => 500000,
        ]);

        $kamar = Kamar::create([
            'kost_id' => $kost->id,
            'tenant_id' => $tenant->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'terisi',
            'tanggal_mulai_sewa' => now()->startOfMonth(),
            'durasi_sewa' => 1,
        ]);

        // Act: Generate monthly invoices
        $created = PaymentGenerator::generateMonthlyInvoices();

        // Assert: Verifikasi invoice dibuat
        $this->assertGreaterThan(0, $created);
        $this->assertDatabaseHas('pembayaran', [
            'tenant_id' => $tenant->id,
            'kamar_id' => $kamar->id,
            'owner_id' => $owner->id,
        ]);
    }

    /**
     * Test generate monthly invoices tidak membuat duplicate untuk periode yang sama
     */
    public function test_generate_monthly_invoices_does_not_create_duplicates(): void
    {
        // Arrange: Buat user, kost, dan kamar dengan tenant
        $owner = User::factory()->create(['role' => 'admin']);
        $tenant = User::factory()->create(['role' => 'tenant']);
        
        $kost = Kost::create([
            'user_id' => $owner->id,
            'nama_kost' => 'Test Kost',
            'alamat_kost' => 'Jl. Test',
            'jumlah_kamar' => 1,
            'harga' => 500000,
        ]);

        $kamar = Kamar::create([
            'kost_id' => $kost->id,
            'tenant_id' => $tenant->id,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'terisi',
            'tanggal_mulai_sewa' => now()->startOfMonth(),
            'durasi_sewa' => 1,
        ]);

        // Act: Generate invoices dua kali
        $created1 = PaymentGenerator::generateMonthlyInvoices();
        $created2 = PaymentGenerator::generateMonthlyInvoices();

        // Assert: Verifikasi tidak ada duplicate
        $this->assertGreaterThan(0, $created1);
        $this->assertEquals(0, $created2); // Tidak ada invoice baru karena sudah ada

        // Verifikasi hanya ada satu invoice untuk periode ini
        $invoiceCount = Pembayaran::where('kamar_id', $kamar->id)
            ->whereDate('periode_mulai', now()->startOfMonth())
            ->whereDate('periode_selesai', now()->endOfMonth())
            ->count();

        $this->assertEquals(1, $invoiceCount);
    }

    /**
     * Test generate monthly invoices untuk kamar tanpa tenant
     */
    public function test_generate_monthly_invoices_for_unoccupied_rooms(): void
    {
        // Arrange: Buat user, kost, dan kamar tanpa tenant
        $owner = User::factory()->create(['role' => 'admin']);
        
        $kost = Kost::create([
            'user_id' => $owner->id,
            'nama_kost' => 'Test Kost',
            'alamat_kost' => 'Jl. Test',
            'jumlah_kamar' => 1,
            'harga' => 500000,
        ]);

        $kamar = Kamar::create([
            'kost_id' => $kost->id,
            'tenant_id' => null,
            'nomor_kamar' => 'A1',
            'tipe_kamar' => 'Standard',
            'harga_sewa' => 500000,
            'status' => 'tersedia',
        ]);

        // Act: Generate monthly invoices
        $created = PaymentGenerator::generateMonthlyInvoices();

        // Assert: Verifikasi tidak ada invoice dibuat
        $this->assertEquals(0, $created);
        $this->assertDatabaseMissing('pembayaran', [
            'kamar_id' => $kamar->id,
        ]);
    }
}

