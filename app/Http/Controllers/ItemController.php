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
        return Inertia::render('Equipment/Items/Index');
    }

    public function getData(Request $request)
    {
        $query = Item::query();

        if ($request->has('applicable_for')) {
            $query->where('applicable_for', $request->applicable_for);
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

        return response()->json($items);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:items',
            'code' => 'required|string|max:50|unique:items',
            'description_1' => 'nullable|string',
            'description_2' => 'nullable|string',
            'applicable_for' => ['required', Rule::in(['all', 'equipment', 'scaffolding'])],
            'hsn' => 'nullable|string|max:50',
            'unit' => ['nullable', Rule::in(['set', 'nos', 'rmt', 'sqm', 'ltr', 'na'])],
            'minimum_stock' => 'required|integer|min:0',
            'current_stock' => 'required|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0|gt:minimum_stock',
            'reorder_point' => 'nullable|integer|min:0',
            'sort_order' => 'integer|min:0',
            'status' => ['required', Rule::in(['active', 'inactive'])],
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('items')->ignore($item)],
            'code' => ['required', 'string', 'max:50', Rule::unique('items')->ignore($item)],
            'description_1' => 'nullable|string',
            'description_2' => 'nullable|string',
            'applicable_for' => ['required', Rule::in(['all', 'equipment', 'scaffolding'])],
            'hsn' => 'nullable|string|max:50',
            'unit' => ['nullable', Rule::in(['set', 'nos', 'rmt', 'sqm', 'ltr', 'na'])],
            'minimum_stock' => 'required|integer|min:0',
            'current_stock' => 'required|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0|gt:minimum_stock',
            'reorder_point' => 'nullable|integer|min:0',
            'sort_order' => 'integer|min:0',
            'status' => ['required', Rule::in(['active', 'inactive'])],
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

    /**
     * Get the last item code.
     */
    public function getLastCode()
    {
        $lastItem = Item::latest()->first();

        if (!$lastItem) {
            return response()->json(['code' => 'ITM000000']);
        }

        // Extract the numeric part from the last code
        $lastCode = $lastItem->code;
        $numericPart = (int) substr($lastCode, 3); // Remove 'ITM' prefix and convert to number

        // Generate new code with incremented number
        $newNumber = $numericPart + 1;
        $newCode = 'ITM' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);

        return response()->json(['code' => $newCode]);
    }
}
