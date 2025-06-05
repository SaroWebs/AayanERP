import { DataTableColumn } from 'mantine-datatable';
import { Badge, ActionIcon, Menu } from '@mantine/core';
import { Eye, Edit, MoreHorizontal, Send, Check, X, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Enquiry, EnquiryAction, statusColors, approvalStatusColors } from './types';
export const columns = (
    handleAction: (enquiry: Enquiry, action: EnquiryAction) => void
): DataTableColumn<Enquiry>[] => [
    {
        accessor: 'enquiry_no',
        title: 'Enquiry No.',
    },
    {
        accessor: 'client.name',
        title: 'Client',
    },
    {
        accessor: 'status',
        title: 'Status',
        render: (enquiry) => {
            const status = statusColors[enquiry.status];
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
        render: (enquiry) => {
            const status = approvalStatusColors[enquiry.approval_status];
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
        render: (enquiry) => format(new Date(enquiry.created_at), 'dd MMM yyyy HH:mm'),
    },
    {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        render: (enquiry) => (
            <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                    <ActionIcon>
                        <MoreHorizontal size={16} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<Eye size={16} />}
                        onClick={() => handleAction(enquiry, 'view')}
                    >
                        View Details
                    </Menu.Item>
                    {enquiry.status === 'draft' && (
                        <>
                            <Menu.Item
                                leftSection={<Edit size={16} />}
                                onClick={() => handleAction(enquiry, 'edit')}
                            >
                                Edit
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<Send size={16} />}
                                onClick={() => handleAction(enquiry, 'submit')}
                            >
                                Submit for Review
                            </Menu.Item>
                        </>
                    )}
                    {enquiry.approval_status === 'pending' && (
                        <>
                            <Menu.Item
                                leftSection={<Check size={16} />}
                                onClick={() => handleAction(enquiry, 'approve')}
                                c="green"
                            >
                                Approve
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<X size={16} />}
                                onClick={() => handleAction(enquiry, 'reject')}
                                c="red"
                            >
                                Reject
                            </Menu.Item>
                        </>
                    )}
                    {enquiry.status === 'approved' && (
                        <Menu.Item
                            leftSection={<FileText size={16} />}
                            onClick={() => handleAction(enquiry, 'convert')}
                        >
                            Convert to Quotation
                        </Menu.Item>
                    )}
                    {['draft', 'pending_review'].includes(enquiry.status) && (
                        <Menu.Item
                            leftSection={<Trash2 size={16} />}
                            onClick={() => handleAction(enquiry, 'cancel')}
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