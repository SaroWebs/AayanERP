import { Head } from '@inertiajs/react';
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
                <Badge
                    color={record.status === 'active' ? 'green' : 'red'}
                >
                    {record.status}
                </Badge>
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
                <Badge
                    color={record.status === 'active' ? 'green' : 'red'}
                >
                    {record.status}
                </Badge>
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
            />

            <EditCategoryModal
                opened={editCategoryModalOpen}
                onClose={() => {
                    setEditCategoryModalOpen(false);
                    setSelectedCategory(null);
                }}
                category={selectedCategory}
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
        </AppLayout>
    );
} 