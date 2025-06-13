import { Modal, Stack, TextInput, Select, NumberInput, Textarea, Group, Button, Grid } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { Enquiry } from './types';
import { format, addDays } from 'date-fns';
import { DateInput } from '@mantine/dates';

interface PrepareQuotationModalProps {
    opened: boolean;
    onClose: () => void;
    enquiry: Enquiry;
    onSuccess?: () => void;
}

interface QuotationFormData {
    subject: string;
    description: string | null;
    type: 'equipment' | 'scaffolding' | 'both';
    quotation_date: string;
    valid_until: string;
    currency: string;
    payment_terms_days: number;
    advance_percentage: number;
    payment_terms: string | null;
    delivery_terms: string | null;
    equipment_id: number | null;
    quantity: number;
    unit_price: number;
    rental_period_unit: 'hours' | 'days' | 'months' | 'years';
    rental_period: number | null;
    deployment_state: string | null;
    location: string | null;
    site_details: string | null;
    special_conditions: string | null;
    terms_conditions: string | null;
    notes: string | null;
}

export function PrepareQuotationModal({ opened, onClose, enquiry, onSuccess }: PrepareQuotationModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<QuotationFormData>({
        initialValues: {
            subject: enquiry.subject || '',
            description: enquiry.description,
            type: enquiry.type,
            quotation_date: format(new Date(), 'yyyy-MM-dd'),
            valid_until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            currency: enquiry.currency,
            payment_terms_days: 30,
            advance_percentage: 0,
            payment_terms: null,
            delivery_terms: null,
            equipment_id: enquiry.equipment_id,
            quantity: enquiry.quantity || 1,
            unit_price: 0,
            rental_period_unit: 'days',
            rental_period: enquiry.duration,
            deployment_state: enquiry.deployment_state,
            location: enquiry.location,
            site_details: enquiry.site_details,
            special_conditions: enquiry.special_requirements,
            terms_conditions: enquiry.terms_conditions,
            notes: enquiry.notes
        }
    });

    const createQuotationMutation = useMutation({
        mutationFn: async (data: QuotationFormData) => {
            const response = await axios.post(`/sales/enquiries/${enquiry.id}/convert`, data);
            return response.data;
        },
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Quotation created successfully',
                color: 'green'
            });
            queryClient.invalidateQueries({ queryKey: ['enquiries'] });
            onSuccess?.();
            onClose();
        },
        onError: (error) => {
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to create quotation',
                color: 'red'
            });
        }
    });

    const handleSubmit = (values: QuotationFormData) => {
        createQuotationMutation.mutate(values);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Prepare Quotation"
            size="xl"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Grid>
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
                                label="Type"
                                placeholder="Select type"
                                data={[
                                    { value: 'equipment', label: 'Equipment' },
                                    { value: 'scaffolding', label: 'Scaffolding' },
                                    { value: 'both', label: 'Both' }
                                ]}
                                {...form.getInputProps('type')}
                                required
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
                                required
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <DateInput
                                label="Quotation Date"
                                placeholder="Select date"
                                valueFormat="YYYY-MM-DD"
                                {...form.getInputProps('quotation_date')}
                                required
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <DateInput
                                label="Valid Until"
                                placeholder="Select date"
                                valueFormat="YYYY-MM-DD"
                                {...form.getInputProps('valid_until')}
                                required
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <NumberInput
                                label="Payment Terms (Days)"
                                placeholder="Enter days"
                                min={0}
                                {...form.getInputProps('payment_terms_days')}
                                required
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <NumberInput
                                label="Advance Payment (%)"
                                placeholder="Enter percentage"
                                min={0}
                                max={100}
                                {...form.getInputProps('advance_percentage')}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea
                                label="Payment Terms"
                                placeholder="Enter payment terms"
                                {...form.getInputProps('payment_terms')}
                                minRows={2}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea
                                label="Delivery Terms"
                                placeholder="Enter delivery terms"
                                {...form.getInputProps('delivery_terms')}
                                minRows={2}
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <NumberInput
                                label="Quantity"
                                placeholder="Enter quantity"
                                min={1}
                                {...form.getInputProps('quantity')}
                                required
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <NumberInput
                                label="Unit Price"
                                placeholder="Enter unit price"
                                min={0}
                                decimalScale={2}
                                {...form.getInputProps('unit_price')}
                                required
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Select
                                label="Rental Period Unit"
                                placeholder="Select unit"
                                data={[
                                    { value: 'hours', label: 'Hours' },
                                    { value: 'days', label: 'Days' },
                                    { value: 'months', label: 'Months' },
                                    { value: 'years', label: 'Years' }
                                ]}
                                {...form.getInputProps('rental_period_unit')}
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <NumberInput
                                label="Rental Period"
                                placeholder="Enter period"
                                min={1}
                                {...form.getInputProps('rental_period')}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <TextInput
                                label="Deployment State"
                                placeholder="Enter state"
                                {...form.getInputProps('deployment_state')}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
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
                                {...form.getInputProps('site_details')}
                                minRows={2}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea
                                label="Special Conditions"
                                placeholder="Enter special conditions"
                                {...form.getInputProps('special_conditions')}
                                minRows={2}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea
                                label="Terms & Conditions"
                                placeholder="Enter terms and conditions"
                                {...form.getInputProps('terms_conditions')}
                                minRows={2}
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea
                                label="Notes"
                                placeholder="Enter notes"
                                {...form.getInputProps('notes')}
                                minRows={2}
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={createQuotationMutation.isPending}>
                            Create Quotation
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 