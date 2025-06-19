import { Badge, Group, Text, ActionIcon, Menu, Stack, Tooltip } from '@mantine/core';
import { MoreHorizontal, Eye, Edit, Send, Check, X, FileText, Ban, Calendar, Clock, DollarSign, User, Truck, Building } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/utils/format';
import { format, isAfter, isBefore } from 'date-fns';
import { PurchaseOrder, PurchaseOrderAction } from '@/types/purchase';

export const getStatusColor = (status: PurchaseOrder['status']) => {
    const colors: Record<PurchaseOrder['status'], string> = {
        draft: 'gray',
        pending_approval: 'yellow',
        approved: 'blue',
        sent: 'cyan',
        acknowledged: 'indigo',
        partial_received: 'orange',
        received: 'green',
        cancelled: 'red',
        closed: 'dark'
    };
    return colors[status];
};

export const getApprovalStatusColor = (status: PurchaseOrder['approval_status']) => {
    const colors: Record<PurchaseOrder['approval_status'], string> = {
        pending: 'yellow',
        approved: 'green',
        rejected: 'red',
        not_required: 'gray'
    };
    return colors[status];
};

const isOrderOverdue = (expectedDeliveryDate: string) => {
    return isBefore(new Date(expectedDeliveryDate), new Date());
};

export const columns = (handleAction: (order: PurchaseOrder, action: PurchaseOrderAction) => void) => [
    {
        accessor: 'po_no',
        title: 'PO No',
        width: 150,
        render: (order: PurchaseOrder) => (
            <Group gap="xs">
                <Text fw={500}>{order.po_no}</Text>
                {order.purchase_intent && (
                    <Tooltip label="From Purchase Intent">
                        <Badge size="sm" variant="light" color="blue">
                            {order.purchase_intent.intent_no}
                        </Badge>
                    </Tooltip>
                )}
            </Group>
        ),
    },
    {
        accessor: 'vendor',
        title: 'Vendor',
        width: 200,
        render: (order: PurchaseOrder) => (
            <Stack gap={4}>
                <Text fw={500}>{order.vendor?.name || 'N/A'}</Text>
                {order.vendor && (
                    <Group gap={4}>
                        <Text size="sm" c="dimmed">{order.vendor.contact_no}</Text>
                        <Text size="sm" c="dimmed">•</Text>
                        <Text size="sm" c="dimmed">{order.vendor.email}</Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'department',
        title: 'Department',
        width: 120,
        render: (order: PurchaseOrder) => (
            <Group gap={4}>
                <Building size={14} />
                <Text size="sm">{order.department?.name || 'N/A'}</Text>
            </Group>
        ),
    },
    {
        accessor: 'status',
        title: 'Status',
        width: 120,
        render: (order: PurchaseOrder) => (
            <Stack gap={4}>
                <Badge color={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ').charAt(0).toUpperCase() +
                        order.status.replace('_', ' ').slice(1)}
                </Badge>
                {order.status === 'approved' && isOrderOverdue(order.expected_delivery_date) && (
                    <Badge color="red" variant="light" size="sm">Overdue</Badge>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'approval_status',
        title: 'Approval',
        width: 120,
        render: (order: PurchaseOrder) => (
            <Stack gap={4}>
                <Badge color={getApprovalStatusColor(order.approval_status)}>
                    {order.approval_status.replace('_', ' ').charAt(0).toUpperCase() +
                        order.approval_status.replace('_', ' ').slice(1)}
                </Badge>
                {order.approved_by && (
                    <Group gap={4}>
                        <User size={14} />
                        <Text size="sm" c="dimmed">{order.approved_by.name}</Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'financial',
        title: 'Financial',
        width: 200,
        render: (order: PurchaseOrder) => (
            <Stack gap={4}>
                <Group gap={4}>
                    <DollarSign size={14} />
                    <Text fw={500}>
                        {order.currency} {formatCurrency(order.grand_total)}
                    </Text>
                </Group>
                <Text size="sm" c="dimmed">
                    Base: {order.currency} {formatCurrency(order.total_amount)}
                </Text>
                {order.tax_amount > 0 && (
                    <Text size="sm" c="dimmed">
                        Tax: {order.currency} {formatCurrency(order.tax_amount)}
                    </Text>
                )}
                {(order.freight_amount > 0 || order.insurance_amount > 0) && (
                    <Text size="sm" c="dimmed">
                        + Freight: {order.currency} {formatCurrency(order.freight_amount + order.insurance_amount)}
                    </Text>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'dates',
        title: 'Dates',
        width: 200,
        render: (order: PurchaseOrder) => (
            <Stack gap={4}>
                <Group gap={4}>
                    <Calendar size={14} />
                    <Text size="sm">PO: {format(new Date(order.po_date), 'dd/MM/yyyy')}</Text>
                </Group>
                <Group gap={4}>
                    <Truck size={14} />
                    <Text size="sm" c={isOrderOverdue(order.expected_delivery_date) ? 'red' : 'dimmed'}>
                        Expected: {format(new Date(order.expected_delivery_date), 'dd/MM/yyyy')}
                    </Text>
                </Group>
                {order.actual_delivery_date && (
                    <Group gap={4}>
                        <Clock size={14} />
                        <Text size="sm">Actual: {format(new Date(order.actual_delivery_date), 'dd/MM/yyyy')}</Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'actions',
        title: 'Actions',
        render: (order: PurchaseOrder) => {
            const canEdit = ['draft', 'pending_review'].includes(order.status);
            const canSubmit = order.status === 'draft';
            const canApprove = order.status === 'pending_approval' && order.approval_status === 'pending';
            const canReject = order.status === 'pending_approval' && order.approval_status === 'pending';
            const canCancel = ['draft', 'pending_review', 'pending_approval'].includes(order.status);

            return (
                <Group gap={4} justify="flex-end">
                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleAction(order, 'view')}
                    >
                        <Eye size={16} />
                    </ActionIcon>

                    {canEdit && (
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleAction(order, 'edit')}
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
                                    onClick={() => handleAction(order, 'submit')}
                                >
                                    Submit for Review
                                </Menu.Item>
                            )}
                            {canApprove && (
                                <Menu.Item
                                    leftSection={<Check size={16} />}
                                    onClick={() => handleAction(order, 'approve')}
                                    color="green"
                                >
                                    Approve
                                </Menu.Item>
                            )}
                            {canReject && (
                                <Menu.Item
                                    leftSection={<X size={16} />}
                                    onClick={() => handleAction(order, 'reject')}
                                    color="red"
                                >
                                    Reject
                                </Menu.Item>
                            )}
                            {canCancel && (
                                <Menu.Item
                                    leftSection={<Ban size={16} />}
                                    onClick={() => handleAction(order, 'cancel')}
                                    color="red"
                                >
                                    Cancel
                                </Menu.Item>
                            )}
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<FileText size={16} />}
                                component={Link}
                                href={route('purchases.orders.show', order.id)}
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