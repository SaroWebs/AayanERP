import { Modal, Button, TextInput, Select, NumberInput, Textarea, Group, Stack, Grid, Paper, Title, Table } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import { format } from 'date-fns';
import { PurchaseOrder, Department, Item ,Vendor} from '@/types/purchase';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
	opened: boolean;
	onClose: () => void;
	order: PurchaseOrder;
	departments: Department[];
	vendors:Vendor[];
	loading: boolean;
	products: Item[];
}

export function EditOrderItem({ opened, onClose, order, departments, loading, products, vendors }: Props) {
	const [items, setItems] = useState(order.items || []);
	const [itemModalOpened, setItemModalOpened] = useState(false);
	const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
	const [itemForm, setItemForm] = useState<any>({});

	const form = useForm<Partial<PurchaseOrder>>({
		initialValues: {
			po_no: order.po_no,
			vendor_id: order.vendor_id,
			department_id: order.department_id,
			po_date: order.po_date,
			expected_delivery_date: order.expected_delivery_date,
			delivery_location: order.delivery_location,
			payment_terms: order.payment_terms,
			delivery_terms: order.delivery_terms,
			warranty_terms: order.warranty_terms,
			special_instructions: order.special_instructions,
			quality_requirements: order.quality_requirements,
			inspection_requirements: order.inspection_requirements,
			testing_requirements: order.testing_requirements,
			certification_requirements: order.certification_requirements,
			quotation_reference: order.quotation_reference,
			contract_reference: order.contract_reference,
			project_reference: order.project_reference,
			total_amount: order.total_amount,
			tax_amount: order.tax_amount,
			freight_amount: order.freight_amount,
			insurance_amount: order.insurance_amount,
			grand_total: order.grand_total,
			currency: order.currency,
			exchange_rate: order.exchange_rate,
			status: order.status,
			approval_status: order.approval_status,
		},
		validate: {
			po_no: (value) => (!value ? 'PO No is required' : null),
			vendor_id: (value) => (!value ? 'Vendor is required' : null),
			department_id: (value) => (!value ? 'Department is required' : null),
			po_date: (value) => (!value ? 'PO Date is required' : null),
			currency: (value) => (!value ? 'Currency is required' : null),
		},
	});

	useEffect(() => {
		if (opened && order) {
			form.setValues({
				po_no: order.po_no,
				vendor_id: order.vendor_id,
				department_id: order.department_id,
				po_date: order.po_date,
				expected_delivery_date: order.expected_delivery_date,
				delivery_location: order.delivery_location,
				payment_terms: order.payment_terms,
				delivery_terms: order.delivery_terms,
				warranty_terms: order.warranty_terms,
				special_instructions: order.special_instructions,
				total_amount: order.total_amount,
				tax_amount: order.tax_amount,
				freight_amount: order.freight_amount,
				insurance_amount: order.insurance_amount,
				grand_total: order.grand_total,
				currency: order.currency,
				exchange_rate: order.exchange_rate,
				status: order.status,
				approval_status: order.approval_status,
			});
		}
	}, [opened, order]);

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
		console.log(products);

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
		// Basic validation
		if (!itemForm.item_name || !itemForm.quantity || !itemForm.unit_price) {
			notifications.show({ message: 'Item name, quantity, and unit price are required', color: 'red' });
			return;
		}
		if (editingItemIndex !== null) {
			// Edit existing
			const updated = [...items];
			updated[editingItemIndex] = itemForm;
			setItems(updated);
		} else {
			// Add new
			setItems([...items, itemForm]);
		}
		setItemModalOpened(false);
	};

	const handleDeleteItem = (index: number) => {
		setItems(items.filter((_, i) => i !== index));
	};

	const handleSubmit = async (values: Partial<PurchaseOrder>) => {
		try {
			await axios.put(`/purchases/data/orders/${order.id}`, { ...values, items });
			notifications.show({ message: 'Purchase order updated successfully', color: 'green' });
			onClose();
		} catch (error) {
			notifications.show({ message: 'Failed to update purchase order', color: 'red' });
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={`Edit Purchase Order - ${order.po_no}`}
			size="xl"
			closeOnClickOutside={false}
			scrollAreaComponent={Stack}
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
					<Paper p="md" withBorder>
						<Group justify="space-between" mb="md">
							<Title order={5}>Items</Title>
							<Button size="xs" onClick={openAddItemModal}>Add Item</Button>
						</Group>
						<Table>
							<thead>
								<tr>
									<th>Item Name</th>
									<th>Quantity</th>
									<th>Unit</th>
									<th>Unit Price</th>
									<th>Total Price</th>
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
										<td>
											<Button size="xs" variant="light" onClick={() => openEditItemModal(idx)}>Edit</Button>
											<Button size="xs" color="red" variant="subtle" onClick={() => handleDeleteItem(idx)}>Delete</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</Paper>
					<Group justify="end">
						<Button type="submit" loading={loading}>Update</Button>
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
								}));
							}
						}}
						required
					/>
					<NumberInput label="Quantity" value={itemForm.quantity || 1} onChange={value => handleItemFormChange('quantity', value)} min={1} required />
					<TextInput label="Unit" value={itemForm.unit || ''} readOnly />
					<NumberInput label="Unit Price" value={itemForm.unit_price || 0} readOnly />
					<Textarea label="Description" value={itemForm.description || ''} />
					{/* Add more fields as needed, e.g. brand, model, warranty, etc. */}
					<Group justify="end">
						<Button onClick={handleItemFormSubmit}>{editingItemIndex !== null ? 'Update' : 'Add'} Item</Button>
					</Group>
				</Stack>
			</Modal>
		</Modal>
	);
} 