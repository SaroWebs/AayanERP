import { User } from './user';

export type ClientType = 'individual' | 'company';
export type ClientStatus = 'active' | 'inactive' | 'blacklisted';
export type ClientCategory = 'regular' | 'premium' | 'vip';

export interface ClientDetail {
    id: number;
    name: string;
    type: ClientType;
    status: ClientStatus;
    category: ClientCategory;
    registration_number?: string;
    tax_number?: string;
    website?: string;
    notes?: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relationships
    creator?: User;
    contacts?: ClientContactDetail[];
    addresses?: ClientAddress[];
    enquiries?: Enquiry[];
}

export interface ClientContactDetail {
    id: number;
    client_detail_id: number;
    name: string;
    designation?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    is_primary: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relationships
    client?: ClientDetail;
    enquiries?: Enquiry[];
}

export interface ClientAddress {
    id: number;
    client_detail_id: number;
    type: 'billing' | 'shipping' | 'both';
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relationships
    client?: ClientDetail;
}

export interface ClientFilters {
    search?: string;
    type?: ClientType[];
    status?: ClientStatus[];
    category?: ClientCategory[];
    created_by?: number[];
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

export interface ClientFormData {
    name: string;
    type: ClientType;
    status: ClientStatus;
    category: ClientCategory;
    registration_number?: string;
    tax_number?: string;
    website?: string;
    notes?: string;
}

export interface ClientContactFormData {
    client_detail_id: number;
    name: string;
    designation?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    is_primary: boolean;
    notes?: string;
}

export interface ClientAddressFormData {
    client_detail_id: number;
    type: 'billing' | 'shipping' | 'both';
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
    is_default: boolean;
}

// Constants for UI display
export const CLIENT_TYPE_OPTIONS: { value: ClientType; label: string; color: string }[] = [
    { value: 'individual', label: 'Individual', color: 'blue' },
    { value: 'company', label: 'Company', color: 'green' }
];

export const CLIENT_STATUS_OPTIONS: { value: ClientStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'blacklisted', label: 'Blacklisted', color: 'red' }
];

export const CLIENT_CATEGORY_OPTIONS: { value: ClientCategory; label: string; color: string }[] = [
    { value: 'regular', label: 'Regular', color: 'blue' },
    { value: 'premium', label: 'Premium', color: 'purple' },
    { value: 'vip', label: 'VIP', color: 'gold' }
]; 