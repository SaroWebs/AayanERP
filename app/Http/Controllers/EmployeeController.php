<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Employee;
use App\Models\EmpAddress;
use App\Models\EmpDocument;
use App\Models\EmpEducationalQualification;
use App\Models\EmpProfessionalQualification;
use App\Models\EmpServiceDetail;
use App\Models\EmpJoiningDetail;
use App\Models\EmployeeChild;
use App\Models\EmployeeSpouse;
use App\Models\EmployeeNominee;
use App\Models\EmployeeRefference;
use App\Models\EmployeeKnownLanguage;
use App\Models\EmployeeSpecialTraining;
use App\Models\EmployeeCurricularActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $employees = Employee::with([
            'addresses',
            'documents',
            'educational_qualifications',
            'professional_qualifications',
            'service_details',
            'joining_details',
            'children',
            'spouses',
            'nominees',
            'references',
            'known_languages',
            'special_trainings',
            'curricular_activities'
        ])->paginate(20);

        return Inertia::render('hr/employees/index', [
            'employees' => $employees
        ]);
    }

    public function paginatedlist(Request $request)
    {
        $employees = Employee::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->input('sort'), function ($query, $sort, $request) {
                $direction = $request->input('direction', 'asc');
                $query->orderBy($sort, $direction);
            })
            ->paginate($request->input('per_page', 20))
            ->withQueryString();

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            // Create basic employee record
            $employee = Employee::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'pf_no' => $request->pf_no,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'blood_group' => $request->blood_group,
                'pan_no' => $request->pan_no,
                'aadhar_no' => $request->aadhar_no,
                'guardian_name' => $request->guardian_name,
                'contact_no' => $request->contact_no,
                'email' => $request->email,
                'country' => $request->country,
            ]);

            // Store addresses
            if ($request->has('addresses')) {
                foreach ($request->addresses as $address) {
                    $employee->addresses()->create([
                        'type' => $address['type'],
                        'care_of' => $address['care_of'] ?? null,
                        'house_number' => $address['house_number'] ?? null,
                        'street' => $address['street'] ?? null,
                        'landmark' => $address['landmark'] ?? null,
                        'police_station' => $address['police_station'] ?? null,
                        'post_office' => $address['post_office'] ?? null,
                        'city' => $address['city'] ?? null,
                        'state' => $address['state'] ?? null,
                        'pin_code' => $address['pin_code'] ?? null,
                        'country' => $address['country'] ?? null,
                        'phone' => $address['phone'] ?? null,
                        'email' => $address['email'] ?? null,
                        'is_verified' => $address['is_verified'] ?? false,
                    ]);
                }
            }

            // Store educational qualifications
            if ($request->has('educational_qualifications')) {
                foreach ($request->educational_qualifications as $qualification) {
                    $employee->educational_qualifications()->create([
                        'qualification_type' => $qualification['qualification_type'],
                        'institution' => $qualification['institution'],
                        'board_university' => $qualification['board_university'],
                        'year_of_passing' => $qualification['year_of_passing'],
                        'marks_percentage' => $qualification['marks_percentage'] ?? null,
                        'grade' => $qualification['grade'] ?? null,
                        'specialization' => $qualification['specialization'] ?? null,
                        'medium' => $qualification['medium'] ?? null,
                        'subject' => $qualification['subject'] ?? null,
                    ]);
                }
            }

            // Store professional qualifications
            if ($request->has('professional_qualifications')) {
                foreach ($request->professional_qualifications as $qualification) {
                    $employee->professional_qualifications()->create([
                        'qualification_type' => $qualification['exam_name'],
                        'institution' => $qualification['institution'],
                        'board_university' => $qualification['division'] ?? null,
                        'year_of_passing' => $qualification['completion_year'],
                        'marks_percentage' => null,
                        'grade' => null,
                        'specialization' => $qualification['remarks'] ?? null,
                        'medium' => null,
                        'subject' => null,
                    ]);
                }
            }

            // Store documents
            if ($request->has('documents')) {
                foreach ($request->documents as $document) {
                    if ($request->hasFile("documents.{$document['id']}.document_path")) {
                        $file = $request->file("documents.{$document['id']}.document_path");
                        $path = $file->store('employee-documents', 'public');
                    } else {
                        $path = $document['document_path'] ?? null;
                    }

                    $employee->documents()->create([
                        'document_type' => $document['document_type'],
                        'document_number' => $document['document_number'] ?? null,
                        'document_path' => $path,
                        'issue_date' => $document['issue_date'] ?? null,
                        'expiry_date' => $document['expiry_date'] ?? null,
                        'verification_status' => $document['verification_status'] ?? 'pending',
                        'remarks' => $document['remarks'] ?? null,
                    ]);
                }
            }

            // Store service details
            if ($request->has('service_details')) {
                foreach ($request->service_details as $service) {
                    $employee->service_details()->create([
                        'service_type' => $service['service_type'],
                        'service_start_date' => $service['service_start_date'],
                        'service_end_date' => $service['service_end_date'] ?? null,
                        'service_status' => $service['service_status'],
                        'service_location' => $service['service_location'],
                        'service_description' => $service['service_description'] ?? null,
                    ]);
                }
            }

            // Store joining details
            if ($request->has('employment_details')) {
                foreach ($request->employment_details as $detail) {
                    $employee->joining_details()->create([
                        'joining_date' => $detail['joining_date'],
                        'confirmation_date' => $detail['confirmation_date'] ?? null,
                        'employment_type' => $detail['employment_type'],
                        'employment_status' => $detail['employment_status'],
                        'notice_period' => $detail['notice_period'],
                        'reporting_manager' => $detail['reporting_manager'],
                        'department' => $detail['department'],
                        'designation' => $detail['designation'],
                        'cost_center' => $detail['cost_center'] ?? null,
                    ]);
                }
            }

            // Store children
            if ($request->has('children')) {
                foreach ($request->children as $child) {
                    $employee->children()->create([
                        'name' => $child['name'],
                        'date_of_birth' => $child['date_of_birth'],
                        'gender' => $child['gender'],
                    ]);
                }
            }

            // Store spouses
            if ($request->has('spouses')) {
                foreach ($request->spouses as $spouse) {
                    $employee->spouses()->create([
                        'name' => $spouse['spouse_name'],
                        'date_of_birth' => $spouse['spouse_dob'],
                        'occupation' => $spouse['spouse_job_details'],
                        'contact_number' => $spouse['spouse_telephone'],
                    ]);
                }
            }

            // Store nominees
            if ($request->has('nominees')) {
                foreach ($request->nominees as $nominee) {
                    $employee->nominees()->create([
                        'name' => $nominee['nominee_name'],
                        'relationship' => $nominee['nominee_relationship'],
                        'contact_number' => $nominee['nominee_dob'],
                        'address' => '',
                    ]);
                }
            }

            // Store references
            if ($request->has('references')) {
                foreach ($request->references as $reference) {
                    $employee->references()->create([
                        'name' => $reference['reference_name'],
                        'designation' => $reference['designation'],
                        'organization' => '',
                        'contact_number' => '',
                        'email' => null,
                        'relationship' => '',
                    ]);
                }
            }

            // Store known languages
            if ($request->has('known_languages')) {
                foreach ($request->known_languages as $language) {
                    $employee->known_languages()->create([
                        'language' => $language['language_name'],
                        'speak' => $language['speak'] ?? false,
                        'read' => $language['read'] ?? false,
                        'write' => $language['write'] ?? false,
                    ]);
                }
            }

            // Store special trainings
            if ($request->has('special_trainings')) {
                foreach ($request->special_trainings as $training) {
                    $employee->special_trainings()->create([
                        'training_name' => $training['training_name'],
                        'institution' => $training['training_place'],
                        'training_start_date' => $training['training_start_date'],
                        'training_end_date' => $training['training_end_date'],
                    ]);
                }
            }

            // Store curricular activities
            if ($request->has('curricular_activities')) {
                foreach ($request->curricular_activities as $activity) {
                    $employee->curricular_activities()->create([
                        'activity_name' => $activity['event_name'],
                        'role' => $activity['discipline'],
                        'achievement' => $activity['prize_awarded'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Employee created successfully',
                'employee' => $employee->load([
                    'addresses',
                    'documents',
                    'educational_qualifications',
                    'professional_qualifications',
                    'service_details',
                    'joining_details',
                    'children',
                    'spouses',
                    'nominees',
                    'references',
                    'known_languages',
                    'special_trainings',
                    'curricular_activities'
                ])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
