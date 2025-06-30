import { ClientContactDetail, ClientDetail } from "./client";

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
    status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'cancelled';
    approval_status: 'pending' | 'approved' | 'rejected' | 'not_required';
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
    currency: string;
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
    items: {
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
        item?: {
            id: number;
            name: string;
            description?: string;
            category_id?: number;
            unit?: string;
            purchase_price?: number;
            rental_rate?: number;
        };
    }[];
    // Relations
    enquiry?: {
        id: number;
        enquiry_no: string;
    };
    client?: ClientDetail;
    contact_person?: ClientContactDetail;
    creator?: {
        id: number;
        name: string;
    };
    approver?: {
        id: number;
        name: string;
    } | null;
}

export type QuotationAction = 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel'; 