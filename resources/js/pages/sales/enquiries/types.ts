import { FormDataConvertible } from '@inertiajs/core';

export type EnquiryAction = 'create' | 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel';

export interface Enquiry {
    id: number;
    enquiry_no: string;
    client: { id: number; name: string };
    client_id: number;
    subject: string;
    description: string;
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

export interface FormValues extends Record<string, FormDataConvertible> {
    client_id: number;
    subject: string;
    description: string;
}

export const statusColors: Record<string, { color: string; label: string }> = {
    draft: { color: 'gray', label: 'Draft' },
    pending_review: { color: 'yellow', label: 'Pending Review' },
    approved: { color: 'green', label: 'Approved' },
    rejected: { color: 'red', label: 'Rejected' },
    cancelled: { color: 'gray', label: 'Cancelled' },
};

export const approvalStatusColors: Record<string, { color: string; label: string }> = {
    not_required: { color: 'gray', label: 'Not Required' },
    pending: { color: 'yellow', label: 'Pending' },
    approved: { color: 'green', label: 'Approved' },
    rejected: { color: 'red', label: 'Rejected' },
}; 