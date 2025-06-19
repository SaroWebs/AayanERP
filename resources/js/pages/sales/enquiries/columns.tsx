import { Badge, Group, Text, ActionIcon, Menu, Tooltip, Stack } from '@mantine/core';
import { Eye, Edit, Trash, UserPlus, CheckCircle, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { Enquiry, ENQUIRY_STATUS_COLORS, ENQUIRY_PRIORITY_COLORS, ENQUIRY_TYPE_LABELS, NATURE_OF_WORK_LABELS } from './types';
import type { DataTableColumn } from 'mantine-datatable';
import { useState } from 'react';
import { PrepareQuotationModal } from './PrepareQuotationModal';

interface ColumnProps {
    onView: (enquiry: Enquiry) => void;
    onEdit: (enquiry: Enquiry) => void;
    onDelete: (enquiry: Enquiry) => void;
    onAssign: (enquiry: Enquiry) => void;
    onStatusChange: (enquiry: Enquiry, status: Enquiry['status']) => void;
    onApprove: (enquiry: Enquiry) => void;
    currentUserId: number;
}

export const createColumns = ({ 
    onView, 
    onEdit, 
    onDelete, 
    onAssign, 
    onStatusChange,
    onApprove,
    currentUserId
}: ColumnProps): DataTableColumn<Enquiry>[] => {
    const [quotationModalOpened, setQuotationModalOpened] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    const handleConvert = (enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setQuotationModalOpened(true);
    };

    return [
        {
            accessor: 'enquiry_no',
            title: 'Enquiry No',
            width: 150,
            render: (enquiry) => (
                <Text fw={500} size="sm">
                    {enquiry.enquiry_no}
                </Text>
            ),
        },
        {
            accessor: 'client.name',
            title: 'Client',
            width: 200,
            render: (enquiry) => (
                <div>
                    <Text size="sm" fw={500}>
                        {enquiry.client?.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {enquiry.contact_person?.name}
                    </Text>
                </div>
            ),
        },
        {
            accessor: 'subject',
            title: 'Subject',
            width: 250,
            render: (enquiry) => (
                <Text size="sm" lineClamp={2}>
                    {enquiry.subject}
                </Text>
            ),
        },
        {
            accessor: 'items',
            title: 'Equipment Items',
            width: 300,
            render: (enquiry: Enquiry) => (
                <Stack gap="xs">
                    {enquiry.items?.map((item, index) => (
                        <Group key={index} gap="xs">
                            <Text size="sm" fw={500}>{item.equipment?.name}</Text>
                            <Badge size="sm" variant="light">Qty: {item.quantity}</Badge>
                            <Badge size="sm" variant="light">{NATURE_OF_WORK_LABELS[item.nature_of_work]}</Badge>
                            {item.duration && (
                                <Badge size="sm" variant="light">
                                    {item.duration} {item.duration_unit}
                                </Badge>
                            )}
                            {item.estimated_value && (
                                <Badge size="sm" variant="light" color="green">
                                    ₹{item.estimated_value.toLocaleString()}
                                </Badge>
                            )}
                        </Group>
                    ))}
                </Stack>
            ),
        },
        {
            accessor: 'type',
            title: 'Type',
            width: 120,
            render: (enquiry: Enquiry) => (
                <Badge
                    color={
                        enquiry.type === 'equipment'
                            ? 'blue'
                            : enquiry.type === 'scaffolding'
                            ? 'green'
                            : 'grape'
                    }
                >
                    {enquiry.type.charAt(0).toUpperCase() + enquiry.type.slice(1)}
                </Badge>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            width: 150,
            render: (enquiry) => (
                <Stack gap={4}>
                    <Badge color={ENQUIRY_STATUS_COLORS[enquiry.status]} variant="light">
                        {enquiry.status.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                    </Badge>
                    {enquiry.priority === 'urgent' && (
                        <Badge color="red" variant="dot" size="sm">Urgent</Badge>
                    )}
                </Stack>
            ),
        },
        {
            accessor: 'assignee.name',
            title: 'Assigned To',
            width: 150,
            render: (enquiry) => (
                <Text size="sm">
                    {enquiry.assignee?.name || '-'}
                </Text>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 100,
            render: (enquiry) => {
                const canManage = enquiry.created_by.id === currentUserId || enquiry.assigned_to === currentUserId;
                const isAssigned = enquiry.assigned_to === currentUserId;

                // Define allowed actions based on current status
                const allowedActions: Record<Enquiry['status'], string[]> = {
                    draft: ['edit', 'delete', 'submit', 'assign'],
                    pending_review: ['approve', 'reject', 'cancel', 'assign'],
                    under_review: ['approve', 'reject', 'cancel', 'assign'],
                    quoted: ['approve', 'reject', 'cancel', 'assign'],
                    pending_approval: ['approve', 'reject', 'cancel', 'assign'],
                    approved: ['convert', 'cancel', 'assign'],
                    converted: ['cancel', 'assign'],
                    lost: ['assign'],
                    cancelled: ['assign']
                };

                const currentActions = allowedActions[enquiry.status] || [];

                return (
                    <>
                        <Group gap="xs" wrap="nowrap">
                            <Tooltip label="View">
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    onClick={() => onView(enquiry)}
                                >
                                    <Eye size={16} />
                                </ActionIcon>
                            </Tooltip>

                            {canManage && currentActions.includes('edit') && (
                                <Tooltip label="Edit">
                                    <ActionIcon
                                        variant="light"
                                        color="yellow"
                                        onClick={() => onEdit(enquiry)}
                                    >
                                        <Edit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

                            {canManage && currentActions.includes('delete') && (
                                <Tooltip label="Delete">
                                    <ActionIcon
                                        variant="light"
                                        color="red"
                                        onClick={() => onDelete(enquiry)}
                                    >
                                        <Trash size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

                            {canManage && (
                                <Menu position="bottom-end" withinPortal>
                                    <Menu.Target>
                                        <ActionIcon variant="light" color="blue">
                                            <ArrowUpRight size={16} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        {currentActions.includes('submit') && (
                                            <Menu.Item
                                                leftSection={<Clock size={16} />}
                                                onClick={() => onStatusChange(enquiry, 'pending_review')}
                                            >
                                                Submit for Review
                                            </Menu.Item>
                                        )}
                                        {currentActions.includes('approve') && (
                                            <Menu.Item
                                                leftSection={<CheckCircle size={16} />}
                                                onClick={() => onStatusChange(enquiry, 'approved')}
                                            >
                                                Approve
                                            </Menu.Item>
                                        )}
                                        {currentActions.includes('reject') && (
                                            <Menu.Item
                                                leftSection={<AlertCircle size={16} />}
                                                onClick={() => onStatusChange(enquiry, 'lost')}
                                            >
                                                Reject
                                            </Menu.Item>
                                        )}
                                        {currentActions.includes('convert') && (
                                            <Menu.Item
                                                leftSection={<ArrowUpRight size={16} />}
                                                onClick={() => handleConvert(enquiry)}
                                            >
                                                Convert to Quotation
                                            </Menu.Item>
                                        )}
                                        {currentActions.includes('cancel') && (
                                            <Menu.Item
                                                leftSection={<AlertCircle size={16} />}
                                                onClick={() => onStatusChange(enquiry, 'cancelled')}
                                            >
                                                Cancel
                                            </Menu.Item>
                                        )}
                                    </Menu.Dropdown>
                                </Menu>
                            )}

                            {canManage && currentActions.includes('assign') && (
                                <Tooltip label="Assign">
                                    <ActionIcon
                                        variant="light"
                                        color="green"
                                        onClick={() => onAssign(enquiry)}
                                    >
                                        <UserPlus size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>

                        {selectedEnquiry && (
                            <PrepareQuotationModal
                                opened={quotationModalOpened}
                                onClose={() => {
                                    setQuotationModalOpened(false);
                                    setSelectedEnquiry(null);
                                }}
                                enquiry={selectedEnquiry}
                                onSuccess={() => onStatusChange(selectedEnquiry, 'converted')}
                            />
                        )}
                    </>
                );
            },
        },
    ];
};