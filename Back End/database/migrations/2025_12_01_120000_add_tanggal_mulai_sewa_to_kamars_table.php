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
            $table->date('tanggal_mulai_sewa')->nullable()->after('tenant_id');
            $table->text('catatan_sewa')->nullable()->after('tanggal_mulai_sewa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kamars', function (Blueprint $table) {
            $table->dropColumn(['tanggal_mulai_sewa', 'catatan_sewa']);
        });
    }
};
