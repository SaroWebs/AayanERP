import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Container,
    Title,
    Group,
    Button,
    Paper,
    LoadingOverlay,
    Stack,
    Text,
    Modal,
    ActionIcon,
    Tooltip,
    TextInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { DataTable } from 'mantine-datatable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { Enquiry } from './types';
import { createColumns } from './columns';
import { EnquiryActionModal } from './EnquiryActionModal';
import { modals } from '@mantine/modals';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { Filters } from './filters';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import { PrepareQuotationModal } from './PrepareQuotationModal';
import { ClientDetail } from '@/types/client';

export default function EnquiriesPage() {
    const { auth } = usePage<PageProps>().props;
    const queryClient = useQueryClient();

    // States for filtering and pagination
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});

    // States for selected enquiry and modals
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [addNewModalOpened, setAddNewModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [actionModalOpened, { open: openActionModal, close: closeActionModal }] = useDisclosure(false);
    const [quotationModalOpened, setQuotationModalOpened] = useState(false);
    const [actionType, setActionType] = useState<'view' | 'edit' | 'create' | 'assign'>('view');
    // Fetch enquiries with search, filters, and pagination
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['enquiries', search, filters, page],
        queryFn: async () => {
            const { data } = await axios.get('/sales/enquiries/data', {
                params: {
                    search,
                    page,
                    ...filters
                }
            });
            return data;
        }
    });

    const enquiries = data?.data ?? [];
    const totalRecords = data?.total ?? 0;
    const recordsPerPage = data?.per_page ?? 10;

    // Fetch users for assignment
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axios.get('/data/config/users');
            return data;
        }
    });

    // Fetch clients for dropdowns
    const { data: clients = [] } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data } = await axios.get('/data/clients');
            return data;
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`/sales/enquiries/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: 'Enquiry deleted successfully',
                color: 'green'
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to delete enquiry',
                color: 'red'
            });
        }
    });

    // Status change mutation
    const statusMutation = useMutation({
        mutationFn: async ({ id, status, remarks }: { id: number; status: Enquiry['status']; remarks?: string }) => {
            const endpoint = status === 'pending_review' ? 'submit' :
                status === 'approved' ? 'approve' :
                    status === 'converted' ? 'convert' :
                        status === 'cancelled' ? 'cancel' :
                            status === 'lost' ? 'reject' : 'update';
            await axios.post(`/sales/enquiries/${id}/${endpoint}`, {
                status,
                approval_remarks: remarks
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: 'Status updated successfully',
                color: 'green'
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to update status',
                color: 'red'
            });
        }
    });

    // Assign mutation
    const assignMutation = useMutation({
        mutationFn: async ({ id, userId }: { id: number; userId: number }) => {
            await axios.post(`/sales/enquiries/${id}/assign`, { assigned_to: userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: 'Enquiry assigned successfully',
                color: 'green'
            });
            closeActionModal();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to assign enquiry',
                color: 'red'
            });
        }
    });

    // Action handlers
    const handleView = useCallback((enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setActionType('view');
        openActionModal();
    }, [openActionModal]);

    const handleEdit = useCallback((enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setEditModalOpened(true);
    }, []);

    const handleAddNew = useCallback(() => {
        setAddNewModalOpened(true);
    }, []);

    const handleAssign = useCallback((enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setActionType('assign');
        openActionModal();
    }, [openActionModal]);

    const handleDelete = useCallback((enquiry: Enquiry) => {
        modals.openConfirmModal({
            title: 'Delete Enquiry',
            children: (
                <Text size="sm">
                    Are you sure you want to delete enquiry {enquiry.enquiry_no}? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteMutation.mutate(enquiry.id)
        });
    }, [deleteMutation]);

    const handlePrepareQuotation = useCallback((enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setQuotationModalOpened(true);
    }, []);
    const handleAssignSubmit = useCallback((userId: number) => {
        if (selectedEnquiry) {
            assignMutation.mutate({ id: selectedEnquiry.id, userId });
        }
    }, [selectedEnquiry, assignMutation]);

    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(newFilters);
        setPage(1); // Reset to first page when filters change
    }, []);

    const handleFilterReset = useCallback(() => {
        setFilters({});
        setSearch('');
        setPage(1);
    }, []);

    // Create table columns with action handlers
    const columns = useMemo(() => createColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onAssign: handleAssign,
        onStatusChange: (enquiry, status) => statusMutation.mutate({ id: enquiry.id, status }),
        onApprove: (enquiry) => statusMutation.mutate({ id: enquiry.id, status: 'approved' }),
        currentUserId: auth.user.id
    }), [handleView, handleEdit, handleDelete, handleAssign, statusMutation, auth.user.id]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Sales',
            href: '/sales',
        },
        {
            title: 'Enquiries',
            href: '/sales/enquiries',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enquiries" />
            <Container size="xl" className='w-full m-4'>
                <Stack>
                    {/* Header Section with Search and Add Button */}
                    <Group justify="space-between" align="center">
                        <Title order={2}>Enquiries</Title>
                        <Group>
                            <TextInput
                                placeholder="Search enquiries..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftSection={<Search size={16} />}
                                style={{ width: 300 }}
                            />
                            <Tooltip label="Refresh">
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    onClick={() => refetch()}
                                    loading={isLoading}
                                >
                                    <RefreshCw size={16} />
                                </ActionIcon>
                            </Tooltip>
                            <Button
                                leftSection={<Plus size={16} />}
                                onClick={handleAddNew}
                            >
                                New Enquiry
                            </Button>
                        </Group>
                    </Group>

                    {/* Filters Component */}
                    <Filters
                        filters={filters}
                        onFiltersChange={handleFilterChange}
                        onReset={handleFilterReset}
                        users={users}
                        clients={clients}
                    />

                    {/* Enquiries Table */}
                    <Paper pos="relative" withBorder>
                        <LoadingOverlay visible={isLoading} />
                        <DataTable
                            columns={columns}
                            records={enquiries}
                            withColumnBorders
                            striped
                            highlightOnHover
                            totalRecords={totalRecords}
                            recordsPerPage={recordsPerPage}
                            page={page}
                            onPageChange={setPage}
                            paginationSize="sm"
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing ${from} to ${to} of ${totalRecords} entries`
                            }
                            noRecordsText="No enquiries found"
                        />
                    </Paper>
                </Stack>

                {/* Add New Enquiry Modal */}
                {addNewModalOpened && (
                    <AddNew
                        opened={addNewModalOpened}
                        onClose={() => {
                            setAddNewModalOpened(false);
                            refetch();
                        }}
                        clients={clients}
                    />
                )}

                {/* Edit Enquiry Modal */}
                {editModalOpened && selectedEnquiry && (
                    <EditItem
                        opened={editModalOpened}
                        onClose={() => {
                            setEditModalOpened(false);
                            refetch();
                        }}
                        enquiry={selectedEnquiry}
                        clients={clients}
                    />
                )}

                {/* View/Assign Modal */}
                <Modal
                    opened={actionModalOpened}
                    onClose={closeActionModal}
                    title={
                        actionType === 'view' ? 'View Enquiry' :
                            actionType === 'assign' ? 'Assign Enquiry' : ''
                    }
                    size="xl"
                >
                    <EnquiryActionModal
                        action={actionType}
                        enquiry={selectedEnquiry}
                        onClose={closeActionModal}
                        onAssign={handleAssignSubmit}
                        users={users}
                    />
                </Modal>

                {/* Prepare Quotation Modal */}
                {quotationModalOpened && selectedEnquiry && (
                    <PrepareQuotationModal
                        opened={quotationModalOpened}
                        onClose={() => {
                            setQuotationModalOpened(false);
                            refetch();
                        }}
                        enquiry={selectedEnquiry}
                        onSuccess={() => {
                            statusMutation.mutate({
                                id: selectedEnquiry.id,
                                status: 'converted'
                            });
                            setQuotationModalOpened(false);
                        }}
                    />
                )}
            </Container>
        </AppLayout>
    );
}
