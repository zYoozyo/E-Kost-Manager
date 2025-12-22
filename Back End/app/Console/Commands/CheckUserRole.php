<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUserRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:user-role {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check user role by email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if ($user) {
            $this->info('User found:');
            $this->info('Email: ' . $user->email);
            $this->info('Role: ' . $user->role);
            $this->info('Name: ' . $user->name);
            $this->info('ID: ' . $user->id);
        } else {
            $this->error('User not found');
        }
    }
}