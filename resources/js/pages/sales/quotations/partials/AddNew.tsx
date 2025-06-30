import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Divider, Title, ActionIcon, Table, Text, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { formatCurrency } from '@/utils/format';
import { ClientDetail } from '@/types/client';
import { useDisclosure } from '@mantine/hooks';


interface Props {
    items: Item[];
    clients: ClientDetail[];
    loading: boolean;
}

interface Item {
    id: number;
    name: string;
    description?: string;
    unit?: string;
    selling_price?: number;
    standard_cost?: number;
    rental_rate?: number;
}

interface QuotationItemForm {
    item_id: number | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string;
}

// Form-specific interface for quotation items
interface QuotationFormItem {
    item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string;
}

// Form-specific interface for quotation
interface QuotationForm {
    client_detail_id?: number;
    contact_person_id?: number | null;
    subject?: string;
    description?: string;
    quotation_date: string;
    valid_until?: string;
    currency: string;
    tax_percentage: number;
    discount_percentage: number;
    payment_terms_days: number;
    advance_percentage: number;
    deployment_state?: string;
    location?: string;
    site_details?: string;
    payment_terms?: string;
    delivery_terms?: string;
    special_conditions?: string;
    terms_conditions?: string;
    notes?: string;
    items: QuotationFormItem[];
}

const CURRENCY_OPTIONS = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
] as const;

export function AddNew({ clients, items, loading: clientsLoading }: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);


    const form = useForm<QuotationForm>({
        initialValues: {
            currency: 'INR',
            tax_percentage: 0,
            discount_percentage: 0,
            payment_terms_days: 30,
            advance_percentage: 0,
            quotation_date: format(new Date(), 'yyyy-MM-dd'),
            valid_until: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            deployment_state: '',
            location: '',
            site_details: '',
            payment_terms: 'As per company policy',
            delivery_terms: 'As per company policy',
            items: []
        },
        validate: {
            client_detail_id: (value) => (!value ? 'Client is required' : null),
            quotation_date: (value) => (!value ? 'Quotation date is required' : null),
            currency: (value) => (!value ? 'Currency is required' : null),
            payment_terms_days: (value) => (typeof value === 'number' && value < 0 ? 'Payment terms days cannot be negative' : null),
            advance_percentage: (value) => (typeof value === 'number' && (value < 0 || value > 100) ? 'Advance percentage must be between 0 and 100' : null),
            tax_percentage: (value) => (typeof value === 'number' && (value < 0 || value > 100) ? 'Tax percentage must be between 0 and 100' : null),
            discount_percentage: (value) => (typeof value === 'number' && (value < 0 || value > 100) ? 'Discount percentage must be between 0 and 100' : null),
            items: (value) => (!value || value.length === 0 ? 'At least one item is required' : null)
        },
    });

    const itemForm = useForm<QuotationItemForm>({
        initialValues: {
            item_id: null,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
            notes: ''
        }
    });

    // Use refs to access form methods without causing re-renders
    const itemFormRef = useRef(itemForm);
    const formRef = useRef(form);

    // Update refs when forms change
    useEffect(() => {
        itemFormRef.current = itemForm;
    }, [itemForm]);

    useEffect(() => {
        formRef.current = form;
    }, [form]);

    const handleItemSelect = useCallback((itemId: string | null) => {
        if (!itemId) return;
        const item = items.find(i => i.id === Number(itemId));
        console.log(item);
        
        if (item) {
            setSelectedItem(item);
            itemFormRef.current.setFieldValue('item_id', Number(itemId));
            const unitPrice = item.selling_price || item.standard_cost || 0;
            itemFormRef.current.setFieldValue('unit_price', unitPrice);
            const quantity = itemFormRef.current.values.quantity || 1;
            itemFormRef.current.setFieldValue('total_price', quantity * unitPrice);
        }
    }, [items]);

    const totalPrice = useMemo(() => {
        const { quantity, unit_price } = itemForm.values;
        return quantity * unit_price;
    }, [itemForm.values.quantity, itemForm.values.unit_price]);

    useEffect(() => {
        itemFormRef.current.setFieldValue('total_price', totalPrice);
    }, [totalPrice]);

    const totals = useMemo(() => {
        const items = form.values.items || [];
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
        const taxPercentage = form.values.tax_percentage || 0;
        const taxAmount = (subtotal * taxPercentage) / 100;
        const discountPercentage = form.values.discount_percentage || 0;
        const discountAmount = (subtotal * discountPercentage) / 100;
        const totalAmount = subtotal + taxAmount - discountAmount;

        return {
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount
        };
    }, [form.values.items, form.values.tax_percentage, form.values.discount_percentage]);

    const addItem = useCallback(() => {
        const { item_id, quantity, unit_price, total_price, notes } = itemFormRef.current.values;

        if (!item_id || !selectedItem) {
            notifications.show({ message: 'Please select an item', color: 'red' });
            return;
        }

        const newItem: QuotationFormItem = {
            item_id: item_id,
            quantity,
            unit_price,
            total_price,
            notes: notes || ''
        };

        formRef.current.setFieldValue('items', [...(formRef.current.values.items || []), newItem]);

        // Reset item form
        itemFormRef.current.reset();
        setSelectedItem(null);
    }, [selectedItem]);

    const removeItem = useCallback((index: number) => {
        const currentItems = formRef.current.values.items || [];
        formRef.current.setFieldValue('items', currentItems.filter((_, i) => i !== index));
    }, []);

    const handleSubmit = (values: QuotationForm) => {
        setLoading(true);

        // Calculate the required totals before submitting
        const items = values.items || [];
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
        const taxPercentage = values.tax_percentage || 0;
        const taxAmount = (subtotal * taxPercentage) / 100;
        const discountPercentage = values.discount_percentage || 0;
        const discountAmount = (subtotal * discountPercentage) / 100;
        const totalAmount = subtotal + taxAmount - discountAmount;

        // Prepare the data with calculated totals
        const submissionData = {
            ...values,
            subtotal: subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount
        };

        axios.post('/sales/quotations', submissionData)
            .then(() => {
                notifications.show({ message: 'Quotation created successfully', color: 'green' });
                close();
                router.reload();
            })
            .catch((error) => {
                const message = error.response?.data?.message || 'Failed to create quotation';
                notifications.show({ message, color: 'red' });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const getContactPersonOptions = useMemo(() => {
        const selectedClient = clients.find(c => c.id === Number(form.values.client_detail_id));
        
        return selectedClient?.contact_details?.map(contact => ({
            value: contact.id.toString(),
            label: contact.contact_person
        })) || [];
        
    }, [clients, form.values.client_detail_id]);

    const getItemName = useCallback((itemId: number) => {
        return items.find(i => i.id === itemId)?.name || `Item ${itemId}`;
    }, [items]);

    return (
        <>
            <Button
                leftSection={<Plus size={16} />}
                onClick={() => open()}
            >
                Add New
            </Button>
            <Modal
                opened={opened}
                onClose={close}
                title="Create New Quotation"
                size="100%"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="lg">
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
                                    <Select
                                        label="Client"
                                        placeholder="Select client"
                                        data={clients.map(client => ({ value: client.id.toString(), label: client.name }))}
                                        searchable
                                        required
                                        {...form.getInputProps('client_detail_id')}
                                    />
                                    <TextInput
                                        label="Deployment State"
                                        placeholder="Enter state"
                                        mt="md"
                                        {...form.getInputProps('deployment_state')}
                                    />
                                    <TextInput
                                        label="Location"
                                        placeholder="Enter location"
                                        mt="md"
                                        {...form.getInputProps('location')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Title order={5} mb={4}>Contact Person</Title>
                                    <Select
                                        label="Contact Person"
                                        placeholder="Select contact person"
                                        data={getContactPersonOptions}
                                        searchable
                                        {...form.getInputProps('contact_person_id')}
                                    />
                                    <Textarea
                                        label="Site Details"
                                        placeholder="Enter site details"
                                        rows={3}
                                        mt="md"
                                        {...form.getInputProps('site_details')}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {/* Quotation Details */}
                        <Paper withBorder radius="md" p="md" mb="md">
                            <Title order={5} mb={4}>Quotation Details</Title>
                            <Grid>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Subject"
                                        placeholder="Enter quotation subject"
                                        required
                                        {...form.getInputProps('subject')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Select
                                        label="Currency"
                                        data={CURRENCY_OPTIONS}
                                        required
                                        {...form.getInputProps('currency')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <DateInput
                                        label="Quotation Date"
                                        placeholder="Select date"
                                        valueFormat="YYYY-MM-DD"
                                        required
                                        {...form.getInputProps('quotation_date')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <DateInput
                                        label="Valid Until"
                                        placeholder="Select date"
                                        valueFormat="YYYY-MM-DD"
                                        minDate={new Date(form.values.quotation_date || new Date())}
                                        {...form.getInputProps('valid_until')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Description"
                                        placeholder="Enter quotation description"
                                        rows={3}
                                        {...form.getInputProps('description')}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {/* Quotation Items */}
                        <Paper withBorder radius="md" p="md" mb="md">
                            <Title order={5} mb={4}>Quotation Items</Title>

                            {/* Add Item Form */}
                            <Paper p="md" withBorder mb="md">
                                <Grid>
                                    <Grid.Col span={3}>
                                        <Select
                                            label="Item"
                                            placeholder="Select item"
                                            data={items.map(item => ({ value: item.id.toString(), label: item.name }))}
                                            searchable
                                            value={itemForm.values.item_id?.toString() || null}
                                            onChange={handleItemSelect}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                        <NumberInput
                                            label="Quantity"
                                            placeholder="Qty"
                                            min={1}
                                            value={itemForm.values.quantity}
                                            onChange={(value) => {
                                                const quantity = Number(value) || 1;
                                                itemFormRef.current.setFieldValue('quantity', quantity);
                                                // Recalculate total price
                                                const unitPrice = itemFormRef.current.values.unit_price || 0;
                                                itemFormRef.current.setFieldValue('total_price', quantity * unitPrice);
                                            }}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                        <NumberInput
                                            label="Unit Price"
                                            placeholder="Price"
                                            min={0}
                                            value={itemForm.values.unit_price}
                                            onChange={(value) => {
                                                const unitPrice = Number(value) || 0;
                                                itemFormRef.current.setFieldValue('unit_price', unitPrice);
                                                // Recalculate total price
                                                const quantity = itemFormRef.current.values.quantity || 1;
                                                itemFormRef.current.setFieldValue('total_price', quantity * unitPrice);
                                            }}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                        <TextInput
                                            label="Total Price"
                                            value={formatCurrency(totalPrice)}
                                            readOnly
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                        <TextInput
                                            label="Notes"
                                            placeholder="Item notes"
                                            value={itemForm.values.notes}
                                            onChange={(event) => itemFormRef.current.setFieldValue('notes', event.currentTarget.value)}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={1}>
                                        <Button
                                            onClick={addItem}
                                            style={{ marginTop: 28 }}
                                            leftSection={<Plus size={16} />}
                                        >
                                            Add
                                        </Button>
                                    </Grid.Col>
                                </Grid>
                            </Paper>

                            {/* Items Table */}
                            {form.values.items && form.values.items.length > 0 && (
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Item</Table.Th>
                                            <Table.Th>Quantity</Table.Th>
                                            <Table.Th>Unit Price</Table.Th>
                                            <Table.Th>Total Price</Table.Th>
                                            <Table.Th>Notes</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {form.values?.items.map((item, index) => (
                                            <Table.Tr key={index}>
                                                <Table.Td>
                                                    <Text fw={500}>{getItemName(item.item_id)}</Text>
                                                </Table.Td>
                                                <Table.Td>{item.quantity}</Table.Td>
                                                <Table.Td>{formatCurrency(item.unit_price)}</Table.Td>
                                                <Table.Td>
                                                    <Text fw={500}>{formatCurrency(item.total_price)}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    {item.notes ? (
                                                        <Text size="sm" c="dimmed">{item.notes}</Text>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">-</Text>
                                                    )}
                                                </Table.Td>
                                                <Table.Td>
                                                    <ActionIcon
                                                        color="red"
                                                        variant="subtle"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </ActionIcon>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            )}
                        </Paper>

                        {/* Financial Summary */}
                        <Paper withBorder radius="md" p="md" mb="md">
                            <Title order={5} mb={4}>Financial Details</Title>
                            <Grid>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Tax Percentage"
                                        placeholder="0"
                                        min={0}
                                        max={100}
                                        suffix="%"
                                        {...form.getInputProps('tax_percentage')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Discount Percentage"
                                        placeholder="0"
                                        min={0}
                                        max={100}
                                        suffix="%"
                                        {...form.getInputProps('discount_percentage')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Advance Percentage"
                                        placeholder="0"
                                        min={0}
                                        max={100}
                                        suffix="%"
                                        {...form.getInputProps('advance_percentage')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Table>
                                        <Table.Tbody>
                                            <Table.Tr>
                                                <Table.Td>Subtotal</Table.Td>
                                                <Table.Td>{form.values.currency} {formatCurrency(totals.subtotal)}</Table.Td>
                                            </Table.Tr>
                                            <Table.Tr>
                                                <Table.Td>Tax Amount</Table.Td>
                                                <Table.Td>{form.values.currency} {formatCurrency(totals.taxAmount)}</Table.Td>
                                            </Table.Tr>
                                            <Table.Tr>
                                                <Table.Td>Discount Amount</Table.Td>
                                                <Table.Td>{form.values.currency} {formatCurrency(totals.discountAmount)}</Table.Td>
                                            </Table.Tr>
                                            <Table.Tr>
                                                <Table.Td fw={700}>Total Amount</Table.Td>
                                                <Table.Td fw={700}>{form.values.currency} {formatCurrency(totals.totalAmount)}</Table.Td>
                                            </Table.Tr>
                                        </Table.Tbody>
                                    </Table>
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {/* Payment & Delivery Terms */}
                        <Paper withBorder radius="md" p="md" mb="md">
                            <Title order={5} mb={4}>Payment & Delivery Terms</Title>
                            <Grid>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Payment Terms (Days)"
                                        placeholder="30"
                                        min={0}
                                        {...form.getInputProps('payment_terms_days')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Payment Terms"
                                        placeholder="Enter payment terms"
                                        rows={3}
                                        {...form.getInputProps('payment_terms')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Delivery Terms"
                                        placeholder="Enter delivery terms"
                                        rows={3}
                                        {...form.getInputProps('delivery_terms')}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {/* Additional Details */}
                        <Paper withBorder radius="md" p="md" mb="md">
                            <Title order={5} mb={4}>Additional Details</Title>
                            <Grid>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Special Conditions"
                                        placeholder="Enter special conditions"
                                        rows={3}
                                        {...form.getInputProps('special_conditions')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Terms & Conditions"
                                        placeholder="Enter terms and conditions"
                                        rows={3}
                                        {...form.getInputProps('terms_conditions')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Notes"
                                        placeholder="Enter notes"
                                        rows={3}
                                        {...form.getInputProps('notes')}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {/* Actions */}
                        <Group justify="flex-end" gap="md">
                            <Button variant="light" onClick={close}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                Create Quotation
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
} 