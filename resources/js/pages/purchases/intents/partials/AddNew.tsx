import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Divider, Box, Title, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { PurchaseIntent, Department } from '@/types/purchase';
import { getCurrencyOptions, DEFAULT_CURRENCY } from '@/utils/currencies';

interface Props {
    opened: boolean;
    onClose: () => void;
    departments: Department[];
    loading: boolean;
}

const TYPE_OPTIONS = [
    { value: 'equipment', label: 'Equipment' },
    { value: 'materials', label: 'Materials' },
    { value: 'services', label: 'Services' },
    { value: 'software', label: 'Software' },
    { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export function AddNew({ opened, onClose, departments, loading }: Props) {
    const form = useForm<Partial<PurchaseIntent>>({
        initialValues: {
            subject: '',
            description: '',
            type: 'equipment',
            priority: 'medium',
            intent_date: format(new Date(), 'yyyy-MM-dd'),
            required_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            estimated_cost: null,
            currency: DEFAULT_CURRENCY,
            budget_details: '',
            justification: '',
            specifications: '',
            terms_conditions: '',
            notes: '',
            department_id: null
        },
        validate: {
            subject: (value) => (!value ? 'Subject is required' : null),
            type: (value) => (!value ? 'Type is required' : null),
            priority: (value) => (!value ? 'Priority is required' : null),
            intent_date: (value) => (!value ? 'Intent date is required' : null),
            currency: (value) => (!value ? 'Currency is required' : null),
        },
    });

    const handleSubmit = (values: Partial<PurchaseIntent>) => {
        router.post(route('purchases.intents.store'), values, {
            onSuccess: () => {
                notifications.show({ message: 'Purchase intent created successfully', color: 'green' });
                onClose();
                form.reset();
            },
            onError: (errors) => {
                notifications.show({ message: 'Failed to create purchase intent', color: 'red' });
            }
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Create New Purchase Intent"
            size="xl"
            closeOnClickOutside={false}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                    {/* Basic Information */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Basic Information</Title>
                        <Grid>
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Subject"
                                    placeholder="Enter intent subject"
                                    value={form.values.subject || ''}
                                    onChange={(e) => form.setFieldValue('subject', e.target.value)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Description"
                                    placeholder="Enter detailed description"
                                    value={form.values.description || ''}
                                    onChange={(e) => form.setFieldValue('description', e.target.value)}
                                    rows={3}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Type"
                                    placeholder="Select type"
                                    data={TYPE_OPTIONS}
                                    value={form.values.type || ''}
                                    onChange={(value) => form.setFieldValue('type', value as PurchaseIntent['type'] || 'equipment')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Priority"
                                    placeholder="Select priority"
                                    data={PRIORITY_OPTIONS}
                                    value={form.values.priority || ''}
                                    onChange={(value) => form.setFieldValue('priority', value as PurchaseIntent['priority'] || 'medium')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Department"
                                    placeholder="Select department"
                                    data={departments.map(dept => ({
                                        value: dept.id.toString(),
                                        label: dept.name
                                    }))}
                                    value={form.values.department_id?.toString() || ''}
                                    onChange={(value) => form.setFieldValue('department_id', value ? Number(value) : null)}
                                    clearable
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateInput
                                    label="Intent Date"
                                    placeholder="Select date"
                                    value={form.values.intent_date ? new Date(form.values.intent_date) : null}
                                    onChange={(value) => form.setFieldValue('intent_date', value ? format(value, 'yyyy-MM-dd') : '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateInput
                                    label="Required Date"
                                    placeholder="Select date"
                                    value={form.values.required_date ? new Date(form.values.required_date) : null}
                                    onChange={(value) => form.setFieldValue('required_date', value ? format(value, 'yyyy-MM-dd') : null)}
                                    clearable
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Financial Details */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Financial Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Estimated Cost"
                                    placeholder="Enter estimated cost"
                                    value={form.values.estimated_cost || undefined}
                                    onChange={(value) => form.setFieldValue('estimated_cost', typeof value === 'number' ? value : null)}
                                    min={0}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Currency"
                                    placeholder="Select currency"
                                    data={getCurrencyOptions()}
                                    value={form.values.currency || DEFAULT_CURRENCY}
                                    onChange={(value) => form.setFieldValue('currency', value || DEFAULT_CURRENCY)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Budget Details"
                                    placeholder="Enter budget details and constraints"
                                    value={form.values.budget_details || ''}
                                    onChange={(e) => form.setFieldValue('budget_details', e.target.value)}
                                    rows={3}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Justification */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Justification</Title>
                        <Textarea
                            label="Justification"
                            placeholder="Explain why this purchase is needed"
                            value={form.values.justification || ''}
                            onChange={(e) => form.setFieldValue('justification', e.target.value)}
                            rows={4}
                        />
                    </Paper>

                    {/* Specifications */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Specifications</Title>
                        <Textarea
                            label="Technical Specifications"
                            placeholder="Enter technical specifications and requirements"
                            value={form.values.specifications || ''}
                            onChange={(e) => form.setFieldValue('specifications', e.target.value)}
                            rows={4}
                        />
                    </Paper>

                    {/* Terms and Conditions */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Terms and Conditions</Title>
                        <Textarea
                            label="Terms and Conditions"
                            placeholder="Enter any specific terms and conditions"
                            value={form.values.terms_conditions || ''}
                            onChange={(e) => form.setFieldValue('terms_conditions', e.target.value)}
                            rows={3}
                        />
                    </Paper>

                    {/* Additional Notes */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Additional Notes</Title>
                        <Textarea
                            label="Notes"
                            placeholder="Enter any additional notes or comments"
                            value={form.values.notes || ''}
                            onChange={(e) => form.setFieldValue('notes', e.target.value)}
                            rows={3}
                        />
                    </Paper>

                    {/* Actions */}
                    <Group justify="flex-end" gap="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Create Purchase Intent
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 