<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\CategoryType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::query()->with('categoryType');

        if ($request->has('category_type_id')) {
            $query->where('category_type_id', $request->category_type_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('hsn', 'like', "%{$request->search}%");
            });
        }

        $categories = $query->withCount('equipment')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categoryTypes = CategoryType::active()->get();

        return Inertia::render('Equipment/Categories/Index', [
            'categories' => $categories,
            'categoryTypes' => $categoryTypes,
            'filters' => $request->only(['category_type_id', 'status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categoryTypes = CategoryType::active()->get();
        return Inertia::render('Equipment/Categories/Create', [
            'categoryTypes' => $categoryTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'category_type_id' => 'required|exists:category_types,id',
            'hsn' => 'nullable|string|max:50',
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Category::create($validated);

        return redirect()
            ->route('equipment.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load(['categoryType', 'equipment']);
        return Inertia::render('Equipment/Categories/Show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        $categoryTypes = CategoryType::active()->get();
        return Inertia::render('Equipment/Categories/Edit', [
            'category' => $category,
            'categoryTypes' => $categoryTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category)],
            'description' => 'nullable|string',
            'category_type_id' => 'required|exists:category_types,id',
            'hsn' => 'nullable|string|max:50',
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);

        return redirect()
            ->route('equipment.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        if ($category->equipment()->exists()) {
            return back()->with('error', 'Cannot delete category with associated equipment.');
        }

        $category->delete();

        return redirect()
            ->route('equipment.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return redirect()
            ->route('equipment.categories.index')
            ->with('success', 'Category restored successfully.');
    }
}
