import { Head, router, Link } from '@inertiajs/react';
import { Paper, Title, Button, Group, Stack, Container } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { columns } from './columns';
import { PurchaseOrderFilters } from './filters';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import { ViewItem } from './partials/ViewItem';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { PurchaseOrder, PurchaseOrderAction, Vendor, Department, PurchaseIntent } from '@/types/purchase';
import axios from 'axios';

// Set up CSRF token for axios
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

interface Props extends PageProps {
    orders: {
        data: PurchaseOrder[];
        links: any[];
        total: number;
        per_page: number;
        current_page: number;
    };
    filters: {
        status?: string;
        approval_status?: string;
        vendor_id?: number;
        department_id?: number;
        from_date?: string;
        to_date?: string;
        search?: string;
    };
}

export default function Index({ orders, filters }: Props) {
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [viewModalOpened, setViewModalOpened] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [purchaseIntents, setPurchaseIntents] = useState<PurchaseIntent[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vendorsResponse, departmentsResponse, intentsResponse] = await Promise.all([
                axios.get('/data/vendors/all'),
                axios.get('/data/departments/all'),
                axios.get('/data/purchase-intents/all')
            ]);
            setVendors(vendorsResponse.data);
            setDepartments(departmentsResponse.data);
            setPurchaseIntents(intentsResponse.data);
        } catch (error) {
            notifications.show({ message: 'Failed to load data', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('purchases.orders.index'),
            { ...filters, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAction = (order: PurchaseOrder, action: PurchaseOrderAction) => {
        switch (action) {
            case 'view':
                setSelectedOrder(order);
                setViewModalOpened(true);
                break;
            case 'edit':
                setSelectedOrder(order);
                setEditModalOpened(true);
                break;
            case 'submit':
                router.post(route('purchases.orders.submit', order.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Purchase order submitted for review', color: 'green' })
                });
                break;
            case 'approve':
                router.post(route('purchases.orders.approve', order.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Purchase order approved', color: 'green' })
                });
                break;
            case 'reject':
                router.post(route('purchases.orders.reject', order.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Purchase order rejected', color: 'red' })
                });
                break;
            case 'cancel':
                router.post(route('purchases.orders.cancel', order.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Purchase order cancelled', color: 'red' })
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
            title: 'Purchase Orders',
            href: '/purchases/orders',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Container size="lg" py="xl">
                    <Group justify="space-between" mb="md">
                        <Title order={2}>Purchase Orders</Title>
                        <Button
                            leftSection={<Plus size={16} />}
                            onClick={() => setAddModalOpened(true)}
                        >
                            Add New
                        </Button>
                    </Group>
                    <Stack gap="md">
                        <PurchaseOrderFilters filters={filters} />
                        <DataTable
                            columns={columns(handleAction)}
                            records={orders.data}
                            totalRecords={orders.total}
                            recordsPerPage={orders.per_page}
                            page={orders.current_page}
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
                </Container>

                <AddNew
                    opened={addModalOpened}
                    onClose={() => setAddModalOpened(false)}
                    vendors={vendors}
                    departments={departments}
                    purchaseIntents={purchaseIntents}
                    loading={loading}
                />

                {selectedOrder && (
                    <>
                        <EditItem
                            opened={editModalOpened}
                            onClose={() => {
                                setEditModalOpened(false);
                                setSelectedOrder(null);
                            }}
                            order={selectedOrder}
                            vendors={vendors}
                            departments={departments}
                            purchaseIntents={purchaseIntents}
                            loading={loading}
                        />

                        <ViewItem
                            opened={viewModalOpened}
                            onClose={() => {
                                setViewModalOpened(false);
                                setSelectedOrder(null);
                            }}
                            order={selectedOrder}
                            vendors={vendors}
                            departments={departments}
                            purchaseIntents={purchaseIntents}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </AppLayout>
    );
} 