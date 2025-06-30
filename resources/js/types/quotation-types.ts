import { User } from '@/types/index.d';
import { Enquiry } from '@/pages/sales/enquiries/types';
import { ClientDetail, ClientContactDetail } from '@/types/client';
import { Item } from '@/pages/Equipment/Items/types';

export type QuotationStatus = 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'cancelled';
export type QuotationCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';
export type QuotationAction = 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel';

export interface Quotation {
    id: number;
    quotation_no: string;
    enquiry_id: number | null;
    client_detail_id: number;
    contact_person_id: number | null;
    created_by: number;
    approved_by: number | null;
    subject: string | null;
    description: string | null;
    status: QuotationStatus;
    approval_status: ApprovalStatus;
    approved_at: string | null;
    approval_remarks: string | null;
    quotation_date: string;
    valid_until: string | null;
    accepted_date: string | null;
    converted_date: string | null;
    subtotal: number;
    tax_percentage: number;
    tax_amount: number;
    discount_percentage: number;
    discount_amount: number;
    total_amount: number;
    currency: QuotationCurrency;
    payment_terms_days: number;
    advance_percentage: number;
    payment_terms: string | null;
    delivery_terms: string | null;
    deployment_state: string | null;
    location: string | null;
    site_details: string | null;
    special_conditions: string | null;
    terms_conditions: string | null;
    notes: string | null;
    client_remarks: string | null;
    document_path: string | null;
    sent_at: string | null;
    sent_by: string | null;
    sent_via: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;

    // Relations
    enquiry?: Enquiry;
    client?: ClientDetail;
    contact_person?: ClientContactDetail;
    creator?: User;
    approver?: User;
    items?: QuotationItem[];
}

export interface QuotationItem {
    id: number;
    quotation_id: number;
    item_id: number | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    item?: Item;
}

export interface QuotationFilters {
    search?: string;
    status?: QuotationStatus;
    approval_status?: ApprovalStatus;
    client_id?: number;
    from_date?: string;
    to_date?: string;
}

export interface QuotationFormData {
    client_detail_id: number;
    contact_person_id?: number | null;
    enquiry_id?: number | null;
    subject?: string;
    description?: string;
    quotation_date: string;
    valid_until?: string;
    subtotal: number;
    tax_percentage: number;
    tax_amount: number;
    discount_percentage: number;
    discount_amount: number;
    total_amount: number;
    currency: QuotationCurrency;
    payment_terms_days: number;
    advance_percentage: number;
    payment_terms?: string;
    delivery_terms?: string;
    deployment_state?: string;
    location?: string;
    site_details?: string;
    special_conditions?: string;
    terms_conditions?: string;
    notes?: string;
    client_remarks?: string;
    items: QuotationItemFormData[];
}

export interface QuotationItemFormData {
    item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes?: string;
}

export const QUOTATION_STATUS_OPTIONS: { value: QuotationStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'pending_review', label: 'Pending Review', color: 'yellow' },
    { value: 'pending_approval', label: 'Pending Approval', color: 'orange' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'accepted', label: 'Accepted', color: 'teal' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'expired', label: 'Expired', color: 'dark' },
    { value: 'converted', label: 'Converted', color: 'indigo' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

export const QUOTATION_CURRENCY_OPTIONS: { value: QuotationCurrency; label: string; symbol: string }[] = [
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' }
];

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
    draft: 'gray',
    pending_review: 'yellow',
    pending_approval: 'orange',
    approved: 'green',
    sent: 'blue',
    accepted: 'teal',
    rejected: 'red',
    expired: 'dark',
    converted: 'indigo',
    cancelled: 'gray'
};

export const QUOTATION_APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    not_required: 'gray'
}; 