<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PurchaseIntent;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PurchaseIntentController extends Controller
{
    /**
     * Display a listing of the purchase intents.
     */
    public function index(Request $request)
    {
        $query = PurchaseIntent::with(['creator', 'approver'])
            ->latest();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('intent_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('intent_date', '<=', $request->to_date);
        }

        // Search by intent number or subject
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('intent_no', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $intents = $query->paginate(10);

        return Inertia::render('purchases/purchase-intents/index', [
            'intents' => $intents
        ]);
    }

    /**
     * Store a newly created purchase intent in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['equipment', 'scaffolding', 'spares', 'consumables', 'other'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'intent_date' => ['required', 'date'],
            'required_date' => ['nullable', 'date', 'after_or_equal:intent_date'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'budget_details' => ['nullable', 'string'],
            'justification' => ['required', 'string'],
            'specifications' => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
            'specification_document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();

            // Generate intent number
            $validated['intent_no'] = $this->generateIntentNumber();
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'draft';
            $validated['approval_status'] = 'not_required';

            $intent = PurchaseIntent::create($validated);

            // Store documents if uploaded
            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('intent-documents');
                $intent->update(['document_path' => $path]);
            }

            if ($request->hasFile('specification_document')) {
                $path = $request->file('specification_document')->store('specification-documents');
                $intent->update(['specification_document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('purchase-intents.show', $intent)
                ->with('success', 'Purchase intent created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create purchase intent: ' . $e->getMessage());
        }
    }
 

    /**
     * Update the specified purchase intent in storage.
     */
    public function update(Request $request, PurchaseIntent $purchaseIntent)
    {
        if (!in_array($purchaseIntent->status, ['draft', 'pending_review'])) {
            return back()->with('error', 'Only draft or pending review intents can be updated.');
        }

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['equipment', 'scaffolding', 'spares', 'consumables', 'other'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'intent_date' => ['required', 'date'],
            'required_date' => ['nullable', 'date', 'after_or_equal:intent_date'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'budget_details' => ['nullable', 'string'],
            'justification' => ['required', 'string'],
            'specifications' => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
            'specification_document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();

            $purchaseIntent->update($validated);

            // Update documents if new ones are uploaded
            if ($request->hasFile('document')) {
                if ($purchaseIntent->document_path) {
                    Storage::delete($purchaseIntent->document_path);
                }
                $path = $request->file('document')->store('intent-documents');
                $purchaseIntent->update(['document_path' => $path]);
            }

            if ($request->hasFile('specification_document')) {
                if ($purchaseIntent->specification_document_path) {
                    Storage::delete($purchaseIntent->specification_document_path);
                }
                $path = $request->file('specification_document')->store('specification-documents');
                $purchaseIntent->update(['specification_document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('purchase-intents.show', $purchaseIntent)
                ->with('success', 'Purchase intent updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update purchase intent: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified purchase intent from storage.
     */
    public function destroy(PurchaseIntent $purchaseIntent)
    {
        if ($purchaseIntent->status !== 'draft') {
            return back()->with('error', 'Only draft intents can be deleted.');
        }

        try {
            DB::beginTransaction();

            // Delete associated documents
            if ($purchaseIntent->document_path) {
                Storage::delete($purchaseIntent->document_path);
            }
            if ($purchaseIntent->specification_document_path) {
                Storage::delete($purchaseIntent->specification_document_path);
            }

            $purchaseIntent->delete();

            DB::commit();

            return redirect()->route('purchase-intents.index')
                ->with('success', 'Purchase intent deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete purchase intent: ' . $e->getMessage());
        }
    }

    /**
     * Submit intent for review.
     */
    public function submitForReview(PurchaseIntent $purchaseIntent)
    {
        if ($purchaseIntent->status !== 'draft') {
            return back()->with('error', 'Only draft intents can be submitted for review.');
        }

        $purchaseIntent->update([
            'status' => 'pending_review',
            'approval_status' => 'pending'
        ]);

        return back()->with('success', 'Purchase intent submitted for review successfully.');
    }

    /**
     * Approve the intent.
     */
    public function approve(Request $request, PurchaseIntent $purchaseIntent)
    {
        if ($purchaseIntent->approval_status !== 'pending') {
            return back()->with('error', 'Only pending intents can be approved.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['nullable', 'string'],
        ]);

        $purchaseIntent->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'] ?? null,
            'status' => 'approved'
        ]);

        return back()->with('success', 'Purchase intent approved successfully.');
    }

    /**
     * Reject the intent.
     */
    public function reject(Request $request, PurchaseIntent $purchaseIntent)
    {
        if ($purchaseIntent->approval_status !== 'pending') {
            return back()->with('error', 'Only pending intents can be rejected.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['required', 'string'],
        ]);

        $purchaseIntent->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'],
            'status' => 'rejected'
        ]);

        return back()->with('success', 'Purchase intent rejected successfully.');
    }

    /**
     * Convert intent to purchase order.
     */
    public function convertToPurchaseOrder(PurchaseIntent $purchaseIntent)
    {
        if ($purchaseIntent->status !== 'approved') {
            return back()->with('error', 'Only approved intents can be converted to purchase orders.');
        }

        if ($purchaseIntent->purchaseOrders()->exists()) {
            return back()->with('error', 'This intent has already been converted to a purchase order.');
        }

        $purchaseIntent->update([
            'status' => 'converted',
            'converted_date' => now()
        ]);

        return redirect()->route('purchase-orders.create', ['intent_id' => $purchaseIntent->id])
            ->with('success', 'Purchase intent converted successfully. Please create the purchase order.');
    }

    /**
     * Cancel the intent.
     */
    public function cancel(Request $request, PurchaseIntent $purchaseIntent)
    {
        if (!in_array($purchaseIntent->status, ['draft', 'pending_review', 'pending_approval'])) {
            return back()->with('error', 'Only draft, pending review, or pending approval intents can be cancelled.');
        }

        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $purchaseIntent->update([
            'status' => 'cancelled',
            'notes' => $validated['notes']
        ]);

        return back()->with('success', 'Purchase intent cancelled successfully.');
    }

    /**
     * Generate a unique intent number.
     */
    private function generateIntentNumber(): string
    {
        $prefix = 'PI';
        $year = date('Y');
        $month = date('m');
        
        $lastIntent = PurchaseIntent::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastIntent) {
            $lastNumber = (int) substr($lastIntent->intent_no, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }
}
