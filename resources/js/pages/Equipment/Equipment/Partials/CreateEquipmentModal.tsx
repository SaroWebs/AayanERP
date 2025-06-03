import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FormDataConvertible } from '@inertiajs/core';
import axios from 'axios';

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

interface Props {
    opened: boolean;
    onClose: () => void;
    series: Series[];
}

interface FormData {
    name: string;
    category_id: string;
    equipment_series_id: string;
    details: string | null;
    rental_rate: number | null;
    make: string | null;
    model: string | null;
    serial_no: string;
    code: string;
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
    [key: string]: FormDataConvertible;
}

export default function CreateEquipmentModal({ opened, onClose, series }: Props) {
    const [variant, setVariant] = useState<'equipment' | 'scaffolding' | ''>('');
    const [categoryTypeId, setCategoryTypeId] = useState('');
    const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        category_id: '',
        equipment_series_id: '',
        details: null,
        rental_rate: null,
        make: null,
        model: null,
        serial_no: '',
        code: '',
        make_year: null,
        capacity: null,
        stock_unit: null,
        unit_weight: null,
        rental_unit: null,
        status: 'active',
        condition: 'good',
        purchase_date: null,
        purchase_price: null,
        warranty_expiry: null,
        last_maintenance_date: null,
        next_maintenance_date: null,
        location: null,
        notes: null,
    });

    useEffect(() => {
        if (!opened) {
            reset();
            setVariant('');
            setCategoryTypeId('');
            setCategoryTypes([]);
            setCategories([]);
        }
    }, [opened]);

    // Load category types when variant changes
    useEffect(() => {
        if (variant) {
            axios.get(route('equipment.category-types.data'), {
                params: { variant }
            }).then(response => {
                setCategoryTypes(response.data);
                setCategoryTypeId('');
                setData('category_id', '');
                setCategories([]);
            });
        } else {
            setCategoryTypes([]);
            setCategoryTypeId('');
            setData('category_id', '');
            setCategories([]);
        }
    }, [variant]);

    // Load categories when category type changes
    useEffect(() => {
        if (categoryTypeId) {
            axios.get(route('equipment.categories.data'), {
                params: { category_type_id: categoryTypeId }
            }).then(response => {
                setCategories(response.data);
                setData('category_id', '');
            });
        } else {
            setCategories([]);
            setData('category_id', '');
        }
    }, [categoryTypeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Submitting form data:', data);
            const response = await axios.post(route('equipment.equipment.store'), data);
            console.log('Server response:', response.data);
            
            if (response.status === 200) {
                console.log('Equipment created successfully:', response.data.data);
                window.location.reload();
                onClose();
            }
        } catch (error: any) {
            console.error('Error creating equipment:', {
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
                    <Grid.Col span={3}>
                        <TextInput
                            label="Code"
                            placeholder="Enter equipment code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            error={errors.code || (errors.code && 'This code is already taken')}
                            required
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            label="Serial Number"
                            placeholder="Enter serial number"
                            value={data.serial_no}
                            onChange={(e) => setData('serial_no', e.target.value)}
                            error={errors.serial_no || (errors.serial_no && 'This serial number is already taken')}
                            required
                        />
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <TextInput
                            label="Make"
                            placeholder="Enter equipment make"
                            value={data.make || ''}
                            onChange={(e) => setData('make', e.target.value || null)}
                            error={errors.make}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            label="Model"
                            placeholder="Enter equipment model"
                            value={data.model || ''}
                            onChange={(e) => setData('model', e.target.value || null)}
                            error={errors.model}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <YearPickerInput
                            label="Make Year"
                            placeholder="Select make year"
                            value={data.make_year?.toString() || null}
                            onChange={(value) => setData('make_year', value ? parseInt(value) : null)}
                            error={errors.make_year}
                            maxDate={new Date()}
                            minDate={new Date(1800, 0)}
                            clearable
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <TextInput
                            label="Capacity"
                            placeholder="Enter equipment capacity"
                            value={data.capacity || ''}
                            onChange={(e) => setData('capacity', e.target.value || null)}
                            error={errors.capacity}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <NumberInput
                            label="Rental Rate"
                            placeholder="Enter rental rate"
                            value={data.rental_rate ?? undefined}
                            onChange={(value) => setData('rental_rate', value === '' ? null : Number(value))}
                            error={errors.rental_rate}
                            min={0}
                            step={0.01}
                            decimalScale={2}
                            required
                        />
                    </Grid.Col>
                </>
            );
        } else if (variant === 'scaffolding') {
            return (
                <>
                    <Grid.Col span={4}>
                        <TextInput
                            label="Stock Unit"
                            placeholder="Enter stock unit"
                            value={data.stock_unit || ''}
                            onChange={(e) => setData('stock_unit', e.target.value || null)}
                            error={errors.stock_unit}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput
                            label="Unit Weight"
                            placeholder="Enter unit weight"
                            value={data.unit_weight || ''}
                            onChange={(e) => setData('unit_weight', e.target.value || null)}
                            error={errors.unit_weight}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <TextInput
                            label="Rental Unit"
                            placeholder="Enter rental unit"
                            value={data.rental_unit || ''}
                            onChange={(e) => setData('rental_unit', e.target.value || null)}
                            error={errors.rental_unit}
                        />
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <NumberInput
                            label="Rental Rate"
                            placeholder="Enter rental rate"
                            value={data.rental_rate ?? undefined}
                            onChange={(value) => setData('rental_rate', value === '' ? null : Number(value))}
                            error={errors.rental_rate}
                            min={0}
                            step={0.01}
                            decimalScale={2}
                            required
                        />
                    </Grid.Col>
                </>
            );
        }
        return null;
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create Equipment" size="100%">
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Grid>
                        <Grid.Col span={3}>
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
                            />
                        </Grid.Col>
                        {variant && (
                            <Grid.Col span={3}>
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
                                />
                            </Grid.Col>
                        )}
                        {categoryTypeId && (
                            <Grid.Col span={3}>
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
                        )}
                        <Grid.Col span={3}>
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
                        <Grid.Col span={12}>
                            <TextInput
                                label="Name"
                                placeholder="Enter equipment name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
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

                    <Grid>
                        <Grid.Col span={3}>
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
                    </Grid>
                </Stack>

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={processing}>
                        Create Equipment
                    </Button>
                </Group>
            </form>
        </Modal>
    );
} 