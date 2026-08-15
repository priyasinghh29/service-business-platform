<?php

namespace Database\Seeders;

use App\Models\CalendarEvent;
use App\Models\CalendarIntegration;
use App\Models\User;
use Illuminate\Database\Seeder;

class CalendarDemoSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::query()->where('role', 'customer')->get();

        foreach ($customers as $customer) {
            foreach ([
                ['provider' => 'google', 'name' => 'Google Calendar', 'connected' => true],
                ['provider' => 'outlook', 'name' => 'Outlook Calendar', 'connected' => false],
                ['provider' => 'apple', 'name' => 'Apple Calendar', 'connected' => false],
            ] as $integration) {
                CalendarIntegration::updateOrCreate(
                    ['user_id' => $customer->id, 'provider' => $integration['provider']],
                    $integration
                );
            }

            if (CalendarEvent::where('user_id', $customer->id)->exists()) {
                continue;
            }

            $base = now()->startOfMonth();

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'GST Filing Review',
                'type' => 'meeting',
                'event_date' => now()->toDateString(),
                'event_time' => '14:00',
                'with_name' => 'Arun Kumar',
                'mode' => 'Video Call',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'Trademark Strategy Discussion',
                'type' => 'meeting',
                'event_date' => $base->copy()->day(min(6, $base->daysInMonth))->toDateString(),
                'event_time' => '11:30',
                'with_name' => 'Priya Sharma',
                'mode' => 'Phone Call',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'Audit Closing Meeting',
                'type' => 'meeting',
                'event_date' => $base->copy()->day(min(9, $base->daysInMonth))->toDateString(),
                'event_time' => '16:00',
                'with_name' => 'Sanjay Mehta',
                'mode' => 'In Person',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'GST Return Submission',
                'type' => 'deadline',
                'event_date' => $base->copy()->day(min(28, $base->daysInMonth))->toDateString(),
                'priority' => 'High',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'Audit Document Submission',
                'type' => 'deadline',
                'event_date' => $base->copy()->day(min(25, $base->daysInMonth))->toDateString(),
                'priority' => 'High',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'Trademark Response Filing',
                'type' => 'deadline',
                'event_date' => now()->addMonth()->startOfMonth()->addDays(1)->toDateString(),
                'priority' => 'Medium',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'Payroll Compliance Review',
                'type' => 'deadline',
                'event_date' => $base->copy()->day(min(18, $base->daysInMonth))->toDateString(),
                'priority' => 'Medium',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'Quarterly Business Review',
                'type' => 'rsvp',
                'event_date' => $base->copy()->day(min(15, $base->daysInMonth))->toDateString(),
                'event_time' => '15:00',
                'with_name' => 'Arun Kumar',
                'mode' => 'Video Call',
                'rsvp_status' => 'pending',
            ]);

            CalendarEvent::create([
                'user_id' => $customer->id,
                'title' => 'Tax Planning Workshop',
                'type' => 'rsvp',
                'event_date' => $base->copy()->day(min(20, $base->daysInMonth))->toDateString(),
                'event_time' => '10:00',
                'with_name' => 'Oknitech Advisory',
                'mode' => 'Workshop',
                'rsvp_status' => 'pending',
            ]);
        }
    }
}
