import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { 
    Card, 
    TextInput, 
    Textarea, 
    Select, 
    Button, 
    Group, 
    Stack,
    Text,
    Box,
    NumberInput,
    Grid,
} from '@mantine/core';
import { ArrowLeft } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Series {
    id: number;
    name: string;
    code: string;
}

interface Equipment {
    id: number;
    name: string;
    code: string;
    serial_number: string;
    slug: string;
    description: string | null;
    category_id: number;
    equipment_series_id: number;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    location: string | null;
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    equipment: Equipment;
    categories: Category[];
    series: Series[];
}

export default function Edit({ auth, equipment, categories, series }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: equipment.name,
        code: equipment.code,
        serial_number: equipment.serial_number,
        description: equipment.description || '',
        category_id: equipment.category_id.toString(),
        equipment_series_id: equipment.equipment_series_id.toString(),
        status: equipment.status,
        location: equipment.location || '',
        purchase_date: equipment.purchase_date || '',
        purchase_price: equipment.purchase_price || 0,
        warranty_expiry: equipment.warranty_expiry || '',
        notes: equipment.notes || '',
    });

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Equipment', href: route('equipment.equipment.index') },
        { title: equipment.name, href: route('equipment.equipment.edit', equipment.id) },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('equipment.equipment.update', equipment.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Equipment" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Edit Equipment</Text>
                            <Button
                                variant="outline"
                                leftSection={<ArrowLeft size={16} />}
                                onClick={() => window.history.back()}
                            >
                                Back
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <form onSubmit={handleSubmit}>
                            <Stack gap="md">
                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            label="Name"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            error={errors.name}
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            label="Code"
                                            id="code"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            error={errors.code}
                                            required
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            label="Serial Number"
                                            id="serial_number"
                                            value={data.serial_number}
                                            onChange={(e) => setData('serial_number', e.target.value)}
                                            error={errors.serial_number}
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            label="Location"
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            error={errors.location}
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Select
                                            label="Category"
                                            id="category_id"
                                            value={data.category_id}
                                            onChange={(value) => setData('category_id', value || '')}
                                            error={errors.category_id}
                                            data={categories.map((category) => ({
                                                value: category.id.toString(),
                                                label: category.name
                                            }))}
                                            placeholder="Select category"
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Select
                                            label="Series"
                                            id="equipment_series_id"
                                            value={data.equipment_series_id}
                                            onChange={(value) => setData('equipment_series_id', value || '')}
                                            error={errors.equipment_series_id}
                                            data={series.map((s) => ({
                                                value: s.id.toString(),
                                                label: s.name
                                            }))}
                                            placeholder="Select series"
                                            required
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            type="date"
                                            label="Purchase Date"
                                            id="purchase_date"
                                            value={data.purchase_date || ''}
                                            onChange={(e) => setData('purchase_date', e.target.value)}
                                            error={errors.purchase_date}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <NumberInput
                                            label="Purchase Price"
                                            id="purchase_price"
                                            value={data.purchase_price || 0}
                                            onChange={(value) => setData('purchase_price', Number(value))}
                                            error={errors.purchase_price}
                                            min={0}
                                            decimalScale={2}
                                            prefix="$"
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            type="date"
                                            label="Warranty Expiry"
                                            id="warranty_expiry"
                                            value={data.warranty_expiry || ''}
                                            onChange={(e) => setData('warranty_expiry', e.target.value)}
                                            error={errors.warranty_expiry}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Select
                                            label="Status"
                                            id="status"
                                            value={data.status}
                                            onChange={(value) => setData('status', value as 'active' | 'inactive' | 'maintenance' | 'retired')}
                                            error={errors.status}
                                            data={[
                                                { value: 'active', label: 'Active' },
                                                { value: 'inactive', label: 'Inactive' },
                                                { value: 'maintenance', label: 'Maintenance' },
                                                { value: 'retired', label: 'Retired' }
                                            ]}
                                            required
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Textarea
                                    label="Description"
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={errors.description}
                                    rows={4}
                                />

                                <Textarea
                                    label="Notes"
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    error={errors.notes}
                                    rows={4}
                                />

                                <Group justify="flex-end">
                                    <Button type="submit" loading={processing}>
                                        Update Equipment
                                    </Button>
                                </Group>
                            </Stack>
                        </form>
                    </Card.Section>
                </Card>
            </Box>
        </AppLayout>
    );
} 