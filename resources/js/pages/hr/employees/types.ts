// Basic Employee Profile Interface
export interface EmployeeProfile {
  first_name: string;
  last_name: string | null;
  pf_no: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other';
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  pan_no: string | null;
  aadhar_no: string | null;
  guardian_name: string | null;
  contact_no: string | null;
  email: string | null;
  country: string | null;
}

// Educational Qualification Interface
export interface EducationalQualification {
  qualification_type: string;
  institution: string;
  board_university: string;
  year_of_passing: string;
  marks_percentage?: string;
  grade?: string;
  specialization?: string | null;
  medium?: string;
  subject?: string;
}

// Professional Qualification Interface
export interface ProfessionalQualification {
  exam_name: string;
  institution: string;
  division: string | null;
  completion_year: string;
  certificate_number: string | null;
  valid_from: string | null;
  valid_until: string | null;
  remarks: string | null;
}

// Address Interface
export interface Address {
  type: 'permanent' | 'residential' | 'work';
  care_of: string | null;
  house_number: string | null;
  street: string | null;
  landmark: string | null;
  police_station: string | null;
  post_office: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
}

// Document Interface
export interface Document {
  document_type: string;
  document_number: string | null;
  document_path: string;
  issue_date: string | null;
  expiry_date: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  remarks: string | null;
}

// Service Detail Interface
export interface ServiceDetail {
  service_type: string;
  service_start_date: string;
  service_end_date: string | null;
  service_status: 'active' | 'completed' | 'terminated';
  service_location: string;
  service_description: string | null;
}

// Joining Detail Interface
export interface JoiningDetail {
  joining_date: string;
  confirmation_date: string | null;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
  employment_status: 'active' | 'on-leave' | 'terminated';
  notice_period: number;
  reporting_manager: string;
  department: string;
  designation: string;
  cost_center: string | null;
}

// Child Interface
export interface Child {
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
}

// Spouse Interface
export interface Spouse {
  spouse_name: string | null;
  spouse_dob: string | null;
  spouse_telephone: string | null;
  spouse_qualification: string | null;
  marriage_date: string | null;
  spouse_job_details: string | null;
  mother_tongue: 'hindi' | 'english' | 'assamese' | 'bengali' | 'other' | null;
  religion: 'hindu' | 'muslim' | 'christian' | 'jain' | 'buddhist' | 'other' | null;
}

// Nominee Interface
export interface Nominee {
  nominee_name: string | null;
  nominee_relationship: 'father' | 'mother' | 'brother' | 'sister' | 'son' | 'daughter' | 'husband' | 'wife' | 'other' | null;
  nominee_dob: string | null;
  share_percentage: number | null;
}

// Reference Interface
export interface Reference {
  reference_name: string | null;
  designation: string | null;
  reference_address: string | null;
}

// Known Language Interface
export interface KnownLanguage {
  language_name: string | null;
  speak: boolean | null;
  read: boolean | null;
  write: boolean | null;
  priority: number;
}

// Special Training Interface
export interface SpecialTraining {
  training_name: string | null;
  training_place: string | null;
  organized_by: string | null;
  training_start_date: string | null;
  training_end_date: string | null;
}

// Curricular Activity Interface
export interface CurricularActivity {
  event_name: string | null;
  discipline: string | null;
  prize_awarded: string | null;
  event_year: string | null;
}

// Required fields for Educational Qualification
export const REQUIRED_EDUCATIONAL_FIELDS: (keyof EducationalQualification)[] = [
  'qualification_type',
  'institution',
  'board_university',
  'year_of_passing'
];

// Required fields for Professional Qualification
export const REQUIRED_PROFESSIONAL_FIELDS: (keyof ProfessionalQualification)[] = [
  'exam_name',
  'institution',
  'completion_year'
];

export interface EmployeeAddress {
    id: number;
    employee_id: number;
    type: 'permanent' | 'residential' | 'work';
    care_of: string | null;
    house_number: string | null;
    street: string | null;
    landmark: string | null;
    police_station: string | null;
    post_office: string | null;
    city: string | null;
    state: string | null;
    pin_code: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    is_verified: boolean;
}

export interface EmployeeQualification {
    id: number;
    employee_id: number;
    qualification_type: string;
    institution: string;
    board_university: string;
    year_of_passing: string;
    marks_percentage: string;
    grade: string;
    specialization: string | null;
    medium: string;
    subject: string;
}

export interface EmployeeDocument {
    id: number;
    employee_id: number;
    document_type: string;
    document_number: string | null;
    document_path: string;
    issue_date: string | null;
    expiry_date: string | null;
    verification_status: 'pending' | 'verified' | 'rejected';
    remarks: string | null;
}

export interface EmployeeServiceDetail {
    id: number;
    employee_id: number;
    service_type: string;
    service_start_date: string;
    service_end_date: string | null;
    service_status: 'active' | 'completed' | 'terminated';
    service_location: string;
    service_description: string | null;
}

export interface EmployeeJoiningDetail {
    id: number;
    employee_id: number;
    joining_date: string;
    confirmation_date: string | null;
    employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
    employment_status: 'active' | 'on-leave' | 'terminated';
    notice_period: number;
    reporting_manager: string;
    department: string;
    designation: string;
    cost_center: string | null;
}

export interface EmployeeChild {
    id: number;
    employee_id: number;
    name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
}

export interface EmployeeSpouse {
    id: number;
    employee_id: number;
    name: string;
    date_of_birth: string;
    occupation: string | null;
    contact_number: string | null;
}

export interface EmployeeNominee {
    id: number;
    employee_id: number;
    name: string;
    relationship: string;
    contact_number: string;
    address: string;
}

export interface EmployeeReference {
    id: number;
    employee_id: number;
    name: string;
    designation: string;
    organization: string;
    contact_number: string;
    email: string | null;
    relationship: string;
}

export interface EmployeeKnownLanguage {
    id: number;
    employee_id: number;
    language: string;
    proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
}

export interface EmployeeSpecialTraining {
    id: number;
    employee_id: number;
    training_name: string;
    institution: string;
    duration: string;
    completion_date: string;
}

export interface EmployeeCurricularActivity {
    id: number;
    employee_id: number;
    activity_name: string;
    role: string;
    achievement: string | null;
}

export interface Employee {
    id: number;
    first_name: string;
    last_name: string | null;
    pf_no: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other';
    blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
    pan_no: string | null;
    aadhar_no: string | null;
    guardian_name: string | null;
    contact_no: string | null;
    email: string | null;
    country: string | null;
    addresses: EmployeeAddress[];
    educational_qualifications: EmployeeQualification[];
    professional_qualifications: EmployeeQualification[];
    documents: EmployeeDocument[];
    service_details: EmployeeServiceDetail[];
    joining_details: EmployeeJoiningDetail[];
    children: EmployeeChild[];
    spouses: EmployeeSpouse[];
    nominees: EmployeeNominee[];
    references: EmployeeReference[];
    known_languages: EmployeeKnownLanguage[];
    special_trainings: EmployeeSpecialTraining[];
    curricular_activities: EmployeeCurricularActivity[];
    created_at: string | null;
    updated_at: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Props interfaces for components
export interface EditEmployeeProps {
    employee: Employee;
    onClose: () => void;
    onUpdate: (updatedEmployee: Employee) => void;
} 