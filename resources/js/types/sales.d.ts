export interface Quotation {
    id: number;
    quotation_no: string;
    enquiry_id: number | null;
    client_detail_id: number;
    contact_person_id: number | null;
    subject: string | null;
    description: string | null;
    type: 'equipment' | 'scaffolding' | 'both';
    status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'cancelled';
    approval_status: 'pending' | 'approved' | 'rejected' | 'not_required';
    created_at: string;
    updated_at: string;
    created_by: {
        id: number;
        name: string;
    };
    approved_by: {
        id: number;
        name: string;
    } | null;
    approved_at: string | null;
    quotation_date: string;
    valid_until: string;
    accepted_date: string | null;
    converted_date: string | null;
    subtotal: number;
    tax_percentage: number;
    tax_amount: number;
    discount_percentage: number | null;
    discount_amount: number | null;
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
    items: {
        equipment_id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
        rental_period?: number;
        rental_period_unit?: 'hours' | 'days' | 'months' | 'years';
        notes?: string;
    }[];
    // Relations
    enquiry?: {
        id: number;
        enquiry_no: string;
    };
    client?: {
        id: number;
        name: string;
    };
    contact_person?: {
        id: number;
        name: string;
    };
}

export type QuotationAction = 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel'; 