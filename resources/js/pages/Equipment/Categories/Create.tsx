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

interface CategoryType {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Props extends PageProps {
    categoryTypes: CategoryType[];
}

export default function Create({ auth, categoryTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category_type_id: '',
        hsn: '',
        status: 'active',
        sort_order: 0,
    });

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Categories', href: route('equipment.categories.index') },
        { title: 'Create', href: route('equipment.categories.create') },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.categories.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Create Category</Text>
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

                                <Textarea
                                    label="Description"
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={errors.description}
                                    rows={4}
                                />

                                <Select
                                    label="Category Type"
                                    id="category_type_id"
                                    value={data.category_type_id}
                                    onChange={(value) => setData('category_type_id', value || '')}
                                    error={errors.category_type_id}
                                    data={categoryTypes.map((type) => ({
                                        value: type.id.toString(),
                                        label: type.name
                                    }))}
                                    placeholder="Select category type"
                                />

                                <TextInput
                                    label="HSN"
                                    id="hsn"
                                    value={data.hsn}
                                    onChange={(e) => setData('hsn', e.target.value)}
                                    error={errors.hsn}
                                    maxLength={50}
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
                                        Create Category
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