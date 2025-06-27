import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types/index.d';
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
import StockMovementModal from './Partials/StockMovementModal';
import type { Item } from './types';

interface Props extends PageProps {
    filters?: {
        search?: string;
    };
    categories?: Array<{
        id: number;
        name: string;
    }>;
}

export default function Index({ filters = {} }: Props) {
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
    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [stockMovementModalOpened, { open: openStockMovementModal, close: closeStockMovementModal }] = useDisclosure(false);
    const [categoriesList, setCategoriesList] = useState<Array<{ id: number; name: string }> | null>(null);

    const breadcrumbs = [
        { title: 'Inventory', href: '#' },
        { title: 'Inventory Items', href: route('equipment.items.index') },
    ];

    const loadItems = async (params: {
        page?: number;
        search?: string;
    } = {}) => {
        try {
            setLoading(true);
            const requestParams: Record<string, string | number> = {
                page: params.page || 1
            };

            if (params.search !== undefined ? params.search : search) {
                requestParams.search = params.search !== undefined ? params.search : search;
            }

            const response = await axios.get(route('equipment.items.data'), {
                params: requestParams
            });
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

    // Load items when search changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadItems({ page: 1 });
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        axios.get(route('equipment.categories.data'))
            .then(response => {
                setCategoriesList(response.data);
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });
    }, []);

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

    const handleStockMovement = (item: Item) => {
        setSelectedItem(item);
        openStockMovementModal();
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'gray';
    };

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'low': return 'red';
            case 'excess': return 'yellow';
            default: return 'green';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'consumable': return 'blue';
            case 'spare_part': return 'orange';
            case 'tool': return 'green';
            case 'material': return 'grape';
            default: return 'gray';
        }
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Inventory Items" />

            <Card shadow="sm" padding="lg">
                <Stack>
                    <Group>
                        <TextInput
                            placeholder="Search items..."
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                            style={{ flex: 1 }}
                        />
                        <Button
                            leftSection={<Plus size={16} />}
                            onClick={openCreateModal}
                        >
                            Add Item
                        </Button>
                    </Group>

                    <DataTable
                        withTableBorder
                        borderRadius="sm"
                        withColumnBorders
                        striped
                        highlightOnHover
                        loadingText="Loading items..."
                        records={items.data}
                        columns={[
                            {
                                accessor: 'code',
                                title: 'Code',
                                width: 100,
                            },
                            {
                                accessor: 'name',
                                title: 'Name',
                                width: 200,
                            },
                            {
                                accessor: 'category.name',
                                title: 'Category',
                                width: 150,
                            },
                            {
                                accessor: 'type',
                                title: 'Type',
                                width: 120,
                                render: (item) => (
                                    <Badge color={getTypeColor(item.type)}>
                                        {item.type.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                ),
                            },
                            {
                                accessor: 'unit',
                                title: 'Unit',
                                width: 80,
                                render: (item) => item.unit?.toUpperCase() || 'N/A',
                            },
                            {
                                accessor: 'current_stock',
                                title: 'Stock',
                                width: 120,
                                textAlign: 'right' as DataTableColumnTextAlign,
                                render: (item) => (
                                    <Group gap="xs" justify="flex-end">
                                        <Text>{item.current_stock}</Text>
                                        <Badge
                                            color={getStockStatusColor(item.stock_status || 'normal')}
                                            size="sm"
                                        >
                                            {item.stock_status?.toUpperCase() || 'NORMAL'}
                                        </Badge>
                                    </Group>
                                ),
                            },
                            {
                                accessor: 'standard_cost',
                                title: 'Cost',
                                width: 120,
                                textAlign: 'right' as DataTableColumnTextAlign,
                                render: (item) => item.standard_cost ? `₹${Number(item.standard_cost).toFixed(2)}` : 'N/A',
                            },
                            {
                                accessor: 'selling_price',
                                title: 'Price',
                                width: 120,
                                textAlign: 'right' as DataTableColumnTextAlign,
                                render: (item) => item.selling_price ? `₹${Number(item.selling_price).toFixed(2)}` : 'N/A',
                            },
                            {
                                accessor: 'status',
                                title: 'Status',
                                width: 100,
                                render: (item) => (
                                    <Badge color={getStatusColor(item.status)}>
                                        {item.status.toUpperCase()}
                                    </Badge>
                                ),
                            },
                            {
                                accessor: 'actions',
                                title: 'Actions',
                                width: 150,
                                textAlign: 'center' as DataTableColumnTextAlign,
                                render: (item) => (
                                    <Group gap="xs" justify="center">
                                        <Tooltip label="Stock Movement">
                                            <ActionIcon
                                                variant="light"
                                                color="blue"
                                                onClick={() => handleStockMovement(item)}
                                            >
                                                <Package size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Edit">
                                            <ActionIcon
                                                variant="light"
                                                color="blue"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Pencil size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Delete">
                                            <ActionIcon
                                                variant="light"
                                                color="red"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                ),
                            },
                        ]}
                        totalRecords={items.last_page * 10}
                        recordsPerPage={10}
                        page={items.current_page}
                        onPageChange={(page) => loadItems({ page })}
                        noRecordsText="No items found"
                        minHeight={150}
                        idAccessor="id"
                    />
                </Stack>
            </Card>

            <CreateItemModal
                opened={createModalOpened}
                onClose={closeCreateModal}
                loadData={loadItems}
            />

            {selectedItem && (
                <EditItemModal
                    opened={editModalOpened}
                    onClose={closeEditModal}
                    loadData={loadItems}
                    item={selectedItem}
                />
            )}

            {selectedItem && (
                <StockMovementModal
                    opened={stockMovementModalOpened}
                    onClose={closeStockMovementModal}
                    item={selectedItem}
                    loadData={loadItems}
                />
            )}
        </AppLayout>
    );
} 
