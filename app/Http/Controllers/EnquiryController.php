<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use App\Models\ClientDetail;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class EnquiryController extends Controller
{
    /**
     * Display a listing of the enquiries.
     */
    public function index(Request $request)
    {
        $clients = ClientDetail::where('status', 'active')->get();
        
        // Get initial data
        $query = Enquiry::with(['client', 'creator'])
            ->latest();
            
        $enquiries = $query->paginate(10);
        
        return Inertia::render('sales/enquiries/index', [
            'initialEnquiries' => $enquiries,
            'initialFilters' => [],
            'initialClients' => $clients
        ]);
    }

    /**
     * Get paginated list of enquiries for axios requests.
     */
    public function data(Request $request)
    {
        try {
            Log::info('Enquiry data request received', [
                'params' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $query = Enquiry::with(['client', 'creator'])
                ->latest();

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Filter by approval status
            if ($request->filled('approval_status')) {
                $query->where('approval_status', $request->approval_status);
            }

            // Filter by client
            if ($request->filled('client_detail_id')) {
                $query->where('client_detail_id', $request->client_detail_id);
            }

            // Filter by date range
            if ($request->filled('from_date')) {
                $query->where('enquiry_date', '>=', $request->from_date);
            }
            if ($request->filled('to_date')) {
                $query->where('enquiry_date', '<=', $request->to_date);
            }

            // Search by enquiry number or subject
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('enquiry_no', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            $enquiries = $query->paginate(10)->withQueryString();
            $clients = ClientDetail::where('status', 'active')->get();

            Log::info('Enquiry data response', [
                'total_enquiries' => $enquiries->total(),
                'current_page' => $enquiries->currentPage(),
                'total_clients' => $clients->count()
            ]);

            return response()->json([
                'data' => $enquiries,
                'filters' => $request->only(['status', 'approval_status', 'client_detail_id', 'from_date', 'to_date', 'search']),
                'clients' => $clients
            ]);
        } catch (\Exception $e) {
            Log::error('Error in enquiry data endpoint', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to load enquiries: ' . $e->getMessage()
            ], 500);
        }
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
            // Client Information
            'client_detail_id' => ['required', 'exists:client_details,id'],
            'contact_person_id' => ['nullable', 'exists:client_contacts,id'],
            'referred_by' => ['nullable', 'string', 'max:255'],

            // Basic Information
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type' => ['required', Rule::in(['equipment', 'scaffolding', 'both'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'source' => ['required', Rule::in(['website', 'email', 'phone', 'referral', 'walk_in', 'other'])],

            // Equipment Details
            'equipment_id' => ['nullable', 'exists:equipment,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'nature_of_work' => ['nullable', Rule::in(['soil', 'rock', 'limestone', 'coal', 'sand', 'gravel', 'construction', 'demolition', 'mining', 'quarry', 'other'])],
            'duration' => ['nullable', 'integer', 'min:1'],
            'duration_unit' => ['nullable', Rule::in(['hours', 'days', 'months', 'years'])],

            // Location Details
            'deployment_state' => ['nullable', 'string', 'max:2'],
            'location' => ['nullable', 'string', 'max:255'],
            'site_details' => ['nullable', 'string'],

            // Dates
            'enquiry_date' => ['required', 'date'],
            'required_date' => ['nullable', 'date', 'after_or_equal:enquiry_date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:enquiry_date'],

            // Financial Details
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:3'],

            // Additional Details
            'special_requirements' => ['nullable', 'string'],
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

            return response()->json([
                'success' => true,
                'message' => 'Enquiry created successfully',
                'data' => [
                    'enquiry' => $enquiry->load(['client', 'creator']),
                    'redirect_url' => route('sales.enquiries.show', $enquiry)
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create enquiry', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->except(['document'])
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create enquiry: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified enquiry.
     */
    public function show(Enquiry $enquiry)
    {
        $enquiry->load(['client', 'creator', 'quotations']);
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
            'client_detail_id' => ['required', 'exists:client_details,id'],
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

    /**
     * Get equipment data for the form.
     */
    public function getEquipment()
    {
        try {
            $equipment = Equipment::where('status', 'active')
                ->select('id', 'name', 'model')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'value' => (string) $item->id,
                    'label' => $item->name,
                    'model' => $item->model
                ]);

            return response()->json([
                'success' => true,
                'data' => $equipment
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch equipment data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch equipment data: ' . $e->getMessage()
            ], 500);
        }
    }
}
