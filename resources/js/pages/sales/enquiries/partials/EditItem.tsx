import {
    Modal,
    Stack,
    Grid,
    Select,
    TextInput,
    Textarea,
    Group,
    Button,
    NumberInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';
import { Enquiry, EnquiryFormData, ENQUIRY_PRIORITY_COLORS, ENQUIRY_SOURCE_LABELS } from '../types';
import { ClientDetail } from '@/types/client';
import { ClientContactDetail } from '@/types/client-contact';
import { Item } from '@/pages/Equipment/Items/types';

interface EditItemProps {
    opened: boolean;
    onClose: () => void;
    enquiry: Enquiry;
    clients: ClientDetail[];
}

export function EditItem({ opened, onClose, enquiry, clients }: EditItemProps) {
    const queryClient = useQueryClient();

    const form = useForm<Omit<EnquiryFormData, 'status' | 'approval_status'>>({
        initialValues: {
            client_detail_id: enquiry.client_detail_id,
            contact_person_id: enquiry.contact_person_id,
            assigned_to: enquiry.assigned_to,
            referred_by: enquiry.referred_by,
            subject: enquiry.subject || '',
            description: enquiry.description || '',
            priority: enquiry.priority || 'medium',
            source: enquiry.source || 'other',
            deployment_state: enquiry.deployment_state || '',
            location: enquiry.location || '',
            site_details: enquiry.site_details || '',
            enquiry_date: enquiry.enquiry_date ? format(new Date(enquiry.enquiry_date), 'yyyy-MM-dd') : '',
            required_date: enquiry.required_date ? format(new Date(enquiry.required_date), 'yyyy-MM-dd') : null,
            valid_until: enquiry.valid_until ? format(new Date(enquiry.valid_until), 'yyyy-MM-dd') : null,
            estimated_value: enquiry.estimated_value,
            currency: enquiry.currency || 'INR',
            next_follow_up_date: enquiry.next_follow_up_date ? format(new Date(enquiry.next_follow_up_date), 'yyyy-MM-dd') : null,
            follow_up_notes: enquiry.follow_up_notes || '',
            special_requirements: enquiry.special_requirements || '',
            terms_conditions: enquiry.terms_conditions || '',
            notes: enquiry.notes || '',
            items: enquiry.items?.map(item => ({
                item_id: item.item_id,
                quantity: item.quantity,
                estimated_value: item.estimated_value,
                notes: item.notes
            })) || [],
            approved_at: null,
            approved_by: null,
            approval_remarks: null,
            converted_date: null
        },
        validate: {
            client_detail_id: (value) => (value ? null : 'Client is required'),
            subject: (value) => (value ? null : 'Subject is required'),
        },
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
            const { data } = await axios.get('/sales/enquiries/equipment');
            return data;
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            await axios.put(`/sales/enquiries/${enquiry.id}`, values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            notifications.show({
                title: 'Success',
                message: 'Enquiry updated successfully',
                color: 'green'
            });
            onClose();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to update enquiry',
                color: 'red'
            });
        }
    });

    return (
        <Modal opened={opened} onClose={onClose} title="Edit Enquiry" size="xl">
            <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
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
                                disabled={!form.values.client_detail_id}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <TextInput
                                label="Subject"
                                placeholder="Enter subject"
                                {...form.getInputProps('subject')}
                                required
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea
                                label="Description"
                                placeholder="Enter description"
                                {...form.getInputProps('description')}
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
                            />
                        </Grid.Col>
                    </Grid>
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={mutation.isPending}>
                            Update Enquiry
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 