import { Head, router } from '@inertiajs/react';
import {
    Paper,
    Title,
    Button,
    Group,
    Stack,
    Grid,
    Badge,
    Text,
    Container,
    Divider,
    Box
} from '@mantine/core';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/format';
import { PurchaseIntent, Department, Vendor, Item } from '@/types/purchase';
import {
    Calendar,
    Clock,
    DollarSign,
    Building,
    User,
    FileText,
    AlertTriangle,
    Edit,
    ArrowLeft,
    CheckCircle,
    XCircle,
    FileDown,
    RefreshCw,
    ShoppingCart
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { useState, useEffect } from 'react';
import { EditItem } from './partials/EditItem';
import axios from 'axios';
import ConvertPO from './partials/ConvertPO';

interface Props extends PageProps {
    intent: PurchaseIntent;
}

export default function Show({ intent }: Props) {
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [convertModalOpened, setConvertModalOpened] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        console.log("To load the data");

        setLoading(true);
        try {
            const [departmentsRes, vendorsRes, itemsRes] = await Promise.all([
                axios.get('/purchases/data/departments/all'),
                axios.get('/purchases/data/vendors/all'),
                axios.get('/purchases/data/items/all'),
            ]);

            setDepartments(departmentsRes.data || []);
            setVendors(vendorsRes.data || []);
            setItems(itemsRes.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            notifications.show({ message: 'Failed to load data', color: 'red' });
            // Set empty arrays to prevent further loading attempts
            setDepartments([]);
            setVendors([]);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: PurchaseIntent['status']) => {
        const colors: Record<PurchaseIntent['status'], string> = {
            draft: 'gray',
            pending_review: 'yellow',
            pending_approval: 'orange',
            approved: 'blue',
            converted: 'green',
            rejected: 'red',
            cancelled: 'red'
        };
        return colors[status] || 'gray'; // Fallback to gray if status is undefined
    };

    const getApprovalStatusColor = (status: PurchaseIntent['approval_status']) => {
        const colors: Record<PurchaseIntent['approval_status'], string> = {
            pending: 'yellow',
            approved: 'green',
            rejected: 'red',
            not_required: 'blue'
        };
        return colors[status] || 'gray'; // Fallback to gray if status is undefined
    };

    const getPriorityColor = (priority: PurchaseIntent['priority']) => {
        const colors: Record<PurchaseIntent['priority'], string> = {
            low: 'gray',
            medium: 'blue',
            high: 'orange',
            urgent: 'red'
        };
        return colors[priority] || 'gray'; // Fallback to gray if priority is undefined
    };

    const handleAction = (action: string) => {
        switch (action) {
            case 'edit':
                setEditModalOpened(true);
                break;
            case 'submit':
                router.post(route('purchases.intents.submit', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent submitted for review', color: 'green' })
                });
                break;
            case 'approve':
                router.post(route('purchases.intents.approve', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent approved', color: 'green' })
                });
                break;
            case 'reject':
                router.post(route('purchases.intents.reject', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent rejected', color: 'red' })
                });
                break;
            case 'convert':
                if (loading) {
                    notifications.show({ message: 'Please wait while data is loading', color: 'yellow' });
                    return;
                }
                setConvertModalOpened(true);
                break;
            case 'cancel':
                router.post(route('purchases.intents.cancel', intent.id), {}, {
                    onSuccess: () => notifications.show({ message: 'Intent cancelled', color: 'red' })
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
            title: 'Purchase Intents',
            href: '/purchases/intents',
        },
        {
            title: intent.intent_no,
            href: `/purchases/intents/${intent.id}`,
        },
    ];

    if (!intent) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Purchase Intent Not Found" />
                <Container size="lg" py="xl">
                    <Paper p="md" withBorder>
                        <Title order={2} c="red">Purchase Intent Not Found</Title>
                        <Text mt="md">The requested purchase intent could not be found.</Text>
                    </Paper>
                </Container>
            </AppLayout>
        );
    } else {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Purchase Intent - ${intent.intent_no}`} />
                <Box className='p-4'>
                    <Box className='p-4 w-full'>
                    <Paper p="md" withBorder mb="lg">
                        <Group justify="space-between" mb="md">
                            <Group>
                                <Button
                                    variant="light"
                                    leftSection={<ArrowLeft size={16} />}
                                    onClick={() => router.get(route('purchases.intents.index'))}
                                >
                                    Back to List
                                </Button>
                            </Group>
                            <Group>
                                <Stack gap={2}>
                                    <Group gap={4}>
                                        <Text size="xs" c="dimmed">Intent Status:</Text>
                                        <span className={`text-sm text-${getStatusColor(intent.status)}-600`}>
                                        {intent.status
                                                ? intent.status
                                                    .replace(/_/g, ' ')
                                                    .replace(/\b\w/g, l => l.toUpperCase())
                                                : 'Unknown'}
                                        </span>
                                    </Group>
                                    <Group gap={4}>
                                        <Text size="xs" c="dimmed">Approval Status:</Text>
                                        <span className={`text-sm text-${getApprovalStatusColor(intent.approval_status)}-600`}>
                                        {intent.approval_status === 'approved'
                                                ? 'Approved'
                                                : intent.approval_status === 'rejected'
                                                    ? 'Rejected'
                                                    : intent.approval_status === 'not_required'
                                                        ? 'Not Required'
                                                        : 'Pending'}
                                        </span>
                                    </Group>
                                </Stack>
                            </Group>
                        </Group>
                            {/* Meta Info Section */}
                            <Divider my="sm" />
                        <Grid>
                                <Grid.Col span={3}>
                                    <div className="flex flex-col">
                                        <Text size="xs" c="dimmed">#{intent.intent_no}</Text>
                                        <Text>
                                            {intent.subject}
                                        </Text>
                                    </div>
                                </Grid.Col>
                                <Grid.Col span={3}><Text size="xs" c="dimmed">Created At</Text><Text>{format(new Date(intent.created_at), 'dd/MM/yyyy HH:mm')}</Text></Grid.Col>
                                <Grid.Col span={3}><Text size="xs" c="dimmed">Updated At</Text><Text>{format(new Date(intent.updated_at), 'dd/MM/yyyy HH:mm')}</Text></Grid.Col>
                                {intent.deleted_at && (
                                    <Grid.Col span={3}><Text size="xs" c="red">Deleted At</Text><Text c="red">{format(new Date(intent.deleted_at), 'dd/MM/yyyy HH:mm')}</Text></Grid.Col>
                                )}
                        </Grid>
                    </Paper>

                        <div className="flex flex-col-reverse lg:flex-row gap-6">
                            <div className="flex-1 w-full">
                            <Stack gap="lg">
                                {/* Basic Details */}
                                <Paper p="md" withBorder>
                                    <Title order={4} mb="md">Basic Details</Title>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <Group gap="xs" mb="xs">
                                                <Building size={16} />
                                                <Text fw={500}>Department</Text>
                                            </Group>
                                            <Text c="dimmed">{intent.department?.name || 'Not assigned'}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Group gap="xs" mb="xs">
                                                <User size={16} />
                                                <Text fw={500}>Created By</Text>
                                            </Group>
                                            <Text c="dimmed">{intent.creator?.name || 'Unknown'}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Group gap="xs" mb="xs">
                                                <Calendar size={16} />
                                                <Text fw={500}>Intent Date</Text>
                                            </Group>
                                            <Text c="dimmed">{format(new Date(intent.intent_date), 'dd/MM/yyyy')}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Group gap="xs" mb="xs">
                                                <Clock size={16} />
                                                <Text fw={500}>Required Date</Text>
                                            </Group>
                                            <Text c="dimmed">
                                                {intent.required_date
                                                    ? format(new Date(intent.required_date), 'dd/MM/yyyy')
                                                    : 'Not specified'
                                                }
                                            </Text>
                                        </Grid.Col>
                                        {intent.converted_date && (
                                            <Grid.Col span={6}>
                                                <Group gap="xs" mb="xs">
                                                    <FileText size={16} />
                                                    <Text fw={500}>Converted Date</Text>
                                                </Group>
                                                <Text c="dimmed">{format(new Date(intent.converted_date), 'dd/MM/yyyy')}</Text>
                                            </Grid.Col>
                                        )}
                                        {intent.approver && (
                                            <Grid.Col span={6}>
                                                <Group gap="xs" mb="xs">
                                                    <User size={16} />
                                                    <Text fw={500}>Approved By</Text>
                                                </Group>
                                                <Text c="dimmed">{intent.approver.name}</Text>
                                            </Grid.Col>
                                        )}
                                    </Grid>
                                </Paper>

                                {/* Financial Details */}
                                <Paper p="md" withBorder>
                                    <Title order={4} mb="md">Financial Details</Title>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <Group gap="xs" mb="xs">
                                                <DollarSign size={16} />
                                                <Text fw={500}>Estimated Cost</Text>
                                            </Group>
                                            <Text c="dimmed">
                                                {intent.estimated_cost
                                                    ? `${intent.currency} ${formatCurrency(intent.estimated_cost)}`
                                                    : 'Not specified'
                                                }
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Group gap="xs" mb="xs">
                                                <Text fw={500}>Currency</Text>
                                            </Group>
                                            <Text c="dimmed">{intent.currency}</Text>
                                        </Grid.Col>
                                        {intent.budget_details && (
                                            <Grid.Col span={12}>
                                                <Group gap="xs" mb="xs">
                                                    <Text fw={500}>Budget Details</Text>
                                                </Group>
                                                <Text c="dimmed">{intent.budget_details}</Text>
                                            </Grid.Col>
                                        )}
                                    </Grid>
                                </Paper>

                                {/* Justification */}
                                {intent.justification && (
                                    <Paper p="md" withBorder>
                                        <Title order={4} mb="md">Justification</Title>
                                        <Text>{intent.justification}</Text>
                                    </Paper>
                                )}

                                {/* Specifications */}
                                {intent.specifications && (
                                    <Paper p="md" withBorder>
                                        <Title order={4} mb="md">Technical Specifications</Title>
                                        <Text>{intent.specifications}</Text>
                                    </Paper>
                                )}

                                {/* Terms and Conditions */}
                                {intent.terms_conditions && (
                                    <Paper p="md" withBorder>
                                        <Title order={4} mb="md">Terms and Conditions</Title>
                                        <Text>{intent.terms_conditions}</Text>
                                    </Paper>
                                )}

                                {/* Additional Notes */}
                                {intent.notes && (
                                    <Paper p="md" withBorder>
                                        <Title order={4} mb="md">Additional Notes</Title>
                                        <Text>{intent.notes}</Text>
                                    </Paper>
                                )}

                                    {/* Approval Details */}
                                    <Paper p="md" withBorder>
                                        <Title order={4} mb="md">Approval Details</Title>
                                        <Grid>
                                            <Grid.Col span={6}>
                                                <Group gap="xs" mb="xs">
                                                    <User size={16} />
                                                    <Text fw={500}>Approved By</Text>
                                                </Group>
                                                <Text c="dimmed">{intent.approver?.name || 'Not approved'}</Text>
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <Group gap="xs" mb="xs">
                                                    <Calendar size={16} />
                                                    <Text fw={500}>Approved At</Text>
                                                </Group>
                                                <Text c="dimmed">{intent.approved_at ? format(new Date(intent.approved_at), 'dd/MM/yyyy HH:mm') : 'Not approved'}</Text>
                                            </Grid.Col>
                                            {intent.approval_remarks && (
                                                <Grid.Col span={12}>
                                                    <Group gap="xs" mb="xs">
                                                        <Text fw={500}>Approval Remarks</Text>
                                                    </Group>
                                                    <Text c="dimmed">{intent.approval_remarks}</Text>
                                                </Grid.Col>
                                            )}
                                        </Grid>
                                    </Paper>
                            </Stack>
                            </div>
                            {intent.status != 'converted' ? 
                            <div className="w-full lg:w-1/3 mb-6 lg:mb-0">
                                <Stack gap="md">
                                    <Paper p="md" withBorder>
                                        <Title order={4} mb="md">Actions</Title>
                                        <Stack gap="xs">
                                            {intent.status === 'draft' && (
                                                <>
                                                    <Button
                                                        leftSection={<Edit size={16} />}
                                                        variant="outline"
                                                        fullWidth
                                                        onClick={() => handleAction('edit')}
                                                    >
                                                        Edit Intent
                                                    </Button>
                                                    <Button
                                                        leftSection={<RefreshCw size={16} />}
                                                        variant="outline"
                                                        fullWidth
                                                        onClick={() => handleAction('submit')}
                                                    >
                                                        Submit for Review
                                                    </Button>
                                                </>
                                            )}

                                            {intent.approval_status === 'pending' && (
                                                <>
                                                    <Button
                                                        leftSection={<CheckCircle size={16} />}
                                                        color="green"
                                                        fullWidth
                                                        onClick={() => handleAction('approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        leftSection={<XCircle size={16} />}
                                                        color="red"
                                                        variant="outline"
                                                        fullWidth
                                                        onClick={() => handleAction('reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                            {intent.status === 'approved' && (
                                                <Button
                                                    leftSection={<ShoppingCart size={16} />}
                                                    color="blue"
                                                    fullWidth
                                                    onClick={() => handleAction('convert')}
                                                >
                                                    Convert to PO
                                                </Button>
                                            )}

                                            {['draft', 'pending_review', 'pending_approval'].includes(intent.status || '') && (
                                                <Button
                                                    leftSection={<XCircle size={16} />}
                                                    color="red"
                                                    variant="outline"
                                                    fullWidth
                                                    onClick={() => handleAction('cancel')}
                                                >
                                                    Cancel Intent
                                                </Button>
                                            )}

                                            {/* Debug info - remove this after fixing */}
                                            {!intent.status && (
                                                <Text size="sm" c="red">
                                                    Status is undefined - Check console for debug info
                                                </Text>
                                            )}
                                        </Stack>
                                    </Paper>

                                    {/* Documents */}
                                    {(intent.document_path || intent.specification_document_path) && (
                                        <Paper p="md" withBorder>
                                            <Title order={4} mb="md">Documents</Title>
                                            <Stack gap="xs">
                                                {intent.document_path && (
                                                    <Button
                                                        leftSection={<FileDown size={16} />}
                                                        variant="outline"
                                                        fullWidth
                                                        component="a"
                                                        href={`/storage/${intent.document_path}`}
                                                        target="_blank"
                                                    >
                                                        Download Document
                                                    </Button>
                                                )}
                                                {intent.specification_document_path && (
                                                    <Button
                                                        leftSection={<FileDown size={16} />}
                                                        variant="outline"
                                                        fullWidth
                                                        component="a"
                                                        href={`/storage/${intent.specification_document_path}`}
                                                        target="_blank"
                                                    >
                                                        Download Specifications
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Paper>
                                    )}
                                </Stack>
                            </div>
                            :null}
                        </div>

                    <EditItem
                        opened={editModalOpened}
                        onClose={() => setEditModalOpened(false)}
                        intent={intent}
                        departments={departments}
                        loading={loading}
                    />

                    <ConvertPO
                        opened={convertModalOpened}
                        onClose={() => setConvertModalOpened(false)}
                        intent={intent}
                        departments={departments}
                        vendors={vendors}
                        items={items}
                    />
                    </Box>
                </Box>
            </AppLayout>
        );
    }
} 
