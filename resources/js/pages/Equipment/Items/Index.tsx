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
import { Plus, Pencil, Trash, Package } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Item {
    id: number;
    name: string;
    code: string;
    slug: string;
    description: string | null;
    category_id: number;
    hsn: string | null;
    unit: string;
    min_stock: number;
    max_stock: number;
    reorder_level: number;
    purchase_price: number;
    selling_price: number;
    status: 'active' | 'inactive';
    notes: string | null;
    created_at: string;
    updated_at: string;
    category: Category;
    current_stock: number;
}

interface Props extends PageProps {
    items: {
        data: Item[];
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

export default function Index({ auth, items, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Items', href: route('equipment.items.index') },
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('equipment.items.index'),
            { search: value, category_id: categoryId, status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryChange = (value: string | null) => {
        setCategoryId(value || '');
        router.get(
            route('equipment.items.index'),
            { search, category_id: value || '', status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value || '');
        router.get(
            route('equipment.items.index'),
            { search, category_id: categoryId, status: value || '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            router.delete(route('equipment.items.destroy', id));
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'green' : 'red';
    };

    const getCategoryColor = (variant: string) => {
        return variant === 'equipment' ? 'blue' : 'gray';
    };

    const getStockStatus = (current: number, min: number, max: number) => {
        if (current <= min) return { color: 'red', label: 'Low Stock' };
        if (current >= max) return { color: 'yellow', label: 'Overstocked' };
        return { color: 'green', label: 'In Stock' };
    };

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Items" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Items</Text>
                            <Button
                                leftSection={<Plus size={16} />}
                                onClick={() => router.visit(route('equipment.items.create'))}
                            >
                                Add Item
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Group>
                                <TextInput
                                    placeholder="Search items..."
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
                                        <th>Unit</th>
                                        <th>Stock</th>
                                        <th>Purchase Price</th>
                                        <th>Selling Price</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.data.map((item) => {
                                        const stockStatus = getStockStatus(item.current_stock, item.min_stock, item.max_stock);
                                        return (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td>{item.code}</td>
                                                <td>
                                                    <Badge color={getCategoryColor(item.category.variant)}>
                                                        {item.category.name}
                                                    </Badge>
                                                </td>
                                                <td>{item.unit}</td>
                                                <td>
                                                    <Group gap="xs">
                                                        <Text>{item.current_stock}</Text>
                                                        <Badge color={stockStatus.color}>
                                                            {stockStatus.label}
                                                        </Badge>
                                                    </Group>
                                                </td>
                                                <td>{formatPrice(item.purchase_price)}</td>
                                                <td>{formatPrice(item.selling_price)}</td>
                                                <td>
                                                    <Badge color={getStatusColor(item.status)}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Group justify="flex-end" gap="xs">
                                                        <Tooltip label="Stock Movement">
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="blue"
                                                                onClick={() => router.visit(route('equipment.items.show', item.id))}
                                                            >
                                                                <Package size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Edit">
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="blue"
                                                                onClick={() => router.visit(route('equipment.items.edit', item.id))}
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
                                        );
                                    })}
                                </tbody>
                            </Table>

                            <Group justify="center" mt="md">
                                <Pagination
                                    total={items.last_page}
                                    value={items.current_page}
                                    onChange={(page) => {
                                        router.get(
                                            route('equipment.items.index'),
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