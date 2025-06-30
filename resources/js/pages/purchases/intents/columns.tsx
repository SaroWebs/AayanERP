import { Badge, Group, Text, ActionIcon, Menu, Stack, Tooltip } from '@mantine/core';
import { MoreHorizontal, Eye, Edit, Send, Check, X, FileText, Ban, Calendar, Clock, DollarSign, User, Building, AlertTriangle } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
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
            <Text fw={500} lineClamp={2}>{intent.subject}</Text>
        ),
    },
    {
        accessor: 'status',
        title: 'Status',
        width: 120,
        render: (intent: PurchaseIntent) => (
            <Badge color={getStatusColor(intent.status)}>
                {intent.status.replace('_', ' ').charAt(0).toUpperCase() +
                    intent.status.replace('_', ' ').slice(1)}
            </Badge>
        ),
    },
    {
        accessor: 'approval_status',
        title: 'Approval Status',
        width: 120,
        render: (intent: PurchaseIntent) => (
            <Badge color={getApprovalStatusColor(intent.approval_status)}>
                {intent.approval_status.replace('_', ' ').charAt(0).toUpperCase() +
                    intent.approval_status.replace('_', ' ').slice(1)}
            </Badge>
        ),
    },
    {
        accessor: 'priority',
        title: 'Priority',
        width: 100,
        render: (intent: PurchaseIntent) => (
            <Badge color={getPriorityColor(intent.priority)}>
                {intent.priority.charAt(0).toUpperCase() + intent.priority.slice(1)}
            </Badge>
        ),
    },
    {
        accessor: 'dates',
        title: 'Dates',
        width: 180,
        render: (intent: PurchaseIntent) => (
            <Stack gap={2}>
                <Text size="sm">Intent: {format(new Date(intent.intent_date), 'dd/MM/yyyy')}</Text>
                {intent.required_date && (
                    <Text size="sm" c="dimmed">Required: {format(new Date(intent.required_date), 'dd/MM/yyyy')}</Text>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'actions',
        title: 'Actions',
        render: (intent: PurchaseIntent) => (
            <Group gap={4} justify="flex-end">
                <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => router.get(route('purchases.intents.show', intent.id))}
                >
                    <Eye size={16} />
                </ActionIcon>
                <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleAction(intent, 'edit')}
                >
                    <Edit size={16} />
                </ActionIcon>
            </Group>
        ),
    },
]; 