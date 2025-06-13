import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types/index.d';
import AppLayout from '@/layouts/app-layout';
import {
    Card,
    TextInput,
    Select,
    Table,
    Badge,
    Button,
    Group,
    Stack,
    ActionIcon,
    Text,
    Pagination,
    Box,
    Modal
} from '@mantine/core';
import { Plus, Pencil, Trash, RotateCcw } from 'lucide-react';
import CreateSeriesModal from './Partials/CreateSeriesModal';
import EditSeriesModal from './Partials/EditSeriesModal';

interface Series {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    equipment_count: number;
}

interface Props extends PageProps {
    auth: any;
    series: {
        data: Series[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, series, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [restoreConfirmModalOpen, setRestoreConfirmModalOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Series | null>(null);
    const [pendingRestore, setPendingRestore] = useState<Series | null>(null);

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Series', href: route('equipment.series.index') },
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('equipment.series.index'),
            { search: value, status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value || '');
        router.get(
            route('equipment.series.index'),
            { search, status: value || '' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (series: Series) => {
        setPendingDelete(series);
        setDeleteConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!pendingDelete) return;
        
        router.delete(route('equipment.series.destroy', pendingDelete.id), {
            onSuccess: () => {
                setDeleteConfirmModalOpen(false);
                setPendingDelete(null);
            },
        });
    };

    const handleRestore = (series: Series) => {
        setPendingRestore(series);
        setRestoreConfirmModalOpen(true);
    };

    const confirmRestore = () => {
        if (!pendingRestore) return;
        
        router.post(route('equipment.series.restore', pendingRestore.id), {}, {
            onSuccess: () => {
                setRestoreConfirmModalOpen(false);
                setPendingRestore(null);
            },
        });
    };

    const handleEdit = (series: Series) => {
        setSelectedSeries(series);
        setEditModalOpened(true);
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'green' : 'red';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment Series" />

            <Box py="xl">
                <Card>
                    <Card.Section p="md">
                        <Group justify="space-between">
                            <Text fw={500} size="xl">Equipment Series</Text>
                            <Button
                                leftSection={<Plus size={16} />}
                                onClick={() => setCreateModalOpened(true)}
                            >
                                Add Series
                            </Button>
                        </Group>
                    </Card.Section>

                    <Card.Section p="md">
                        <Stack gap="md">
                            <Group>
                                <TextInput
                                    placeholder="Search series..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <Select
                                    placeholder="Filter by status"
                                    value={status}
                                    onChange={handleStatusChange}
                                    data={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                    ]}
                                    clearable
                                    style={{ width: 200 }}
                                />
                            </Group>

                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Description</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Equipment Count</Table.Th>
                                        <Table.Th>Last Updated</Table.Th>
                                        <Table.Th style={{ width: 100 }}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {series.data.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Text fw={500}>{item.name}</Text>
                                                    {item.deleted_at && (
                                                        <Badge color="red" variant="light">Deleted</Badge>
                                                    )}
                                                </Group>
                                                <Text size="xs" c="dimmed">{item.slug}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text lineClamp={2}>{item.description || '-'}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={getStatusColor(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color="blue">
                                                    {item.equipment_count} items
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{new Date(item.updated_at).toLocaleDateString()}</Text>
                                                <Text size="xs" c="dimmed">{new Date(item.updated_at).toLocaleTimeString()}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group justify="flex-end" gap="xs">
                                                    {item.deleted_at ? (
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="green"
                                                            onClick={() => handleRestore(item)}
                                                            title="Restore Series"
                                                        >
                                                            <RotateCcw size={16} />
                                                        </ActionIcon>
                                                    ) : (
                                                        <>
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="blue"
                                                                onClick={() => handleEdit(item)}
                                                                title="Edit Series"
                                                            >
                                                                <Pencil size={16} />
                                                            </ActionIcon>
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="red"
                                                                onClick={() => handleDelete(item)}
                                                                title="Delete Series"
                                                            >
                                                                <Trash size={16} />
                                                            </ActionIcon>
                                                        </>
                                                    )}
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>

                            <Group justify="end">
                                <Pagination
                                    total={series.last_page}
                                    value={series.current_page}
                                    onChange={(page) => {
                                        router.get(
                                            route('equipment.series.index'),
                                            { page, search, status },
                                            { preserveState: true }
                                        );
                                    }}
                                />
                            </Group>
                        </Stack>
                    </Card.Section>
                </Card>
            </Box>

            <CreateSeriesModal
                opened={createModalOpened}
                onClose={() => setCreateModalOpened(false)}
            />

            {selectedSeries && (
                <EditSeriesModal
                    opened={editModalOpened}
                    onClose={() => {
                        setEditModalOpened(false);
                        setSelectedSeries(null);
                    }}
                    series={selectedSeries}
                />
            )}

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
                        Are you sure you want to delete this series? This action cannot be undone.
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
                        Are you sure you want to restore this series? This will make it available again.
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