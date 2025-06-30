import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Divider, Box, Title, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { PurchaseIntent, Department } from '@/types/purchase';
import { useEffect } from 'react';
import { getCurrencyOptions, DEFAULT_CURRENCY } from '@/utils/currencies';

interface Props {
    opened: boolean;
    onClose: () => void;
    intent: PurchaseIntent;
    departments: Department[];
    loading: boolean;
}


const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export function EditItem({ opened, onClose, intent, departments, loading }: Props) {
    const form = useForm<Partial<PurchaseIntent>>({
        initialValues: {
            subject: '',
            description: '',
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
            priority: (value) => (!value ? 'Priority is required' : null),
            intent_date: (value) => (!value ? 'Intent date is required' : null),
            currency: (value) => (!value ? 'Currency is required' : null),
        },
    });

    // Initialize form with intent data when modal opens
    useEffect(() => {
        if (opened && intent) {
            form.setValues({
                subject: intent.subject,
                description: intent.description || '',
                priority: intent.priority,
                intent_date: intent.intent_date,
                required_date: intent.required_date || '',
                estimated_cost: intent.estimated_cost,
                currency: intent.currency,
                budget_details: intent.budget_details || '',
                justification: intent.justification || '',
                specifications: intent.specifications || '',
                terms_conditions: intent.terms_conditions || '',
                notes: intent.notes || '',
                department_id: intent.department_id
            });
        }
    }, [opened, intent]);

    const handleSubmit = (values: Partial<PurchaseIntent>) => {
        const payload = {
            subject: values.subject,
            description: values.description,
            priority: values.priority,
            intent_date: values.intent_date,
            required_date: values.required_date,
            estimated_cost: values.estimated_cost,
            currency: values.currency,
            budget_details: values.budget_details,
            justification: values.justification,
            specifications: values.specifications,
            terms_conditions: values.terms_conditions,
            notes: values.notes,
            department_id: values.department_id,
        };
        router.put(route('purchases.intents.update', intent.id), payload, {
            onSuccess: () => {
                notifications.show({ message: 'Purchase intent updated successfully', color: 'green' });
                onClose();
            },
            onError: () => {
                notifications.show({ message: 'Failed to update purchase intent', color: 'red' });
            }
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Edit Purchase Intent - ${intent.intent_no}`}
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
                                    onChange={(value) => form.setFieldValue('required_date', value ? format(value, 'yyyy-MM-dd') : '')}
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
                            Update Purchase Intent
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 