import { DataTableColumn } from 'mantine-datatable';
import { Badge, ActionIcon, Menu } from '@mantine/core';
import { Eye, Edit, MoreHorizontal, Send, Check, X, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from '@inertiajs/react';

interface Quotation {
    id: number;
    quotation_no: string;
    client: {
        id: number;
        name: string;
    };
    status: string;
    approval_status: string;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
}

type QuotationAction = 'view' | 'edit' | 'submit' | 'approve' | 'reject' | 'convert' | 'cancel';

const statusColors: Record<string, { color: string; label: string }> = {
    draft: { color: 'gray', label: 'DRAFT' },
    pending_review: { color: 'yellow', label: 'PENDING REVIEW' },
    approved: { color: 'green', label: 'APPROVED' },
    rejected: { color: 'red', label: 'REJECTED' },
    cancelled: { color: 'gray', label: 'CANCELLED' },
};

const approvalStatusColors: Record<string, { color: string; label: string }> = {
    not_required: { color: 'gray', label: 'NOT REQUIRED' },
    pending: { color: 'yellow', label: 'PENDING' },
    approved: { color: 'green', label: 'APPROVED' },
    rejected: { color: 'red', label: 'REJECTED' },
};

export const columns = (
    handleAction: (quotation: Quotation, action: QuotationAction) => void
): DataTableColumn<Quotation>[] => [
    {
        accessor: 'quotation_no',
        title: 'Quotation No.',
    },
    {
        accessor: 'client.name',
        title: 'Client',
    },
    {
        accessor: 'status',
        title: 'Status',
        render: (quotation) => {
            const status = statusColors[quotation.status];
            return (
                <Badge color={status.color} variant="light">
                    {status.label}
                </Badge>
            );
        },
    },
    {
        accessor: 'approval_status',
        title: 'Approval Status',
        render: (quotation) => {
            const status = approvalStatusColors[quotation.approval_status];
            return (
                <Badge color={status.color} variant="light">
                    {status.label}
                </Badge>
            );
        },
    },
    {
        accessor: 'created_by.name',
        title: 'Created By',
    },
    {
        accessor: 'created_at',
        title: 'Created At',
        render: (quotation) => format(new Date(quotation.created_at), 'dd MMM yyyy HH:mm'),
    },
    {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        render: (quotation) => (
            <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                    <ActionIcon>
                        <MoreHorizontal size={16} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<Eye size={16} />}
                        component={Link}
                        href={route('sales.quotations.show', quotation.id)}
                    >
                        View Details
                    </Menu.Item>
                    {quotation.status === 'draft' && (
                        <>
                            <Menu.Item
                                leftSection={<Edit size={16} />}
                                component={Link}
                                href={route('sales.quotations.edit', quotation.id)}
                            >
                                Edit
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<Send size={16} />}
                                onClick={() => handleAction(quotation, 'submit')}
                            >
                                Submit for Review
                            </Menu.Item>
                        </>
                    )}
                    {quotation.approval_status === 'pending' && (
                        <>
                            <Menu.Item
                                leftSection={<Check size={16} />}
                                onClick={() => handleAction(quotation, 'approve')}
                                c="green"
                            >
                                Approve
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<X size={16} />}
                                onClick={() => handleAction(quotation, 'reject')}
                                c="red"
                            >
                                Reject
                            </Menu.Item>
                        </>
                    )}
                    {quotation.status === 'approved' && (
                        <Menu.Item
                            leftSection={<FileText size={16} />}
                            onClick={() => handleAction(quotation, 'convert')}
                        >
                            Convert to Sales Order
                        </Menu.Item>
                    )}
                    {['draft', 'pending_review'].includes(quotation.status) && (
                        <Menu.Item
                            leftSection={<Trash2 size={16} />}
                            onClick={() => handleAction(quotation, 'cancel')}
                            c="red"
                        >
                            Cancel
                        </Menu.Item>
                    )}
                </Menu.Dropdown>
            </Menu>
        ),
    },
]; 