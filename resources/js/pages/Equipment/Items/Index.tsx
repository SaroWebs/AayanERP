import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import { 
    Card, 
    TextInput, 
    Select, 
    Badge, 
    Button, 
    Group, 
    Stack,
    ActionIcon,
    Text,
    Box,
    Tooltip,
    Divider
} from '@mantine/core';
import { DataTable, DataTableColumn, DataTableColumnTextAlign } from 'mantine-datatable';
import { Plus, Pencil, Trash, Package } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import CreateItemModal from './Partials/CreateItemModal';
import EditItemModal from './Partials/EditItemModal';


interface Item {
    id: number;
    name: string;
    code: string;
    slug: string;
    description_1: string | null;
    description_2: string | null;
    hsn: string | null;
    unit: 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'na' | null;
    applicable_for: 'all' | 'equipment' | 'scaffolding';
    status: 'active' | 'inactive';
    minimum_stock: number;
    current_stock: number;
    maximum_stock: number | null;
    reorder_point: number | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface Props extends PageProps {
    filters?: {
        applicable_for?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, filters = {} }: Props) {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [items, setItems] = useState<{
        data: Item[];
        current_page: number;
        last_page: number;
        links: any[];
    }>({
        data: [],
        current_page: 1,
        last_page: 1,
        links: []
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(filters.search || '');
    const [applicableFor, setApplicableFor] = useState(filters.applicable_for || '');
    const [status, setStatus] = useState(filters.status || '');
    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Items', href: route('equipment.items.index') },
    ];

    const loadItems = async (params: {
        page?: number;
        search?: string;
        applicable_for?: string;
        status?: string;
    } = {}) => {
        try {
            setLoading(true);
            console.log('Loading items with params:', params);
            
            // Build params object only with non-empty values
            const requestParams: Record<string, string | number> = {};
            
            // Always include page
            requestParams.page = params.page || 1;
            
            // Only include search if it has a value
            const searchValue = params.search !== undefined ? params.search : search;
            if (searchValue) {
                requestParams.search = searchValue;
            }
            
            // Only include applicable_for if it has a value
            const applicableForValue = params.applicable_for !== undefined ? params.applicable_for : applicableFor;
            if (applicableForValue) {
                requestParams.applicable_for = applicableForValue;
            }
            
            // Only include status if it has a value
            const statusValue = params.status !== undefined ? params.status : status;
            if (statusValue) {
                requestParams.status = statusValue;
            }

            console.log('Request params:', requestParams);
            const response = await axios.get(route('equipment.items.data'), {
                params: requestParams
            });
            console.log('Response data:', response.data);
            setItems(response.data);
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load items initially
    useEffect(() => {
        loadItems();
    }, []);

    // Load items when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadItems({ page: 1 });
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [search, applicableFor, status]);

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleApplicableForChange = (value: string | null) => {
        setApplicableFor(value || '');
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value || '');
    };

    const handleEdit = (item: Item) => {
        setSelectedItem(item);
        openEditModal();
    };

    const handleDelete = (id: number) => {
        modals.openConfirmModal({
            title: 'Delete Item',
            children: (
                <Text size="sm">
                    Are you sure you want to delete this item? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await axios.delete(route('equipment.items.destroy', id));
                    loadItems(); // Reload items after deletion
                } catch (error) {
                    console.error('Error deleting item:', error);
                }
            },
        });
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'green' : 'red';
    };

    const getApplicableForColor = (variant: string) => {
        switch (variant) {
            case 'equipment': return 'blue';
            case 'scaffolding': return 'gray';
            default: return 'green';
        }
    };

    const getStockStatus = (current: number, min: number, max: number | null) => {
        if (current <= min) return { color: 'red', label: 'Low Stock' };
        if (max !== null && current >= max) return { color: 'yellow', label: 'Overstocked' };
        return { color: 'green', label: 'In Stock' };
    };

    const columns: DataTableColumn<Item>[] = [
        {
            accessor: 'name',
            title: 'Name',
            render: (record) => (
                <Box>
                    <Text fw={500}>{record.name}</Text>
                    {record.description_1 && (
                        <Text size="xs" c="dimmed" lineClamp={2}>
                            {record.description_1}
                        </Text>
                    )}
                </Box>
            ),
        },
        {
            accessor: 'code',
            title: 'Code',
        },
        {
            accessor: 'applicable_for',
            title: 'Type',
            render: (record) => (
                <Badge color={getApplicableForColor(record.applicable_for)}>
                    {record.applicable_for.charAt(0).toUpperCase() + record.applicable_for.slice(1)}
                </Badge>
            ),
        },
        {
            accessor: 'unit',
            title: 'Unit',
            render: (record) => record.unit?.toUpperCase() || 'N/A',
        },
        {
            accessor: 'current_stock',
            title: 'Stock',
            render: (record) => {
                const stockStatus = getStockStatus(record.current_stock || 0, record.minimum_stock, record.maximum_stock);
                return (
                    <Group gap="xs">
                        <Text>{record.current_stock || 0}</Text>
                        <Badge color={stockStatus.color}>
                            {stockStatus.label}
                        </Badge>
                    </Group>
                );
            },
        },
        {
            accessor: 'hsn',
            title: 'HSN',
            render: (record) => record.hsn || 'N/A',
        },
        {
            accessor: 'status',
            title: 'Status',
            render: (record) => (
                <Badge color={getStatusColor(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
            ),
        },
        {
            accessor: 'actions',
            title: '',
            textAlign: 'right' as DataTableColumnTextAlign,
            render: (record) => (
                <Group gap={4} justify="flex-end">
                    <Tooltip label="Stock Movement">
                        <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => router.visit(route('equipment.items.show', record.id))}
                        >
                            <Package size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit">
                        <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleEdit(record)}
                        >
                            <Pencil size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                        <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDelete(record.id)}
                        >
                            <Trash size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            ),
        },
    ];

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
                                onClick={openCreateModal}
                            >
                                Add Item
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Card>
                                <Card.Section p="md">
                            <Group>
                                <TextInput
                                    placeholder="Search items..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ maxWidth: 300 }}
                                />
                                <Select
                                    value={applicableFor}
                                    onChange={handleApplicableForChange}
                                    placeholder="Select type"
                                    data={[
                                        { value: '', label: 'All Types' },
                                        { value: 'all', label: 'All' },
                                        { value: 'equipment', label: 'Equipment' },
                                        { value: 'scaffolding', label: 'Scaffolding' }
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
                                </Card.Section>
                            </Card>

                            <Divider />

                            <DataTable
                                withTableBorder
                                borderRadius="sm"
                                withColumnBorders
                                striped
                                highlightOnHover
                                columns={columns}
                                records={items.data}
                                totalRecords={items.last_page * 10}
                                recordsPerPage={10}
                                page={items.current_page}
                                onPageChange={(page) => loadItems({ page })}
                                fetching={loading}
                                noRecordsText="No items found"
                                minHeight={150}
                                idAccessor="id"
                            />
                        </Stack>
                    </Card.Section>
                </Card>
            </Box>

            <CreateItemModal
                opened={createModalOpened}
                onClose={closeCreateModal}
                loadData={loadItems}
            />

            {selectedItem && (
                <EditItemModal
                    opened={editModalOpened}
                    onClose={closeEditModal}
                    item={selectedItem}
                    loadData={loadItems}
                />
            )}
        </AppLayout>
    );
} 