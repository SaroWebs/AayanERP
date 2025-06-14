import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    Modal,
    Divider
} from '@mantine/core';
import { DataTable, DataTableColumn, DataTableColumnTextAlign } from 'mantine-datatable';
import { Plus, Pencil, Trash, RotateCcw } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import CreateEquipmentModal from './Partials/CreateEquipmentModal';
import EditEquipmentModal from './Partials/EditEquipmentModal';
import { PageProps } from '@/types/index.d';
import {
    Equipment,
    Series,
    Category,
    EquipmentStatus,
    EquipmentFilters,
    EquipmentResponse
} from '@/types/equipment';

interface Props extends PageProps {
    auth: any;
    series: Series[];
    filters: EquipmentFilters;
}

export default function Index({ auth, series, filters }: Props) {
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(filters.category_id || '');
    const [equipment, setEquipment] = useState<EquipmentResponse>({
        data: [],
        current_page: 1,
        last_page: 1,
        links: []
    });
    const [loading, setLoading] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Equipment | null>(null);
    const [pendingRestore, setPendingRestore] = useState<Equipment | null>(null);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [restoreConfirmModalOpen, setRestoreConfirmModalOpen] = useState(false);

    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    // Load categories on component mount
    useEffect(() => {
        axios.get(route('equipment.categories.data')).then(response => {
            setCategories(response.data);
        });
    }, []);

    const loadEquipment = async (params: {
        page?: number;
        category_id?: string;
        series_id?: string;
        status?: string;
        search?: string;
    } = {}) => {
        try {
            setLoading(true);
            const response = await axios.get(route('equipment.equipment.data'), {
                params: {
                    page: params.page || 1,
                    category_id: params.category_id,
                    series_id: params.series_id || filters.series_id,
                    status: params.status || filters.status,
                    search: params.search || filters.search,
                    with_deleted: 'true',
                }
            });
            setEquipment(response.data);
        } catch (error) {
            console.error('Error loading equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load equipment initially and when filters change
    useEffect(() => {
        loadEquipment({ category_id: selectedCategory || undefined });
    }, [selectedCategory, filters.series_id, filters.status, filters.search]);

    const handleCategoryChange = (value: string | null) => {
        setSelectedCategory(value || '');
    };

    const handleDelete = (equipment: Equipment) => {
        setPendingDelete(equipment);
        setDeleteConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;

        router.delete(route('equipment.equipment.destroy', pendingDelete.id), {
            onSuccess: () => {
                setDeleteConfirmModalOpen(false);
                setPendingDelete(null);
                loadEquipment();
            },
        });
    };

    const handleRestore = (equipment: Equipment) => {
        setPendingRestore(equipment);
        setRestoreConfirmModalOpen(true);
    };

    const confirmRestore = () => {
        if (!pendingRestore) return;

        router.post(route('equipment.equipment.restore', pendingRestore.id), {}, {
            onSuccess: () => {
                setRestoreConfirmModalOpen(false);
                setPendingRestore(null);
                loadEquipment();
            },
        });
    };

    const handleEdit = (equipment: Equipment) => {
        setSelectedEquipment(equipment);
        openEditModal();
    };

    const getStatusColor = (status: EquipmentStatus) => {
        switch (status) {
            case 'available':
                return 'green';
            case 'in_use':
                return 'blue';
            case 'maintenance':
                return 'yellow';
            case 'repair':
                return 'orange';
            case 'retired':
                return 'gray';
            case 'scrapped':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getCategoryColor = (variant: string) => {
        return variant === 'equipment' ? 'blue' : 'gray';
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'new':
                return 'green';
            case 'good':
                return 'blue';
            case 'fair':
                return 'yellow';
            case 'poor':
                return 'red';
            default:
                return 'gray';
        }
    };

    function getDeletedColor(deleted_at: string | null) {
        if (deleted_at) return 'red';
        return 'green';
    }

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Equipment', href: route('equipment.equipment.index') },
    ];

    const columns: DataTableColumn<Equipment>[] = [
        {
            accessor: 'code',
            title: 'Code',
            width: 100,
            sortable: true,
        },
        {
            accessor: 'name',
            title: 'Name',
            width: 200,
            sortable: true,
        },
        {
            accessor: 'category.name',
            title: 'Category',
            width: 150,
            sortable: true,
            render: (equipment) => (
                <Badge color={getCategoryColor(equipment.category.name)}>
                    {equipment.category.name}
                </Badge>
            ),
        },
        {
            accessor: 'equipment_series.name',
            title: 'Series',
            width: 150,
            sortable: true,
            render: (equipment) => equipment.equipment_series?.name || '-',
        },
        {
            accessor: 'make',
            title: 'Make',
            width: 120,
            sortable: true,
        },
        {
            accessor: 'model',
            title: 'Model',
            width: 120,
            sortable: true,
        },
        {
            accessor: 'serial_no',
            title: 'Serial No',
            width: 120,
            sortable: true,
        },
        {
            accessor: 'status',
            title: 'Status',
            width: 120,
            sortable: true,
            render: (equipment) => (
                <Badge color={getStatusColor(equipment.status)}>
                    {equipment.status.replace('_', ' ')}
                </Badge>
            ),
        },
        {
            accessor: 'current_location',
            title: 'Location',
            width: 150,
            sortable: true,
        },
        {
            accessor: 'condition',
            title: 'Condition',
            width: 120,
            sortable: true,
            render: (equipment) => (
                equipment.condition ? (
                    <Badge color={getConditionColor(equipment.condition)}>
                        {equipment.condition}
                    </Badge>
                ) : '-'
            ),
        },
        {
            accessor: 'last_maintenance_date',
            title: 'Last Maintenance',
            width: 150,
            sortable: true,
            render: (equipment) => equipment.last_maintenance_date ? new Date(equipment.last_maintenance_date).toLocaleDateString() : '-',
        },
        {
            accessor: 'next_maintenance_date',
            title: 'Next Maintenance',
            width: 150,
            sortable: true,
            render: (equipment) => equipment.next_maintenance_date ? new Date(equipment.next_maintenance_date).toLocaleDateString() : '-',
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 100,
            textAlign: 'center' as DataTableColumnTextAlign,
            render: (equipment) => (
                <Group gap={4} justify="center">
                    <Tooltip label="Edit">
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(equipment)}
                        >
                            <Pencil size={16} />
                        </ActionIcon>
                    </Tooltip>
                    {equipment.deleted_at ? (
                        <Tooltip label="Restore">
                            <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => handleRestore(equipment)}
                            >
                                <RotateCcw size={16} />
                            </ActionIcon>
                        </Tooltip>
                    ) : (
                        <Tooltip label="Delete">
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(equipment)}
                            >
                                <Trash size={16} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            ),
        },
    ];

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
                                onClick={openCreateModal}
                            >
                                Add Equipment
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Card>
                                <Card.Section p="md">
                                    <Group justify='start'>
                                        <Select
                                            value={selectedCategory}
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
                                records={equipment.data}
                                totalRecords={equipment.last_page * 10}
                                recordsPerPage={10}
                                page={equipment.current_page}
                                onPageChange={(page) => loadEquipment({ page })}
                                fetching={loading}
                                noRecordsText="No equipment found"
                                minHeight={150}
                            />
                        </Stack>
                    </Card.Section>
                </Card>
            </Box>

            <Modal
                opened={deleteConfirmModalOpen}
                onClose={() => {
                    setDeleteConfirmModalOpen(false);
                    setPendingDelete(null);
                }}
                title="Confirm Delete"
                size="sm"
            >
                <Stack>
                    <Text>
                        Are you sure you want to delete this equipment? This action cannot be undone.
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            onClick={() => {
                                setDeleteConfirmModalOpen(false);
                                setPendingDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal
                opened={restoreConfirmModalOpen}
                onClose={() => {
                    setRestoreConfirmModalOpen(false);
                    setPendingRestore(null);
                }}
                title="Confirm Restore"
                size="sm"
            >
                <Stack>
                    <Text>
                        Are you sure you want to restore this equipment? This will make it available again.
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            onClick={() => {
                                setRestoreConfirmModalOpen(false);
                                setPendingRestore(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="green"
                            onClick={confirmRestore}
                        >
                            Restore
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <CreateEquipmentModal
                opened={createModalOpened}
                onClose={closeCreateModal}
                series={series}
                categories={categories.map(cat => ({ id: cat.id, name: cat.name }))}
            />

            {selectedEquipment && (
                <EditEquipmentModal
                    opened={editModalOpened}
                    onClose={closeEditModal}
                    equipment={selectedEquipment}
                    series={series}
                    categories={categories.map(cat => ({ id: cat.id, name: cat.name }))}
                />
            )}
        </AppLayout>
    );
} 