<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Inertia\Inertia;
use App\Models\Vendor;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\PurchaseIntent;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the purchase orders.
     */
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['vendor', 'creator', 'approver'])
            ->latest();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('order_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('order_date', '<=', $request->to_date);
        }

        // Search by PO number or subject
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_no', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate(10)->withQueryString();
        $vendors = Vendor::where('status', 'active')->get();
        $departments = Department::where('status', 'active')->get();
        $items = Item::where('status','active')->get();
        $intents = PurchaseIntent::where('status','approved')->get();

        return Inertia::render('purchases/orders/index', [
            'orders' => $orders,
            'items' => $items,
            'vendors' => $vendors,
            'departments' => $departments,
            'purchaseIntents'=> $intents,
            'filters' => $request->only(['status', 'approval_status', 'vendor_id', 'from_date', 'to_date', 'search'])
        ]);
    }


    public function paginatedList(Request $request)
    {
        $query = PurchaseOrder::with(['vendor', 'department', 'creator', 'approver', 'items'])
            ->latest();

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->has('from_date')) {
            $query->where('po_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('po_date', '<=', $request->to_date);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_no', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate($request->get('per_page', 15));
        return response()->json($orders);
    }
    /**
     * Store a newly created purchase order in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_intent_id' => ['nullable', 'exists:purchase_intents,id'],
            'vendor_id' => ['required', 'exists:vendors,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order_date' => ['required', 'date'],
            'expected_delivery_date' => ['required', 'date', 'after_or_equal:order_date'],
            'currency' => ['required', 'string', 'size:3'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'payment_terms' => ['required', 'string'],
            'delivery_terms' => ['required', 'string'],
            'specifications' => ['nullable', 'string'],
            'terms_conditions' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();
            $validated['po_no'] = $this->generatePoNumber();
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'draft';
            $validated['approval_status'] = 'not_required';
            $order = PurchaseOrder::create($validated);
            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('po-documents');
                $order->update(['document_path' => $path]);
            }
            DB::commit();
            return response()->json(['success' => true, 'order' => $order], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => 'Failed to create purchase order: ' . $e->getMessage()], 500);
        }
    }


    /**
     * Update the specified purchase order in storage.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'pending_review'])) {
            return response()->json(['success' => false, 'error' => 'Only draft or pending review orders can be updated.'], 400);
        }
        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:vendors,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order_date' => ['required', 'date'],
            'expected_delivery_date' => ['required', 'date', 'after_or_equal:order_date'],
            'currency' => ['required', 'string', 'size:3'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'payment_terms' => ['required', 'string'],
            'delivery_terms' => ['required', 'string'],
            'specifications' => ['nullable', 'string'],
            'terms_conditions' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);
        try {
            DB::beginTransaction();
            $purchaseOrder->update($validated);
            if ($request->hasFile('document')) {
                if ($purchaseOrder->document_path) {
                    Storage::delete($purchaseOrder->document_path);
                }
                $path = $request->file('document')->store('po-documents');
                $purchaseOrder->update(['document_path' => $path]);
            }
            DB::commit();
            return response()->json(['success' => true, 'order' => $purchaseOrder]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => 'Failed to update purchase order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified purchase order from storage.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['success' => false, 'error' => 'Only draft orders can be deleted.'], 400);
        }
        try {
            DB::beginTransaction();
            if ($purchaseOrder->document_path) {
                Storage::delete($purchaseOrder->document_path);
            }
            $purchaseOrder->delete();
            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => 'Failed to delete purchase order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Submit order for review.
     */
    public function submitForReview(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['success' => false, 'error' => 'Only draft orders can be submitted for review.'], 400);
        }
        $purchaseOrder->update([
            'status' => 'pending_review',
            'approval_status' => 'pending'
        ]);
        return response()->json(['success' => true, 'order' => $purchaseOrder]);
    }

    /**
     * Approve the order.
     */
    public function approve(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->approval_status !== 'pending') {
            return response()->json(['success' => false, 'error' => 'Only pending orders can be approved.'], 400);
        }
        $validated = $request->validate([
            'approval_remarks' => ['nullable', 'string'],
        ]);
        $purchaseOrder->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'] ?? null,
            'status' => 'approved'
        ]);
        return response()->json(['success' => true, 'order' => $purchaseOrder]);
    }

    /**
     * Reject the order.
     */
    public function reject(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->approval_status !== 'pending') {
            return response()->json(['success' => false, 'error' => 'Only pending orders can be rejected.'], 400);
        }
        $validated = $request->validate([
            'approval_remarks' => ['required', 'string'],
        ]);
        $purchaseOrder->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'],
            'status' => 'rejected'
        ]);
        return response()->json(['success' => true, 'order' => $purchaseOrder]);
    }

    /**
     * Cancel the order.
     */
    public function cancel(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'pending_review', 'pending_approval'])) {
            return response()->json(['success' => false, 'error' => 'Only draft, pending review, or pending approval orders can be cancelled.'], 400);
        }
        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);
        $purchaseOrder->update([
            'status' => 'cancelled',
            'notes' => $validated['notes']
        ]);
        return response()->json(['success' => true, 'order' => $purchaseOrder]);
    }

    /**
     * Generate a unique PO number.
     */
    private function generatePoNumber(): string
    {
        $prefix = 'PO';
        $year = date('Y');
        $month = date('m');
        
        $lastOrder = PurchaseOrder::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastOrder) {
            $lastNumber = (int) substr($lastOrder->po_no, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }

    /**
     * API: List purchase orders (JSON, with filters, pagination, all fields/relations)
     */
    

    public function apiIndex(Request $request)
    {
        $query = PurchaseOrder::with(['vendor', 'department', 'creator', 'approver', 'items'])
            ->latest();

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->has('from_date')) {
            $query->where('po_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('po_date', '<=', $request->to_date);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_no', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate($request->get('per_page', 15));
        return response()->json($orders);
    }

    /**
     * API: Show a single purchase order (JSON, with all fields/relations/items)
     */
    public function apiShow($id)
    {
        $order = PurchaseOrder::with(['vendor', 'department', 'creator', 'approver', 'items'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * API: Store a new purchase order (JSON, all fields/items)
     */
    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'po_no' => ['nullable', 'string', 'unique:purchase_orders,po_no'],
            'purchase_intent_id' => ['nullable', 'exists:purchase_intents,id'],
            'vendor_id' => ['required', 'exists:vendors,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'po_date' => ['required', 'date'],
            'expected_delivery_date' => ['nullable', 'date'],
            'delivery_location' => ['nullable', 'string'],
            'payment_terms' => ['nullable', 'string'],
            'delivery_terms' => ['nullable', 'string'],
            'warranty_terms' => ['nullable', 'string'],
            'special_instructions' => ['nullable', 'string'],
            'total_amount' => ['required', 'numeric'],
            'tax_amount' => ['nullable', 'numeric'],
            'freight_amount' => ['nullable', 'numeric'],
            'insurance_amount' => ['nullable', 'numeric'],
            'grand_total' => ['required', 'numeric'],
            'currency' => ['required', 'string'],
            'exchange_rate' => ['nullable', 'numeric'],
            'quality_requirements' => ['nullable', 'string'],
            'inspection_requirements' => ['nullable', 'string'],
            'testing_requirements' => ['nullable', 'string'],
            'certification_requirements' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'approval_status' => ['nullable', 'string'],
            'approval_date' => ['nullable', 'date'],
            'sent_date' => ['nullable', 'date'],
            'acknowledgement_date' => ['nullable', 'date'],
            'cancellation_date' => ['nullable', 'date'],
            'cancellation_reason' => ['nullable', 'string'],
            'rejection_reason' => ['nullable', 'string'],
            'actual_delivery_date' => ['nullable', 'date'],
            'delivery_delay_days' => ['nullable', 'integer'],
            'delivery_remarks' => ['nullable', 'string'],
            'quality_remarks' => ['nullable', 'string'],
            'quotation_reference' => ['nullable', 'string'],
            'contract_reference' => ['nullable', 'string'],
            'project_reference' => ['nullable', 'string'],
            'items' => ['nullable', 'array'],
            'items.*.item_id' => ['nullable', 'exists:items,id'],
            'items.*.item_name' => ['required', 'string'],
            'items.*.item_code' => ['nullable', 'string'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.specifications' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'integer'],
            'items.*.unit' => ['nullable', 'string'],
            'items.*.unit_price' => ['required', 'numeric'],
            'items.*.total_price' => ['required', 'numeric'],
            'items.*.notes' => ['nullable', 'string'],
            'items.*.brand' => ['nullable', 'string'],
            'items.*.model' => ['nullable', 'string'],
            'items.*.warranty_period' => ['nullable', 'string'],
            'items.*.expected_delivery_date' => ['nullable', 'date'],
            'items.*.delivery_location' => ['nullable', 'string'],
            'items.*.quality_requirements' => ['nullable', 'string'],
            'items.*.inspection_requirements' => ['nullable', 'string'],
            'items.*.testing_requirements' => ['nullable', 'string'],
            'items.*.status' => ['nullable', 'string'],
            'items.*.received_quantity' => ['nullable', 'integer'],
            'items.*.received_date' => ['nullable', 'date'],
            'items.*.receipt_remarks' => ['nullable', 'string'],
        ]);

        try {
            DB::beginTransaction();
            $validated['po_no'] = $validated['po_no'] ?? $this->generatePoNumber();
            $validated['created_by'] = Auth::id();
            $order = PurchaseOrder::create($validated);
            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $order->items()->create($item);
                }
            }
            DB::commit();
            return response()->json($order->load(['vendor', 'department', 'creator', 'approver', 'items']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * API: Update a purchase order (JSON, all fields/items)
     */
    public function apiUpdate(Request $request, $id)
    {
        $order = PurchaseOrder::with('items')->findOrFail($id);
        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:vendors,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'po_date' => ['required', 'date'],
            'expected_delivery_date' => ['nullable', 'date'],
            'delivery_location' => ['nullable', 'string'],
            'payment_terms' => ['nullable', 'string'],
            'delivery_terms' => ['nullable', 'string'],
            'warranty_terms' => ['nullable', 'string'],
            'special_instructions' => ['nullable', 'string'],
            'total_amount' => ['required', 'numeric'],
            'tax_amount' => ['nullable', 'numeric'],
            'freight_amount' => ['nullable', 'numeric'],
            'insurance_amount' => ['nullable', 'numeric'],
            'grand_total' => ['required', 'numeric'],
            'currency' => ['required', 'string'],
            'exchange_rate' => ['nullable', 'numeric'],
            'quality_requirements' => ['nullable', 'string'],
            'inspection_requirements' => ['nullable', 'string'],
            'testing_requirements' => ['nullable', 'string'],
            'certification_requirements' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'approval_status' => ['nullable', 'string'],
            'approval_date' => ['nullable', 'date'],
            'sent_date' => ['nullable', 'date'],
            'acknowledgement_date' => ['nullable', 'date'],
            'cancellation_date' => ['nullable', 'date'],
            'cancellation_reason' => ['nullable', 'string'],
            'rejection_reason' => ['nullable', 'string'],
            'actual_delivery_date' => ['nullable', 'date'],
            'delivery_delay_days' => ['nullable', 'integer'],
            'delivery_remarks' => ['nullable', 'string'],
            'quality_remarks' => ['nullable', 'string'],
            'quotation_reference' => ['nullable', 'string'],
            'contract_reference' => ['nullable', 'string'],
            'project_reference' => ['nullable', 'string'],
            'items' => ['nullable', 'array'],
            'items.*.id' => ['nullable', 'exists:purchase_order_items,id'],
            'items.*.item_id' => ['nullable', 'exists:items,id'],
            'items.*.item_name' => ['required', 'string'],
            'items.*.item_code' => ['nullable', 'string'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.specifications' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'integer'],
            'items.*.unit' => ['nullable', 'string'],
            'items.*.unit_price' => ['required', 'numeric'],
            'items.*.total_price' => ['required', 'numeric'],
            'items.*.notes' => ['nullable', 'string'],
            'items.*.brand' => ['nullable', 'string'],
            'items.*.model' => ['nullable', 'string'],
            'items.*.warranty_period' => ['nullable', 'string'],
            'items.*.expected_delivery_date' => ['nullable', 'date'],
            'items.*.delivery_location' => ['nullable', 'string'],
            'items.*.quality_requirements' => ['nullable', 'string'],
            'items.*.inspection_requirements' => ['nullable', 'string'],
            'items.*.testing_requirements' => ['nullable', 'string'],
            'items.*.status' => ['nullable', 'string'],
            'items.*.received_quantity' => ['nullable', 'integer'],
            'items.*.received_date' => ['nullable', 'date'],
            'items.*.receipt_remarks' => ['nullable', 'string'],
        ]);
        try {
            DB::beginTransaction();
            $order->update($validated);
            if (isset($validated['items'])) {
                // Remove items not present in the update
                $existingIds = collect($validated['items'])->pluck('id')->filter()->all();
                $order->items()->whereNotIn('id', $existingIds)->delete();
                // Update or create items
                foreach ($validated['items'] as $itemData) {
                    if (isset($itemData['id'])) {
                        $order->items()->where('id', $itemData['id'])->update($itemData);
                    } else {
                        $order->items()->create($itemData);
                    }
                }
            }
            DB::commit();
            return response()->json($order->load(['vendor', 'department', 'creator', 'approver', 'items']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * API: Delete a purchase order (JSON)
     */
    public function apiDestroy($id)
    {
        $order = PurchaseOrder::findOrFail($id);
        try {
            $order->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * API: Workflow actions (submit, approve, reject, cancel)
     */
    public function apiSubmit($id)
    {
        $order = PurchaseOrder::findOrFail($id);
        if ($order->status !== 'draft') {
            return response()->json(['error' => 'Only draft orders can be submitted.'], 400);
        }
        $order->update(['status' => 'pending_review', 'approval_status' => 'pending']);
        return response()->json($order);
    }
    public function apiApprove(Request $request, $id)
    {
        $order = PurchaseOrder::findOrFail($id);
        if ($order->approval_status !== 'pending') {
            return response()->json(['error' => 'Only pending orders can be approved.'], 400);
        }
        $order->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'status' => 'approved',
            'approval_remarks' => $request->input('approval_remarks'),
        ]);
        return response()->json($order);
    }
    public function apiReject(Request $request, $id)
    {
        $order = PurchaseOrder::findOrFail($id);
        if ($order->approval_status !== 'pending') {
            return response()->json(['error' => 'Only pending orders can be rejected.'], 400);
        }
        $order->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'status' => 'rejected',
            'approval_remarks' => $request->input('approval_remarks'),
        ]);
        return response()->json($order);
    }
    public function apiCancel(Request $request, $id)
    {
        $order = PurchaseOrder::findOrFail($id);
        if (!in_array($order->status, ['draft', 'pending_review', 'pending_approval'])) {
            return response()->json(['error' => 'Only draft, pending review, or pending approval orders can be cancelled.'], 400);
        }
        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->input('cancellation_reason'),
        ]);
        return response()->json($order);
    }

    /**
     * Display the specified purchase order (Inertia, ERP fields).
     */
    public function show($id)
    {
        $order = PurchaseOrder::with(['vendor.contactDetails', 'department', 'creator', 'approver', 'items.item.category'])->findOrFail($id);
        $items = Item::where('status','active')->get();
        return Inertia::render('purchases/orders/show', [
            'order' => $order,
            'products' => $items
        ]);
    }
}
