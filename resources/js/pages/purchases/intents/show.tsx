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
    ActionIcon,
    Tooltip,
    Divider,
    Box
} from '@mantine/core';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/format';
import { PurchaseIntent, Department, Vendor, Item, Equipment } from '@/types/purchase';
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
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        console.log("To load the data");

        setLoading(true);
        try {
            const [departmentsRes, vendorsRes, itemsRes, equipmentRes] = await Promise.all([
                axios.get('/purchases/data/departments/all'),
                axios.get('/purchases/data/vendors/all'),
                axios.get('/purchases/data/items/all'),
                axios.get('/purchases/data/equipment/all'),
            ]);

            setDepartments(departmentsRes.data || []);
            setVendors(vendorsRes.data || []);
            setItems(itemsRes.data || []);
            setEquipment(equipmentRes.data || []);

        } catch (error) {
            console.error('Failed to load data:', error);
            notifications.show({ message: 'Failed to load data', color: 'red' });
            // Set empty arrays to prevent further loading attempts
            setDepartments([]);
            setVendors([]);
            setItems([]);
            setEquipment([]);
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
            not_required: 'gray'
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

    const getTypeColor = (type: PurchaseIntent['type']) => {
        const colors: Record<PurchaseIntent['type'], string> = {
            equipment: 'blue',
            scaffolding: 'green',
            spares: 'orange',
            consumables: 'purple',
            other: 'gray'
        };
        return colors[type] || 'gray'; // Fallback to gray if type is undefined
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

    // Handle case where intent is not available
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
                <Container size="lg" py="xl">
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
                                <Title order={2}>{intent.intent_no}</Title>
                            </Group>
                            <Group>
                                <Badge color={getStatusColor(intent.status)} size="lg">
                                    {intent.status?.replace('_', ' ').charAt(0).toUpperCase() +
                                        intent.status?.replace('_', ' ').slice(1)}
                                </Badge>
                                <Badge color={getApprovalStatusColor(intent.approval_status)}>
                                    {intent.approval_status?.replace('_', ' ').charAt(0).toUpperCase() +
                                        intent.approval_status?.replace('_', ' ').slice(1)}
                                </Badge>
                            </Group>
                        </Group>

                        <Grid>
                            <Grid.Col span={8}>
                                <Text size="xl" fw={600} mb="xs">{intent.subject}</Text>
                                {intent.description && (
                                    <Text c="dimmed" mb="md">{intent.description}</Text>
                                )}
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Stack gap="xs">
                                    <Group gap="xs">
                                        <Badge color={getTypeColor(intent.type)}>
                                            {intent.type?.charAt(0).toUpperCase() + intent.type?.slice(1)}
                                        </Badge>
                                        <Badge color={getPriorityColor(intent.priority)}>
                                            {intent.priority?.charAt(0).toUpperCase() + intent.priority?.slice(1)}
                                        </Badge>
                                    </Group>
                                    {intent.priority === 'urgent' && (
                                        <Group gap="xs">
                                            <AlertTriangle size={14} color="red" />
                                            <Text size="sm" c="red" fw={500}>Urgent Priority</Text>
                                        </Group>
                                    )}
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    <Grid>
                        {/* Main Content */}
                        <Grid.Col span={8}>
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

                                {/* Approval Remarks */}
                                {intent.approval_remarks && (
                                    <Paper p="md" withBorder>
                                        <Title order={4} mb="md">Approval Remarks</Title>
                                        <Text>{intent.approval_remarks}</Text>
                                    </Paper>
                                )}
                            </Stack>
                        </Grid.Col>
                        {/* Sidebar Actions */}
                        <Grid.Col span={4}>
                            <Stack gap="md">
                            <Button onClick={()=>setConvertModalOpened(true)}>Open PO (DEV)</Button>
                                {/* Actions */}
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
                        </Grid.Col>
                    </Grid>

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
                        equipment={equipment}
                    />
                </Container>
            </AppLayout>
        );
    }
} 
