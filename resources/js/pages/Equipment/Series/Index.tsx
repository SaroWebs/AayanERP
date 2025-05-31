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

interface Category {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Series {
    id: number;
    name: string;
    code: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
    category: Category;
    equipment_count: number;
}

interface Props extends PageProps {
    series: {
        data: Series[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    filters: {
        category_id?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, series, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Series', href: route('equipment.series.index') },
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('equipment.series.index'),
            { search: value, category_id: categoryId, status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryChange = (value: string | null) => {
        setCategoryId(value || '');
        router.get(
            route('equipment.series.index'),
            { search, category_id: value || '', status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value || '');
        router.get(
            route('equipment.series.index'),
            { search, category_id: categoryId, status: value || '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this series?')) {
            router.delete(route('equipment.series.destroy', id));
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'green' : 'red';
    };

    const getCategoryColor = (variant: string) => {
        return variant === 'equipment' ? 'blue' : 'gray';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment Series" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Equipment Series</Text>
                            <Button
                                leftSection={<Plus size={16} />}
                                onClick={() => router.visit(route('equipment.series.create'))}
                            >
                                Add Series
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Group>
                                <TextInput
                                    placeholder="Search series..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ maxWidth: 300 }}
                                />
                                <Select
                                    value={categoryId}
                                    onChange={handleCategoryChange}
                                    placeholder="Select category"
                                    data={[
                                        { value: '', label: 'All Categories' },
                                        ...categories.map((category) => ({
                                            value: category.id.toString(),
                                            label: category.name
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
                                        <th>Code</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Equipment</th>
                                        <th>Sort Order</th>
                                        <th>Created At</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {series.data.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.code}</td>
                                            <td>
                                                <Badge color={getCategoryColor(item.category.variant)}>
                                                    {item.category.name}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge color={getStatusColor(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td>{item.equipment_count}</td>
                                            <td>{item.sort_order}</td>
                                            <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <Group justify="flex-end" gap="xs">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        onClick={() => router.visit(route('equipment.series.edit', item.id))}
                                                    >
                                                        <Pencil size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => handleDelete(item.id)}
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
                                    total={series.last_page}
                                    value={series.current_page}
                                    onChange={(page) => {
                                        router.get(
                                            route('equipment.series.index'),
                                            { page, search, category_id: categoryId, status },
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