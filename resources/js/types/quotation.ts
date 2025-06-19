import { NatureOfWork } from '@/pages/sales/enquiries/types';
import { ClientDetail, ClientContactDetail } from '@/types/client';
import { User } from '@/types/user';

export type QuotationCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type QuotationStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
export type QuotationType = 'equipment' | 'scaffolding' | 'both';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';

export interface QuotationItem {
    id: number;
    quotation_id: number;
    equipment_id: number;
    quantity: number;
    nature_of_work: NatureOfWork;
    unit_price: number;
    total_price: number;
    rental_period_unit: 'hours' | 'days' | 'months' | 'years';
    rental_period: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Quotation {
    id: number;
    quotation_no: string;
    client_detail_id: number;
    contact_person_id: number | null;
    subject: string;
    description: string | null;
    type: QuotationType;
    quotation_date: string;
    valid_until: string;
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
    tax_percentage: number;
    discount_percentage: number;
    client_remarks: string | null;
    status: QuotationStatus;
    approval_status: ApprovalStatus;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    approved_by: number | null;
    approved_at: string | null;
    approval_remarks: string | null;
    accepted_date: string | null;
    converted_date: string | null;
    document_path: string | null;
    sent_at: string | null;
    sent_by: number | null;
    sent_via: string | null;
    enquiry_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relations
    client?: ClientDetail;
    contact_person?: ClientContactDetail;
    approver?: User;
    sender?: User;
    items?: QuotationItem[];
}

export interface QuotationFormData {
    // Client Details
    client_detail_id: number;
    contact_person_id: number | null;
    subject: string;
    description: string | null;
    type: QuotationType;
    quotation_date: string;
    valid_until: string;
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
    tax_percentage: number;
    discount_percentage: number;
    client_remarks: string | null;

    // Status and Approval
    status: QuotationStatus;
    approval_status: ApprovalStatus;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    approved_by: number | null;
    approved_at: string | null;
    approval_remarks: string | null;
    accepted_date: string | null;
    converted_date: string | null;
    document_path: string | null;
    sent_at: string | null;
    sent_by: number | null;
    sent_via: string | null;

    // Relations
    enquiry_id: number;
    items: QuotationItem[];
} 