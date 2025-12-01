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
        Schema::table('kamars', function (Blueprint $table) {
            $table->integer('durasi_sewa')->default(1)->after('tanggal_mulai_sewa')->comment('Durasi sewa dalam bulan');
            $table->date('tanggal_akhir_sewa')->nullable()->after('durasi_sewa')->comment('Tanggal akhir sewa (auto calculate)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kamars', function (Blueprint $table) {
            $table->dropColumn(['durasi_sewa', 'tanggal_akhir_sewa']);
        });
    }
};
