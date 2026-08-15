<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CmsController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MyServicesController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProviderController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/featured', [ServiceController::class, 'featured']);
Route::get('/services/search', [ServiceController::class, 'search']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);
Route::get('/services/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/providers', [ProviderController::class, 'index']);

Route::get('/pages/{slug}', [CmsController::class, 'page']);
Route::get('/branding', [CmsController::class, 'branding']);
Route::get('/subscription-plans', [CmsController::class, 'plans']);
Route::post('/coupons/validate', [CmsController::class, 'validateCoupon']);
Route::get('/documents/shared/{token}', [DocumentController::class, 'sharedDownload']);

/*
|--------------------------------------------------------------------------
| Protected API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/me', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/password', [AuthController::class, 'changePassword']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/my-services', [MyServicesController::class, 'index']);
    Route::get('/my-services/{id}', [MyServicesController::class, 'show']);
    Route::post('/my-services/{id}/messages', [MyServicesController::class, 'storeMessage']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{id}/reschedule', [BookingController::class, 'reschedule']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/reviews/mine', [ReviewController::class, 'mine']);

    Route::get('/invoices/vault', [InvoiceController::class, 'vault']);
    Route::get('/invoices/statement', [InvoiceController::class, 'statement']);
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/payment-methods', [InvoiceController::class, 'storePaymentMethod']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::post('/invoices/{id}/pay', [InvoiceController::class, 'pay']);
    Route::get('/invoices/{id}/download', [InvoiceController::class, 'download']);

    Route::get('/documents/vault', [DocumentController::class, 'vault']);
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::post('/documents/folders', [DocumentController::class, 'storeFolder']);
    Route::post('/documents/requests', [DocumentController::class, 'storeRequest']);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
    Route::post('/documents/{id}/share', [DocumentController::class, 'share']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

    Route::post('/payment/checkout', [PaymentController::class, 'checkout']);
    Route::post('/payment/success', [PaymentController::class, 'success']);
    Route::post('/payment/failed', [PaymentController::class, 'failed']);

    Route::post('/services/{id}/reviews', [ReviewController::class, 'store']);

    Route::get('/provider/profile', [ProviderController::class, 'profile']);
    Route::put('/provider/profile', [ProviderController::class, 'update']);
    Route::put('/provider/availability', [ProviderController::class, 'availability']);

    Route::get('/support', [SupportController::class, 'vault']);
    Route::post('/support/tickets', [SupportController::class, 'store']);
    Route::get('/support/tickets/{id}', [SupportController::class, 'show']);
    Route::post('/support/tickets/{id}/reply', [SupportController::class, 'reply']);
    Route::post('/support/tickets/{id}/resolve', [SupportController::class, 'resolve']);
    Route::get('/support/articles/{id}', [SupportController::class, 'showArticle']);

    Route::get('/calendar', [CalendarController::class, 'vault']);
    Route::post('/calendar/events', [CalendarController::class, 'store']);
    Route::post('/calendar/events/{id}/rsvp', [CalendarController::class, 'rsvp']);
    Route::post('/calendar/integrations/{provider}/toggle', [CalendarController::class, 'toggleIntegration']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
