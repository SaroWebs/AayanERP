import { User } from '@/types/user';
import { ClientDetail, ClientContactDetail } from '@/types/client';
import { Item } from '@/pages/Equipment/Items/types';
import { Quotation } from '@/types/quotation';

export type EnquiryAction = 'view' | 'edit' | 'create' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel';

export type EnquiryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EnquiryStatus = 'draft' | 'pending_review' | 'under_review' | 'quoted' | 'pending_approval' | 'approved' | 'converted' | 'lost' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';
export type EnquirySource = 'website' | 'email' | 'phone' | 'referral' | 'walk_in' | 'other';

interface Client {
    id: number;
    name: string;
    contact_no: string;
    email: string;
    address: string;
    phone: string;
}

interface ContactPerson {
    id: number;
    client_detail_id: number;
    contact_person: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    created_at: string;
    updated_at: string;
}



export interface EnquiryItem {
    id: number;
    enquiry_id: number;
    item_id: number;
    quantity: number;
    estimated_value: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;

    // Relations
    item?: Item;
}

export interface Enquiry {
    id: number;
    enquiry_no: string;
    client_detail_id: number;
    contact_person_id: number | null;
    assigned_to: number | null;
    referred_by: number | null;
    subject: string;
    description: string | null;
    priority: EnquiryPriority;
    status: EnquiryStatus;
    approval_status: ApprovalStatus;
    source: EnquirySource;
    deployment_state: string | null;
    location: string | null;
    site_details: string | null;
    enquiry_date: string;
    required_date: string | null;
    valid_until: string | null;
    estimated_value: number | null;
    currency: string;
    next_follow_up_date: string | null;
    follow_up_notes: string | null;
    special_requirements: string | null;
    terms_conditions: string | null;
    notes: string | null;
    approved_by: number | null;
    approved_at: string | null;
    approval_remarks: string | null;
    converted_date: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    created_by: {
        id: number;
        name: string;
    };
    client?: ClientDetail | null;
    contact_person?: ContactPerson | null;
    assignee?: {
        id: number;
        name: string;
    };
    approver?: {
        id: number;
        name: string;
    };
    items?: EnquiryItem[];
    quotations?: Quotation[];
}

export interface EnquiryFilters {
    search?: string;
    status?: Enquiry['status'][];
    priority?: Enquiry['priority'][];
    source?: Enquiry['source'][];
    date_range?: [string, string];
    client_id?: number;
    assigned_to?: number;
    min_estimated_value?: number;
    max_estimated_value?: number;
}

export interface FormEnquiryItem {
    item_id: number | null;
    quantity: number;
    estimated_value: number | null;
    notes: string | null;
}

export interface EnquiryFormData {
    client_detail_id: number;
    contact_person_id: number | null;
    assigned_to: number | null;
    referred_by: number | null;
    subject: string;
    description: string | null;
    priority: EnquiryPriority;
    status: EnquiryStatus;
    approval_status: ApprovalStatus;
    source: EnquirySource;
    deployment_state: string | null;
    location: string | null;
    site_details: string | null;
    enquiry_date: string;
    required_date: string | null;
    valid_until: string | null;
    estimated_value: number | null;
    currency: string;
    next_follow_up_date: string | null;
    follow_up_notes: string | null;
    special_requirements: string | null;
    terms_conditions: string | null;
    notes: string | null;
    approved_by: number | null;
    approved_at: string | null;
    approval_remarks: string | null;
    converted_date: string | null;
    items: FormEnquiryItem[];
}

export interface EnquiryTableProps {
    data: Enquiry[];
    loading: boolean;
    onStatusChange: (id: number, status: Enquiry['status']) => Promise<void>;
    onPriorityChange: (id: number, priority: Enquiry['priority']) => Promise<void>;
    onAssign: (id: number, userId: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
}

export const ENQUIRY_STATUS_COLORS: Record<Enquiry['status'], string> = {
    draft: 'gray',
    pending_review: 'yellow',
    under_review: 'blue',
    quoted: 'cyan',
    pending_approval: 'orange',
    approved: 'green',
    converted: 'teal',
    lost: 'red',
    cancelled: 'dark'
};

export const ENQUIRY_PRIORITY_COLORS: Record<EnquiryPriority, string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
};

export const ENQUIRY_SOURCE_LABELS: Record<Enquiry['source'], string> = {
    website: 'Website',
    email: 'Email',
    phone: 'Phone',
    referral: 'Referral',
    walk_in: 'Walk-in',
    other: 'Other'
}; 