<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use Illuminate\Validation\Rule;
use App\Models\GoodsReceiptNote;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GoodsReceiptNoteController extends Controller
{
    /**
     * Display a listing of the GRNs.
     */
    public function index(Request $request)
    {
        $query = GoodsReceiptNote::with(['purchaseOrder', 'vendor', 'creator', 'approver', 'receiver', 'inspector'])
            ->latest();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by quality status
        if ($request->has('quality_status')) {
            $query->where('quality_status', $request->quality_status);
        }

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('grn_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('grn_date', '<=', $request->to_date);
        }

        // Search by GRN number
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('grn_no', 'like', "%{$search}%");
        }

        $grns = $query->paginate(10)->withQueryString();
        $vendors = Vendor::where('status', 'active')->get();
        $purchaseOrders = PurchaseOrder::where('status', 'approved')
            ->whereDoesntHave('goodsReceiptNotes', function ($query) {
                $query->where('status', '!=', 'cancelled');
            })
            ->get();

        return Inertia::render('purchases/grns/index', [
            'grns' => $grns,
            'vendors' => $vendors,
            'purchaseOrders' => $purchaseOrders,
            'filters' => $request->only(['status', 'approval_status', 'quality_status', 'vendor_id', 'from_date', 'to_date', 'search'])
        ]);
    }

    /**
     * Store a newly created GRN in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'vendor_id' => ['required', 'exists:vendors,id'],
            'type' => ['required', Rule::in(['full', 'partial', 'return'])],
            'grn_date' => ['required', 'date'],
            'challan_no' => ['nullable', 'string', 'max:255'],
            'challan_date' => ['nullable', 'date'],
            'transport_mode' => ['nullable', 'string', 'max:255'],
            'vehicle_number' => ['nullable', 'string', 'max:255'],
            'transporter_name' => ['nullable', 'string', 'max:255'],
            'driver_name' => ['nullable', 'string', 'max:255'],
            'driver_phone' => ['nullable', 'string', 'max:255'],
            'total_items' => ['required', 'integer', 'min:0'],
            'received_items' => ['required', 'integer', 'min:0', 'lte:total_items'],
            'receipt_remarks' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'vendor_remarks' => ['nullable', 'string'],
        ]);

        try {
            DB::beginTransaction();

            // Generate GRN number
            $validated['grn_no'] = $this->generateGrnNumber();
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'draft';
            $validated['approval_status'] = 'not_required';
            $validated['quality_status'] = 'pending';

            $grn = GoodsReceiptNote::create($validated);

            // Generate and store GRN document
            if ($request->hasFile('grn_document')) {
                $path = $request->file('grn_document')->store('grn-documents');
                $grn->update(['grn_document_path' => $path]);
            }

            DB::commit();

            return response()->json([
                'message' => 'GRN created successfully',
                'grn' => $grn
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create GRN',
                'error' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Update the specified GRN in storage.
     */
    public function update(Request $request, GoodsReceiptNote $grn)
    {
        if (!in_array($grn->status, ['draft', 'pending_review'])) {
            return back()->with('error', 'Only draft or pending review GRNs can be updated.');
        }

        $validated = $request->validate([
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'vendor_id' => ['required', 'exists:vendors,id'],
            'type' => ['required', Rule::in(['full', 'partial', 'return'])],
            'grn_date' => ['required', 'date'],
            'challan_no' => ['nullable', 'string', 'max:255'],
            'challan_date' => ['nullable', 'date'],
            'transport_mode' => ['nullable', 'string', 'max:255'],
            'vehicle_number' => ['nullable', 'string', 'max:255'],
            'transporter_name' => ['nullable', 'string', 'max:255'],
            'driver_name' => ['nullable', 'string', 'max:255'],
            'driver_phone' => ['nullable', 'string', 'max:255'],
            'total_items' => ['required', 'integer', 'min:0'],
            'received_items' => ['required', 'integer', 'min:0', 'lte:total_items'],
            'receipt_remarks' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'vendor_remarks' => ['nullable', 'string'],
        ]);

        try {
            DB::beginTransaction();

            $grn->update($validated);

            // Update GRN document if new one is uploaded
            if ($request->hasFile('grn_document')) {
                // Delete old document if exists
                if ($grn->grn_document_path) {
                    Storage::delete($grn->grn_document_path);
                }
                $path = $request->file('grn_document')->store('grn-documents');
                $grn->update(['grn_document_path' => $path]);
            }

            DB::commit();

            return redirect()->back()
                ->with('success', 'GRN updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update GRN: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified GRN from storage.
     */
    public function destroy(GoodsReceiptNote $grn)
    {
        if ($grn->status !== 'draft') {
            return back()->with('error', 'Only draft GRNs can be deleted.');
        }

        try {
            DB::beginTransaction();

            // Delete associated documents
            if ($grn->grn_document_path) {
                Storage::delete($grn->grn_document_path);
            }
            if ($grn->inspection_report_path) {
                Storage::delete($grn->inspection_report_path);
            }
            if ($grn->return_document_path) {
                Storage::delete($grn->return_document_path);
            }

            $grn->delete();

            DB::commit();

            return redirect()->route('grns.index')
                ->with('success', 'GRN deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete GRN: ' . $e->getMessage());
        }
    }

    /**
     * Submit GRN for review.
     */
    public function submitForReview(GoodsReceiptNote $grn)
    {
        if ($grn->status !== 'draft') {
            return back()->with('error', 'Only draft GRNs can be submitted for review.');
        }

        $grn->update([
            'status' => 'pending_review',
            'approval_status' => 'pending'
        ]);

        return back()->with('success', 'GRN submitted for review successfully.');
    }

    /**
     * Approve the GRN.
     */
    public function approve(Request $request, GoodsReceiptNote $grn)
    {
        if ($grn->approval_status !== 'pending') {
            return back()->with('error', 'Only pending GRNs can be approved.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['nullable', 'string'],
        ]);

        $grn->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'] ?? null,
            'status' => 'approved'
        ]);

        return back()->with('success', 'GRN approved successfully.');
    }

    /**
     * Reject the GRN.
     */
    public function reject(Request $request, GoodsReceiptNote $grn)
    {
        if ($grn->approval_status !== 'pending') {
            return back()->with('error', 'Only pending GRNs can be rejected.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['required', 'string'],
        ]);

        $grn->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'],
            'status' => 'cancelled'
        ]);

        return back()->with('success', 'GRN rejected successfully.');
    }

    /**
     * Mark goods as received.
     */
    public function markAsReceived(Request $request, GoodsReceiptNote $grn)
    {
        if ($grn->status !== 'approved') {
            return back()->with('error', 'Only approved GRNs can be marked as received.');
        }

        $validated = $request->validate([
            'received_date' => ['required', 'date'],
            'receipt_remarks' => ['nullable', 'string'],
        ]);

        $grn->update([
            'status' => 'received',
            'received_date' => $validated['received_date'],
            'received_by' => Auth::id(),
            'receipt_remarks' => $validated['receipt_remarks'] ?? null
        ]);

        return back()->with('success', 'Goods marked as received successfully.');
    }

    /**
     * Complete inspection of goods.
     */
    public function completeInspection(Request $request, GoodsReceiptNote $grn)
    {
        if ($grn->status !== 'received') {
            return back()->with('error', 'Only received GRNs can be inspected.');
        }

        $validated = $request->validate([
            'inspection_date' => ['required', 'date'],
            'quality_status' => ['required', Rule::in(['passed', 'failed', 'conditional'])],
            'quality_remarks' => ['nullable', 'string'],
            'inspection_remarks' => ['nullable', 'string'],
            'rejection_reason' => ['required_if:quality_status,failed', 'string'],
            'inspection_report' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();

            $grn->update([
                'status' => 'inspected',
                'inspection_date' => $validated['inspection_date'],
                'inspected_by' => Auth::id(),
                'quality_status' => $validated['quality_status'],
                'quality_remarks' => $validated['quality_remarks'] ?? null,
                'inspection_remarks' => $validated['inspection_remarks'] ?? null,
                'rejection_reason' => $validated['rejection_reason'] ?? null,
            ]);

            // Store inspection report if uploaded
            if ($request->hasFile('inspection_report')) {
                if ($grn->inspection_report_path) {
                    Storage::delete($grn->inspection_report_path);
                }
                $path = $request->file('inspection_report')->store('inspection-reports');
                $grn->update(['inspection_report_path' => $path]);
            }

            // Update status based on quality check
            if ($validated['quality_status'] === 'passed') {
                $grn->update([
                    'status' => 'accepted',
                    'accepted_items' => $grn->received_items
                ]);
            } elseif ($validated['quality_status'] === 'failed') {
                $grn->update([
                    'status' => 'rejected',
                    'rejected_items' => $grn->received_items
                ]);
            }

            DB::commit();

            return back()->with('success', 'Inspection completed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to complete inspection: ' . $e->getMessage());
        }
    }

    /**
     * Return goods to vendor.
     */
    public function returnGoods(Request $request, GoodsReceiptNote $grn)
    {
        if (!in_array($grn->status, ['rejected', 'inspected'])) {
            return back()->with('error', 'Only rejected or inspected GRNs can be returned.');
        }

        $validated = $request->validate([
            'return_date' => ['required', 'date'],
            'return_document' => ['nullable', 'file', 'max:10240'], // 10MB max
            'notes' => ['nullable', 'string'],
        ]);

        try {
            DB::beginTransaction();

            $grn->update([
                'status' => 'returned',
                'return_date' => $validated['return_date'],
                'returned_items' => $grn->rejected_items,
                'notes' => $validated['notes'] ?? null
            ]);

            // Store return document if uploaded
            if ($request->hasFile('return_document')) {
                if ($grn->return_document_path) {
                    Storage::delete($grn->return_document_path);
                }
                $path = $request->file('return_document')->store('return-documents');
                $grn->update(['return_document_path' => $path]);
            }

            DB::commit();

            return back()->with('success', 'Goods marked as returned successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to mark goods as returned: ' . $e->getMessage());
        }
    }

    /**
     * Cancel the GRN.
     */
    public function cancel(Request $request, GoodsReceiptNote $grn)
    {
        if (!in_array($grn->status, ['draft', 'pending_review', 'pending_approval'])) {
            return back()->with('error', 'Only draft, pending review, or pending approval GRNs can be cancelled.');
        }

        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $grn->update([
            'status' => 'cancelled',
            'notes' => $validated['notes']
        ]);

        return back()->with('success', 'GRN cancelled successfully.');
    }

    /**
     * Generate a unique GRN number.
     */
    private function generateGrnNumber(): string
    {
        $prefix = 'GRN';
        $year = date('Y');
        $month = date('m');
        
        $lastGrn = GoodsReceiptNote::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastGrn) {
            $lastNumber = (int) substr($lastGrn->grn_no, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }
}
