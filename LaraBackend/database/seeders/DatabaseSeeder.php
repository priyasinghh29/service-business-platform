<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CatalogSeeder::class,
            PlatformSeeder::class,
            AdminSeeder::class,
            DashboardDemoSeeder::class,
            SupportDemoSeeder::class,
            CalendarDemoSeeder::class,
            NotificationDemoSeeder::class,
        ]);
    }
}
