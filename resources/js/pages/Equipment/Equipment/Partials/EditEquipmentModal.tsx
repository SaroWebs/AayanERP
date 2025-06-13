import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider } from '@mantine/core';
import { YearPickerInput, DateInput } from '@mantine/dates';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FormDataConvertible } from '@inertiajs/core';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    sort_order: number;
    parent_id: number | null;
}

interface Series {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
}

interface Equipment {
    id: number;
    name: string;
    category_id: number;
    equipment_series_id: number;
    details: string | null;
    rental_rate: number | null;
    make: string | null;
    model: string | null;
    serial_no: string | null;
    code: string | null;
    make_year: number | null;
    capacity: string | null;
    stock_unit: string | null;
    unit_weight: string | null;
    rental_unit: string | null;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    condition: 'new' | 'good' | 'fair' | 'poor' | null;
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    location: string | null;
    notes: string | null;
    temperature_rating: string | null;
    chemical_composition: any | null;
    application_type: string | null;
    technical_specifications: any | null;
    material_safety_data: any | null;
    installation_guidelines: string | null;
    maintenance_requirements: string | null;
    quality_certifications: any | null;
    storage_conditions: any | null;
    batch_number: string | null;
    manufacturing_date: string | null;
    expiry_date: string | null;
    physical_properties: any | null;
    dimensional_specifications: any | null;
    visual_inspection_criteria: any | null;
    category: Category;
    series: Series;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface Props {
    opened: boolean;
    onClose: () => void;
    equipment: Equipment;
    series: Series[];
}

interface FormData {
    // Common details
    name: string;
    category_id: string;
    equipment_series_id: string;
    details: string | null;
    rental_rate: number | null;

    // Equipment Details
    make: string | null;
    model: string | null;
    serial_no: string | null;
    code: string | null;
    make_year: number | null;
    capacity: string | null;
    stock_unit: string | null;
    unit_weight: string | null;
    rental_unit: string | null;

    // Other Details
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    condition: 'new' | 'good' | 'fair' | 'poor' | null;
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    location: string | null;
    notes: string | null;

    // Refractory-specific fields
    temperature_rating: string | null;
    chemical_composition: any | null;
    application_type: string | null;
    technical_specifications: any | null;
    material_safety_data: any | null;
    installation_guidelines: string | null;
    maintenance_requirements: string | null;
    quality_certifications: any | null;
    storage_conditions: any | null;
    batch_number: string | null;
    manufacturing_date: string | null;
    expiry_date: string | null;
    physical_properties: any | null;
    dimensional_specifications: any | null;
    visual_inspection_criteria: any | null;

    [key: string]: FormDataConvertible;
}

export default function EditEquipmentModal({ opened, onClose, equipment, series }: Props) {
    const [categories, setCategories] = useState<Category[]>([]);

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        // Common details
        name: equipment.name,
        category_id: equipment.category_id.toString(),
        equipment_series_id: equipment.equipment_series_id.toString(),
        details: equipment.details,
        rental_rate: equipment.rental_rate,

        // Equipment Details
        make: equipment.make,
        model: equipment.model,
        serial_no: equipment.serial_no,
        code: equipment.code,
        make_year: equipment.make_year,
        capacity: equipment.capacity,
        stock_unit: equipment.stock_unit,
        unit_weight: equipment.unit_weight,
        rental_unit: equipment.rental_unit,

        // Other Details
        status: equipment.status,
        condition: equipment.condition,
        purchase_date: equipment.purchase_date,
        purchase_price: equipment.purchase_price,
        warranty_expiry: equipment.warranty_expiry,
        last_maintenance_date: equipment.last_maintenance_date,
        next_maintenance_date: equipment.next_maintenance_date,
        location: equipment.location,
        notes: equipment.notes,

        // Refractory-specific fields
        temperature_rating: equipment.temperature_rating,
        chemical_composition: equipment.chemical_composition,
        application_type: equipment.application_type,
        technical_specifications: equipment.technical_specifications,
        material_safety_data: equipment.material_safety_data,
        installation_guidelines: equipment.installation_guidelines,
        maintenance_requirements: equipment.maintenance_requirements,
        quality_certifications: equipment.quality_certifications,
        storage_conditions: equipment.storage_conditions,
        batch_number: equipment.batch_number,
        manufacturing_date: equipment.manufacturing_date,
        expiry_date: equipment.expiry_date,
        physical_properties: equipment.physical_properties,
        dimensional_specifications: equipment.dimensional_specifications,
        visual_inspection_criteria: equipment.visual_inspection_criteria,
    });

    useEffect(() => {
        if (opened) {
            reset();
            axios.get(route('equipment.categories.data')).then(response => {
                setCategories(response.data);
            });
        }
    }, [opened]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Submitting form data:', data);
            const response = await axios.put(route('equipment.equipment.update', equipment.id), data);
            console.log('Server response:', response.data);
            
            if (response.status === 200) {
                console.log('Equipment updated successfully:', response.data.data);
                window.location.reload();
                onClose();
            }
        } catch (error: any) {
            console.error('Error updating equipment:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 422) {
                console.log('Validation errors:', error.response.data.errors);
                const errors = error.response.data.errors;
                Object.keys(errors).forEach(key => {
                    setData(key as keyof FormData, data[key as keyof FormData]);
                });
            }
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Edit Equipment" size="xl">
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Grid>
                        <Grid.Col span={6}>
                            <Select
                                label="Category"
                                placeholder="Select category"
                                data={categories.map((category) => ({
                                    value: category.id.toString(),
                                    label: category.name
                                }))}
                                value={data.category_id}
                                onChange={(value) => setData('category_id', value || '')}
                                error={errors.category_id}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Series"
                                placeholder="Select series"
                                data={series.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.name
                                }))}
                                value={data.equipment_series_id}
                                onChange={(value) => setData('equipment_series_id', value || '')}
                                error={errors.equipment_series_id}
                                required
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Basic Information" labelPosition="center" />
                    
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Name"
                                placeholder="Enter equipment name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Code"
                                placeholder="Enter equipment code"
                                value={data.code || ''}
                                onChange={(e) => setData('code', e.target.value || null)}
                                error={errors.code}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Serial Number"
                                placeholder="Enter serial number"
                                value={data.serial_no || ''}
                                onChange={(e) => setData('serial_no', e.target.value || null)}
                                error={errors.serial_no}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Rental Rate"
                                placeholder="Enter rental rate"
                                value={data.rental_rate ?? undefined}
                                onChange={(value) => setData('rental_rate', value === '' ? null : Number(value))}
                                error={errors.rental_rate}
                                min={0}
                                step={0.01}
                                decimalScale={2}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Details"
                                placeholder="Enter equipment details"
                                value={data.details || ''}
                                onChange={(e) => setData('details', e.target.value || null)}
                                error={errors.details}
                                minRows={3}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Equipment Details" labelPosition="center" />
                    
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Make"
                                placeholder="Enter equipment make"
                                value={data.make || ''}
                                onChange={(e) => setData('make', e.target.value || null)}
                                error={errors.make}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Model"
                                placeholder="Enter equipment model"
                                value={data.model || ''}
                                onChange={(e) => setData('model', e.target.value || null)}
                                error={errors.model}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <YearPickerInput
                                label="Make Year"
                                placeholder="Select make year"
                                value={data.make_year?.toString() || null}
                                onChange={(value) => setData('make_year', value ? parseInt(value) : null)}
                                error={errors.make_year}
                                maxDate={new Date()}
                                minDate={new Date(1900, 0)}
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Capacity"
                                placeholder="Enter equipment capacity"
                                value={data.capacity || ''}
                                onChange={(e) => setData('capacity', e.target.value || null)}
                                error={errors.capacity}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Stock Unit"
                                placeholder="Enter stock unit"
                                value={data.stock_unit || ''}
                                onChange={(e) => setData('stock_unit', e.target.value || null)}
                                error={errors.stock_unit}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Unit Weight"
                                placeholder="Enter unit weight"
                                value={data.unit_weight || ''}
                                onChange={(e) => setData('unit_weight', e.target.value || null)}
                                error={errors.unit_weight}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Rental Unit"
                                placeholder="Enter rental unit"
                                value={data.rental_unit || ''}
                                onChange={(e) => setData('rental_unit', e.target.value || null)}
                                error={errors.rental_unit}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Status & Condition" labelPosition="center" />
                    
                    <Grid>
                        <Grid.Col span={6}>
                            <Select
                                label="Status"
                                placeholder="Select status"
                                data={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                    { value: 'maintenance', label: 'Maintenance' },
                                    { value: 'retired', label: 'Retired' },
                                ]}
                                value={data.status}
                                onChange={(value) => setData('status', (value as 'active' | 'inactive' | 'maintenance' | 'retired') || 'active')}
                                error={errors.status}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Condition"
                                placeholder="Select condition"
                                data={[
                                    { value: 'new', label: 'New' },
                                    { value: 'good', label: 'Good' },
                                    { value: 'fair', label: 'Fair' },
                                    { value: 'poor', label: 'Poor' },
                                ]}
                                value={data.condition}
                                onChange={(value) => setData('condition', (value as 'new' | 'good' | 'fair' | 'poor') || null)}
                                error={errors.condition}
                                required
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Additional Information" labelPosition="center" />
                    
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Location"
                                placeholder="Enter location"
                                value={data.location || ''}
                                onChange={(e) => setData('location', e.target.value || null)}
                                error={errors.location}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput
                                label="Purchase Date"
                                placeholder="Select purchase date"
                                valueFormat="YYYY-MM-DD"
                                clearable
                                value={data.purchase_date}
                                onChange={(value) => setData('purchase_date', value)}
                                error={errors.purchase_date}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Purchase Price"
                                placeholder="Enter purchase price"
                                value={data.purchase_price ?? undefined}
                                onChange={(value) => setData('purchase_price', value === '' ? null : Number(value))}
                                error={errors.purchase_price}
                                min={0}
                                step={0.01}
                                decimalScale={2}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput
                                label="Warranty Expiry"
                                placeholder="Select warranty expiry date"
                                valueFormat="YYYY-MM-DD"
                                clearable
                                value={data.warranty_expiry}
                                onChange={(value) => setData('warranty_expiry', value)}
                                error={errors.warranty_expiry}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput
                                label="Last Maintenance Date"
                                placeholder="Select last maintenance date"
                                valueFormat="YYYY-MM-DD"
                                clearable
                                value={data.last_maintenance_date}
                                onChange={(value) => setData('last_maintenance_date', value)}
                                error={errors.last_maintenance_date}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput
                                label="Next Maintenance Date"
                                placeholder="Select next maintenance date"
                                valueFormat="YYYY-MM-DD"
                                clearable
                                value={data.next_maintenance_date}
                                onChange={(value) => setData('next_maintenance_date', value)}
                                error={errors.next_maintenance_date}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Notes"
                                placeholder="Enter additional notes"
                                value={data.notes || ''}
                                onChange={(e) => setData('notes', e.target.value || null)}
                                error={errors.notes}
                                minRows={2}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Refractory Details" labelPosition="center" />
                    
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Temperature Rating"
                                placeholder="Enter temperature rating"
                                value={data.temperature_rating || ''}
                                onChange={(e) => setData('temperature_rating', e.target.value || null)}
                                error={errors.temperature_rating}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Application Type"
                                placeholder="Enter application type"
                                value={data.application_type || ''}
                                onChange={(e) => setData('application_type', e.target.value || null)}
                                error={errors.application_type}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Batch Number"
                                placeholder="Enter batch number"
                                value={data.batch_number || ''}
                                onChange={(e) => setData('batch_number', e.target.value || null)}
                                error={errors.batch_number}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput
                                label="Manufacturing Date"
                                placeholder="Select manufacturing date"
                                valueFormat="YYYY-MM-DD"
                                clearable
                                value={data.manufacturing_date}
                                onChange={(value) => setData('manufacturing_date', value)}
                                error={errors.manufacturing_date}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DateInput
                                label="Expiry Date"
                                placeholder="Select expiry date"
                                valueFormat="YYYY-MM-DD"
                                clearable
                                value={data.expiry_date}
                                onChange={(value) => setData('expiry_date', value)}
                                error={errors.expiry_date}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Installation Guidelines"
                                placeholder="Enter installation guidelines"
                                value={data.installation_guidelines || ''}
                                onChange={(e) => setData('installation_guidelines', e.target.value || null)}
                                error={errors.installation_guidelines}
                                minRows={3}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Maintenance Requirements"
                                placeholder="Enter maintenance requirements"
                                value={data.maintenance_requirements || ''}
                                onChange={(e) => setData('maintenance_requirements', e.target.value || null)}
                                error={errors.maintenance_requirements}
                                minRows={3}
                            />
                        </Grid.Col>
                    </Grid>
                </Stack>

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={processing}>
                        Update Equipment
                    </Button>
                </Group>
            </form>
        </Modal>
    );
} 