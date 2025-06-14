<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentSeries;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Str;

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
                // Basic Information
                'code' => 'required|string|max:255|unique:equipment',
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'equipment_series_id' => 'nullable|exists:equipment_series,id',
                'description' => 'nullable|string',

                // Equipment Details
                'make' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_no' => 'nullable|string|max:255',
                'make_year' => 'nullable|integer|min:1800|max:' . date('Y'),
                'capacity' => 'nullable|string|max:255',
                'power_rating' => 'nullable|string|max:255',
                'fuel_type' => 'nullable|string|max:255',
                'operating_conditions' => 'nullable|string|max:255',

                // Physical Details
                'weight' => 'nullable|numeric|min:0|decimal:0,2',
                'dimensions_length' => 'nullable|numeric|min:0|decimal:0,2',
                'dimensions_width' => 'nullable|numeric|min:0|decimal:0,2',
                'dimensions_height' => 'nullable|numeric|min:0|decimal:0,2',
                'color' => 'nullable|string|max:255',
                'material' => 'nullable|string|max:255',

                // Financial Details
                'purchase_price' => 'nullable|numeric|min:0|decimal:0,2',
                'purchase_date' => 'nullable|date',
                'purchase_order_no' => 'nullable|string|max:255',
                'supplier' => 'nullable|string|max:255',
                'rental_rate' => 'nullable|numeric|min:0|decimal:0,2',
                'depreciation_rate' => 'nullable|numeric|min:0|decimal:0,2',
                'current_value' => 'nullable|numeric|min:0|decimal:0,2',

                // Maintenance Details
                'maintenance_frequency' => ['nullable', Rule::in(['daily', 'weekly', 'monthly', 'quarterly', 'bi-annual', 'annual', 'as-needed'])],
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date',
                'maintenance_hours' => 'nullable|integer|min:0',
                'maintenance_instructions' => 'nullable|string',
                'maintenance_checklist' => 'nullable|json',

                // Warranty and Insurance
                'warranty_start_date' => 'nullable|date',
                'warranty_end_date' => 'nullable|date',
                'warranty_terms' => 'nullable|string|max:255',
                'insurance_policy_no' => 'nullable|string|max:255',
                'insurance_expiry_date' => 'nullable|date',
                'insurance_coverage' => 'nullable|string|max:255',

                // Location and Status
                'status' => ['required', Rule::in(['available', 'in_use', 'maintenance', 'repair', 'retired', 'scrapped'])],
                'current_location' => 'nullable|string|max:255',
                'assigned_to' => 'nullable|string|max:255',
                'condition' => 'nullable|string|max:255',
                'usage_hours' => 'nullable|integer|min:0',

                // Documentation
                'technical_specifications' => 'nullable|json',
                'safety_requirements' => 'nullable|json',
                'operating_instructions' => 'nullable|json',
                'certifications' => 'nullable|json',
                'attachments' => 'nullable|json',

                // Additional Details
                'notes' => 'nullable|string',
                'special_instructions' => 'nullable|string',
                'custom_fields' => 'nullable|json',
            ]);

            // Generate slug from name
            $validated['slug'] = Str::slug($validated['name']);

            // Handle JSON fields
            $jsonFields = [
                'maintenance_checklist',
                'technical_specifications',
                'safety_requirements',
                'operating_instructions',
                'certifications',
                'attachments',
                'custom_fields'
            ];

            foreach ($jsonFields as $field) {
                if (isset($validated[$field]) && is_string($validated[$field])) {
                    $validated[$field] = json_decode($validated[$field], true);
                }
            }

            $equipment = Equipment::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Equipment created successfully.',
                'data' => $equipment
            ], 201);

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
                // Basic Information
                'code' => ['required', 'string', 'max:255', Rule::unique('equipment')->ignore($equipment)],
                'name' => 'required|string|max:255',
                'category_id' => 'required|exists:categories,id',
                'equipment_series_id' => 'nullable|exists:equipment_series,id',
                'description' => 'nullable|string',

                // Equipment Details
                'make' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_no' => 'nullable|string|max:255',
                'make_year' => 'nullable|integer|min:1800|max:' . date('Y'),
                'capacity' => 'nullable|string|max:255',
                'power_rating' => 'nullable|string|max:255',
                'fuel_type' => 'nullable|string|max:255',
                'operating_conditions' => 'nullable|string|max:255',

                // Physical Details
                'weight' => 'nullable|numeric|min:0|decimal:0,2',
                'dimensions_length' => 'nullable|numeric|min:0|decimal:0,2',
                'dimensions_width' => 'nullable|numeric|min:0|decimal:0,2',
                'dimensions_height' => 'nullable|numeric|min:0|decimal:0,2',
                'color' => 'nullable|string|max:255',
                'material' => 'nullable|string|max:255',

                // Financial Details
                'purchase_price' => 'nullable|numeric|min:0|decimal:0,2',
                'purchase_date' => 'nullable|date',
                'purchase_order_no' => 'nullable|string|max:255',
                'supplier' => 'nullable|string|max:255',
                'rental_rate' => 'nullable|numeric|min:0|decimal:0,2',
                'depreciation_rate' => 'nullable|numeric|min:0|decimal:0,2',
                'current_value' => 'nullable|numeric|min:0|decimal:0,2',

                // Maintenance Details
                'maintenance_frequency' => ['nullable', Rule::in(['daily', 'weekly', 'monthly', 'quarterly', 'bi-annual', 'annual', 'as-needed'])],
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date',
                'maintenance_hours' => 'nullable|integer|min:0',
                'maintenance_instructions' => 'nullable|string',
                'maintenance_checklist' => 'nullable|json',

                // Warranty and Insurance
                'warranty_start_date' => 'nullable|date',
                'warranty_end_date' => 'nullable|date',
                'warranty_terms' => 'nullable|string|max:255',
                'insurance_policy_no' => 'nullable|string|max:255',
                'insurance_expiry_date' => 'nullable|date',
                'insurance_coverage' => 'nullable|string|max:255',

                // Location and Status
                'status' => ['required', Rule::in(['available', 'in_use', 'maintenance', 'repair', 'retired', 'scrapped'])],
                'current_location' => 'nullable|string|max:255',
                'assigned_to' => 'nullable|string|max:255',
                'condition' => 'nullable|string|max:255',
                'usage_hours' => 'nullable|integer|min:0',

                // Documentation
                'technical_specifications' => 'nullable|json',
                'safety_requirements' => 'nullable|json',
                'operating_instructions' => 'nullable|json',
                'certifications' => 'nullable|json',
                'attachments' => 'nullable|json',

                // Additional Details
                'notes' => 'nullable|string',
                'special_instructions' => 'nullable|string',
                'custom_fields' => 'nullable|json',
            ]);

            // Update slug if name changed
            if ($equipment->name !== $validated['name']) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            // Handle JSON fields
            $jsonFields = [
                'maintenance_checklist',
                'technical_specifications',
                'safety_requirements',
                'operating_instructions',
                'certifications',
                'attachments',
                'custom_fields'
            ];

            foreach ($jsonFields as $field) {
                if (isset($validated[$field]) && is_string($validated[$field])) {
                    $validated[$field] = json_decode($validated[$field], true);
                }
            }

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
        $equipment->status = 'retired';
        $equipment->save();
        $equipment->delete();

        return redirect()
            ->route('equipment.equipment.index')
            ->with('success', 'Equipment soft deleted successfully.');
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
            'status' => ['required', Rule::in(['available', 'in_use', 'maintenance', 'repair', 'retired', 'scrapped'])],
            'maintenance_notes' => 'required|string',
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'nullable|date',
            'maintenance_hours' => 'nullable|integer|min:0',
            'maintenance_instructions' => 'nullable|string',
            'maintenance_checklist' => 'nullable|json',
            'cost' => 'nullable|numeric|min:0',
        ]);

        $equipment->update([
            'status' => $validated['status'],
            'last_maintenance_date' => $validated['maintenance_date'],
            'next_maintenance_date' => $validated['next_maintenance_date'],
            'maintenance_hours' => $validated['maintenance_hours'],
            'maintenance_instructions' => $validated['maintenance_instructions'],
            'maintenance_checklist' => $validated['maintenance_checklist'],
        ]);
        
        $equipment->maintenanceRecords()->create([
            'notes' => $validated['maintenance_notes'],
            'date' => $validated['maintenance_date'],
            'next_date' => $validated['next_maintenance_date'],
            'cost' => $validated['cost'],
            'hours' => $validated['maintenance_hours'],
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
            $query = Equipment::query()->withTrashed()->with(['category', 'equipmentSeries']);

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
