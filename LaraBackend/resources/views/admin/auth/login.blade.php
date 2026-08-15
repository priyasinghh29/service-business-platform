<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin Login</title>
    <link href="{{ asset('admin/css/styles.css') }}" rel="stylesheet" />
</head>
<body class="bg-light">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-5 col-md-7">
                <div class="card shadow-sm mt-5">
                    <div class="card-body p-4">
                        <h4 class="text-center mb-3">Admin Login Page</h4>

                        <div class="alert alert-info" role="alert">
                            <strong>Admin demo login</strong><br>
                            Email: <code>admin@oknitech.serve</code><br>
                            Password: <code>Admin@12345</code>
                        </div>

                        <x-auth-session-status class="mb-3" :status="session('status')" />

                        @if ($errors->any())
                            <div class="alert alert-danger">
                                @foreach ($errors->all() as $error)
                                    <div>{{ $error }}</div>
                                @endforeach
                            </div>
                        @endif

                        <form method="POST" action="{{ route('admin.login') }}">
                            @csrf

                            <div class="mb-3">
                                <label for="email_id" class="form-label">Email</label>
                                <input
                                    id="email_id"
                                    class="form-control"
                                    type="email"
                                    name="email_id"
                                    value="{{ old('email_id', 'admin@oknitech.serve') }}"
                                    required
                                    autofocus
                                    autocomplete="username"
                                >
                            </div>

                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input
                                    id="password"
                                    class="form-control"
                                    type="password"
                                    name="password"
                                    value="Admin@12345"
                                    required
                                    autocomplete="current-password"
                                >
                            </div>

                            <div class="form-check mb-3">
                                <input id="remember_me" class="form-check-input" type="checkbox" name="remember">
                                <label class="form-check-label" for="remember_me">Remember me</label>
                            </div>

                            <button type="submit" class="btn btn-primary w-100">Log in</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
