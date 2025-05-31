<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\Category;
use App\Models\EquipmentSeries;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Equipment::query()->with(['category', 'series']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('series_id')) {
            $query->where('equipment_series_id', $request->series_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%")
                    ->orWhere('serial_number', 'like', "%{$request->search}%");
            });
        }

        $equipment = $query->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::active()->get();
        $series = EquipmentSeries::active()->get();

        return Inertia::render('Equipment/Equipment/Index', [
            'equipment' => $equipment,
            'categories' => $categories,
            'series' => $series,
            'filters' => $request->only(['category_id', 'series_id', 'status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::active()->get();
        $series = EquipmentSeries::active()->get();
        return Inertia::render('Equipment/Equipment/Create', [
            'categories' => $categories,
            'series' => $series,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:equipment',
            'serial_number' => 'required|string|max:100|unique:equipment',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'equipment_series_id' => 'required|exists:equipment_series,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date',
            'status' => ['required', Rule::in(['active', 'inactive', 'maintenance', 'retired'])],
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Equipment::create($validated);

        return redirect()
            ->route('equipment.equipment.index')
            ->with('success', 'Equipment created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Equipment $equipment)
    {
        $equipment->load(['category', 'series', 'maintenanceRecords']);
        return Inertia::render('Equipment/Equipment/Show', [
            'equipment' => $equipment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Equipment $equipment)
    {
        $categories = Category::active()->get();
        $series = EquipmentSeries::active()->get();
        return Inertia::render('Equipment/Equipment/Edit', [
            'equipment' => $equipment,
            'categories' => $categories,
            'series' => $series,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('equipment')->ignore($equipment)],
            'serial_number' => ['required', 'string', 'max:100', Rule::unique('equipment')->ignore($equipment)],
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'equipment_series_id' => 'required|exists:equipment_series,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date',
            'status' => ['required', Rule::in(['active', 'inactive', 'maintenance', 'retired'])],
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $equipment->update($validated);

        return redirect()
            ->route('equipment.equipment.index')
            ->with('success', 'Equipment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Equipment $equipment)
    {
        if ($equipment->maintenanceRecords()->exists()) {
            return back()->with('error', 'Cannot delete equipment with associated maintenance records.');
        }

        $equipment->delete();

        return redirect()
            ->route('equipment.equipment.index')
            ->with('success', 'Equipment deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        $equipment = Equipment::withTrashed()->findOrFail($id);
        $equipment->restore();

        return redirect()
            ->route('equipment.equipment.index')
            ->with('success', 'Equipment restored successfully.');
    }

    /**
     * Update maintenance information.
     */
    public function updateMaintenance(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive', 'maintenance', 'retired'])],
            'maintenance_notes' => 'required|string',
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'nullable|date',
            'cost' => 'nullable|numeric|min:0',
        ]);

        $equipment->update(['status' => $validated['status']]);
        
        $equipment->maintenanceRecords()->create([
            'notes' => $validated['maintenance_notes'],
            'date' => $validated['maintenance_date'],
            'next_date' => $validated['next_maintenance_date'],
            'cost' => $validated['cost'],
        ]);

        return redirect()
            ->route('equipment.equipment.show', $equipment)
            ->with('success', 'Maintenance record updated successfully.');
    }
}
