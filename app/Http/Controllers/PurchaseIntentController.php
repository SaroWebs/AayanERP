<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PurchaseIntent;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;

class PurchaseIntentController extends Controller
{
    /**
     * Display a listing of the purchase intents.
     */
    public function index(Request $request)
    {
        $query = PurchaseIntent::with(['creator', 'approver', 'department'])
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

        return Inertia::render('purchases/intents/index', [
            'intents' => $intents,
            'filters' => $request->only(['status', 'approval_status', 'type', 'priority', 'from_date', 'to_date', 'search'])
        ]);
    }

    /**
     * Get paginated list of purchase intents for AJAX requests.
     */
    public function paginatedList(Request $request)
    {
        $query = PurchaseIntent::with(['creator', 'approver', 'department'])
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by approval status
        if ($request->has('approval_status') && $request->approval_status !== '') {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority !== '') {
            $query->where('priority', $request->priority);
        }

        // Filter by department
        if ($request->has('department_id') && $request->department_id !== '') {
            $query->where('department_id', $request->department_id);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date !== '') {
            $query->where('intent_date', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date !== '') {
            $query->where('intent_date', '<=', $request->to_date);
        }

        // Search by intent number or subject
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('intent_no', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $intents = $query->paginate($request->get('per_page', 10));

        return response()->json($intents);
    }

    /**
     * Display the specified purchase intent.
     */
    public function show(PurchaseIntent $intent)
    {
        $intent->load(['creator', 'approver', 'department']);
        
        return Inertia::render('purchases/intents/show', [
            'intent' => $intent
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
            'department_id' => ['nullable', 'exists:departments,id'],
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

            return back()->with('success', 'Purchase intent created successfully.');
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
            'department_id' => ['nullable', 'exists:departments,id'],
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

            return back()->with('success', 'Purchase intent updated successfully.');
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

            return redirect()->route('purchases.intents.index')
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
    public function convertToPurchaseOrder(Request $request, PurchaseIntent $purchaseIntent)
    {
        if ($purchaseIntent->status !== 'approved') {
            return back()->with('error', 'Only approved intents can be converted to purchase orders.');
        }

        if ($purchaseIntent->purchaseOrders()->exists()) {
            return back()->with('error', 'This intent has already been converted to a purchase order.');
        }

        $validated = $request->validate([
            'vendor_id' => ['required', 'exists:vendors,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'po_date' => ['required', 'date'],
            'expected_delivery_date' => ['required', 'date', 'after_or_equal:po_date'],
            'delivery_location' => ['required', 'string', 'max:255'],
            'payment_terms' => ['required', 'string', 'max:255'],
            'delivery_terms' => ['required', 'string', 'max:255'],
            'warranty_terms' => ['nullable', 'string'],
            'special_instructions' => ['nullable', 'string'],
            'quality_requirements' => ['nullable', 'string'],
            'inspection_requirements' => ['nullable', 'string'],
            'testing_requirements' => ['nullable', 'string'],
            'certification_requirements' => ['nullable', 'string'],
            'quotation_reference' => ['nullable', 'string', 'max:255'],
            'contract_reference' => ['nullable', 'string', 'max:255'],
            'project_reference' => ['nullable', 'string', 'max:255'],
            'currency' => ['required', 'string', 'size:3'],
            'exchange_rate' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['required', 'numeric', 'min:0'],
            'freight_amount' => ['required', 'numeric', 'min:0'],
            'insurance_amount' => ['required', 'numeric', 'min:0'],
            'grand_total' => ['required', 'numeric', 'min:0'],
            
            // Items validation
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_name' => ['required', 'string', 'max:255'],
            'items.*.item_code' => ['nullable', 'string', 'max:100'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.specifications' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.total_price' => ['required', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string'],
            'items.*.brand' => ['nullable', 'string', 'max:255'],
            'items.*.model' => ['nullable', 'string', 'max:255'],
            'items.*.warranty_period' => ['nullable', 'string', 'max:255'],
            'items.*.expected_delivery_date' => ['nullable', 'date'],
            'items.*.delivery_location' => ['nullable', 'string', 'max:255'],
            'items.*.quality_requirements' => ['nullable', 'string'],
            'items.*.inspection_requirements' => ['nullable', 'string'],
            'items.*.testing_requirements' => ['nullable', 'string'],
            'items.*.item_id' => ['nullable', 'exists:items,id'],
        ]);

        try {
            DB::beginTransaction();

            // Generate PO number
            $poNumber = $this->generatePONumber();

            // Create purchase order
            $purchaseOrder = PurchaseOrder::create([
                'po_no' => $poNumber,
                'purchase_intent_id' => $purchaseIntent->id,
                'vendor_id' => $validated['vendor_id'],
                'department_id' => $validated['department_id'],
                'created_by' => Auth::id(),
                'po_date' => $validated['po_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'],
                'delivery_location' => $validated['delivery_location'],
                'payment_terms' => $validated['payment_terms'],
                'delivery_terms' => $validated['delivery_terms'],
                'warranty_terms' => $validated['warranty_terms'],
                'special_instructions' => $validated['special_instructions'],
                'quality_requirements' => $validated['quality_requirements'],
                'inspection_requirements' => $validated['inspection_requirements'],
                'testing_requirements' => $validated['testing_requirements'],
                'certification_requirements' => $validated['certification_requirements'],
                'quotation_reference' => $validated['quotation_reference'],
                'contract_reference' => $validated['contract_reference'],
                'project_reference' => $validated['project_reference'],
                'currency' => $validated['currency'],
                'exchange_rate' => $validated['exchange_rate'],
                'tax_amount' => $validated['tax_amount'],
                'freight_amount' => $validated['freight_amount'],
                'insurance_amount' => $validated['insurance_amount'],
                'grand_total' => $validated['grand_total'],
                'total_amount' => $validated['grand_total'] - $validated['tax_amount'] - $validated['freight_amount'] - $validated['insurance_amount'],
                'status' => 'draft',
                'approval_status' => 'not_required',
            ]);

            // Create purchase order items
            foreach ($validated['items'] as $itemData) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'item_id' => $itemData['item_id'] ?? null,
                    'item_name' => $itemData['item_name'],
                    'item_code' => $itemData['item_code'],
                    'description' => $itemData['description'],
                    'specifications' => $itemData['specifications'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'],
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['total_price'],
                    'notes' => $itemData['notes'],
                    'brand' => $itemData['brand'],
                    'model' => $itemData['model'],
                    'warranty_period' => $itemData['warranty_period'],
                    'expected_delivery_date' => $itemData['expected_delivery_date'],
                    'delivery_location' => $itemData['delivery_location'],
                    'quality_requirements' => $itemData['quality_requirements'],
                    'inspection_requirements' => $itemData['inspection_requirements'],
                    'testing_requirements' => $itemData['testing_requirements'],
                    'status' => 'pending',
                ]);
            }

            // Update purchase intent status
            $purchaseIntent->update([
                'status' => 'converted',
                'converted_date' => now()
            ]);

            DB::commit();

            return redirect()->route('purchases.orders.show', $purchaseOrder->id)
                ->with('success', 'Purchase order created successfully from intent.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create purchase order: ' . $e->getMessage());
        }
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

    /**
     * Generate a unique purchase order number.
     */
    private function generatePONumber(): string
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
