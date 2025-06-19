import { Badge, Group, Text, ActionIcon, Menu, Stack, Tooltip } from '@mantine/core';
import { MoreHorizontal, Eye, Edit, Send, Check, X, FileText, Ban, Calendar, Clock, DollarSign, User, Building, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/utils/format';
import { format, isAfter, isBefore } from 'date-fns';
import { PurchaseIntent } from '@/types/purchase';

export const getStatusColor = (status: PurchaseIntent['status']) => {
    const colors: Record<PurchaseIntent['status'], string> = {
        draft: 'gray',
        pending_review: 'yellow',
        pending_approval: 'orange',
        approved: 'blue',
        converted: 'green',
        rejected: 'red',
        cancelled: 'red'
    };
    return colors[status];
};

export const getApprovalStatusColor = (status: PurchaseIntent['approval_status']) => {
    const colors: Record<PurchaseIntent['approval_status'], string> = {
        pending: 'yellow',
        approved: 'green',
        rejected: 'red',
        not_required: 'gray'
    };
    return colors[status];
};

export const getPriorityColor = (priority: PurchaseIntent['priority']) => {
    const colors: Record<PurchaseIntent['priority'], string> = {
        low: 'gray',
        medium: 'blue',
        high: 'orange',
        urgent: 'red'
    };
    return colors[priority];
};

export const getTypeColor = (type: PurchaseIntent['type']) => {
    const colors: Record<PurchaseIntent['type'], string> = {
        equipment: 'blue',
        scaffolding: 'green',
        spares: 'orange',
        consumables: 'purple',
        other: 'gray'
    };
    return colors[type];
};

const isIntentOverdue = (requiredDate: string | null) => {
    if (!requiredDate) return false;
    return isBefore(new Date(requiredDate), new Date());
};

export const columns = (handleAction: (intent: PurchaseIntent, action: string) => void) => [
    {
        accessor: 'intent_no',
        title: 'Intent No',
        width: 150,
        render: (intent: PurchaseIntent) => (
            <Text fw={500}>{intent.intent_no}</Text>
        ),
    },
    {
        accessor: 'subject',
        title: 'Subject',
        width: 200,
        render: (intent: PurchaseIntent) => (
            <Stack gap={4}>
                <Text fw={500} lineClamp={2}>{intent.subject}</Text>
                {intent.description && (
                    <Text size="sm" c="dimmed" lineClamp={1}>{intent.description}</Text>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'department',
        title: 'Department',
        width: 120,
        render: (intent: PurchaseIntent) => (
            <Group gap={4}>
                <Building size={14} />
                <Text size="sm">{intent.department?.name || 'N/A'}</Text>
            </Group>
        ),
    },
    {
        accessor: 'type',
        title: 'Type',
        width: 120,
        render: (intent: PurchaseIntent) => (
            <Badge color={getTypeColor(intent.type)}>
                {intent.type.charAt(0).toUpperCase() + intent.type.slice(1)}
            </Badge>
        ),
    },
    {
        accessor: 'priority',
        title: 'Priority',
        width: 100,
        render: (intent: PurchaseIntent) => (
            <Stack gap={4}>
                <Badge color={getPriorityColor(intent.priority)}>
                    {intent.priority.charAt(0).toUpperCase() + intent.priority.slice(1)}
                </Badge>
                {intent.priority === 'urgent' && (
                    <AlertTriangle size={12} color="red" />
                )}
            </Stack>
        ),
    },
    {
        accessor: 'status',
        title: 'Status',
        width: 120,
        render: (intent: PurchaseIntent) => (
            <Stack gap={4}>
                <Badge color={getStatusColor(intent.status)}>
                    {intent.status.replace('_', ' ').charAt(0).toUpperCase() +
                        intent.status.replace('_', ' ').slice(1)}
                </Badge>
                {intent.status === 'approved' && intent.required_date && isIntentOverdue(intent.required_date) && (
                    <Badge color="red" variant="light" size="sm">Overdue</Badge>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'approval_status',
        title: 'Approval',
        width: 120,
        render: (intent: PurchaseIntent) => (
            <Stack gap={4}>
                <Badge color={getApprovalStatusColor(intent.approval_status)}>
                    {intent.approval_status.replace('_', ' ').charAt(0).toUpperCase() +
                        intent.approval_status.replace('_', ' ').slice(1)}
                </Badge>
                {intent.approved_by && (
                    <Group gap={4}>
                        <User size={14} />
                        <Text size="sm" c="dimmed">{intent.approved_by}
                            <span className='p-4 bg-rose-600 text-yellow-300 border border-black'>
                            ("----To be fixed **----")
                            </span>
                        </Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'financial',
        title: 'Financial',
        width: 150,
        render: (intent: PurchaseIntent) => (
            <Stack gap={4}>
                {intent.estimated_cost ? (
                    <Group gap={4}>
                        <DollarSign size={14} />
                        <Text fw={500}>
                            {intent.currency} {formatCurrency(intent.estimated_cost)}
                        </Text>
                    </Group>
                ) : (
                    <Text size="sm" c="dimmed">Not specified</Text>
                )}
                {intent.budget_details && (
                    <Text size="sm" c="dimmed" lineClamp={1}>{intent.budget_details}</Text>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'dates',
        title: 'Dates',
        width: 200,
        render: (intent: PurchaseIntent) => (
            <Stack gap={4}>
                <Group gap={4}>
                    <Calendar size={14} />
                    <Text size="sm">Intent: {format(new Date(intent.intent_date), 'dd/MM/yyyy')}</Text>
                </Group>
                {intent.required_date && (
                    <Group gap={4}>
                        <Clock size={14} />
                        <Text size="sm" c={isIntentOverdue(intent.required_date) ? 'red' : 'dimmed'}>
                            Required: {format(new Date(intent.required_date), 'dd/MM/yyyy')}
                        </Text>
                    </Group>
                )}
                {intent.converted_date && (
                    <Group gap={4}>
                        <FileText size={14} />
                        <Text size="sm">Converted: {format(new Date(intent.converted_date), 'dd/MM/yyyy')}</Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'actions',
        title: 'Actions',
        render: (intent: PurchaseIntent) => {
            const canEdit = ['draft', 'pending_review'].includes(intent.status);
            const canSubmit = intent.status === 'draft';
            const canApprove = intent.status === 'pending_approval' && intent.approval_status === 'pending';
            const canReject = intent.status === 'pending_approval' && intent.approval_status === 'pending';
            const canConvert = intent.status === 'approved';
            const canCancel = ['draft', 'pending_review', 'pending_approval'].includes(intent.status);

            return (
                <Group gap={4} justify="flex-end">
                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleAction(intent, 'view')}
                    >
                        <Eye size={16} />
                    </ActionIcon>

                    {canEdit && (
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleAction(intent, 'edit')}
                        >
                            <Edit size={16} />
                        </ActionIcon>
                    )}

                    <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <MoreHorizontal size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {canSubmit && (
                                <Menu.Item
                                    leftSection={<Send size={16} />}
                                    onClick={() => handleAction(intent, 'submit')}
                                >
                                    Submit for Review
                                </Menu.Item>
                            )}
                            {canApprove && (
                                <Menu.Item
                                    leftSection={<Check size={16} />}
                                    onClick={() => handleAction(intent, 'approve')}
                                    color="green"
                                >
                                    Approve
                                </Menu.Item>
                            )}
                            {canReject && (
                                <Menu.Item
                                    leftSection={<X size={16} />}
                                    onClick={() => handleAction(intent, 'reject')}
                                    color="red"
                                >
                                    Reject
                                </Menu.Item>
                            )}
                            {canConvert && (
                                <Menu.Item
                                    leftSection={<FileText size={16} />}
                                    onClick={() => handleAction(intent, 'convert')}
                                    color="blue"
                                >
                                    Convert to PO
                                </Menu.Item>
                            )}
                            {canCancel && (
                                <Menu.Item
                                    leftSection={<Ban size={16} />}
                                    onClick={() => handleAction(intent, 'cancel')}
                                    color="red"
                                >
                                    Cancel
                                </Menu.Item>
                            )}
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<FileText size={16} />}
                                component={Link}
                                href={route('purchases.intents.show', intent.id)}
                            >
                                View Details
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            );
        },
    },
]; 