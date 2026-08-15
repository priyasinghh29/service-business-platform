<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['required', 'email', 'unique:users,email_id'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['nullable', 'in:customer,provider'],
            'business_name' => ['nullable', 'string', 'max:255'],
        ]);

        $role = $validated['role'] ?? 'customer';

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'] ?? null,
            'email_id' => $validated['email_id'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password' => $validated['password'],
            'role' => $role,
            'status' => true,
        ]);

        if ($role === 'provider') {
            ServiceProvider::create([
                'user_id' => $user->id,
                'business_name' => $validated['business_name'] ?? null,
                'status' => true,
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return ApiResponse::success([
            'user' => $user->load('providerProfile'),
            'token' => $token,
        ], 'Registered successfully', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email_id' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email_id', $request->email_id)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email_id' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->status) {
            return ApiResponse::error('Account is disabled', null, 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return ApiResponse::success([
            'user' => $user->load('providerProfile'),
            'token' => $token,
        ], 'Logged in successfully');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Logged out successfully');
    }

    public function user(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'user' => $request->user()->load('providerProfile'),
        ], 'Profile retrieved');
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['sometimes', 'email', 'unique:users,email_id,'.$user->id],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'profile_pic' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);

        return ApiResponse::success([
            'user' => $user->fresh()->load('providerProfile'),
        ], 'Profile updated');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return ApiResponse::success(null, 'Password updated');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email_id' => ['required', 'email']]);

        $status = Password::broker('users')->sendResetLink([
            'email_id' => $request->email_id,
        ]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email_id' => [__($status)],
            ]);
        }

        return ApiResponse::success(null, __($status));
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email_id' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::broker('users')->reset(
            [
                'email_id' => $request->email_id,
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
                'token' => $request->token,
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email_id' => [__($status)],
            ]);
        }

        return ApiResponse::success(null, __($status));
    }
}
