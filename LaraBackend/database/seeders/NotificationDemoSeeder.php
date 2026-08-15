<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationDemoSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::query()->where('role', 'customer')->get();

        foreach ($customers as $customer) {
            if (Notification::where('user_id', $customer->id)->exists()) {
                continue;
            }

            $items = [
                [
                    'type' => 'Service',
                    'title' => 'GST Registration moved to Submission stage',
                    'message' => 'Arun Kumar advanced your GST Annual Registration to the Submission stage.',
                    'link' => '/my-services',
                    'action_label' => 'View Service',
                    'action_required' => true,
                    'priority' => 'High',
                    'read' => false,
                    'created_at' => now()->setTime(10, 24),
                ],
                [
                    'type' => 'Invoice',
                    'title' => 'Invoice is due soon',
                    'message' => 'Your outstanding invoice needs attention. Pay before the due date to avoid delays.',
                    'link' => '/invoices',
                    'action_label' => 'Pay Now',
                    'action_required' => true,
                    'priority' => 'High',
                    'read' => false,
                    'created_at' => now()->setTime(9, 2),
                ],
                [
                    'type' => 'Document',
                    'title' => 'New document requested',
                    'message' => 'Your relationship manager requested a bank statement for the ongoing audit.',
                    'link' => '/documents',
                    'action_label' => 'Upload',
                    'action_required' => true,
                    'priority' => 'Medium',
                    'read' => false,
                    'created_at' => now()->setTime(8, 15),
                ],
                [
                    'type' => 'Meeting',
                    'title' => 'Meeting reminder: GST Filing Review',
                    'message' => 'Your meeting with Arun Kumar starts at 2:00 PM today.',
                    'link' => '/calendar',
                    'action_label' => 'View Calendar',
                    'action_required' => false,
                    'priority' => 'Medium',
                    'read' => true,
                    'created_at' => now()->setTime(7, 30),
                ],
                [
                    'type' => 'Service',
                    'title' => 'Trademark filing under review',
                    'message' => 'Priya Sharma is reviewing your trademark application.',
                    'link' => '/my-services',
                    'action_label' => 'View Service',
                    'action_required' => false,
                    'priority' => 'Medium',
                    'read' => true,
                    'created_at' => now()->subDay()->setTime(16, 10),
                ],
                [
                    'type' => 'Invoice',
                    'title' => 'Payment received',
                    'message' => 'We received your recent invoice payment. Thank you.',
                    'link' => '/invoices',
                    'action_label' => 'View Invoice',
                    'action_required' => false,
                    'priority' => 'Low',
                    'read' => true,
                    'created_at' => now()->subDay()->setTime(11, 40),
                ],
                [
                    'type' => 'Document',
                    'title' => 'Audit documents uploaded',
                    'message' => 'New documents were added to your Audit & Assurance folder.',
                    'link' => '/documents',
                    'action_label' => 'View Documents',
                    'action_required' => false,
                    'priority' => 'Low',
                    'read' => true,
                    'created_at' => now()->subDays(3)->setTime(14, 0),
                ],
                [
                    'type' => 'System',
                    'title' => 'Password changed successfully',
                    'message' => 'Your account password was updated recently. If this wasn’t you, contact support.',
                    'link' => '/settings',
                    'action_label' => 'Review Settings',
                    'action_required' => false,
                    'priority' => 'Low',
                    'read' => true,
                    'created_at' => now()->subDays(5)->setTime(9, 0),
                ],
            ];

            foreach ($items as $item) {
                $createdAt = $item['created_at'];
                unset($item['created_at']);

                $notification = Notification::create(array_merge($item, [
                    'user_id' => $customer->id,
                ]));

                $notification->forceFill([
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ])->save();
            }
        }
    }
}
