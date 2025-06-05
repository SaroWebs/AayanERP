<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Category;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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
     * Get the specified item with its stock movements.
     */
    public function getItem(Item $item)
    {
        $item->load(['stockMovements.creator']);
        return response()->json(['item' => $item]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Item $item)
    {
        $item->load(['stockMovements.creator']);
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

    /**
     * Store a new stock movement for the item.
     */
    public function storeStockMovement(Request $request, Item $item)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'quantity' => 'required|integer|min:1',
            'reference_type' => 'nullable|string|max:255',
            'reference_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Create stock movement
            $stockMovement = $item->stockMovements()->create([
                ...$validated,
                'created_by' => Auth::id(),
            ]);

            // Update item's current stock
            $newStock = $validated['type'] === 'in'
                ? $item->current_stock + $validated['quantity']
                : $item->current_stock - $validated['quantity'];

            // Prevent negative stock
            if ($newStock < 0) {
                throw new \Exception('Stock cannot go below zero.');
            }

            $item->update(['current_stock' => $newStock]);

            DB::commit();

            return response()->json($stockMovement->load('creator'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Delete a stock movement and update item stock.
     */
    public function destroyStockMovement(Item $item, StockMovement $movement)
    {
        try {
            DB::beginTransaction();

            // Update item's current stock
            $newStock = $movement->type === 'in'
                ? $item->current_stock - $movement->quantity
                : $item->current_stock + $movement->quantity;

            // Prevent negative stock
            if ($newStock < 0) {
                throw new \Exception('Cannot delete movement: would result in negative stock.');
            }

            $item->update(['current_stock' => $newStock]);
            $movement->delete();

            DB::commit();
            return response()->json(['message' => 'Stock movement deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
