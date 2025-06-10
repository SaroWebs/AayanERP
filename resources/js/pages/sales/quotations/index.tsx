import { Head, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Paper, Title, Button, Group, Stack, Container } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { columns } from './columns';
import { QuotationFilters } from './filters';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { notifications } from '@mantine/notifications';

interface Quotation {
    id: number;
    quotation_no: string;
    client: {
        id: number;
        name: string;
    };
    status: string;
    approval_status: string;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
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

type QuotationAction = 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel';

export default function Index({ quotations, filters }: Props) {
    const handlePageChange = (page: number) => {
        router.get(
            route('sales.quotations.index'),
            { ...filters, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAction = (quotation: Quotation, action: QuotationAction) => {
        switch (action) {
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

            <Container size="xl" py="xl">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Title order={2}>Quotations</Title>
                        <Button
                            component={Link}
                            href={route('sales.quotations.create')}
                            leftSection={<Plus size={16} />}
                        >
                            New Quotation
                        </Button>
                    </Group>

                    <Paper p="md">
                        <Stack gap="md">
                            <QuotationFilters filters={filters} />
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
                    </Paper>
                </Stack>
            </Container>
        </AppLayout>
    );
} 