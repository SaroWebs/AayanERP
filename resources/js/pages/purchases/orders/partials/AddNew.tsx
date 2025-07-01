import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Title, FileInput, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { Department, Item, PurchaseIntent, Vendor } from '@/types/purchase';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props {
  opened: boolean;
  onClose: () => void;
  departments: Department[];
  vendors: Vendor[];
  loading: boolean;
  products: Item[];
  purchaseIntents: PurchaseIntent[];
}

export function AddNewOrder({ opened, onClose, departments, vendors, loading, products, purchaseIntents }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [itemModalOpened, setItemModalOpened] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState<any>({});
  const [linkToIntent, setLinkToIntent] = useState(false);
  const [selectedIntentId, setSelectedIntentId] = useState<number | null>(null);
  const [document, setDocument] = useState<File | null>(null);

  const form = useForm<any>({
    initialValues: {
      vendor_id: undefined,
      department_id: undefined,
      po_date: format(new Date(), 'yyyy-MM-dd'),
      expected_delivery_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      subject: '',
      description: '',
      purchase_intent_id: undefined,
      quotation_reference: '',
      contract_reference: '',
      project_reference: '',
      delivery_location: '',
      payment_terms: '',
      delivery_terms: '',
      warranty_terms: '',
      special_instructions: '',
      quality_requirements: '',
      inspection_requirements: '',
      testing_requirements: '',
      certification_requirements: '',
      total_amount: 0,
      tax_amount: 0,
      freight_amount: 0,
      insurance_amount: 0,
      grand_total: 0,
      currency: 'INR',
      exchange_rate: 1,
      status: 'draft',
      approval_status: 'pending',
    },
    validate: {
      vendor_id: (value) => (!value ? 'Vendor is required' : null),
      department_id: (value) => (!value ? 'Department is required' : null),
      po_date: (value) => (!value ? 'PO Date is required' : null),
      subject: (value) => (!value ? 'Subject is required' : null),
      currency: (value) => (!value ? 'Currency is required' : null),
      total_amount: (value) => (value < 0 ? 'Total amount must be positive' : null),
      grand_total: (value) => (value < 0 ? 'Grand total must be positive' : null),
    },
  });

  useEffect(() => {
    if (opened) {
      setItems([]);
      setEditingItemIndex(null);
      setItemForm({});
      setLinkToIntent(false);
      setSelectedIntentId(null);
      setDocument(null);
      form.reset();
    }
  }, [opened]);

  useEffect(() => {
    if (linkToIntent && selectedIntentId) {
      const intent = purchaseIntents.find((i) => i.id === selectedIntentId);
      if (intent) {
        form.setValues({
          department_id: intent.department_id || 0,
          po_date: intent.intent_date || format(new Date(), 'yyyy-MM-dd'),
          expected_delivery_date: intent.required_date || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          delivery_location: '',
          payment_terms: '',
          delivery_terms: '',
          warranty_terms: '',
          special_instructions: intent.notes || '',
          currency: intent.currency || 'INR',
        });
      }
    }
  }, [linkToIntent, selectedIntentId]);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    form.setFieldValue('total_amount', total);
    const grand = total + Number(form.values.tax_amount || 0) + Number(form.values.freight_amount || 0) + Number(form.values.insurance_amount || 0);
    form.setFieldValue('grand_total', grand);
  }, [items, form.values.tax_amount, form.values.freight_amount, form.values.insurance_amount]);

  const openAddItemModal = () => {
    setEditingItemIndex(null);
    setItemForm({
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
      status: 'pending',
      received_quantity: 0,
      received_date: undefined,
      receipt_remarks: '',
    });
    setItemModalOpened(true);
  };

  const openEditItemModal = (index: number) => {
    setEditingItemIndex(index);
    setItemForm(items[index]);
    setItemModalOpened(true);
  };

  const handleItemFormChange = (field: string, value: any) => {
    setItemForm((prev: any) => ({ ...prev, [field]: value }));
    if (field === 'quantity' || field === 'unit_price') {
      setItemForm((prev: any) => ({ ...prev, total_price: (prev.quantity || 0) * (prev.unit_price || 0) }));
    }
  };

  const handleItemFormSubmit = () => {
    if (!itemForm.item_name || !itemForm.quantity || !itemForm.unit_price) {
      notifications.show({ message: 'Item name, quantity, and unit price are required', color: 'red' });
      return;
    }
    if (editingItemIndex !== null) {
      const updated = [...items];
      updated[editingItemIndex] = itemForm;
      setItems(updated);
    } else {
      setItems([...items, itemForm]);
    }
    setItemModalOpened(false);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: any) => {
    const payload = { ...values, items };
    if (linkToIntent && selectedIntentId) {
      payload.purchase_intent_id = selectedIntentId;
    }
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'items') {
        formData.append('items', JSON.stringify(value));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, String(value));
      }
    });
    if (document) {
      formData.append('document', document);
    }
    try {
      await axios.post('/purchases/data/orders', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      notifications.show({ message: 'Purchase order created successfully', color: 'green' });
      onClose();
      form.reset();
      setItems([]);
      setDocument(null);
    } catch (error) {
      notifications.show({ message: 'Failed to create purchase order', color: 'red' });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Purchase Order"
      size="xl"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)} encType="multipart/form-data">
        <Stack gap="lg">
          {purchaseIntents?.length > 0 ?
            <Paper p="md" withBorder>
              <Box className="flex justify-between items-start">
                <Group>

                <input
                  type="checkbox"
                  checked={linkToIntent}
                  onChange={e => setLinkToIntent(e.target.checked)}
                  id="link-to-intent"
                />
                <label htmlFor="link-to-intent">From Purchase Intent</label>
                </Group>
                {linkToIntent && (
                  <Select
                    label="Select Purchase Intent"
                    placeholder="Select intent"
                    data={purchaseIntents.map(i => ({ value: i.id.toString(), label: `${i.intent_no} - ${i.subject}` }))}
                    value={selectedIntentId ? selectedIntentId.toString() : ''}
                    onChange={value => setSelectedIntentId(value ? Number(value) : null)}
                    style={{ minWidth: 300 }}
                  />
                )}
              </Box>
            </Paper>
            : ''}
          <Paper p="md" withBorder>
            <Title order={4} mb="md">Order Details</Title>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Vendor"
                  placeholder="Select vendor"
                  data={vendors.map(v => ({ value: v.id.toString(), label: v.name }))}
                  value={form.values.vendor_id?.toString() || ''}
                  onChange={(value) => form.setFieldValue('vendor_id', value ? Number(value) : undefined)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Department"
                  placeholder="Select department"
                  data={departments.map(dept => ({ value: dept.id.toString(), label: dept.name }))}
                  value={form.values.department_id?.toString() || ''}
                  onChange={(value) => form.setFieldValue('department_id', value ? Number(value) : undefined)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Subject"
                  placeholder="Enter subject"
                  value={form.values.subject || ''}
                  onChange={(e) => form.setFieldValue('subject', e.target.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Description"
                  placeholder="Enter description"
                  value={form.values.description || ''}
                  onChange={(e) => form.setFieldValue('description', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="PO Date"
                  placeholder="Select date"
                  value={form.values.po_date ? new Date(form.values.po_date) : null}
                  onChange={(value) => form.setFieldValue('po_date', value ? format(value, 'yyyy-MM-dd') : '')}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label="Expected Delivery Date"
                  placeholder="Select date"
                  value={form.values.expected_delivery_date ? new Date(form.values.expected_delivery_date) : null}
                  onChange={(value) => form.setFieldValue('expected_delivery_date', value ? format(value, 'yyyy-MM-dd') : '')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Quotation Reference"
                  placeholder="Enter quotation reference"
                  value={form.values.quotation_reference || ''}
                  onChange={(e) => form.setFieldValue('quotation_reference', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Contract Reference"
                  placeholder="Enter contract reference"
                  value={form.values.contract_reference || ''}
                  onChange={(e) => form.setFieldValue('contract_reference', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Project Reference"
                  placeholder="Enter project reference"
                  value={form.values.project_reference || ''}
                  onChange={(e) => form.setFieldValue('project_reference', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Delivery Location"
                  placeholder="Enter delivery location"
                  value={form.values.delivery_location || ''}
                  onChange={(e) => form.setFieldValue('delivery_location', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Payment Terms"
                  placeholder="Enter payment terms"
                  value={form.values.payment_terms || ''}
                  onChange={(e) => form.setFieldValue('payment_terms', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Delivery Terms"
                  placeholder="Enter delivery terms"
                  value={form.values.delivery_terms || ''}
                  onChange={(e) => form.setFieldValue('delivery_terms', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Warranty Terms"
                  placeholder="Enter warranty terms"
                  value={form.values.warranty_terms || ''}
                  onChange={(e) => form.setFieldValue('warranty_terms', e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Special Instructions"
                  placeholder="Enter special instructions"
                  value={form.values.special_instructions || ''}
                  onChange={(e) => form.setFieldValue('special_instructions', e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Paper>
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={5}>Items</Title>
              <Button size="xs" onClick={openAddItemModal}>Add Item</Button>
            </Group>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Warranty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.item_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.unit_price}</td>
                    <td>{item.total_price}</td>
                    <td>{item.brand}</td>
                    <td>{item.model}</td>
                    <td>{item.warranty_period}</td>
                    <td>
                      <Button size="xs" variant="light" onClick={() => openEditItemModal(idx)}>Edit</Button>
                      <Button size="xs" color="red" variant="subtle" onClick={() => handleDeleteItem(idx)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
          <Paper p="md" withBorder>
            <FileInput
              label="Attach Document (optional)"
              placeholder="Upload document"
              value={document}
              onChange={setDocument}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />
          </Paper>
          <Group justify="end">
            <Button type="submit" loading={loading}>Create</Button>
          </Group>
        </Stack>
      </form>
      <Modal opened={itemModalOpened} onClose={() => setItemModalOpened(false)} title={editingItemIndex !== null ? 'Edit Item' : 'Add Item'}>
        <Stack>
          <Select
            label="Product"
            placeholder="Select a product"
            data={products.map(p => ({ value: p.id.toString(), label: p.name }))}
            value={itemForm.item_id ? itemForm.item_id.toString() : ''}
            onChange={value => {
              const selected = products.find(p => p.id.toString() === value);
              if (selected) {
                setItemForm((prev: any) => ({
                  ...prev,
                  item_id: selected.id,
                  item_name: selected.name,
                  unit: selected.unit,
                  unit_price: Number(selected.standard_cost) || 0,
                  description: selected.description,
                  brand: selected.make,
                  model: selected.model_no,
                  warranty_period: selected.warranty_period,
                }));
              }
            }}
            required
          />
          <NumberInput label="Quantity" value={itemForm.quantity || 1} onChange={value => handleItemFormChange('quantity', value)} min={1} required />
          <TextInput label="Unit" value={itemForm.unit || ''} readOnly />
          <NumberInput label="Unit Price" value={itemForm.unit_price || 0} onChange={value => handleItemFormChange('unit_price', value)} min={0} required />
          <NumberInput label="Total Price" value={itemForm.total_price || 0} readOnly />
          <TextInput label="Brand" value={itemForm.brand || ''} onChange={e => handleItemFormChange('brand', e.target.value)} />
          <TextInput label="Model" value={itemForm.model || ''} onChange={e => handleItemFormChange('model', e.target.value)} />
          <TextInput label="Warranty Period" value={itemForm.warranty_period || ''} onChange={e => handleItemFormChange('warranty_period', e.target.value)} />
          <Textarea label="Description" value={itemForm.description || ''} onChange={e => handleItemFormChange('description', e.target.value)} />
          <Textarea label="Specifications" value={itemForm.specifications || ''} onChange={e => handleItemFormChange('specifications', e.target.value)} />
          <Textarea label="Notes" value={itemForm.notes || ''} onChange={e => handleItemFormChange('notes', e.target.value)} />
          <Textarea label="Quality Requirements" value={itemForm.quality_requirements || ''} onChange={e => handleItemFormChange('quality_requirements', e.target.value)} />
          <Textarea label="Inspection Requirements" value={itemForm.inspection_requirements || ''} onChange={e => handleItemFormChange('inspection_requirements', e.target.value)} />
          <Textarea label="Testing Requirements" value={itemForm.testing_requirements || ''} onChange={e => handleItemFormChange('testing_requirements', e.target.value)} />
          <Group justify="end">
            <Button onClick={handleItemFormSubmit}>{editingItemIndex !== null ? 'Update' : 'Add'} Item</Button>
          </Group>
        </Stack>
      </Modal>
    </Modal>
  );
} 