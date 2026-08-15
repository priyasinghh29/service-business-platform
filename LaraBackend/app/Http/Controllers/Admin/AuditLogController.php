<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AuditLogController extends Controller
{
    public function index(Request $request): View
    {
        $query = AuditLog::query()->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('action', 'like', "%{$q}%")
                    ->orWhere('subject_type', 'like', "%{$q}%")
                    ->orWhere('ip_address', 'like', "%{$q}%");
            });
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', '%'.$request->string('action').'%');
        }

        $logs = $query->paginate(25)->withQueryString();

        return view('admin.audit-logs.index', compact('logs'));
    }

    public function show(AuditLog $audit_log): View
    {
        return view('admin.audit-logs.show', ['log' => $audit_log]);
    }
}
