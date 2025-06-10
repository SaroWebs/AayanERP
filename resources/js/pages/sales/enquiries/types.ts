import { FormDataConvertible } from '@inertiajs/core';

export type EnquiryAction = 'create' | 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel';

export interface Enquiry {
    id: number;
    enquiry_no: string;
    client: { id: number; name: string };
    client_id: number;
    client_detail_id: number;
    contact_person_id: number | null;
    referred_by: number | null;
    subject: string;
    description: string;
    type: 'equipment' | 'scaffolding' | 'both';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    source: 'website' | 'email' | 'phone' | 'referral' | 'walk_in' | 'other';
    equipment_id: number | null;
    quantity: number;
    nature_of_work: 'soil' | 'rock' | 'limestone' | 'coal' | 'sand' | 'gravel' | 'construction' | 'demolition' | 'mining' | 'quarry' | 'other';
    duration: number | null;
    duration_unit: 'hours' | 'days' | 'months' | 'years';
    deployment_state: string;
    location: string;
    site_details: string;
    enquiry_date: string;
    required_date: string | null;
    valid_until: string | null;
    estimated_value: number | null;
    currency: string;
    special_requirements: string;
    terms_conditions: string;
    notes: string;
    status: string;
    approval_status: string;
    created_at: string;
    created_by: { id: number; name: string };
}

export interface EnquiryFilters {
    status?: string;
    approval_status?: string;
    client_id?: number;
    from_date?: Date | null;
    to_date?: Date | null;
    search?: string;
}

export interface FormValues {
    // Client Information
    client_detail_id: string;
    contact_person_id: number | null;
    referred_by: number | null;
    
    // Basic Information
    subject: string;
    description: string;
    type: 'equipment' | 'scaffolding' | 'both';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    source: 'website' | 'email' | 'phone' | 'referral' | 'walk_in' | 'other';
    
    // Equipment Details
    equipment_id: string | null;
    quantity: number;
    nature_of_work: 'soil' | 'rock' | 'limestone' | 'coal' | 'sand' | 'gravel' | 'construction' | 'demolition' | 'mining' | 'quarry' | 'other';
    duration: number | null;
    duration_unit: 'hours' | 'days' | 'months' | 'years';
    
    // Location Details
    deployment_state: string;
    location: string;
    site_details: string;
    
    // Dates
    enquiry_date: Date;
    required_date: Date | null;
    valid_until: Date | null;
    
    // Financial Details
    estimated_value: number | null;
    currency: string;
    
    // Additional Details
    special_requirements: string;
    terms_conditions: string;
    notes: string;
}

export const statusColors: Record<string, { color: string; label: string }> = {
    draft: { color: 'gray', label: 'Draft' },
    pending_review: { color: 'yellow', label: 'Pending Review' },
    approved: { color: 'green', label: 'Approved' },
    rejected: { color: 'red', label: 'Rejected' },
    cancelled: { color: 'gray', label: 'Cancelled' },
    converted : { color: 'teal', label: 'Converted' },
};

export const approvalStatusColors: Record<string, { color: string; label: string }> = {
    not_required: { color: 'gray', label: 'Not Required' },
    pending: { color: 'yellow', label: 'Pending' },
    approved: { color: 'green', label: 'Approved' },
    rejected: { color: 'red', label: 'Rejected' },
}; 