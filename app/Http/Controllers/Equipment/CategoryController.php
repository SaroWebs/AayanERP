<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
} 