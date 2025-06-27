import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider, Tabs } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import axios from 'axios';
import { FormData } from '../types';


interface Props {
    opened: boolean;
    onClose: () => void;
    loadData: () => void;
}

export default function CreateRefractoryProductModal({ opened, onClose, loadData }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        code: '',
        name: '',
        slug: '',
        category_id: null,
        hsn: '',
        description: '',
        make: '',
        model_no: '',
        max_capacity: '',
        readability: '',
        plateform_size: '',
        plateform_moc: '',
        indicator_moc: '',
        load_plate: '',
        indicator_mounding: '',
        quality: '',
        type: 'consumable',
        unit: null,
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
        storage_location: '',
        storage_conditions: '',
        storage_instructions: '',
        manufacturer: '',
        supplier: '',
        warranty_period: '',
        last_purchase_date: '',
        last_purchase_price: null,
        condition: 'new',
        last_maintenance_date: '',
        next_maintenance_date: '',
        sort_order: 0,
    });

    // Fetch the last code when modal opens
    useEffect(() => {
        if (opened) {
            axios.get(route('equipment.items.last-code'))
                .then(response => {
                    setData('code', response.data.code);
                })
                .catch(error => {
                    console.error('Error fetching last code:', error);
                });
        }
    }, [opened]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.items.store'), {
            onSuccess: () => {
                reset();
                onClose();
                loadData();
            },
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create Refractory Product" size="xl">
            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="basic">
                    <Tabs.List>
                        <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
                        <Tabs.Tab value="technical">Technical Specifications</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic">
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
                                        readOnly
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Name"
                                        placeholder="Enter product name"
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
                                        label="Description"
                                        placeholder="Enter product description"
                                        value={data.description || ''}
                                        onChange={(e) => setData('description', e.target.value || null)}
                                        error={errors.description}
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
                                            { value: 'pcs', label: 'Pieces' },
                                            { value: 'na', label: 'Not Applicable' }
                                        ]}
                                        value={data.unit}
                                        onChange={(value) => setData('unit', value as 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'kg' | 'ton' | 'box' | 'pack' | 'pcs' | 'na' | null)}
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
                                        label="Sort Order"
                                        placeholder="Enter sort order"
                                        value={data.sort_order}
                                        onChange={(value) => setData('sort_order', Number(value))}
                                        error={errors.sort_order}
                                        min={0}
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
                                        onChange={(value) => setData('type', value as 'consumable' | 'spare_part' | 'tool' | 'material' | 'other')}
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
                                            { value: 'discontinued', label: 'Discontinued' },
                                            { value: 'maintenance', label: 'Maintenance' },
                                            { value: 'retired', label: 'Retired' }
                                        ]}
                                        value={data.status}
                                        onChange={(value) => setData('status', (value as 'active' | 'inactive' | 'discontinued' | 'maintenance' | 'retired') || 'active')}
                                        error={errors.status}
                                        required
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="technical">
                        <Stack>
                            <Grid>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Standard Cost"
                                        placeholder="Enter standard cost"
                                        value={data.standard_cost || undefined}
                                        onChange={(value) => setData('standard_cost', value ? Number(value) : null)}
                                        error={errors.standard_cost}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Selling Price"
                                        placeholder="Enter selling price"
                                        value={data.selling_price || undefined}
                                        onChange={(value) => setData('selling_price', value ? Number(value) : null)}
                                        error={errors.selling_price}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Rental Rate"
                                        placeholder="Enter rental rate"
                                        value={data.rental_rate || undefined}
                                        onChange={(value) => setData('rental_rate', value ? Number(value) : null)}
                                        error={errors.rental_rate}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <TextInput
                                        label="Model Number"
                                        placeholder="Enter model number"
                                        value={data.model_no || ''}
                                        onChange={(e) => setData('model_no', e.target.value)}
                                        error={errors.model_no}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <TextInput
                                        label="Max Capacity"
                                        placeholder="Enter max capacity"
                                        value={data.max_capacity || ''}
                                        onChange={(e) => setData('max_capacity', e.target.value || null)}
                                        error={errors.max_capacity}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <TextInput
                                        label="Readability"
                                        placeholder="Enter readability"
                                        value={data.readability || ''}
                                        onChange={(e) => setData('readability', e.target.value || null)}
                                        error={errors.readability}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Specifications"
                                        placeholder="Enter specifications"
                                        value={data.specifications ? JSON.stringify(data.specifications) : ''}
                                        onChange={(e) => setData('specifications', e.target.value ? JSON.parse(e.target.value) : null)}
                                        error={errors.specifications}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Technical Details"
                                        placeholder="Enter technical details"
                                        value={data.technical_details ? JSON.stringify(data.technical_details) : ''}
                                        onChange={(e) => setData('technical_details', e.target.value ? JSON.parse(e.target.value) : null)}
                                        error={errors.technical_details}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Safety Data"
                                        placeholder="Enter safety data"
                                        value={data.safety_data ? JSON.stringify(data.safety_data) : ''}
                                        onChange={(e) => setData('safety_data', e.target.value ? JSON.parse(e.target.value) : null)}
                                        error={errors.safety_data}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Storage Location"
                                        placeholder="Enter storage location"
                                        value={data.storage_location || ''}
                                        onChange={(e) => setData('storage_location', e.target.value || null)}
                                        error={errors.storage_location}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Storage Conditions"
                                        placeholder="Enter storage conditions"
                                        value={data.storage_conditions || ''}
                                        onChange={(e) => setData('storage_conditions', e.target.value || null)}
                                        error={errors.storage_conditions}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Storage Instructions"
                                        placeholder="Enter storage instructions"
                                        value={data.storage_instructions || ''}
                                        onChange={(e) => setData('storage_instructions', e.target.value || null)}
                                        error={errors.storage_instructions}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Manufacturer"
                                        placeholder="Enter manufacturer"
                                        value={data.manufacturer || ''}
                                        onChange={(e) => setData('manufacturer', e.target.value)}
                                        error={errors.manufacturer}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Supplier"
                                        placeholder="Enter supplier"
                                        value={data.supplier || ''}
                                        onChange={(e) => setData('supplier', e.target.value || null)}
                                        error={errors.supplier}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Warranty Period"
                                        placeholder="Enter warranty period"
                                        value={data.warranty_period || ''}
                                        onChange={(e) => setData('warranty_period', e.target.value || null)}
                                        error={errors.warranty_period}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Last Purchase Date"
                                        placeholder="Enter last purchase date"
                                        value={data.last_purchase_date || ''}
                                        onChange={(e) => setData('last_purchase_date', e.target.value || null)}
                                        error={errors.last_purchase_date}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Last Purchase Price"
                                        placeholder="Enter last purchase price"
                                        value={data.last_purchase_price || undefined}
                                        onChange={(value) => setData('last_purchase_price', value ? Number(value) : null)}
                                        error={errors.last_purchase_price}
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
                                            { value: 'poor', label: 'Poor' }
                                        ]}
                                        value={data.condition}
                                        onChange={(value) => setData('condition', value as 'new' | 'good' | 'fair' | 'poor')}
                                        error={errors.condition}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Last Maintenance Date"
                                        placeholder="Enter last maintenance date"
                                        value={data.last_maintenance_date || ''}
                                        onChange={(e) => setData('last_maintenance_date', e.target.value || null)}
                                        error={errors.last_maintenance_date}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Next Maintenance Date"
                                        placeholder="Enter next maintenance date"
                                        value={data.next_maintenance_date || ''}
                                        onChange={(e) => setData('next_maintenance_date', e.target.value || null)}
                                        error={errors.next_maintenance_date}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={processing}>Create Product</Button>
                </Group>
            </form>
        </Modal>
    );
} 