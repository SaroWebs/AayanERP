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
    Box,
    Tooltip
} from '@mantine/core';
import { Plus, Pencil, Trash, Wrench } from 'lucide-react';

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
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    location: string | null;
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    created_at: string;
    updated_at: string;
    category: Category;
    series: Series;
}

interface Props extends PageProps {
    equipment: {
        data: Equipment[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    series: Series[];
    filters: {
        category_id?: string;
        series_id?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, equipment, categories, series, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [seriesId, setSeriesId] = useState(filters.series_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Equipment', href: route('equipment.equipment.index') },
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('equipment.equipment.index'),
            { search: value, category_id: categoryId, series_id: seriesId, status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryChange = (value: string | null) => {
        setCategoryId(value || '');
        router.get(
            route('equipment.equipment.index'),
            { search, category_id: value || '', series_id: seriesId, status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSeriesChange = (value: string | null) => {
        setSeriesId(value || '');
        router.get(
            route('equipment.equipment.index'),
            { search, category_id: categoryId, series_id: value || '', status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value || '');
        router.get(
            route('equipment.equipment.index'),
            { search, category_id: categoryId, series_id: seriesId, status: value || '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this equipment?')) {
            router.delete(route('equipment.equipment.destroy', id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'inactive':
                return 'red';
            case 'maintenance':
                return 'yellow';
            case 'retired':
                return 'gray';
            default:
                return 'blue';
        }
    };

    const getCategoryColor = (variant: string) => {
        return variant === 'equipment' ? 'blue' : 'gray';
    };

    const formatDate = (date: string | null) => {
        return date ? new Date(date).toLocaleDateString() : '-';
    };

    const formatPrice = (price: number | null) => {
        return price ? `$${price.toFixed(2)}` : '-';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Equipment</Text>
                            <Button
                                leftSection={<Plus size={16} />}
                                onClick={() => router.visit(route('equipment.equipment.create'))}
                            >
                                Add Equipment
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Group>
                                <TextInput
                                    placeholder="Search equipment..."
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
                                    value={seriesId}
                                    onChange={handleSeriesChange}
                                    placeholder="Select series"
                                    data={[
                                        { value: '', label: 'All Series' },
                                        ...series.map((s) => ({
                                            value: s.id.toString(),
                                            label: s.name
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
                                        { value: 'inactive', label: 'Inactive' },
                                        { value: 'maintenance', label: 'Maintenance' },
                                        { value: 'retired', label: 'Retired' }
                                    ]}
                                    style={{ width: 200 }}
                                />
                            </Group>

                            <Table striped highlightOnHover>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Code</th>
                                        <th>Serial Number</th>
                                        <th>Category</th>
                                        <th>Series</th>
                                        <th>Status</th>
                                        <th>Location</th>
                                        <th>Purchase Date</th>
                                        <th>Warranty Expiry</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipment.data.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.code}</td>
                                            <td>{item.serial_number}</td>
                                            <td>
                                                <Badge color={getCategoryColor(item.category.variant)}>
                                                    {item.category.name}
                                                </Badge>
                                            </td>
                                            <td>{item.series.name}</td>
                                            <td>
                                                <Badge color={getStatusColor(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td>{item.location || '-'}</td>
                                            <td>{formatDate(item.purchase_date)}</td>
                                            <td>{formatDate(item.warranty_expiry)}</td>
                                            <td>
                                                <Group justify="flex-end" gap="xs">
                                                    <Tooltip label="Maintenance">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            onClick={() => router.visit(route('equipment.equipment.show', item.id))}
                                                        >
                                                            <Wrench size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Edit">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            onClick={() => router.visit(route('equipment.equipment.edit', item.id))}
                                                        >
                                                            <Pencil size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Delete">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Group justify="center" mt="md">
                                <Pagination
                                    total={equipment.last_page}
                                    value={equipment.current_page}
                                    onChange={(page) => {
                                        router.get(
                                            route('equipment.equipment.index'),
                                            { page, search, category_id: categoryId, series_id: seriesId, status },
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