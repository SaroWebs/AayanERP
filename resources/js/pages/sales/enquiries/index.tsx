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
    TextInput,
    Badge,
    Stepper,
    Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, RefreshCw, Search, Eye, Edit, Trash2, UserPlus, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { DataTable } from 'mantine-datatable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { Enquiry, ENQUIRY_STATUS_COLORS, ENQUIRY_PRIORITY_COLORS, ENQUIRY_TYPE_LABELS } from './types';
import { EnquiryActionModal } from './EnquiryActionModal';
import { modals } from '@mantine/modals';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import { PrepareQuotationModal } from './PrepareQuotationModal';

// Add this new component at the top level
function EnquiryWorkflow({ status }: { status: Enquiry['status'] }) {
    const steps = [
        { label: 'Draft', value: 'draft' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Pending Approval', value: 'pending_approval' },
        { label: 'Approved', value: 'approved' },
        { label: 'Converted', value: 'converted' }
    ];

    const currentStep = steps.findIndex(step => step.value === status);
    const isLost = status === 'lost';
    const isCancelled = status === 'cancelled';

    if (isLost || isCancelled) {
        return (
            <Box mt="md">
                <Text size="sm" c="dimmed" mb="xs">Current Status:</Text>
                <Badge color={isLost ? 'red' : 'gray'} size="lg">
                    {isLost ? 'Lost Opportunity' : 'Cancelled'}
                </Badge>
            </Box>
        );
    }

    return (
        <Box mt="md">
            <Text size="sm" c="dimmed" mb="xs">Workflow Progress:</Text>
            <Stepper active={currentStep} size="sm">
                {steps.map((step) => (
                    <Stepper.Step
                        key={step.value}
                        label={step.label}
                        state={steps.findIndex(s => s.value === status) >= steps.findIndex(s => s.value === step.value) ? 'stepCompleted' : 'stepInactive'}
                    />
                ))}
            </Stepper>
        </Box>
    );
}

export default function EnquiriesPage() {
    const { auth } = usePage<PageProps>().props;
    const queryClient = useQueryClient();

    // States for search and pagination
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // States for selected enquiry and modals
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [addNewModalOpened, setAddNewModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [actionModalOpened, { open: openActionModal, close: closeActionModal }] = useDisclosure(false);
    const [quotationModalOpened, setQuotationModalOpened] = useState(false);
    const [actionType, setActionType] = useState<'view' | 'edit' | 'create' | 'assign'>('view');

    // Fetch enquiries with search and pagination
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['enquiries', search, page],
        queryFn: async () => {
            const { data } = await axios.get('/sales/enquiries/data', {
                params: { search, page }
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
            const { data } = await axios.get('/data/clients/all');
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

    // Add this function to determine available actions
    const getAvailableActions = useCallback((enquiry: Enquiry) => {
        const actions = [];
        
        // View is always available
        actions.push({
            icon: <Eye size={16} />,
            label: 'View',
            color: 'blue',
            onClick: () => handleView(enquiry)
        });

        // Edit is available for draft and pending_review
        if (['draft', 'pending_review'].includes(enquiry.status)) {
            actions.push({
                icon: <Edit size={16} />,
                label: 'Edit',
                color: 'yellow',
                onClick: () => handleEdit(enquiry)
            });
        }

        // Assign is available for draft and pending_review
        if (['draft', 'pending_review'].includes(enquiry.status)) {
            actions.push({
                icon: <UserPlus size={16} />,
                label: 'Assign',
                color: 'green',
                onClick: () => handleAssign(enquiry)
            });
        }

        // Prepare Quotation is available for approved status
        if (enquiry.status === 'approved') {
            actions.push({
                icon: <FileText size={16} />,
                label: 'Prepare Quotation',
                color: 'violet',
                onClick: () => handlePrepareQuotation(enquiry)
            });
        }

        // Delete is only available for draft
        if (enquiry.status === 'draft') {
            actions.push({
                icon: <Trash2 size={16} />,
                label: 'Delete',
                color: 'red',
                onClick: () => handleDelete(enquiry)
            });
        }

        return actions;
    }, [handleView, handleEdit, handleAssign, handlePrepareQuotation, handleDelete]);

    // Create table columns with simplified view
    const columns = useMemo(() => [
        {
            accessor: 'enquiry_no',
            title: 'Enquiry No',
            width: 120,
        },
        {
            accessor: 'client.name',
            title: 'Client',
            width: 200,
        },
        {
            accessor: 'subject',
            title: 'Subject',
            width: 250,
        },
        {
            accessor: 'type',
            title: 'Type',
            width: 120,
            render: (enquiry: Enquiry) => (
                <Badge color="blue" variant="light">
                    {ENQUIRY_TYPE_LABELS[enquiry.type]}
                </Badge>
            ),
        },
        {
            accessor: 'priority',
            title: 'Priority',
            width: 120,
            render: (enquiry: Enquiry) => (
                <Badge color={ENQUIRY_PRIORITY_COLORS[enquiry.priority]} variant="light">
                    {enquiry.priority}
                </Badge>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            width: 150,
            render: (enquiry: Enquiry) => (
                <Badge color={ENQUIRY_STATUS_COLORS[enquiry.status]} variant="light">
                    {enquiry.status.replace('_', ' ')}
                </Badge>
            ),
        },
        {
            accessor: 'enquiry_date',
            title: 'Date',
            width: 120,
            render: (enquiry: Enquiry) => new Date(enquiry.enquiry_date).toLocaleDateString(),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            render: (enquiry: Enquiry) => (
                <Group gap={4} justify="flex-end">
                    {getAvailableActions(enquiry).map((action, index) => (
                        <Tooltip key={index} label={action.label}>
                            <ActionIcon
                                variant="light"
                                color={action.color}
                                onClick={action.onClick}
                            >
                                {action.icon}
                            </ActionIcon>
                        </Tooltip>
                    ))}
                </Group>
            ),
        },
    ], [getAvailableActions]);

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

                {/* Modals */}
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

                <Modal
                    opened={actionModalOpened}
                    onClose={closeActionModal}
                    title={
                        actionType === 'view' ? 'View Enquiry' :
                            actionType === 'assign' ? 'Assign Enquiry' : ''
                    }
                    size="xl"
                >
                    {selectedEnquiry && actionType === 'view' && (
                        <Stack>
                            <EnquiryWorkflow status={selectedEnquiry.status} />
                            <EnquiryActionModal
                                action={actionType}
                                enquiry={selectedEnquiry}
                                onClose={closeActionModal}
                                onAssign={handleAssignSubmit}
                                users={users}
                            />
                        </Stack>
                    )}
                    {actionType === 'assign' && (
                        <EnquiryActionModal
                            action={actionType}
                            enquiry={selectedEnquiry}
                            onClose={closeActionModal}
                            onAssign={handleAssignSubmit}
                            users={users}
                        />
                    )}
                </Modal>

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
                                status: 'quoted'
                            });
                            setQuotationModalOpened(false);
                        }}
                    />
                )}
            </Container>
        </AppLayout>
    );
}
