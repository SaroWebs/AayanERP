import { Badge, Group, Text, ActionIcon, Menu, Stack, Tooltip } from '@mantine/core';
import { MoreHorizontal, Eye, Edit, Send, Check, X, FileText, Ban, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format, isBefore } from 'date-fns';
import { Quotation, QuotationAction } from '@/types/sales';

export const getStatusColor = (status: Quotation['status']): string => {
    const colors: Record<Quotation['status'], string> = {
        draft: 'gray',
        pending_review: 'yellow',
        pending_approval: 'orange',
        approved: 'blue',
        sent: 'cyan',
        accepted: 'green',
        rejected: 'red',
        expired: 'gray',
        converted: 'violet',
        cancelled: 'red'
    };
    return colors[status];
};

export const getApprovalStatusColor = (status: Quotation['approval_status']): string => {
    const colors: Record<Quotation['approval_status'], string> = {
        pending: 'yellow',
        approved: 'green',
        rejected: 'red',
        not_required: 'gray'
    };
    return colors[status];
};

const isQuotationExpired = (validUntil: string | null): boolean => {
    if (!validUntil) return false;
    return isBefore(new Date(validUntil), new Date());
};

const formatStatusText = (status: string): string => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
};

export const columns = (handleAction: (quotation: Quotation, action: QuotationAction) => void) => [
    {
        accessor: 'quotation_no',
        title: 'Quotation No',
        width: 150,
        render: (quotation: Quotation) => (
            <Group gap="xs">
                <Text fw={500}>{quotation.quotation_no}</Text>
                {quotation.enquiry && (
                    <Tooltip label="From Enquiry">
                        <Badge size="sm" variant="light" color="blue">
                            {quotation.enquiry.enquiry_no}
                        </Badge>
                    </Tooltip>
                )}
            </Group>
        ),
    },
    {
        accessor: 'client',
        title: 'Client',
        width: 200,
        render: (quotation: Quotation) => (
            <Stack gap={4}>
                <Text fw={500}>{quotation.client?.name || 'N/A'}</Text>
                {quotation.contact_person && (
                    <Group gap={4}>
                        <User size={14} />
                        <Text size="sm" c="dimmed">{quotation.contact_person.name}</Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'status',
        title: 'Status',
        width: 120,
        render: (quotation: Quotation) => (
            <Stack gap={4}>
                <Badge color={getStatusColor(quotation.status)}>
                    {formatStatusText(quotation.status)}
                </Badge>
                {quotation.status === 'sent' && isQuotationExpired(quotation.valid_until) && (
                    <Badge color="red" variant="light" size="sm">Expired</Badge>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'approval_status',
        title: 'Approval',
        width: 120,
        render: (quotation: Quotation) => (
            <Stack gap={4}>
                <Badge color={getApprovalStatusColor(quotation.approval_status)}>
                    {formatStatusText(quotation.approval_status)}
                </Badge>
                {quotation.approver && (
                    <Group gap={4}>
                        <User size={14} />
                        <Text size="sm" c="dimmed">{quotation.approver.name}</Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'financial',
        title: 'Financial',
        width: 200,
        render: (quotation: Quotation) => (
            <Stack gap={4}>
                <Group gap={4}>
                    <DollarSign size={14} />
                    <Text fw={500}>
                        {quotation.currency} {formatCurrency(quotation.total_amount)}
                    </Text>
                </Group>
                {(quotation.discount_amount ?? 0) > 0 && (
                    <Text size="sm" c="dimmed">
                        Discount: {quotation.currency} {formatCurrency(quotation.discount_amount ?? 0)}
                    </Text>
                )}
                {quotation.tax_amount > 0 && (
                    <Text size="sm" c="dimmed">
                        Tax: {quotation.currency} {formatCurrency(quotation.tax_amount)}
                    </Text>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'dates',
        title: 'Dates',
        width: 200,
        render: (quotation: Quotation) => (
            <Stack gap={4}>
                <Group gap={4}>
                    <Calendar size={14} />
                    <Text size="sm">Quotation: {format(new Date(quotation.quotation_date), 'dd/MM/yyyy')}</Text>
                </Group>
                {quotation.valid_until && (
                    <Group gap={4}>
                        <Clock size={14} />
                        <Text size="sm">Valid until: {format(new Date(quotation.valid_until), 'dd/MM/yyyy')}</Text>
                    </Group>
                )}
            </Stack>
        ),
    },
    {
        accessor: 'actions',
        title: 'Actions',
        render: (quotation: Quotation) => {
            const canEdit = ['draft', 'pending_review'].includes(quotation.status);
            const canSubmit = quotation.status === 'draft';
            const canApprove = quotation.status === 'pending_approval' && quotation.approval_status === 'pending';
            const canReject = quotation.status === 'pending_approval' && quotation.approval_status === 'pending';
            const canConvert = quotation.status === 'approved';
            const canCancel = ['draft', 'pending_review', 'pending_approval'].includes(quotation.status);

            return (
                <Group gap={4} justify="flex-end">
                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleAction(quotation, 'view')}
                    >
                        <Eye size={16} />
                    </ActionIcon>

                    {canEdit && (
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleAction(quotation, 'edit')}
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
                                    onClick={() => handleAction(quotation, 'submit')}
                                >
                                    Submit for Review
                                </Menu.Item>
                            )}
                            {canApprove && (
                                <Menu.Item
                                    leftSection={<Check size={16} />}
                                    onClick={() => handleAction(quotation, 'approve')}
                                >
                                    Approve
                                </Menu.Item>
                            )}
                            {canReject && (
                                <Menu.Item
                                    leftSection={<X size={16} />}
                                    onClick={() => handleAction(quotation, 'reject')}
                                >
                                    Reject
                                </Menu.Item>
                            )}
                            {canConvert && (
                                <Menu.Item
                                    leftSection={<FileText size={16} />}
                                    onClick={() => handleAction(quotation, 'convert')}
                                >
                                    Convert to Order
                                </Menu.Item>
                            )}
                            {canCancel && (
                                <Menu.Item
                                    leftSection={<Ban size={16} />}
                                    onClick={() => handleAction(quotation, 'cancel')}
                                    color="red"
                                >
                                    Cancel
                                </Menu.Item>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            );
        },
    },
]; 