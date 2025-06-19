import { Modal, Button, TextInput, Select, Textarea, Stack, Group, Grid, NumberInput, Divider, Title, LoadingOverlay, Paper, Table } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { EnquiryType, EnquiryPriority, EnquirySource, DurationUnit } from '../types';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { DateInput } from '@mantine/dates';
import { AlertCircleIcon, Plus, Trash } from 'lucide-react';
import { ClientDetail } from '@/types/client';

interface EnquiryItem {
    id?: number;
    enquiry_id?: number;
    equipment_id: number;
    quantity: number;
    nature_of_work: string;
    duration: number | null;
    duration_unit: DurationUnit;
    estimated_value: number | null;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    opened: boolean;
    onClose: () => void;
    enquiry: {
        id: number;
        client_detail_id: number;
        contact_person_id: number | null;
        subject: string | null;
        description: string | null;
        type: EnquiryType;
        priority: EnquiryPriority;
        source: EnquirySource;
        deployment_state: string | null;
        location: string | null;
        site_details: string | null;
        enquiry_date: string;
        required_date: string | null;
        valid_until: string | null;
        estimated_value: number | null;
        currency: string;
        next_follow_up_date: string | null;
        follow_up_notes: string | null;
        special_requirements: string | null;
        terms_conditions: string | null;
        notes: string | null;
        items?: EnquiryItem[];
    };
    clients: Array<ClientDetail>;
}

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const TYPE_OPTIONS = [
    { value: 'equipment', label: 'Equipment' },
    { value: 'scaffolding', label: 'Scaffolding' },
    { value: 'both', label: 'Both' },
];

const SOURCE_OPTIONS = [
    { value: 'website', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'referral', label: 'Referral' },
    { value: 'walk_in', label: 'Walk In' },
    { value: 'other', label: 'Other' },
];

const DURATION_UNIT_OPTIONS = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' },
];

export function EditItem({ opened, onClose, enquiry, clients }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactPersons, setContactPersons] = useState<Array<{ id: number; name: string }>>([]);
    const [equipment, setEquipment] = useState<Array<{ id: number; name: string }>>([]);
    const [items, setItems] = useState<EnquiryItem[]>(enquiry.items || []);
    const [currentItem, setCurrentItem] = useState<EnquiryItem>({
        equipment_id: 0,
        quantity: 1,
        nature_of_work: 'other',
        duration: null,
        duration_unit: 'days',
        estimated_value: null,
        notes: null
    });

    const form = useForm({
        initialValues: {
            client_detail_id: enquiry.client_detail_id.toString(),
            contact_person_id: enquiry.contact_person_id,
            subject: enquiry.subject,
            description: enquiry.description,
            type: enquiry.type,
            priority: enquiry.priority,
            source: enquiry.source,
            deployment_state: enquiry.deployment_state,
            location: enquiry.location,
            site_details: enquiry.site_details,
            enquiry_date: new Date(enquiry.enquiry_date),
            required_date: enquiry.required_date ? new Date(enquiry.required_date) : null,
            valid_until: enquiry.valid_until ? new Date(enquiry.valid_until) : null,
            estimated_value: enquiry.estimated_value,
            currency: enquiry.currency,
            next_follow_up_date: enquiry.next_follow_up_date ? new Date(enquiry.next_follow_up_date) : null,
            follow_up_notes: enquiry.follow_up_notes,
            special_requirements: enquiry.special_requirements,
            terms_conditions: enquiry.terms_conditions,
            notes: enquiry.notes,
        },
        validate: {
            client_detail_id: (value: string) => (!value ? 'Client is required' : null),
            subject: (value: string | null) => (!value ? 'Subject is required' : null),
            description: (value: string | null) => (!value ? 'Description is required' : null),
            enquiry_date: (value: Date | null) => (!value ? 'Enquiry date is required' : null),
        },
    });

    // Fetch equipment list
    useEffect(() => {
        axios.get('/sales/enquiries/get-equipment-list')
            .then(response => setEquipment(response.data))
            .catch(error => console.error('Error fetching equipment:', error));
    }, []);

    // Fetch contact persons when client changes
    useEffect(() => {
        if (form.values.client_detail_id) {
            axios.get(`/data/clients/${form.values.client_detail_id}/contacts`)
                .then(response => setContactPersons(response.data))
                .catch(error => console.error('Error fetching contact persons:', error));
        } else {
            setContactPersons([]);
        }
    }, [form.values.client_detail_id]);

    const addItem = () => {
        if (!currentItem.equipment_id) {
            notifications.show({
                title: 'Error',
                message: 'Please select equipment',
                color: 'red',
                icon: <AlertCircleIcon size={16} />
            });
            return;
        }
        setItems([...items, { ...currentItem, nature_of_work: 'other' }]);
        setCurrentItem({
            equipment_id: 0,
            quantity: 1,
            nature_of_work: 'other',
            duration: null,
            duration_unit: 'days',
            estimated_value: null,
            notes: null
        });
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        
        const { hasErrors } = form.validate();
        if (hasErrors) {
            notifications.show({
                title: 'Error',
                message: 'Please fill in all required fields',
                color: 'red',
                icon: <AlertCircleIcon size={16} />
            });
            return;
        }

        if (items.length === 0) {
            notifications.show({
                title: 'Error',
                message: 'Please add at least one item',
                color: 'red',
                icon: <AlertCircleIcon size={16} />
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedValues = {
                ...form.values,
                items: items.map(item => ({
                    id: item.id,
                    equipment_id: item.equipment_id,
                    quantity: item.quantity,
                    nature_of_work: item.nature_of_work,
                    duration: item.duration,
                    duration_unit: item.duration_unit,
                    estimated_value: item.estimated_value,
                    notes: item.notes
                })),
                enquiry_date: form.values.enquiry_date ? new Date(form.values.enquiry_date).toISOString().split('T')[0] : null,
                required_date: form.values.required_date ? new Date(form.values.required_date).toISOString().split('T')[0] : null,
                valid_until: form.values.valid_until ? new Date(form.values.valid_until).toISOString().split('T')[0] : null,
                next_follow_up_date: form.values.next_follow_up_date ? new Date(form.values.next_follow_up_date).toISOString().split('T')[0] : null,
            };

            const response = await axios.put(`/sales/enquiries/${enquiry.id}`, formattedValues);
            if (response.data.success) {
                notifications.show({ title: 'Success', message: response.data.message, color: 'green' });
                onClose();
            }
        } catch (error: any) {
            console.error('Error updating enquiry:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setFieldError(field, (messages as string[])[0]);
                });
            }
            notifications.show({ 
                title: 'Error', 
                message: error.response?.data?.message || 'Failed to update enquiry', 
                color: 'red', 
                icon: <AlertCircleIcon size={16} /> 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Edit Enquiry" size="90%">
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    <LoadingOverlay visible={isSubmitting} />

                    {/* Client Information */}
                    <Stack gap="xs">
                        <Title order={4}>Client Information</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Client"
                                    placeholder="Select client"
                                    data={clients.map(client => ({ value: client.id.toString(), label: client.name }))}
                                    required
                                    {...form.getInputProps('client_detail_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Contact Person"
                                    placeholder="Select contact person"
                                    data={contactPersons.map(contact => ({ value: contact.id.toString(), label: contact.name }))}
                                    {...form.getInputProps('contact_person_id')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Basic Information */}
                    <Stack gap="xs">
                        <Title order={4}>Basic Information</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput label="Subject" required {...form.getInputProps('subject')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select label="Type" data={TYPE_OPTIONS} required {...form.getInputProps('type')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select label="Priority" data={PRIORITY_OPTIONS} required {...form.getInputProps('priority')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select label="Source" data={SOURCE_OPTIONS} required {...form.getInputProps('source')} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Description" required {...form.getInputProps('description')} />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Equipment Details */}
                    <Stack gap="xs">
                        <Title order={4}>Add New Item</Title>
                        <Paper p="md" withBorder>
                            <Grid>
                                <Grid.Col span={4}>
                                    <Select
                                        label="Equipment"
                                        data={equipment.map(eq => ({ value: eq.id.toString(), label: eq.name }))}
                                        value={currentItem.equipment_id.toString()}
                                        onChange={(value) => setCurrentItem({ ...currentItem, equipment_id: value ? parseInt(value) : 0 })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Quantity"
                                        min={1}
                                        value={currentItem.quantity}
                                        onChange={(value) => setCurrentItem({ ...currentItem, quantity: Number(value) || 1 })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Estimated Value"
                                        min={0}
                                        value={currentItem.estimated_value || ''}
                                        onChange={(value) => setCurrentItem({ ...currentItem, estimated_value: value ? Number(value) : null })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Duration"
                                        min={1}
                                        value={currentItem.duration || ''}
                                        onChange={(value) => setCurrentItem({ ...currentItem, duration: value ? Number(value) : null })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <Select
                                        label="Duration Unit"
                                        data={DURATION_UNIT_OPTIONS}
                                        value={currentItem.duration_unit}
                                        onChange={(value) => setCurrentItem({ ...currentItem, duration_unit: value as DurationUnit })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <Textarea
                                        label="Notes"
                                        value={currentItem.notes || ''}
                                        onChange={(event) => setCurrentItem({ ...currentItem, notes: event.currentTarget.value })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Group justify="flex-end">
                                        <Button onClick={addItem}>Add Item</Button>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {items.length > 0 && (
                            <Paper p="md" withBorder>
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Equipment</Table.Th>
                                            <Table.Th>Qty</Table.Th>
                                            <Table.Th>Est. Value</Table.Th>
                                            <Table.Th>Duration</Table.Th>
                                            <Table.Th>Notes</Table.Th>
                                            <Table.Th style={{ width: '100px' }}></Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {items.map((item, index) => (
                                            <Table.Tr key={index}>
                                                <Table.Td>{equipment.find(e => e.id === item.equipment_id)?.name}</Table.Td>
                                                <Table.Td>{item.quantity}</Table.Td>
                                                <Table.Td>{item.estimated_value}</Table.Td>
                                                <Table.Td>{item.duration} {item.duration_unit}</Table.Td>
                                                <Table.Td>{item.notes}</Table.Td>
                                                <Table.Td>
                                                    <Button variant="light" color="red" size="xs" onClick={() => removeItem(index)}>
                                                        Remove
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Paper>
                        )}
                    </Stack>

                    <Divider />

                    {/* Location Details */}
                    <Stack gap="xs">
                        <Title order={4}>Location Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput label="State" {...form.getInputProps('deployment_state')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput label="Location" {...form.getInputProps('location')} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Site Details" {...form.getInputProps('site_details')} />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Dates */}
                    <Stack gap="xs">
                        <Title order={4}>Dates</Title>
                        <Grid>
                            <Grid.Col span={4}>
                                <DateInput label="Enquiry Date" required {...form.getInputProps('enquiry_date')} />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <DateInput label="Required Date" {...form.getInputProps('required_date')} />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <DateInput label="Valid Until" {...form.getInputProps('valid_until')} />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Financial Details */}
                    <Stack gap="xs">
                        <Title order={4}>Financial Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <NumberInput label="Estimated Value" min={0} {...form.getInputProps('estimated_value')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput label="Currency" defaultValue="INR" {...form.getInputProps('currency')} />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Follow-up Details */}
                    <Stack gap="xs">
                        <Title order={4}>Follow-up Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <DateInput label="Next Follow-up Date" {...form.getInputProps('next_follow_up_date')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Textarea label="Follow-up Notes" {...form.getInputProps('follow_up_notes')} />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Additional Details */}
                    <Stack gap="xs">
                        <Title order={4}>Additional Details</Title>
                        <Grid>
                            <Grid.Col span={12}>
                                <Textarea label="Special Requirements" {...form.getInputProps('special_requirements')} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Terms & Conditions" {...form.getInputProps('terms_conditions')} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Notes" {...form.getInputProps('notes')} />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>Update Enquiry</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 