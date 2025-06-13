export type EquipmentType = 'excavator' | 'loader' | 'bulldozer' | 'crane' | 'truck' | 'scaffolding' | 'other';
export type EquipmentStatus = 'available' | 'rented' | 'maintenance' | 'retired';

export interface Equipment {
    id: number;
    name: string;
    type: string;
    status: string;
    model?: string;
    serial_number?: string;
    manufacturer?: string;
    year?: number;
    capacity?: string;
    specifications?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
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
