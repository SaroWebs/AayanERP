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
    NumberInput
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
        status: 'active',
        sort_order: 0,
    });

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Series', href: route('equipment.series.index') },
        { title: 'Create', href: route('equipment.series.create') },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.series.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Equipment Series" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Create Equipment Series</Text>
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
                                <TextInput
                                    label="Name"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    required
                                />

                                <TextInput
                                    label="Code"
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    error={errors.code}
                                    required
                                />

                                <Textarea
                                    label="Description"
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={errors.description}
                                    rows={4}
                                />

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

                                <NumberInput
                                    label="Sort Order"
                                    id="sort_order"
                                    value={data.sort_order}
                                    onChange={(value) => setData('sort_order', Number(value))}
                                    error={errors.sort_order}
                                    min={0}
                                />

                                <Group justify="flex-end">
                                    <Button type="submit" loading={processing}>
                                        Create Series
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