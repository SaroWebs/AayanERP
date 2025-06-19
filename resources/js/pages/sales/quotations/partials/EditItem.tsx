import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Divider, Box, Title, ActionIcon, Table, Switch, Badge, Loader, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Quotation } from '@/types/sales';
import { formatCurrency } from '@/utils/format';

interface Client {
    id: number;
    name: string;
    contact_details?: Array<{
        id: number;
        contact_person: string;
    }>;
}

interface Props {
    opened: boolean;
    onClose: () => void;
    quotation: Quotation;
    clients: Client[];
    loading: boolean;
}

interface Equipment {
    id: number;
    name: string;
    rental_rate: number | null;
    purchase_price: number | null;
}

interface QuotationItem {
    equipment_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    rental_period?: number;
    rental_period_unit?: 'hours' | 'days' | 'months' | 'years';
    notes?: string;
}

interface QuotationItemForm {
    equipment_id: number | null;
    quantity: number;
    unit_price: number;
    is_rental: boolean;
    rental_period: number | null;
    rental_period_unit: 'hours' | 'days' | 'months' | 'years' | null;
    total_price: number;
    notes?: string;
}

export function EditItem({ opened, onClose, quotation, clients, loading: clientsLoading }: Props) {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [isRental, setIsRental] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (opened) {
            loadEquipments();
        }
    }, [opened]);

    const loadEquipments = async () => {
        setLoading(true);
        axios.get('/sales/enquiries/get-equipment-list')
            .then(response => setEquipments(response.data))
            .catch(error => {
                notifications.show({ message: 'Failed to load equipment data', color: 'red' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const form = useForm<Partial<Quotation>>({
        initialValues: {
            client_detail_id: quotation.client_detail_id,
            contact_person_id: quotation.contact_person_id,
            subject: quotation.subject,
            description: quotation.description,
            type: quotation.type,
            currency: quotation.currency,
            tax_percentage: quotation.tax_percentage,
            discount_percentage: quotation.discount_percentage,
            payment_terms_days: quotation.payment_terms_days,
            advance_percentage: quotation.advance_percentage,
            quotation_date: quotation.quotation_date,
            valid_until: quotation.valid_until,
            deployment_state: quotation.deployment_state,
            location: quotation.location,
            site_details: quotation.site_details,
            payment_terms: quotation.payment_terms,
            delivery_terms: quotation.delivery_terms,
            special_conditions: quotation.special_conditions,
            terms_conditions: quotation.terms_conditions,
            notes: quotation.notes,
            client_remarks: quotation.client_remarks,
            items: quotation.items
        },
        validate: {
            client_detail_id: (value) => (!value ? 'Client is required' : null),
            quotation_date: (value) => (!value ? 'Quotation date is required' : null),
            valid_until: (value) => (!value ? 'Valid until date is required' : null),
            type: (value) => (!value ? 'Type is required' : null),
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
            equipment_id: null,
            quantity: 1,
            unit_price: 0,
            is_rental: false,
            rental_period: null,
            rental_period_unit: null,
            total_price: 0,
            notes: ''
        }
    });

    const handleEquipmentSelect = (equipmentId: string | null) => {
        if (!equipmentId) return;
        const equipment = equipments.find(e => e.id === Number(equipmentId));
        if (equipment) {
            setSelectedEquipment(equipment);
            itemForm.setFieldValue('equipment_id', Number(equipmentId));
            itemForm.setFieldValue('unit_price', isRental ? (equipment.rental_rate || 0) : (equipment.purchase_price || 0));
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

    useEffect(() => {
        form.setFieldValue('subtotal', totals.subtotal);
        form.setFieldValue('tax_amount', totals.taxAmount);
        form.setFieldValue('discount_amount', totals.discountAmount);
        form.setFieldValue('total_amount', totals.totalAmount);
    }, [totals]);

    const addItem = () => {
        const { equipment_id, quantity, unit_price, is_rental, rental_period, rental_period_unit } = itemForm.values;
        
        if (!equipment_id || !selectedEquipment) {
            notifications.show({ message: 'Please select an equipment', color: 'red' });
            return;
        }

        const newItem: QuotationItem = {
            equipment_id: equipment_id,
            quantity,
            unit_price,
            total_price: totalPrice,
            rental_period: is_rental && rental_period ? rental_period : undefined,
            rental_period_unit: is_rental && rental_period_unit ? rental_period_unit : undefined,
            notes: ''
        };

        form.setFieldValue('items', [...(form.values.items || []), newItem]);
        
        // Reset form
        itemForm.reset();
        setSelectedEquipment(null);
    };

    const removeItem = (index: number) => {
        const items = [...(form.values.items || [])];
        items.splice(index, 1);
        form.setFieldValue('items', items);
    };

    const handleSubmit = (values: Partial<Quotation>) => {
        // Ensure all required fields are present and properly formatted
        const submissionData = {
            // Required fields from controller validation
            client_detail_id: values.client_detail_id,
            contact_person_id: values.contact_person_id || null,
            type: values.type,
            quotation_date: values.quotation_date,
            valid_until: values.valid_until,
            currency: values.currency,
            subtotal: totals.subtotal,
            tax_percentage: values.tax_percentage,
            tax_amount: totals.taxAmount,
            discount_percentage: values.discount_percentage || null,
            discount_amount: totals.discountAmount || null,
            total_amount: totals.totalAmount,
            payment_terms_days: values.payment_terms_days,
            advance_percentage: values.advance_percentage,
            
            // Optional fields
            subject: values.subject || null,
            description: values.description || null,
            payment_terms: values.payment_terms || null,
            delivery_terms: values.delivery_terms || null,
            deployment_state: values.deployment_state || null,
            location: values.location || null,
            site_details: values.site_details || null,
            special_conditions: values.special_conditions || null,
            terms_conditions: values.terms_conditions || null,
            notes: values.notes || null,
            client_remarks: values.client_remarks || null,

            // Items array with required fields
            items: values.items?.map(item => ({
                equipment_id: item.equipment_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                rental_period_unit: item.rental_period_unit || 'days',
                rental_period: item.rental_period || null,
                notes: item.notes || null
            }))
        };

        // Validate required fields before submission
        if (!submissionData.items || submissionData.items.length === 0) {
            notifications.show({ 
                message: 'At least one item is required', 
                color: 'red' 
            });
            return;
        }

        axios.put(route('sales.quotations.update', quotation.id), submissionData)
            .then(() => {
                notifications.show({ message: 'Quotation updated successfully', color: 'green' });
                onClose();
                router.reload();
            })
            .catch((error) => {
                notifications.show({ 
                    message: error.response?.data?.message || 'Failed to update quotation', 
                    color: 'red' 
                });
            });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Edit Quotation ${quotation.quotation_no}`}
            size="95%"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    {/* Client Information */}
                    <Paper withBorder p="md">
                        <Title order={4} mb="md">Client Information</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Client"
                                    placeholder="Select client"
                                    searchable
                                    required
                                    data={clients.map(client => ({ value: client.id.toString(), label: client.name }))}
                                    disabled={clientsLoading}
                                    rightSection={clientsLoading ? <Loader size="xs" /> : null}
                                    {...form.getInputProps('client_detail_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="Contact Person"
                                    placeholder="Select contact person"
                                    searchable
                                    clearable
                                    data={clients
                                        .find(client => client.id.toString() === form.values.client_detail_id?.toString())
                                        ?.contact_details?.map(person => ({
                                            value: person.id.toString(),
                                            label: person.contact_person
                                        })) || []}
                                    disabled={clientsLoading || !form.values.client_detail_id}
                                    rightSection={clientsLoading ? <Loader size="xs" /> : null}
                                    {...form.getInputProps('contact_person_id')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Quotation Details */}
                    <Paper withBorder p="md">
                        <Title order={4} mb="md">Quotation Details</Title>
                        <Grid>
                            <Grid.Col span={3}>
                                <TextInput
                                    label="Subject"
                                    placeholder="Enter subject"
                                    {...form.getInputProps('subject')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Select
                                    label="Type"
                                    data={[
                                        { value: 'equipment', label: 'Equipment' },
                                        { value: 'scaffolding', label: 'Scaffolding' },
                                        { value: 'both', label: 'Both' },
                                    ]}
                                    required
                                    {...form.getInputProps('type')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Select
                                    label="Currency"
                                    data={[
                                        { value: 'INR', label: 'Indian Rupee (INR)' },
                                        { value: 'USD', label: 'US Dollar (USD)' },
                                        { value: 'EUR', label: 'Euro (EUR)' },
                                        { value: 'GBP', label: 'British Pound (GBP)' },
                                        { value: 'AED', label: 'UAE Dirham (AED)' },
                                    ]}
                                    required
                                    {...form.getInputProps('currency')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <DateInput
                                    label="Quotation Date"
                                    placeholder="Select date"
                                    required
                                    {...form.getInputProps('quotation_date')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <DateInput
                                    label="Valid Until"
                                    placeholder="Select date"
                                    required
                                    {...form.getInputProps('valid_until')}
                                />
                            </Grid.Col>
                            <Grid.Col span={9}>
                                <Textarea
                                    label="Description"
                                    placeholder="Enter description"
                                    {...form.getInputProps('description')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Add Items Section */}
                    <Paper withBorder p="md">
                        <Title order={4} mb="md">Add Items</Title>
                        <Stack gap="md">
                            <Grid align='end'>
                                <Grid.Col span={3}>
                                    <Select
                                        label="Equipment"
                                        placeholder="Select equipment"
                                        searchable
                                        data={equipments.map(e => ({ value: e.id.toString(), label: e.name }))}
                                        value={itemForm.values.equipment_id?.toString()}
                                        onChange={handleEquipmentSelect}
                                        disabled={loading}
                                        rightSection={loading ? <Loader size="xs" /> : null}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Quantity"
                                        min={1}
                                        value={itemForm.values.quantity}
                                        onChange={(value) => {
                                            itemForm.setFieldValue('quantity', Number(value));
                                        }}
                                        disabled={!itemForm.values.equipment_id}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Unit Price"
                                        min={0}
                                        value={itemForm.values.unit_price}
                                        onChange={(value) => {
                                            itemForm.setFieldValue('unit_price', Number(value));
                                        }}
                                        disabled={!itemForm.values.equipment_id}
                                    />
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <NumberInput
                                        label="Total Price"
                                        value={totalPrice}
                                        readOnly
                                        disabled={!itemForm.values.equipment_id}
                                    />
                                </Grid.Col>
                                <Grid.Col span={1}>
                                    <Switch
                                        label="Rental"
                                        checked={isRental}
                                        onChange={(event) => {
                                            setIsRental(event.currentTarget.checked);
                                            itemForm.setFieldValue('is_rental', event.currentTarget.checked);
                                            if (selectedEquipment) {
                                                itemForm.setFieldValue('unit_price', 
                                                    event.currentTarget.checked 
                                                        ? (selectedEquipment.rental_rate || 0)
                                                        : (selectedEquipment.purchase_price || 0)
                                                );
                                            }
                                        }}
                                        disabled={!itemForm.values.equipment_id}
                                    />
                                </Grid.Col>
                                {isRental && (
                                    <>
                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label="Rental Period"
                                                min={1}
                                                value={itemForm.values.rental_period || undefined}
                                                onChange={(value) => {
                                                    itemForm.setFieldValue('rental_period', value ? Number(value) : null);
                                                }}
                                                disabled={!itemForm.values.equipment_id}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Select
                                                label="Rental Period Unit"
                                                data={[
                                                    { value: 'hours', label: 'Hours' },
                                                    { value: 'days', label: 'Days' },
                                                    { value: 'months', label: 'Months' },
                                                    { value: 'years', label: 'Years' },
                                                ]}
                                                value={itemForm.values.rental_period_unit}
                                                onChange={(value) => {
                                                    itemForm.setFieldValue('rental_period_unit', value as 'hours' | 'days' | 'months' | 'years');
                                                }}
                                                disabled={!itemForm.values.equipment_id}
                                            />
                                        </Grid.Col>
                                    </>
                                )}
                                <Grid.Col span={2}>
                                    <Button 
                                        leftSection={<Plus size={16} />}
                                        onClick={addItem}
                                        variant="light"
                                        disabled={!itemForm.values.equipment_id}
                                    >
                                        Add Item
                                    </Button>
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Paper>

                    {/* Items Table */}
                    <Paper withBorder p="md">
                        <Title order={4} mb="md">Added Items</Title>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Equipment</Table.Th>
                                    <Table.Th>Quantity</Table.Th>
                                    <Table.Th>Unit Price</Table.Th>
                                    <Table.Th>Total Price</Table.Th>
                                    <Table.Th>Rental Period</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {(form.values.items || []).map((item, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>{selectedEquipment?.name}</Table.Td>
                                        <Table.Td>{item.quantity}</Table.Td>
                                        <Table.Td>{item.unit_price}</Table.Td>
                                        <Table.Td>{item.total_price}</Table.Td>
                                        <Table.Td>
                                            {item.rental_period && item.rental_period_unit 
                                                ? `${item.rental_period} ${item.rental_period_unit}`
                                                : '-'
                                            }
                                        </Table.Td>
                                        <Table.Td>
                                            <ActionIcon 
                                                color="red" 
                                                variant="light"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 size={16} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>

                    {/* Financial Details */}
                    <Paper withBorder p="md">
                        <Title order={4} mb="md">Financial Details</Title>
                        <Grid>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Tax Percentage"
                                    min={0}
                                    max={100}
                                    required
                                    {...form.getInputProps('tax_percentage')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Discount Percentage"
                                    min={0}
                                    max={100}
                                    {...form.getInputProps('discount_percentage')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Advance Percentage"
                                    min={0}
                                    max={100}
                                    required
                                    {...form.getInputProps('advance_percentage')}
                                />
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <NumberInput
                                    label="Payment Terms (Days)"
                                    min={0}
                                    required
                                    {...form.getInputProps('payment_terms_days')}
                                />
                            </Grid.Col>
                        </Grid>

                        <Divider my="md" />

                        <Title order={5} mb="md">Financial Summary</Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Subtotal</Text>
                                    <Text fw={500}>
                                        {form.values.currency} {formatCurrency(totals.subtotal)}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Tax Amount</Text>
                                    <Text>
                                        {form.values.currency} {formatCurrency(totals.taxAmount)}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Discount Amount</Text>
                                    <Text>
                                        {form.values.currency} {formatCurrency(totals.discountAmount)}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Total Amount</Text>
                                    <Text fw={500} size="lg">
                                        {form.values.currency} {formatCurrency(totals.totalAmount)}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Paper>

                    {/* Terms & Conditions */}
                    <Paper withBorder p="md">
                        <Title order={4} mb="md">Terms & Conditions</Title>
                        <Stack>
                            <Textarea
                                label="Payment Terms"
                                placeholder="Enter payment terms"
                                {...form.getInputProps('payment_terms')}
                            />
                            <Textarea
                                label="Delivery Terms"
                                placeholder="Enter delivery terms"
                                {...form.getInputProps('delivery_terms')}
                            />
                            <Textarea
                                label="Special Conditions"
                                placeholder="Enter special conditions"
                                {...form.getInputProps('special_conditions')}
                            />
                            <Textarea
                                label="Terms & Conditions"
                                placeholder="Enter terms and conditions"
                                {...form.getInputProps('terms_conditions')}
                            />
                            <Textarea
                                label="Notes"
                                placeholder="Enter notes"
                                {...form.getInputProps('notes')}
                            />
                        </Stack>
                    </Paper>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update Quotation
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 