import { Head, router } from '@inertiajs/react';
import { Title, Button, Group, Stack, Container } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { columns } from './columns';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { ClientDetail } from '@/types/client';
import { Quotation, QuotationAction } from '@/types/sales';


interface Item {
    id: number;
    name: string;
    description?: string;
    unit?: string;
    purchase_price?: number;
    rental_rate?: number;
}

interface Props extends PageProps {
    quotations: {
        data: Quotation[];
        links: any[];
        total: number;
        per_page: number;
        current_page: number;
    };
    clients: ClientDetail[];
    items: Item[];
    filters: {
        status?: string;
        approval_status?: string;
        client_id?: number;
        from_date?: string;
        to_date?: string;
        search?: string;
    };
}

export default function Index({ quotations, items, clients, filters }: Props) {
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const handlePageChange = useCallback((page: number) => {
        if (page === quotations.current_page) return;
        setLoading(true);
        router.get(
            route('sales.quotations.index'),
            { ...filters, page },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setLoading(false)
            }
        );
    }, [quotations.current_page, filters]);

    const handleAction = useCallback((quotation: Quotation, action: QuotationAction) => {
        setActionLoading(quotation.id);
        const handleSuccess = (message: string) => {
            notifications.show({ message, color: 'green' });
            setActionLoading(null);
        };

        const handleError = (message: string) => {
            notifications.show({ message, color: 'red' });
            setActionLoading(null);
        };

        switch (action) {
            case 'view':
                router.visit(route('sales.quotations.show', quotation.id));
                break;
            case 'edit':
                setSelectedQuotation(quotation);
                setEditModalOpened(true);
                setActionLoading(null);
                break;
            case 'submit':
                router.put(route('sales.quotations.submit', quotation.id), {}, {
                    onSuccess: () => handleSuccess('Quotation submitted for review'),
                    onError: () => handleError('Failed to submit quotation'),
                    onFinish: () => setActionLoading(null)
                });
                break;
            case 'approve':
                router.put(route('sales.quotations.approve', quotation.id), {}, {
                    onSuccess: () => handleSuccess('Quotation approved'),
                    onError: () => handleError('Failed to approve quotation'),
                    onFinish: () => setActionLoading(null)
                });
                break;
            case 'reject':
                router.put(route('sales.quotations.reject', quotation.id), {}, {
                    onSuccess: () => handleSuccess('Quotation rejected'),
                    onError: () => handleError('Failed to reject quotation'),
                    onFinish: () => setActionLoading(null)
                });
                break;
            case 'convert':
                router.post(route('sales.quotations.convert', quotation.id), {}, {
                    onSuccess: () => handleSuccess('Converted to sales order'),
                    onError: () => handleError('Failed to convert quotation'),
                    onFinish: () => setActionLoading(null)
                });
                break;
            case 'cancel':
                router.put(route('sales.quotations.cancel', quotation.id), {}, {
                    onSuccess: () => handleSuccess('Quotation cancelled'),
                    onError: () => handleError('Failed to cancel quotation'),
                    onFinish: () => setActionLoading(null)
                });
                break;
            default:
                setActionLoading(null);
                break;
        }
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Quotations',
            href: '/sales/quotations',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quotations" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Container size="lg" py="xl">
                    <Group justify="space-between" mb="md">
                        <Title order={2}>Quotations</Title>
                        <AddNew items={items} clients={clients} loading={loading} />

                    </Group>
                    <Stack gap="md">
                        <DataTable
                            columns={columns(handleAction)}
                            records={quotations.data}
                            totalRecords={quotations.total}
                            recordsPerPage={quotations.per_page}
                            page={quotations.current_page}
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

                {selectedQuotation && (
                    <>
                        <EditItem
                            opened={editModalOpened}
                            onClose={() => {
                                setEditModalOpened(false);
                                setSelectedQuotation(null);
                            }}
                            quotation={selectedQuotation}
                            clients={clients}
                            items={items}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </AppLayout>
    );
} 