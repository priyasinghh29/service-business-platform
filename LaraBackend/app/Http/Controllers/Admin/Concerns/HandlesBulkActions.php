<?php

namespace App\Http\Controllers\Admin\Concerns;

use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

trait HandlesBulkActions
{
    public function bulk(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
            'action' => ['required', 'in:enable,disable,delete'],
        ]);

        $query = $this->bulkQuery($request);

        match ($validated['action']) {
            'enable' => $query->update([$this->statusColumn() => true]),
            'disable' => $query->update([$this->statusColumn() => false]),
            'delete' => $query->delete(),
        };

        AuditLogger::log('bulk.'.$validated['action'], null, null, [
            'model' => $this->modelClass(),
            'ids' => $validated['ids'],
        ]);

        return back()->with('success', 'Bulk action completed.');
    }

    protected function statusColumn(): string
    {
        return property_exists($this, 'statusColumn') ? $this->statusColumn : 'status';
    }

    protected function bulkQuery(Request $request)
    {
        return $this->modelClass()::query()->whereIn('id', $request->input('ids', []));
    }

    abstract protected function modelClass(): string;
}
