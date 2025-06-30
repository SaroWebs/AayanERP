import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { router } from '@inertiajs/react';
import { DateInput } from '@mantine/dates';
import { format, addDays } from 'date-fns';
import { PurchaseOrder, Department, Item } from '@/types/purchase';
import axios from 'axios';

interface Props {
  opened: boolean;
  onClose: () => void;
  departments: Department[];
  loading: boolean;
  items: Item
}

export function AddNewOrder({ opened, onClose, departments, loading , items}: Props) {
  const form = useForm<Partial<PurchaseOrder>>({
    initialValues: {
      po_no: '',
      vendor_id: undefined,
      department_id: undefined,
      po_date: format(new Date(), 'yyyy-MM-dd'),
      expected_delivery_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      delivery_location: '',
      payment_terms: '',
      delivery_terms: '',
      warranty_terms: '',
      special_instructions: '',
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
      po_no: (value) => (!value ? 'PO No is required' : null),
      vendor_id: (value) => (!value ? 'Vendor is required' : null),
      department_id: (value) => (!value ? 'Department is required' : null),
      po_date: (value) => (!value ? 'PO Date is required' : null),
      currency: (value) => (!value ? 'Currency is required' : null),
    },
  });

  const handleSubmit = async (values: Partial<PurchaseOrder>) => {
    const { items, ...payload } = values;
    try {
      await axios.post('/purchases/data/orders', payload);
      notifications.show({ message: 'Purchase order created successfully', color: 'green' });
      onClose();
      form.reset();
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
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Paper p="md" withBorder>
            <Title order={4} mb="md">Order Details</Title>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="PO No"
                  placeholder="Enter PO number"
                  value={form.values.po_no || ''}
                  onChange={(e) => form.setFieldValue('po_no', e.target.value)}
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
              <Grid.Col span={6}>
                <TextInput
                  label="Special Instructions"
                  placeholder="Enter special instructions"
                  value={form.values.special_instructions || ''}
                  onChange={(e) => form.setFieldValue('special_instructions', e.target.value)}
                />
              </Grid.Col>
            </Grid>
          </Paper>
          {/* Add more sections as needed for financial, quality, etc. */}
          <Group justify="end">
            <Button type="submit" loading={loading}>Create</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 