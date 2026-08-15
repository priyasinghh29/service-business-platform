<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SettingController extends Controller
{
    public function index(Request $request): View
    {
        $query = Setting::query()->orderBy('group')->orderBy('key');

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('key', 'like', "%{$q}%")->orWhere('group', 'like', "%{$q}%");
            });
        }

        $settings = $query->paginate(30)->withQueryString();

        return view('admin.settings.index', compact('settings'));
    }

    public function create(): View
    {
        return view('admin.settings.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'group' => ['required', 'string', 'max:100'],
            'key' => ['required', 'string', 'max:100', 'unique:settings,key'],
            'value' => ['nullable', 'string'],
            'type' => ['required', 'in:string,boolean,json,number'],
            'status' => ['nullable', 'boolean'],
        ]);

        $validated['status'] = $request->boolean('status', true);
        $setting = Setting::create($validated);
        AuditLogger::log('setting.created', $setting, null, $setting->toArray());

        return redirect()->route('admin.settings.index')->with('success', 'Setting created successfully.');
    }

    public function edit(Setting $setting): View
    {
        return view('admin.settings.edit', compact('setting'));
    }

    public function update(Request $request, Setting $setting): RedirectResponse
    {
        $validated = $request->validate([
            'group' => ['required', 'string', 'max:100'],
            'key' => ['required', 'string', 'max:100', 'unique:settings,key,'.$setting->id],
            'value' => ['nullable', 'string'],
            'type' => ['required', 'in:string,boolean,json,number'],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $setting->toArray();
        $validated['status'] = $request->boolean('status');
        $setting->update($validated);
        AuditLogger::log('setting.updated', $setting, $old, $setting->fresh()->toArray());

        return redirect()->route('admin.settings.index')->with('success', 'Setting updated successfully.');
    }

    public function destroy(Setting $setting): RedirectResponse
    {
        AuditLogger::log('setting.deleted', $setting, $setting->toArray());
        $setting->delete();

        return redirect()->route('admin.settings.index')->with('success', 'Setting deleted successfully.');
    }

    public function toggleStatus(Setting $setting): RedirectResponse
    {
        $setting->update(['status' => ! $setting->status]);

        return back()->with('success', 'Setting status updated.');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $items = $request->input('settings', []);
        foreach ($items as $id => $value) {
            $setting = Setting::find($id);
            if ($setting) {
                $setting->update(['value' => $value]);
            }
        }

        AuditLogger::log('setting.bulk_updated', null, null, ['ids' => array_keys($items)]);

        return back()->with('success', 'Settings saved.');
    }
}
