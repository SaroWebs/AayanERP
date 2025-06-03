import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FormDataConvertible } from '@inertiajs/core';
import axios from 'axios';
import { YearPickerInput } from '@mantine/dates';

interface CategoryType {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Category {
    id: number;
    name: string;
    category_type_id: number;
    categoryType: CategoryType;
}

interface Series {
    id: number;
    name: string;
}

interface Equipment {
    id: number;
    name: string;
    code: string;
    serial_no: string;
    details: string | null;
    rental_rate: number | null;
    make: string | null;
    model: string | null;
    make_year: number | null;
    capacity: string | null;
    stock_unit: string | null;
    unit_weight: string | null;
    rental_unit: string | null;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    condition: 'new' | 'good' | 'fair' | 'poor';
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    location: string | null;
    notes: string | null;
    category_id: number;
    equipment_series_id: number;
    category: Category;
}

interface Props {
    opened: boolean;
    onClose: () => void;
    equipment: Equipment;
    series: Series[];
}

interface FormData {
    name: string;
    code: string;
    serial_no: string;
    details: string | null;
    rental_rate: number | null;
    make: string | null;
    model: string | null;
    make_year: number | null;
    capacity: string | null;
    stock_unit: string | null;
    unit_weight: string | null;
    rental_unit: string | null;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    condition: 'new' | 'good' | 'fair' | 'poor';
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    location: string | null;
    notes: string | null;
    category_id: string;
    equipment_series_id: string;
    [key: string]: FormDataConvertible;
}

export default function EditEquipmentModal({ opened, onClose, equipment, series }: Props) {
    const [variant, setVariant] = useState<'equipment' | 'scaffolding' | ''>(equipment.category?.categoryType?.variant);
    const [categoryTypeId, setCategoryTypeId] = useState(equipment.category.category_type_id.toString());
    const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        name: equipment.name,
        code: equipment.code,
        serial_no: equipment.serial_no,
        details: equipment.details,
        rental_rate: equipment.rental_rate,
        make: equipment.make,
        model: equipment.model,
        make_year: equipment.make_year,
        capacity: equipment.capacity,
        stock_unit: equipment.stock_unit,
        unit_weight: equipment.unit_weight,
        rental_unit: equipment.rental_unit,
        status: equipment.status,
        condition: equipment.condition,
        purchase_date: equipment.purchase_date,
        purchase_price: equipment.purchase_price,
        warranty_expiry: equipment.warranty_expiry,
        last_maintenance_date: equipment.last_maintenance_date,
        next_maintenance_date: equipment.next_maintenance_date,
        location: equipment.location,
        notes: equipment.notes,
        category_id: equipment.category_id.toString(),
        equipment_series_id: equipment.equipment_series_id.toString(),
    });

    useEffect(() => {
        if (opened) {
            setVariant(equipment.category.categoryType.variant);
            setCategoryTypeId(equipment.category.category_type_id.toString());
            // Load initial category types
            axios.get(route('equipment.category-types.data'), {
                params: { variant: equipment.category.categoryType.variant }
            }).then(response => {
                setCategoryTypes(response.data);
                // Load initial categories
                axios.get(route('equipment.categories.data'), {
                    params: { category_type_id: equipment.category.category_type_id }
                }).then(response => {
                    setCategories(response.data);
                });
            });
            setData({
                name: equipment.name,
                code: equipment.code,
                serial_no: equipment.serial_no,
                details: equipment.details,
                rental_rate: equipment.rental_rate,
                make: equipment.make,
                model: equipment.model,
                make_year: equipment.make_year,
                capacity: equipment.capacity,
                stock_unit: equipment.stock_unit,
                unit_weight: equipment.unit_weight,
                rental_unit: equipment.rental_unit,
                status: equipment.status,
                condition: equipment.condition,
                purchase_date: equipment.purchase_date,
                purchase_price: equipment.purchase_price,
                warranty_expiry: equipment.warranty_expiry,
                last_maintenance_date: equipment.last_maintenance_date,
                next_maintenance_date: equipment.next_maintenance_date,
                location: equipment.location,
                notes: equipment.notes,
                category_id: equipment.category_id.toString(),
                equipment_series_id: equipment.equipment_series_id.toString(),
            });
        }
    }, [opened, equipment]);

    // Load category types when variant changes (though it's disabled in edit mode)
    useEffect(() => {
        if (variant) {
            axios.get(route('equipment.category-types.data'), {
                params: { variant }
            }).then(response => {
                setCategoryTypes(response.data);
            });
        } else {
            setCategoryTypes([]);
        }
    }, [variant]);

    // Load categories when category type changes (though it's disabled in edit mode)
    useEffect(() => {
        if (categoryTypeId) {
            axios.get(route('equipment.categories.data'), {
                params: { category_type_id: categoryTypeId }
            }).then(response => {
                setCategories(response.data);
            });
        } else {
            setCategories([]);
        }
    }, [categoryTypeId]);

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

    const renderVariantFields = () => {
        if (variant === 'equipment') {
            return (
                <>
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
                </>
            );
        } else if (variant === 'scaffolding') {
            return (
                <>
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
                </>
            );
        }
        return null;
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Edit Equipment" size="xl">
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Grid>
                        <Grid.Col span={6}>
                            <Select
                                label="Variant"
                                placeholder="Select variant"
                                data={[
                                    { value: 'equipment', label: 'Equipment' },
                                    { value: 'scaffolding', label: 'Scaffolding' }
                                ]}
                                value={variant}
                                onChange={(value) => setVariant(value as 'equipment' | 'scaffolding' | '')}
                                required
                                disabled
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Category Type"
                                placeholder="Select category type"
                                data={categoryTypes.map((type) => ({
                                    value: type.id.toString(),
                                    label: type.name
                                }))}
                                value={categoryTypeId}
                                onChange={(value) => setCategoryTypeId(value || '')}
                                required
                                disabled
                            />
                        </Grid.Col>
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
                                disabled
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
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                error={errors.code || (errors.code && 'This code is already taken')}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Serial Number"
                                placeholder="Enter serial number"
                                value={data.serial_no}
                                onChange={(e) => setData('serial_no', e.target.value)}
                                error={errors.serial_no || (errors.serial_no && 'This serial number is already taken')}
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
                    </Grid>

                    {variant && (
                        <>
                            <Divider label={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Details`} labelPosition="center" />
                            <Grid>
                                {renderVariantFields()}
                            </Grid>
                        </>
                    )}

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
                                onChange={(value) => setData('condition', (value as 'new' | 'good' | 'fair' | 'poor') || 'good')}
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
                            <TextInput
                                type="date"
                                label="Purchase Date"
                                value={data.purchase_date || ''}
                                onChange={(e) => setData('purchase_date', e.target.value || null)}
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
                            <TextInput
                                type="date"
                                label="Warranty Expiry"
                                value={data.warranty_expiry || ''}
                                onChange={(e) => setData('warranty_expiry', e.target.value || null)}
                                error={errors.warranty_expiry}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                type="date"
                                label="Last Maintenance Date"
                                value={data.last_maintenance_date || ''}
                                onChange={(e) => setData('last_maintenance_date', e.target.value || null)}
                                error={errors.last_maintenance_date}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                type="date"
                                label="Next Maintenance Date"
                                value={data.next_maintenance_date || ''}
                                onChange={(e) => setData('next_maintenance_date', e.target.value || null)}
                                error={errors.next_maintenance_date}
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