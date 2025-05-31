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

interface Props extends PageProps {
    categories: Category[];
}

export default function Create({ auth, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        category_id: '',
        hsn: '',
        unit: '',
        min_stock: 0,
        max_stock: 0,
        reorder_level: 0,
        purchase_price: 0,
        selling_price: 0,
        status: 'active',
        notes: '',
    });

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Items', href: route('equipment.items.index') },
        { title: 'Create', href: route('equipment.items.create') },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.items.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Item" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Create Item</Text>
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
                                        <TextInput
                                            label="HSN Code"
                                            id="hsn"
                                            value={data.hsn}
                                            onChange={(e) => setData('hsn', e.target.value)}
                                            error={errors.hsn}
                                            placeholder="Enter HSN code"
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <TextInput
                                            label="Unit"
                                            id="unit"
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                            error={errors.unit}
                                            placeholder="e.g., pcs, kg, m"
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <Select
                                            label="Status"
                                            id="status"
                                            value={data.status}
                                            onChange={(value) => setData('status', value as 'active' | 'inactive')}
                                            error={errors.status}
                                            data={[
                                                { value: 'active', label: 'Active' },
                                                { value: 'inactive', label: 'Inactive' }
                                            ]}
                                            required
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 4 }}>
                                        <NumberInput
                                            label="Minimum Stock"
                                            id="min_stock"
                                            value={data.min_stock}
                                            onChange={(value) => setData('min_stock', Number(value))}
                                            error={errors.min_stock}
                                            min={0}
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 4 }}>
                                        <NumberInput
                                            label="Maximum Stock"
                                            id="max_stock"
                                            value={data.max_stock}
                                            onChange={(value) => setData('max_stock', Number(value))}
                                            error={errors.max_stock}
                                            min={0}
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 4 }}>
                                        <NumberInput
                                            label="Reorder Level"
                                            id="reorder_level"
                                            value={data.reorder_level}
                                            onChange={(value) => setData('reorder_level', Number(value))}
                                            error={errors.reorder_level}
                                            min={0}
                                            required
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Grid>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <NumberInput
                                            label="Purchase Price"
                                            id="purchase_price"
                                            value={data.purchase_price}
                                            onChange={(value) => setData('purchase_price', Number(value))}
                                            error={errors.purchase_price}
                                            min={0}
                                            decimalScale={2}
                                            prefix="$"
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 6 }}>
                                        <NumberInput
                                            label="Selling Price"
                                            id="selling_price"
                                            value={data.selling_price}
                                            onChange={(value) => setData('selling_price', Number(value))}
                                            error={errors.selling_price}
                                            min={0}
                                            decimalScale={2}
                                            prefix="$"
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
                                        Create Item
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