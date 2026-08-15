<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Document;
use App\Models\Invoice;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(
            ['key' => 'rm_name'],
            ['group' => 'portal', 'value' => 'Arun Kumar', 'type' => 'string', 'status' => true]
        );
        Setting::updateOrCreate(
            ['key' => 'rm_role'],
            ['group' => 'portal', 'value' => 'Senior Account Specialist', 'type' => 'string', 'status' => true]
        );
        Setting::updateOrCreate(
            ['key' => 'rm_email'],
            ['group' => 'portal', 'value' => 'arun.k@oknitech.serve', 'type' => 'string', 'status' => true]
        );
        Setting::updateOrCreate(
            ['key' => 'rm_phone'],
            ['group' => 'portal', 'value' => '+91 98765 43210', 'type' => 'string', 'status' => true]
        );

        $tax = Category::updateOrCreate(
            ['slug' => 'tax-compliance'],
            [
                'name' => 'Tax & Compliance',
                'description' => 'GST, income tax, and regulatory filings.',
                'sort_order' => 1,
                'status' => true,
            ]
        );

        $legal = Category::updateOrCreate(
            ['slug' => 'legal-ip'],
            [
                'name' => 'Legal & IP',
                'description' => 'Trademark and legal advisory.',
                'sort_order' => 2,
                'status' => true,
            ]
        );

        $gst = Service::updateOrCreate(
            ['slug' => 'gst-registration'],
            [
                'category_id' => $tax->id,
                'name' => 'GST Registration',
                'short_description' => 'Complete GST identity setup.',
                'description' => 'End-to-end GST registration with document support.',
                'price' => 18450,
                'duration_minutes' => 60,
                'is_featured' => true,
                'status' => true,
                'sort_order' => 1,
            ]
        );

        $trademark = Service::updateOrCreate(
            ['slug' => 'trademark-filing'],
            [
                'category_id' => $legal->id,
                'name' => 'Trademark Filing',
                'short_description' => 'Brand trademark protection.',
                'description' => 'Trademark search, filing, and follow-up.',
                'price' => 9500,
                'duration_minutes' => 45,
                'is_featured' => true,
                'status' => true,
                'sort_order' => 2,
            ]
        );

        $audit = Service::updateOrCreate(
            ['slug' => 'statutory-audit'],
            [
                'category_id' => $tax->id,
                'name' => 'Statutory Audit',
                'short_description' => 'Annual statutory audit support.',
                'description' => 'Audit preparation and compliance review.',
                'price' => 45000,
                'duration_minutes' => 90,
                'is_featured' => false,
                'status' => true,
                'sort_order' => 3,
            ]
        );

        $providerUser = User::updateOrCreate(
            ['email_id' => 'arun.k@oknitech.serve'],
            [
                'first_name' => 'Arun',
                'last_name' => 'Kumar',
                'phone_number' => '+91 98765 43210',
                'password' => Hash::make('Password123!'),
                'role' => 'provider',
                'status' => true,
            ]
        );

        $provider = ServiceProvider::updateOrCreate(
            ['user_id' => $providerUser->id],
            [
                'business_name' => 'Oknitech Advisory',
                'bio' => 'Senior compliance specialist.',
                'specialization' => 'Tax & Compliance',
                'hourly_rate' => 1500,
                'is_verified' => true,
                'status' => true,
            ]
        );

        // Seed for all existing customers so any logged-in user sees live data.
        $customers = User::query()->where('role', 'customer')->get();

        if ($customers->isEmpty()) {
            $customers = collect([
                User::updateOrCreate(
                    ['email_id' => 'demo@oknitech.serve'],
                    [
                        'first_name' => 'Demo',
                        'last_name' => 'Client',
                        'phone_number' => '+91 90000 00000',
                        'password' => Hash::make('Password123!'),
                        'role' => 'customer',
                        'status' => true,
                    ]
                ),
            ]);
        }

        foreach ($customers as $customer) {
            $this->seedForCustomer($customer, $provider, $gst, $trademark, $audit);
            $this->seedBillingForCustomer($customer, $gst);
        }
    }

    private function seedBillingForCustomer(User $customer, Service $gst): void
    {
        if (! \App\Models\PaymentMethod::where('user_id', $customer->id)->exists()) {
            \App\Models\PaymentMethod::create([
                'user_id' => $customer->id,
                'label' => 'HDFC Bank Credit Card',
                'detail' => '•••• •••• •••• 4821',
                'type' => 'card',
                'is_primary' => true,
                'status' => true,
            ]);
            \App\Models\PaymentMethod::create([
                'user_id' => $customer->id,
                'label' => 'ICICI Bank Account',
                'detail' => 'A/C •••• 6790',
                'type' => 'bank',
                'is_primary' => false,
                'status' => true,
            ]);
        }

        if (! \App\Models\Subscription::where('user_id', $customer->id)->exists()) {
            \App\Models\Subscription::create([
                'user_id' => $customer->id,
                'name' => 'Compliance Retainer — Standard',
                'cadence' => 'Monthly',
                'amount' => 6000,
                'status' => 'active',
                'renews_at' => now()->addMonth()->startOfMonth(),
            ]);
            \App\Models\Subscription::create([
                'user_id' => $customer->id,
                'name' => 'Virtual CFO Advisory',
                'cadence' => 'Quarterly',
                'amount' => 25000,
                'status' => 'active',
                'renews_at' => now()->addMonths(2),
            ]);
        }

        if (! \App\Models\Quote::where('user_id', $customer->id)->exists()) {
            \App\Models\Quote::create([
                'user_id' => $customer->id,
                'service_id' => $gst->id,
                'customer_name' => trim($customer->first_name.' '.($customer->last_name ?? '')),
                'customer_email' => $customer->email_id,
                'customer_phone' => $customer->phone_number,
                'message' => 'Trademark Renewal — Class 35 & 42',
                'estimated_amount' => 15000,
                'status' => 'sent',
                'valid_until' => now()->addDays(20),
            ]);
            \App\Models\Quote::create([
                'user_id' => $customer->id,
                'customer_name' => trim($customer->first_name.' '.($customer->last_name ?? '')),
                'customer_email' => $customer->email_id,
                'message' => 'International Tax Advisory',
                'estimated_amount' => 60000,
                'status' => 'pending',
                'valid_until' => now()->addDays(30),
            ]);
        }

        if (! Document::where('user_id', $customer->id)->where('name', 'like', 'Form 16A%')->exists()) {
            Document::create([
                'user_id' => $customer->id,
                'name' => 'Form 16A — Q2 FY26-27',
                'folder' => 'Tax & Compliance',
                'file_type' => 'pdf',
                'file_size' => 320000,
                'uploaded_by' => 'System',
                'status' => 'available',
            ]);
            Document::create([
                'user_id' => $customer->id,
                'name' => 'TDS Certificate — Sep 2026',
                'folder' => 'Tax & Compliance',
                'file_type' => 'pdf',
                'file_size' => 280000,
                'uploaded_by' => 'System',
                'status' => 'available',
            ]);
        }
    }

    private function seedForCustomer(User $customer, ServiceProvider $provider, Service $gst, Service $trademark, Service $audit): void
    {
        if (Booking::where('user_id', $customer->id)->exists()) {
            return;
        }

        $bookingGst = Booking::create([
            'user_id' => $customer->id,
            'service_id' => $gst->id,
            'provider_id' => $provider->id,
            'booking_date' => now()->addDays(5)->toDateString(),
            'booking_time' => '14:00:00',
            'duration_minutes' => 60,
            'package_name' => 'Professional',
            'subtotal' => 18450,
            'discount' => 0,
            'tax' => 0,
            'total' => 18450,
            'status' => 'confirmed',
            'payment_status' => 'unpaid',
            'customer_notes' => 'Priority GST registration.',
        ]);

        $bookingTm = Booking::create([
            'user_id' => $customer->id,
            'service_id' => $trademark->id,
            'provider_id' => $provider->id,
            'booking_date' => now()->addDays(12)->toDateString(),
            'booking_time' => '11:00:00',
            'duration_minutes' => 45,
            'package_name' => 'Standard',
            'subtotal' => 9500,
            'discount' => 0,
            'tax' => 0,
            'total' => 9500,
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        Booking::create([
            'user_id' => $customer->id,
            'service_id' => $audit->id,
            'provider_id' => $provider->id,
            'booking_date' => now()->subDays(10)->toDateString(),
            'booking_time' => '10:00:00',
            'duration_minutes' => 90,
            'package_name' => 'Enterprise',
            'subtotal' => 45000,
            'discount' => 0,
            'tax' => 0,
            'total' => 45000,
            'status' => 'completed',
            'payment_status' => 'paid',
        ]);

        Invoice::create([
            'booking_id' => $bookingGst->id,
            'user_id' => $customer->id,
            'subtotal' => 18450,
            'discount' => 0,
            'tax' => 0,
            'total' => 18450,
            'status' => 'sent',
            'issued_at' => now()->subDays(3),
            'due_at' => now()->addDays(5),
        ]);

        Invoice::create([
            'booking_id' => $bookingTm->id,
            'user_id' => $customer->id,
            'subtotal' => 9500,
            'discount' => 0,
            'tax' => 0,
            'total' => 9500,
            'status' => 'overdue',
            'issued_at' => now()->subDays(20),
            'due_at' => now()->subDays(5),
        ]);

        Invoice::create([
            'user_id' => $customer->id,
            'subtotal' => 45000,
            'discount' => 0,
            'tax' => 0,
            'total' => 45000,
            'status' => 'paid',
            'issued_at' => now()->subDays(30),
            'due_at' => now()->subDays(15),
            'paid_at' => now()->subDays(14),
        ]);

        Document::create([
            'user_id' => $customer->id,
            'booking_id' => $bookingGst->id,
            'name' => 'GST_Reg_Certificate.pdf',
            'folder' => 'Tax & Compliance',
            'file_type' => 'pdf',
            'file_size' => 2457600,
            'uploaded_by' => 'Arun Kumar',
            'status' => 'available',
        ]);

        Document::create([
            'user_id' => $customer->id,
            'name' => 'Audit_Report_Draft.docx',
            'folder' => 'Audit & Assurance',
            'file_type' => 'doc',
            'file_size' => 540000,
            'uploaded_by' => 'System',
            'status' => 'available',
        ]);

        Document::create([
            'user_id' => $customer->id,
            'booking_id' => $bookingGst->id,
            'name' => 'Bank Statement (Last 6 months)',
            'folder' => 'KYC Documents',
            'file_type' => 'pdf',
            'uploaded_by' => 'Arun Kumar',
            'status' => 'requested',
            'due_at' => now()->addDays(3),
        ]);

        Document::create([
            'user_id' => $customer->id,
            'name' => 'Directors KYC (Updated)',
            'folder' => 'KYC Documents',
            'file_type' => 'pdf',
            'uploaded_by' => 'Arun Kumar',
            'status' => 'requested',
            'due_at' => now()->addDays(5),
        ]);

        \App\Models\BookingMessage::create([
            'booking_id' => $bookingGst->id,
            'user_id' => $provider->user_id,
            'author_name' => 'Arun Kumar',
            'role' => 'Manager',
            'message' => "We've started your GST registration. Please upload the pending bank statement so we can proceed with filing.",
        ]);
    }
}
