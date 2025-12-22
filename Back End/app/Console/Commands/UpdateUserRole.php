<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class UpdateUserRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:update-role {email} {role}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update user role by email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $role = $this->argument('role');

        // Validasi role - hanya admin dan tenant yang diizinkan
        if (!in_array($role, ['admin', 'tenant'])) {
            $this->error('Role harus admin atau tenant!');
            return 1;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User dengan email {$email} tidak ditemukan!");
            return 1;
        }

        // Update role
        $user->role = $role;
        $user->save();

        $this->info("✅ Role user {$email} berhasil diupdate menjadi {$role}");
        $this->info("User: {$user->name} (ID: {$user->id})");

        return 0;
    }
}