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
        $query = Equipment::query()->with(['category.categoryType', 'series']);

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

        $series = EquipmentSeries::active()->get();

        return Inertia::render('Equipment/Equipment/Index', [
            'equipment' => $equipment,
            'series' => $series,
            'filters' => $request->only(['category_id', 'series_id', 'status', 'search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'equipment_series_id' => 'required|exists:equipment_series,id',
                'details' => 'nullable|string',
                'rental_rate' => 'nullable|numeric|min:0',
                'make' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_no' => 'nullable|string|max:255|unique:equipment',
                'code' => 'nullable|string|max:255|unique:equipment',
                'make_year' => 'nullable|integer|min:1800|max:' . date('Y'),
                'capacity' => 'nullable|string|max:255',
                'stock_unit' => 'nullable|string|max:255',
                'unit_weight' => 'nullable|string|max:255',
                'rental_unit' => 'nullable|string|max:255',
                'status' => ['required', Rule::in(['active', 'inactive', 'maintenance', 'retired'])],
                'condition' => ['required', Rule::in(['new', 'good', 'fair', 'poor'])],
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'warranty_expiry' => 'nullable|date',
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date',
                'location' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
            ]);

            $equipment = Equipment::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Equipment created successfully.',
                'data' => $equipment
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create equipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Equipment $equipment)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'equipment_series_id' => 'required|exists:equipment_series,id',
                'details' => 'nullable|string',
                'rental_rate' => 'nullable|numeric|min:0',
                'make' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_no' => ['nullable', 'string', 'max:255', Rule::unique('equipment')->ignore($equipment)],
                'code' => ['nullable', 'string', 'max:255', Rule::unique('equipment')->ignore($equipment)],
                'make_year' => 'nullable|integer|min:1800|max:' . date('Y'),
                'capacity' => 'nullable|string|max:255',
                'stock_unit' => 'nullable|string|max:255',
                'unit_weight' => 'nullable|string|max:255',
                'rental_unit' => 'nullable|string|max:255',
                'status' => ['required', Rule::in(['active', 'inactive', 'maintenance', 'retired'])],
                'condition' => ['required', Rule::in(['new', 'good', 'fair', 'poor'])],
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'warranty_expiry' => 'nullable|date',
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date',
                'location' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
            ]);

            $equipment->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Equipment updated successfully.',
                'data' => $equipment->fresh()
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update equipment',
                'error' => $e->getMessage()
            ], 500);
        }
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
            ->route('equipment.equipment.index')
            ->with('success', 'Maintenance record updated successfully.');
    }

    /**
     * Get paginated equipment data for AJAX requests.
     */
    public function data(Request $request)
    {
        try {
            $query = Equipment::query()->with(['category.categoryType', 'equipmentSeries']);

            // Filter by category
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by series
            if ($request->filled('series_id')) {
                $query->where('equipment_series_id', $request->series_id);
            }

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            } else {
                $query->active(); // Only show active by default
            }

            // Search functionality
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('serial_no', 'like', "%{$search}%")
                        ->orWhere('make', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            }

            // Get paginated results
            $equipment = $query->latest()
                ->paginate(10)
                ->withQueryString();

            return response()->json($equipment);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch equipment data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a simple list of equipment for dropdowns.
     */
    public function getEquipment()
    {
        try {
            $equipment = Equipment::select('id', 'name')
                ->where('status', 'active')
                ->orderBy('name')
                ->get();

            return response()->json($equipment);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch equipment list',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
