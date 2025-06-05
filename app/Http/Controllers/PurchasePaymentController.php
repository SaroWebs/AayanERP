<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\PurchasePayment;
use App\Models\PurchaseOrder;
use App\Models\GoodsReceiptNote;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PurchasePaymentController extends Controller
{
    /**
     * Display a listing of the purchase payments.
     */
    public function index(Request $request)
    {
        $query = PurchasePayment::with(['purchaseOrder', 'goodsReceiptNote', 'vendor', 'creator', 'approver', 'receiver'])
            ->latest();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by payment mode
        if ($request->has('payment_mode')) {
            $query->where('payment_mode', $request->payment_mode);
        }

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        // Search by payment number or reference
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payment_no', 'like', "%{$search}%")
                    ->orWhere('reference_no', 'like', "%{$search}%");
            });
        }

        $payments = $query->paginate(10)->withQueryString();
        $vendors = Vendor::where('status', 'active')->get();

        return Inertia::render('purchases/payments/index', [
            'payments' => $payments,
            'vendors' => $vendors,
            'filters' => $request->only(['status', 'approval_status', 'payment_mode', 'vendor_id', 'from_date', 'to_date', 'search'])
        ]);
    }


    /**
     * Store a newly created purchase payment in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'goods_receipt_note_id' => ['nullable', 'exists:goods_receipt_notes,id'],
            'vendor_id' => ['required', 'exists:vendors,id'],
            'type' => ['required', Rule::in(['advance', 'partial', 'final'])],
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'payment_mode' => ['required', Rule::in(['cash', 'bank_transfer', 'cheque', 'other'])],
            'reference_no' => ['nullable', 'string', 'max:255'],
            'cheque_no' => ['required_if:payment_mode,cheque', 'string', 'max:255'],
            'cheque_date' => ['required_if:payment_mode,cheque', 'date'],
            'bank_name' => ['required_if:payment_mode,cheque,bank_transfer', 'string', 'max:255'],
            'account_no' => ['required_if:payment_mode,cheque,bank_transfer', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();

            // Generate payment number
            $validated['payment_no'] = $this->generatePaymentNumber();
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'pending';
            $validated['approval_status'] = 'pending';

            $payment = PurchasePayment::create($validated);

            // Store document if uploaded
            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('payment-documents');
                $payment->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('purchase-payments.show', $payment)
                ->with('success', 'Purchase payment created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create purchase payment: ' . $e->getMessage());
        }
    }


    /**
     * Update the specified purchase payment in storage.
     */
    public function update(Request $request, PurchasePayment $payment)
    {
        if (!in_array($payment->status, ['pending', 'pending_review'])) {
            return back()->with('error', 'Only pending payments can be updated.');
        }

        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:vendors,id'],
            'type' => ['required', Rule::in(['advance', 'partial', 'final'])],
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'payment_mode' => ['required', Rule::in(['cash', 'bank_transfer', 'cheque', 'other'])],
            'reference_no' => ['nullable', 'string', 'max:255'],
            'cheque_no' => ['required_if:payment_mode,cheque', 'string', 'max:255'],
            'cheque_date' => ['required_if:payment_mode,cheque', 'date'],
            'bank_name' => ['required_if:payment_mode,cheque,bank_transfer', 'string', 'max:255'],
            'account_no' => ['required_if:payment_mode,cheque,bank_transfer', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();

            $payment->update($validated);

            // Update document if new one is uploaded
            if ($request->hasFile('document')) {
                if ($payment->document_path) {
                    Storage::delete($payment->document_path);
                }
                $path = $request->file('document')->store('payment-documents');
                $payment->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('purchase-payments.show', $payment)
                ->with('success', 'Purchase payment updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update purchase payment: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified purchase payment from storage.
     */
    public function destroy(PurchasePayment $payment)
    {
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Only pending payments can be deleted.');
        }

        try {
            DB::beginTransaction();

            // Delete associated document
            if ($payment->document_path) {
                Storage::delete($payment->document_path);
            }

            $payment->delete();

            DB::commit();

            return redirect()->route('purchase-payments.index')
                ->with('success', 'Purchase payment deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete purchase payment: ' . $e->getMessage());
        }
    }

    /**
     * Approve the payment.
     */
    public function approve(Request $request, PurchasePayment $payment)
    {
        if ($payment->approval_status !== 'pending') {
            return back()->with('error', 'Only pending payments can be approved.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['nullable', 'string'],
        ]);

        $payment->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'] ?? null,
            'status' => 'approved'
        ]);

        return back()->with('success', 'Purchase payment approved successfully.');
    }

    /**
     * Reject the payment.
     */
    public function reject(Request $request, PurchasePayment $payment)
    {
        if ($payment->approval_status !== 'pending') {
            return back()->with('error', 'Only pending payments can be rejected.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['required', 'string'],
        ]);

        $payment->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'],
            'status' => 'rejected'
        ]);

        return back()->with('success', 'Purchase payment rejected successfully.');
    }

    /**
     * Mark payment as received.
     */
    public function markAsReceived(Request $request, PurchasePayment $payment)
    {
        if ($payment->status !== 'approved') {
            return back()->with('error', 'Only approved payments can be marked as received.');
        }

        $validated = $request->validate([
            'received_date' => ['required', 'date'],
            'receipt_remarks' => ['nullable', 'string'],
        ]);

        $payment->update([
            'status' => 'received',
            'received_date' => $validated['received_date'],
            'received_by' => Auth::id(),
            'receipt_remarks' => $validated['receipt_remarks'] ?? null
        ]);

        return back()->with('success', 'Payment marked as received successfully.');
    }

    /**
     * Mark payment as bounced.
     */
    public function markAsBounced(Request $request, PurchasePayment $payment)
    {
        if ($payment->status !== 'received') {
            return back()->with('error', 'Only received payments can be marked as bounced.');
        }

        $validated = $request->validate([
            'bounce_date' => ['required', 'date'],
            'bounce_reason' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment->update([
            'status' => 'bounced',
            'bounce_date' => $validated['bounce_date'],
            'bounce_reason' => $validated['bounce_reason'],
            'notes' => $validated['notes'] ?? null
        ]);

        return back()->with('success', 'Payment marked as bounced successfully.');
    }

    /**
     * Cancel the payment.
     */
    public function cancel(Request $request, PurchasePayment $payment)
    {
        if (!in_array($payment->status, ['pending', 'pending_review'])) {
            return back()->with('error', 'Only pending payments can be cancelled.');
        }

        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $payment->update([
            'status' => 'cancelled',
            'notes' => $validated['notes']
        ]);

        return back()->with('success', 'Payment cancelled successfully.');
    }

    /**
     * Generate a unique payment number.
     */
    private function generatePaymentNumber(): string
    {
        $prefix = 'PP';
        $year = date('Y');
        $month = date('m');
        
        $lastPayment = PurchasePayment::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastPayment) {
            $lastNumber = (int) substr($lastPayment->payment_no, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }
}
