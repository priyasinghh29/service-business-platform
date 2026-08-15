<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\SupportArticle;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use Illuminate\Database\Seeder;

class SupportDemoSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(
            ['key' => 'support_hours'],
            ['group' => 'support', 'value' => 'Mon–Sat, 9:30 AM – 6:30 PM IST', 'type' => 'string', 'status' => true]
        );
        Setting::updateOrCreate(
            ['key' => 'support_email'],
            ['group' => 'support', 'value' => 'support@oknitech.serve', 'type' => 'string', 'status' => true]
        );
        Setting::updateOrCreate(
            ['key' => 'support_phone'],
            ['group' => 'support', 'value' => '+91 1800 123 4567', 'type' => 'string', 'status' => true]
        );
        Setting::updateOrCreate(
            ['key' => 'support_maintenance_enabled'],
            ['group' => 'support', 'value' => 'false', 'type' => 'boolean', 'status' => true]
        );

        $articles = [
            [
                'title' => 'How GST Registration Works',
                'slug' => 'how-gst-registration-works',
                'category' => 'Tax & Compliance',
                'content' => 'GST registration typically takes 3–5 working days after documents are verified. Track progress under My Services.',
                'reads' => 1200,
                'is_faq' => false,
                'sort_order' => 1,
            ],
            [
                'title' => 'Trademark Filing Timeline Explained',
                'slug' => 'trademark-filing-timeline',
                'category' => 'Intellectual Property',
                'content' => 'Trademark filing includes search, application, and examination stages. Expect updates in your service workspace.',
                'reads' => 860,
                'is_faq' => false,
                'sort_order' => 2,
            ],
            [
                'title' => 'Understanding Your Invoice',
                'slug' => 'understanding-your-invoice',
                'category' => 'Billing',
                'content' => 'Invoices list service charges, tax, and due dates. Pay outstanding invoices from the Invoices page.',
                'reads' => 540,
                'is_faq' => false,
                'sort_order' => 3,
            ],
            [
                'title' => 'Preparing for a Statutory Audit',
                'slug' => 'preparing-for-statutory-audit',
                'category' => 'Audit & Assurance',
                'content' => 'Keep bank statements, ledgers, and statutory registers ready. Upload requested docs in Document Vault.',
                'reads' => 710,
                'is_faq' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($articles as $article) {
            SupportArticle::updateOrCreate(['slug' => $article['slug']], $article + ['status' => true]);
        }

        $faqs = [
            [
                'title' => 'How do I upload documents for my ongoing service?',
                'slug' => 'faq-upload-documents',
                'faq_answer' => 'Go to My Services, open the relevant service card, and use Document Manager — or upload from Document Vault and link the booking.',
            ],
            [
                'title' => 'When will my GST registration be completed?',
                'slug' => 'faq-gst-completion',
                'faq_answer' => 'Timelines depend on document completeness and government processing. Check progress and due dates in My Services.',
            ],
            [
                'title' => 'How can I pay an outstanding invoice?',
                'slug' => 'faq-pay-invoice',
                'faq_answer' => 'Open Invoices & Billing and click Pay Now on the outstanding invoice, or use Make Payment from the top actions.',
            ],
            [
                'title' => 'Can I reschedule a meeting with my relationship manager?',
                'slug' => 'faq-reschedule-meeting',
                'faq_answer' => 'Yes, open the service workspace and use Reschedule, or create a support ticket / message your RM from Support Centre.',
            ],
        ];

        foreach ($faqs as $i => $faq) {
            SupportArticle::updateOrCreate(
                ['slug' => $faq['slug']],
                [
                    'title' => $faq['title'],
                    'category' => 'FAQ',
                    'content' => $faq['faq_answer'],
                    'faq_answer' => $faq['faq_answer'],
                    'is_faq' => true,
                    'reads' => 100 + $i * 20,
                    'status' => true,
                    'sort_order' => $i + 1,
                ]
            );
        }

        $customers = User::query()->where('role', 'customer')->get();
        foreach ($customers as $customer) {
            if (SupportTicket::where('user_id', $customer->id)->exists()) {
                continue;
            }

            $t1 = SupportTicket::create([
                'user_id' => $customer->id,
                'subject' => 'Clarification on GST late fee',
                'category' => 'Tax & Compliance',
                'priority' => 'Medium',
                'status' => 'In Progress',
                'description' => 'Need clarity on whether late fee applies for the previous return period.',
                'first_responded_at' => now()->subHours(3),
            ]);
            SupportTicketMessage::create([
                'support_ticket_id' => $t1->id,
                'user_id' => $customer->id,
                'author_name' => $customer->first_name,
                'role' => 'Client',
                'message' => $t1->description,
            ]);
            SupportTicketMessage::create([
                'support_ticket_id' => $t1->id,
                'author_name' => 'Support Desk',
                'role' => 'Support',
                'message' => 'We are checking with your compliance manager and will update you shortly.',
            ]);

            SupportTicket::create([
                'user_id' => $customer->id,
                'subject' => 'Need duplicate audit report copy',
                'category' => 'Audit & Assurance',
                'priority' => 'Low',
                'status' => 'Waiting on You',
                'description' => 'Please share the signed audit report PDF again.',
                'first_responded_at' => now()->subDay(),
            ]);

            SupportTicket::create([
                'user_id' => $customer->id,
                'subject' => 'Invoice mismatch for recent billing',
                'category' => 'Billing',
                'priority' => 'High',
                'status' => 'Open',
                'description' => 'The invoice amount does not match the quoted package.',
            ]);
        }
    }
}
