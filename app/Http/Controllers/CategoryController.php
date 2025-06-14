<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withTrashed()
            ->with(['parent', 'children'])
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Equipment/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:categories',
                'description' => 'nullable|string',
                'status' => 'required|in:active,inactive',
                'sort_order' => 'required|integer|min:0',
                'parent_id' => [
                    'nullable',
                    'exists:categories,id',
                    function ($attribute, $value, $fail) {
                        if ($value && Category::find($value)->hasChildren()) {
                            $fail('Cannot set a category with children as parent.');
                        }
                    },
                ],
                'technical_requirements' => [
                    'nullable',
                    'array',
                    function ($attribute, $value, $fail) {
                        if (!is_array($value)) {
                            $fail('Technical requirements must be an array.');
                            return;
                        }
                        foreach ($value as $req) {
                            if (!is_string($req) || empty(trim($req))) {
                                $fail('Each technical requirement must be a non-empty string.');
                            }
                        }
                    },
                ],
                'application_areas' => [
                    'nullable',
                    'array',
                    function ($attribute, $value, $fail) {
                        if (!is_array($value)) {
                            $fail('Application areas must be an array.');
                            return;
                        }
                        foreach ($value as $area) {
                            if (!is_string($area) || empty(trim($area))) {
                                $fail('Each application area must be a non-empty string.');
                            }
                        }
                    },
                ],
                'quality_standards' => [
                    'nullable',
                    'array',
                    function ($attribute, $value, $fail) {
                        if (!is_array($value)) {
                            $fail('Quality standards must be an array.');
                            return;
                        }
                        foreach ($value as $standard) {
                            if (!is_string($standard) || empty(trim($standard))) {
                                $fail('Each quality standard must be a non-empty string.');
                            }
                        }
                    },
                ],
            ]);

            Category::create($validated);
            Cache::forget('categories.all');

            return redirect()->back()->with('success', 'Category created successfully.');
            
        } catch (\Exception $e) {
            Log::error('Category creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create category. Please try again.');
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:categories,slug,' . $category->id,
                'description' => 'nullable|string',
                'status' => 'required|in:active,inactive',
                'sort_order' => 'required|integer|min:0',
                'parent_id' => [
                    'nullable',
                    'exists:categories,id',
                    function ($attribute, $value, $fail) use ($category) {
                        if ($value === $category->id) {
                            $fail('A category cannot be its own parent.');
                        }
                        if ($value && $category->children()->where('id', $value)->exists()) {
                            $fail('Cannot set a child category as parent.');
                        }
                        if ($value && Category::find($value)->hasChildren()) {
                            $fail('Cannot set a category with children as parent.');
                        }
                    },
                ],
                'technical_requirements' => [
                    'nullable',
                    'array',
                    function ($attribute, $value, $fail) {
                        if (!is_array($value)) {
                            $fail('Technical requirements must be an array.');
                            return;
                        }
                        foreach ($value as $req) {
                            if (!is_string($req) || empty(trim($req))) {
                                $fail('Each technical requirement must be a non-empty string.');
                            }
                        }
                    },
                ],
                'application_areas' => [
                    'nullable',
                    'array',
                    function ($attribute, $value, $fail) {
                        if (!is_array($value)) {
                            $fail('Application areas must be an array.');
                            return;
                        }
                        foreach ($value as $area) {
                            if (!is_string($area) || empty(trim($area))) {
                                $fail('Each application area must be a non-empty string.');
                            }
                        }
                    },
                ],
                'quality_standards' => [
                    'nullable',
                    'array',
                    function ($attribute, $value, $fail) {
                        if (!is_array($value)) {
                            $fail('Quality standards must be an array.');
                            return;
                        }
                        foreach ($value as $standard) {
                            if (!is_string($standard) || empty(trim($standard))) {
                                $fail('Each quality standard must be a non-empty string.');
                            }
                        }
                    },
                ],
            ]);

            $category->update($validated);
            Cache::forget('categories.all');

            return redirect()->back()->with('success', 'Category updated successfully.');
        } catch (\Exception $e) {
            Log::error('Category update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update category. Please try again.');
        }
    }

    public function updateStatus(Request $request, Category $category)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Category status updated successfully.');
    }

    public function destroy(Category $category)
    {
        if ($category->equipment()->exists()) {
            return back()->with('error', 'Cannot delete category with associated equipment.');
        }

        if ($category->children()->exists()) {
            return back()->with('error', 'Cannot delete category with child categories. Please reassign or delete child categories first.');
        }

        $category->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }

    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        
        if ($category->trashed()) {
            $category->restore();
            return back()->with('success', 'Category restored successfully.');
        }

        return back()->with('error', 'Category is not deleted.');
    }

    public function getCategories(Request $request)
    {
        $query = Category::query()->with(['parent', 'children']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $categories = $query->orderBy('sort_order')->get();

        return response()->json($categories);
    }

    public function getCategoryTree()
    {
        $categories = Category::with(['children' => function ($query) {
            $query->orderBy('sort_order');
        }])
        ->whereNull('parent_id')
        ->orderBy('sort_order')
        ->get();

        return response()->json($categories);
    }
} 
