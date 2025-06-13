import { Modal, Button, TextInput, Select, Textarea, Stack, Group, Grid, NumberInput, Divider, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { router } from '@inertiajs/react';
import { notifications } from '@mantine/notifications';
import { Enquiry, EnquiryType, EnquiryPriority, EnquirySource, NatureOfWork, DurationUnit } from '../types';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { DateInput } from '@mantine/dates';

interface Props {
    opened: boolean;
    onClose: () => void;
    enquiry: Enquiry | null;
    clients: Array<{ id: number; name: string }>;
}

interface State {
    code: string;
    name: string;
}

interface Equipment {
    id: number;
    name: string;
    model: string;
}

const PRIORITY_OPTIONS: { value: EnquiryPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const TYPE_OPTIONS: { value: EnquiryType; label: string }[] = [
    { value: 'equipment', label: 'Equipment' },
    { value: 'scaffolding', label: 'Scaffolding' },
    { value: 'both', label: 'Both' },
];

const SOURCE_OPTIONS: { value: EnquirySource; label: string }[] = [
    { value: 'website', label: 'Website' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'referral', label: 'Referral' },
    { value: 'walk_in', label: 'Walk In' },
    { value: 'other', label: 'Other' },
];

const NATURE_OF_WORK_OPTIONS: { value: NatureOfWork; label: string }[] = [
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

const DURATION_UNIT_OPTIONS: { value: DurationUnit; label: string }[] = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' },
];

export function EditItem({ opened, onClose, enquiry, clients }: Props) {
    const [states, setStates] = useState<State[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

    useEffect(() => {
        fetch('/assets/data/states.json')
            .then(response => response.json())
            .then(data => setStates(data.states))
            .catch(error => {
                console.error('Error loading states:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load states data',
                    color: 'red',
                });
            });
    }, []);

    useEffect(() => {
        const loadEquipment = async () => {
            if (!opened) return;
            
            setIsLoadingEquipment(true);
            try {
                const response = await axios.get(route('sales.enquiries.equipment'));
                if (response.data.success) {
                    setEquipment(response.data.data);
                }
            } catch (error) {
                console.error('Error loading equipment:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load equipment data',
                    color: 'red',
                });
            } finally {
                setIsLoadingEquipment(false);
            }
        };

        loadEquipment();
    }, [opened]);

    const form = useForm({
        initialValues: {
            // Client Information
            client_detail_id: enquiry?.client_detail_id.toString() || '',
            contact_person_id: enquiry?.contact_person_id?.toString() || null,
            referred_by: enquiry?.referred_by?.toString() || null,

            // Basic Information
            subject: enquiry?.subject || '',
            description: enquiry?.description || '',
            type: enquiry?.type || 'equipment',
            priority: enquiry?.priority || 'medium',
            source: enquiry?.source || 'other',

            // Equipment Details
            equipment_id: enquiry?.equipment_id?.toString() || null,
            quantity: enquiry?.quantity || 1,
            nature_of_work: enquiry?.nature_of_work || 'other',
            duration: enquiry?.duration || null,
            duration_unit: enquiry?.duration_unit || 'days',

            // Location Details
            deployment_state: enquiry?.deployment_state || '',
            location: enquiry?.location || '',
            site_details: enquiry?.site_details || '',

            // Dates
            enquiry_date: enquiry?.enquiry_date || new Date().toISOString().split('T')[0],
            required_date: enquiry?.required_date || null,
            valid_until: enquiry?.valid_until || null,

            // Financial Details
            estimated_value: enquiry?.estimated_value || null,
            currency: enquiry?.currency || 'INR',

            // Additional Details
            special_requirements: enquiry?.special_requirements || '',
            terms_conditions: enquiry?.terms_conditions || '',
            notes: enquiry?.notes || '',
        },
        validate: {
            client_detail_id: (value) => (!value ? 'Client is required' : null),
            subject: (value) => (!value ? 'Subject is required' : null),
            description: (value) => (!value ? 'Description is required' : null),
            type: (value) => (!value ? 'Type is required' : null),
            priority: (value) => (!value ? 'Priority is required' : null),
            source: (value) => (!value ? 'Source is required' : null),
            enquiry_date: (value) => (!value ? 'Enquiry date is required' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values, event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        if (!enquiry) return;
        
        setIsSubmitting(true);

        try {
            const response = await axios.put(route('sales.enquiries.update', enquiry.id), values);

            if (response.data.success) {
                notifications.show({
                    title: 'Success',
                    message: response.data.message,
                    color: 'green',
                });
                onClose();
                if (response.data.data.redirect_url) {
                    window.location.href = response.data.data.redirect_url;
                }
            }
        } catch (error: any) {
            console.error('Error updating enquiry:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setFieldError(field, (messages as string[])[0]);
                });
                notifications.show({
                    title: 'Validation Error',
                    message: 'Please check the form for errors',
                    color: 'red',
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to update enquiry',
                    color: 'red',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!enquiry) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit Enquiry"
            size="xl"
            styles={{
                title: { fontSize: '1.5rem', fontWeight: 600 },
            }}
            closeOnClickOutside={!isSubmitting}
            closeOnEscape={!isSubmitting}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                    {/* Client Information */}
                    <Stack gap="xs">
                        <Title order={4}>Client Information</Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Client"
                                    placeholder="Select client"
                                    data={clients?.map(client => ({
                                        value: client.id?.toString() || '',
                                        label: client.name || ''
                                    })).filter(item => item.value && item.label) || []}
                                    searchable
                                    required
                                    {...form.getInputProps('client_detail_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Contact Person"
                                    placeholder="Select contact person"
                                    data={[]} // This should be populated based on selected client
                                    searchable
                                    clearable
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
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Subject"
                                    placeholder="Enter subject"
                                    required
                                    {...form.getInputProps('subject')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Type"
                                    placeholder="Select type"
                                    data={TYPE_OPTIONS}
                                    required
                                    {...form.getInputProps('type')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Priority"
                                    placeholder="Select priority"
                                    data={PRIORITY_OPTIONS}
                                    required
                                    {...form.getInputProps('priority')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Source"
                                    placeholder="Select source"
                                    data={SOURCE_OPTIONS}
                                    required
                                    {...form.getInputProps('source')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Description"
                                    placeholder="Enter description"
                                    required
                                    minRows={3}
                                    {...form.getInputProps('description')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Equipment Details */}
                    <Stack gap="xs">
                        <Title order={4}>Equipment Details</Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Equipment"
                                    placeholder="Select equipment"
                                    data={equipment.map(eq => ({
                                        value: eq.id?.toString() || '',
                                        label: eq.name || ''
                                    }))}
                                    searchable
                                    clearable
                                    {...form.getInputProps('equipment_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <NumberInput
                                    label="Quantity"
                                    placeholder="Enter quantity"
                                    min={1}
                                    {...form.getInputProps('quantity')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Nature of Work"
                                    placeholder="Select nature of work"
                                    data={NATURE_OF_WORK_OPTIONS}
                                    {...form.getInputProps('nature_of_work')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 3 }}>
                                <NumberInput
                                    label="Duration"
                                    placeholder="Enter duration"
                                    min={1}
                                    {...form.getInputProps('duration')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 3 }}>
                                <Select
                                    label="Duration Unit"
                                    placeholder="Select unit"
                                    data={DURATION_UNIT_OPTIONS}
                                    {...form.getInputProps('duration_unit')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Location Details */}
                    <Stack gap="xs">
                        <Title order={4}>Location Details</Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="State"
                                    placeholder="Select state"
                                    data={states.map(state => ({
                                        value: state.code || '',
                                        label: state.name || ''
                                    }))}
                                    searchable
                                    {...form.getInputProps('deployment_state')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Location"
                                    placeholder="Enter location"
                                    {...form.getInputProps('location')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Site Details"
                                    placeholder="Enter site details"
                                    minRows={2}
                                    {...form.getInputProps('site_details')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Dates */}
                    <Stack gap="xs">
                        <Title order={4}>Dates</Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <DateInput
                                    label="Enquiry Date"
                                    placeholder="Select date"
                                    required
                                    valueFormat="YYYY-MM-DD"
                                    {...form.getInputProps('enquiry_date')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <DateInput
                                    label="Required Date"
                                    placeholder="Select date"
                                    clearable
                                    valueFormat="YYYY-MM-DD"
                                    {...form.getInputProps('required_date')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <DateInput
                                    label="Valid Until"
                                    placeholder="Select date"
                                    clearable
                                    valueFormat="YYYY-MM-DD"
                                    {...form.getInputProps('valid_until')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Financial Details */}
                    <Stack gap="xs">
                        <Title order={4}>Financial Details</Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <NumberInput
                                    label="Estimated Value"
                                    placeholder="Enter value"
                                    min={0}
                                    decimalScale={2}
                                    {...form.getInputProps('estimated_value')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Currency"
                                    placeholder="Enter currency"
                                    defaultValue="INR"
                                    {...form.getInputProps('currency')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Additional Details */}
                    <Stack gap="xs">
                        <Title order={4}>Additional Details</Title>
                        <Grid>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Special Requirements"
                                    placeholder="Enter special requirements"
                                    minRows={2}
                                    {...form.getInputProps('special_requirements')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Terms & Conditions"
                                    placeholder="Enter terms and conditions"
                                    minRows={2}
                                    {...form.getInputProps('terms_conditions')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Notes"
                                    placeholder="Enter notes"
                                    minRows={2}
                                    {...form.getInputProps('notes')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            Update Enquiry
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 