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

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    sort_order: number;
    parent_id: number | null;
}

interface Series {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
}

interface Equipment {
    id: number;
    name: string;
    code: string;
    serial_no: string;
    details: string | null;
    rental_rate: number | null;
    make: string | null;
    model: string | null;
    make_year: number | null;
    capacity: string | null;
    stock_unit: string | null;
    unit_weight: string | null;
    rental_unit: string | null;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    condition: 'new' | 'good' | 'fair' | 'poor';
    purchase_date: string | null;
    purchase_price: number | null;
    warranty_expiry: string | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    location: string | null;
    notes: string | null;
    category_id: number;
    equipment_series_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    category: Category;
    equipment_series: Series;
    temperature_rating: string | null;
    chemical_composition: any | null;
    application_type: string | null;
    technical_specifications: any | null;
    material_safety_data: any | null;
    installation_guidelines: string | null;
    maintenance_requirements: string | null;
    quality_certifications: any | null;
    storage_conditions: any | null;
    batch_number: string | null;
    manufacturing_date: string | null;
    expiry_date: string | null;
    physical_properties: any | null;
    dimensional_specifications: any | null;
    visual_inspection_criteria: any | null;
    series: Series;
}

interface Props extends PageProps {
    auth: any;
    series: Series[];
    filters: {
        category_id?: string;
        series_id?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, series, filters }: Props) {
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(filters.category_id || '');
    const [equipment, setEquipment] = useState<{
        data: Equipment[];
        current_page: number;
        last_page: number;
        links: any[];
    }>({
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
            accessor: 'name',
            title: 'Name',
            render: (record) => (
                <Box>
                    <Group gap="xs">
                        <Text fw={500}>{record.name}</Text>
                        {record.deleted_at && (
                            <Badge color="red" variant="light">Deleted</Badge>
                        )}
                    </Group>
                    {record.details && (
                        <Text size="xs" c="dimmed" lineClamp={2}>
                            {record.details}
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
            accessor: 'serial_no',
            title: 'Serial No',
        },
        {
            accessor: 'category',
            title: 'Category',
            render: (record) => (
                <Badge>
                    {record.category.name}
                </Badge>
            ),
        },
        {
            accessor: 'equipment_series',
            title: 'Series',
            render: (record) => record.equipment_series?.name || '-',
        },
        {
            accessor: 'status',
            title: 'Status',
            render: (record) => (
                <Group>
                    {!record.deleted_at && (
                        <Badge color={getStatusColor(record.status)}>{record.status}</Badge>
                    )}
                    {record.deleted_at && (
                        <Badge color="red">Deleted</Badge>
                    )}
                </Group>
            ),
        },
        {
            accessor: 'condition',
            title: 'Condition',
            render: (record) => (
                <Badge color={getConditionColor(record.condition)}>
                    {record.condition.charAt(0).toUpperCase() + record.condition.slice(1)}
                </Badge>
            ),
        },
        {
            accessor: 'actions',
            title: '',
            textAlign: 'right' as DataTableColumnTextAlign,
            render: (record) => (
                <Group gap={4} justify="flex-end">
                    {record.deleted_at ? (
                        <Tooltip label="Restore">
                            <ActionIcon
                                variant="light"
                                color="green"
                                onClick={() => handleRestore(record)}
                            >
                                <RotateCcw size={16} />
                            </ActionIcon>
                        </Tooltip>
                    ) : (
                        <>
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
                                    onClick={() => handleDelete(record)}
                                >
                                    <Trash size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </>
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
            />

            {selectedEquipment && (
                <EditEquipmentModal
                    opened={editModalOpened}
                    onClose={closeEditModal}
                    equipment={selectedEquipment}
                    series={series}
                />
            )}
        </AppLayout>
    );
} 