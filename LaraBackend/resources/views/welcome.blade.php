<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'App') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="antialiased">
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ config('app.name', 'App') }}</h1>
            <p class="text-gray-600 mb-8">Laravel backend is running.</p>
            <div class="space-x-4">
                @if (Route::has('login'))
                    @auth
                        <a href="{{ url('/dashboard') }}" class="text-blue-600 hover:underline">Dashboard</a>
                    @else
                        <a href="{{ route('login') }}" class="text-blue-600 hover:underline">Log in</a>
                        @if (Route::has('register'))
                            <a href="{{ route('register') }}" class="text-blue-600 hover:underline">Register</a>
                        @endif
                    @endauth
                @endif
                <a href="{{ url('/admin/login') }}" class="text-blue-600 hover:underline">Admin</a>
            </div>
        </div>
    </div>
</body>
</html>
