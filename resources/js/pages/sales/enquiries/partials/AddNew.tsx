import { Modal, Button, TextInput, Select, Textarea, Stack, Group, Grid, NumberInput, Divider, Title, Radio, LoadingOverlay } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { EnquiryType, EnquiryPriority, EnquirySource, NatureOfWork, DurationUnit } from '../types';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { DateInput } from '@mantine/dates';
import { AlertCircleIcon } from 'lucide-react';

interface Props {
    opened: boolean;
    onClose: () => void;
    clients: Array<{
        value: string;
        label: string;
        email?: string;
        contact?: string;
        state?: string;
    }>;
}

interface Equipment {
    value: string;
    label: string;
    model?: string;
    code?: string;
    make?: string;
}

interface State {
    value: string;
    label: string;
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

export function AddNew({ opened, onClose, clients }: Props) {
    const [states, setStates] = useState<State[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [contactPersons, setContactPersons] = useState<Array<{ value: string; label: string }>>([]);

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
                    setEquipment(response.data.data.map((item: any) => ({
                        value: item.id.toString(),
                        label: item.name,
                        model: item.model,
                        code: item.code,
                        make: item.make
                    })));
                }
            } catch (error) {
                console.error('Error loading equipment:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load equipment data',
                    color: 'red',
                    icon: <AlertCircleIcon size={16} />
                });
            } finally {
                setIsLoadingEquipment(false);
            }
        };

        loadEquipment();
    }, [opened]);

    // Load contact persons when client is selected
    useEffect(() => {
        const loadContactPersons = async () => {
            if (!selectedClient) {
                setContactPersons([]);
                return;
            }

            try {
                const response = await axios.get(route('api.clients.contacts', { clientId: selectedClient }));
                if (response.data.success) {
                    setContactPersons(response.data.data.map((contact: any) => ({
                        value: contact.id.toString(),
                        label: contact.name
                    })));
                }
            } catch (error) {
                console.error('Error loading contact persons:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load contact persons',
                    color: 'red',
                    icon: <AlertCircleIcon size={16} />
                });
            }
        };

        loadContactPersons();
    }, [selectedClient]);

    const form = useForm({
        initialValues: {
            // Client Information
            client_detail_id: '',
            contact_person_id: null as string | null,
            referred_by: null as string | null,

            // Basic Information
            subject: '',
            description: '',
            type: 'equipment' as EnquiryType,
            priority: 'medium' as EnquiryPriority,
            source: 'other' as EnquirySource,

            // Equipment Details
            equipment_id: null as string | null,
            quantity: 1,
            nature_of_work: 'other' as NatureOfWork,
            duration: null as number | null,
            duration_unit: 'days' as DurationUnit,

            // Location Details
            deployment_state: '',
            location: '',
            site_details: '',

            // Dates
            enquiry_date: new Date(),
            required_date: null as Date | null,
            valid_until: null as Date | null,

            // Financial Details
            estimated_value: null as number | null,
            currency: 'INR',

            // Additional Details
            special_requirements: '',
            terms_conditions: '',
            notes: '',
        },
        validate: {
            client_detail_id: (value) => (!value ? 'Client is required' : null),
            subject: (value) => (!value ? 'Subject is required' : null),
            description: (value) => (!value ? 'Description is required' : null),
            type: (value) => (!value ? 'Type is required' : null),
            priority: (value) => (!value ? 'Priority is required' : null),
            source: (value) => (!value ? 'Source is required' : null),
            enquiry_date: (value) => (!value ? 'Enquiry date is required' : null),
            required_date: (value, values) => {
                if (!value) return null;
                return value < values.enquiry_date ? 'Required date must be after enquiry date' : null;
            },
            valid_until: (value, values) => {
                if (!value) return null;
                return value < values.enquiry_date ? 'Valid until date must be after enquiry date' : null;
            },
            estimated_value: (value) => {
                if (!value) return null;
                return value < 0 ? 'Estimated value must be positive' : null;
            },
            quantity: (value) => {
                if (!value) return null;
                return value < 1 ? 'Quantity must be at least 1' : null;
            },
            duration: (value, values) => {
                if (!value) return null;
                if (values.duration_unit === 'hours' && value > 24) {
                    return 'Duration cannot exceed 24 hours';
                }
                return value < 1 ? 'Duration must be at least 1' : null;
            }
        },
    });

    const handleClientChange = (value: string | null) => {
        form.setFieldValue('client_detail_id', value || '');
        form.setFieldValue('contact_person_id', null);
        setSelectedClient(value);
    };

    const handleSubmit = async (values: typeof form.values, event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setIsSubmitting(true);

        try {
            // Format dates for API
            const formattedValues = {
                ...values,
                enquiry_date: values.enquiry_date?.toISOString().split('T')[0],
                required_date: values.required_date?.toISOString().split('T')[0] || null,
                valid_until: values.valid_until?.toISOString().split('T')[0] || null,
            };

            const response = await axios.post(route('sales.enquiries.store'), formattedValues);

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
            console.error('Error creating enquiry:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setFieldError(field, (messages as string[])[0]);
                });
                notifications.show({
                    title: 'Validation Error',
                    message: 'Please check the form for errors',
                    color: 'red',
                    icon: <AlertCircleIcon size={16} />
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to create enquiry',
                    color: 'red',
                    icon: <AlertCircleIcon size={16} />
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="New Enquiry"
            size="xl"
            styles={{
                title: { fontSize: '1.5rem', fontWeight: 600 },
            }}
            closeOnClickOutside={!isSubmitting}
            closeOnEscape={!isSubmitting}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg" pos="relative">
                    <LoadingOverlay visible={isSubmitting || isLoadingEquipment} />

                    {/* Client Information */}
                    <Stack gap="xs">
                        <Title order={4}>Client Information</Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Client"
                                    placeholder="Select client"
                                    data={clients}
                                    searchable
                                    required
                                    value={form.values.client_detail_id}
                                    onChange={handleClientChange}
                                    error={form.errors.client_detail_id}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Contact Person"
                                    placeholder="Select contact person"
                                    data={contactPersons}
                                    searchable
                                    clearable
                                    disabled={!selectedClient}
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
                                    error={form.errors.subject}
                                    {...form.getInputProps('subject')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Radio.Group
                                    label="Type"
                                    required
                                    error={form.errors.type}
                                    {...form.getInputProps('type')}
                                >
                                    <Group mt="xs">
                                        {TYPE_OPTIONS.map(option => (
                                            <Radio key={option.value} value={option.value} label={option.label} />
                                        ))}
                                    </Group>
                                </Radio.Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Radio.Group
                                    label="Priority"
                                    required
                                    error={form.errors.priority}
                                    {...form.getInputProps('priority')}
                                >
                                    <Group mt="xs">
                                        {PRIORITY_OPTIONS.map(option => (
                                            <Radio key={option.value} value={option.value} label={option.label} />
                                        ))}
                                    </Group>
                                </Radio.Group>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Select
                                    label="Source"
                                    placeholder="Select source"
                                    data={SOURCE_OPTIONS}
                                    required
                                    error={form.errors.source}
                                    {...form.getInputProps('source')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Description"
                                    placeholder="Enter description"
                                    required
                                    minRows={3}
                                    error={form.errors.description}
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
                                    data={equipment}
                                    searchable
                                    clearable
                                    disabled={isLoadingEquipment}
                                    {...form.getInputProps('equipment_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <NumberInput
                                    label="Quantity"
                                    placeholder="Enter quantity"
                                    min={1}
                                    error={form.errors.quantity}
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
                                    error={form.errors.duration}
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
                                    data={states}
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
                                    valueFormat="DD/MM/YYYY"
                                    error={form.errors.enquiry_date}
                                    {...form.getInputProps('enquiry_date')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <DateInput
                                    label="Required Date"
                                    placeholder="Select date"
                                    clearable
                                    valueFormat="DD/MM/YYYY"
                                    error={form.errors.required_date}
                                    {...form.getInputProps('required_date')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <DateInput
                                    label="Valid Until"
                                    placeholder="Select date"
                                    clearable
                                    valueFormat="DD/MM/YYYY"
                                    error={form.errors.valid_until}
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
                                    error={form.errors.estimated_value}
                                    {...form.getInputProps('estimated_value')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Currency"
                                    placeholder="Enter currency"
                                    defaultValue="INR"
                                    maxLength={3}
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
                            Create Enquiry
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 