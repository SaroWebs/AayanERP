import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { FormDataConvertible } from '@inertiajs/core';
import { useEffect } from 'react';

interface Category {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Item {
    id: number;
    code: string;
    name: string;
    slug: string;
    category_id: number | null;
    category?: {
        id: number;
        name: string;
    };
    hsn: string | null;
    description_1: string | null;
    description_2: string | null;
    type: 'consumable' | 'spare_part' | 'tool' | 'material' | 'other';
    unit: 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'kg' | 'ton' | 'box' | 'pack' | 'na' | null;
    applicable_for: 'all' | 'equipment' | 'scaffolding' | 'refractory';
    status: 'active' | 'inactive' | 'discontinued';
    minimum_stock: number;
    current_stock: number;
    maximum_stock: number | null;
    reorder_point: number | null;
    reorder_quantity: number | null;
    standard_cost: number | null;
    selling_price: number | null;
    rental_rate: number | null;
    specifications: Record<string, any> | null;
    technical_details: Record<string, any> | null;
    safety_data: Record<string, any> | null;
    storage_location: string | null;
    storage_conditions: string | null;
    storage_instructions: string | null;
    manufacturer: string | null;
    supplier: string | null;
    warranty_period: string | null;
    last_purchase_date: string | null;
    last_purchase_price: number | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface Props {
    opened: boolean;
    onClose: () => void;
    item: Item | null;
    loadData: () => void;
}

interface FormData {
    name: string;
    code: string;
    description_1: string | null;
    description_2: string | null;
    category_id: number | null;
    hsn: string | null;
    type: 'consumable' | 'spare_part' | 'tool' | 'material' | 'other';
    unit: 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'kg' | 'ton' | 'box' | 'pack' | 'na' | null;
    applicable_for: 'all' | 'equipment' | 'scaffolding' | 'refractory';
    status: 'active' | 'inactive' | 'discontinued';
    minimum_stock: number;
    current_stock: number;
    maximum_stock: number | null;
    reorder_point: number | null;
    reorder_quantity: number | null;
    standard_cost: number | null;
    selling_price: number | null;
    rental_rate: number | null;
    specifications: Record<string, any> | null;
    technical_details: Record<string, any> | null;
    safety_data: Record<string, any> | null;
    storage_location: string | null;
    storage_conditions: string | null;
    storage_instructions: string | null;
    manufacturer: string | null;
    supplier: string | null;
    warranty_period: string | null;
    last_purchase_date: string | null;
    last_purchase_price: number | null;
    sort_order: number;
    [key: string]: FormDataConvertible;
}

export default function EditItemModal({ opened, onClose, item, loadData }: Props) {
    const defaultValues: FormData = {
        name: '',
        code: '',
        description_1: null,
        description_2: null,
        category_id: null,
        hsn: null,
        type: 'consumable',
        unit: null,
        applicable_for: 'all',
        status: 'active',
        minimum_stock: 0,
        current_stock: 0,
        maximum_stock: null,
        reorder_point: null,
        reorder_quantity: null,
        standard_cost: null,
        selling_price: null,
        rental_rate: null,
        specifications: null,
        technical_details: null,
        safety_data: null,
        storage_location: null,
        storage_conditions: null,
        storage_instructions: null,
        manufacturer: null,
        supplier: null,
        warranty_period: null,
        last_purchase_date: null,
        last_purchase_price: null,
        sort_order: 0,
    };

    const { data, setData, put, processing, errors } = useForm<FormData>(
        item ? {
            ...defaultValues,
            ...item,
        } : defaultValues
    );

    // Update form data when item changes
    useEffect(() => {
        if (opened) {
            setData('name', item?.name || '');
            setData('code', item?.code || '');
            setData('description_1', item?.description_1 || '');
            setData('description_2', item?.description_2 || '');
            setData('category_id', item?.category_id || null);
            setData('hsn', item?.hsn || '');
            setData('type', item?.type || 'consumable');
            setData('unit', item?.unit || 'set');
            setData('applicable_for', item?.applicable_for || 'all');
            setData('status', item?.status || 'active');
            setData('minimum_stock', item?.minimum_stock || 0);
            setData('current_stock', item?.current_stock || 0);
            setData('maximum_stock', item?.maximum_stock || null);
            setData('reorder_point', item?.reorder_point || null);
            setData('reorder_quantity', item?.reorder_quantity || null);
            setData('standard_cost', item?.standard_cost || null);
            setData('selling_price', item?.selling_price || null);
            setData('rental_rate', item?.rental_rate || null);
            setData('specifications', item?.specifications || null);
            setData('technical_details', item?.technical_details || null);
            setData('safety_data', item?.safety_data || null);
            setData('storage_location', item?.storage_location || '');
            setData('storage_conditions', item?.storage_conditions || '');
            setData('storage_instructions', item?.storage_instructions || '');
            setData('manufacturer', item?.manufacturer || '');
            setData('supplier', item?.supplier || '');
            setData('warranty_period', item?.warranty_period || '');
            setData('last_purchase_date', item?.last_purchase_date || '');
            setData('last_purchase_price', item?.last_purchase_price || null);
            setData('sort_order', item?.sort_order || 0);
        }
    }, [item, opened]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('equipment.items.update', item?.id), {
            onSuccess: () => {
                onClose();
                loadData();
            },
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Edit Item" size="xl">
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Grid>
                        <Grid.Col span={3}>
                            <TextInput
                                label="Code"
                                placeholder="Enter item code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                error={errors.code}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Name"
                                placeholder="Enter item name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <TextInput
                                label="HSN Code"
                                placeholder="Enter HSN code"
                                value={data.hsn || ''}
                                onChange={(e) => setData('hsn', e.target.value || null)}
                                error={errors.hsn}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Descriptions" labelPosition="center" />

                    <Grid>
                        <Grid.Col span={6}>
                            <Textarea
                                label="Description 1"
                                placeholder="Enter primary description"
                                value={data.description_1 || ''}
                                onChange={(e) => setData('description_1', e.target.value || null)}
                                error={errors.description_1}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Textarea
                                label="Description 2"
                                placeholder="Enter secondary description"
                                value={data.description_2 || ''}
                                onChange={(e) => setData('description_2', e.target.value || null)}
                                error={errors.description_2}
                            />
                        </Grid.Col>
                    </Grid>

                    <Divider label="Stock Information" labelPosition="center" />

                    <Grid>
                        <Grid.Col span={3}>
                            <Select
                                label="Unit"
                                placeholder="Select unit"
                                data={[
                                    { value: 'set', label: 'Set' },
                                    { value: 'nos', label: 'Numbers' },
                                    { value: 'rmt', label: 'Running Meter' },
                                    { value: 'sqm', label: 'Square Meter' },
                                    { value: 'ltr', label: 'Liter' },
                                    { value: 'kg', label: 'Kilogram' },
                                    { value: 'ton', label: 'Ton' },
                                    { value: 'box', label: 'Box' },
                                    { value: 'pack', label: 'Pack' },
                                    { value: 'na', label: 'Not Applicable' }
                                ]}
                                value={data.unit}
                                onChange={(value) => setData('unit', value as 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'kg' | 'ton' | 'box' | 'pack' | 'na' | null)}
                                error={errors.unit}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Minimum Stock"
                                placeholder="Enter minimum stock level"
                                value={data.minimum_stock}
                                onChange={(value) => setData('minimum_stock', Number(value))}
                                error={errors.minimum_stock}
                                min={0}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Current Stock"
                                placeholder="Enter current stock"
                                value={data.current_stock}
                                onChange={(value) => setData('current_stock', Number(value))}
                                error={errors.current_stock}
                                min={0}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Maximum Stock"
                                placeholder="Enter maximum stock level"
                                value={data.maximum_stock || undefined}
                                onChange={(value) => setData('maximum_stock', value ? Number(value) : null)}
                                error={errors.maximum_stock}
                                min={0}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Reorder Point"
                                placeholder="Enter reorder point"
                                value={data.reorder_point || undefined}
                                onChange={(value) => setData('reorder_point', value ? Number(value) : null)}
                                error={errors.reorder_point}
                                min={0}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Reorder Quantity"
                                placeholder="Enter reorder quantity"
                                value={data.reorder_quantity || undefined}
                                onChange={(value) => setData('reorder_quantity', value ? Number(value) : null)}
                                error={errors.reorder_quantity}
                                min={0}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Standard Cost"
                                placeholder="Enter standard cost"
                                value={data.standard_cost || undefined}
                                onChange={(value) => setData('standard_cost', value ? Number(value) : null)}
                                error={errors.standard_cost}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Selling Price"
                                placeholder="Enter selling price"
                                value={data.selling_price || undefined}
                                onChange={(value) => setData('selling_price', value ? Number(value) : null)}
                                error={errors.selling_price}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <NumberInput
                                label="Rental Rate"
                                placeholder="Enter rental rate"
                                value={data.rental_rate || undefined}
                                onChange={(value) => setData('rental_rate', value ? Number(value) : null)}
                                error={errors.rental_rate}
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Select
                                label="Type"
                                placeholder="Select type"
                                data={[
                                    { value: 'consumable', label: 'Consumable' },
                                    { value: 'spare_part', label: 'Spare Part' },
                                    { value: 'tool', label: 'Tool' },
                                    { value: 'material', label: 'Material' },
                                    { value: 'other', label: 'Other' }
                                ]}
                                value={data.type}
                                onChange={(value) => setData('type', (value as 'consumable' | 'spare_part' | 'tool' | 'material' | 'other') || 'consumable')}
                                error={errors.type}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Select
                                label="Status"
                                placeholder="Select status"
                                data={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                    { value: 'discontinued', label: 'Discontinued' }
                                ]}
                                value={data.status}
                                onChange={(value) => setData('status', (value as 'active' | 'inactive' | 'discontinued') || 'active')}
                                error={errors.status}
                                required
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={processing}>Update Item</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 