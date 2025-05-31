import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button, TextInput, Select, Table, Badge, Group, ActionIcon, Stack, Text } from '@mantine/core';
import { PlusIcon, SearchIcon, EditIcon, EyeIcon, TrashIcon } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface CategoryType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    variant: 'equipment' | 'scaffolding';
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
    categories_count: number;
}

interface Props extends PageProps {
    categoryTypes: {
        data: CategoryType[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        current_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search: string;
        variant: string;
        status: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Equipment',
        href: '#',
    },
    {
        title: 'Category Types',
        href: route('equipment.category-types.index'),
    },
];

export default function Index({ categoryTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [variant, setVariant] = useState(filters.variant);
    const [status, setStatus] = useState(filters.status);

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('equipment.category-types.index'),
            { search: value, variant, status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleVariantChange = (value: string | null) => {
        setVariant(value || '');
        router.get(
            route('equipment.category-types.index'),
            { search, variant: value || '', status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value || '');
        router.get(
            route('equipment.category-types.index'),
            { search, variant, status: value || '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category type?')) {
            router.delete(route('equipment.category-types.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Types" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <TextInput
                                placeholder="Search category types..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                leftSection={<SearchIcon size={16} />}
                                w={200}
                            />
                            <Select
                                value={variant}
                                onChange={handleVariantChange}
                                placeholder="Select variant"
                                data={[
                                    { value: '', label: 'All Variants' },
                                    { value: 'equipment', label: 'Equipment' },
                                    { value: 'scaffolding', label: 'Scaffolding' },
                                ]}
                                w={180}
                            />
                            <Select
                                value={status}
                                onChange={handleStatusChange}
                                placeholder="Select status"
                                data={[
                                    { value: '', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ]}
                                w={180}
                            />
                        </Group>
                        <Button
                            onClick={() => router.visit(route('equipment.category-types.create'))}
                            leftSection={<PlusIcon size={16} />}
                        >
                            Add Category Type
                        </Button>
                    </Group>

                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Variant</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Categories</Table.Th>
                                <Table.Th>Sort Order</Table.Th>
                                <Table.Th>Created At</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {categoryTypes.data.map((categoryType) => (
                                <Table.Tr key={categoryType.id}>
                                    <Table.Td>{categoryType.name}</Table.Td>
                                    <Table.Td>
                                        <Badge color={categoryType.variant === 'equipment' ? 'blue' : 'gray'}>
                                            {categoryType.variant}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={categoryType.status === 'active' ? 'green' : 'red'}>
                                            {categoryType.status}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{categoryType.categories_count}</Table.Td>
                                    <Table.Td>{categoryType.sort_order}</Table.Td>
                                    <Table.Td>{new Date(categoryType.created_at).toLocaleDateString()}</Table.Td>
                                    <Table.Td>
                                        <Group justify="flex-end" gap="xs">
                                            <ActionIcon
                                                variant="subtle"
                                                color="blue"
                                                onClick={() => router.visit(route('equipment.category-types.edit', categoryType.id))}
                                            >
                                                <EditIcon size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="subtle"
                                                color="blue"
                                                onClick={() => router.visit(route('equipment.category-types.show', categoryType.id))}
                                            >
                                                <EyeIcon size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleDelete(categoryType.id)}
                                            >
                                                <TrashIcon size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>

                    {categoryTypes.data.length === 0 && (
                        <Text c="dimmed" ta="center" py="md">
                            No category types found
                        </Text>
                    )}

                    {categoryTypes.data.length > 0 && (
                        <Group justify="space-between" mt="md">
                            <Text size="sm" c="dimmed">
                                Showing {categoryTypes.from} to {categoryTypes.to} of {categoryTypes.total} results
                            </Text>
                            <Group gap="xs">
                                {categoryTypes.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'filled' : 'light'}
                                        size="xs"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </Group>
                        </Group>
                    )}
                </div>
            </div>
        </AppLayout>
    );
} 