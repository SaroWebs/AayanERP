import { Modal, Button, TextInput, Select, Textarea, Stack, Group, Grid, NumberInput, Divider, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { router } from '@inertiajs/react';
import { notifications } from '@mantine/notifications';
import { FormValues } from '../types';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
    opened: boolean;
    onClose: () => void;
    clients: Array<{ id: number; name: string }>;
}

interface State {
    code: string;
    name: string;
}

interface Equipment {
    value: string;
    label: string;
    model: string;
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

export function AddNew({ opened, onClose, clients }: Props) {
    const [states, setStates] = useState<State[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

    useEffect(() => {
        // Load states data when component mounts
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

    const form = useForm<FormValues>({
        initialValues: {
            // Client Information
            client_detail_id: "0",
            contact_person_id: null,
            referred_by: null,

            // Basic Information
            subject: '',
            description: '',
            type: 'equipment',
            priority: 'medium',
            source: 'other',

            // Equipment Details
            equipment_id: null,
            quantity: 1,
            nature_of_work: 'other',
            duration: null,
            duration_unit: 'days',

            // Location Details
            deployment_state: '',
            location: '',
            site_details: '',

            // Dates
            enquiry_date: new Date(),
            required_date: null,
            valid_until: null,

            // Financial Details
            estimated_value: null,
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
        },
    });

    const handleSubmit = async (values: FormValues, event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (value instanceof Date) {
                        formData.append(key, value.toISOString());
                    } else {
                        formData.append(key, value.toString());
                    }
                }
            });

            const response = await axios.post(route('sales.enquiries.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (response.data.success) {
                notifications.show({
                    title: 'Success',
                    message: response.data.message,
                    color: 'green',
                });

                // Close the modal
                onClose();

                // Redirect to the enquiry details page
                if (response.data.data.redirect_url) {
                    window.location.href = response.data.data.redirect_url;
                }
            }
        } catch (error: any) {
            console.error('Error creating enquiry:', error);

            // Handle validation errors
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
                // Handle other errors
                notifications.show({
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to create enquiry',
                    color: 'red',
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
            size="100%"
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
                            <Grid.Col span={{ base: 12, md: 4 }}>
                                <Select
                                    label="Client"
                                    placeholder="Select client"
                                    data={clients?.map(client => ({ value: client.id.toString(), label: client.name })) || []}
                                    searchable
                                    required
                                    {...form.getInputProps('client_detail_id')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>

                    <Divider />

                    {/* Basic Information */}
                    <Stack gap="xs">
                        <Title order={4}>Basic Information</Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 3 }}>
                                <TextInput
                                    label="Subject"
                                    placeholder="Enter subject"
                                    required
                                    {...form.getInputProps('subject')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 3 }}>
                                <Select
                                    label="Type"
                                    placeholder="Select type"
                                    data={TYPE_OPTIONS}
                                    required
                                    {...form.getInputProps('type')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 3 }}>
                                <Select
                                    label="Priority"
                                    placeholder="Select priority"
                                    data={PRIORITY_OPTIONS}
                                    required
                                    {...form.getInputProps('priority')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 3 }}>
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
                                    minRows={3}
                                    required
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
                            <Grid.Col span={{ base: 12, md: 3 }}>
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
                            <Grid.Col span={{ base: 12, md: 2 }}>
                                <NumberInput
                                    label="Quantity"
                                    placeholder="Enter quantity"
                                    min={1}
                                    {...form.getInputProps('quantity')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 3 }}>
                                <Select
                                    label="Nature of Work"
                                    placeholder="Select nature of work"
                                    data={[
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
                                    ]}
                                    {...form.getInputProps('nature_of_work')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 2 }}>
                                <NumberInput
                                    label="Duration"
                                    placeholder="Enter duration"
                                    min={1}
                                    {...form.getInputProps('duration')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 2 }}>
                                <Select
                                    label="Duration Unit"
                                    placeholder="Select unit"
                                    data={[
                                        { value: 'hours', label: 'Hours' },
                                        { value: 'days', label: 'Days' },
                                        { value: 'months', label: 'Months' },
                                        { value: 'years', label: 'Years' },
                                    ]}
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
                                    label="Deployment State"
                                    placeholder="Select state"
                                    data={states.map(state => ({
                                        value: state.code,
                                        label: state.name
                                    }))}
                                    searchable
                                    clearable
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

                    <Group justify="flex-end" mt="md">
                        <Button 
                            variant="light" 
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            loading={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Enquiry'}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 