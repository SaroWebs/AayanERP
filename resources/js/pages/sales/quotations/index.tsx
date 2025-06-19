import { Head, router, Link } from '@inertiajs/react';
import { Paper, Title, Button, Group, Stack, Container } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { columns } from './columns';
import { QuotationFilters } from './filters';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import { ViewItem } from './partials/ViewItem';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { Quotation, QuotationAction } from '@/types/sales';
import axios from 'axios';

// Set up CSRF token for axios
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

interface Client {
    id: number;
    name: string;
    contact_details?: Array<{
        id: number;
        contact_person: string;
    }>;
}

interface Props extends PageProps {
    quotations: {
        data: Quotation[];
        links: any[];
        total: number;
        per_page: number;
        current_page: number;
    };
    filters: {
        status?: string;
        approval_status?: string;
        client_id?: number;
        from_date?: string;
        to_date?: string;
        search?: string;
    };
}

export default function Index({ quotations, filters }: Props) {
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [viewModalOpened, setViewModalOpened] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/data/clients/all');
            setClients(response.data);
        } catch (error) {
            notifications.show({ message: 'Failed to load clients', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('sales.quotations.index'),
            { ...filters, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAction = (quotation: Quotation, action: QuotationAction) => {
        switch (action) {
            case 'view':
                setSelectedQuotation(quotation);
                setViewModalOpened(true);
                break;
            case 'edit':
                setSelectedQuotation(quotation);
                setEditModalOpened(true);
                break;
            case 'submit':
                router.put(route('sales.quotations.submit', quotation.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Quotation submitted for review', color: 'green' })
                });
                break;
            case 'approve':
                router.put(route('sales.quotations.approve', quotation.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Quotation approved', color: 'green' })
                });
                break;
            case 'reject':
                router.put(route('sales.quotations.reject', quotation.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Quotation rejected', color: 'red' })
                });
                break;
            case 'convert':
                router.post(route('sales.quotations.convert', quotation.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Converted to sales order', color: 'green' })
                });
                break;
            case 'cancel':
                router.put(route('sales.quotations.cancel', quotation.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Quotation cancelled', color: 'red' })
                });
                break;
        }
    };

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
                        <Button
                            leftSection={<Plus size={16} />}
                            onClick={() => setAddModalOpened(true)}
                        >
                            Add New
                        </Button>
                    </Group>
                    <Stack gap="md">
                        {/* <QuotationFilters filters={filters} /> */}
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

                <AddNew
                    opened={addModalOpened}
                    onClose={() => setAddModalOpened(false)}
                    clients={clients}
                    loading={loading}
                />

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
                            loading={loading}
                        />

                        <ViewItem
                            opened={viewModalOpened}
                            onClose={() => {
                                setViewModalOpened(false);
                                setSelectedQuotation(null);
                            }}
                            quotation={selectedQuotation}
                            clients={clients}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </AppLayout>
    );
} 