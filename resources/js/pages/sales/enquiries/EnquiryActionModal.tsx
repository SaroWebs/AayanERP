import { useEffect } from 'react';
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
    LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';
import { Enquiry, EnquiryFormData, ENQUIRY_STATUS_COLORS, ENQUIRY_PRIORITY_COLORS, ENQUIRY_TYPE_LABELS, ENQUIRY_SOURCE_LABELS, NATURE_OF_WORK_LABELS } from './types';
import type { Equipment } from '@/types/equipment';
import type { ClientDetail } from '@/types/client';
import type { ClientContactDetail } from '@/types/client-contact';

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

    const form = useForm<EnquiryFormData>({
        initialValues: {
            client_detail_id: enquiry?.client_detail_id || 0,
            contact_person_id: enquiry?.contact_person_id || null,
            assigned_to: enquiry?.assigned_to || null,
            referred_by: enquiry?.referred_by || null,
            subject: enquiry?.subject || '',
            description: enquiry?.description || '',
            type: enquiry?.type || 'equipment',
            priority: enquiry?.priority || 'medium',
            status: enquiry?.status || 'draft',
            approval_status: enquiry?.approval_status || 'not_required',
            source: enquiry?.source || 'other',
            equipment_id: enquiry?.equipment_id || null,
            quantity: enquiry?.quantity || 1,
            nature_of_work: enquiry?.nature_of_work || 'other',
            duration: enquiry?.duration || null,
            duration_unit: enquiry?.duration_unit || 'days',
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
            converted_date: enquiry?.converted_date || null
        },
        validate: {
            client_detail_id: (value) => (!value ? 'Client is required' : null),
            subject: (value) => (!value ? 'Subject is required' : null),
            type: (value) => (!value ? 'Type is required' : null),
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

    const { data: equipment = [] } = useQuery<Equipment[]>({
        queryKey: ['equipment'],
        queryFn: async () => {
            const { data } = await axios.get('/equipment/equipment/list');
            return data;
        }
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

    const handleSubmit = (values: EnquiryFormData) => {
        mutation.mutate(values);
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
        return (
            <Stack>
                <Group justify="space-between">
                    <Text fw={500} size="lg">
                        {enquiry.enquiry_no}
                    </Text>
                    <Group>
                        <Badge color={ENQUIRY_STATUS_COLORS[enquiry.status]}>
                            {enquiry.status.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                        </Badge>
                        <Badge color={ENQUIRY_PRIORITY_COLORS[enquiry.priority]}>
                            {enquiry.priority.charAt(0).toUpperCase() + enquiry.priority.slice(1)}
                        </Badge>
                    </Group>
                </Group>

                        <Grid>
                            <Grid.Col span={6}>
                        <Paper withBorder p="md">
                            <Text fw={500} mb="md">Client Information</Text>
                            <Stack gap="xs">
                                <Text size="sm">
                                    <Text span fw={500}>Client:</Text> {enquiry.client?.name}
                                </Text>
                                <Text size="sm">
                                    <Text span fw={500}>Contact Person:</Text> {enquiry.contact_person?.name}
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
                                    <Text span fw={500}>Type:</Text> {ENQUIRY_TYPE_LABELS[enquiry.type]}
                                </Text>
                                <Text size="sm">
                                    <Text span fw={500}>Source:</Text> {ENQUIRY_SOURCE_LABELS[enquiry.source]}
                                </Text>
                                <Text size="sm">
                                    <Text span fw={500}>Enquiry Date:</Text> {format(new Date(enquiry.enquiry_date), 'dd MMM yyyy')}
                                </Text>
                                {enquiry.required_date && (
                                    <Text size="sm">
                                        <Text span fw={500}>Required Date:</Text> {format(new Date(enquiry.required_date), 'dd MMM yyyy')}
                                    </Text>
                                )}
                            </Stack>
                        </Paper>
                            </Grid.Col>

                    <Grid.Col span={12}>
                        <Paper withBorder p="md">
                            <Text fw={500} mb="md">Description</Text>
                            <Text size="sm">{enquiry.description}</Text>
                        </Paper>
                            </Grid.Col>

                    {enquiry.equipment && (
                            <Grid.Col span={6}>
                            <Paper withBorder p="md">
                                <Text fw={500} mb="md">Equipment Details</Text>
                                <Stack gap="xs">
                                    <Text size="sm">
                                        <Text span fw={500}>Equipment:</Text> {enquiry.equipment.name}
                                    </Text>
                                    <Text size="sm">
                                        <Text span fw={500}>Quantity:</Text> {enquiry.quantity}
                                    </Text>
                                    <Text size="sm">
                                        <Text span fw={500}>Nature of Work:</Text> {NATURE_OF_WORK_LABELS[enquiry.nature_of_work]}
                                    </Text>
                            {enquiry.duration && (
                                        <Text size="sm">
                                            <Text span fw={500}>Duration:</Text> {enquiry.duration} {enquiry.duration_unit}
                                        </Text>
                                    )}
                                </Stack>
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
                                <Stack gap="xs">
                            {enquiry.special_requirements && (
                                        <div>
                                            <Text size="sm" fw={500}>Special Requirements:</Text>
                                            <Text size="sm">{enquiry.special_requirements}</Text>
                                        </div>
                            )}
                            {enquiry.terms_conditions && (
                                        <div>
                                            <Text size="sm" fw={500}>Terms & Conditions:</Text>
                                            <Text size="sm">{enquiry.terms_conditions}</Text>
                                        </div>
                            )}
                            {enquiry.notes && (
                                        <div>
                                            <Text size="sm" fw={500}>Notes:</Text>
                                            <Text size="sm">{enquiry.notes}</Text>
                                        </div>
                                    )}
                                </Stack>
                            </Paper>
                                </Grid.Col>
                            )}
                        </Grid>
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

                    <Grid.Col span={4}>
                        <Select
                            label="Type"
                            placeholder="Select type"
                            data={Object.entries(ENQUIRY_TYPE_LABELS).map(([value, label]) => ({
                                value,
                                label
                            }))}
                            {...form.getInputProps('type')}
                            required
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
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

                    <Grid.Col span={4}>
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
                            label="Equipment"
                            placeholder="Select equipment"
                            data={equipment.map(item => ({
                                value: item.id.toString(),
                                label: item.name
                            }))}
                            value={form.values.equipment_id?.toString()}
                            onChange={(value) => form.setFieldValue('equipment_id', value ? parseInt(value) : null)}
                            disabled={isView || form.values.type === 'scaffolding'}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Select
                            label="Nature of Work"
                            placeholder="Select nature of work"
                            data={Object.entries(NATURE_OF_WORK_LABELS).map(([value, label]) => ({
                                value,
                                label
                            }))}
                            {...form.getInputProps('nature_of_work')}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <NumberInput
                            label="Quantity"
                            placeholder="Enter quantity"
                            {...form.getInputProps('quantity')}
                            min={1}
                            disabled={isView}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Group grow>
                            <NumberInput
                                label="Duration"
                                placeholder="Enter duration"
                                {...form.getInputProps('duration')}
                                min={1}
                                disabled={isView}
                            />
                            <Select
                                label="Unit"
                                placeholder="Select unit"
                                data={[
                                    { value: 'hours', label: 'Hours' },
                                    { value: 'days', label: 'Days' },
                                    { value: 'months', label: 'Months' },
                                    { value: 'years', label: 'Years' }
                                ]}
                                {...form.getInputProps('duration_unit')}
                                disabled={isView}
                            />
                        </Group>
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