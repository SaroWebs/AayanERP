import { User } from '@/types/index.d';
import { Enquiry } from '@/pages/sales/enquiries/types';
import { ClientDetail, ClientContactDetail } from '@/types/client';
import { Item } from '@/pages/Equipment/Items/types';

export type QuotationStatus = 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted' | 'cancelled';
export type QuotationCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type QuotationPaymentTerm = 'immediate' | 'net15' | 'net30' | 'net45' | 'net60' | 'custom';
export type QuotationValidityUnit = 'days' | 'weeks' | 'months';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';
export type RentalPeriodUnit = 'hours' | 'days' | 'months' | 'years';

export interface Quotation {
    id: number;
    quotation_no: string;
    enquiry_id: number;
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
    valid_until: string;
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
    item_id: number;
    quantity: number;
    nature_of_work: string;
    unit_price: number;
    total_price: number;
    rental_period_unit: 'hours' | 'days' | 'months' | 'years';
    rental_period: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    item?: Item;
}

export interface QuotationAttachment {
    id: number;
    quotation_id: number;
    name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    uploaded_by: number;
    created_at: string;
    updated_at: string;

    // Relationships
    quotation?: Quotation;
    uploader?: User;
}

export interface QuotationFilters {
    search?: string;
    status?: Quotation['status'][];
    approval_status?: Quotation['approval_status'][];
    date_range?: [string, string];
    client_id?: number;
    created_by?: number;
}

export interface QuotationFormData extends Omit<Quotation, 'id' | 'quotation_no' | 'created_by' | 'created_at' | 'updated_at' | 'deleted_at' | 'items' | 'client' | 'contact_person' | 'creator' | 'approver' | 'enquiry'> {
    // Additional form-specific fields if needed
    items: Partial<QuotationItem>[];
}

export interface QuotationTableProps {
    data: Quotation[];
    loading: boolean;
    onStatusChange: (id: number, status: Quotation['status']) => Promise<void>;
    onApprovalStatusChange: (id: number, status: Quotation['approval_status']) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
}

export const QUOTATION_STATUS_OPTIONS: { value: QuotationStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'accepted', label: 'Accepted', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'expired', label: 'Expired', color: 'orange' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];


export const QUOTATION_CURRENCY_OPTIONS: { value: QuotationCurrency; label: string; symbol: string }[] = [
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' }
];

export const QUOTATION_PAYMENT_TERM_OPTIONS: { value: QuotationPaymentTerm; label: string }[] = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'net15', label: 'Net 15' },
    { value: 'net30', label: 'Net 30' },
    { value: 'net45', label: 'Net 45' },
    { value: 'net60', 'label': 'Net 60' },
    { value: 'custom', label: 'Custom' }
];

export const QUOTATION_VALIDITY_UNIT_OPTIONS: { value: QuotationValidityUnit; label: string }[] = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' }
];

export const QUOTATION_STATUS_COLORS: Record<Quotation['status'], string> = {
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

export const QUOTATION_APPROVAL_STATUS_COLORS: Record<Quotation['approval_status'], string> = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red',
    not_required: 'gray'
};
