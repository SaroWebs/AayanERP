import { Head, router, useForm } from '@inertiajs/react';
import type { PageProps } from '@/types/index.d';
import AppLayout from '@/layouts/app-layout';
import { 
    Card, 
    Button, 
    Group, 
    Stack,
    Text,
    Box,
    Badge,
    Switch,
    Modal,
    TextInput,
    Select,
    ActionIcon,
    Tooltip,
} from '@mantine/core';
import { Plus, Search, Filter, ArrowDownNarrowWide, ArrowDownWideNarrow, Trash, RotateCcw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import CreateCategoryModal from './Partials/CreateCategoryModal';
import EditCategoryModal from './Partials/EditCategoryModal';

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
    deleted_at: string | null;
    parent: Category | null;
    children: Category[];
    parent_id: number | null;
    technical_requirements: any[] | null;
    application_areas: any[] | null;
    quality_standards: any[] | null;
}


interface Props extends PageProps {
    categories: Category[];
}

export default function Index({ auth, categories }: Props) {
    const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
    const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [statusConfirmModalOpen, setStatusConfirmModalOpen] = useState(false);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [restoreConfirmModalOpen, setRestoreConfirmModalOpen] = useState(false);
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: number; status: 'active' | 'inactive' } | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
    const [pendingRestore, setPendingRestore] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showDeleted, setShowDeleted] = useState(false);

    const form = useForm({
        status: '',
    });

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Categories', href: route('equipment.categories.index') },
    ];

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setEditCategoryModalOpen(true);
    };

    const handleStatusChange = (category: Category, newStatus: 'active' | 'inactive') => {
        form.setData('status', newStatus);
        setPendingStatusUpdate({ id: category.id, status: newStatus });
        setStatusConfirmModalOpen(true);
    };

    const confirmStatusUpdate = () => {
        if (!pendingStatusUpdate) return;
        
        form.put(route('equipment.categories.status.update', pendingStatusUpdate.id), {
            onSuccess: () => {
                setStatusConfirmModalOpen(false);
                setPendingStatusUpdate(null);
            },
        });
    };

    const handleDeleteCategory = (category: Category) => {
        setPendingDelete(category);
        setDeleteConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        
        router.delete(route('equipment.categories.destroy', pendingDelete.id), {
            onSuccess: () => {
                setDeleteConfirmModalOpen(false);
                setPendingDelete(null);
            },
        });
    };

    const handleRestoreCategory = (category: Category) => {
        setPendingRestore(category);
        setRestoreConfirmModalOpen(true);
    };

    const confirmRestore = () => {
        if (!pendingRestore) return;
        
        router.put(route('equipment.categories.restore', pendingRestore.id), {}, {
            onSuccess: () => {
                setRestoreConfirmModalOpen(false);
                setPendingRestore(null);
            },
        });
    };

    const filteredCategories = useMemo(() => {
        return categories
            .filter(category => {
                const matchesSearch = 
                    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
                
                const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
                const matchesDeleted = showDeleted ? category.deleted_at !== null : category.deleted_at === null;
                
                return matchesSearch && matchesStatus && matchesDeleted;
            })
            .sort((a, b) => {
                const aValue = a.sort_order;
                const bValue = b.sort_order;
                
                return aValue - bValue;
            });
    }, [categories, searchQuery, statusFilter, showDeleted]);

    const categoryColumns: DataTableColumn<Category>[] = [
        { 
            accessor: 'name', 
            title: (
                <Group gap="xs">
                    Name
                </Group>
            ),
            render: (record: Category) => (
                <Group gap="xs">
                    {record.parent && (
                        <Text size="sm" c="dimmed">↳</Text>
                    )}
                    <Group gap="xs">
                        <Text>{record.name}</Text>
                        {record.deleted_at && (
                            <Badge color="red" variant="light">Deleted</Badge>
                        )}
                    </Group>
                </Group>
            )
        },
        { 
            accessor: 'slug', 
            title: (
                <Group gap="xs">
                    Slug
                </Group>
            )
        },
        { 
            accessor: 'parent',
            title: 'Parent Category',
            render: (record: Category) => record.parent?.name || '-'
        },
        { 
            accessor: 'status',
            title: (
                <Group gap="xs">
                    Status
                </Group>
            ),
            render: (record: Category) => (
                <Switch
                    checked={record.status === 'active'}
                    onChange={(event) => handleStatusChange(record, event.currentTarget.checked ? 'active' : 'inactive')}
                    color="green"
                    size="md"
                />
            )
        },
        {
            accessor: 'actions',
            title: 'Actions',
            render: (record: Category) => (
                <Group gap="xs">
                    {!record.deleted_at ? (
                        <>
                            <Tooltip label="Edit Category">
                                <Button
                                    variant="light"
                                    size="xs"
                                    onClick={() => handleEditCategory(record)}
                                >
                                    Edit
                                </Button>
                            </Tooltip>
                            <Tooltip label="Delete Category">
                                <Button
                                    variant="light"
                                    color="red"
                                    size="xs"
                                    onClick={() => handleDeleteCategory(record)}
                                >
                                    <Trash size={14} />
                                </Button>
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip label="Restore Category">
                            <Button
                                variant="light"
                                color="green"
                                size="xs"
                                onClick={() => handleRestoreCategory(record)}
                            >
                                <RotateCcw size={14} />
                            </Button>
                        </Tooltip>
                    )}
                </Group>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Categories</Text>
                            <Group>
                                <Button
                                    leftSection={<Plus size={16} />}
                                    onClick={() => setCreateCategoryModalOpen(true)}
                                >
                                    Add Category
                                </Button>
                            </Group>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Group>
                                <TextInput
                                    placeholder="Search categories..."
                                    leftSection={<Search size={14} />}
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                                    style={{ flex: 1 }}
                                />
                                <Select
                                    placeholder="Filter by status"
                                    value={statusFilter}
                                    onChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
                                    data={[
                                        { value: 'all', label: 'All Status' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                    ]}
                                    leftSection={<Filter size={14} />}
                                />
                                <Switch
                                    label="Show Deleted"
                                    checked={showDeleted}
                                    onChange={(event) => setShowDeleted(event.currentTarget.checked)}
                                />
                            </Group>
                            <DataTable
                                borderRadius="sm"
                                withTableBorder
                                withColumnBorders
                                striped
                                highlightOnHover
                                records={filteredCategories}
                                columns={categoryColumns}
                                noRecordsText="No categories found"
                            />
                        </Stack>
                    </Card.Section>
                </Card>
            </Box>

            <CreateCategoryModal
                opened={createCategoryModalOpen}
                onClose={() => setCreateCategoryModalOpen(false)}
                categories={categories}
            />

            <EditCategoryModal
                opened={editCategoryModalOpen}
                onClose={() => {
                    setEditCategoryModalOpen(false);
                    setSelectedCategory(null);
                }}
                category={selectedCategory}
                categories={categories}
            />

            <Modal
                opened={statusConfirmModalOpen}
                onClose={() => {
                    setStatusConfirmModalOpen(false);
                    setPendingStatusUpdate(null);
                }}
                title="Confirm Status Change"
                size="sm"
            >
                <Stack>
                    <Text>
                        Are you sure you want to {pendingStatusUpdate?.status === 'active' ? 'activate' : 'deactivate'} this category?
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            onClick={() => {
                                setStatusConfirmModalOpen(false);
                                setPendingStatusUpdate(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color={pendingStatusUpdate?.status === 'active' ? 'green' : 'red'}
                            onClick={confirmStatusUpdate}
                        >
                            Confirm
                        </Button>
                    </Group>
                </Stack>
            </Modal>

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
                        Are you sure you want to delete this category? This action cannot be undone.
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
                        Are you sure you want to restore this category? This will make it available again.
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
        </AppLayout>
    );
} 