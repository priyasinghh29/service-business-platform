<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $wellness = Category::updateOrCreate(
            ['slug' => 'massage-wellness'],
            [
                'name' => 'Massage & Wellness',
                'description' => 'Relaxation and recovery services.',
                'sort_order' => 1,
                'status' => true,
            ]
        );

        $fitness = Category::updateOrCreate(
            ['slug' => 'fitness'],
            [
                'name' => 'Fitness',
                'description' => 'Training and coaching sessions.',
                'sort_order' => 2,
                'status' => true,
            ]
        );

        Service::updateOrCreate(
            ['slug' => '60-min-swedish-massage'],
            [
                'category_id' => $wellness->id,
                'name' => '60-Min Swedish Massage',
                'short_description' => 'Deep relaxation with aromatherapy oil.',
                'description' => 'A full-body Swedish massage designed to reduce tension and improve circulation.',
                'price' => 95,
                'duration_minutes' => 60,
                'is_featured' => true,
                'status' => true,
                'sort_order' => 1,
            ]
        );

        Service::updateOrCreate(
            ['slug' => 'personal-training-session'],
            [
                'category_id' => $fitness->id,
                'name' => 'Personal Training Session',
                'short_description' => 'One-on-one coaching tailored to your goals.',
                'description' => 'A focused training session with warm-up, strength work, and recovery guidance.',
                'price' => 75,
                'duration_minutes' => 45,
                'is_featured' => true,
                'status' => true,
                'sort_order' => 1,
            ]
        );

        $advisory = Category::updateOrCreate(
            ['slug' => 'advisory'],
            [
                'name' => 'Advisory',
                'description' => 'Consultations and discovery sessions.',
                'sort_order' => 3,
                'status' => true,
            ]
        );

        Service::updateOrCreate(
            ['slug' => 'business-consultation'],
            [
                'category_id' => $advisory->id,
                'name' => 'Business Consultation',
                'short_description' => 'Complimentary 30-minute discovery call with our specialists.',
                'description' => 'Discuss your compliance, tax, or legal needs with an Oknitech Serve advisor. We map priorities and recommend the right engagement.',
                'price' => 0,
                'duration_minutes' => 30,
                'is_featured' => true,
                'status' => true,
                'sort_order' => 0,
            ]
        );
    }
}
