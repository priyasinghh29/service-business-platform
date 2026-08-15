<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());

            return "{$frontend}/reset-password?token={$token}&email_id={$email}";
        });
    }
}
