import { Department, Equipment, Item, PurchaseIntent, Vendor } from '@/types/purchase';
import { Button, Grid, Group, Modal, NumberInput, Paper, Select, Stack, Table, Text, Textarea, TextInput, Title, ActionIcon as TableActionIcon } from '@mantine/core'
import { DateInput } from '@mantine/dates';
import React, { useMemo, useState } from 'react'
import { format } from 'date-fns';
import { useForm } from '@mantine/form';
import { router } from '@inertiajs/react';
import { notifications } from '@mantine/notifications';
import { formatCurrency } from '@/utils/format';
import { Plus, Trash2 } from 'lucide-react';
import { getCurrencyOptions, getCurrencySymbol, DEFAULT_CURRENCY } from '@/utils/currencies';

interface PurchaseOrderItemForm {
    item_name: string;
    item_code?: string;
    description?: string;
    specifications?: string;
    quantity: number;
    unit?: string;
    unit_price: number;
    total_price: number;
    notes?: string;
    brand?: string;
    model?: string;
    warranty_period?: string;
    expected_delivery_date?: string;
    delivery_location?: string;
    quality_requirements?: string;
    inspection_requirements?: string;
    testing_requirements?: string;
    item_id?: number;
    equipment_id?: number;
}

interface PurchaseOrderForm {
    vendor_id: number | null;
    department_id: number | null;
    po_date: string;
    expected_delivery_date: string;
    delivery_location: string;
    payment_terms: string;
    delivery_terms: string;
    warranty_terms?: string;
    special_instructions?: string;
    quality_requirements?: string;
    inspection_requirements?: string;
    testing_requirements?: string;
    certification_requirements?: string;
    quotation_reference?: string;
    contract_reference?: string;
    project_reference?: string;
    currency: string;
    exchange_rate: number;
    tax_amount: number;
    freight_amount: number;
    insurance_amount: number;
    grand_total: number;
    items: PurchaseOrderItemForm[];
}

interface Props {
    opened: boolean;
    onClose: () => void;
    intent: PurchaseIntent;
    departments: Department[];
    vendors: Vendor[];
    items: Item[];
    equipment: Equipment[];
}

const handleConvert = (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    console.log("Submitting...");

};

const ConvertPO = ({ opened, onClose, intent, departments, vendors, items, equipment }: Props) => {
    const [converting, setConverting] = useState(false);

    const form = useForm<PurchaseOrderForm>({
        initialValues: {
            vendor_id: null,
            department_id: intent.department_id,
            po_date: format(new Date(), 'yyyy-MM-dd'),
            expected_delivery_date: intent.required_date || format(new Date(), 'yyyy-MM-dd'),
            delivery_location: '',
            payment_terms: '',
            delivery_terms: '',
            warranty_terms: '',
            special_instructions: '',
            quality_requirements: '',
            inspection_requirements: '',
            testing_requirements: '',
            certification_requirements: '',
            quotation_reference: '',
            contract_reference: '',
            project_reference: '',
            currency: intent.currency || DEFAULT_CURRENCY,
            exchange_rate: 1,
            tax_amount: 0,
            freight_amount: 0,
            insurance_amount: 0,
            grand_total: intent.estimated_cost || 0,
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
            exchange_rate: (value) => (!value || value <= 0 ? 'Exchange rate must be greater than 0' : null),
            tax_amount: (value) => (value < 0 ? 'Tax amount cannot be negative' : null),
            freight_amount: (value) => (value < 0 ? 'Freight amount cannot be negative' : null),
            insurance_amount: (value) => (value < 0 ? 'Insurance amount cannot be negative' : null),
            items: (value) => (value.length === 0 ? 'At least one item is required' : null),
        },
    });

    const itemForm = useForm<PurchaseOrderItemForm>({
        initialValues: {
            item_name: '',
            item_code: '',
            description: '',
            specifications: '',
            quantity: 1,
            unit: '',
            unit_price: 0,
            total_price: 0,
            notes: '',
            brand: '',
            model: '',
            warranty_period: '',
            expected_delivery_date: '',
            delivery_location: '',
            quality_requirements: '',
            inspection_requirements: '',
            testing_requirements: '',
            item_id: undefined,
            equipment_id: undefined,
        },
        validate: {
            item_name: (value) => (!value ? 'Item name is required' : null),
            quantity: (value) => (!value || value <= 0 ? 'Quantity must be greater than 0' : null),
            unit_price: (value) => (!value || value <= 0 ? 'Unit price must be greater than 0' : null),
            total_price: (value) => (!value || value <= 0 ? 'Total price must be greater than 0' : null),
        },
    });

    const itemsTotal = useMemo(() => {
        return form.values.items.reduce((sum, item) => sum + item.total_price, 0);
    }, [form.values.items]);

    const grandTotal = useMemo(() => {
        const total = itemsTotal + form.values.tax_amount + form.values.freight_amount + form.values.insurance_amount;
        form.setFieldValue('grand_total', total);
        return total;
    }, [itemsTotal, form.values.tax_amount, form.values.freight_amount, form.values.insurance_amount]);

    const addItem = () => {
        const validation = itemForm.validate();
        if (validation.hasErrors) {
            console.log('Item form validation errors:', validation.errors);
            return;
        }

        const itemData = { ...itemForm.values };
        console.log('Adding item:', itemData);

        form.setFieldValue('items', [...form.values.items, itemData]);
        itemForm.reset();

        console.log('Items after adding:', form.values.items);
    };

    const removeItem = (index: number) => {
        form.setFieldValue('items', form.values.items.filter((_, i) => i !== index));
    };

    const handleConvert = (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        if (form.validate().hasErrors) {
            console.log('Form validation errors:', form.validate().errors);
            return;
        }

        console.log('Submitting form with data:', form.values);

        setConverting(true);
        router.post(route('purchases.intents.convert', intent.id), form.values as Record<string, any>, {
            onSuccess: () => {
                notifications.show({ message: 'Purchase order created successfully', color: 'green' });
                onClose();
            },
            onError: (errors) => {
                console.error('Conversion errors:', errors);
                notifications.show({ message: 'Failed to create purchase order', color: 'red' });
            },
            onFinish: () => setConverting(false)
        });
    };


    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Convert to Purchase Order - ${intent.intent_no}`}
            size="100%"
            closeOnClickOutside={false}
        >
            <form onSubmit={handleConvert}>
                <Stack gap="lg">
                    <Paper p="md" withBorder>
                        <Title order={4} mb="md">Basic Information</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Vendor"
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
                                    label="Department"
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
                                    label="PO Date"
                                    placeholder="Select date"
                                    value={form.values.po_date ? new Date(form.values.po_date) : null}
                                    onChange={(date) => form.setFieldValue('po_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <DateInput
                                    label="Expected Delivery Date"
                                    placeholder="Select date"
                                    value={form.values.expected_delivery_date ? new Date(form.values.expected_delivery_date) : null}
                                    onChange={(date) => form.setFieldValue('expected_delivery_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Delivery Location"
                                    placeholder="Enter delivery location"
                                    value={form.values.delivery_location}
                                    onChange={(e) => form.setFieldValue('delivery_location', e.target.value)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Payment Terms"
                                    placeholder="Enter payment terms"
                                    value={form.values.payment_terms}
                                    onChange={(e) => form.setFieldValue('payment_terms', e.target.value)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Delivery Terms"
                                    placeholder="Enter delivery terms"
                                    value={form.values.delivery_terms}
                                    onChange={(e) => form.setFieldValue('delivery_terms', e.target.value)}
                                    required
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>


                    {/* Items */}
                    <Paper p="md" withBorder mb="md">
                        <Title order={4} mb="md">Items</Title>
                        <Title order={5} mb="md">Add Item</Title>
                        <form onSubmit={(e) => { e.preventDefault(); addItem(); }}>
                            <Grid>
                                <Grid.Col span={3}>
                                    <Select
                                        label="Equipment/Item"
                                        placeholder="Select equipment or item"
                                        data={[
                                            ...equipment.map(eq => ({
                                                value: `equipment_${eq.id}`,
                                                label: eq.name,
                                                type: 'equipment',
                                                data: eq
                                            })),
                                            ...items.map(item => ({
                                                value: `item_${item.id}`,
                                                label: item.name,
                                                type: 'item',
                                                data: item
                                            }))
                                        ]}
                                        value={itemForm.values.item_id ? `item_${itemForm.values.item_id}` :
                                            itemForm.values.equipment_id ? `equipment_${itemForm.values.equipment_id}` : ''}
                                        onChange={(value) => {
                                            if (!value) {
                                                itemForm.reset();
                                                return;
                                            }

                                            const [type, id] = value.split('_');
                                            const numId = Number(id);

                                            if (type === 'equipment') {
                                                const selectedEquipment = equipment.find(eq => eq.id === numId);
                                                if (selectedEquipment) {
                                                    itemForm.setValues({
                                                        ...itemForm.values,
                                                        item_name: selectedEquipment.name,
                                                        item_code: selectedEquipment.code || '',
                                                        description: selectedEquipment.details || '',
                                                        unit_price: selectedEquipment.purchase_price || 0,
                                                        total_price: (selectedEquipment.purchase_price || 0) * itemForm.values.quantity,
                                                        equipment_id: numId,
                                                        item_id: undefined
                                                    });
                                                }
                                            } else if (type === 'item') {
                                                const selectedItem = items.find(item => item.id === numId);
                                                if (selectedItem) {
                                                    itemForm.setValues({
                                                        ...itemForm.values,
                                                        item_name: selectedItem.name,
                                                        item_code: selectedItem.code,
                                                        description: selectedItem.description_1 || selectedItem.description_2 || '',
                                                        unit_price: selectedItem.standard_cost || 0,
                                                        total_price: (selectedItem.standard_cost || 0) * itemForm.values.quantity,
                                                        unit: selectedItem.unit || '',
                                                        item_id: numId,
                                                        equipment_id: undefined
                                                    });
                                                }
                                            }
                                        }}
                                        searchable
                                        clearable
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <TextInput
                                        label="Item Name"
                                        placeholder="Enter item name"
                                        value={itemForm.values.item_name}
                                        onChange={(e) => itemForm.setFieldValue('item_name', e.target.value)}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={1}>
                                    <TextInput
                                        label="Item Code"
                                        placeholder="Enter item code"
                                        value={itemForm.values.item_code || ''}
                                        onChange={(e) => itemForm.setFieldValue('item_code', e.target.value)}
                                        readOnly
                                    />
                                </Grid.Col>
                                <Grid.Col span={1}>
                                    <NumberInput
                                        label="Quantity"
                                        placeholder="1"
                                        value={itemForm.values.quantity}
                                        onChange={(value) => {
                                            const numValue = typeof value === 'number' ? value : 1;
                                            itemForm.setFieldValue('quantity', numValue);
                                            itemForm.setFieldValue('total_price', numValue * itemForm.values.unit_price);
                                        }}
                                        min={1}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <Select
                                        label="Unit"
                                        placeholder="Select unit"
                                        data={[
                                            { value: 'set', label: 'Set' },
                                            { value: 'nos', label: 'Numbers' },
                                            { value: 'rmt', label: 'Running Meter' },
                                            { value: 'sqm', label: 'Square Meter' },
                                            { value: 'ltr', label: 'Liter' },
                                            { value: 'kg', label: 'Kilogram' },
                                            { value: 'ton', label: 'Ton' },
                                            { value: 'box', label: 'Box' },
                                            { value: 'pack', label: 'Pack' },
                                            { value: 'na', label: 'Not Applicable' }
                                        ]}
                                        value={itemForm.values.unit || ''}
                                        onChange={(value) => itemForm.setFieldValue('unit', value || '')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Unit Price"
                                        placeholder="0.00"
                                        value={itemForm.values.unit_price}
                                        onChange={(value) => {
                                            const numValue = typeof value === 'number' ? value : 0;
                                            itemForm.setFieldValue('unit_price', numValue);
                                            itemForm.setFieldValue('total_price', numValue * itemForm.values.quantity);
                                        }}
                                        min={0}
                                        required
                                        readOnly
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Description"
                                        placeholder="Enter item description"
                                        value={itemForm.values.description || ''}
                                        onChange={(e) => itemForm.setFieldValue('description', e.target.value)}
                                        rows={2}
                                    />
                                </Grid.Col>

                                <Grid.Col span={12}>
                                    <Group justify="flex-end">
                                        <Button type="submit" leftSection={<Plus size={16} />}>
                                            Add Item
                                        </Button>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                        </form>
                        {/* Items Table */}
                        {form.values.items.length > 0 && (
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Item Name</Table.Th>
                                        <Table.Th>Quantity</Table.Th>
                                        <Table.Th>Unit Price</Table.Th>
                                        <Table.Th>Total</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {form.values.items.map((item, index) => (
                                        <Table.Tr key={index}>
                                            <Table.Td>{item.item_name}</Table.Td>
                                            <Table.Td>{item.quantity}</Table.Td>
                                            <Table.Td>{formatCurrency(item.unit_price)}</Table.Td>
                                            <Table.Td>{formatCurrency(item.total_price)}</Table.Td>
                                            <Table.Td>
                                                <TableActionIcon
                                                    color="red"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </TableActionIcon>
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
                                    placeholder="Select currency"
                                    data={getCurrencyOptions()}
                                    value={form.values.currency || DEFAULT_CURRENCY}
                                    onChange={(value) => form.setFieldValue('currency', value || DEFAULT_CURRENCY)}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <NumberInput
                                    label="Exchange Rate"
                                    placeholder="1.00"
                                    value={form.values.exchange_rate}
                                    onChange={(value) => form.setFieldValue('exchange_rate', typeof value === 'number' ? value : 1)}
                                    min={0}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <NumberInput
                                    label="Tax Amount"
                                    placeholder="0.00"
                                    value={form.values.tax_amount}
                                    onChange={(value) => form.setFieldValue('tax_amount', typeof value === 'number' ? value : 0)}
                                    min={0}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <NumberInput
                                    label="Freight Amount"
                                    placeholder="0.00"
                                    value={form.values.freight_amount}
                                    onChange={(value) => form.setFieldValue('freight_amount', typeof value === 'number' ? value : 0)}
                                    min={0}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <NumberInput
                                    label="Insurance Amount"
                                    placeholder="0.00"
                                    value={form.values.insurance_amount}
                                    onChange={(value) => form.setFieldValue('insurance_amount', typeof value === 'number' ? value : 0)}
                                    min={0}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Text size="lg" fw={600}>
                                    Grand Total: {getCurrencySymbol(form.values.currency)} {grandTotal}
                                </Text>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    <Group justify="flex-end" gap="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={converting}>
                            Create Purchase Order
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}

export default ConvertPO