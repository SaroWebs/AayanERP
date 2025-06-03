import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { 
    Card, 
    Button, 
    Group, 
    Stack,
    Text,
    Box,
    Tabs,
    Badge,
    Switch,
    Modal,
} from '@mantine/core';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import CreateCategoryModal from './Partials/CreateCategoryModal';
import EditCategoryModal from './Partials/EditCategoryModal';
import CreateCategoryTypeModal from './Partials/CreateCategoryTypeModal';
import EditCategoryTypeModal from './Partials/EditCategoryTypeModal';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category_type_id: number;
    hsn: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
    category_type: CategoryType;
}

interface CategoryType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    variant: 'equipment' | 'scaffolding';
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    categories: Category[];
    categoryTypes: CategoryType[];
}

export default function Index({ auth, categories, categoryTypes }: Props) {
    const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
    const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
    const [createCategoryTypeModalOpen, setCreateCategoryTypeModalOpen] = useState(false);
    const [editCategoryTypeModalOpen, setEditCategoryTypeModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedCategoryType, setSelectedCategoryType] = useState<CategoryType | null>(null);
    const [statusConfirmModalOpen, setStatusConfirmModalOpen] = useState(false);
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: number; status: 'active' | 'inactive' } | null>(null);
    const [pendingCategoryStatusUpdate, setPendingCategoryStatusUpdate] = useState<{ id: number; status: 'active' | 'inactive' } | null>(null);
    const [categoryStatusConfirmModalOpen, setCategoryStatusConfirmModalOpen] = useState(false);

    const form = useForm({
        status: '',
    });

    const categoryForm = useForm({
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

    const handleEditCategoryType = (categoryType: CategoryType) => {
        setSelectedCategoryType(categoryType);
        setEditCategoryTypeModalOpen(true);
    };

    const handleStatusChange = (categoryType: CategoryType, newStatus: 'active' | 'inactive') => {
        form.setData('status', newStatus);
        setPendingStatusUpdate({ id: categoryType.id, status: newStatus });
        setStatusConfirmModalOpen(true);
    };

    const confirmStatusUpdate = () => {
        if (!pendingStatusUpdate) return;
        
        form.put(route('equipment.category-types.status.update', pendingStatusUpdate.id), {
            onSuccess: () => {
                setStatusConfirmModalOpen(false);
                setPendingStatusUpdate(null);
            },
        });
    };

    const handleCategoryStatusChange = (category: Category, newStatus: 'active' | 'inactive') => {
        categoryForm.setData('status', newStatus);
        setPendingCategoryStatusUpdate({ id: category.id, status: newStatus });
        setCategoryStatusConfirmModalOpen(true);
    };

    const confirmCategoryStatusUpdate = () => {
        if (!pendingCategoryStatusUpdate) return;
        
        categoryForm.put(route('equipment.categories.status.update', pendingCategoryStatusUpdate.id), {
            onSuccess: () => {
                setCategoryStatusConfirmModalOpen(false);
                setPendingCategoryStatusUpdate(null);
            },
        });
    };

    const categoryColumns: DataTableColumn<Category>[] = [
        { accessor: 'name', title: 'Name' },
        { accessor: 'slug', title: 'Slug' },
        { 
            accessor: 'category_type.name',
            title: 'Category Type'
        },
        { 
            accessor: 'status',
            title: 'Status',
            render: (record: Category) => (
                <Switch
                    checked={record.status === 'active'}
                    onChange={(event) => handleCategoryStatusChange(record, event.currentTarget.checked ? 'active' : 'inactive')}
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
                    <Button
                        variant="light"
                        size="xs"
                        onClick={() => handleEditCategory(record)}
                    >
                        Edit
                    </Button>
                </Group>
            )
        }
    ];

    const categoryTypeColumns: DataTableColumn<CategoryType>[] = [
        { accessor: 'name', title: 'Name' },
        { accessor: 'slug', title: 'Slug' },
        { 
            accessor: 'variant',
            title: 'Variant',
            render: (record: CategoryType) => (
                <Badge
                    color={record.variant === 'equipment' ? 'blue' : 'green'}
                >
                    {record.variant}
                </Badge>
            )
        },
        { 
            accessor: 'status',
            title: 'Status',
            render: (record: CategoryType) => (
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
            render: (record: CategoryType) => (
                <Group gap="xs">
                    <Button
                        variant="light"
                        size="xs"
                        onClick={() => handleEditCategoryType(record)}
                    >
                        Edit
                    </Button>
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
                                <Button
                                    leftSection={<Plus size={16} />}
                                    onClick={() => setCreateCategoryTypeModalOpen(true)}
                                >
                                    Add Category Type
                                </Button>
                            </Group>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Tabs defaultValue="categories">
                            <Tabs.List>
                                <Tabs.Tab value="categories">Categories</Tabs.Tab>
                                <Tabs.Tab value="category-types">Category Types</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="categories" pt="md">
                                <DataTable
                                    borderRadius="sm"
                                    withTableBorder
                                    withColumnBorders
                                    striped
                                    highlightOnHover
                                    records={categories}
                                    columns={categoryColumns}
                                />
                            </Tabs.Panel>

                            <Tabs.Panel value="category-types" pt="md">
                                <DataTable
                                    borderRadius="sm"
                                    withTableBorder
                                    withColumnBorders
                                    striped
                                    highlightOnHover
                                    records={categoryTypes}
                                    columns={categoryTypeColumns}
                                />
                            </Tabs.Panel>
                        </Tabs>
                    </Card.Section>
                    </Card>
            </Box>

            <CreateCategoryModal
                opened={createCategoryModalOpen}
                onClose={() => setCreateCategoryModalOpen(false)}
                categoryTypes={categoryTypes}
                categories={categories}
            />

            <EditCategoryModal
                opened={editCategoryModalOpen}
                onClose={() => {
                    setEditCategoryModalOpen(false);
                    setSelectedCategory(null);
                }}
                category={selectedCategory}
                categoryTypes={categoryTypes}
            />

            <CreateCategoryTypeModal
                opened={createCategoryTypeModalOpen}
                onClose={() => setCreateCategoryTypeModalOpen(false)}
            />

            <EditCategoryTypeModal
                opened={editCategoryTypeModalOpen}
                onClose={() => {
                    setEditCategoryTypeModalOpen(false);
                    setSelectedCategoryType(null);
                }}
                categoryType={selectedCategoryType}
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
                        Are you sure you want to {pendingStatusUpdate?.status === 'active' ? 'activate' : 'deactivate'} this category type?
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
                opened={categoryStatusConfirmModalOpen}
                onClose={() => {
                    setCategoryStatusConfirmModalOpen(false);
                    setPendingCategoryStatusUpdate(null);
                }}
                title="Confirm Status Change"
                size="sm"
            >
                <Stack>
                    <Text>
                        Are you sure you want to {pendingCategoryStatusUpdate?.status === 'active' ? 'activate' : 'deactivate'} this category?
                    </Text>
                    <Group justify="flex-end">
                        <Button
                            variant="light"
                            onClick={() => {
                                setCategoryStatusConfirmModalOpen(false);
                                setPendingCategoryStatusUpdate(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color={pendingCategoryStatusUpdate?.status === 'active' ? 'green' : 'red'}
                            onClick={confirmCategoryStatusUpdate}
                        >
                            Confirm
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </AppLayout>
    );
} 