import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem, PageProps } from '@/types';
import { Container, Title, Button, Group, Paper, Stack } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { columns } from './columns';
import { EnquiryFilters } from './filters';
import { EnquiryActionModal } from './EnquiryActionModal';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import { Enquiry, EnquiryAction, EnquiryFilters as Filters } from './types';
import AppLayout from '@/layouts/app-layout';

interface Props extends PageProps {
    enquiries: {
        data: Enquiry[];
        links: any[];
        total: number;
        per_page: number;
        current_page: number;
    };
    filters: Filters;
    clients: Array<{ id: number; name: string }>;
}

export default function Index({ enquiries, filters, clients }: Props) {
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
        router.get(
            route('sales.enquiries.index'),
            { ...filters, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Enquiries',
            href: '/sales/enquiries',
        },
    ];

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

                    <Paper p="md">
                        <Stack gap="md">
                            <EnquiryFilters filters={filters} clients={clients} />
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