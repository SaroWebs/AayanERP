import { User } from './user';

export interface PurchaseOrder {
    id: number;
    po_no: string;
    purchase_intent_id: number | null;
    vendor_id: number;
    department_id: number;
    created_by: number;
    approved_by: number | null;
    
    // Order Details
    po_date: string;
    expected_delivery_date: string | null;
    delivery_location: string | null;
    payment_terms: string | null;
    delivery_terms: string | null;
    warranty_terms: string | null;
    special_instructions: string | null;
    
    // Financial Details
    total_amount: number;
    tax_amount: number;
    freight_amount: number;
    insurance_amount: number;
    grand_total: number;
    currency: string;
    exchange_rate: number;
    
    // Quality and Inspection
    quality_requirements: string | null;
    inspection_requirements: string | null;
    testing_requirements: string | null;
    certification_requirements: string | null;
    
    // Status and Tracking
    status: string;
    approval_status: string;
    approval_date: string | null;
    sent_date: string | null;
    acknowledgement_date: string | null;
    cancellation_date: string | null;
    cancellation_reason: string | null;
    rejection_reason: string | null;
    
    // Performance Tracking
    actual_delivery_date: string | null;
    delivery_delay_days: number | null;
    delivery_remarks: string | null;
    quality_remarks: string | null;
    
    // Document References
    quotation_reference: string | null;
    contract_reference: string | null;
    project_reference: string | null;
    
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    
    // Relations
    purchase_intent?: any;
    vendor?: any;
    department?: any;
    creator?: any;
    approver?: any;
    
    // Items (if any)
    items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    item_id: number | null;
    
    // Item Details
    item_name: string;
    item_code: string | null;
    description: string | null;
    specifications: string | null;
    
    // Quantity and Pricing
    quantity: number;
    unit: string | null;
    unit_price: number;
    total_price: number;
    
    // Additional Details
    notes: string | null;
    brand: string | null;
    model: string | null;
    warranty_period: string | null;
    
    // Delivery Details
    expected_delivery_date: string | null;
    delivery_location: string | null;
    
    // Quality and Inspection
    quality_requirements: string | null;
    inspection_requirements: string | null;
    testing_requirements: string | null;
    
    // Status Tracking
    status: string;
    received_quantity: number;
    received_date: string | null;
    receipt_remarks: string | null;
    
    created_at: string;
    updated_at: string;
    
    // Relations
    item?: any;
}

/**
 * Represents a purchase intent as per the database schema.
 */
export interface PurchaseIntent {
    id: number;
    intent_no: string;
    created_by: number;
    approved_by: number | null;
    department_id: number | null;
    subject: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'draft' | 'pending_review' | 'pending_approval' | 'approved' | 'converted' | 'rejected' | 'cancelled';
    approval_status: 'pending' | 'approved' | 'rejected' | 'not_required';
    approved_at: string | null;
    approval_remarks: string | null;
    intent_date: string;
    required_date: string | null;
    converted_date: string | null;
    estimated_cost: number | null;
    currency: string;
    budget_details: string | null;
    justification: string | null;
    specifications: string | null;
    terms_conditions: string | null;
    notes: string | null;
    document_path: string | null;
    specification_document_path: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    creator?: User | null;
    approver?: User | null;
    department?: Department | null;
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
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
    bank_accounts: VendorBankAccount[];
    contact_details: VendorContactDetail[];
    documents: VendorDocument[];
}

export interface VendorBankAccount {
    id: number;
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc: string;
    branch_address: string | null;
}

export interface VendorContactDetail {
    id: number;
    name: string;
    department: string | null;
    designation: string | null;
    phone: string | null;
    email: string | null;
}

export interface VendorDocument {
    id: number;
    document_type: string;
    document_name: string;
    document_number: string;
    remarks: string;
    sharing_option: 'public' | 'private';
    document_path: string | null;
}

export interface Item {
    id: number;
    code: string;
    name: string;
    slug: string;
    category_id: number | null;
    hsn: string | null;

    // Core Details
    description: string | null;
    make: string | null;
    model_no: string | null;
    max_capacity: string | null;
    readability: string | null;
    plateform_size: string | null;
    plateform_moc: string | null;
    indicator_moc: string | null;
    load_plate: string | null;
    indicator_mounding: string | null;
    quality: string | null;

    type: 'consumable' | 'spare_part' | 'tool' | 'material' | 'other';
    unit: 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'kg' | 'ton' | 'box' | 'pack' | 'pcs' | 'na' | null;
    status: 'active' | 'inactive' | 'discontinued' | 'maintenance' | 'retired';

    // Stock Management
    minimum_stock: number;
    current_stock: number;
    maximum_stock: number | null;
    reorder_point: number | null;
    reorder_quantity: number | null;

    // Cost and Pricing
    standard_cost: number | null;
    selling_price: number | null;
    rental_rate: number | null;

    // Specifications
    specifications: any | null;
    technical_details: any | null;
    safety_data: any | null;

    // Location and Storage
    storage_location: string | null;
    storage_conditions: string | null;
    storage_instructions: string | null;

    // Additional Details
    manufacturer: string | null;
    supplier: string | null;
    warranty_period: string | null;
    last_purchase_date: string | null;
    last_purchase_price: number | null;
    condition: 'new' | 'good' | 'fair' | 'poor';
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;

    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    
    // Relations
    category?: {
        id: number;
        name: string;
    };
}

export interface Department {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface Equipment {
    id: number;
    name: string;
    code: string;
    slug: string;
    category_id: number | null;
    equipment_series_id: number | null;
    details: string | null;
    rental_rate: number | null;
    make: string | null;
    model: string | null;
    serial_no: string | null;
    make_year: number | null;
    capacity: string | null;
    stock_unit: string | null;
    unit_weight: string | null;
    rental_unit: string | null;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    location: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    
    // Relations
    category?: {
        id: number;
        name: string;
    };
    equipmentSeries?: {
        id: number;
        name: string;
    };
}

export type PurchaseOrderAction = 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'cancel';

export interface PurchaseOrderFilters {
    status?: string;
    approval_status?: string;
    vendor_id?: number;
    department_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
} 