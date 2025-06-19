import { Modal, Button, TextInput, Select, Textarea, Stack, Group, Grid, NumberInput, Divider, Title, LoadingOverlay, Stepper, Paper, Text, Table } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { EnquiryType, EnquiryPriority, EnquirySource, NatureOfWork, DurationUnit } from '../types';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { DateInput } from '@mantine/dates';
import { AlertCircleIcon, User, Package, CheckCircle } from 'lucide-react';
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

interface EnquiryItem {
    equipment_id: number | null;
    quantity: number;
    estimated_value: number | null;
    duration: number | null;
    duration_unit: DurationUnit;
}

export function AddNew({ opened, onClose, clients }: Props) {
    const [active, setActive] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactPersons, setContactPersons] = useState<Array<{ id: number; name: string }>>([]);
    const [equipment, setEquipment] = useState<Array<{ id: number; name: string }>>([]);
    const [items, setItems] = useState<EnquiryItem[]>([]);
    const [currentItem, setCurrentItem] = useState<EnquiryItem>({
        equipment_id: null,
        quantity: 1,
        estimated_value: null,
        duration: null,
        duration_unit: 'days'
    });

    const form = useForm({
        initialValues: {
            client_detail_id: '',
            contact_person_id: null as number | null,
            subject: '',
            description: '',
            type: 'equipment' as EnquiryType,
            priority: 'medium' as EnquiryPriority,
            source: 'other' as EnquirySource,
            deployment_state: '',
            location: '',
            site_details: '',
            enquiry_date: new Date(),
            required_date: null as Date | null,
            valid_until: null as Date | null,
            currency: 'INR',
            next_follow_up_date: null as Date | null,
            follow_up_notes: '',
            special_requirements: '',
            terms_conditions: '',
            notes: '',
        },
        validate: {
            client_detail_id: (value) => (!value ? 'Client is required' : null),
            subject: (value) => (!value ? 'Subject is required' : null),
            description: (value) => (!value ? 'Description is required' : null),
            enquiry_date: (value) => (!value ? 'Enquiry date is required' : null),
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

    const nextStep = () => {
        if (active === 0) {
            const { hasErrors } = form.validate();
            if (hasErrors) return;
        }
        if (active === 1 && items.length === 0) {
            notifications.show({
                title: 'Error',
                message: 'Please add at least one item',
                color: 'red',
                icon: <AlertCircleIcon size={16} />
            });
            return;
        }
        setTimeout(() => {
            setActive((current) => (current < 3 ? current + 1 : current));
        }, 100);
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

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
        setItems([...items, currentItem]);
        setCurrentItem({
            equipment_id: null,
            quantity: 1,
            estimated_value: null,
            duration: null,
            duration_unit: 'days'
        });
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        
        // Only validate the main form fields, not the item inputs
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

        setIsSubmitting(true);

        try {
            const formattedValues = {
                ...form.values,
                items: items.map(item => ({
                    equipment_id: item.equipment_id,
                    quantity: item.quantity,
                    duration: item.duration,
                    duration_unit: item.duration_unit,
                    estimated_value: item.estimated_value,
                    notes: '' // Optional field
                })),
                enquiry_date: form.values.enquiry_date ? new Date(form.values.enquiry_date).toISOString().split('T')[0] : null,
                required_date: form.values.required_date ? new Date(form.values.required_date).toISOString().split('T')[0] : null,
                valid_until: form.values.valid_until ? new Date(form.values.valid_until).toISOString().split('T')[0] : null,
                next_follow_up_date: form.values.next_follow_up_date ? new Date(form.values.next_follow_up_date).toISOString().split('T')[0] : null,
                status: 'draft', // Initial status
                approval_status: 'not_required' // Initial approval status
            };

            const response = await axios.post('/sales/enquiries', formattedValues);
            if (response.data.success) {
                notifications.show({ title: 'Success', message: response.data.message, color: 'green' });
                onClose();
            }
        } catch (error: any) {
            console.error('Error creating enquiry:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                Object.entries(errors).forEach(([field, messages]) => {
                    form.setFieldError(field, (messages as string[])[0]);
                });
            }
            notifications.show({ 
                title: 'Error', 
                message: error.response?.data?.message || 'Failed to create enquiry', 
                color: 'red', 
                icon: <AlertCircleIcon size={16} /> 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="New Enquiry" size="90%">
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    <LoadingOverlay visible={isSubmitting} />

                    <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
                        <Stepper.Step label="Basic Information" icon={<User size={18} />}>
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

                                <Title order={4} mt="md">Enquiry Details</Title>
                        <Grid>
                                    <Grid.Col span={3}>
                                <TextInput label="Subject" required {...form.getInputProps('subject')} />
                            </Grid.Col>
                                    <Grid.Col span={3}>
                                <Select label="Type" data={TYPE_OPTIONS} required {...form.getInputProps('type')} />
                            </Grid.Col>
                                    <Grid.Col span={3}>
                                <Select label="Priority" data={PRIORITY_OPTIONS} required {...form.getInputProps('priority')} />
                            </Grid.Col>
                                    <Grid.Col span={3}>
                                <Select label="Source" data={SOURCE_OPTIONS} required {...form.getInputProps('source')} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Description" required {...form.getInputProps('description')} />
                            </Grid.Col>
                        </Grid>

                                <Title order={4} mt="md">Location Details</Title>
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

                                <Title order={4} mt="md">Dates</Title>
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
                        </Stepper.Step>

                        <Stepper.Step label="Items" icon={<Package size={18} />}>
                            <Stack gap="xs">
                                <Title order={4}>Add New Item</Title>
                                <Paper p="md" withBorder>
                                    <Grid>
                                        <Grid.Col span={4}>
                                            <Select
                                                label="Equipment"
                                                data={equipment.map(eq => ({ value: eq.id.toString(), label: eq.name }))}
                                                value={currentItem.equipment_id?.toString()}
                                                onChange={(value) => setCurrentItem({ ...currentItem, equipment_id: value ? parseInt(value) : null })}
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
                                            <Group justify="flex-end" h="100%" align="flex-end">
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
                        </Stepper.Step>

                        <Stepper.Step label="Confirmation" icon={<CheckCircle size={18} />}>
                    <Stack gap="xs">
                                <Title order={4}>Review Details</Title>

                                <Paper p="md" withBorder>
                                    <Title order={5}>Client Information</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                            <Text fw={500}>Client:</Text>
                                            <Text>{clients.find(c => c.id.toString() === form.values.client_detail_id)?.name}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text fw={500}>Contact Person:</Text>
                                            <Text>{contactPersons.find(c => c.id === form.values.contact_person_id)?.name}</Text>
                            </Grid.Col>
                        </Grid>
                                </Paper>

                                <Paper p="md" withBorder>
                                    <Title order={5}>Enquiry Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                            <Text fw={500}>Subject:</Text>
                                            <Text>{form.values.subject}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text fw={500}>Type:</Text>
                                            <Text>{form.values.type}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text fw={500}>Priority:</Text>
                                            <Text>{form.values.priority}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                            <Text fw={500}>Source:</Text>
                                            <Text>{form.values.source}</Text>
                            </Grid.Col>
                        </Grid>
                                </Paper>

                                <Paper p="md" withBorder>
                                    <Title order={5}>Items</Title>
                                    {items.map((item, index) => (
                                        <Paper key={index} p="xs" withBorder mb="xs">
                        <Grid>
                                                <Grid.Col span={6}>
                                                    <Text fw={500}>Equipment:</Text>
                                                    <Text>{equipment.find(e => e.id === item.equipment_id)?.name}</Text>
                            </Grid.Col>
                                                <Grid.Col span={6}>
                                                    <Text fw={500}>Quantity:</Text>
                                                    <Text>{item.quantity}</Text>
                            </Grid.Col>
                                            
                                                <Grid.Col span={6}>
                                                    <Text fw={500}>Estimated Value:</Text>
                                                    <Text>{item.estimated_value}</Text>
                            </Grid.Col>
                        </Grid>
                                        </Paper>
                                    ))}
                                </Paper>

                                <Text c="dimmed" size="sm" ta="center" mt="md">
                                    Please review all the details before submitting. Once submitted, the enquiry will be created and cannot be modified.
                                </Text>
                    </Stack>
                        </Stepper.Step>
                    </Stepper>

                    <Group justify="flex-end" mt="xl">
                        {active > 0 && (
                            <Button variant="default" onClick={prevStep} type="button">
                                Back
                            </Button>
                        )}
                        {active < 2 ? (
                            <Button onClick={nextStep} type="button">Next step</Button>
                        ) : (
                            <Button type="submit" loading={isSubmitting}>Submit Enquiry</Button>
                        )}
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
