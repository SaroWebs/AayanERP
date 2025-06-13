<?php

namespace App\Http\Controllers\Refractory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BaseRefractoryController extends Controller
{
    protected function getPaginatedData($query, Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function validateRefractoryProduct(Request $request)
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:items,code',
            'description_1' => 'nullable|string',
            'description_2' => 'nullable|string',
            'applicable_for' => 'required|in:all,equipment,scaffolding',
            'hsn' => 'nullable|string|max:50',
            'unit' => 'nullable|in:set,nos,rmt,sqm,ltr,na',
            'minimum_stock' => 'required|numeric|min:0',
            'current_stock' => 'required|numeric|min:0',
            'maximum_stock' => 'nullable|numeric|min:0',
            'reorder_point' => 'nullable|numeric|min:0',
            'sort_order' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive',

            // Technical Specifications
            'temperature_rating' => 'nullable|numeric',
            'max_service_temperature' => 'nullable|numeric',
            'thermal_conductivity' => 'nullable|numeric',
            'bulk_density' => 'nullable|numeric',
            'cold_crushing_strength' => 'nullable|numeric',
            'porosity' => 'nullable|numeric|min:0|max:100',
            'chemical_composition' => 'nullable|string',
            'application_temperature_range' => 'nullable|string',
            'thermal_expansion' => 'nullable|numeric',
            'abrasion_resistance' => 'nullable|string',
            'corrosion_resistance' => 'nullable|string',
            'thermal_shock_resistance' => 'nullable|string',

            // Certifications and Standards
            'certifications' => 'nullable|string',
            'standards_compliance' => 'nullable|string',
            'quality_grade' => 'nullable|string',

            // Additional Information
            'installation_guide' => 'nullable|string',
            'safety_data_sheet' => 'nullable|string',
            'technical_data_sheet' => 'nullable|string',
            'maintenance_guide' => 'nullable|string',
        ]);
    }
} 