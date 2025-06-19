import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Divider, Box, Title, ActionIcon, Table, Switch, Badge, Loader, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PurchaseOrder, Vendor, Department, PurchaseIntent, Item, PurchaseOrderItem } from '@/types/purchase';
import { formatCurrency } from '@/utils/format';

interface Props {
    opened: boolean;
    onClose: () => void;
    order: PurchaseOrder;
    vendors: Vendor[];
    departments: Department[];
    purchaseIntents: PurchaseIntent[];
    loading: boolean;
}

interface PurchaseOrderItemForm {
    item_id: number | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    description?: string;
    specifications?: string;
    notes?: string;
}

const CURRENCY_OPTIONS = [
    { value: 'INR', label: 'Indian Rupee (INR)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
];

const PAYMENT_TERMS_OPTIONS = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'net_30', label: 'Net 30 Days' },
    { value: 'net_45', label: 'Net 45 Days' },
    { value: 'net_60', label: 'Net 60 Days' },
    { value: 'net_90', label: 'Net 90 Days' },
    { value: 'advance', label: 'Advance Payment' },
    { value: 'partial_advance', label: 'Partial Advance' },
];

const DELIVERY_TERMS_OPTIONS = [
    { value: 'ex_works', label: 'Ex Works (EXW)' },
    { value: 'fca', label: 'Free Carrier (FCA)' },
    { value: 'cpt', label: 'Carriage Paid To (CPT)' },
    { value: 'cip', label: 'Carriage and Insurance Paid To (CIP)' },
    { value: 'dap', label: 'Delivered at Place (DAP)' },
    { value: 'dp', label: 'Delivered at Place Unloaded (DPU)' },
    { value: 'ddp', label: 'Delivered Duty Paid (DDP)' },
    { value: 'fas', label: 'Free Alongside Ship (FAS)' },
    { value: 'fob', label: 'Free On Board (FOB)' },
    { value: 'cfr', label: 'Cost and Freight (CFR)' },
    { value: 'cif', label: 'Cost, Insurance and Freight (CIF)' },
];

export function EditItem({ opened, onClose, order, vendors, departments, purchaseIntents, loading: dataLoading }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (opened) {
            loadItems();
            // Initialize form with order data
            form.setValues({
                purchase_intent_id: order.purchase_intent_id,
                vendor_id: order.vendor_id,
                department_id: order.department_id,
                po_date: order.po_date,
                expected_delivery_date: order.expected_delivery_date,
                delivery_location: order.delivery_location,
                payment_terms: order.payment_terms,
                delivery_terms: order.delivery_terms,
                warranty_terms: order.warranty_terms || '',
                special_instructions: order.special_instructions || '',
                total_amount: order.total_amount,
                tax_amount: order.tax_amount,
                freight_amount: order.freight_amount,
                insurance_amount: order.insurance_amount,
                grand_total: order.grand_total,
                currency: order.currency,
                exchange_rate: order.exchange_rate,
                quality_requirements: order.quality_requirements || '',
                inspection_requirements: order.inspection_requirements || '',
                testing_requirements: order.testing_requirements || '',
                certification_requirements: order.certification_requirements || '',
                quotation_reference: order.quotation_reference || '',
                contract_reference: order.contract_reference || '',
                project_reference: order.project_reference || '',
                items: order.items || []
            });
        }
    }, [opened, order]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/data/items/all');
            setItems(response.data);
        } catch (error) {
            notifications.show({ message: 'Failed to load items', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<Partial<PurchaseOrder>>({
        initialValues: {
            purchase_intent_id: null,
            vendor_id: null,
            department_id: null,
            po_date: format(new Date(), 'yyyy-MM-dd'),
            expected_delivery_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
            delivery_location: '',
            payment_terms: 'net_30',
            delivery_terms: 'fob',
            warranty_terms: '',
            special_instructions: '',
            total_amount: 0,
            tax_amount: 0,
            freight_amount: 0,
            insurance_amount: 0,
            grand_total: 0,
            currency: 'INR',
            exchange_rate: 1,
            quality_requirements: '',
            inspection_requirements: '',
            testing_requirements: '',
            certification_requirements: '',
            quotation_reference: '',
            contract_reference: '',
            project_reference: '',
            items: []
        },
        validate: {
            vendor_id: (value) => (!value ? 'Vendor is required' : null),
            department_id: (value) => (!value ? 'Department is required' : null),
            po_date: (value) => (!value ? 'PO date is required' : null),
            expected_delivery_date: (value) => (!value ? 'Expected delivery date is required' : null),
            delivery_location: (value) => (!value ? 'Delivery location is required' : null),
            payment_terms: (value) => (!value ? 'Payment terms are required' : null),
            delivery_terms: (value) => (!value ? 'Delivery terms are required' : null),
            currency: (value) => (!value ? 'Currency is required' : null),
            items: (value) => (!value || value.length === 0 ? 'At least one item is required' : null)
        },
    });

    const itemForm = useForm<PurchaseOrderItemForm>({
        initialValues: {
            item_id: null,
            quantity: 1,
            unit_price: 0,
            total_price: 0,
            description: '',
            specifications: '',
            notes: ''
        }
    });

    const handleItemSelect = (itemId: string | null) => {
        if (!itemId) return;
        const item = items.find(i => i.id === Number(itemId));
        if (item) {
            setSelectedItem(item);
            itemForm.setFieldValue('item_id', Number(itemId));
            itemForm.setFieldValue('unit_price', item.standard_cost || 0);
        }
    };

    const totalPrice = useMemo(() => {
        const { quantity, unit_price } = itemForm.values;
        return quantity * unit_price;
    }, [itemForm.values.quantity, itemForm.values.unit_price]);

    useEffect(() => {
        itemForm.setFieldValue('total_price', totalPrice);
    }, [totalPrice]);

    const totals = useMemo(() => {
        const items = form.values.items || [];
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
        const taxAmount = form.values.tax_amount || 0;
        const freightAmount = form.values.freight_amount || 0;
        const insuranceAmount = form.values.insurance_amount || 0;
        const grandTotal = subtotal + taxAmount + freightAmount + insuranceAmount;

        return {
            subtotal,
            taxAmount,
            freightAmount,
            insuranceAmount,
            grandTotal
        };
    }, [form.values.items, form.values.tax_amount, form.values.freight_amount, form.values.insurance_amount]);

    useEffect(() => {
        form.setFieldValue('total_amount', totals.subtotal);
        form.setFieldValue('grand_total', totals.grandTotal);
    }, [totals]);

    const addItem = () => {
        const { item_id, quantity, unit_price, description, specifications, notes } = itemForm.values;

        if (!item_id || !selectedItem) {
            notifications.show({ message: 'Please select an item', color: 'red' });
            return;
        }

        const newItem: PurchaseOrderItem = {
            id: Date.now(), // Temporary ID for form
            purchase_order_id: 0,
            item_id: item_id,
            quantity,
            unit_price,
            total_price: totalPrice,
            description: description || null,
            specifications: specifications || null,
            notes: notes || null,
            item: selectedItem
        };

        form.setFieldValue('items', [...(form.values.items || []), newItem]);

        // Reset item form
        itemForm.reset();
        setSelectedItem(null);
    };

    const removeItem = (index: number) => {
        const items = form.values.items || [];
        items.splice(index, 1);
        form.setFieldValue('items', items);
    };

    const handleSubmit = (values: Partial<PurchaseOrder>) => {
        router.put(route('purchases.orders.update', order.id), values, {
            onSuccess: () => {
                notifications.show({ message: 'Purchase order updated successfully', color: 'green' });
                onClose();
            },
            onError: (errors) => {
                notifications.show({ message: 'Failed to update purchase order', color: 'red' });
            }
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Edit Purchase Order - ${order.po_no}`}
            size="xl"
            closeOnClickOutside={false}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                    {/* Basic Information */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Basic Information</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Purchase Intent (Optional)"
                                    placeholder="Select purchase intent"
                                    data={purchaseIntents.map(intent => ({
                                        value: intent.id.toString(),
                                        label: `${intent.intent_no} - ${intent.subject}`
                                    }))}
                                    value={form.values.purchase_intent_id?.toString() || ''}
                                    onChange={(value) => form.setFieldValue('purchase_intent_id', value ? Number(value) : null)}
                                    clearable
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Vendor *"
                                    placeholder="Select vendor"
                                    data={vendors.map(vendor => ({
                                        value: vendor.id.toString(),
                                        label: vendor.name
                                    }))}
                                    value={form.values.vendor_id?.toString() || ''}
                                    onChange={(value) => form.setFieldValue('vendor_id', value ? Number(value) : null)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Department *"
                                    placeholder="Select department"
                                    data={departments.map(dept => ({
                                        value: dept.id.toString(),
                                        label: dept.name
                                    }))}
                                    value={form.values.department_id?.toString() || ''}
                                    onChange={(value) => form.setFieldValue('department_id', value ? Number(value) : null)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateInput
                                    label="PO Date *"
                                    placeholder="Select date"
                                    value={form.values.po_date ? new Date(form.values.po_date) : null}
                                    onChange={(value) => form.setFieldValue('po_date', value ? value.toISOString().split('T')[0] : '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateInput
                                    label="Expected Delivery Date *"
                                    placeholder="Select date"
                                    value={form.values.expected_delivery_date ? new Date(form.values.expected_delivery_date) : null}
                                    onChange={(value) => form.setFieldValue('expected_delivery_date', value ? value.toISOString().split('T')[0] : '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Delivery Location *"
                                    placeholder="Enter delivery location"
                                    value={form.values.delivery_location || ''}
                                    onChange={(e) => form.setFieldValue('delivery_location', e.target.value)}
                                    required
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Terms and Conditions */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Terms and Conditions</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Payment Terms *"
                                    placeholder="Select payment terms"
                                    data={PAYMENT_TERMS_OPTIONS}
                                    value={form.values.payment_terms || ''}
                                    onChange={(value) => form.setFieldValue('payment_terms', value || '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Delivery Terms *"
                                    placeholder="Select delivery terms"
                                    data={DELIVERY_TERMS_OPTIONS}
                                    value={form.values.delivery_terms || ''}
                                    onChange={(value) => form.setFieldValue('delivery_terms', value || '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Warranty Terms"
                                    placeholder="Enter warranty terms"
                                    value={form.values.warranty_terms || ''}
                                    onChange={(e) => form.setFieldValue('warranty_terms', e.target.value)}
                                    rows={3}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Special Instructions"
                                    placeholder="Enter special instructions"
                                    value={form.values.special_instructions || ''}
                                    onChange={(e) => form.setFieldValue('special_instructions', e.target.value)}
                                    rows={3}
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
                                        data={items.map(item => ({
                                            value: item.id.toString(),
                                            label: `${item.code} - ${item.name}`
                                        }))}
                                        value={itemForm.values.item_id?.toString() || ''}
                                        onChange={handleItemSelect}
                                        searchable
                                        clearable
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Quantity"
                                        placeholder="Qty"
                                        value={itemForm.values.quantity}
                                        onChange={(value) => itemForm.setFieldValue('quantity', value || 1)}
                                        min={1}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Unit Price"
                                        placeholder="Price"
                                        value={itemForm.values.unit_price}
                                        onChange={(value) => itemForm.setFieldValue('unit_price', value || 0)}
                                        min={0}
                                        precision={2}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Total Price"
                                        placeholder="Total"
                                        value={itemForm.values.total_price}
                                        readOnly
                                        precision={2}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <Button
                                        onClick={addItem}
                                        leftSection={<Plus size={16} />}
                                        style={{ marginTop: 28 }}
                                        fullWidth
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
                                        <Table.Th>Total</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {form.values.items.map((item, index) => (
                                        <Table.Tr key={index}>
                                            <Table.Td>
                                                <Text fw={500}>{item.item?.name}</Text>
                                                <Text size="sm" c="dimmed">{item.item?.code}</Text>
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
                            <Grid.Col span={3}>
                                <Select
                                    label="Currency *"
                                    placeholder="Select currency"
                                    data={CURRENCY_OPTIONS}
                                    value={form.values.currency || ''}
                                    onChange={(value) => form.setFieldValue('currency', value || '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Exchange Rate"
                                    placeholder="Rate"
                                    value={form.values.exchange_rate || 1}
                                    onChange={(value) => form.setFieldValue('exchange_rate', value || 1)}
                                    min={0}
                                    precision={4}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Tax Amount"
                                    placeholder="Tax"
                                    value={form.values.tax_amount || 0}
                                    onChange={(value) => form.setFieldValue('tax_amount', value || 0)}
                                    min={0}
                                    precision={2}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Freight Amount"
                                    placeholder="Freight"
                                    value={form.values.freight_amount || 0}
                                    onChange={(value) => form.setFieldValue('freight_amount', value || 0)}
                                    min={0}
                                    precision={2}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Insurance Amount"
                                    placeholder="Insurance"
                                    value={form.values.insurance_amount || 0}
                                    onChange={(value) => form.setFieldValue('insurance_amount', value || 0)}
                                    min={0}
                                    precision={2}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Subtotal"
                                    placeholder="Subtotal"
                                    value={totals.subtotal}
                                    readOnly
                                    precision={2}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Grand Total"
                                    placeholder="Total"
                                    value={totals.grandTotal}
                                    readOnly
                                    precision={2}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Quality and Inspection */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Quality and Inspection Requirements</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Textarea
                                    label="Quality Requirements"
                                    placeholder="Enter quality requirements"
                                    value={form.values.quality_requirements || ''}
                                    onChange={(e) => form.setFieldValue('quality_requirements', e.target.value)}
                                    rows={3}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Textarea
                                    label="Inspection Requirements"
                                    placeholder="Enter inspection requirements"
                                    value={form.values.inspection_requirements || ''}
                                    onChange={(e) => form.setFieldValue('inspection_requirements', e.target.value)}
                                    rows={3}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Textarea
                                    label="Testing Requirements"
                                    placeholder="Enter testing requirements"
                                    value={form.values.testing_requirements || ''}
                                    onChange={(e) => form.setFieldValue('testing_requirements', e.target.value)}
                                    rows={3}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Textarea
                                    label="Certification Requirements"
                                    placeholder="Enter certification requirements"
                                    value={form.values.certification_requirements || ''}
                                    onChange={(e) => form.setFieldValue('certification_requirements', e.target.value)}
                                    rows={3}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* References */}
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">References</Title>
                        <Grid>
                            <Grid.Col span={4}>
                                <TextInput
                                    label="Quotation Reference"
                                    placeholder="Enter quotation reference"
                                    value={form.values.quotation_reference || ''}
                                    onChange={(e) => form.setFieldValue('quotation_reference', e.target.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    label="Contract Reference"
                                    placeholder="Enter contract reference"
                                    value={form.values.contract_reference || ''}
                                    onChange={(e) => form.setFieldValue('contract_reference', e.target.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    label="Project Reference"
                                    placeholder="Enter project reference"
                                    value={form.values.project_reference || ''}
                                    onChange={(e) => form.setFieldValue('project_reference', e.target.value)}
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
                            Update Purchase Order
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 