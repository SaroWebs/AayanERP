import { User } from './user';

export type EnquiryStatus = 'new' | 'pending_follow_up' | 'in_progress' | 'quoted' | 'converted' | 'lost' | 'cancelled';
export type EnquiryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EnquiryType = 'sales' | 'service' | 'rental' | 'spare_parts';
export type EnquirySource = 'website' | 'referral' | 'direct' | 'social_media' | 'other';
export type EnquiryNatureOfWork = 'new_installation' | 'maintenance' | 'repair' | 'upgrade' | 'consultation';
export type EnquiryApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';
export type EnquiryDurationUnit = 'days' | 'weeks' | 'months' | 'years';
export type EnquiryCurrency = 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'INR';

export interface Enquiry {
    id: number;
    enquiry_no: string;
    client_detail_id: number;
    contact_person_id: number;
    equipment_id: number | null;
    subject: string;
    description: string | null;
    type: EnquiryType;
    priority: EnquiryPriority;
    status: EnquiryStatus;
    source: EnquirySource;
    nature_of_work: EnquiryNatureOfWork;
    estimated_value: number | null;
    currency: EnquiryCurrency;
    quantity: number | null;
    duration: number | null;
    duration_unit: EnquiryDurationUnit | null;
    enquiry_date: string;
    required_date: string | null;
    valid_until: string | null;
    next_follow_up_date: string | null;
    converted_date: string | null;
    approval_status: EnquiryApprovalStatus;
    approved_by: number | null;
    approved_at: string | null;
    referred_by: number | null;
    created_by: number;
    assigned_to: number | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relationships
    client?: ClientDetail;
    contact_person?: ClientContactDetail;
    equipment?: Equipment;
    creator?: User;
    assignee?: User;
    approver?: User;
    referrer?: Employee;
    quotations?: Quotation[];
}

export interface EnquiryFilters {
    search?: string;
    status?: EnquiryStatus[];
    priority?: EnquiryPriority[];
    type?: EnquiryType[];
    source?: EnquirySource[];
    nature_of_work?: EnquiryNatureOfWork[];
    approval_status?: EnquiryApprovalStatus[];
    assigned_to?: number[];
    created_by?: number[];
    client?: number[];
    date_range?: [string, string];
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

export interface EnquiryFormData {
    client_detail_id: number;
    contact_person_id: number;
    equipment_id?: number;
    subject: string;
    description?: string;
    type: EnquiryType;
    priority: EnquiryPriority;
    status: EnquiryStatus;
    source: EnquirySource;
    nature_of_work: EnquiryNatureOfWork;
    estimated_value?: number;
    currency: EnquiryCurrency;
    quantity?: number;
    duration?: number;
    duration_unit?: EnquiryDurationUnit;
    enquiry_date: string;
    required_date?: string;
    valid_until?: string;
    next_follow_up_date?: string;
    approval_status: EnquiryApprovalStatus;
    referred_by?: number;
    assigned_to?: number;
}

export interface EnquiryTableProps {
    data: Enquiry[];
    loading: boolean;
    total: number;
    filters: EnquiryFilters;
    onFiltersChange: (filters: EnquiryFilters) => void;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
    onAction: (action: 'view' | 'edit' | 'delete' | 'assign', enquiry: Enquiry) => void;
}

export interface EnquiryActionModalProps {
    opened: boolean;
    onClose: () => void;
    action: 'view' | 'edit' | 'create' | 'assign';
    enquiry?: Enquiry;
    onSubmit: (data: EnquiryFormData) => Promise<void>;
}

// Constants for UI display
export const ENQUIRY_STATUS_OPTIONS: { value: EnquiryStatus; label: string; color: string }[] = [
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'pending_follow_up', label: 'Pending Follow-up', color: 'yellow' },
    { value: 'in_progress', label: 'In Progress', color: 'orange' },
    { value: 'quoted', label: 'Quoted', color: 'purple' },
    { value: 'converted', label: 'Converted', color: 'green' },
    { value: 'lost', label: 'Lost', color: 'red' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

export const ENQUIRY_PRIORITY_OPTIONS: { value: EnquiryPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
];

export const ENQUIRY_TYPE_OPTIONS: { value: EnquiryType; label: string; color: string }[] = [
    { value: 'sales', label: 'Sales', color: 'blue' },
    { value: 'service', label: 'Service', color: 'green' },
    { value: 'rental', label: 'Rental', color: 'purple' },
    { value: 'spare_parts', label: 'Spare Parts', color: 'orange' }
];

export const ENQUIRY_SOURCE_OPTIONS: { value: EnquirySource; label: string; color: string }[] = [
    { value: 'website', label: 'Website', color: 'blue' },
    { value: 'referral', label: 'Referral', color: 'green' },
    { value: 'direct', label: 'Direct', color: 'purple' },
    { value: 'social_media', label: 'Social Media', color: 'pink' },
    { value: 'other', label: 'Other', color: 'gray' }
];

export const ENQUIRY_NATURE_OF_WORK_OPTIONS: { value: EnquiryNatureOfWork; label: string; color: string }[] = [
    { value: 'new_installation', label: 'New Installation', color: 'blue' },
    { value: 'maintenance', label: 'Maintenance', color: 'green' },
    { value: 'repair', label: 'Repair', color: 'orange' },
    { value: 'upgrade', label: 'Upgrade', color: 'purple' },
    { value: 'consultation', label: 'Consultation', color: 'cyan' }
];

export const ENQUIRY_APPROVAL_STATUS_OPTIONS: { value: EnquiryApprovalStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'not_required', label: 'Not Required', color: 'gray' }
];

export const ENQUIRY_DURATION_UNIT_OPTIONS: { value: EnquiryDurationUnit; label: string }[] = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
];

export const ENQUIRY_CURRENCY_OPTIONS: { value: EnquiryCurrency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
    { value: 'SAR', label: 'Saudi Riyal', symbol: '﷼' },
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' }
]; 