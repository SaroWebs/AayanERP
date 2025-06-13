<?php

namespace App\Http\Controllers;

use App\Models\Enquiry;
use App\Models\ClientDetail;
use App\Models\ClientContactDetail;
use App\Models\User;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

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
        $query = Enquiry::with(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
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
            ->when($request->type, function ($query, $type) {
                $query->whereIn('type', (array) $type);
            })
            ->when($request->source, function ($query, $source) {
                $query->whereIn('source', (array) $source);
            })
            ->when($request->nature_of_work, function ($query, $nature) {
                $query->whereIn('nature_of_work', (array) $nature);
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
            $equipment = Equipment::select('id', 'name')
                ->where('status', 'active')
                ->orderBy('name')
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
        $validator = Validator::make($request->all(), [
            'client_detail_id' => 'required|exists:client_details,id',
            'contact_person_id' => 'nullable|exists:client_contact_details,id',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['equipment', 'scaffolding', 'both'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'source' => ['required', Rule::in(['website', 'email', 'phone', 'referral', 'walk_in', 'other'])],
            'equipment_id' => 'nullable|exists:equipment,id',
            'quantity' => 'required|integer|min:1',
            'nature_of_work' => ['required', Rule::in([
                'soil', 'rock', 'limestone', 'coal', 'sand', 'gravel',
                'construction', 'demolition', 'mining', 'quarry', 'other'
            ])],
            'duration' => 'nullable|integer|min:1',
            'duration_unit' => ['nullable', Rule::in(['hours', 'days', 'months', 'years'])],
            'deployment_state' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'site_details' => 'nullable|string',
            'enquiry_date' => 'required|date',
            'required_date' => 'nullable|date|after_or_equal:enquiry_date',
            'valid_until' => 'nullable|date|after_or_equal:enquiry_date',
            'estimated_value' => 'nullable|numeric|min:0',
            'currency' => 'required|string|size:3',
            'next_follow_up_date' => 'nullable|date|after_or_equal:enquiry_date',
            'follow_up_notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Generate unique enquiry number
            $enquiryNo = 'ENQ-' . date('Y') . '-' . str_pad(Enquiry::whereYear('created_at', date('Y'))->count() + 1, 5, '0', STR_PAD_LEFT);

            $enquiry = Enquiry::create([
                'enquiry_no' => $enquiryNo,
                'created_by' => Auth::id(),
                ...$request->all()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry created successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified enquiry.
     */
    public function show(Enquiry $enquiry)
    {
        return response()->json($enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment', 'quotations']));
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
        if (in_array($enquiry->status, ['converted', 'lost', 'cancelled'])) {
            return response()->json(['message' => 'Cannot update enquiry in current status'], 422);
        }

        $validator = Validator::make($request->all(), [
            'client_detail_id' => 'required|exists:client_details,id',
            'contact_person_id' => 'nullable|exists:client_contact_details,id',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['equipment', 'scaffolding', 'both'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'source' => ['required', Rule::in(['website', 'email', 'phone', 'referral', 'walk_in', 'other'])],
            'equipment_id' => 'nullable|exists:equipment,id',
            'quantity' => 'required|integer|min:1',
            'nature_of_work' => ['required', Rule::in([
                'soil', 'rock', 'limestone', 'coal', 'sand', 'gravel',
                'construction', 'demolition', 'mining', 'quarry', 'other'
            ])],
            'duration' => 'nullable|integer|min:1',
            'duration_unit' => ['nullable', Rule::in(['hours', 'days', 'months', 'years'])],
            'deployment_state' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'site_details' => 'nullable|string',
            'enquiry_date' => 'required|date',
            'required_date' => 'nullable|date|after_or_equal:enquiry_date',
            'valid_until' => 'nullable|date|after_or_equal:enquiry_date',
            'estimated_value' => 'nullable|numeric|min:0',
            'currency' => 'required|string|size:3',
            'next_follow_up_date' => 'nullable|date|after_or_equal:enquiry_date',
            'follow_up_notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update($request->all());

            DB::commit();

            return response()->json([
                'message' => 'Enquiry updated successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update enquiry', 'error' => $e->getMessage()], 500);
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
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
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
        if ($enquiry->status !== 'pending_review') {
            return response()->json(['message' => 'Only pending review enquiries can be approved'], 422);
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
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
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
        if ($enquiry->status !== 'pending_review') {
            return response()->json(['message' => 'Only pending review enquiries can be rejected'], 422);
        }

        $validator = Validator::make($request->all(), [
            'rejection_remarks' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'rejected',
                'approval_remarks' => $request->rejection_remarks
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry rejected successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reject enquiry', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Convert enquiry to quotation.
     */
    public function convertToQuotation(Request $request, Enquiry $enquiry)
    {
        if ($enquiry->status !== 'approved') {
            return response()->json(['message' => 'Only approved enquiries can be converted to quotation'], 422);
        }

        try {
            DB::beginTransaction();

            $enquiry->update([
                'status' => 'quoted',
                'converted_date' => now()->toDateString(), // current date only
            ]);

            // Create quotation logic here if needed

            DB::commit();

            return response()->json([
                'message' => 'Enquiry converted to quotation successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to convert enquiry', 'error' => $e->getMessage()], 500);
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
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to cancel enquiry', 'error' => $e->getMessage()], 500);
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
                'assigned_at' => now(),
                'assigned_by' => Auth::id()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Enquiry assigned successfully',
                'enquiry' => $enquiry->load(['client', 'contactPerson', 'creator', 'assignee', 'equipment'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to assign enquiry', 'error' => $e->getMessage()], 500);
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
}
