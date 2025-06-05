<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\PurchaseOrder;
use App\Models\PurchaseIntent;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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

        return Inertia::render('purchases/orders/index', [
            'orders' => $orders,
            'vendors' => $vendors,
            'filters' => $request->only(['status', 'approval_status', 'vendor_id', 'from_date', 'to_date', 'search'])
        ]);
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

            // Generate PO number
            $validated['po_no'] = $this->generatePoNumber();
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'draft';
            $validated['approval_status'] = 'not_required';

            $order = PurchaseOrder::create($validated);

            // Store document if uploaded
            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('po-documents');
                $order->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('purchase-orders.show', $order)
                ->with('success', 'Purchase order created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create purchase order: ' . $e->getMessage());
        }
    }


    /**
     * Update the specified purchase order in storage.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'pending_review'])) {
            return back()->with('error', 'Only draft or pending review orders can be updated.');
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

            // Update document if new one is uploaded
            if ($request->hasFile('document')) {
                if ($purchaseOrder->document_path) {
                    Storage::delete($purchaseOrder->document_path);
                }
                $path = $request->file('document')->store('po-documents');
                $purchaseOrder->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('purchase-orders.show', $purchaseOrder)
                ->with('success', 'Purchase order updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update purchase order: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified purchase order from storage.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'draft') {
            return back()->with('error', 'Only draft orders can be deleted.');
        }

        try {
            DB::beginTransaction();

            // Delete associated document
            if ($purchaseOrder->document_path) {
                Storage::delete($purchaseOrder->document_path);
            }

            $purchaseOrder->delete();

            DB::commit();

            return redirect()->route('purchase-orders.index')
                ->with('success', 'Purchase order deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete purchase order: ' . $e->getMessage());
        }
    }

    /**
     * Submit order for review.
     */
    public function submitForReview(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'draft') {
            return back()->with('error', 'Only draft orders can be submitted for review.');
        }

        $purchaseOrder->update([
            'status' => 'pending_review',
            'approval_status' => 'pending'
        ]);

        return back()->with('success', 'Purchase order submitted for review successfully.');
    }

    /**
     * Approve the order.
     */
    public function approve(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->approval_status !== 'pending') {
            return back()->with('error', 'Only pending orders can be approved.');
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

        return back()->with('success', 'Purchase order approved successfully.');
    }

    /**
     * Reject the order.
     */
    public function reject(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->approval_status !== 'pending') {
            return back()->with('error', 'Only pending orders can be rejected.');
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

        return back()->with('success', 'Purchase order rejected successfully.');
    }

    /**
     * Cancel the order.
     */
    public function cancel(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['draft', 'pending_review', 'pending_approval'])) {
            return back()->with('error', 'Only draft, pending review, or pending approval orders can be cancelled.');
        }

        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $purchaseOrder->update([
            'status' => 'cancelled',
            'notes' => $validated['notes']
        ]);

        return back()->with('success', 'Purchase order cancelled successfully.');
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
}
