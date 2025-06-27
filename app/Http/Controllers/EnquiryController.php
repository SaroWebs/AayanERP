<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Enquiry;
use App\Models\Quotation;
use App\Models\ClientDetail;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Models\ClientContactDetail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EnquiryController extends Controller
{
    /**
     * Display a listing of the enquiries.
     */
    public function index()
    {
        return Inertia::render('sales/enquiries/index');
    }

    /**
     * Get paginated list of enquiries for axios requests.
     */
    public function data(Request $request)
    {
        $query = Enquiry::with(['client', 'contactPerson', 'creator', 'assignee', 'items', 'quotations'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('enquiry_no', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('client', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->whereIn('status', (array) $status);
            })
            ->when($request->priority, function ($query, $priority) {
                $query->whereIn('priority', (array) $priority);
            })
            ->when($request->source, function ($query, $source) {
                $query->whereIn('source', (array) $source);
            })
            ->when($request->client_id, function ($query, $clientId) {
                $query->where('client_detail_id', $clientId);
            })
            ->when($request->assigned_to, function ($query, $userId) {
                $query->where('assigned_to', $userId);
            })
            ->when($request->date_range, function ($query, $range) {
                $query->whereBetween('enquiry_date', $range);
            });

        $enquiries = $query->latest()->paginate(10);
        return response()->json($enquiries);
    }

    /**
     * Get equipment list for the form.
     */
    public function getEquipment()
    {
        try {
            $equipment = Item::orderBy('name')
                ->get();

            return response()->json($equipment);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch equipment list',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created enquiry in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_detail_id' => 'required|exists:client_details,id',
            'contact_person_id' => 'nullable|exists:client_contact_details,id',
            'subject' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'source' => 'required|in:website,email,phone,referral,walk_in,other',
            'deployment_state' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'site_details' => 'nullable|string',
            'enquiry_date' => 'required|date',
            'required_date' => 'nullable|date',
            'valid_until' => 'nullable|date',
            'estimated_value' => 'nullable|numeric',
            'currency' => 'required|string|max:3',
            'next_follow_up_date' => 'nullable|date',
            'follow_up_notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_value' => 'nullable|numeric',
            'items.*.notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            // Generate unique enquiry_no
            $year = date('Y');
            $count = Enquiry::whereYear('created_at', $year)->count() + 1;
            do {
                $enquiry_no = 'EN-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
                $exists = Enquiry::where('enquiry_no', $enquiry_no)->exists();
                $count++;
            } while ($exists);
            
            $enquiry = Enquiry::create(array_merge(
                collect($validated)->except('items')->all(),
                [
                    'enquiry_no'=> $enquiry_no,
                    'status' => 'draft',
                    'approval_status' => 'not_required',
                    'created_by' => Auth::id(),
                ]
            ));

            foreach ($validated['items'] as $item) {
                $enquiry->items()->create([
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'estimated_value' => $item['estimated_value'] ?? null,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Enquiry created successfully',
                'data' => $enquiry->load('items')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create enquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified enquiry.
     */
    public function show(Enquiry $enquiry)
    {
        return response()->json($enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items', 'quotations']));
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
        $validated = $request->validate([
            'client_detail_id' => 'required|exists:client_details,id',
            'contact_person_id' => 'nullable|exists:client_contact_details,id',
            'subject' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'source' => 'required|in:website,email,phone,referral,walk_in,other',
            'deployment_state' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'site_details' => 'nullable|string',
            'enquiry_date' => 'required|date',
            'required_date' => 'nullable|date',
            'valid_until' => 'nullable|date',
            'estimated_value' => 'nullable|numeric',
            'currency' => 'required|string|max:3',
            'next_follow_up_date' => 'nullable|date',
            'follow_up_notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_value' => 'nullable|numeric',
            'items.*.notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $enquiry->update(collect($validated)->except('items')->all());

            // Delete existing items
            $enquiry->items()->delete();

            // Re-create items
            foreach ($validated['items'] as $item) {
                $enquiry->items()->create([
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'estimated_value' => $item['estimated_value'] ?? null,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Enquiry updated successfully',
                'data' => $enquiry->load('items')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update enquiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified enquiry from storage.
     */
    public function destroy(Enquiry $enquiry)
    {
        if (in_array($enquiry->status, ['converted', 'lost', 'cancelled'])) {
            return response()->json(['message' => 'Cannot delete enquiry in current status'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->delete();

            DB::commit();

            return response()->json(['message' => 'Enquiry deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Submit enquiry for review.
     */
    public function submitForReview(Enquiry $enquiry)
    {
        if ($enquiry->status !== 'draft') {
            return response()->json(['message' => 'Only draft enquiries can be submitted for review'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update(['status' => 'pending_review']);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry submitted for review successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to submit enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Approve the enquiry.
     */
    public function approve(Request $request, Enquiry $enquiry)
    {
        if ($enquiry->status !== 'pending_approval') {
            return response()->json(['message' => 'Only pending approval enquiries can be approved'], 422);
        }

        $validator = Validator::make($request->all(), [
            'approval_remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => Auth::id(),
                'approval_remarks' => $request->approval_remarks
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry approved successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to approve enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reject the enquiry.
     */
    public function reject(Request $request, Enquiry $enquiry)
    {
        if ($enquiry->status !== 'pending_approval') {
            return response()->json(['message' => 'Only pending approval enquiries can be rejected.'], 422);
        }

        $validator = Validator::make($request->all(), [
            'approval_remarks' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'lost',
                'approval_status' => 'rejected',
                'approval_remarks' => $request->approval_remarks
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry rejected successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reject enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark enquiry as converted.
     */
    public function markAsConverted(Request $request, Enquiry $enquiry)
    {
        if ($enquiry->status !== 'approved') {
            return response()->json(['message' => 'Only approved enquiries can be converted'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'converted',
                'converted_date' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry marked as converted successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update enquiry status', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Assign the enquiry to a user.
     */
    public function assign(Request $request, Enquiry $enquiry)
    {
        $validator = Validator::make($request->all(), [
            'assigned_to' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'assigned_to' => $request->assigned_to,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry assigned successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to assign enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Convert enquiry to quotation.
     */
    public function convertToQuotation(Request $request, Enquiry $enquiry)
    {
        if (in_array($enquiry->status, ['draft', 'pending_review', 'under_review'], true)) {
            return response()->json(['message' => 'Only approved enquiries can be converted to quotation'], 422);
        }

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quotation_date' => ['required', 'date'],
            'valid_until' => ['required', 'date', 'after:quotation_date'],
            'currency' => ['required', 'string', 'size:3'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'tax_amount' => ['required', 'numeric', 'min:0'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'payment_terms_days' => ['required', 'integer', 'min:0'],
            'advance_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'payment_terms' => ['required', 'string'],
            'delivery_terms' => ['required', 'string'],
            'deployment_state' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'site_details' => ['nullable', 'string'],
            'special_conditions' => ['nullable', 'string'],
            'terms_conditions' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'client_remarks' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.total_price' => ['required', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string']
        ]);

        try {
            DB::beginTransaction();

            // Generate unique quotation_no
            $year = date('Y');
            $count = Quotation::whereYear('created_at', $year)->count() + 1;
            do {
                $quotationNo = 'QT-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
                $exists = Quotation::where('quotation_no', $quotationNo)->exists();
                $count++;
            } while ($exists);

            $quotation = Quotation::create([
                'quotation_no' => $quotationNo,
                'enquiry_id' => $enquiry->id,
                'client_detail_id' => $enquiry->client_detail_id,
                'contact_person_id' => $enquiry->contact_person_id,
                'created_by' => Auth::id(),
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'status' => 'draft',
                'approval_status' => 'not_required',
                'quotation_date' => $validated['quotation_date'],
                'valid_until' => $validated['valid_until'],
                'subtotal' => $validated['subtotal'],
                'tax_percentage' => $validated['tax_percentage'],
                'tax_amount' => $validated['tax_amount'],
                'discount_percentage' => $validated['discount_percentage'],
                'discount_amount' => $validated['discount_amount'],
                'total_amount' => $validated['total_amount'],
                'currency' => $validated['currency'],
                'payment_terms_days' => $validated['payment_terms_days'],
                'advance_percentage' => $validated['advance_percentage'],
                'payment_terms' => $validated['payment_terms'],
                'delivery_terms' => $validated['delivery_terms'],
                'deployment_state' => $validated['deployment_state'],
                'location' => $validated['location'],
                'site_details' => $validated['site_details'],
                'special_conditions' => $validated['special_conditions'],
                'terms_conditions' => $validated['terms_conditions'],
                'notes' => $validated['notes'],
                'client_remarks' => $validated['client_remarks']
            ]);

            foreach ($validated['items'] as $item) {
                $quotation->items()->create([
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            $enquiry->update([
                'status' => 'quoted',
                'converted_date' => now()->toDateString()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Quotation created successfully',
                'quotation' => $quotation->load(['client', 'contactPerson', 'creator', 'items'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create quotation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel the enquiry.
     */
    public function cancel(Request $request, Enquiry $enquiry)
    {
        if (in_array($enquiry->status, ['cancelled'])) {
            return response()->json(['message' => 'Cannot cancel enquiry in current status'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'cancelled',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry cancelled successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to cancel enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all users for assignment.
     */
    public function getUsers()
    {
        $users = User::select('id', 'name')->orderBy('name')->get();
        return response()->json($users);
    }

    /**
     * Get all clients for the form.
     */
    public function getClients()
    {
        $clients = ClientDetail::select('id', 'company_name')->orderBy('company_name')->get();
        return response()->json($clients);
    }

    /**
     * Get contact persons for a client.
     */
    public function getClientContacts(ClientDetail $client)
    {
        $contacts = $client->contacts()->select('id', 'name')->orderBy('name')->get();
        return response()->json($contacts);
    }

    /**
     * Mark enquiry as under review.
     */
    public function markUnderReview(Request $request, Enquiry $enquiry)
    {
        if (!in_array($enquiry->status, ['draft', 'pending_review'])) {
            return response()->json(['message' => 'Only draft or pending review enquiries can be marked as under review'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'under_review',
                'approval_status' => 'pending'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry marked as under review successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update enquiry status', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark enquiry as quoted.
     */
    public function markAsQuoted(Request $request, Enquiry $enquiry)
    {
        if (!in_array($enquiry->status, ['under_review', 'approved'])) {
            return response()->json(['message' => 'Only under review or approved enquiries can be marked as quoted'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'quoted'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry marked as quoted successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update enquiry status', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark enquiry as pending approval.
     */
    public function markPendingApproval(Request $request, Enquiry $enquiry)
    {
        if (!in_array($enquiry->status, ['under_review', 'quoted'])) {
            return response()->json(['message' => 'Only under review or quoted enquiries can be marked as pending approval'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'pending_approval',
                'approval_status' => 'pending'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry marked as pending approval successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'items'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update enquiry status', 'error' => $e->getMessage()], 500);
        }
    }
}
