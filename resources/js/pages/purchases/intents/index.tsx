import { Head, router } from '@inertiajs/react';
import { Paper, Title, Button, Group, Stack, Container, Box } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { columns } from './columns';
import { AddNew } from './partials/AddNew';
import { ViewItem } from './partials/ViewItem';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { PurchaseIntent, Department } from '@/types/purchase';
import axios from 'axios';
import { PurchaseIntentFilters } from './filters';
import { EditItem } from './partials/EditItem';

interface Props extends PageProps {
    intents: {
        data: PurchaseIntent[];
        links: any[];
        total: number;
        per_page: number;
        current_page: number;
    };
    filters: {
        status?: string;
        approval_status?: string;
        department_id?: number;
        from_date?: string;
        to_date?: string;
        search?: string;
    };
}

export default function Index({ intents, filters }: Props) {
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [viewModalOpened, setViewModalOpened] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState<PurchaseIntent | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/purchases/data/departments/all');
            setDepartments(response.data);
        } catch (error) {
            notifications.show({ message: 'Failed to load departments', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('purchases.intents.index'),
            { ...filters, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAction = (intent: PurchaseIntent, action: string) => {
        switch (action) {
            case 'view':
                setSelectedIntent(intent);
                setViewModalOpened(true);
                break;
            case 'edit':
                setSelectedIntent(intent);
                setEditModalOpened(true);
                break;
            case 'submit':
                router.post(route('purchases.intents.submit', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent submitted for review', color: 'green' })
                });
                break;
            case 'approve':
                router.post(route('purchases.intents.approve', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent approved', color: 'green' })
                });
                break;
            case 'reject':
                router.post(route('purchases.intents.reject', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent rejected', color: 'red' })
                });
                break;
            case 'convert':
                router.post(route('purchases.intents.convert', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent converted to PO', color: 'green' })
                });
                break;
            case 'cancel':
                router.post(route('purchases.intents.cancel', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent cancelled', color: 'red' })
                });
                break;
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Purchases',
            href: '/purchases',
        },
        {
            title: 'Purchase Intents',
            href: '/purchases/intents',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Intents" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Box className='p-4 w-full'>
                    <Group justify="space-between" mb="md">
                        <Title order={2}>Purchase Intents</Title>
                        <Button
                            leftSection={<Plus size={16} />}
                            onClick={() => setAddModalOpened(true)}
                        >
                            Add New
                        </Button>
                    </Group>
                    <Stack gap="md">
                        <PurchaseIntentFilters filters={filters} />
                        <DataTable
                            columns={columns(handleAction)}
                            records={intents.data}
                            totalRecords={intents.total}
                            recordsPerPage={intents.per_page}
                            page={intents.current_page}
                            onPageChange={handlePageChange}
                            withTableBorder
                            borderColor="gray.3"
                            striped
                            highlightOnHover
                            withColumnBorders
                            verticalAlign="top"
                            pinLastColumn
                        />
                    </Stack>
                </Box>

                <AddNew
                    opened={addModalOpened}
                    onClose={() => setAddModalOpened(false)}
                    departments={departments}
                    loading={loading}
                />

                {selectedIntent && (
                    <>
                        <EditItem
                            opened={editModalOpened}
                            onClose={() => {
                                setEditModalOpened(false);
                                setSelectedIntent(null);
                            }}
                            intent={selectedIntent}
                            departments={departments}
                            loading={loading}
                        />

                        <ViewItem
                            opened={viewModalOpened}
                            onClose={() => {
                                setViewModalOpened(false);
                                setSelectedIntent(null);
                            }}
                            intent={selectedIntent}
                            departments={departments}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </AppLayout>
    );
} 