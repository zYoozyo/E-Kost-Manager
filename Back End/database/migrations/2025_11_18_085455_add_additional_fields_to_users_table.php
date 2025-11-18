<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ubah name jadi NOT NULL
            $table->string('name')->nullable(false)->change();

            // Tambah kolom baru untuk owner
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('whatsapp')->nullable()->after('phone');
            $table->text('address')->nullable()->after('whatsapp');

            // Ubah default role
            $table->string('role')->default('tenant')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'phone',
                'whatsapp',
                'address',
            ]);

            $table->string('name')->nullable()->change();
            $table->string('role')->default('penyewa')->change();
        });
    }
};
