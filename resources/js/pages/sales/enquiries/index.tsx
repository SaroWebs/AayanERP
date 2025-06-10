import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem, PageProps } from '@/types';
import { Container, Title, Button, Group, Paper, Stack, LoadingOverlay } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { columns } from './columns';
import { EnquiryFilters } from './filters';
import { EnquiryActionModal } from './EnquiryActionModal';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import { Enquiry, EnquiryAction, EnquiryFilters as Filters } from './types';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

interface EnquiriesResponse {
    data: Enquiry[];
    links: any[];
    total: number;
    per_page: number;
    current_page: number;
}

interface Props extends PageProps {
    initialEnquiries: EnquiriesResponse;
    initialFilters: Filters;
    initialClients: Array<{ id: number; name: string }>;
}

export default function Index({ initialEnquiries, initialFilters, initialClients }: Props) {
    const [enquiries, setEnquiries] = useState<EnquiriesResponse>(initialEnquiries);
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [clients, setClients] = useState<Array<{ id: number; name: string }>>(initialClients);
    const [loading, setLoading] = useState(false);

    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [action, setAction] = useState<EnquiryAction | null>(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const handleAction = (enquiry: Enquiry, action: EnquiryAction) => {
        if (action === 'create') {
            setAddModalOpen(true);
            return;
        }
        if (action === 'edit') {
            setSelectedEnquiry(enquiry);
            setEditModalOpen(true);
            return;
        }
        setSelectedEnquiry(enquiry);
        setAction(action);
        setActionModalOpen(true);
    };

    const closeActionModal = () => {
        setActionModalOpen(false);
        setSelectedEnquiry(null);
        setAction(null);
    };

    const handlePageChange = (page: number) => {
        loadData(page);
    };

    const handleFiltersChange = (newFilters: Filters) => {
        setFilters(newFilters);
        loadData(1);
    };

    const loadData = async (page: number = 1) => {
        setLoading(true);
        try {
            const params = { ...filters, page };
            const response = await axios.get(route('sales.enquiries.data'), { params });
            
            if (response.data.data) {
                setEnquiries(response.data.data);
            }
            if (response.data.filters) {
                setFilters(response.data.filters);
            }
            if (response.data.clients) {
                setClients(response.data.clients);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to load enquiries',
                color: 'red',
            });
            console.error('Error loading enquiries:', error);
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Enquiries',
            href: '/sales/enquiries',
        },
    ];

    useEffect(() => {
        loadData();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enquiries" />

            <Container size="xl" py="xl">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Title order={2}>Enquiries</Title>
                        <Button
                            leftSection={<Plus size={16} />}
                            onClick={() => handleAction({} as Enquiry, 'create')}
                        >
                            New Enquiry
                        </Button>
                    </Group>

                    <Paper p="md" pos="relative">
                        <LoadingOverlay visible={loading} />
                        {enquiries?.data ?
                            <Stack gap="md">
                                <EnquiryFilters
                                    filters={filters}
                                    clients={clients}
                                    onChange={handleFiltersChange}
                                />
                                <DataTable
                                    columns={columns(handleAction)}
                                    records={enquiries.data}
                                    totalRecords={enquiries.total}
                                    recordsPerPage={enquiries.per_page}
                                    page={enquiries.current_page}
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
                            : null
                        }
                    </Paper>
                </Stack>

                <EnquiryActionModal
                    opened={actionModalOpen}
                    onClose={closeActionModal}
                    enquiry={selectedEnquiry}
                    action={action}
                />

                <AddNew
                    opened={addModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    clients={clients}
                />

                <EditItem
                    opened={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedEnquiry(null);
                    }}
                    enquiry={selectedEnquiry}
                    clients={clients}
                />
            </Container>
        </AppLayout>
    );
} 