import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { 
    Card, 
    TextInput, 
    Select, 
    Table, 
    Badge, 
    Button, 
    Group, 
    Stack,
    ActionIcon,
    Text,
    Pagination,
    Box
} from '@mantine/core';
import { Plus, Pencil, Trash } from 'lucide-react';

interface CategoryType {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    hsn: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
    category_type: CategoryType;
    equipment_count: number;
}

interface Props extends PageProps {
    categories: {
        data: Category[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    categoryTypes: CategoryType[];
    filters: {
        category_type_id?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, categories, categoryTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryTypeId, setCategoryTypeId] = useState(filters.category_type_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Categories', href: route('equipment.categories.index') },
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('equipment.categories.index'),
            { search: value, category_type_id: categoryTypeId, status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryTypeChange = (value: string | null) => {
        setCategoryTypeId(value || '');
        router.get(
            route('equipment.categories.index'),
            { search, category_type_id: value || '', status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value || '');
        router.get(
            route('equipment.categories.index'),
            { search, category_type_id: categoryTypeId, status: value || '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('equipment.categories.destroy', id));
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'green' : 'red';
    };

    const getCategoryTypeColor = (variant: string) => {
        return variant === 'equipment' ? 'blue' : 'gray';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Categories</Text>
                            <Button
                                leftSection={<Plus size={16} />}
                                onClick={() => router.visit(route('equipment.categories.create'))}
                            >
                                Add Category
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Group>
                                <TextInput
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ maxWidth: 300 }}
                                />
                                <Select
                                    value={categoryTypeId}
                                    onChange={handleCategoryTypeChange}
                                    placeholder="Select category type"
                                    data={[
                                        { value: '', label: 'All Category Types' },
                                        ...categoryTypes.map((type) => ({
                                            value: type.id.toString(),
                                            label: type.name
                                        }))
                                    ]}
                                    style={{ width: 200 }}
                                />
                                <Select
                                    value={status}
                                    onChange={handleStatusChange}
                                    placeholder="Select status"
                                    data={[
                                        { value: '', label: 'All Status' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' }
                                    ]}
                                    style={{ width: 200 }}
                                />
                            </Group>

                            <Table striped highlightOnHover>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category Type</th>
                                        <th>HSN</th>
                                        <th>Status</th>
                                        <th>Equipment</th>
                                        <th>Sort Order</th>
                                        <th>Created At</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.data.map((category) => (
                                        <tr key={category.id}>
                                            <td>{category.name}</td>
                                            <td>
                                                <Badge color={getCategoryTypeColor(category.category_type.variant)}>
                                                    {category.category_type.name}
                                                </Badge>
                                            </td>
                                            <td>{category.hsn || '-'}</td>
                                            <td>
                                                <Badge color={getStatusColor(category.status)}>
                                                    {category.status}
                                                </Badge>
                                            </td>
                                            <td>{category.equipment_count}</td>
                                            <td>{category.sort_order}</td>
                                            <td>{new Date(category.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <Group justify="flex-end" gap="xs">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        onClick={() => router.visit(route('equipment.categories.edit', category.id))}
                                                    >
                                                        <Pencil size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Trash size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Group justify="center" mt="md">
                                <Pagination
                                    total={categories.last_page}
                                    value={categories.current_page}
                                    onChange={(page) => {
                                        router.get(
                                            route('equipment.categories.index'),
                                            { page, search, category_type_id: categoryTypeId, status },
                                            { preserveState: true }
                                        );
                                    }}
                                />
                            </Group>
                        </Stack>
                    </Card.Section>
                </Card>
            </Box>
        </AppLayout>
    );
} 