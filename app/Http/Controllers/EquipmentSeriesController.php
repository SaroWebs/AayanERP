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
        $query = EquipmentSeries::query()->with(['category']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        $series = $query->withCount('equipment')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::active()->get();

        return Inertia::render('Equipment/Series/Index', [
            'series' => $series,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::active()->get();
        return Inertia::render('Equipment/Series/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:equipment_series',
            'code' => 'required|string|max:50|unique:equipment_series',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        EquipmentSeries::create($validated);

        return redirect()
            ->route('equipment.series.index')
            ->with('success', 'Equipment series created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EquipmentSeries $equipmentSeries)
    {
        $equipmentSeries->load(['category', 'equipment']);
        return Inertia::render('Equipment/Series/Show', [
            'series' => $equipmentSeries,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EquipmentSeries $equipmentSeries)
    {
        $categories = Category::active()->get();
        return Inertia::render('Equipment/Series/Edit', [
            'series' => $equipmentSeries,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EquipmentSeries $equipmentSeries)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('equipment_series')->ignore($equipmentSeries)],
            'code' => ['required', 'string', 'max:50', Rule::unique('equipment_series')->ignore($equipmentSeries)],
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => 'nullable|integer|min:0',
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
        $series->restore();

        return redirect()
            ->route('equipment.series.index')
            ->with('success', 'Equipment series restored successfully.');
    }
}
