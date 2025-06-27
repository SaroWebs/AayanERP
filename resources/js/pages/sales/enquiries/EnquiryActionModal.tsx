import { useEffect, useState } from 'react';
import {
    Stack,
    TextInput,
    Select,
    Textarea,
    NumberInput,
    Group,
    Button,
    Grid,
    Text,
    Divider,
    Paper,
    Badge,
    LoadingOverlay,
    Table,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';
import {
    Enquiry,
    EnquiryFormData,
    ENQUIRY_STATUS_COLORS,
    ENQUIRY_PRIORITY_COLORS,
    ENQUIRY_SOURCE_LABELS,
} from './types';
import { Item } from '@/pages/Equipment/Items/types';
import type { ClientDetail } from '@/types/client';
import type { ClientContactDetail } from '@/types/client-contact';
import { PrepareQuotationModal } from './PrepareQuotationModal';

interface EnquiryActionModalProps {
    action: 'view' | 'edit' | 'create' | 'assign';
    enquiry: Enquiry | null;
    onClose: () => void;
    onAssign?: (userId: number) => void;
    users: Array<{ id: number; name: string }>;
}

export function EnquiryActionModal({ action, enquiry, onClose, onAssign, users }: EnquiryActionModalProps) {
    const queryClient = useQueryClient();
    const isView = action === 'view';
    const isAssign = action === 'assign';
    const [quotationModalOpen, setQuotationModalOpen] = useState(false);


    const canTransitionTo = (currentStatus: string, targetStatus: string) => {
        const validTransitions: Record<string, string[]> = {
            'draft': ['pending_review', 'cancelled'],
            'pending_review': ['under_review', 'cancelled'],
            'under_review': ['quoted', 'lost'],
            'quoted': ['pending_approval', 'lost'],
            'pending_approval': ['approved', 'rejected'],
            'approved': ['converted', 'lost'],
            'converted': [],
            'lost': [],
            'cancelled': []
        };

        return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
    };

    const getStatusActions = (enquiry: Enquiry) => {
        const actions = [];
        switch (enquiry.status) {
            case 'draft':
            case 'pending_review':
            case 'under_review':
                actions.push({
                    label: 'Submit for Review',
                    color: 'blue',
                    onClick: () => handleStatusChange('pending_review')
                });
                actions.push({
                    label: 'Approve',
                    color: 'green',
                    onClick: () => handleStatusChange('approved')
                });
                break;
            case 'approved':
                actions.push({
                    label: 'Prepare Quotation',
                    color: 'blue',
                    onClick: () => setQuotationModalOpen(true)
                });
                break;
        }
        if (!['quoted', 'cancelled'].includes(enquiry.status)) {
            actions.push({
                label: 'Cancel Enquiry',
                color: 'red',
                onClick: () => handleStatusChange('cancelled')
            });
        }
        return actions;
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!enquiry) return;

        if (!canTransitionTo(enquiry.status, newStatus)) {
            notifications.show({
                title: 'Invalid Status Change',
                message: `Cannot change status from ${enquiry.status} to ${newStatus}`,
                color: 'red'
            });
            return;
        }

        try {
            let endpoint = '';
            let payload: any = {};

            switch (newStatus) {
                case 'pending_review':
                    endpoint = 'submit';
                    break;
                case 'under_review':
                    endpoint = 'under-review';
                    break;
                case 'quoted':
                    endpoint = 'quoted';
                    break;
                case 'pending_approval':
                    endpoint = 'pending-approval';
                    break;
                case 'approved':
                    endpoint = 'approve';
                    payload = { approval_remarks: form.values.approval_remarks };
                    break;
                case 'converted':
                    endpoint = 'convert';
                    break;
                case 'lost':
                    endpoint = 'reject';
                    payload = { approval_remarks: form.values.approval_remarks };
                    break;
                case 'cancelled':
                    endpoint = 'cancel';
                    break;
                default:
                    throw new Error('Invalid status transition');
            }

            await axios.post(`/sales/enquiries/${enquiry.id}/${endpoint}`, payload);

            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: `Status updated to ${newStatus}`,
                color: 'green'
            });
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : error && typeof error === 'object' && 'response' in error
                    ? (error.response as any)?.data?.message
                    : 'Failed to update status';
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red'
            });
        }
    };

    const form = useForm<EnquiryFormData & { approval_remarks?: string }>({
        initialValues: {
            client_detail_id: enquiry?.client_detail_id || 0,
            contact_person_id: enquiry?.contact_person_id || null,
            assigned_to: enquiry?.assigned_to || null,
            referred_by: enquiry?.referred_by || null,
            subject: enquiry?.subject || '',
            description: enquiry?.description || '',
            priority: enquiry?.priority || 'medium',
            status: enquiry?.status || 'draft',
            approval_status: enquiry?.approval_status || 'not_required',
            source: enquiry?.source || 'other',
            deployment_state: enquiry?.deployment_state || '',
            location: enquiry?.location || '',
            site_details: enquiry?.site_details || '',
            enquiry_date: enquiry?.enquiry_date || format(new Date(), 'yyyy-MM-dd'),
            required_date: enquiry?.required_date || null,
            valid_until: enquiry?.valid_until || null,
            estimated_value: enquiry?.estimated_value || null,
            currency: enquiry?.currency || 'INR',
            next_follow_up_date: enquiry?.next_follow_up_date || null,
            follow_up_notes: enquiry?.follow_up_notes || '',
            special_requirements: enquiry?.special_requirements || '',
            terms_conditions: enquiry?.terms_conditions || '',
            notes: enquiry?.notes || '',
            approved_by: enquiry?.approved_by || null,
            approved_at: enquiry?.approved_at || null,
            approval_remarks: enquiry?.approval_remarks || '',
            converted_date: enquiry?.converted_date || null,
            items: enquiry?.items?.map(item => ({
                item_id: item.item_id,
                quantity: item.quantity,
                estimated_value: item.estimated_value,
                notes: item.notes
            })) || []
        },
        validate: {
            client_detail_id: (value) => (value === 0 ? 'Client is required' : null),
            subject: (value) => (!value ? 'Subject is required' : null),
            priority: (value) => (!value ? 'Priority is required' : null),
            status: (value) => (!value ? 'Status is required' : null),
            source: (value) => (!value ? 'Source is required' : null),
            enquiry_date: (value) => (!value ? 'Enquiry date is required' : null)
        }
    });

    const { data: clients = [] } = useQuery<ClientDetail[]>({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data } = await axios.get('/data/clients');
            return data;
        }
    });

    const { data: contactPersons = [] } = useQuery<ClientContactDetail[]>({
        queryKey: ['client-contact-persons', form.values.client_detail_id],
        queryFn: async () => {
            if (!form.values.client_detail_id) return [];
            const { data } = await axios.get(`/data/clients/${form.values.client_detail_id}/contacts`);
            return data;
        },
        enabled: !!form.values.client_detail_id
    });

    const { data: items = [] } = useQuery<Item[]>({
        queryKey: ['items'],
        queryFn: async () => {
            const { data } = await axios.get('/sales/enquiries/get-equipment-list');
            return data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: EnquiryFormData) => {
            if (action === 'create') {
                await axios.post('/sales/enquiries', values);
            } else if (action === 'edit' && enquiry) {
                await axios.put(`/sales/enquiries/${enquiry.id}`, values);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: `Enquiry ${action === 'create' ? 'created' : 'updated'} successfully`,
                color: 'green'
            });
            onClose();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || `Failed to ${action} enquiry`,
                color: 'red'
            });
        }
    });

    const handleSubmit = (values: typeof form.values) => {
        mutation.mutate(values);
    };

    const handleReject = async (remarks: string) => {
        if (!enquiry) return;
        try {
            await axios.post(`/sales/enquiries/${enquiry.id}/reject`, {
                approval_remarks: remarks,
                status: 'lost',
                approval_status: 'rejected'
            });

            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: 'Enquiry rejected successfully',
                color: 'green'
            });
            onClose();
        } catch (error) {
            console.error('Failed to reject enquiry', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to reject enquiry',
                color: 'red'
            });
        }
    };

    if (isAssign) {
        return (
            <Stack>
                <Text size="sm">
                    Assign enquiry {enquiry?.enquiry_no} to a user
                </Text>
                <Select
                    label="Select User"
                    placeholder="Choose a user"
                    data={users.map(user => ({
                        value: user.id.toString(),
                        label: user.name
                    }))}
                    value={form.values.assigned_to?.toString()}
                    onChange={(value) => {
                        if (value && onAssign) {
                            onAssign(parseInt(value));
                        }
                    }}
                />
            </Stack>
        );
    }

    if (isView && enquiry) {
        const showQuotationActions = ['approved', 'quoted', 'converted'].includes(enquiry.status);
        const quotations = enquiry.quotations ?? [];
        const hasQuotation = quotations.length > 0;
        const firstQuotation = hasQuotation ? quotations[0] : null;
        return (
            <Stack>
                {showQuotationActions && (
                    <Group mb="md">
                        {!(hasQuotation && firstQuotation) ? (
                            <Button color="blue" onClick={() => setQuotationModalOpen(true)}>
                                Prepare Quotation
                            </Button>
                        ) : (
                            <Button
                                component="a"
                                href={`/sales/quotations/${firstQuotation.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="violet"
                            >
                                View Quotation
                            </Button>
                        )}
                    </Group>
                )}
                <Paper withBorder p="xl">
                    <Group justify="space-between" mb="xl">
                        <Stack gap={0}>
                            <Text fw={700} size="xl">Enquiry Proposal</Text>
                            <Text size="sm" c="dimmed">Reference: {enquiry.enquiry_no}</Text>
                        </Stack>
                        <Group>
                            <Badge color={ENQUIRY_STATUS_COLORS[enquiry.status]} size="lg">
                                {enquiry.status.split('_').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </Badge>
                            <Badge color={ENQUIRY_PRIORITY_COLORS[enquiry.priority]} size="lg">
                                {enquiry.priority.charAt(0).toUpperCase() + enquiry.priority.slice(1)}
                            </Badge>
                        </Group>
                    </Group>

                    {getStatusActions(enquiry).length > 0 && (
                        <Paper withBorder p="md" mb="xl">
                            <Text fw={500} mb="md">Status Actions</Text>
                            <Group>
                                {getStatusActions(enquiry).map((action, index) => (
                                    <Button
                                        key={index}
                                        color={action.color}
                                        onClick={action.onClick}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </Group>
                        </Paper>
                    )}

                    <Grid>
                        <Grid.Col span={6}>
                            <Paper withBorder p="md">
                                <Text fw={500} mb="md">Client Information</Text>
                                <Stack gap="xs">
                                    <Text size="sm">
                                        <Text span fw={500}>Client:</Text> {enquiry.client?.name}
                                    </Text>
                                    <Text size="sm">
                                        <Text span fw={500}>Contact Person:</Text> {enquiry.contact_person?.contact_person}
                                    </Text>
                                    <Text size="sm">
                                        <Text span fw={500}>Assigned To:</Text> {enquiry.assignee?.name || '-'}
                                    </Text>
                                </Stack>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Paper withBorder p="md">
                                <Text fw={500} mb="md">Enquiry Details</Text>
                                <Stack gap="xs">
                                    <Text size="sm">
                                        <Text span fw={500}>Source:</Text> {ENQUIRY_SOURCE_LABELS[enquiry.source]}
                                    </Text>
                                    <Text size="sm">
                                        <Text span fw={500}>Enquiry Date:</Text> {format(new Date(enquiry.enquiry_date), 'dd MMM yyyy')}
                                    </Text>
                                </Stack>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Paper withBorder p="md">
                                <Text fw={500} mb="md">Description</Text>
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{enquiry.description}</Text>
                            </Paper>
                        </Grid.Col>

                        {enquiry.items && enquiry.items.length > 0 && (
                            <Grid.Col span={12}>
                                <Paper withBorder p="md">
                                    <Text fw={500} mb="md">Enquiry Items</Text>
                                    <Table striped highlightOnHover>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Item</Table.Th>
                                                <Table.Th>Quantity</Table.Th>
                                                <Table.Th>Estimated Value</Table.Th>
                                                <Table.Th>Notes</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {enquiry.items.map((item, index) => (
                                                <Table.Tr key={index}>
                                                    <Table.Td>{item.item?.name || '-'}</Table.Td>
                                                    <Table.Td>{item.quantity}</Table.Td>
                                                    <Table.Td>
                                                        {item.estimated_value ? `${enquiry.currency} ${item.estimated_value.toLocaleString()}` : '-'}
                                                    </Table.Td>
                                                    <Table.Td>{item.notes || '-'}</Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Paper>
                            </Grid.Col>
                        )}

                        {(enquiry.deployment_state || enquiry.location) && (
                            <Grid.Col span={6}>
                                <Paper withBorder p="md">
                                    <Text fw={500} mb="md">Location Details</Text>
                                    <Stack gap="xs">
                                        {enquiry.deployment_state && (
                                            <Text size="sm">
                                                <Text span fw={500}>State:</Text> {enquiry.deployment_state}
                                            </Text>
                                        )}
                                        {enquiry.location && (
                                            <Text size="sm">
                                                <Text span fw={500}>Location:</Text> {enquiry.location}
                                            </Text>
                                        )}
                                        {enquiry.site_details && (
                                            <Text size="sm">
                                                <Text span fw={500}>Site Details:</Text> {enquiry.site_details}
                                            </Text>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                        )}

                        {enquiry.estimated_value && (
                            <Grid.Col span={6}>
                                <Paper withBorder p="md">
                                    <Text fw={500} mb="md">Financial Details</Text>
                                    <Text size="sm">
                                        <Text span fw={500}>Estimated Value:</Text> {enquiry.currency} {enquiry.estimated_value.toLocaleString()}
                                    </Text>
                                </Paper>
                            </Grid.Col>
                        )}

                        {(enquiry.special_requirements || enquiry.terms_conditions || enquiry.notes) && (
                            <Grid.Col span={12}>
                                <Paper withBorder p="md">
                                    <Text fw={500} mb="md">Additional Information</Text>
                                    <Stack gap="md">
                                        {enquiry.special_requirements && (
                                            <div>
                                                <Text size="sm" fw={500}>Special Requirements:</Text>
                                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{enquiry.special_requirements}</Text>
                                            </div>
                                        )}
                                        {enquiry.terms_conditions && (
                                            <div>
                                                <Text size="sm" fw={500}>Terms & Conditions:</Text>
                                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{enquiry.terms_conditions}</Text>
                                            </div>
                                        )}
                                        {enquiry.notes && (
                                            <div>
                                                <Text size="sm" fw={500}>Notes:</Text>
                                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{enquiry.notes}</Text>
                                            </div>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                        )}

                        {enquiry.approval_status !== 'not_required' && (
                            <Grid.Col span={12}>
                                <Paper withBorder p="md">
                                    <Text fw={500} mb="md">Approval Information</Text>
                                    <Stack gap="xs">
                                        <Text size="sm">
                                            <Text span fw={500}>Approval Status:</Text> {
                                                enquiry.approval_status.charAt(0).toUpperCase() +
                                                enquiry.approval_status.slice(1).replace('_', ' ')
                                            }
                                        </Text>
                                        {enquiry.approved_by && (
                                            <Text size="sm">
                                                <Text span fw={500}>Approved By:</Text> {enquiry.approver?.name}
                                            </Text>
                                        )}
                                        {enquiry.approved_at && (
                                            <Text size="sm">
                                                <Text span fw={500}>Approved At:</Text> {format(new Date(enquiry.approved_at), 'dd MMM yyyy HH:mm')}
                                            </Text>
                                        )}
                                        {enquiry.approval_remarks && (
                                            <Text size="sm">
                                                <Text span fw={500}>Approval Remarks:</Text> {enquiry.approval_remarks}
                                            </Text>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                        )}

                        {(enquiry.next_follow_up_date || enquiry.follow_up_notes) && (
                            <Grid.Col span={12}>
                                <Paper withBorder p="md">
                                    <Text fw={500} mb="md">Follow-up Information</Text>
                                    <Stack gap="xs">
                                        {enquiry.next_follow_up_date && (
                                            <Text size="sm">
                                                <Text span fw={500}>Next Follow-up Date:</Text> {format(new Date(enquiry.next_follow_up_date), 'dd MMM yyyy')}
                                            </Text>
                                        )}
                                        {enquiry.follow_up_notes && (
                                            <Text size="sm">
                                                <Text span fw={500}>Follow-up Notes:</Text> {enquiry.follow_up_notes}
                                            </Text>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid.Col>
                        )}
                    </Grid>
                </Paper>
                {showQuotationActions && !hasQuotation && (
                    <PrepareQuotationModal
                        opened={quotationModalOpen}
                        onClose={() => { setQuotationModalOpen(false); onClose(); }}
                        enquiry={enquiry}
                        onSuccess={() => { setQuotationModalOpen(false); onClose(); }}
                    />
                )}
            </Stack>
        );
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                <Grid>
                    <Grid.Col span={6}>
                        <Select
                            label="Client"
                            placeholder="Select client"
                            data={clients.map(client => ({
                                value: client.id.toString(),
                                label: client.name
                            }))}
                            value={form.values.client_detail_id.toString()}
                            onChange={(value) => {
                                form.setFieldValue('client_detail_id', value ? parseInt(value) : 0);
                                form.setFieldValue('contact_person_id', null);
                            }}
                            required
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label="Contact Person"
                            placeholder="Select contact person"
                            data={contactPersons.map(contact => ({
                                value: contact.id.toString(),
                                label: contact.name
                            }))}
                            value={form.values.contact_person_id?.toString()}
                            onChange={(value) => form.setFieldValue('contact_person_id', value ? parseInt(value) : null)}
                            disabled={isView || !form.values.client_detail_id}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <TextInput
                            label="Subject"
                            placeholder="Enter subject"
                            {...form.getInputProps('subject')}
                            required
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label="Description"
                            placeholder="Enter description"
                            {...form.getInputProps('description')}
                            disabled={isView}
                            minRows={3}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label="Priority"
                            placeholder="Select priority"
                            data={Object.entries(ENQUIRY_PRIORITY_COLORS).map(([value, color]) => ({
                                value,
                                label: value.charAt(0).toUpperCase() + value.slice(1),
                                color
                            }))}
                            {...form.getInputProps('priority')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label="Source"
                            placeholder="Select source"
                            data={Object.entries(ENQUIRY_SOURCE_LABELS).map(([value, label]) => ({
                                value,
                                label
                            }))}
                            {...form.getInputProps('source')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label="Item"
                            placeholder="Select item"
                            data={items.map(item => ({
                                value: item.id.toString(),
                                label: item.name
                            }))}
                            value={form.values.items[0]?.item_id?.toString()}
                            onChange={(value) => {
                                form.setFieldValue('items', [
                                    {
                                        ...form.values.items[0],
                                        item_id: value ? parseInt(value) : null
                                    }
                                ]);
                            }}
                            disabled={isView}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <NumberInput
                            label="Quantity"
                            placeholder="Enter quantity"
                            {...form.getInputProps('items.0.quantity')}
                            min={1}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <TextInput
                            label="Deployment State"
                            placeholder="Enter state"
                            {...form.getInputProps('deployment_state')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={8}>
                        <TextInput
                            label="Location"
                            placeholder="Enter location"
                            {...form.getInputProps('location')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label="Site Details"
                            placeholder="Enter site details"
                            {...form.getInputProps('site_details')}
                            disabled={isView}
                            minRows={2}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            label="Enquiry Date"
                            type="date"
                            {...form.getInputProps('enquiry_date')}
                            required
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput
                            label="Required Date"
                            type="date"
                            {...form.getInputProps('required_date')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <NumberInput
                            label="Estimated Value"
                            placeholder="Enter value"
                            {...form.getInputProps('estimated_value')}
                            min={0}
                            decimalScale={2}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label="Currency"
                            placeholder="Select currency"
                            data={[
                                { value: 'INR', label: 'Indian Rupee (INR)' },
                                { value: 'USD', label: 'US Dollar (USD)' },
                                { value: 'EUR', label: 'Euro (EUR)' },
                                { value: 'GBP', label: 'British Pound (GBP)' }
                            ]}
                            {...form.getInputProps('currency')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label="Special Requirements"
                            placeholder="Enter special requirements"
                            {...form.getInputProps('special_requirements')}
                            disabled={isView}
                            minRows={2}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label="Terms & Conditions"
                            placeholder="Enter terms and conditions"
                            {...form.getInputProps('terms_conditions')}
                            disabled={isView}
                            minRows={2}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label="Notes"
                            placeholder="Enter notes"
                            {...form.getInputProps('notes')}
                            disabled={isView}
                            minRows={2}
                        />
                    </Grid.Col>

                    <Divider label="Follow-up Information" labelPosition="center" />

                    <Grid.Col span={6}>
                        <TextInput
                            label="Next Follow-up Date"
                            type="date"
                            {...form.getInputProps('next_follow_up_date')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Textarea
                            label="Follow-up Notes"
                            placeholder="Enter follow-up notes"
                            {...form.getInputProps('follow_up_notes')}
                            disabled={isView}
                            minRows={2}
                        />
                    </Grid.Col>
                </Grid>

                {!isView && (
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={mutation.isPending}>
                            {action === 'create' ? 'Create' : 'Update'}
                        </Button>
                    </Group>
                )}
            </Stack>
        </form>
    );
}

