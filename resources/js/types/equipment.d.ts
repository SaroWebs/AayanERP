export type EquipmentType = 'excavator' | 'loader' | 'bulldozer' | 'crane' | 'truck' | 'scaffolding' | 'other';
export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'repair' | 'retired' | 'scrapped';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    sort_order: number;
    parent_id: number | null;
}

export interface Series {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
}

export interface EquipmentPart {
    id: number;
    equipment_id: number;
    item_id: number;
    part_number: string | null;
    location_in_equipment: string | null;
    quantity_required: number;
    is_critical: boolean;
    installation_instructions: string | null;
    maintenance_instructions: string | null;
    specifications: Record<string, any> | null;
    last_replacement_date: string | null;
    replacement_interval_hours: number | null;
    next_replacement_hours: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Equipment {
    id: number;
    // Basic Information
    code: string;
    name: string;
    slug: string;
    category_id: number;
    equipment_series_id: number | null;
    description: string | null;
    
    // Equipment Details
    make: string | null;
    model: string | null;
    serial_no: string | null;
    make_year: number | null;
    capacity: string | null;
    power_rating: string | null;
    fuel_type: string | null;
    operating_conditions: string | null;
    
    // Physical Details
    weight: number | null;
    dimensions_length: number | null;
    dimensions_width: number | null;
    dimensions_height: number | null;
    color: string | null;
    material: string | null;
    
    // Financial Details
    purchase_price: number | null;
    purchase_date: string | null;
    purchase_order_no: string | null;
    supplier: string | null;
    rental_rate: number | null;
    depreciation_rate: number | null;
    current_value: number | null;
    
    // Maintenance Details
    maintenance_frequency: MaintenanceFrequency | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    maintenance_hours: number | null;
    maintenance_instructions: string | null;
    maintenance_checklist: Record<string, any> | null;
    
    // Warranty and Insurance
    warranty_start_date: string | null;
    warranty_end_date: string | null;
    warranty_terms: string | null;
    insurance_policy_no: string | null;
    insurance_expiry_date: string | null;
    insurance_coverage: string | null;
    
    // Location and Status
    status: EquipmentStatus;
    current_location: string | null;
    assigned_to: string | null;
    condition: string | null;
    usage_hours: number;
    
    // Documentation
    technical_specifications: Record<string, any> | null;
    safety_requirements: Record<string, any> | null;
    operating_instructions: Record<string, any> | null;
    certifications: Record<string, any> | null;
    attachments: Record<string, any> | null;
    
    // Additional Details
    notes: string | null;
    special_instructions: string | null;
    custom_fields: Record<string, any> | null;
    
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    
    // Relationships
    category: Category;
    equipment_series: Series | null;
    parts?: EquipmentPart[];
}

export interface EquipmentFormData extends Omit<Equipment, 'id' | 'slug' | 'created_at' | 'updated_at' | 'deleted_at' | 'category' | 'equipment_series' | 'parts'> {
    // Form-specific fields
    category_id: number;
    equipment_series_id: number | null;
}

export interface EquipmentFilters {
    category_id?: string;
    series_id?: string;
    status?: EquipmentStatus;
    search?: string;
}

export interface EquipmentResponse {
    data: Equipment[];
    current_page: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export const EQUIPMENT_TYPE_OPTIONS: { value: EquipmentType; label: string }[] = [
    { value: 'excavator', label: 'Excavator' },
    { value: 'loader', label: 'Loader' },
    { value: 'bulldozer', label: 'Bulldozer' },
    { value: 'crane', label: 'Crane' },
    { value: 'truck', label: 'Truck' },
    { value: 'scaffolding', label: 'Scaffolding' },
    { value: 'other', label: 'Other' }
];

export const EQUIPMENT_STATUS_OPTIONS: { value: EquipmentStatus; label: string; color: string }[] = [
    { value: 'available', label: 'Available', color: 'green' },
    { value: 'rented', label: 'Rented', color: 'blue' },
    { value: 'maintenance', label: 'Maintenance', color: 'orange' },
    { value: 'retired', label: 'Retired', color: 'red' }
];

export interface SimplifiedCategory {
    id: number;
    name: string;
}

export interface Props {
    opened: boolean;
    onClose: () => void;
    equipment: Equipment | null;
    series: Series[];
    categories: SimplifiedCategory[];
}
