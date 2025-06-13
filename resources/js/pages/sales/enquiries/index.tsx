import { useState, useCallback, useMemo } from 'react';
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
import { Plus, RefreshCw, Edit, UserPlus, Trash, Search } from 'lucide-react';
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
import { BreadcrumbItem, PageProps } from '@/types';

export default function EnquiriesPage() {
    const { auth } = usePage<PageProps>().props;
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [action, setAction] = useState<'view' | 'edit' | 'create' | 'assign'>('view');
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Fetch enquiries with search and pagination
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['enquiries', search, page],
        queryFn: async () => {
            const { data } = await axios.get('/sales/enquiries/data', {
                params: { search, page }
            });
            console.log('API Response:', data); // Debug log
            return data;
        }
    });

    // Debug logs
    console.log('Data:', data);
    console.log('Enquiries:', data?.data);
    console.log('Total:', data?.total);
    console.log('Per Page:', data?.per_page);

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
        mutationFn: async ({ id, status }: { id: number; status: Enquiry['status'] }) => {
            const endpoint = status === 'pending_review' ? 'submit' :
                status === 'approved' ? 'approve' :
                    status === 'converted' ? 'convert' :
                        status === 'cancelled' ? 'cancel' : 'update';
            await axios.post(`/sales/enquiries/${id}/${endpoint}`, { status });
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

    // Priority change mutation
    const priorityMutation = useMutation({
        mutationFn: async ({ id, priority }: { id: number; priority: Enquiry['priority'] }) => {
            await axios.put(`/sales/enquiries/${id}`, { priority });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: 'Priority updated successfully',
                color: 'green'
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to update priority',
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
            close();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to assign enquiry',
                color: 'red'
            });
        }
    });

    const handleView = useCallback((enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setAction('view');
        open();
    }, [open]);

    const handleEdit = useCallback((enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setAction('edit');
        open();
    }, [open]);

    const handleCreate = useCallback(() => {
        setSelectedEnquiry(null);
        setAction('create');
        open();
    }, [open]);

    const handleAssign = useCallback((enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setAction('assign');
        open();
    }, [open]);

    const handleDelete = useCallback((enquiry: Enquiry) => {
        modals.openConfirmModal({
            title: 'Delete Enquiry',
            children: (
                <Text size="sm">
                    Are you sure you want to delete this enquiry? This action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteMutation.mutate(enquiry.id)
        });
    }, [deleteMutation]);

    const handleApprove = useCallback((enquiry: Enquiry) => {
        statusMutation.mutate({ id: enquiry.id, status: 'approved' });
    }, [statusMutation]);

    const handleAssignSubmit = useCallback((userId: number) => {
        if (selectedEnquiry) {
            assignMutation.mutate({ id: selectedEnquiry.id, userId });
        }
    }, [selectedEnquiry, assignMutation]);

    const columns = useMemo(() => createColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onAssign: handleAssign,
        onStatusChange: (enquiry, status) => statusMutation.mutate({ id: enquiry.id, status }),
        onApprove: handleApprove,
        currentUserId: auth.user.id
    }), [handleView, handleEdit, handleDelete, handleAssign, statusMutation, handleApprove, auth.user.id]);

    const breadcrumbs: BreadcrumbItem[] = [
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
                                onClick={handleCreate}
                        >
                            New Enquiry
                        </Button>
                        </Group>
                    </Group>

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
                        />
                    </Paper>
                </Stack>

                <Modal
                    opened={opened}
                    onClose={close}
                    title={
                        action === 'view' ? 'View Enquiry' :
                            action === 'edit' ? 'Edit Enquiry' :
                                action === 'create' ? 'Create Enquiry' :
                                    'Assign Enquiry'
                    }
                    size="xl"
                >
                <EnquiryActionModal
                    action={action}
                    enquiry={selectedEnquiry}
                    onClose={close}
                    onAssign={handleAssignSubmit}
                    users={users}
                />
                </Modal>
            </Container>
        </AppLayout>
    );
} 