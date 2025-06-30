<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Inertia\Inertia;
use App\Models\Enquiry;
use App\Models\Quotation;
use App\Models\ClientDetail;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class QuotationController extends Controller
{
    /**
     * Display a listing of the quotations.
     */
    public function index(Request $request)
    {
        $query = Quotation::with(['enquiry', 'client', 'contactPerson', 'creator', 'approver', 'items.item'])
            ->latest();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by client
        if ($request->has('client_id')) {
            $query->where('client_detail_id', $request->client_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('quotation_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('quotation_date', '<=', $request->to_date);
        }

        // Search by quotation number or subject
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quotation_no', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $quotations = $query->paginate(10)->withQueryString();
        $clients = ClientDetail::with('contactDetails')->get();
        $items = Item::get();

        return Inertia::render('sales/quotations/index', [
            'quotations' => $quotations,
            'clients' => $clients,
            'items' => $items,
            'filters' => $request->only(['status', 'approval_status', 'client_id', 'from_date', 'to_date', 'search'])
        ]);
    }

    public function show(Request $request, Quotation $quotation)
    {
        $quotation->load(['enquiry', 'client', 'contactPerson', 'creator', 'approver', 'items.item']);

        return Inertia::render('sales/quotations/show', [
            'quotation' => $quotation,
        ]);
    }

    /**
     * Store a newly created quotation in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_detail_id' => ['required', 'exists:client_details,id'],
            'contact_person_id' => ['nullable', 'exists:client_contact_details,id'],
            'enquiry_id' => ['nullable', 'exists:enquiries,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quotation_date' => ['required', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:quotation_date'],
            'currency' => ['required', 'string', 'size:3'],
            'subtotal' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'tax_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'tax_amount' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'total_amount' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'payment_terms_days' => ['required', 'integer', 'min:0'],
            'advance_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'payment_terms' => ['nullable', 'string'],
            'delivery_terms' => ['nullable', 'string'],
            'deployment_state' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'site_details' => ['nullable', 'string'],
            'special_conditions' => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'client_remarks' => ['nullable', 'string'],
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Set default values
            $data = $request->except('items');
            $data['discount_percentage'] = $data['discount_percentage'] ?? 0;
            $data['discount_amount'] = $data['discount_amount'] ?? 0;

            // Create quotation
            $quotation = Quotation::create([
                'quotation_no' => $this->generateQuotationNumber(),
                'created_by' => Auth::id(),
                ...$data
            ]);

            // Create quotation items
            foreach ($request->items as $item) {
                $quotation->items()->create($item);
            }

            DB::commit();

            return response()->json([
                'message' => 'Quotation created successfully',
                'quotation' => $quotation->load(['enquiry', 'client', 'contactPerson', 'creator', 'items.item'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create quotation', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified quotation in storage.
     */
    public function update(Request $request, Quotation $quotation)
    {
        $validated = $request->validate([
            'client_detail_id' => ['required', 'exists:client_details,id'],
            'contact_person_id' => ['nullable', 'exists:client_contact_details,id'],
            'enquiry_id' => ['nullable', 'exists:enquiries,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quotation_date' => ['required', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:quotation_date'],
            'currency' => ['required', 'string', 'size:3'],
            'subtotal' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'tax_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'tax_amount' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'total_amount' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'payment_terms_days' => ['required', 'integer', 'min:0'],
            'advance_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'payment_terms' => ['nullable', 'string'],
            'delivery_terms' => ['nullable', 'string'],
            'deployment_state' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'site_details' => ['nullable', 'string'],
            'special_conditions' => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'client_remarks' => ['nullable', 'string'],
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:quotation_items,id',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Set default values
            $data = $request->except('items');
            $data['discount_percentage'] = $data['discount_percentage'] ?? 0;
            $data['discount_amount'] = $data['discount_amount'] ?? 0;

            // Update quotation
            $quotation->update($data);

            // Update quotation items
            $existingItemIds = $quotation->items()->pluck('id')->toArray();
            $updatedItemIds = [];

            foreach ($request->items as $item) {
                if (isset($item['id'])) {
                    // Update existing item
                    $quotation->items()->where('id', $item['id'])->update($item);
                    $updatedItemIds[] = $item['id'];
                } else {
                    // Create new item
                    $newItem = $quotation->items()->create($item);
                    $updatedItemIds[] = $newItem->id;
                }
            }

            // Delete items that are no longer in the list
            $itemsToDelete = array_diff($existingItemIds, $updatedItemIds);
            if (!empty($itemsToDelete)) {
                $quotation->items()->whereIn('id', $itemsToDelete)->delete();
            }

            DB::commit();

            return response()->json([
                'message' => 'Quotation updated successfully',
                'quotation' => $quotation->load(['enquiry', 'client', 'contactPerson', 'creator', 'items.item'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update quotation', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified quotation from storage.
     */
    public function destroy(Quotation $quotation)
    {
        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Only draft quotations can be deleted.');
        }

        try {
            DB::beginTransaction();

            // Delete associated document
            if ($quotation->document_path) {
                Storage::delete($quotation->document_path);
            }

            $quotation->delete();

            DB::commit();

            return redirect()->route('sales.quotations.index')
                ->with('success', 'Quotation deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete quotation: ' . $e->getMessage());
        }
    }

    /**
     * Submit quotation for review.
     */
    public function submitForReview(Quotation $quotation)
    {
        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Only draft quotations can be submitted for review.');
        }

        $quotation->update([
            'status' => 'pending_review',
            'approval_status' => 'pending'
        ]);

        return back()->with('success', 'Quotation submitted for review successfully.');
    }

    /**
     * Approve the quotation.
     */
    public function approve(Request $request, Quotation $quotation)
    {
        if ($quotation->approval_status !== 'pending') {
            return back()->with('error', 'Only pending quotations can be approved.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['nullable', 'string'],
        ]);

        $quotation->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'] ?? null,
            'status' => 'approved'
        ]);

        return back()->with('success', 'Quotation approved successfully.');
    }

    /**
     * Reject the quotation.
     */
    public function reject(Request $request, Quotation $quotation)
    {
        if ($quotation->approval_status !== 'pending') {
            return back()->with('error', 'Only pending quotations can be rejected.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['required', 'string'],
        ]);

        $quotation->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'],
            'status' => 'rejected'
        ]);

        return back()->with('success', 'Quotation rejected successfully.');
    }

    /**
     * Convert quotation to sales order.
     */
    public function convertToSalesOrder(Quotation $quotation)
    {
        if ($quotation->status !== 'approved') {
            return back()->with('error', 'Only approved quotations can be converted to sales orders.');
        }

        if ($quotation->salesOrders()->exists()) {
            return back()->with('error', 'This quotation has already been converted to a sales order.');
        }

        $quotation->update([
            'status' => 'converted',
            'converted_date' => now()
        ]);

        return redirect()->route('sales.orders.create', ['quotation_id' => $quotation->id])
            ->with('success', 'Quotation converted successfully. Please create the sales order.');
    }

    /**
     * Cancel the quotation.
     */
    public function cancel(Request $request, Quotation $quotation)
    {
        if (!in_array($quotation->status, ['draft', 'pending_review', 'pending_approval'])) {
            return back()->with('error', 'Only draft, pending review, or pending approval quotations can be cancelled.');
        }

        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $quotation->update([
            'status' => 'cancelled',
            'notes' => $validated['notes']
        ]);

        return back()->with('success', 'Quotation cancelled successfully.');
    }

    /**
     * Generate a unique quotation number.
     */
    private function generateQuotationNumber(): string
    {
        $prefix = 'QT';
        $year = date('Y');
        $month = date('m');

        $lastQuotation = Quotation::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastQuotation) {
            $lastNumber = (int) substr($lastQuotation->quotation_no, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }
}
