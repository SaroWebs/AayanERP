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


export default function CreateItemModal({ opened, onClose, loadData }: Props) {
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
        last_purchase_date: null,
        last_purchase_price: null,
        condition: 'new',
        last_maintenance_date: null,
        next_maintenance_date: null,
        sort_order: 0,
    });

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
        <Modal opened={opened} onClose={onClose} title="Create Inventory Item" size="xl">
            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="general">
                    <Tabs.List>
                        <Tabs.Tab value="general">General</Tabs.Tab>
                        <Tabs.Tab value="specifications">Specifications</Tabs.Tab>
                        <Tabs.Tab value="storage">Storage & Details</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="general">
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

                            <Textarea
                                label="Description"
                                placeholder="Enter description"
                                value={data.description || ''}
                                onChange={(e) => setData('description', e.target.value || null)}
                                error={errors.description}
                            />

                            <Divider label="Classification" labelPosition="center" />

                            <Grid>
                                <Grid.Col span={4}>
                                    <Select
                                        label="Type"
                                        placeholder="Select type"
                                        data={[
                                            { value: 'consumable', label: 'Consumable' },
                                            { value: 'spare_part', label: 'Spare Part' },
                                            { value: 'tool', label: 'Tool' },
                                            { value: 'material', label: 'Material' },
                                            { value: 'other', label: 'Other' },
                                        ]}
                                        value={data.type}
                                        onChange={(value) => setData('type', value as 'consumable' | 'spare_part' | 'tool' | 'material' | 'other')}
                                        error={errors.type}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
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
                                            { value: 'na', label: 'Not Applicable' },
                                            { value: 'pcs', label: 'Pieces' },
                                        ]}
                                        value={data.unit}
                                        onChange={(value) => setData('unit', value as 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'kg' | 'ton' | 'box' | 'pack' | 'na' | 'pcs' | null)}
                                        error={errors.unit}
                                    />
                                </Grid.Col>
                            </Grid>

                            <Divider label="Stock Management" labelPosition="center" />

                            <Grid>
                                <Grid.Col span={4}>
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
                                <Grid.Col span={4}>
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
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Maximum Stock"
                                        placeholder="Enter maximum stock level"
                                        value={data.maximum_stock || undefined}
                                        onChange={(value) => setData('maximum_stock', value ? Number(value) : null)}
                                        error={errors.maximum_stock}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Reorder Point"
                                        placeholder="Enter reorder point"
                                        value={data.reorder_point || undefined}
                                        onChange={(value) => setData('reorder_point', value ? Number(value) : null)}
                                        error={errors.reorder_point}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Reorder Quantity"
                                        placeholder="Enter reorder quantity"
                                        value={data.reorder_quantity || undefined}
                                        onChange={(value) => setData('reorder_quantity', value ? Number(value) : null)}
                                        error={errors.reorder_quantity}
                                        min={0}
                                    />
                                </Grid.Col>
                            </Grid>

                            <Divider label="Pricing" labelPosition="center" />

                            <Grid>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Standard Cost"
                                        placeholder="Enter standard cost"
                                        value={data.standard_cost || undefined}
                                        onChange={(value) => setData('standard_cost', value ? Number(value) : null)}
                                        error={errors.standard_cost}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Selling Price"
                                        placeholder="Enter selling price"
                                        value={data.selling_price || undefined}
                                        onChange={(value) => setData('selling_price', value ? Number(value) : null)}
                                        error={errors.selling_price}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Rental Rate"
                                        placeholder="Enter rental rate"
                                        value={data.rental_rate || undefined}
                                        onChange={(value) => setData('rental_rate', value ? Number(value) : null)}
                                        error={errors.rental_rate}
                                        min={0}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="specifications">
                        <Stack>
                            <Grid>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Specifications"
                                        placeholder="Enter item specifications (JSON format)"
                                        value={data.specifications ? JSON.stringify(data.specifications, null, 2) : ''}
                                        onChange={(e) => {
                                            try {
                                                const value = e.target.value ? JSON.parse(e.target.value) : null;
                                                setData('specifications', value);
                                            } catch (error) {
                                                // Invalid JSON, don't update
                                            }
                                        }}
                                        error={errors.specifications}
                                        minRows={4}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Technical Details"
                                        placeholder="Enter technical details (JSON format)"
                                        value={data.technical_details ? JSON.stringify(data.technical_details, null, 2) : ''}
                                        onChange={(e) => {
                                            try {
                                                const value = e.target.value ? JSON.parse(e.target.value) : null;
                                                setData('technical_details', value);
                                            } catch (error) {
                                                // Invalid JSON, don't update
                                            }
                                        }}
                                        error={errors.technical_details}
                                        minRows={4}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Safety Data"
                                        placeholder="Enter safety data (JSON format)"
                                        value={data.safety_data ? JSON.stringify(data.safety_data, null, 2) : ''}
                                        onChange={(e) => {
                                            try {
                                                const value = e.target.value ? JSON.parse(e.target.value) : null;
                                                setData('safety_data', value);
                                            } catch (error) {
                                                // Invalid JSON, don't update
                                            }
                                        }}
                                        error={errors.safety_data}
                                        minRows={4}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="storage">
                        <Stack>
                            <Grid>
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Storage Location"
                                        placeholder="Enter storage location"
                                        value={data.storage_location || ''}
                                        onChange={(e) => setData('storage_location', e.target.value || null)}
                                        error={errors.storage_location}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Storage Conditions"
                                        placeholder="Enter storage conditions"
                                        value={data.storage_conditions || ''}
                                        onChange={(e) => setData('storage_conditions', e.target.value || null)}
                                        error={errors.storage_conditions}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Storage Instructions"
                                        placeholder="Enter storage instructions"
                                        value={data.storage_instructions || ''}
                                        onChange={(e) => setData('storage_instructions', e.target.value || null)}
                                        error={errors.storage_instructions}
                                    />
                                </Grid.Col>
                            </Grid>

                            <Divider label="Additional Details" labelPosition="center" />

                            <Grid>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Manufacturer"
                                        placeholder="Enter manufacturer name"
                                        value={data.manufacturer || ''}
                                        onChange={(e) => setData('manufacturer', e.target.value || null)}
                                        error={errors.manufacturer}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Supplier"
                                        placeholder="Enter supplier name"
                                        value={data.supplier || ''}
                                        onChange={(e) => setData('supplier', e.target.value || null)}
                                        error={errors.supplier}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Warranty Period"
                                        placeholder="Enter warranty period"
                                        value={data.warranty_period || ''}
                                        onChange={(e) => setData('warranty_period', e.target.value || null)}
                                        error={errors.warranty_period}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Last Purchase Price"
                                        placeholder="Enter last purchase price"
                                        value={data.last_purchase_price || undefined}
                                        onChange={(value) => setData('last_purchase_price', value ? Number(value) : null)}
                                        error={errors.last_purchase_price}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Sort Order"
                                        placeholder="Enter sort order"
                                        value={data.sort_order}
                                        onChange={(value) => setData('sort_order', Number(value))}
                                        error={errors.sort_order}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Select
                                        label="Status"
                                        placeholder="Select status"
                                        data={[
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Inactive' },
                                            { value: 'discontinued', label: 'Discontinued' },
                                            { value: 'maintenance', label: 'Maintenance' },
                                            { value: 'retired', label: 'Retired' },
                                        ]}
                                        value={data.status}
                                        onChange={(value) => setData('status', value as 'active' | 'inactive' | 'discontinued' | 'maintenance' | 'retired')}
                                        error={errors.status}
                                        required
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={processing}>Create Item</Button>
                </Group>
            </form>
        </Modal>
    );
} 