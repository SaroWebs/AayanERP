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


interface PrepareQuotationModalProps {
    opened: boolean;
    onClose: () => void;
    enquiry: Enquiry;
    onSuccess?: () => void;
}

export function PrepareQuotationModal({ opened, onClose, enquiry, onSuccess }: PrepareQuotationModalProps) {
    const queryClient = useQueryClient();
    const [equipment, setEquipment] = useState<Array<{ id: number; name: string }>>([]);

    useEffect(() => {
        axios.get('/sales/enquiries/get-equipment-list')
            .then(response => setEquipment(response.data))
            .catch(error => console.error('Error fetching equipment:', error));
    }, []);

    const form = useForm<QuotationFormData>({
        initialValues: {
            client_detail_id: enquiry.client_detail_id,
            contact_person_id: enquiry.contact_person_id,
            subject: enquiry.subject || '',
            description: enquiry.description,
            quotation_date: format(new Date(), 'yyyy-MM-dd'),
            valid_until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            currency: enquiry.currency as QuotationCurrency,
            payment_terms_days: 30,
            advance_percentage: 0,
            payment_terms: 'As per company policy',
            delivery_terms: 'As per company policy',
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
                item_id: item.item_id,
                quantity: item.quantity,
                unit_price: item.estimated_value || 0,
                total_price: (item.estimated_value || 0) * item.quantity,
                notes: item.notes,
            })) || [],
        },
        validate: {
            subject: (value) => (!value ? 'Subject is required' : null),
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
            const response = await axios.post(`/sales/enquiries/${enquiry.id}/convert-to-quotation`, data);
            return response.data;
        },
        onSuccess: (res) => {
            notifications.show({
                title: 'Success',
                message: 'Quotation created successfully',
                color: 'green'
            });
            // console.log(res);
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
            return total + ((item.quantity ?? 0) * (item.unit_price ?? 0));
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
                    <Paper withBorder radius="md" p="md" mb="md" style={{ background: "#f8fafc" }}>
                        <Group className='justify-between items-center'>
                            <Box>
                                <Title order={2} c="blue.8">QUOTATION</Title>
                                <Text size="sm" c="dimmed">Quotation No: To be generated on create</Text>
                                <Text size="sm" c="dimmed">Date: {form.values.quotation_date}</Text>
                            </Box>
                            {/* Optionally add company logo here */}
                        </Group>
                    </Paper>

                    {/* Client & Contact Person */}
                    <Paper withBorder radius="md" p="md" mb="md">
                        <Grid>
                            <Grid.Col span={6}>
                                <Title order={5} mb={4}>Client Details</Title>
                                <Text size="xs" c="dimmed">Company Name</Text>
                                <Text fw={600}>{enquiry.client?.name || "-"}</Text>
                                <Text size="xs" c="dimmed">Address</Text>
                                <Text>{enquiry.client?.address || "-"}</Text>
                                <Text size="xs" c="dimmed">GSTIN</Text>
                                <Text>{enquiry.client?.gstin_no || "-"}</Text>
                                <Text size="xs" c="dimmed">PAN</Text>
                                <Text>{enquiry.client?.pan_no || "-"}</Text>
                                <Text size="xs" c="dimmed">Email</Text>
                                <Text>{enquiry.client?.email || "-"}</Text>
                                <Text size="xs" c="dimmed">Phone</Text>
                                <Text>{enquiry.client?.contact_no || "-"}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Title order={5} mb={4}>Contact Person</Title>
                                <Text size="xs" c="dimmed">Name</Text>
                                <Text fw={500}>{enquiry.contact_person?.contact_person || "-"}</Text>
                                <Text size="xs" c="dimmed">Department</Text>
                                <Text>{enquiry.contact_person?.department || "-"}</Text>
                                <Text size="xs" c="dimmed">Designation</Text>
                                <Text>{enquiry.contact_person?.designation || "-"}</Text>
                                <Text size="xs" c="dimmed">Email</Text>
                                <Text>{enquiry.contact_person?.email || "-"}</Text>
                                <Text size="xs" c="dimmed">Phone</Text>
                                <Text>{enquiry.contact_person?.phone || "-"}</Text>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Quotation Details */}
                    <Paper withBorder radius="md" p="md" mb="md">
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput label="Subject" {...form.getInputProps('subject')} required />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select label="Currency" data={[{ value: 'INR', label: 'INR' }, { value: 'USD', label: 'USD' }]} {...form.getInputProps('currency')} required />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateInput label="Quotation Date" {...form.getInputProps('quotation_date')} required />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateInput label="Valid Until" {...form.getInputProps('valid_until')} required />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput label="Status" value={form.values.status} disabled />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Description" {...form.getInputProps('description')} minRows={2} />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Quotation Items Table */}
                    <Paper withBorder radius="md" p="md" mb="md">
                        <Title order={5} mb={4}>Quotation Items</Title>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Equipment</Table.Th>
                                    <Table.Th>Quantity</Table.Th>
                                    <Table.Th>Unit Price</Table.Th>
                                    <Table.Th>Total Price</Table.Th>
                                    <Table.Th>Notes</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {(equipment && form.values.items) ? form.values.items.map((item, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>
                                            <Select
                                                placeholder="Select equipment"
                                                data={equipment.map(eq => ({
                                                    value: eq.id.toString(),
                                                    label: eq.name
                                                }))}
                                                value={item.item_id?.toString()}
                                                onChange={(value) => handleItemChange(index, 'item_id', value ? parseInt(value) : 0)}
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
                                            {form.values.currency} {(item.total_price ?? 0).toFixed(2)}
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
                                )):null}
                            </Table.Tbody>
                        </Table>
                        <Button
                            variant="light"
                            onClick={() => {
                                form.setFieldValue('items', [
                                    ...form.values.items,
                                    {
                                        item_id: 0,
                                        quantity: 1,
                                        unit_price: 0,
                                        total_price: 0,
                                        notes: null,
                                    }
                                ]);
                            }}
                            mt="md"
                        >
                            Add Item
                        </Button>
                    </Paper>

                    {/* Financial Summary */}
                    <Paper withBorder radius="md" p="md" mb="md">
                        <Grid>
                            <Grid.Col span={4}>
                                <NumberInput label="Tax (%)" {...form.getInputProps('tax_percentage')} min={0} max={100} />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <NumberInput label="Discount (%)" {...form.getInputProps('discount_percentage')} min={0} max={100} />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <NumberInput label="Advance Payment (%)" {...form.getInputProps('advance_percentage')} min={0} max={100} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Table>
                                    <Table.Tbody>
                                        <Table.Tr>
                                            <Table.Td>Subtotal</Table.Td>
                                            <Table.Td>{form.values.currency} {calculateSubtotal().toFixed(2)}</Table.Td>
                                        </Table.Tr>
                                        <Table.Tr>
                                            <Table.Td>Tax Amount</Table.Td>
                                            <Table.Td>{form.values.currency} {calculateTaxAmount().toFixed(2)}</Table.Td>
                                        </Table.Tr>
                                        <Table.Tr>
                                            <Table.Td>Discount Amount</Table.Td>
                                            <Table.Td>{form.values.currency} {calculateDiscountAmount().toFixed(2)}</Table.Td>
                                        </Table.Tr>
                                        <Table.Tr>
                                            <Table.Td fw={700}>Total Amount</Table.Td>
                                            <Table.Td fw={700}>{form.values.currency} {calculateTotalAmount().toFixed(2)}</Table.Td>
                                        </Table.Tr>
                                    </Table.Tbody>
                                </Table>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Payment & Delivery Terms */}
                    <Paper withBorder radius="md" p="md" mb="md">
                        <Grid>
                            <Grid.Col span={6}>
                                <NumberInput label="Payment Terms (Days)" {...form.getInputProps('payment_terms_days')} min={0} />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Textarea label="Payment Terms" {...form.getInputProps('payment_terms')} minRows={2} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Delivery Terms" {...form.getInputProps('delivery_terms')} minRows={2} />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Additional Info */}
                    <Paper withBorder radius="md" p="md" mb="md">
                        <Grid>
                            <Grid.Col span={12}>
                                <Textarea label="Special Conditions" {...form.getInputProps('special_conditions')} minRows={2} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Terms & Conditions" {...form.getInputProps('terms_conditions')} minRows={2} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Notes" {...form.getInputProps('notes')} minRows={2} />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea label="Client Remarks" {...form.getInputProps('client_remarks')} minRows={2} />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Approval/Status (Optional) */}
                    {/* Add fields for approval_status, approved_by, approved_at, approval_remarks if needed */}

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={createQuotationMutation.isPending}>Create Quotation</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 