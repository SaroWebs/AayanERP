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
    Modal,
    Divider
} from '@mantine/core';
import { DataTable, DataTableColumn, DataTableColumnTextAlign } from 'mantine-datatable';
import { Plus, Pencil, Trash } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import CreateEquipmentModal from './Partials/CreateEquipmentModal';
import EditEquipmentModal from './Partials/EditEquipmentModal';

interface CategoryType {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Category {
    id: number;
    name: string;
    category_type_id: number;
    categoryType: CategoryType;
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
    category: Category;
    equipment_series: Series;
}

interface Props extends PageProps {
    series: Series[];
    filters: {
        category_id?: string;
        series_id?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, series, filters }: Props) {
    const [variant, setVariant] = useState<'equipment' | 'scaffolding' | ''>('');
    const [categoryTypeId, setCategoryTypeId] = useState('');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
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

    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    const loadEquipment = async (params: {
        page?: number;
        category_id?: string;
        series_id?: string;
        status?: string;
        search?: string;
    } = {}) => {
        try {
            setLoading(true);
            console.log('Loading equipment with params:', params);
            const response = await axios.get(route('equipment.equipment.data'), {
                params: {
                    page: params.page || 1,
                    category_id: params.category_id || categoryId,
                    series_id: params.series_id || filters.series_id,
                    status: params.status || filters.status,
                    search: params.search || filters.search,
                }
            });
            console.log('Equipment data received:', response.data);
            setEquipment(response.data);
            console.info(response.data);
        } catch (error) {
            console.error('Error loading equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load equipment initially and when filters change
    useEffect(() => {
        loadEquipment();
    }, [categoryId, filters.series_id, filters.status, filters.search]);

    // Load category types when variant changes
    useEffect(() => {
        if (variant) {
            axios.get(route('equipment.category-types.data'), {
                params: { variant }
            }).then(response => {
                setCategoryTypes(response.data);
                setCategoryTypeId(''); // Reset category type when variant changes
                setCategoryId(''); // Reset category when variant changes
            });
        } else {
            setCategoryTypes([]);
            setCategoryTypeId('');
            setCategoryId('');
        }
    }, [variant]);

    // Load categories when category type changes
    useEffect(() => {
        if (categoryTypeId) {
            axios.get(route('equipment.categories.data'), {
                params: {
                    variant,
                    category_type_id: categoryTypeId
                }
            }).then(response => {
                setCategories(response.data);
                setCategoryId(''); // Reset category when category type changes
            });
        } else {
            setCategories([]);
            setCategoryId('');
        }
    }, [categoryTypeId, variant]);

    const handleVariantChange = (value: string | null) => {
        setVariant(value as 'equipment' | 'scaffolding' | '');
    };

    const handleCategoryTypeChange = (value: string | null) => {
        setCategoryTypeId(value || '');
    };

    const handleCategoryChange = (value: string | null) => {
        setCategoryId(value || '');
    };

    const handleDelete = (id: number) => {
        modals.openConfirmModal({
            title: 'Delete Equipment',
            children: (
                <Text size="sm">
                    Are you sure you want to delete this equipment? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await axios.delete(route('equipment.equipment.destroy', id));
                    loadEquipment(); // Reload equipment after deletion
                } catch (error) {
                    console.error('Error deleting equipment:', error);
                }
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
                    <Text fw={500}>{record.name}</Text>
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
                <Badge color={getCategoryColor(record.category?.categoryType?.variant)}>
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
                <Badge color={getStatusColor(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
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
                                            value={variant}
                                            onChange={handleVariantChange}
                                            placeholder="Select variant"
                                            data={[
                                                { value: '', label: 'All Variants' },
                                                { value: 'equipment', label: 'Equipment' },
                                                { value: 'scaffolding', label: 'Scaffolding' }
                                            ]}
                                            style={{ width: 200 }}
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
                                            disabled={!variant}
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
                                            disabled={!categoryTypeId}
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