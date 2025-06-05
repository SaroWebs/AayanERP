export interface Contact {
    id?: number;
    contact_person: string;
    department: string;
    designation: string;
    email: string;
    phone: string;
    is_active: boolean;
}

export interface BankAccount {
    id?: number;
    account_holder_name: string;
    bank_name: string;
    branch_address: string;
    account_number: string;
    ifsc: string;
}

export interface Document {
    id?: number;
    document_type: string;
    document_name?: string;
    document_number?: string;
    remarks?: string;
    sharing_option: 'public' | 'private';
    document_path?: string | File;
}

export interface ClientForm {
    name: string;
    contact_no: string;
    email: string;
    gstin_no: string | null;
    pan_no: string | null;
    fax: string | null;
    state: string;
    company_type: string;
    turnover: number;
    range: string;
    address: string;
    correspondence_address: string;
} 