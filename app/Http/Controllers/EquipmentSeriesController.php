<?php

namespace App\Http\Controllers;

use App\Models\EquipmentSeries;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EquipmentSeriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EquipmentSeries::withTrashed();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('slug', 'like', "%{$request->search}%");
            });
        }

        $series = $query->withCount('equipment')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Equipment/Series/Index', [
            'series' => $series,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:equipment_series',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        EquipmentSeries::create($validated);

        return redirect()
            ->route('equipment.series.index')
            ->with('success', 'Equipment series created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EquipmentSeries $equipmentSeries)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('equipment_series')->ignore($equipmentSeries)],
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $equipmentSeries->update($validated);

        return redirect()
            ->route('equipment.series.index')
            ->with('success', 'Equipment series updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EquipmentSeries $equipmentSeries)
    {
        if ($equipmentSeries->equipment()->exists()) {
            return back()->with('error', 'Cannot delete series with associated equipment.');
        }

        $equipmentSeries->delete();

        return redirect()
            ->route('equipment.series.index')
            ->with('success', 'Equipment series deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        $series = EquipmentSeries::withTrashed()->findOrFail($id);
        
        if ($series->trashed()) {
            $series->restore();
            return redirect()
                ->route('equipment.series.index')
                ->with('success', 'Equipment series restored successfully.');
        }

        return redirect()
            ->route('equipment.series.index')
            ->with('error', 'Series is not deleted.');
    }
}
