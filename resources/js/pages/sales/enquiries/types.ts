import { User } from '@/types/user';
import { ClientDetail, ClientContactDetail } from '@/types/client';
import { Equipment } from '@/types/equipment';
import { Quotation } from '@/types/quotation';

export type EnquiryAction = 'view' | 'edit' | 'create' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel';

export type EnquiryType = 'equipment' | 'scaffolding' | 'both';
export type EnquiryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EnquiryStatus = 'draft' | 'pending_review' | 'under_review' | 'quoted' | 'pending_approval' | 'approved' | 'converted' | 'lost' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';
export type EnquirySource = 'website' | 'email' | 'phone' | 'referral' | 'walk_in' | 'other';
export type NatureOfWork = 'soil' | 'rock' | 'limestone' | 'coal' | 'sand' | 'gravel' | 'construction' | 'demolition' | 'mining' | 'quarry' | 'other';
export type DurationUnit = 'hours' | 'days' | 'months' | 'years';

export interface Enquiry {
    id: number;
    enquiry_no: string;
    client_detail_id: number;
    contact_person_id: number | null;
    created_by: number;
    assigned_to: number | null;
    referred_by: number | null;
    subject: string | null;
    description: string | null;
    type: 'equipment' | 'scaffolding' | 'both';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'draft' | 'pending_review' | 'under_review' | 'quoted' | 'pending_approval' | 'approved' | 'converted' | 'lost' | 'cancelled';
    approval_status: 'pending' | 'approved' | 'rejected' | 'not_required';
    approved_by: number | null;
    approved_at: string | null;
    approval_remarks: string | null;
    source: 'website' | 'email' | 'phone' | 'referral' | 'walk_in' | 'other';
    equipment_id: number | null;
    quantity: number;
    nature_of_work: 'soil' | 'rock' | 'limestone' | 'coal' | 'sand' | 'gravel' | 'construction' | 'demolition' | 'mining' | 'quarry' | 'other';
    duration: number | null;
    duration_unit: 'hours' | 'days' | 'months' | 'years';
    deployment_state: string | null;
    location: string | null;
    site_details: string | null;
    enquiry_date: string;
    required_date: string | null;
    valid_until: string | null;
    converted_date: string | null;
    estimated_value: number | null;
    currency: string;
    next_follow_up_date: string | null;
    follow_up_notes: string | null;
    special_requirements: string | null;
    terms_conditions: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relations
    client?: ClientDetail;
    contact_person?: ClientContactDetail;
    creator?: User;
    assignee?: User;
    equipment?: Equipment;
    quotations?: Quotation[];
}

export interface EnquiryFilters {
    search?: string;
    status?: Enquiry['status'][];
    priority?: Enquiry['priority'][];
    type?: Enquiry['type'][];
    source?: Enquiry['source'][];
    date_range?: [string, string];
    client_id?: number;
    assigned_to?: number;
    nature_of_work?: Enquiry['nature_of_work'][];
}

export interface EnquiryFormData extends Omit<Enquiry, 'id' | 'enquiry_no' | 'created_by' | 'created_at' | 'updated_at' | 'deleted_at'> {
    // Additional form-specific fields if needed
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

export const ENQUIRY_PRIORITY_COLORS: Record<Enquiry['priority'], string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
};

export const ENQUIRY_TYPE_LABELS: Record<Enquiry['type'], string> = {
    equipment: 'Equipment',
    scaffolding: 'Scaffolding',
    both: 'Both'
};

export const ENQUIRY_SOURCE_LABELS: Record<Enquiry['source'], string> = {
    website: 'Website',
    email: 'Email',
    phone: 'Phone',
    referral: 'Referral',
    walk_in: 'Walk In',
    other: 'Other'
};

export const NATURE_OF_WORK_LABELS: Record<Enquiry['nature_of_work'], string> = {
    soil: 'Soil',
    rock: 'Rock',
    limestone: 'Limestone',
    coal: 'Coal',
    sand: 'Sand',
    gravel: 'Gravel',
    construction: 'Construction',
    demolition: 'Demolition',
    mining: 'Mining',
    quarry: 'Quarry',
    other: 'Other'
}; 