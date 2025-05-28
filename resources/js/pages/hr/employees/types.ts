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