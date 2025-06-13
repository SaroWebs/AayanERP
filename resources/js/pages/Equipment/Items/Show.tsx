import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    Text,
    Group,
    Stack,
    Badge,
    Button,
    ActionIcon,
    Box,
    Divider,
    Modal,
    TextInput,
    Textarea,
    Select,
    NumberInput,
    Tooltip,
    Dialog,
} from '@mantine/core';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useDisclosure } from '@mantine/hooks';
import { ArrowLeft, Plus, Package, Trash } from 'lucide-react';
import axios from 'axios';
import { modals } from '@mantine/modals';

interface StockMovement {
    id: number;
    type: 'in' | 'out';
    quantity: number;
    reference_type: string | null;
    reference_id: string | null;
    notes: string | null;
    created_at: string;
    creator: {
        id: number;
        name: string;
    };
}

interface Item {
    id: number;
    name: string;
    code: string;
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
    stock_movements: StockMovement[];
    stock_status?: 'low' | 'excess' | 'normal';
}

interface Props extends PageProps {
    item: Item;
}

export default function Show({ auth, item: initialItem }: Props) {
    const [item, setItem] = useState<Item>(initialItem);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialItem.stock_movements);
    const [loading, setLoading] = useState(false);
    const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
    const [formData, setFormData] = useState({
        type: 'in' as 'in' | 'out',
        quantity: 1,
        reference_type: '',
        reference_id: '',
        notes: '',
    });
    const [deleteDialogOpened, { open: openDeleteDialog, close: closeDeleteDialog }] = useDisclosure(false);
    const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(null);

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Items', href: route('equipment.items.index') },
        { title: item.name, href: '#' },
    ];

    const loadItem = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route('equipment.items.get', item.id));
            setItem(response.data.item);
            setStockMovements(response.data.item.stock_movements);
        } catch (error) {
            console.error('Error loading item:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItem();
    }, []);
    
    const handleAddStockMovement = async () => {
        try {
            const response = await axios.post(route('equipment.items.stock-movement.store', item.id), formData);
            await loadItem();
            closeAddModal();
            setFormData({
                type: 'in',
                quantity: 1,
                reference_type: '',
                reference_id: '',
                notes: '',
            });
        } catch (error) {
            console.error('Error adding stock movement:', error);
        }
    };

    const handleDeleteMovement = async () => {
        if (!movementToDelete) return;
        
        try {
            await axios.delete(route('equipment.items.stock-movement.destroy', [item.id, movementToDelete.id]));
            await loadItem();
            closeDeleteDialog();
            setMovementToDelete(null);
        } catch (error) {
            console.error('Error deleting stock movement:', error);
        }
    };

    const handleDeleteClick = (movement: StockMovement) => {
        setMovementToDelete(movement);
        openDeleteDialog();
    };

    const getStockStatus = (item: Item) => {
        if (item.stock_status) {
            return {
                color: item.stock_status === 'low' ? 'red' : 
                       item.stock_status === 'excess' ? 'yellow' : 'green',
                label: item.stock_status === 'low' ? 'Low Stock' :
                       item.stock_status === 'excess' ? 'Excess Stock' : 'Normal Stock'
            };
        }
        
        // Fallback to old logic if stock_status is not available
        if (item.current_stock <= item.minimum_stock) {
            return { color: 'red', label: 'Low Stock' };
        }
        if (item.maximum_stock !== null && item.current_stock >= item.maximum_stock) {
            return { color: 'yellow', label: 'Overstocked' };
        }
        return { color: 'green', label: 'In Stock' };
    };

    const columns: DataTableColumn<StockMovement>[] = [
        {
            accessor: 'created_at',
            title: 'Date',
            render: (record) => new Date(record.created_at).toLocaleString(),
        },
        {
            accessor: 'type',
            title: 'Type',
            render: (record) => (
                <Badge color={record.type === 'in' ? 'green' : 'red'}>
                    {record.type.toUpperCase()}
                </Badge>
            ),
        },
        {
            accessor: 'quantity',
            title: 'Quantity',
        },
        {
            accessor: 'reference_type',
            title: 'Reference',
            render: (record) => (
                <Box>
                    {record.reference_type && (
                        <Text size="sm">{record.reference_type}</Text>
                    )}
                    {record.reference_id && (
                        <Text size="xs" c="dimmed">{record.reference_id}</Text>
                    )}
                </Box>
            ),
        },
        {
            accessor: 'notes',
            title: 'Notes',
            render: (record) => record.notes || '-',
        },
        {
            accessor: 'creator.name',
            title: 'Created By',
            render: (record) => record.creator?.name,
        },
        {
            accessor: 'actions',
            title: '',
            textAlign: 'right',
            render: (record) => (
                <Group gap={4} justify="flex-end">
                    <Tooltip label="Delete">
                        <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDeleteClick(record)}
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
            <Head title={`Item: ${item.name}`} />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Group>
                                <ActionIcon
                                    variant="light"
                                    onClick={() => router.visit(route('equipment.items.index'))}
                                >
                                    <ArrowLeft size={16} />
                                </ActionIcon>
                                <Box>
                                    <Text fw={500} size="xl">{item.name}</Text>
                                    <Text size="sm" c="dimmed">Code: {item.code}</Text>
                                </Box>
                            </Group>
                            <Button
                                leftSection={<Plus size={16} />}
                                onClick={openAddModal}
                            >
                                Add Stock Movement
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Card>
                                <Card.Section p="md">
                                    <Group>
                                        <Box>
                                            <Text size="sm" c="dimmed">Current Stock</Text>
                                            <Group gap="xs">
                                                <Text fw={500}>{item.current_stock}</Text>
                                                <Badge color={getStockStatus(item).color}>
                                                    {getStockStatus(item).label}
                                                </Badge>
                                            </Group>
                                        </Box>
                                        <Divider orientation="vertical" />
                                        <Box>
                                            <Text size="sm" c="dimmed">Unit</Text>
                                            <Text fw={500}>{item.unit?.toUpperCase() || 'N/A'}</Text>
                                        </Box>
                                        <Divider orientation="vertical" />
                                        <Box>
                                            <Text size="sm" c="dimmed">Minimum Stock</Text>
                                            <Text fw={500}>{item.minimum_stock}</Text>
                                        </Box>
                                        {item.maximum_stock !== null && (
                                            <>
                                                <Divider orientation="vertical" />
                                                <Box>
                                                    <Text size="sm" c="dimmed">Maximum Stock</Text>
                                                    <Text fw={500}>{item.maximum_stock}</Text>
                                                </Box>
                                            </>
                                        )}
                                        {item.reorder_point !== null && (
                                            <>
                                                <Divider orientation="vertical" />
                                                <Box>
                                                    <Text size="sm" c="dimmed">Reorder Point</Text>
                                                    <Text fw={500}>{item.reorder_point}</Text>
                                                </Box>
                                            </>
                                        )}
                                    </Group>
                                </Card.Section>
                            </Card>

                            <Divider />

                            <Box>
                                <Text fw={500} mb="md">Stock Movement History</Text>
                                <DataTable
                                    withTableBorder
                                    borderRadius="sm"
                                    withColumnBorders
                                    striped
                                    highlightOnHover
                                    columns={columns}
                                    records={stockMovements}
                                    noRecordsText="No stock movements found"
                                    minHeight={150}
                                    idAccessor="id"
                                />
                            </Box>
                        </Stack>
                    </Card.Section>
                </Card>
            </Box>

            <Modal
                opened={addModalOpened}
                onClose={closeAddModal}
                title="Add Stock Movement"
                size="lg"
            >
                <Stack>
                    <Select
                        label="Type"
                        value={formData.type}
                        onChange={(value) => setFormData({ ...formData, type: value as 'in' | 'out' })}
                        data={[
                            { value: 'in', label: 'Stock In' },
                            { value: 'out', label: 'Stock Out' },
                        ]}
                        required
                    />
                    <NumberInput
                        label="Quantity"
                        value={formData.quantity}
                        onChange={(value) => setFormData({ ...formData, quantity: Number(value) || 0 })}
                        min={1}
                        required
                    />
                    <TextInput
                        label="Reference Type"
                        placeholder="e.g., Purchase, Sale, Adjustment"
                        value={formData.reference_type}
                        onChange={(e) => setFormData({ ...formData, reference_type: e.target.value })}
                    />
                    <TextInput
                        label="Reference ID"
                        placeholder="e.g., PO-123, SO-456"
                        value={formData.reference_id}
                        onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                    />
                    <Textarea
                        label="Notes"
                        placeholder="Add any additional notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <Group justify="flex-end">
                        <Button variant="light" onClick={closeAddModal}>Cancel</Button>
                        <Button onClick={handleAddStockMovement}>Add Movement</Button>
                    </Group>
                </Stack>
            </Modal>

            <Dialog
                opened={deleteDialogOpened}
                withCloseButton
                onClose={closeDeleteDialog}
                size="lg"
                radius="md"
                position={{ top: 20, right: 20 }}
            >
                <Text size="sm" mb="xs" fw={500}>
                    Delete Stock Movement
                </Text>
                <Text size="sm" mb="md" c="dimmed">
                    Are you sure you want to delete this stock movement? This action cannot be undone.
                </Text>
                <Group justify="flex-end">
                    <Button variant="light" onClick={closeDeleteDialog}>Cancel</Button>
                    <Button color="red" onClick={handleDeleteMovement}>Delete</Button>
                </Group>
            </Dialog>
        </AppLayout>
    );
} 