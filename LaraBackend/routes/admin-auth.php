<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\CalendarController;
use App\Http\Controllers\Admin\CalendarEventController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CmsPageController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProviderController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\SubscriptionPlanController;
use App\Http\Controllers\Admin\SupportTicketController;
use App\Http\Middleware\NoCache;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware('guest:admin')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('admin.login');
    Route::post('login', [LoginController::class, 'store']);
});

Route::prefix('admin')->middleware(['auth:admin', NoCache::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('admin.permission:dashboard.view')
        ->name('admin.dashboard');
    Route::post('logout', [LoginController::class, 'destroy'])->name('admin.logout');

    Route::middleware('admin.permission:categories.view')->group(function () {
        Route::get('categories', [CategoryController::class, 'index'])->name('admin.categories.index');
    });
    Route::middleware('admin.permission:categories.create')->group(function () {
        Route::get('categories/create', [CategoryController::class, 'create'])->name('admin.categories.create');
        Route::post('categories', [CategoryController::class, 'store'])->name('admin.categories.store');
    });
    Route::middleware('admin.permission:categories.update')->group(function () {
        Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('admin.categories.edit');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('admin.categories.update');
        Route::patch('categories/{category}', [CategoryController::class, 'update']);
        Route::post('categories/{category}/toggle', [CategoryController::class, 'toggleStatus'])->name('admin.categories.toggle');
        Route::post('categories/bulk', [CategoryController::class, 'bulk'])->name('admin.categories.bulk');
    });
    Route::middleware('admin.permission:categories.delete')->group(function () {
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');
    });

    Route::middleware('admin.permission:services.view')->group(function () {
        Route::get('services', [ServiceController::class, 'index'])->name('admin.services.index');
    });
    Route::middleware('admin.permission:services.create')->group(function () {
        Route::get('services/create', [ServiceController::class, 'create'])->name('admin.services.create');
        Route::post('services', [ServiceController::class, 'store'])->name('admin.services.store');
    });
    Route::middleware('admin.permission:services.update')->group(function () {
        Route::get('services/{service}/edit', [ServiceController::class, 'edit'])->name('admin.services.edit');
        Route::put('services/{service}', [ServiceController::class, 'update'])->name('admin.services.update');
        Route::patch('services/{service}', [ServiceController::class, 'update']);
        Route::post('services/{service}/toggle', [ServiceController::class, 'toggleStatus'])->name('admin.services.toggle');
        Route::post('services/bulk', [ServiceController::class, 'bulk'])->name('admin.services.bulk');
    });
    Route::middleware('admin.permission:services.delete')->group(function () {
        Route::delete('services/{service}', [ServiceController::class, 'destroy'])->name('admin.services.destroy');
    });

    Route::middleware('admin.permission:providers.view')->group(function () {
        Route::get('providers', [ProviderController::class, 'index'])->name('admin.providers.index');
    });
    Route::middleware('admin.permission:providers.create')->group(function () {
        Route::get('providers/create', [ProviderController::class, 'create'])->name('admin.providers.create');
        Route::post('providers', [ProviderController::class, 'store'])->name('admin.providers.store');
    });
    Route::middleware('admin.permission:providers.update')->group(function () {
        Route::get('providers/{provider}/edit', [ProviderController::class, 'edit'])->name('admin.providers.edit');
        Route::put('providers/{provider}', [ProviderController::class, 'update'])->name('admin.providers.update');
        Route::patch('providers/{provider}', [ProviderController::class, 'update']);
        Route::post('providers/{provider}/toggle', [ProviderController::class, 'toggleStatus'])->name('admin.providers.toggle');
        Route::post('providers/bulk', [ProviderController::class, 'bulk'])->name('admin.providers.bulk');
    });
    Route::middleware('admin.permission:providers.delete')->group(function () {
        Route::delete('providers/{provider}', [ProviderController::class, 'destroy'])->name('admin.providers.destroy');
    });

    Route::middleware('admin.permission:customers.view')->group(function () {
        Route::get('customers', [CustomerController::class, 'index'])->name('admin.customers.index');
        Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('admin.customers.show');
    });
    Route::middleware('admin.permission:customers.create')->group(function () {
        Route::get('customers/create', [CustomerController::class, 'create'])->name('admin.customers.create');
        Route::post('customers', [CustomerController::class, 'store'])->name('admin.customers.store');
    });
    Route::middleware('admin.permission:customers.update')->group(function () {
        Route::get('customers/{customer}/edit', [CustomerController::class, 'edit'])->name('admin.customers.edit');
        Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('admin.customers.update');
        Route::patch('customers/{customer}', [CustomerController::class, 'update']);
        Route::post('customers/{customer}/toggle', [CustomerController::class, 'toggleStatus'])->name('admin.customers.toggle');
        Route::post('customers/bulk', [CustomerController::class, 'bulk'])->name('admin.customers.bulk');
    });
    Route::middleware('admin.permission:customers.delete')->group(function () {
        Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('admin.customers.destroy');
    });

    Route::middleware('admin.permission:bookings.view')->group(function () {
        Route::get('bookings', [BookingController::class, 'index'])->name('admin.bookings.index');
        Route::get('bookings/{booking}', [BookingController::class, 'show'])->name('admin.bookings.show');
    });
    Route::middleware('admin.permission:bookings.create')->group(function () {
        Route::get('bookings/create', [BookingController::class, 'create'])->name('admin.bookings.create');
        Route::post('bookings', [BookingController::class, 'store'])->name('admin.bookings.store');
    });
    Route::middleware('admin.permission:bookings.update')->group(function () {
        Route::get('bookings/{booking}/edit', [BookingController::class, 'edit'])->name('admin.bookings.edit');
        Route::put('bookings/{booking}', [BookingController::class, 'update'])->name('admin.bookings.update');
        Route::patch('bookings/{booking}', [BookingController::class, 'update']);
        Route::post('bookings/{booking}/toggle', [BookingController::class, 'toggleStatus'])->name('admin.bookings.toggle');
        Route::post('bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('admin.bookings.status');
        Route::post('bookings/{booking}/reply', [BookingController::class, 'reply'])->name('admin.bookings.reply');
    });
    Route::middleware('admin.permission:bookings.delete')->group(function () {
        Route::delete('bookings/{booking}', [BookingController::class, 'destroy'])->name('admin.bookings.destroy');
    });

    Route::middleware('admin.permission:calendar.view')->group(function () {
        Route::get('calendar', [CalendarController::class, 'index'])->name('admin.calendar.index');
        Route::get('calendar-events', [CalendarEventController::class, 'index'])->name('admin.calendar-events.index');
    });
    Route::middleware('admin.permission:calendar.create')->group(function () {
        Route::get('calendar-events/create', [CalendarEventController::class, 'create'])->name('admin.calendar-events.create');
        Route::post('calendar-events', [CalendarEventController::class, 'store'])->name('admin.calendar-events.store');
    });
    Route::middleware('admin.permission:calendar.update')->group(function () {
        Route::get('calendar-events/{calendar_event}/edit', [CalendarEventController::class, 'edit'])->name('admin.calendar-events.edit');
        Route::put('calendar-events/{calendar_event}', [CalendarEventController::class, 'update'])->name('admin.calendar-events.update');
        Route::patch('calendar-events/{calendar_event}', [CalendarEventController::class, 'update']);
    });
    Route::middleware('admin.permission:calendar.delete')->group(function () {
        Route::delete('calendar-events/{calendar_event}', [CalendarEventController::class, 'destroy'])->name('admin.calendar-events.destroy');
    });

    Route::middleware('admin.permission:support.view')->group(function () {
        Route::get('support-tickets', [SupportTicketController::class, 'index'])->name('admin.support-tickets.index');
        Route::get('support-tickets/{support_ticket}', [SupportTicketController::class, 'show'])->name('admin.support-tickets.show');
    });
    Route::middleware('admin.permission:support.create')->group(function () {
        Route::get('support-tickets/create', [SupportTicketController::class, 'create'])->name('admin.support-tickets.create');
        Route::post('support-tickets', [SupportTicketController::class, 'store'])->name('admin.support-tickets.store');
    });
    Route::middleware('admin.permission:support.update')->group(function () {
        Route::get('support-tickets/{support_ticket}/edit', [SupportTicketController::class, 'edit'])->name('admin.support-tickets.edit');
        Route::put('support-tickets/{support_ticket}', [SupportTicketController::class, 'update'])->name('admin.support-tickets.update');
        Route::patch('support-tickets/{support_ticket}', [SupportTicketController::class, 'update']);
        Route::post('support-tickets/{support_ticket}/reply', [SupportTicketController::class, 'reply'])->name('admin.support-tickets.reply');
    });
    Route::middleware('admin.permission:support.delete')->group(function () {
        Route::delete('support-tickets/{support_ticket}', [SupportTicketController::class, 'destroy'])->name('admin.support-tickets.destroy');
    });

    Route::middleware('admin.permission:documents.view')->group(function () {
        Route::get('documents', [DocumentController::class, 'index'])->name('admin.documents.index');
        Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('admin.documents.download');
    });
    Route::middleware('admin.permission:documents.create')->group(function () {
        Route::get('documents/create', [DocumentController::class, 'create'])->name('admin.documents.create');
        Route::post('documents', [DocumentController::class, 'store'])->name('admin.documents.store');
    });
    Route::middleware('admin.permission:documents.update')->group(function () {
        Route::get('documents/{document}/edit', [DocumentController::class, 'edit'])->name('admin.documents.edit');
        Route::put('documents/{document}', [DocumentController::class, 'update'])->name('admin.documents.update');
        Route::patch('documents/{document}', [DocumentController::class, 'update']);
    });
    Route::middleware('admin.permission:documents.delete')->group(function () {
        Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('admin.documents.destroy');
    });

    Route::middleware('admin.permission:quotes.view')->group(function () {
        Route::get('quotes', [QuoteController::class, 'index'])->name('admin.quotes.index');
    });
    Route::middleware('admin.permission:quotes.create')->group(function () {
        Route::get('quotes/create', [QuoteController::class, 'create'])->name('admin.quotes.create');
        Route::post('quotes', [QuoteController::class, 'store'])->name('admin.quotes.store');
    });
    Route::middleware('admin.permission:quotes.update')->group(function () {
        Route::get('quotes/{quote}/edit', [QuoteController::class, 'edit'])->name('admin.quotes.edit');
        Route::put('quotes/{quote}', [QuoteController::class, 'update'])->name('admin.quotes.update');
        Route::patch('quotes/{quote}', [QuoteController::class, 'update']);
        Route::post('quotes/{quote}/toggle', [QuoteController::class, 'toggleStatus'])->name('admin.quotes.toggle');
        Route::post('quotes/bulk', [QuoteController::class, 'bulk'])->name('admin.quotes.bulk');
    });
    Route::middleware('admin.permission:quotes.delete')->group(function () {
        Route::delete('quotes/{quote}', [QuoteController::class, 'destroy'])->name('admin.quotes.destroy');
    });

    Route::middleware('admin.permission:invoices.view')->group(function () {
        Route::get('invoices', [InvoiceController::class, 'index'])->name('admin.invoices.index');
        Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('admin.invoices.show');
        Route::get('invoices/{invoice}/download', [InvoiceController::class, 'download'])->name('admin.invoices.download');
    });
    Route::middleware('admin.permission:invoices.create')->group(function () {
        Route::get('invoices/create', [InvoiceController::class, 'create'])->name('admin.invoices.create');
        Route::post('invoices', [InvoiceController::class, 'store'])->name('admin.invoices.store');
    });
    Route::middleware('admin.permission:invoices.update')->group(function () {
        Route::get('invoices/{invoice}/edit', [InvoiceController::class, 'edit'])->name('admin.invoices.edit');
        Route::put('invoices/{invoice}', [InvoiceController::class, 'update'])->name('admin.invoices.update');
        Route::patch('invoices/{invoice}', [InvoiceController::class, 'update']);
        Route::post('invoices/{invoice}/toggle', [InvoiceController::class, 'toggleStatus'])->name('admin.invoices.toggle');
        Route::post('invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->name('admin.invoices.mark-paid');
        Route::post('invoices/bulk', [InvoiceController::class, 'bulk'])->name('admin.invoices.bulk');
    });
    Route::middleware('admin.permission:invoices.delete')->group(function () {
        Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('admin.invoices.destroy');
    });

    Route::middleware('admin.permission:payments.view')->group(function () {
        Route::get('payments', [PaymentController::class, 'index'])->name('admin.payments.index');
    });
    Route::middleware('admin.permission:payments.create')->group(function () {
        Route::get('payments/create', [PaymentController::class, 'create'])->name('admin.payments.create');
        Route::post('payments', [PaymentController::class, 'store'])->name('admin.payments.store');
    });
    Route::middleware('admin.permission:payments.update')->group(function () {
        Route::get('payments/{payment}/edit', [PaymentController::class, 'edit'])->name('admin.payments.edit');
        Route::put('payments/{payment}', [PaymentController::class, 'update'])->name('admin.payments.update');
        Route::patch('payments/{payment}', [PaymentController::class, 'update']);
        Route::post('payments/{payment}/toggle', [PaymentController::class, 'toggleStatus'])->name('admin.payments.toggle');
        Route::post('payments/bulk', [PaymentController::class, 'bulk'])->name('admin.payments.bulk');
    });
    Route::middleware('admin.permission:payments.delete')->group(function () {
        Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])->name('admin.payments.destroy');
    });

    Route::middleware('admin.permission:coupons.view')->group(function () {
        Route::get('coupons', [CouponController::class, 'index'])->name('admin.coupons.index');
    });
    Route::middleware('admin.permission:coupons.create')->group(function () {
        Route::get('coupons/create', [CouponController::class, 'create'])->name('admin.coupons.create');
        Route::post('coupons', [CouponController::class, 'store'])->name('admin.coupons.store');
    });
    Route::middleware('admin.permission:coupons.update')->group(function () {
        Route::get('coupons/{coupon}/edit', [CouponController::class, 'edit'])->name('admin.coupons.edit');
        Route::put('coupons/{coupon}', [CouponController::class, 'update'])->name('admin.coupons.update');
        Route::patch('coupons/{coupon}', [CouponController::class, 'update']);
        Route::post('coupons/{coupon}/toggle', [CouponController::class, 'toggleStatus'])->name('admin.coupons.toggle');
    });
    Route::middleware('admin.permission:coupons.delete')->group(function () {
        Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->name('admin.coupons.destroy');
    });

    Route::middleware('admin.permission:reviews.view')->group(function () {
        Route::get('reviews', [ReviewController::class, 'index'])->name('admin.reviews.index');
    });
    Route::middleware('admin.permission:reviews.create')->group(function () {
        Route::get('reviews/create', [ReviewController::class, 'create'])->name('admin.reviews.create');
        Route::post('reviews', [ReviewController::class, 'store'])->name('admin.reviews.store');
    });
    Route::middleware('admin.permission:reviews.update')->group(function () {
        Route::get('reviews/{review}/edit', [ReviewController::class, 'edit'])->name('admin.reviews.edit');
        Route::put('reviews/{review}', [ReviewController::class, 'update'])->name('admin.reviews.update');
        Route::patch('reviews/{review}', [ReviewController::class, 'update']);
        Route::post('reviews/{review}/toggle', [ReviewController::class, 'toggleStatus'])->name('admin.reviews.toggle');
        Route::post('reviews/{review}/approve', [ReviewController::class, 'approve'])->name('admin.reviews.approve');
    });
    Route::middleware('admin.permission:reviews.delete')->group(function () {
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy'])->name('admin.reviews.destroy');
    });

    Route::middleware('admin.permission:staff.view')->group(function () {
        Route::get('staff', [StaffController::class, 'index'])->name('admin.staff.index');
    });
    Route::middleware('admin.permission:staff.create')->group(function () {
        Route::get('staff/create', [StaffController::class, 'create'])->name('admin.staff.create');
        Route::post('staff', [StaffController::class, 'store'])->name('admin.staff.store');
    });
    Route::middleware('admin.permission:staff.update')->group(function () {
        Route::get('staff/{staff}/edit', [StaffController::class, 'edit'])->name('admin.staff.edit');
        Route::put('staff/{staff}', [StaffController::class, 'update'])->name('admin.staff.update');
        Route::patch('staff/{staff}', [StaffController::class, 'update']);
        Route::post('staff/{staff}/toggle', [StaffController::class, 'toggleStatus'])->name('admin.staff.toggle');
    });
    Route::middleware('admin.permission:staff.delete')->group(function () {
        Route::delete('staff/{staff}', [StaffController::class, 'destroy'])->name('admin.staff.destroy');
    });

    Route::middleware('admin.permission:cms.view')->group(function () {
        Route::get('cms-pages', [CmsPageController::class, 'index'])->name('admin.cms-pages.index');
    });
    Route::middleware('admin.permission:cms.create')->group(function () {
        Route::get('cms-pages/create', [CmsPageController::class, 'create'])->name('admin.cms-pages.create');
        Route::post('cms-pages', [CmsPageController::class, 'store'])->name('admin.cms-pages.store');
    });
    Route::middleware('admin.permission:cms.update')->group(function () {
        Route::get('cms-pages/{cms_page}/edit', [CmsPageController::class, 'edit'])->name('admin.cms-pages.edit');
        Route::put('cms-pages/{cms_page}', [CmsPageController::class, 'update'])->name('admin.cms-pages.update');
        Route::patch('cms-pages/{cms_page}', [CmsPageController::class, 'update']);
        Route::post('cms-pages/{cms_page}/toggle', [CmsPageController::class, 'toggleStatus'])->name('admin.cms-pages.toggle');
    });
    Route::middleware('admin.permission:cms.delete')->group(function () {
        Route::delete('cms-pages/{cms_page}', [CmsPageController::class, 'destroy'])->name('admin.cms-pages.destroy');
    });

    Route::middleware('admin.permission:blogs.view')->group(function () {
        Route::get('blogs', [BlogController::class, 'index'])->name('admin.blogs.index');
    });
    Route::middleware('admin.permission:blogs.create')->group(function () {
        Route::get('blogs/create', [BlogController::class, 'create'])->name('admin.blogs.create');
        Route::post('blogs', [BlogController::class, 'store'])->name('admin.blogs.store');
    });
    Route::middleware('admin.permission:blogs.update')->group(function () {
        Route::get('blogs/{blog}/edit', [BlogController::class, 'edit'])->name('admin.blogs.edit');
        Route::put('blogs/{blog}', [BlogController::class, 'update'])->name('admin.blogs.update');
        Route::patch('blogs/{blog}', [BlogController::class, 'update']);
        Route::post('blogs/{blog}/toggle', [BlogController::class, 'toggleStatus'])->name('admin.blogs.toggle');
    });
    Route::middleware('admin.permission:blogs.delete')->group(function () {
        Route::delete('blogs/{blog}', [BlogController::class, 'destroy'])->name('admin.blogs.destroy');
    });

    Route::middleware('admin.permission:notifications.view')->group(function () {
        Route::get('notifications', [NotificationController::class, 'index'])->name('admin.notifications.index');
    });
    Route::middleware('admin.permission:notifications.create')->group(function () {
        Route::get('notifications/create', [NotificationController::class, 'create'])->name('admin.notifications.create');
        Route::post('notifications', [NotificationController::class, 'store'])->name('admin.notifications.store');
    });
    Route::middleware('admin.permission:notifications.update')->group(function () {
        Route::get('notifications/{notification}/edit', [NotificationController::class, 'edit'])->name('admin.notifications.edit');
        Route::put('notifications/{notification}', [NotificationController::class, 'update'])->name('admin.notifications.update');
        Route::patch('notifications/{notification}', [NotificationController::class, 'update']);
        Route::post('notifications/{notification}/toggle', [NotificationController::class, 'toggleStatus'])->name('admin.notifications.toggle');
    });
    Route::middleware('admin.permission:notifications.delete')->group(function () {
        Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('admin.notifications.destroy');
    });

    Route::get('reports', [ReportController::class, 'index'])
        ->middleware('admin.permission:reports.view')
        ->name('admin.reports.index');

    Route::middleware('admin.permission:settings.view')->group(function () {
        Route::get('subscription-plans', [SubscriptionPlanController::class, 'index'])->name('admin.subscription-plans.index');
        Route::get('settings', [SettingController::class, 'index'])->name('admin.settings.index');
    });
    Route::middleware('admin.permission:settings.create')->group(function () {
        Route::get('subscription-plans/create', [SubscriptionPlanController::class, 'create'])->name('admin.subscription-plans.create');
        Route::post('subscription-plans', [SubscriptionPlanController::class, 'store'])->name('admin.subscription-plans.store');
        Route::get('settings/create', [SettingController::class, 'create'])->name('admin.settings.create');
        Route::post('settings', [SettingController::class, 'store'])->name('admin.settings.store');
    });
    Route::middleware('admin.permission:settings.update')->group(function () {
        Route::get('subscription-plans/{subscription_plan}/edit', [SubscriptionPlanController::class, 'edit'])->name('admin.subscription-plans.edit');
        Route::put('subscription-plans/{subscription_plan}', [SubscriptionPlanController::class, 'update'])->name('admin.subscription-plans.update');
        Route::patch('subscription-plans/{subscription_plan}', [SubscriptionPlanController::class, 'update']);
        Route::post('subscription-plans/{subscription_plan}/toggle', [SubscriptionPlanController::class, 'toggleStatus'])->name('admin.subscription-plans.toggle');
        Route::get('settings/{setting}/edit', [SettingController::class, 'edit'])->name('admin.settings.edit');
        Route::put('settings/{setting}', [SettingController::class, 'update'])->name('admin.settings.update');
        Route::patch('settings/{setting}', [SettingController::class, 'update']);
        Route::post('settings/{setting}/toggle', [SettingController::class, 'toggleStatus'])->name('admin.settings.toggle');
        Route::post('settings/bulk-update', [SettingController::class, 'bulkUpdate'])->name('admin.settings.bulk');
    });
    Route::middleware('admin.permission:settings.delete')->group(function () {
        Route::delete('subscription-plans/{subscription_plan}', [SubscriptionPlanController::class, 'destroy'])->name('admin.subscription-plans.destroy');
        Route::delete('settings/{setting}', [SettingController::class, 'destroy'])->name('admin.settings.destroy');
    });

    Route::middleware('admin.permission:roles.view')->group(function () {
        Route::get('roles', [RoleController::class, 'index'])->name('admin.roles.index');
    });
    Route::middleware('admin.permission:roles.create')->group(function () {
        Route::get('roles/create', [RoleController::class, 'create'])->name('admin.roles.create');
        Route::post('roles', [RoleController::class, 'store'])->name('admin.roles.store');
    });
    Route::middleware('admin.permission:roles.update')->group(function () {
        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('admin.roles.edit');
        Route::put('roles/{role}', [RoleController::class, 'update'])->name('admin.roles.update');
        Route::patch('roles/{role}', [RoleController::class, 'update']);
        Route::post('roles/{role}/toggle', [RoleController::class, 'toggleStatus'])->name('admin.roles.toggle');
    });
    Route::middleware('admin.permission:roles.delete')->group(function () {
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
    });

    Route::middleware('admin.permission:audit.view')->group(function () {
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('admin.audit-logs.index');
        Route::get('audit-logs/{audit_log}', [AuditLogController::class, 'show'])->name('admin.audit-logs.show');
    });
});
