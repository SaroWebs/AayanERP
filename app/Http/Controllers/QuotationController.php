<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use App\Models\Quotation;
use Illuminate\Http\Request;
use App\Models\ClientDetail;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class QuotationController extends Controller
{
    /**
     * Display a listing of the quotations.
     */
    public function index(Request $request)
    {
        $query = Quotation::with(['enquiry', 'client', 'creator', 'approver'])
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
            $query->where('client_id', $request->client_id);
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
        $clients = ClientDetail::where('status', 'active')->get();

        return Inertia::render('sales/quotations/index', [
            'quotations' => $quotations,
            'clients' => $clients,
            'filters' => $request->only(['status', 'approval_status', 'client_id', 'from_date', 'to_date', 'search'])
        ]);
    }


    /**
     * Store a newly created quotation in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'enquiry_id' => ['nullable', 'exists:enquiries,id'],
            'client_id' => ['required', 'exists:clients,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quotation_date' => ['required', 'date'],
            'valid_until' => ['required', 'date', 'after:quotation_date'],
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

            // Generate quotation number
            $validated['quotation_no'] = $this->generateQuotationNumber();
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'draft';
            $validated['approval_status'] = 'not_required';

            $quotation = Quotation::create($validated);

            // Store document if uploaded
            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('quotation-documents');
                $quotation->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create quotation: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified quotation in storage.
     */
    public function update(Request $request, Quotation $quotation)
    {
        if (!in_array($quotation->status, ['draft', 'pending_review'])) {
            return back()->with('error', 'Only draft or pending review quotations can be updated.');
        }

        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quotation_date' => ['required', 'date'],
            'valid_until' => ['required', 'date', 'after:quotation_date'],
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

            $quotation->update($validated);

            // Update document if new one is uploaded
            if ($request->hasFile('document')) {
                if ($quotation->document_path) {
                    Storage::delete($quotation->document_path);
                }
                $path = $request->file('document')->store('quotation-documents');
                $quotation->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('quotations.show', $quotation)
                ->with('success', 'Quotation updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update quotation: ' . $e->getMessage());
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

            return redirect()->route('quotations.index')
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

        return redirect()->route('sales-orders.create', ['quotation_id' => $quotation->id])
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
