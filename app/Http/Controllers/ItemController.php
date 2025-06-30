<?php

namespace App\Http\Controllers;

use App\Models\Item;
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
            $query->applicableFor($request->applicable_for);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'low':
                    $query->lowStock();
                    break;
                case 'needs_reorder':
                    $query->needsReorder();
                    break;
            }
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%")
                    ->orWhere('hsn', 'like', "%{$request->search}%");
            });
        }

        $items = $query->ordered()
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Add stock status to each item
        $items->getCollection()->transform(function ($item) {
            $item->stock_status = $item->getStockLevelStatus();
            return $item;
        });

        return response()->json($items);
    }

    public function getAllData(Request $request)
    {
        $items = Item::get();
        return response()->json($items);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate(Item::$rules);
        $validated['slug'] = Str::slug($validated['name']);

        try {
            DB::beginTransaction();

            $item = Item::create($validated);

            // Create initial stock movement if current_stock > 0
            if ($validated['current_stock'] > 0) {
                $item->stockMovements()->create([
                    'type' => 'in',
                    'quantity' => $validated['current_stock'],
                    'unit_price' => $validated['standard_cost'] ?? null,
                    'total_value' => isset($validated['standard_cost']) ? $validated['current_stock'] * $validated['standard_cost'] : null,
                    'reason' => 'Initial stock',
                    'movement_date' => now()->toDateString(),
                    'created_by' => Auth::id(),
                    'status' => 'approved',
                ]);
            }

            DB::commit();

            return redirect()
                ->route('equipment.items.index')
                ->with('success', 'Item created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Failed to create item: ' . $e->getMessage());
        }
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
        $rules = Item::$rules;
        $rules['code'] = ['required', 'string', 'max:50', Rule::unique('items')->ignore($item)];
        $rules['name'] = ['required', 'string', 'max:255', Rule::unique('items')->ignore($item)];
        $rules['slug'] = ['nullable', 'string', 'max:255', Rule::unique('items')->ignore($item)];

        $validated = $request->validate($rules);

        $validated['slug'] = Str::slug($validated['name']);

        try {
            DB::beginTransaction();

            // Calculate stock difference
            $stockDifference = $validated['current_stock'] - $item->current_stock;

            // Update item
            $item->update($validated);

            // Create stock movement if stock changed
            if ($stockDifference !== 0) {
                $item->stockMovements()->create([
                    'type' => $stockDifference > 0 ? 'in' : 'out',
                    'quantity' => abs($stockDifference),
                    'unit_price' => $validated['standard_cost'] ?? null,
                    'total_value' => isset($validated['standard_cost']) ? abs($stockDifference) * $validated['standard_cost'] : null,
                    'reason' => 'Stock adjustment',
                    'movement_date' => now()->toDateString(),
                    'created_by' => Auth::id(),
                    'status' => 'approved',
                ]);
            }

            DB::commit();

            return redirect()
                ->route('equipment.items.index')
                ->with('success', 'Item updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Failed to update item: ' . $e->getMessage());
        }
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

    private function isUniqueCode($code)
    {
        return !Item::where('code', $code)->exists();
    }

    /**
     * Get the last item code.
     */
    public function getLastCode()
    {
        // Find the item with the highest code numerically
        $lastItemCode = Item::query()
            ->where('code', 'REGEXP', '^ITM[0-9]{6}$')
            ->max('code');

        if (!$lastItemCode) {
            $newNumber = 1;
        } else {
            $numericPart = (int) substr($lastItemCode, 3);
            $newNumber = $numericPart + 1;
        }

        $newCode = 'ITM' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);

        // In case of race conditions or non-standard codes, ensure uniqueness
        while (!$this->isUniqueCode($newCode)) {
            $newNumber++;
            $newCode = 'ITM' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
        }

        return response()->json(['code' => $newCode]);
    }

    /**
     * Store a new stock movement for the item.
     */
    public function storeStockMovement(Request $request, Item $item)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out', 'transfer', 'adjustment', 'return', 'damage'])],
            'quantity' => 'required|numeric|min:0.01',
            'unit_price' => 'nullable|numeric|min:0',
            'total_value' => 'nullable|numeric|min:0',
            'reference_type' => 'nullable|string|max:255',
            'reference_id' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'from_location' => 'nullable|string|max:255',
            'to_location' => 'nullable|string|max:255',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'movement_date' => 'nullable|date',
            'status' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $stockMovement = $item->stockMovements()->create([
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'unit_price' => $validated['unit_price'] ?? null,
                'total_value' => $validated['total_value'] ?? (($validated['unit_price'] ?? $item->standard_cost) ? $validated['quantity'] * ($validated['unit_price'] ?? $item->standard_cost) : null),
                'reference_type' => $validated['reference_type'] ?? null,
                'reference_id' => $validated['reference_id'] ?? null,
                'reference_number' => $validated['reference_number'] ?? null,
                'from_location' => $validated['from_location'] ?? null,
                'to_location' => $validated['to_location'] ?? null,
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'movement_date' => $validated['movement_date'] ?? now()->toDateString(),
                'created_by' => Auth::id(),
                'status' => $validated['status'] ?? 'approved',
            ]);

            // Update stock using model methods
            $success = $validated['type'] === 'in'
                ? $item->addStock($validated['quantity'])
                : $item->removeStock($validated['quantity']);

            if (!$success) {
                throw new \Exception('Failed to update stock level.');
            }

            DB::commit();
            return redirect()
                ->route('equipment.items.index')
                ->with('success', 'Stock Updated successfully.');
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

            // Update stock using model methods
            $success = $movement->type === 'in'
                ? $item->removeStock($movement->quantity)
                : $item->addStock($movement->quantity);

            if (!$success) {
                throw new \Exception('Failed to update stock level.');
            }

            $movement->delete();

            DB::commit();
            return response()->json(['message' => 'Stock movement deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
