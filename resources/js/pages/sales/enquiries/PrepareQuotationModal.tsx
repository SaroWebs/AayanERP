import { Modal, Stack, TextInput, Select, NumberInput, Textarea, Group, Button, Grid, Text, Paper, Divider, Box, Title, Table } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { Enquiry } from './types';
import { format, addDays } from 'date-fns';
import { DateInput } from '@mantine/dates';
import { QuotationFormData, QuotationCurrency } from '@/types/quotation';
import { useEffect, useState } from 'react';
import { ClientContactDetail, ClientDetail } from '@/types/client';

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
    { value: 'other', label: 'Other' }
];

interface PrepareQuotationModalProps {
    opened: boolean;
    onClose: () => void;
    enquiry: Enquiry;
    onSuccess?: () => void;
}

export function PrepareQuotationModal({ opened, onClose, enquiry, onSuccess }: PrepareQuotationModalProps) {
    const queryClient = useQueryClient();
    const [client, setClient] = useState<ClientDetail | null>(null);
    const [contactPerson, setContactPerson] = useState<ClientContactDetail | null>(null);

    useEffect(() => {
        if (enquiry.client_detail_id) {
            axios.get(`/data/clients/${enquiry.client_detail_id}`).then(({ data }) => {
                setClient(data);
            });
        }
        if (enquiry.contact_person_id) {
            axios.get(`/data/clients/${enquiry.client_detail_id}/contacts/${enquiry.contact_person_id}`).then(({ data }) => {
                setContactPerson(data);
            });
        }
    }, [enquiry]);

    const form = useForm<QuotationFormData>({
        initialValues: {
            client_detail_id: enquiry.client_detail_id,
            contact_person_id: enquiry.contact_person_id,
            subject: enquiry.subject || '',
            description: enquiry.description,
            type: enquiry.type,
            quotation_date: format(new Date(), 'yyyy-MM-dd'),
            valid_until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            currency: enquiry.currency as QuotationCurrency,
            payment_terms_days: 30,
            advance_percentage: 0,
            payment_terms: null,
            delivery_terms: null,
            deployment_state: enquiry.deployment_state,
            location: enquiry.location,
            site_details: enquiry.site_details,
            special_conditions: enquiry.special_requirements,
            terms_conditions: enquiry.terms_conditions,
            notes: enquiry.notes,
            tax_percentage: 0,
            discount_percentage: 0,
            client_remarks: null,
            status: 'draft',
            approval_status: 'not_required',
            subtotal: 0,
            tax_amount: 0,
            discount_amount: 0,
            total_amount: 0,
            approved_by: null,
            approved_at: null,
            approval_remarks: null,
            accepted_date: null,
            converted_date: null,
            document_path: null,
            sent_at: null,
            sent_by: null,
            sent_via: null,
            enquiry_id: enquiry.id,
            items: enquiry.items?.map(item => ({
                id: 0,
                quotation_id: 0,
                equipment_id: item.equipment_id,
                quantity: item.quantity,
                nature_of_work: item.nature_of_work,
                unit_price: item.estimated_value || 0,
                total_price: (item.estimated_value || 0) * item.quantity,
                rental_period_unit: item.duration_unit || 'days',
                rental_period: item.duration || 0,
                notes: item.notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
            })) || []
        },
        validate: {
            subject: (value) => (!value ? 'Subject is required' : null),
            type: (value) => (!value ? 'Type is required' : null),
            quotation_date: (value) => (!value ? 'Quotation date is required' : null),
            valid_until: (value) => (!value ? 'Valid until date is required' : null),
            currency: (value) => (!value ? 'Currency is required' : null),
            payment_terms_days: (value) => (value < 0 ? 'Payment terms days cannot be negative' : null),
            advance_percentage: (value) => (value < 0 || value > 100 ? 'Advance percentage must be between 0 and 100' : null),
            tax_percentage: (value) => (value < 0 || value > 100 ? 'Tax percentage must be between 0 and 100' : null),
            discount_percentage: (value) => (value < 0 || value > 100 ? 'Discount percentage must be between 0 and 100' : null)
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
        const subtotal = calculateSubtotal();
        const taxAmount = calculateTaxAmount();
        const discountAmount = calculateDiscountAmount();
        const totalAmount = calculateTotalAmount();

        const submissionData = {
            ...values,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount
        };

        createQuotationMutation.mutate(submissionData);
    };

    const calculateSubtotal = () => {
        return (form.values.items || []).reduce((total, item) => {
            return total + (item.quantity * item.unit_price);
        }, 0);
    };

    const calculateTaxAmount = () => {
        const subtotal = calculateSubtotal();
        return (subtotal * form.values.tax_percentage) / 100;
    };

    const calculateDiscountAmount = () => {
        const subtotal = calculateSubtotal();
        return (subtotal * form.values.discount_percentage) / 100;
    };

    const calculateTotalAmount = () => {
        const subtotal = calculateSubtotal();
        const taxAmount = calculateTaxAmount();
        const discountAmount = calculateDiscountAmount();
        return subtotal + taxAmount - discountAmount;
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const items = [...(form.values.items || [])];
        items[index] = {
            ...items[index],
            [field]: value,
            total_price: field === 'quantity' || field === 'unit_price' 
                ? (field === 'quantity' ? value : items[index].quantity) * (field === 'unit_price' ? value : items[index].unit_price)
                : items[index].total_price
        };
        form.setFieldValue('items', items);
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Prepare Quotation"
            size="100%"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    {/* Document Header */}
                    <Box mb="xl">
                        <Text size="xl" fw={700} ta="center" mb="md">QUOTATION</Text>
                        <Text size="sm" c="dimmed" ta="center">Document Reference: QT-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</Text>
                    </Box>

                    {/* Client Details Section */}
                    <Stack gap="2rem">
                        {/* Company Details */}
                        {client && (
                            <Box>
                                <Text size="sm" fw={600} mb="xs" c="dark.4">COMPANY DETAILS</Text>
                                <Divider mb="md" />
                                <Grid>
                                    <Grid.Col span={12}>
                                        <Text size="sm" c="dimmed">Company Name</Text>
                                        <Text fw={500} size="md">{client.name}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <Text size="sm" c="dimmed">Registered Address</Text>
                                        <Text>{client.address}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">GSTIN</Text>
                                        <Text>{client.gstin_no}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">PAN</Text>
                                        <Text>{client.pan_no}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Email</Text>
                                        <Text>{client.email}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Phone</Text>
                                        <Text>{client.contact_no}</Text>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        )}

                        {/* Contact Person Details */}
                        {contactPerson && (
                            <Box>
                                <Text size="sm" fw={600} mb="xs" c="dark.4">CONTACT PERSON</Text>
                                <Divider mb="md" />
                                <Grid>
                                    <Grid.Col span={12}>
                                        <Text size="sm" c="dimmed">Name</Text>
                                        <Text fw={500} size="md">{contactPerson.contact_person}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Department</Text>
                                        <Text>{contactPerson.department}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Designation</Text>
                                        <Text>{contactPerson.designation}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Email</Text>
                                        <Text>{contactPerson.email}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Phone</Text>
                                        <Text>{contactPerson.phone}</Text>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        )}

                        {/* Quotation Details Header */}
                        <Box>
                            <Text size="sm" fw={600} mb="xs" c="dark.4">QUOTATION DETAILS</Text>
                            <Divider mb="md" />
                        </Box>
                    </Stack>

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

                        {/* Equipment Items */}
                        <Grid.Col span={12}>
                            <Paper withBorder p="md">
                                <Text size="sm" fw={600} mb="xs" c="dark.4">QUOTATION ITEMS</Text>
                                <Divider mb="md" />
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Equipment</Table.Th>
                                            <Table.Th>Quantity</Table.Th>
                                            <Table.Th>Unit Price</Table.Th>
                                            <Table.Th>Total Price</Table.Th>
                                            <Table.Th>Rental Period</Table.Th>
                                            <Table.Th>Notes</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {form.values.items.map((item, index) => (
                                            <Table.Tr key={index}>
                                                <Table.Td>
                                                    <Select
                                                        placeholder="Select equipment"
                                                        data={enquiry.items?.map(i => ({
                                                            value: i.equipment_id?.toString(),
                                                            label: i.equipment?.name || 'Unknown'
                                                        })) || []}
                                                        value={item.equipment_id?.toString()}
                                                        onChange={(value) => handleItemChange(index, 'equipment_id', parseInt(value || '0'))}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <NumberInput
                                                        placeholder="Quantity"
                                                        value={item.quantity}
                                                        onChange={(value) => handleItemChange(index, 'quantity', value)}
                                                        min={1}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <NumberInput
                                                        placeholder="Unit Price"
                                                        value={item.unit_price}
                                                        onChange={(value) => handleItemChange(index, 'unit_price', value)}
                                                        min={0}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    {form.values.currency} {item.total_price.toFixed(2)}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        <NumberInput
                                                            placeholder="Period"
                                                            value={item.rental_period}
                                                            onChange={(value) => handleItemChange(index, 'rental_period', value)}
                                                            min={1}
                                                            style={{ width: '100px' }}
                                                        />
                                                        <Select
                                                            placeholder="Unit"
                                                            data={[
                                                                { value: 'hours', label: 'Hours' },
                                                                { value: 'days', label: 'Days' },
                                                                { value: 'months', label: 'Months' },
                                                                { value: 'years', label: 'Years' }
                                                            ]}
                                                            value={item.rental_period_unit}
                                                            onChange={(value) => handleItemChange(index, 'rental_period_unit', value)}
                                                            style={{ width: '100px' }}
                                                        />
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Textarea
                                                        placeholder="Notes"
                                                        value={item.notes || ''}
                                                        onChange={(event) => handleItemChange(index, 'notes', event.currentTarget.value)}
                                                        minRows={1}
                                                    />
                                                </Table.Td>
                                                <Table.Td>
                                                    <Button
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => {
                                                            const newItems = [...form.values.items];
                                                            newItems.splice(index, 1);
                                                            form.setFieldValue('items', newItems);
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                                <Button
                                    variant="light"
                                    onClick={() => {
                                        form.setFieldValue('items', [
                                            ...form.values.items,
                                            {
                                                id: 0,
                                                quotation_id: 0,
                                                equipment_id: 0,
                                                quantity: 1,
                                                nature_of_work: 'other',
                                                unit_price: 0,
                                                total_price: 0,
                                                rental_period_unit: 'days',
                                                rental_period: 0,
                                                notes: null,
                                                created_at: new Date().toISOString(),
                                                updated_at: new Date().toISOString(),
                                                deleted_at: null
                                            }
                                        ]);
                                    }}
                                    mt="md"
                                >
                                    Add Item
                                </Button>
                            </Paper>
                        </Grid.Col>

                        {/* Financial Summary */}
                        <Grid.Col span={12}>
                            <Paper withBorder p="md">
                                <Text size="sm" fw={600} mb="xs" c="dark.4">FINANCIAL SUMMARY</Text>
                                <Divider mb="md" />
                                <Grid>
                                    <Grid.Col span={6}>
                                        <NumberInput
                                            label="Tax Percentage"
                                            placeholder="Enter tax percentage"
                                            min={0}
                                            max={100}
                                            decimalScale={2}
                                            {...form.getInputProps('tax_percentage')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <NumberInput
                                            label="Discount Percentage"
                                            placeholder="Enter discount percentage"
                                            min={0}
                                            max={100}
                                            decimalScale={2}
                                            {...form.getInputProps('discount_percentage')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <Table>
                                            <Table.Tbody>
                                                <Table.Tr>
                                                    <Table.Td>Subtotal</Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }}>
                                                        {form.values.currency} {calculateSubtotal().toFixed(2)}
                                                    </Table.Td>
                                                </Table.Tr>
                                                <Table.Tr>
                                                    <Table.Td>Tax Amount</Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }}>
                                                        {form.values.currency} {calculateTaxAmount().toFixed(2)}
                                                    </Table.Td>
                                                </Table.Tr>
                                                <Table.Tr>
                                                    <Table.Td>Discount Amount</Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }}>
                                                        {form.values.currency} {calculateDiscountAmount().toFixed(2)}
                                                    </Table.Td>
                                                </Table.Tr>
                                                <Table.Tr>
                                                    <Table.Td fw={700}>Total Amount</Table.Td>
                                                    <Table.Td fw={700} style={{ textAlign: 'right' }}>
                                                        {form.values.currency} {calculateTotalAmount().toFixed(2)}
                                                    </Table.Td>
                                                </Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Grid.Col>
                                </Grid>
                            </Paper>
                        </Grid.Col>

                        {/* Additional Information */}
                        <Grid.Col span={12}>
                            <Paper withBorder p="md">
                                <Text size="sm" fw={600} mb="xs" c="dark.4">ADDITIONAL INFORMATION</Text>
                                <Divider mb="md" />
                                <Grid>
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
                                            label="Special Conditions"
                                            placeholder="Enter special conditions"
                                            {...form.getInputProps('special_conditions')}
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
                                    <Grid.Col span={12}>
                                        <Textarea
                                            label="Client Remarks"
                                            placeholder="Enter client remarks"
                                            {...form.getInputProps('client_remarks')}
                                            minRows={2}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Paper>
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