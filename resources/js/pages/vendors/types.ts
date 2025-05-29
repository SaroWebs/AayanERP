// Base interfaces for form data
export interface BankAccount {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc: string;
    branch_address: string;
}

export interface ContactDetail {
    name: string;
    designation: string;
    mobile: string;
    email: string;
    landline?: string;
    is_primary?: boolean;
}

export interface Document {
    document_type: string;
    document_name: string;
    document_number: string;
    remarks: string;
    sharing_option: 'public' | 'private';
    file?: File | null;
}

export interface VendorForm {
    name: string;
    contact_no: string;
    email: string;
    gstin: string;
    pan_no: string;
    fax: string;
    state: string;
    address: string;
}

// Database model interfaces (with IDs and nullable fields)
export interface VendorBankAccount extends Omit<BankAccount, 'branch_address'> {
    id: number;
    branch_address: string | null;
}

export interface VendorContactDetail extends Omit<ContactDetail, 'department' | 'designation' | 'phone' | 'email'> {
    id: number;
    department: string | null;
    designation: string | null;
    phone: string | null;
    email: string | null;
}

export interface VendorDocument extends Omit<Document, 'file'> {
    id: number;
    document_path: string | null;
}

export interface Vendor {
    id: number;
    name: string;
    contact_no: string;
    email: string;
    gstin: string;
    pan_no: string;
    fax: string;
    state: string;
    address: string;
    created_at: string | null;
    updated_at: string | null;
    bank_accounts: VendorBankAccount[];
    contact_details: VendorContactDetail[];
    documents: VendorDocument[];
}

// Props interfaces for components
export interface EditVendorProps {
    vendor: Vendor;
    onClose: () => void;
    onUpdate: (updatedVendor: Vendor) => void;
}

export interface BankDetailsProps {
    bankAccounts: BankAccount[];
    setBankAccounts: (accounts: BankAccount[]) => void;
    isEdit?: boolean;
}

export interface ContactDetailsProps {
    contactDetails: ContactDetail[];
    setContactDetails: (contacts: ContactDetail[]) => void;
    isEdit?: boolean;
}

export interface DocumentDetailsProps {
    documents: Document[];
    setDocuments: (docs: Document[]) => void;
    isEdit?: boolean;
}
