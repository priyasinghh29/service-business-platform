<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::query()->where('slug', 'super-admin')->first();

        Admin::updateOrCreate(
            ['email_id' => 'admin@oknitech.serve'],
            [
                'first_name' => 'Demo',
                'last_name' => 'Admin',
                'phone_number' => '+91 1800 000 0000',
                'password' => Hash::make('Admin@12345'),
                'status' => true,
                'role_id' => $role?->id,
                'email_verified_at' => now(),
            ]
        );
    }
}
