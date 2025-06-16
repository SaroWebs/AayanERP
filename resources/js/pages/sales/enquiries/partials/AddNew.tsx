import { Modal, Button, TextInput, Select, Textarea, Stack, Group, Grid, NumberInput, Divider, Title, Radio, LoadingOverlay } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { EnquiryType, EnquiryPriority, EnquirySource, NatureOfWork, DurationUnit } from '../types';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { DateInput } from '@mantine/dates';
import { AlertCircleIcon } from 'lucide-react';
import { ClientDetail } from '@/types/client';

interface Props {
    opened: boolean;
    onClose: () => void;
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

const NATURE_OF_WORK_OPTIONS = [
    { value: 'soil', label: 'Soil' },
    { value: 'rock', label: 'Rock' },
    { value: 'limestone', label: 'Limestone' },
    { value: 'coal', label: 'Coal' },
    { value: 'sand', label: 'Sand' },
    { value: 'gravel', label: 'Gravel' },
    { value: 'construction', label: 'Construction' },
    { value: 'demolition', label: 'Demolition' },
    { value: 'mining', label: 'Mining' },
    { value: 'quarry', label: 'Quarry' },
    { value: 'other', label: 'Other' },
];

const DURATION_UNIT_OPTIONS = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' },
];

export function AddNew({ opened, onClose, clients }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        initialValues: {
            client_detail_id: '',
            contact_person_id: null,
            subject: '',
            description: '',
            type: 'equipment',
            priority: 'medium',
            source: 'other',
            equipment_id: null,
            quantity: 1,
            nature_of_work: 'other',
            duration: null,
            duration_unit: 'days',
            deployment_state: '',
            location: '',
            site_details: '',
            enquiry_date: new Date(),
            required_date: null,
            valid_until: null,
            estimated_value: null,
            currency: 'INR',
            special_requirements: '',
            terms_conditions: '',
            notes: '',
        },
        validate: {
            client_detail_id: (value) => (!value ? 'Client is required' : null),
            subject: (value) => (!value ? 'Subject is required' : null),
            description: (value) => (!value ? 'Description is required' : null),
            enquiry_date: (value) => (!value ? 'Enquiry date is required' : null),
            quantity: (value) => value < 1 ? 'Quantity must be at least 1' : null,
            duration: (value, values) => value && value < 1 ? 'Duration must be at least 1' : null,
        },
    });

    const handleSubmit = async (values: typeof form.values, event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setIsSubmitting(true);

        try {
            const formattedValues = {
                ...values,
                enquiry_date: values.enquiry_date?.toISOString().split('T')[0],
            };

            const response = await axios.post(route('sales.enquiries.store'), formattedValues);
            if (response.data.success) {
                notifications.show({ title: 'Success', message: response.data.message, color: 'green' });
                onClose();
            }
        } catch (error: any) {
            console.error('Error creating enquiry:', error);
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to create enquiry', color: 'red', icon: <AlertCircleIcon size={16} /> });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="New Enquiry" size="xl">
            <form onSubmit={form.onSubmit(handleSubmit)}>
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
                                    data={(clients && clients.length > 0) ? clients.map(client => ({ value: client.id.toString(), label: client.name || `Client #${client.id}` })) : []}
                                    required
                                    {...form.getInputProps('client_detail_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Contact Person"
                                    placeholder="Select contact person"
                                    data={[]} // Populate with contact persons based on selected client
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
                        <Title order={4}>Equipment Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select label="Equipment" data={[]} {...form.getInputProps('equipment_id')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput label="Quantity" min={1} {...form.getInputProps('quantity')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select label="Nature of Work" data={NATURE_OF_WORK_OPTIONS} {...form.getInputProps('nature_of_work')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput label="Duration" min={1} {...form.getInputProps('duration')} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select label="Duration Unit" data={DURATION_UNIT_OPTIONS} {...form.getInputProps('duration_unit')} />
                            </Grid.Col>
                        </Grid>
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
                                <TextInput label="Currency" {...form.getInputProps('currency')} />
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
                        <Button variant="light" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>Create Enquiry</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
