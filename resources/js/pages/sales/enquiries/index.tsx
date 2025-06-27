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
import { ArrowRight, Check, ChevronsRight, Circle, Plus, RefreshCw, Search, Star, Target, Zap } from 'lucide-react';
import { DataTable } from 'mantine-datatable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { Enquiry } from './types';
import { EnquiryActionModal } from './EnquiryActionModal';
import { modals } from '@mantine/modals';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { AddNew } from './partials/AddNew';
import { EditItem } from './partials/EditItem';
import { createColumns } from './columns';
import { PrepareQuotationModal } from './PrepareQuotationModal';

// Design Variation 5: Glassmorphism Style
function GlassmorphismStepper({ steps, currentStep }: { steps: { label: string; value: string }[]; currentStep: number }) {
    return (
        <div className="flex items-center justify-center gap-0 p-6 bg-transparent">
            {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                    <div key={step.value} className="flex items-center gap-0">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${isActive
                                    ? 'bg-white/30 border-white/50 shadow-lg shadow-purple-500/20'
                                    : isCompleted
                                        ? 'bg-emerald-500/20 border-emerald-400/50'
                                        : 'bg-white/10 border-white/20'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="text-emerald-400" size={20} />
                                ) : isActive ? (
                                    <Target className="text-purple-600" size={20} />
                                ) : (
                                    <span className="text-gray-600 font-bold">{idx + 1}</span>
                                )}
                            </div>
                            <span
                                className={`text-xs font-medium transition-colors ${isActive ? 'text-purple-700' : isCompleted ? 'text-emerald-600' : 'text-gray-600'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="w-12 h-px bg-gradient-to-r from-purple-300/50 to-pink-300/50 mx-2" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}


function EnquiryWorkflow({ status }: { status: Enquiry['status'] }) {
    const steps = [
        { label: 'Under Review', value: 'under_review' },
        { label: 'Pending Approve', value: 'pending_approval' },
        { label: 'Approved', value: 'approved' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Converted', value: 'converted' }
    ];

    // Map status to step index
    let currentStep = steps.findIndex(step => step.value === status);
    if (currentStep === -1) {
        // If status is before 'under_review', highlight the first step
        if (status === 'draft' || status === 'pending_review') currentStep = 0;
        else currentStep = 0;
    }
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
            <GlassmorphismStepper steps={steps} currentStep={currentStep} />
        </Box>
    );
}

export default function EnquiriesPage() {
    const { auth } = usePage<PageProps>().props;
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [addNewModalOpened, setAddNewModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [actionModalOpened, { open: openActionModal, close: closeActionModal }] = useDisclosure(false);
    const [actionType, setActionType] = useState<'view' | 'edit' | 'create' | 'assign'>('view');
    const [quotationModalOpen, setQuotationModalOpen] = useState(false);
    const [quotationEnquiry, setQuotationEnquiry] = useState<Enquiry | null>(null);

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

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axios.get('/data/config/users');
            return data;
        }
    });

    const { data: clients = [] } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data } = await axios.get('/data/clients/all');
            return data;
        }
    });

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

    const statusMutation = useMutation({
        mutationFn: async ({ id, endpoint, remarks }: { id: number; endpoint: string; remarks?: string }) => {
            await axios.post(`/sales/enquiries/${id}/${endpoint}`, { approval_remarks: remarks });
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

    const handleStatusChange = useCallback((enquiry: Enquiry, status: Enquiry['status']) => {
        const endpointMapping: Partial<Record<Enquiry['status'], string>> = {
            pending_review: 'submit',
            under_review: 'pending_review',
            quoted: 'quoted',
            pending_approval: 'pending-approval',
            approved: 'approve',
            converted: 'convert',
            lost: 'reject',
            cancelled: 'cancel',
        };
        const endpoint = endpointMapping[status];

        if (!endpoint) {
            notifications.show({ title: 'Error', message: 'Invalid action.', color: 'red' });
            return;
        }

        modals.openConfirmModal({
            title: 'Confirm Action',
            children: (
                <Text size="sm">
                    Are you sure you want to {status.replace(/_/g, ' ')} enquiry {enquiry.enquiry_no}?
                </Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            confirmProps: { color: 'blue' },
            onConfirm: () => statusMutation.mutate({ id: enquiry.id, endpoint }),
        });
    }, [statusMutation]);

    const handleAssignSubmit = useCallback((userId: number) => {
        if (selectedEnquiry) {
            assignMutation.mutate({ id: selectedEnquiry.id, userId });
        }
    }, [selectedEnquiry, assignMutation]);

    const handlePrepareQuotation = useCallback((enquiry: Enquiry) => {
        setQuotationEnquiry(enquiry);
        setQuotationModalOpen(true);
    }, []);

    const columns = useMemo(() => createColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onAssign: handleAssign,
        onStatusChange: handleStatusChange,
        onApprove: (enquiry) => handleStatusChange(enquiry, 'approved'),
        onPrepareQuotation: handlePrepareQuotation,
        currentUserId: auth.user.id
    }), [handleView, handleEdit, handleDelete, handleAssign, handleStatusChange, handlePrepareQuotation, auth.user.id]);

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
                    size="100%"
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

                {quotationModalOpen && quotationEnquiry && (
                    <PrepareQuotationModal
                        opened={quotationModalOpen}
                        onClose={() => setQuotationModalOpen(false)}
                        enquiry={quotationEnquiry}
                        onSuccess={() => {
                            setQuotationModalOpen(false);
                            setQuotationEnquiry(null);
                            refetch();
                        }}
                    />
                )}
            </Container>
        </AppLayout>
    );
}
