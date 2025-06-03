<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\CategoryType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Equipment/Categories/Index', [
            'categories' => Category::with('categoryType')->get(),
            'categoryTypes' => CategoryType::all(),
        ]);
    }

    public function indexTypes()
    {
        return Inertia::render('Equipment/CategoryTypes/Index', [
            'categoryTypes' => CategoryType::with('categories')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'category_type_id' => 'required|exists:category_types,id',
            'hsn' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
            'sort_order' => 'required|integer|min:0',
        ]);

        Category::create($validated);

        return redirect()->back();
    }

    public function storeType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:category_types',
            'description' => 'nullable|string',
            'variant' => 'required|in:equipment,scaffolding',
            'status' => 'required|in:active,inactive',
        ]);

        CategoryType::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'category_type_id' => 'required|exists:category_types,id',
            'hsn' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
            'sort_order' => 'required|integer|min:0',
        ]);

        $category->update($validated);

        return redirect()->back();
    }

    public function updateType(Request $request, CategoryType $categoryType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:category_types,slug,' . $categoryType->id,
            'description' => 'nullable|string',
            'variant' => 'required|in:equipment,scaffolding',
            'status' => 'required|in:active,inactive',
        ]);

        $categoryType->update($validated);

        return redirect()->back();
    }

    public function updateTypeStatus(Request $request, CategoryType $categoryType)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $categoryType->update($validated);

        return redirect()->back();
    }

    public function updateStatus(Request $request, Category $category)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $category->update($validated);

        return redirect()->back();
    }

    public function destroy(Category $category)
    {
        if ($category->equipment()->exists()) {
            return back()->with('error', 'Cannot delete category with associated equipment.');
        }

        $category->delete();
        return redirect()->back();
    }

    public function destroyType(CategoryType $categoryType)
    {
        if ($categoryType->categories()->exists()) {
            return back()->with('error', 'Cannot delete category type with associated categories.');
        }

        $categoryType->delete();
        return redirect()->back();
    }

    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();
        return redirect()->back();
    }

    public function restoreType($id)
    {
        $categoryType = CategoryType::withTrashed()->findOrFail($id);
        $categoryType->restore();
        return redirect()->back();
    }

    public function getCategories(Request $request)
    {
        $query = Category::query()->with('categoryType');

        if ($request->has('variant')) {
            $query->whereHas('categoryType', function ($q) use ($request) {
                $q->where('variant', $request->variant);
            });
        }

        if ($request->has('category_type_id')) {
            $query->where('category_type_id', $request->category_type_id);
        }

        $query->active();

        $categories = $query->get();

        return response()->json($categories);
    }

    public function getCategoryTypes(Request $request)
    {
        $query = CategoryType::query();

        if ($request->has('variant')) {
            $query->where('variant', $request->variant);
        }

        $query->active();

        $categoryTypes = $query->get();

        return response()->json($categoryTypes);
    }
} 
