<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Item::query()->with(['category']);

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
                    ->orWhere('code', 'like', "%{$request->search}%")
                    ->orWhere('hsn', 'like', "%{$request->search}%");
            });
        }

        $items = $query->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::active()->get();

        return Inertia::render('Equipment/Items/Index', [
            'items' => $items,
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
        return Inertia::render('Equipment/Items/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:items',
            'code' => 'required|string|max:50|unique:items',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'hsn' => 'nullable|string|max:50',
            'unit' => 'required|string|max:50',
            'min_stock' => 'required|integer|min:0',
            'max_stock' => 'required|integer|min:0|gt:min_stock',
            'reorder_level' => 'required|integer|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:min:purchase_price',
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'notes' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Item::create($validated);

        return redirect()
            ->route('equipment.items.index')
            ->with('success', 'Item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Item $item)
    {
        $item->load(['category', 'stockMovements']);
        return Inertia::render('Equipment/Items/Show', [
            'item' => $item,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Item $item)
    {
        $categories = Category::active()->get();
        return Inertia::render('Equipment/Items/Edit', [
            'item' => $item,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('items')->ignore($item)],
            'code' => ['required', 'string', 'max:50', Rule::unique('items')->ignore($item)],
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'hsn' => 'nullable|string|max:50',
            'unit' => 'required|string|max:50',
            'min_stock' => 'required|integer|min:0',
            'max_stock' => 'required|integer|min:0|gt:min_stock',
            'reorder_level' => 'required|integer|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:min:purchase_price',
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'notes' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $item->update($validated);

        return redirect()
            ->route('equipment.items.index')
            ->with('success', 'Item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        if ($item->stockMovements()->exists()) {
            return back()->with('error', 'Cannot delete item with associated stock movements.');
        }

        $item->delete();

        return redirect()
            ->route('equipment.items.index')
            ->with('success', 'Item deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($id)
    {
        $item = Item::withTrashed()->findOrFail($id);
        $item->restore();

        return redirect()
            ->route('equipment.items.index')
            ->with('success', 'Item restored successfully.');
    }
}
