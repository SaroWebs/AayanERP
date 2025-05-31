<?php

namespace App\Http\Controllers;

use App\Models\CategoryType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CategoryType::query();

        if ($request->has('variant')) {
            $query->variant($request->variant);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        $categoryTypes = $query->withCount('categories')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Equipment/CategoryTypes/Index', [
            'categoryTypes' => $categoryTypes,
            'filters' => $request->only(['variant', 'status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Equipment/CategoryTypes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:category_types',
            'description' => 'nullable|string',
            'variant' => ['required', Rule::in(['equipment', 'scaffolding'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        CategoryType::create($validated);

        return redirect()
            ->route('equipment.category-types.index')
            ->with('success', 'Category type created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CategoryType $categoryType)
    {
        $categoryType->load('categories');
        return Inertia::render('Equipment/CategoryTypes/Show', [
            'categoryType' => $categoryType,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CategoryType $categoryType)
    {
        return Inertia::render('Equipment/CategoryTypes/Edit', [
            'categoryType' => $categoryType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CategoryType $categoryType)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('category_types')->ignore($categoryType)],
            'description' => 'nullable|string',
            'variant' => ['required', Rule::in(['equipment', 'scaffolding'])],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $categoryType->update($validated);

        return redirect()
            ->route('equipment.category-types.index')
            ->with('success', 'Category type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CategoryType $categoryType)
    {
        if ($categoryType->categories()->exists()) {
            return back()->with('error', 'Cannot delete category type with associated categories.');
        }

        $categoryType->delete();

        return redirect()
            ->route('equipment.category-types.index')
            ->with('success', 'Category type deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        $categoryType = CategoryType::withTrashed()->findOrFail($id);
        $categoryType->restore();

        return redirect()
            ->route('equipment.category-types.index')
            ->with('success', 'Category type restored successfully.');
    }
}
