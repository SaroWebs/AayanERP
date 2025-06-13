import { User } from './user';
import { Enquiry } from './enquiry';
import { ClientDetail, ClientContactDetail } from './client';
import { Equipment } from './equipment';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
export type QuotationType = 'sales' | 'service' | 'rental' | 'spare_parts';
export type QuotationCurrency = 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'INR';
export type QuotationPaymentTerm = 'immediate' | 'net15' | 'net30' | 'net45' | 'net60' | 'custom';
export type QuotationValidityUnit = 'days' | 'weeks' | 'months';

export interface Quotation {
    id: number;
    quotation_no: string;
    enquiry_id: number;
    client_detail_id: number;
    contact_person_id: number;
    type: QuotationType;
    status: QuotationStatus;
    subject: string;
    description?: string;
    currency: QuotationCurrency;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    discount_amount?: number;
    total: number;
    payment_terms: QuotationPaymentTerm;
    custom_payment_terms?: string;
    validity_period: number;
    validity_unit: QuotationValidityUnit;
    valid_until: string;
    notes?: string;
    terms_conditions?: string;
    created_by: number;
    sent_by?: number;
    sent_at?: string;
    accepted_by?: number;
    accepted_at?: string;
    rejected_by?: number;
    rejected_at?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relationships
    enquiry?: Enquiry;
    client?: ClientDetail;
    contact_person?: ClientContactDetail;
    creator?: User;
    sender?: User;
    accepter?: User;
    rejecter?: User;
    items?: QuotationItem[];
    attachments?: QuotationAttachment[];
}

export interface QuotationItem {
    id: number;
    quotation_id: number;
    equipment_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    tax_amount: number;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    discount_amount?: number;
    subtotal: number;
    total: number;
    notes?: string;
    created_at: string;
    updated_at: string;

    // Relationships
    quotation?: Quotation;
    equipment?: Equipment;
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
    status?: QuotationStatus[];
    type?: QuotationType[];
    currency?: QuotationCurrency[];
    client?: number[];
    created_by?: number[];
    date_range?: [string, string];
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

export interface QuotationFormData {
    enquiry_id: number;
    client_detail_id: number;
    contact_person_id: number;
    type: QuotationType;
    subject: string;
    description?: string;
    currency: QuotationCurrency;
    items: QuotationItemFormData[];
    tax_rate: number;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    payment_terms: QuotationPaymentTerm;
    custom_payment_terms?: string;
    validity_period: number;
    validity_unit: QuotationValidityUnit;
    notes?: string;
    terms_conditions?: string;
}

export interface QuotationItemFormData {
    equipment_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    notes?: string;
}

// Constants for UI display
export const QUOTATION_STATUS_OPTIONS: { value: QuotationStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'accepted', label: 'Accepted', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'expired', label: 'Expired', color: 'orange' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

export const QUOTATION_TYPE_OPTIONS: { value: QuotationType; label: string; color: string }[] = [
    { value: 'sales', label: 'Sales', color: 'blue' },
    { value: 'service', label: 'Service', color: 'green' },
    { value: 'rental', label: 'Rental', color: 'purple' },
    { value: 'spare_parts', label: 'Spare Parts', color: 'orange' }
];

export const QUOTATION_CURRENCY_OPTIONS: { value: QuotationCurrency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
    { value: 'SAR', label: 'Saudi Riyal', symbol: '﷼' },
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' }
];

export const QUOTATION_PAYMENT_TERM_OPTIONS: { value: QuotationPaymentTerm; label: string }[] = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'net15', label: 'Net 15' },
    { value: 'net30', label: 'Net 30' },
    { value: 'net45', label: 'Net 45' },
    { value: 'net60', label: 'Net 60' },
    { value: 'custom', label: 'Custom' }
];

export const QUOTATION_VALIDITY_UNIT_OPTIONS: { value: QuotationValidityUnit; label: string }[] = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' }
];