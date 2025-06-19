export interface ClientDetail {
    id: number;
    name: string;
    contact_no: string;
    email: string;
    gstin_no: string | null;
    pan_no: string | null;
    fax: string | null;
    state: string;
    address: string;
    correspondence_address: string | null;
    company_type: 'regional' | 'national' | 'government';
    turnover: number;
    range: 'state' | 'central' | 'NA' | null;
    created_at: string;
    updated_at: string;
    bank_accounts?: ClientBankAccount[];
    contact_details?: ClientContactDetail[];
    documents?: ClientDocument[];
}

export interface ClientBankAccount {
    id: number;
    client_detail_id: number;
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc: string;
    branch_address: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClientContactDetail {
    id: number;
    client_detail_id: number;
    contact_person: string;
    department: string | null;
    designation: string | null;
    phone: string | null;
    email: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClientDocument {
    id: number;
    client_detail_id: number;
    document_type: string;
    document_name: string | null;
    document_number: string | null;
    remarks: string | null;
    sharing_option: 'public' | 'private';
    document_path: string | null;
    created_at: string;
    updated_at: string;
} 