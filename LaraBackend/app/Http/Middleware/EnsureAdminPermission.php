<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $admin = auth('admin')->user();

        if (! $admin) {
            return redirect()->route('admin.login');
        }

        // Super-admin keeps full access. Staff must have an assigned role.
        $role = $admin->role;
        if ($role?->slug === 'super-admin') {
            return $next($request);
        }

        if (! $role || ! $role->status) {
            abort(403, 'Your account has no active role assigned.');
        }

        $allowed = $role->permissions()->where('slug', $permission)->exists();
        if (! $allowed) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
