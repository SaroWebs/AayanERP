import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { FormDataConvertible } from '@inertiajs/core';
import { useEffect } from 'react';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Props {
    opened: boolean;
    onClose: () => void;
    loadData: () => void;
}

interface FormData {
    name: string;
    code: string;
    description_1: string | null;
    description_2: string | null;
    applicable_for: 'all' | 'equipment' | 'scaffolding';
    hsn: string | null;
    unit: 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'na' | null;
    minimum_stock: number;
    current_stock: number;
    maximum_stock: number | null;
    reorder_point: number | null;
    sort_order: number;
    status: 'active' | 'inactive';
    [key: string]: FormDataConvertible;
}

export default function CreateItemModal({ opened, onClose, loadData }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        code: '',
        description_1: '',
        description_2: '',
        applicable_for: 'all',
        hsn: '',
        unit: null,
        minimum_stock: 0,
        current_stock: 0,
        maximum_stock: null,
        reorder_point: null,
        sort_order: 0,
        status: 'active',
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
        <Modal opened={opened} onClose={onClose} title="Create Item" size="xl">
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
                                readOnly
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
                                    { value: 'na', label: 'Not Applicable' }
                                ]}
                                value={data.unit}
                                onChange={(value) => setData('unit', value as 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'na' | null)}
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
                                    { value: 'all', label: 'All' },
                                    { value: 'equipment', label: 'Equipment' },
                                    { value: 'scaffolding', label: 'Scaffolding' }
                                ]}
                                value={data.applicable_for}
                                onChange={(value) => setData('applicable_for', (value as 'all' | 'equipment' | 'scaffolding') || 'all')}
                                error={errors.applicable_for}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Select
                                label="Status"
                                placeholder="Select status"
                                data={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' }
                                ]}
                                value={data.status}
                                onChange={(value) => setData('status', (value as 'active' | 'inactive') || 'active')}
                                error={errors.status}
                                required
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={processing}>Create Item</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 