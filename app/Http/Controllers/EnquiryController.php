<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use App\Models\ClientDetail;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EnquiryController extends Controller
{
    /**
     * Display a listing of the enquiries.
     */
    public function index(Request $request)
    {
        $query = Enquiry::with(['client', 'creator', 'approver'])
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
            $query->where('enquiry_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('enquiry_date', '<=', $request->to_date);
        }

        // Search by enquiry number or subject
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('enquiry_no', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $enquiries = $query->paginate(10)->withQueryString();
        $clients = ClientDetail::where('status', 'active')->get();

        return Inertia::render('sales/enquiries/index', [
            'enquiries' => $enquiries,
            'clients' => $clients,
            'filters' => $request->only(['status', 'approval_status', 'client_id', 'from_date', 'to_date', 'search'])
        ]);
    }

    /**
     * Show the form for creating a new enquiry.
     */
    public function create()
    {
        $clients = ClientDetail::where('status', 'active')->get();
        return Inertia::render('sales/enquiries/create', [
            'clients' => $clients
        ]);
    }

    /**
     * Store a newly created enquiry in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'enquiry_date' => ['required', 'date'],
            'required_date' => ['nullable', 'date', 'after_or_equal:enquiry_date'],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'source' => ['required', Rule::in(['email', 'phone', 'website', 'walk_in', 'other'])],
            'specifications' => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();

            // Generate enquiry number
            $validated['enquiry_no'] = $this->generateEnquiryNumber();
            $validated['created_by'] = Auth::id();
            $validated['status'] = 'draft';
            $validated['approval_status'] = 'not_required';

            $enquiry = Enquiry::create($validated);

            // Store document if uploaded
            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('enquiry-documents');
                $enquiry->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('enquiries.show', $enquiry)
                ->with('success', 'Enquiry created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create enquiry: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified enquiry.
     */
    public function show(Enquiry $enquiry)
    {
        $enquiry->load(['client', 'creator', 'approver', 'quotations']);
        return Inertia::render('sales/enquiries/show', [
            'enquiry' => $enquiry
        ]);
    }

    /**
     * Show the form for editing the specified enquiry.
     */
    public function edit(Enquiry $enquiry)
    {
        if (!in_array($enquiry->status, ['draft', 'pending_review'])) {
            return back()->with('error', 'Only draft or pending review enquiries can be edited.');
        }

        $clients = ClientDetail::where('status', 'active')->get();
        return Inertia::render('sales/enquiries/edit', [
            'enquiry' => $enquiry,
            'clients' => $clients
        ]);
    }

    /**
     * Update the specified enquiry in storage.
     */
    public function update(Request $request, Enquiry $enquiry)
    {
        if (!in_array($enquiry->status, ['draft', 'pending_review'])) {
            return back()->with('error', 'Only draft or pending review enquiries can be updated.');
        }

        $validated = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'enquiry_date' => ['required', 'date'],
            'required_date' => ['nullable', 'date', 'after_or_equal:enquiry_date'],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'source' => ['required', Rule::in(['email', 'phone', 'website', 'walk_in', 'other'])],
            'specifications' => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'document' => ['nullable', 'file', 'max:10240'], // 10MB max
        ]);

        try {
            DB::beginTransaction();

            $enquiry->update($validated);

            // Update document if new one is uploaded
            if ($request->hasFile('document')) {
                if ($enquiry->document_path) {
                    Storage::delete($enquiry->document_path);
                }
                $path = $request->file('document')->store('enquiry-documents');
                $enquiry->update(['document_path' => $path]);
            }

            DB::commit();

            return redirect()->route('enquiries.show', $enquiry)
                ->with('success', 'Enquiry updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update enquiry: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified enquiry from storage.
     */
    public function destroy(Enquiry $enquiry)
    {
        if ($enquiry->status !== 'draft') {
            return back()->with('error', 'Only draft enquiries can be deleted.');
        }

        try {
            DB::beginTransaction();

            // Delete associated document
            if ($enquiry->document_path) {
                Storage::delete($enquiry->document_path);
            }

            $enquiry->delete();

            DB::commit();

            return redirect()->route('enquiries.index')
                ->with('success', 'Enquiry deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete enquiry: ' . $e->getMessage());
        }
    }

    /**
     * Submit enquiry for review.
     */
    public function submitForReview(Enquiry $enquiry)
    {
        if ($enquiry->status !== 'draft') {
            return back()->with('error', 'Only draft enquiries can be submitted for review.');
        }

        $enquiry->update([
            'status' => 'pending_review',
            'approval_status' => 'pending'
        ]);

        return back()->with('success', 'Enquiry submitted for review successfully.');
    }

    /**
     * Approve the enquiry.
     */
    public function approve(Request $request, Enquiry $enquiry)
    {
        if ($enquiry->approval_status !== 'pending') {
            return back()->with('error', 'Only pending enquiries can be approved.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['nullable', 'string'],
        ]);

        $enquiry->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'] ?? null,
            'status' => 'approved'
        ]);

        return back()->with('success', 'Enquiry approved successfully.');
    }

    /**
     * Reject the enquiry.
     */
    public function reject(Request $request, Enquiry $enquiry)
    {
        if ($enquiry->approval_status !== 'pending') {
            return back()->with('error', 'Only pending enquiries can be rejected.');
        }

        $validated = $request->validate([
            'approval_remarks' => ['required', 'string'],
        ]);

        $enquiry->update([
            'approval_status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'approval_remarks' => $validated['approval_remarks'],
            'status' => 'rejected'
        ]);

        return back()->with('success', 'Enquiry rejected successfully.');
    }

    /**
     * Convert enquiry to quotation.
     */
    public function convertToQuotation(Enquiry $enquiry)
    {
        if ($enquiry->status !== 'approved') {
            return back()->with('error', 'Only approved enquiries can be converted to quotations.');
        }

        if ($enquiry->quotations()->exists()) {
            return back()->with('error', 'This enquiry has already been converted to a quotation.');
        }

        $enquiry->update([
            'status' => 'converted',
            'converted_date' => now()
        ]);

        return redirect()->route('quotations.create', ['enquiry_id' => $enquiry->id])
            ->with('success', 'Enquiry converted successfully. Please create the quotation.');
    }

    /**
     * Cancel the enquiry.
     */
    public function cancel(Request $request, Enquiry $enquiry)
    {
        if (!in_array($enquiry->status, ['draft', 'pending_review', 'pending_approval'])) {
            return back()->with('error', 'Only draft, pending review, or pending approval enquiries can be cancelled.');
        }

        $validated = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $enquiry->update([
            'status' => 'cancelled',
            'notes' => $validated['notes']
        ]);

        return back()->with('success', 'Enquiry cancelled successfully.');
    }

    /**
     * Generate a unique enquiry number.
     */
    private function generateEnquiryNumber(): string
    {
        $prefix = 'ENQ';
        $year = date('Y');
        $month = date('m');
        
        $lastEnquiry = Enquiry::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastEnquiry) {
            $lastNumber = (int) substr($lastEnquiry->enquiry_no, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }
}
