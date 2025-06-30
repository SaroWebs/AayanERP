import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Divider, Title, ActionIcon, Table, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { Quotation } from '@/types/sales';
import { formatCurrency } from '@/utils/format';
import { ClientDetail } from '@/types/client';



interface Props {
    opened: boolean;
    onClose: () => void;
    quotation: Quotation;
    clients: ClientDetail[];
    items: Item[];
    loading: boolean;
}

interface Item {
    id: number;
    name: string;
    description?: string;
    unit?: string;
    purchase_price?: number;
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
    client_detail_id?: string;
    contact_person_id?: string | '';
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

export function EditItem({ opened, onClose, quotation, clients, items, loading: clientsLoading }: Props) {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<QuotationForm>({
        initialValues: {
            client_detail_id: quotation.client_detail_id ? quotation.client_detail_id.toString() : '',
            contact_person_id: quotation.contact_person_id ? quotation.contact_person_id.toString() : '',
            subject: quotation.subject || '',
            description: quotation.description || '',
            quotation_date: quotation.quotation_date,
            valid_until: quotation.valid_until || '',
            currency: quotation.currency,
            tax_percentage: Number(quotation.tax_percentage) || 0,
            discount_percentage: Number(quotation.discount_percentage) || 0,
            payment_terms_days: Number(quotation.payment_terms_days) || 30,
            advance_percentage: Number(quotation.advance_percentage) || 0,
            deployment_state: quotation.deployment_state || '',
            location: quotation.location || '',
            site_details: quotation.site_details || '',
            payment_terms: quotation.payment_terms || '',
            delivery_terms: quotation.delivery_terms || '',
            special_conditions: quotation.special_conditions || '',
            terms_conditions: quotation.terms_conditions || '',
            notes: quotation.notes || '',
            items: quotation.items?.map(item => ({
                item_id: item.item?.id || item.item_id || 0,
                quantity: Number(item.quantity) || 0,
                unit_price: Number(item.unit_price) || 0,
                total_price: Number(item.total_price) || 0,
                notes: item.notes || ''
            })) || []
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

    // Debug: Log quotation data structure
    useEffect(() => {
        if (opened) {
            console.log('Quotation data:', quotation);
            console.log('Client detail ID:', quotation.client_detail_id, typeof quotation.client_detail_id);
            console.log('Contact person ID:', quotation.contact_person_id, typeof quotation.contact_person_id);
        }
    }, [opened, quotation]);

    const handleItemSelect = useCallback((itemId: string | null) => {
        if (!itemId) return;
        const item = items.find(i => i.id === Number(itemId));
        if (item) {
            setSelectedItem(item);
            itemFormRef.current.setFieldValue('item_id', Number(itemId));
            itemFormRef.current.setFieldValue('unit_price', item.purchase_price || 0);
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
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = Number(item.total_price) || 0;
            return sum + itemTotal;
        }, 0);
        const taxPercentage = Number(form.values.tax_percentage) || 0;
        const taxAmount = (subtotal * taxPercentage) / 100;
        const discountPercentage = Number(form.values.discount_percentage) || 0;
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

    const handleSubmit = useCallback((values: QuotationForm) => {
        setLoading(true);

        // Calculate the required totals before submitting
        const items = values.items || [];
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = Number(item.total_price) || 0;
            return sum + itemTotal;
        }, 0);
        const taxPercentage = Number(values.tax_percentage) || 0;
        const taxAmount = (subtotal * taxPercentage) / 100;
        const discountPercentage = Number(values.discount_percentage) || 0;
        const discountAmount = (subtotal * discountPercentage) / 100;
        const totalAmount = subtotal + taxAmount - discountAmount;

        // Prepare the data with calculated totals and convert string IDs to numbers
        const submissionData = {
            ...values,
            client_detail_id: values.client_detail_id ? Number(values.client_detail_id) : undefined,
            contact_person_id: values.contact_person_id ? Number(values.contact_person_id) : null,
            subtotal: subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount
        };

        axios.put(`/sales/quotations/${quotation.id}`, submissionData)
            .then(() => {
                notifications.show({ message: 'Quotation updated successfully', color: 'green' });
                onClose();
                router.reload();
            })
            .catch((error) => {
                const message = error.response?.data?.message || 'Failed to update quotation';
                notifications.show({ message, color: 'red' });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [quotation.id, onClose]);

    const getContactPersonOptions = useMemo(() => {
        const clientId = form.values.client_detail_id ? Number(form.values.client_detail_id) : null;
        const selectedClient = clients.find(c => c.id === clientId);
        return selectedClient?.contact_details?.map(contact => ({
            value: contact.id.toString(),
            label: contact.contact_person
        })) || [];
    }, [clients, form.values.client_detail_id]);

    const getItemName = useCallback((itemId: number) => {
        return items.find(i => i.id === itemId)?.name || `Item ${itemId}`;
    }, [items]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Edit Quotation: #${quotation.quotation_no}`}
            size="xl"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                    {/* Basic Information */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Basic Information</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Client"
                                    placeholder="Select client"
                                    data={clients.map(client => ({ value: client.id.toString(), label: client.name }))}
                                    searchable
                                    required
                                    {...form.getInputProps('client_detail_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Contact Person"
                                    placeholder="Select contact person"
                                    data={getContactPersonOptions}
                                    searchable
                                    {...form.getInputProps('contact_person_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Subject"
                                    placeholder="Enter quotation subject"
                                    {...form.getInputProps('subject')}
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

                    {/* Dates */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Dates</Title>
                        <Grid>
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
                        </Grid>
                    </Paper>

                    {/* Items */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Items</Title>

                        {/* Add Item Form */}
                        <Paper p="md" withBorder mb="md">
                            <Grid>
                                <Grid.Col span={4}>
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
                                        onChange={(value) => itemFormRef.current.setFieldValue('quantity', Number(value) || 1)}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Unit Price"
                                        placeholder="Price"
                                        min={0}
                                        value={itemForm.values.unit_price}
                                        onChange={(value) => itemFormRef.current.setFieldValue('unit_price', Number(value) || 0)}
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
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Item</Table.Th>
                                        <Table.Th>Quantity</Table.Th>
                                        <Table.Th>Unit Price</Table.Th>
                                        <Table.Th>Total Price</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {form.values?.items.map((item, index) => (
                                        <Table.Tr key={index}>
                                            <Table.Td>
                                                {getItemName(item.item_id)}
                                            </Table.Td>
                                            <Table.Td>{item.quantity}</Table.Td>
                                            <Table.Td>{formatCurrency(item.unit_price)}</Table.Td>
                                            <Table.Td>{formatCurrency(item.total_price)}</Table.Td>
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

                    {/* Financial Details */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Financial Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Currency"
                                    data={CURRENCY_OPTIONS}
                                    required
                                    {...form.getInputProps('currency')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Tax Percentage"
                                    placeholder="0"
                                    min={0}
                                    max={100}
                                    suffix="%"
                                    {...form.getInputProps('tax_percentage')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Discount Percentage"
                                    placeholder="0"
                                    min={0}
                                    max={100}
                                    suffix="%"
                                    {...form.getInputProps('discount_percentage')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Payment Terms (Days)"
                                    placeholder="30"
                                    min={0}
                                    {...form.getInputProps('payment_terms_days')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Advance Percentage"
                                    placeholder="0"
                                    min={0}
                                    max={100}
                                    suffix="%"
                                    {...form.getInputProps('advance_percentage')}
                                />
                            </Grid.Col>
                        </Grid>

                        {/* Totals */}
                        <Divider my="md" />
                        <Grid>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">Subtotal</Text>
                                <Text fw={500}>{form.values.currency} {formatCurrency(totals.subtotal)}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">Tax Amount</Text>
                                <Text>{form.values.currency} {formatCurrency(totals.taxAmount)}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">Discount Amount</Text>
                                <Text>{form.values.currency} {formatCurrency(totals.discountAmount)}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">Total Amount</Text>
                                <Text fw={500} size="lg">{form.values.currency} {formatCurrency(totals.totalAmount)}</Text>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Additional Details */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Additional Details</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Deployment State"
                                    placeholder="Enter state"
                                    {...form.getInputProps('deployment_state')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
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
                                    rows={3}
                                    {...form.getInputProps('site_details')}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
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
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Update Quotation
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 