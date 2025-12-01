<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_code')->unique();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tenant_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('kamar_id')->nullable()->constrained('kamars')->nullOnDelete();

            $table->date('periode_mulai');
            $table->date('periode_selesai');
            $table->date('due_date');

            $table->unsignedBigInteger('nominal_tagihan');
            $table->unsignedBigInteger('nominal_dibayar')->nullable();
            $table->enum('metode_pembayaran', ['transfer', 'tunai', 'qris', 'other'])->default('transfer');
            $table->enum('status', ['pending', 'waiting_verification', 'paid', 'late', 'rejected'])->default('pending')->index();

            $table->string('bukti_pembayaran_path')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
