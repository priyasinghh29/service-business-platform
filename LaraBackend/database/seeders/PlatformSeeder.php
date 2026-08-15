<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use App\Models\Coupon;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Setting;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['group' => 'branding', 'key' => 'brand_name', 'value' => 'OknitechServe', 'type' => 'string'],
            ['group' => 'branding', 'key' => 'logo_url', 'value' => '', 'type' => 'string'],
            ['group' => 'branding', 'key' => 'primary_color', 'value' => '#0f766e', 'type' => 'string'],
            ['group' => 'branding', 'key' => 'secondary_color', 'value' => '#134e4a', 'type' => 'string'],
            ['group' => 'general', 'key' => 'currency', 'value' => 'USD', 'type' => 'string'],
            ['group' => 'general', 'key' => 'timezone', 'value' => 'UTC', 'type' => 'string'],
            ['group' => 'general', 'key' => 'support_email', 'value' => 'support@oknitechserve.test', 'type' => 'string'],
            ['group' => 'general', 'key' => 'support_phone', 'value' => '+1-000-000-0000', 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting + ['status' => true]);
        }

        foreach ([
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => '<p>Oknitech Serve collects account, booking, and billing information to deliver professional services and operate the client portal.</p><p>We do not sell personal data. Access is limited to authorized staff and processors needed to fulfill your engagements. You may request access or deletion of your account data by contacting support.</p>',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'How Oknitech Serve handles personal and business data.',
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => 'terms-and-conditions',
                'content' => '<p>By using Oknitech Serve you agree to provide accurate information, pay invoices when due, and use the portal only for legitimate business purposes.</p><p>Service deliverables, timelines, and fees are defined in your booking or engagement letter. We may suspend access for unpaid balances or misuse.</p>',
                'meta_title' => 'Terms & Conditions',
                'meta_description' => 'Terms of use for Oknitech Serve services and portal.',
            ],
            [
                'title' => 'FAQ',
                'slug' => 'faq',
                'content' => '<h3>How do I book a service?</h3><p>Browse Services, open a service detail page, and choose Book. You will select a date and time, optionally apply a coupon, then complete checkout.</p><h3>How are invoices paid?</h3><p>Open Invoices in the portal and use Pay Now, or complete payment during booking checkout.</p><h3>Can I reschedule?</h3><p>Yes — open My Services, select the booking, and use Reschedule while the engagement is still active.</p>',
                'meta_title' => 'FAQ',
                'meta_description' => 'Common questions about booking, billing, and the client portal.',
            ],
        ] as $page) {
            CmsPage::updateOrCreate(['slug' => $page['slug']], $page + ['status' => true]);
        }

        Coupon::updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'name' => 'Welcome 10%',
                'type' => 'percent',
                'value' => 10,
                'min_order_amount' => 0,
                'max_discount' => 50,
                'usage_limit' => 1000,
                'status' => true,
            ]
        );

        SubscriptionPlan::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'description' => 'For small service businesses',
                'price' => 29,
                'billing_period' => 'monthly',
                'features' => ['Up to 50 bookings/month', 'Basic reports', 'Email support'],
                'is_featured' => false,
                'status' => true,
            ]
        );

        SubscriptionPlan::updateOrCreate(
            ['slug' => 'growth'],
            [
                'name' => 'Growth',
                'description' => 'For growing teams',
                'price' => 79,
                'billing_period' => 'monthly',
                'features' => ['Unlimited bookings', 'Advanced reports', 'Priority support', 'White-label branding'],
                'is_featured' => true,
                'status' => true,
            ]
        );

        $modules = [
            'dashboard', 'providers', 'customers', 'services', 'categories', 'bookings',
            'quotes', 'invoices', 'payments', 'coupons', 'reviews', 'staff',
            'cms', 'blogs', 'notifications', 'reports', 'settings', 'roles', 'audit',
            'support', 'documents', 'calendar',
        ];

        $permissionIds = [];
        foreach ($modules as $module) {
            foreach (['view', 'create', 'update', 'delete'] as $action) {
                $perm = Permission::updateOrCreate(
                    ['slug' => "{$module}.{$action}"],
                    [
                        'name' => ucfirst($action).' '.ucfirst($module),
                        'module' => $module,
                        'status' => true,
                    ]
                );
                $permissionIds[] = $perm->id;
            }
        }

        $adminRole = Role::updateOrCreate(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Full access',
                'status' => true,
            ]
        );
        $adminRole->permissions()->sync($permissionIds);
    }
}
