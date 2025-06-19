import { Modal, Button, Group, Stack, Grid, Paper, Title, Badge, Text, Divider } from '@mantine/core';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/format';
import { PurchaseIntent, Department } from '@/types/purchase';
import { Calendar, Clock, DollarSign, Building, User, FileText, AlertTriangle } from 'lucide-react';

interface Props {
    opened: boolean;
    onClose: () => void;
    intent: PurchaseIntent;
    departments: Department[];
    loading: boolean;
}

export function ViewItem({ opened, onClose, intent, departments, loading }: Props) {
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
        return colors[status];
    };

    const getApprovalStatusColor = (status: PurchaseIntent['approval_status']) => {
        const colors: Record<PurchaseIntent['approval_status'], string> = {
            pending: 'yellow',
            approved: 'green',
            rejected: 'red',
            not_required: 'gray'
        };
        return colors[status];
    };

    const getPriorityColor = (priority: PurchaseIntent['priority']) => {
        const colors: Record<PurchaseIntent['priority'], string> = {
            low: 'gray',
            medium: 'blue',
            high: 'orange',
            urgent: 'red'
        };
        return colors[priority];
    };

    const getTypeColor = (type: PurchaseIntent['type']) => {
        const colors: Record<PurchaseIntent['type'], string> = {
            equipment: 'blue',
            scaffolding: 'green',
            spares: 'orange',
            consumables: 'purple',
            other: 'gray'
        };
        return colors[type];
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Purchase Intent Details - ${intent.intent_no}`}
            size="xl"
            closeOnClickOutside={false}
        >
            <Stack gap="lg">
                {/* Header with Status */}
                <Paper p="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <Title order={4}>Intent Information</Title>
                        <Group gap="xs">
                            <Badge color={getStatusColor(intent.status)} size="lg">
                                {intent.status.replace('_', ' ').charAt(0).toUpperCase() +
                                    intent.status.replace('_', ' ').slice(1)}
                            </Badge>
                            <Badge color={getApprovalStatusColor(intent.approval_status)}>
                                {intent.approval_status.replace('_', ' ').charAt(0).toUpperCase() +
                                    intent.approval_status.replace('_', ' ').slice(1)}
                            </Badge>
                        </Group>
                    </Group>

                    <Grid>
                        <Grid.Col span={8}>
                            <Text size="lg" fw={600} mb="xs">{intent.subject}</Text>
                            {intent.description && (
                                <Text c="dimmed" mb="md">{intent.description}</Text>
                            )}
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Stack gap="xs">
                                <Group gap="xs">
                                    <Badge color={getTypeColor(intent.type)}>
                                        {intent.type.charAt(0).toUpperCase() + intent.type.slice(1)}
                                    </Badge>
                                    <Badge color={getPriorityColor(intent.priority)}>
                                        {intent.priority.charAt(0).toUpperCase() + intent.priority.slice(1)}
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
                        {intent.approved_by && (
                            <Grid.Col span={6}>
                                <Group gap="xs" mb="xs">
                                    <User size={16} />
                                    <Text fw={500}>Approved By</Text>
                                </Group>
                                <Text c="dimmed">{intent.approved_by}
                                    <span className='p-4 bg-rose-600 text-yellow-300 border border-black'>
                                        ("----To be fixed **----")
                                    </span>
                                </Text>
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

                {/* Actions */}
                <Group justify="flex-end">
                    <Button variant="light" onClick={onClose}>
                        Close
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
} 