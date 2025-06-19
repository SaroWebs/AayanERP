<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorBankAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $vendors = Vendor::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->input('sort'), function ($query, $sort, $request) {
                $direction = $request->input('direction', 'asc');
                $query->orderBy($sort, $direction);
            })
            ->with(['bankAccounts', 'contactDetails', 'documents'])
            ->paginate($request->input('per_page', 20))
            ->withQueryString();

        return Inertia::render('vendors/index', [
            'vendors' => $vendors
        ]);
    }


    public function getVendors(Request $request)
    {
        $vendors = Vendor::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->input('sort'), function ($query, $sort, $request) {
                $direction = $request->input('direction', 'asc');
                $query->orderBy($sort, $direction);
            })
            ->with(['bankAccounts', 'contactDetails', 'documents'])
            ->paginate($request->input('per_page', 20))
            ->withQueryString();

        return response()->json($vendors);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        $vendor->load(['bankAccounts', 'contactDetails', 'documents']);
        
        return inertia('vendors/ShowVendor', [
            'vendor' => $vendor
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vendor $vendor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, Vendor $vendor)
    {
        DB::transaction(function () use ($request, $vendor) {

            // 1. Basic Profile Update
            if ($request->hasAny(['name', 'email', 'contact_no', 'gstin', 'pan_no', 'fax', 'state', 'address'])) {
                $request->validate([
                    'name' => 'sometimes|required|string|max:255',
                    'email' => 'sometimes|required|email|max:255',
                    'contact_no' => 'nullable|string|max:20',
                    'gstin' => 'nullable|string|max:15',
                    'pan_no' => 'nullable|string|max:10',
                    'fax' => 'nullable|string|max:20',
                    'state' => 'nullable|string|max:100',
                    'address' => 'nullable|string|max:500',
                ]);

                $vendor->update($request->only([
                    'name',
                    'contact_no',
                    'email',
                    'gstin',
                    'pan_no',
                    'fax',
                    'state',
                    'address'
                ]));
            }

            // 2. Bank Accounts Update
            if ($request->has('bank_accounts')) {
                $request->validate([
                    'bank_accounts' => 'array',
                    'bank_accounts.*.account_holder_name' => 'required|string|max:255',
                    'bank_accounts.*.account_number' => 'required|string|max:50',
                    'bank_accounts.*.bank_name' => 'required|string|max:255',
                    'bank_accounts.*.ifsc' => 'required|string|max:11',
                    'bank_accounts.*.branch_address' => 'nullable|string|max:500',
                ]);

                $vendor->bankAccounts()->delete();
                foreach ($request->bank_accounts as $bankAccount) {
                    $vendor->bankAccounts()->create($bankAccount);
                }
            }

            // 3. Contact Details Update
            if ($request->has('contact_details')) {
                $request->validate([
                    'contact_details' => 'array',
                    'contact_details.*.contact_person' => 'required|string|max:255',
                    'contact_details.*.department' => 'nullable|string|max:100',
                    'contact_details.*.designation' => 'nullable|string|max:100',
                    'contact_details.*.phone' => 'nullable|string|max:20',
                    'contact_details.*.email' => 'nullable|email|max:255',
                ]);

                $vendor->contactDetails()->delete();
                foreach ($request->contact_details as $contactDetail) {
                    $vendor->contactDetails()->create($contactDetail);
                }
            }

            // 4. Documents Update (files optional)
            if ($request->has('documents')) {
                $request->validate([
                    'documents' => 'array',
                    'documents.*.document_type' => 'required|string|max:100',
                    'documents.*.document_name' => 'nullable|string|max:255',
                    'documents.*.document_number' => 'nullable|string|max:100',
                    'documents.*.remarks' => 'nullable|string|max:500',
                    'documents.*.sharing_option' => 'required|in:public,private',
                    'documents.*.file' => 'nullable|file|max:10240',
                ]);

                $vendor->documents()->delete();
                foreach ($request->documents as $document) {
                    $filePath = null;
                    if (isset($document['file']) && $document['file'] instanceof \Illuminate\Http\UploadedFile) {
                        $filePath = $document['file']->store('vendor_documents', 'public');
                    }

                    $vendor->documents()->create([
                        'document_type' => $document['document_type'],
                        'document_name' => $document['document_name'] ?? null,
                        'document_number' => $document['document_number'] ?? null,
                        'remarks' => $document['remarks'] ?? null,
                        'sharing_option' => $document['sharing_option'],
                        'document_path' => $filePath,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Vendor updated successfully.']);
    }

    /**
     * Get a single vendor's data
     */
    public function getVendor(Vendor $vendor)
    {
        $vendor->load(['bankAccounts', 'contactDetails', 'documents']);
        return response()->json($vendor);
    }

    /**
     * Update the vendor's basic information
     */
    public function updateBasic(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:vendors,email,' . $vendor->id,
            'contact_no' => 'nullable|string|max:20',
            'gstin' => 'nullable|string|max:15|unique:vendors,gstin,' . $vendor->id,
            'pan_no' => 'nullable|string|max:10|unique:vendors,pan_no,' . $vendor->id,
            'fax' => 'nullable|string|max:20',
            'state' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
        ]);

        $vendor->update($validated);

        return response()->json([
            'message' => 'Basic information updated successfully',
            'vendor' => $vendor->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    /**
     * Update the vendor's bank accounts
     */
    public function updateBankAccounts(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'bank_accounts' => 'array',
            'bank_accounts.*.account_holder_name' => 'required_with:bank_accounts.*|string|max:255',
            'bank_accounts.*.account_number' => 'required_with:bank_accounts.*|string|max:50|unique:vendor_bank_accounts,account_number,' . $vendor->id . ',vendor_id',
            'bank_accounts.*.bank_name' => 'required_with:bank_accounts.*|string|max:255',
            'bank_accounts.*.ifsc' => 'required_with:bank_accounts.*|string|max:11',
            'bank_accounts.*.branch_address' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($vendor, $validated) {
            // Delete existing bank accounts
            VendorBankAccount::where('vendor_id', $vendor->id)->delete();
            
            // Create new bank accounts if any exist
            if (!empty($validated['bank_accounts'])) {
                foreach ($validated['bank_accounts'] as $account) {
                    VendorBankAccount::create([
                        'vendor_id' => $vendor->id,
                        'account_holder_name' => $account['account_holder_name'],
                        'account_number' => $account['account_number'],
                        'bank_name' => $account['bank_name'],
                        'ifsc' => $account['ifsc'],
                        'branch_address' => $account['branch_address'] ?? null,
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Bank accounts updated successfully',
            'vendor' => $vendor->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    /**
     * Update the vendor's contact details
     */
    public function updateContactDetails(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'contact_details' => 'array',
            'contact_details.*.name' => 'required_with:contact_details.*|string|max:255',
            'contact_details.*.designation' => 'nullable|string|max:100',
            'contact_details.*.mobile' => 'nullable|string|max:20',
            'contact_details.*.email' => 'nullable|email|max:255',
            'contact_details.*.landline' => 'nullable|string|max:20',
            'contact_details.*.is_primary' => 'boolean',
        ]);

        DB::transaction(function () use ($vendor, $validated) {
            // Delete existing contact details
            $vendor->contactDetails()->delete();
            
            // Create new contact details if any exist
            if (!empty($validated['contact_details'])) {
                foreach ($validated['contact_details'] as $contact) {
                    $vendor->contactDetails()->create($contact);
                }
            }
        });

        return response()->json([
            'message' => 'Contact details updated successfully',
            'vendor' => $vendor->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    /**
     * Update the vendor's documents
     */
    public function updateDocuments(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'documents' => 'array',
            'documents.*.document_type' => 'required_with:documents.*|string|max:100',
            'documents.*.document_name' => 'nullable|string|max:255',
            'documents.*.document_number' => 'nullable|string|max:100',
            'documents.*.remarks' => 'nullable|string|max:500',
            'documents.*.sharing_option' => 'required_with:documents.*|in:public,private',
            'documents.*.file' => 'nullable|file|max:10240', // 10MB max
        ]);

        DB::transaction(function () use ($vendor, $validated, $request) {
            // Delete existing documents and their files
            foreach ($vendor->documents as $document) {
                if ($document->document_path) {
                    Storage::disk('public')->delete($document->document_path);
                }
            }
            $vendor->documents()->delete();
            
            // Create new documents if any exist
            if (!empty($validated['documents'])) {
                foreach ($request->documents as $index => $document) {
                    $file = $request->file("documents.$index.file");
                    $path = $file ? $file->store('vendor_documents', 'public') : null;

                    $vendor->documents()->create([
                        'document_type' => $document['document_type'],
                        'document_name' => $document['document_name'] ?? null,
                        'document_number' => $document['document_number'] ?? null,
                        'remarks' => $document['remarks'] ?? null,
                        'sharing_option' => $document['sharing_option'],
                        'document_path' => $path,
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Documents updated successfully',
            'vendor' => $vendor->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    public function destroy(Vendor $vendor)
    {
        DB::transaction(function () use ($vendor) {
            // Delete all related records
            $vendor->bankAccounts()->delete();
            $vendor->contactDetails()->delete();

            // Delete all documents and their files
            foreach ($vendor->documents as $document) {
                if ($document->document_path) {
                    Storage::disk('public')->delete($document->document_path);
                }
            }
            $vendor->documents()->delete();

            // Finally delete the vendor
            $vendor->delete();
        });

        return response()->json(['message' => 'Vendor and all related data deleted successfully.']);
    }

    public function deleteDocument(Vendor $vendor, $docId)
    {
        $document = $vendor->documents()->findOrFail($docId);

        // Delete the file from storage if it exists
        if ($document->document_path) {
            Storage::disk('public')->delete($document->document_path);
        }

        // Delete the document record
        $document->delete();

        return response()->json(['message' => 'Document deleted successfully.']);
    }
}
