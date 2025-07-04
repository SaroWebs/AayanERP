<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\ClientDetail;
use App\Models\ClientBankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\ClientDocument;

class ClientDetailController extends Controller
{
    public function index()
    {
        return Inertia::render('clients/index');
    }

    public function paginatedlist(Request $request)
    {
        $clients = ClientDetail::query()
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

        return response()->json($clients);
    }

    public function all_data()
    {
        $clients = ClientDetail::with(['contactDetails', 'bankAccounts', 'documents'])->get();
        return response()->json($clients);
    }


    public function show(ClientDetail $client)
    {
        $client->load(['bankAccounts', 'contactDetails', 'documents']);
        return inertia('clients/ShowClient', ['client' => $client]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'contact_no' => 'required',
            'gstin_no' => 'nullable',
            'pan_no' => 'nullable',
            'fax' => 'nullable',
            'state' => 'required',
            'address' => 'required',
            'correspondence_address' => 'nullable',
            'company_type' => 'required',
            'turnover' => 'required|numeric',
            'range' => 'required',
            'bank_accounts' => 'array',
            'bank_accounts.*.account_holder_name' => 'required',
            'bank_accounts.*.account_number' => 'required',
            'bank_accounts.*.bank_name' => 'required',
            'bank_accounts.*.ifsc' => 'required',
            'bank_accounts.*.branch_address' => 'nullable',
            'contact_details' => 'array',
            'contact_details.*.contact_person' => 'required',
            'contact_details.*.department' => 'nullable',
            'contact_details.*.designation' => 'nullable',
            'contact_details.*.phone' => 'nullable',
            'contact_details.*.email' => 'nullable|email',
            'documents' => 'array',
            'documents.*.document_type' => 'required',
            'documents.*.document_name' => 'nullable',
            'documents.*.document_number' => 'nullable',
            'documents.*.remarks' => 'nullable',
            'documents.*.sharing_option' => 'required',
            'documents.*.document_path' => 'nullable|file',
        ]);

        $client = null;
        DB::transaction(function () use ($validated, &$client) {
            // Create basic client record
            $client = ClientDetail::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'contact_no' => $validated['contact_no'],
                'gstin_no' => $validated['gstin_no'] ?? null,
                'pan_no' => $validated['pan_no'] ?? null,
                'fax' => $validated['fax'] ?? null,
                'state' => $validated['state'],
                'address' => $validated['address'],
                'correspondence_address' => $validated['correspondence_address'] ?? null,
                'company_type' => $validated['company_type'],
                'turnover' => $validated['turnover'],
                'range' => $validated['range'],
            ]);

            // Store bank accounts
            if (!empty($validated['bank_accounts'])) {
                foreach ($validated['bank_accounts'] as $account) {
                    $client->bankAccounts()->create([
                        'account_holder_name' => $account['account_holder_name'],
                        'account_number' => $account['account_number'],
                        'bank_name' => $account['bank_name'],
                        'ifsc' => $account['ifsc'],
                        'branch_address' => $account['branch_address'] ?? null,
                    ]);
                }
            }

            // Store contact details
            if (!empty($validated['contact_details'])) {
                foreach ($validated['contact_details'] as $contact) {
                    $client->contactDetails()->create([
                        'contact_person' => $contact['contact_person'],
                        'department' => $contact['department'] ?? null,
                        'designation' => $contact['designation'] ?? null,
                        'phone' => $contact['phone'] ?? null,
                        'email' => $contact['email'] ?? null,
                    ]);
                }
            }

            // Store documents
            if (!empty($validated['documents'])) {
                foreach ($validated['documents'] as $document) {
                    $filePath = null;
                    if (isset($document['document_path']) && $document['document_path'] instanceof \Illuminate\Http\UploadedFile) {
                        $filePath = $document['document_path']->store('client_documents', 'public');
                    }

                    $client->documents()->create([
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

        if (!$client) {
            return response()->json(['message' => 'Failed to create client'], 500);
        }

        return response()->json([
            'message' => 'Client created successfully',
            'client' => $client->load(['bankAccounts', 'contactDetails', 'documents'])
        ], 201);
    }

    public function update(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'contact_no' => 'nullable',
            'gstin_no' => 'nullable',
            'pan_no' => 'nullable',
            'fax' => 'nullable',
            'state' => 'nullable',
            'address' => 'nullable',
            'correspondence_address' => 'nullable',
            'company_type' => 'required',
            'turnover' => 'required|numeric',
            'range' => 'required',
            'bank_accounts' => 'array',
            'bank_accounts.*.account_holder_name' => 'required',
            'bank_accounts.*.account_number' => 'required',
            'bank_accounts.*.bank_name' => 'required',
            'bank_accounts.*.ifsc' => 'required',
            'bank_accounts.*.branch_address' => 'nullable',
            'contact_details' => 'array',
            'contact_details.*.contact_person' => 'required',
            'contact_details.*.department' => 'nullable',
            'contact_details.*.designation' => 'nullable',
            'contact_details.*.phone' => 'nullable',
            'contact_details.*.email' => 'nullable|email',
            'documents' => 'array',
            'documents.*.document_type' => 'required',
            'documents.*.document_name' => 'nullable',
            'documents.*.document_number' => 'nullable',
            'documents.*.remarks' => 'nullable',
            'documents.*.sharing_option' => 'required',
            'documents.*.document_path' => 'nullable|file',
        ]);

        DB::transaction(function () use ($client, $validated) {
            // Update basic client record
            $client->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'contact_no' => $validated['contact_no'],
                'gstin_no' => $validated['gstin_no'] ?? null,
                'pan_no' => $validated['pan_no'] ?? null,
                'fax' => $validated['fax'] ?? null,
                'state' => $validated['state'],
                'address' => $validated['address'],
                'correspondence_address' => $validated['correspondence_address'] ?? null,
                'company_type' => $validated['company_type'],
                'turnover' => $validated['turnover'],
                'range' => $validated['range'],
            ]);

            // Update bank accounts
            $client->bankAccounts()->delete();
            if (!empty($validated['bank_accounts'])) {
                foreach ($validated['bank_accounts'] as $account) {
                    $client->bankAccounts()->create([
                        'account_holder_name' => $account['account_holder_name'],
                        'account_number' => $account['account_number'],
                        'bank_name' => $account['bank_name'],
                        'ifsc' => $account['ifsc'],
                        'branch_address' => $account['branch_address'] ?? null,
                    ]);
                }
            }

            // Update contact details
            $client->contactDetails()->delete();
            if (!empty($validated['contact_details'])) {
                foreach ($validated['contact_details'] as $contact) {
                    $client->contactDetails()->create([
                        'contact_person' => $contact['contact_person'],
                        'department' => $contact['department'] ?? null,
                        'designation' => $contact['designation'] ?? null,
                        'phone' => $contact['phone'] ?? null,
                        'email' => $contact['email'] ?? null,
                    ]);
                }
            }

            // Update documents
            foreach ($client->documents as $document) {
                if ($document->document_path) {
                    Storage::disk('public')->delete($document->document_path);
                }
            }
            $client->documents()->delete();
            if (!empty($validated['documents'])) {
                foreach ($validated['documents'] as $document) {
                    $filePath = null;
                    if (isset($document['document_path']) && $document['document_path'] instanceof \Illuminate\Http\UploadedFile) {
                        $filePath = $document['document_path']->store('client_documents', 'public');
                    }
                    $client->documents()->create([
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

        return response()->json([
            'message' => 'Client updated successfully',
            'client' => $client->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    public function destroy(ClientDetail $client)
    {
        DB::transaction(function () use ($client) {
            $client->bankAccounts()->delete();
            $client->contactDetails()->delete();

            foreach ($client->documents as $document) {
                if ($document->document_path) {
                    Storage::disk('public')->delete($document->document_path);
                }
            }
            $client->documents()->delete();

            $client->delete();
        });

        return response()->json(['message' => 'Client and all related data deleted successfully.']);
    }

    public function deleteDocument(ClientDocument $document)
    {
        if ($document->document_path) {
            Storage::disk('public')->delete($document->document_path);
        }
        $document->delete();
        return response()->json(['message' => 'Document deleted successfully.']);
    }

    public function addBankAccount(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'account_holder_name' => 'required',
            'account_number' => 'required',
            'bank_name' => 'required',
            'ifsc' => 'required',
            'branch_address' => 'nullable',
        ]);

        $bankAccount = $client->bankAccounts()->create($validated);

        return response()->json([
            'message' => 'Bank account added successfully',
            'bank_account' => $bankAccount
        ], 201);
    }

    public function addContactDetail(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'contact_person' => 'required',
            'department' => 'nullable',
            'designation' => 'nullable',
            'phone' => 'nullable',
            'email' => 'nullable|email',
        ]);

        $contactDetail = $client->contactDetails()->create($validated);

        return response()->json([
            'message' => 'Contact detail added successfully',
            'contact_detail' => $contactDetail
        ], 201);
    }

    public function addDocument(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'document_type' => 'required',
            'document_name' => 'nullable',
            'document_number' => 'nullable',
            'remarks' => 'nullable',
            'sharing_option' => 'required',
            'document_path' => 'nullable|file',
        ]);

        $filePath = null;
        if (isset($validated['document_path']) && $validated['document_path'] instanceof \Illuminate\Http\UploadedFile) {
            $filePath = $validated['document_path']->store('client_documents', 'public');
        }

        $document = $client->documents()->create([
            'document_type' => $validated['document_type'],
            'document_name' => $validated['document_name'] ?? null,
            'document_number' => $validated['document_number'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
            'sharing_option' => $validated['sharing_option'],
            'document_path' => $filePath,
        ]);

        return response()->json([
            'message' => 'Document added successfully',
            'document' => $document
        ], 201);
    }

    /**
     * Get contact persons for a client.
     */
    public function getClientContacts(ClientDetail $client)
    {
        try {
            $contacts = $client->contactDetails()
                ->select('id', 'contact_person as name', 'department', 'designation', 'phone', 'email')
                ->orderBy('contact_person')
                ->get();

            return response()->json($contacts);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch client contacts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Modular update: Basic Info
    public function updateBasic(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'contact_no' => 'nullable|string|max:20',
            'gstin_no' => 'nullable|string|max:15',
            'pan_no' => 'nullable|string|max:10',
            'fax' => 'nullable|string|max:20',
            'state' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'correspondence_address' => 'nullable|string|max:500',
            'company_type' => 'required|string|max:100',
            'turnover' => 'required|numeric',
            'range' => 'required|string|max:100',
        ]);
        $client->update($validated);
        return response()->json([
            'message' => 'Basic information updated successfully',
            'client' => $client->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    // Modular update: Bank Accounts
    public function updateBankAccounts(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'bank_accounts' => 'array',
            'bank_accounts.*.account_holder_name' => 'required_with:bank_accounts.*|string|max:255',
            'bank_accounts.*.account_number' => 'required_with:bank_accounts.*|string|max:50',
            'bank_accounts.*.bank_name' => 'required_with:bank_accounts.*|string|max:255',
            'bank_accounts.*.ifsc' => 'required_with:bank_accounts.*|string|max:11',
            'bank_accounts.*.branch_address' => 'nullable|string|max:500',
        ]);
        DB::transaction(function () use ($client, $validated) {
            $client->bankAccounts()->delete();
            if (!empty($validated['bank_accounts'])) {
                foreach ($validated['bank_accounts'] as $account) {
                    $client->bankAccounts()->create($account);
                }
            }
        });
        return response()->json([
            'message' => 'Bank accounts updated successfully',
            'client' => $client->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    // Modular update: Contact Details
    public function updateContactDetails(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'contact_details' => 'array',
            'contact_details.*.contact_person' => 'required_with:contact_details.*|string|max:255',
            'contact_details.*.department' => 'nullable|string|max:100',
            'contact_details.*.designation' => 'nullable|string|max:100',
            'contact_details.*.phone' => 'nullable|string|max:20',
            'contact_details.*.email' => 'nullable|email|max:255',
        ]);
        DB::transaction(function () use ($client, $validated) {
            $client->contactDetails()->delete();
            if (!empty($validated['contact_details'])) {
                foreach ($validated['contact_details'] as $contact) {
                    $client->contactDetails()->create($contact);
                }
            }
        });
        return response()->json([
            'message' => 'Contact details updated successfully',
            'client' => $client->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }

    // Modular update: Documents
    public function updateDocuments(Request $request, ClientDetail $client)
    {
        $validated = $request->validate([
            'documents' => 'array',
            'documents.*.document_type' => 'required_with:documents.*|string|max:100',
            'documents.*.document_name' => 'nullable|string|max:255',
            'documents.*.document_number' => 'nullable|string|max:100',
            'documents.*.remarks' => 'nullable|string|max:500',
            'documents.*.sharing_option' => 'required_with:documents.*|in:public,private',
            'documents.*.document_path' => 'nullable|file|max:10240',
        ]);
        DB::transaction(function () use ($client, $validated, $request) {
            foreach ($client->documents as $document) {
                if ($document->document_path) {
                    Storage::disk('public')->delete($document->document_path);
                }
            }
            $client->documents()->delete();
            if (!empty($validated['documents'])) {
                foreach ($request->documents as $index => $document) {
                    $file = $request->file("documents.$index.document_path");
                    $path = $file ? $file->store('client_documents', 'public') : null;
                    $client->documents()->create([
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
            'client' => $client->fresh(['bankAccounts', 'contactDetails', 'documents'])
        ]);
    }
}
