import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Tabs, JsonInput } from '@mantine/core';
import { DateInput, YearPickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { 
    SimplifiedCategory, 
    Series, 
    EquipmentFormData
} from '@/types/equipment';

interface Props {
    opened: boolean;
    onClose: () => void;
    series: Series[];
    categories: SimplifiedCategory[];
}

export default function CreateEquipmentModal({ opened, onClose, series, categories }: Props) {
    const [loading, setLoading] = useState(false);

    const form = useForm<EquipmentFormData>({
        initialValues: {
            // Basic Information
            code: '',
            name: '',
            category_id: 0,
            equipment_series_id: null,
            description: '',
            
            // Equipment Details
            make: '',
            model: '',
            serial_no: '',
            make_year: null,
            capacity: '',
            power_rating: '',
            fuel_type: '',
            operating_conditions: '',
            
            // Physical Details
            weight: null,
            dimensions_length: null,
            dimensions_width: null,
            dimensions_height: null,
            color: '',
            material: '',
            
            // Financial Details
            purchase_price: null,
            purchase_date: null,
            purchase_order_no: '',
            supplier: '',
            rental_rate: null,
            depreciation_rate: null,
            current_value: null,
            
            // Maintenance Details
            maintenance_frequency: null,
            last_maintenance_date: null,
            next_maintenance_date: null,
            maintenance_hours: null,
            maintenance_instructions: '',
            maintenance_checklist: null,
            
            // Warranty and Insurance
            warranty_start_date: null,
            warranty_end_date: null,
            warranty_terms: '',
            insurance_policy_no: '',
            insurance_expiry_date: null,
            insurance_coverage: '',
            
            // Location and Status
            status: 'available',
            current_location: '',
            assigned_to: '',
            condition: '',
            usage_hours: 0,
            
            // Documentation
            technical_specifications: null,
            safety_requirements: null,
            operating_instructions: null,
            certifications: null,
            attachments: null,
            
            // Additional Details
            notes: '',
            special_instructions: '',
            custom_fields: null,
        },
        validate: {
            code: (value) => (!value ? 'Code is required' : null),
            name: (value) => (!value ? 'Name is required' : null),
            category_id: (value) => (!value ? 'Category is required' : null),
            status: (value) => (!value ? 'Status is required' : null),
        },
    });

    const handleSubmit = async (values: EquipmentFormData) => {
        try {
            setLoading(true);
            // Convert make_year using dayjs
            const submitData = {
                ...values,
                make_year: values.make_year ? dayjs(values.make_year).year() : null
            };
            await axios.post(route('equipment.equipment.store'), submitData);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Error creating equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Create Equipment"
            size="100%"
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Tabs defaultValue="basic">
                    <Tabs.List>
                        <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
                        <Tabs.Tab value="equipment">Equipment Details</Tabs.Tab>
                        <Tabs.Tab value="additional">Additional Details</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic" pt="xs">
                        <Grid>
                            {/* Required Fields */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <TextInput
                                    label="Code"
                                    placeholder="Enter equipment code"
                                    required
                                    {...form.getInputProps('code')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 5 }}>
                                <TextInput
                                    label="Name"
                                    placeholder="Enter equipment name"
                                    required
                                    {...form.getInputProps('name')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                                <Select
                                    label="Status"
                                    placeholder="Select status"
                                    required
                                    data={[
                                        { value: 'available', label: 'Available' },
                                        { value: 'in_use', label: 'In Use' },
                                        { value: 'maintenance', label: 'Maintenance' },
                                        { value: 'repair', label: 'Repair' },
                                        { value: 'retired', label: 'Retired' },
                                    ]}
                                    {...form.getInputProps('status')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                                <Select
                                    label="Category"
                                    placeholder="Select category"
                                    required
                                    data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
                                    {...form.getInputProps('category_id')}
                                />
                            </Grid.Col>

                            {/* Optional Fields */}
                            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                <Select
                                    label="Series"
                                    placeholder="Select series"
                                    clearable
                                    data={series.map(s => ({ value: s.id.toString(), label: s.name }))}
                                    {...form.getInputProps('equipment_series_id')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 8 }}>
                                <TextInput
                                    label="Current Location"
                                    placeholder="Enter current location"
                                    {...form.getInputProps('current_location')}
                                />
                            </Grid.Col>

                            {/* Full width fields */}
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Description"
                                    placeholder="Enter equipment description"
                                    minRows={3}
                                    {...form.getInputProps('description')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>

                    <Tabs.Panel value="equipment" pt="xs">
                        <Grid>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <TextInput
                                    label="Make"
                                    placeholder="Enter manufacturer name"
                                    {...form.getInputProps('make')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <TextInput
                                    label="Model"
                                    placeholder="Enter model number"
                                    {...form.getInputProps('model')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <TextInput
                                    label="Serial Number"
                                    placeholder="Enter serial number"
                                    {...form.getInputProps('serial_no')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <YearPickerInput
                                    label="Make Year"
                                    placeholder="Select year of manufacture"
                                    clearable
                                    minDate={dayjs('1800').toDate()}
                                    maxDate={dayjs().toDate()}
                                    valueFormat="YYYY"
                                    onChange={(date) => {
                                        form.setFieldValue('make_year', date ? dayjs(date).year() : null);
                                    }}
                                    value={form.values.make_year ? dayjs().year(form.values.make_year).toDate() : null}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Capacity"
                                    placeholder="Enter equipment capacity"
                                    {...form.getInputProps('capacity')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Power Rating"
                                    placeholder="Enter power rating"
                                    {...form.getInputProps('power_rating')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Fuel Type"
                                    placeholder="Enter fuel type"
                                    {...form.getInputProps('fuel_type')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    label="Operating Conditions"
                                    placeholder="Enter operating conditions"
                                    {...form.getInputProps('operating_conditions')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <NumberInput
                                    label="Purchase Price"
                                    placeholder="Enter purchase price"
                                    min={0}
                                    {...form.getInputProps('purchase_price')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <DateInput
                                    label="Purchase Date"
                                    placeholder="Select purchase date"
                                    clearable
                                    {...form.getInputProps('purchase_date')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>

                    <Tabs.Panel value="additional" pt="xs">
                        <Grid>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <TextInput
                                    label="Supplier"
                                    placeholder="Enter supplier name"
                                    {...form.getInputProps('supplier')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <TextInput
                                    label="Purchase Order No"
                                    placeholder="Enter purchase order number"
                                    {...form.getInputProps('purchase_order_no')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <DateInput
                                    label="Warranty Start Date"
                                    placeholder="Select warranty start date"
                                    clearable
                                    {...form.getInputProps('warranty_start_date')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                                <DateInput
                                    label="Warranty End Date"
                                    placeholder="Select warranty end date"
                                    clearable
                                    {...form.getInputProps('warranty_end_date')}
                                />
                            </Grid.Col>

                            <Grid.Col span={12}>
                                <TextInput
                                    label="Warranty Terms"
                                    placeholder="Enter warranty terms"
                                    {...form.getInputProps('warranty_terms')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Textarea
                                    label="Notes"
                                    placeholder="Enter additional notes"
                                    minRows={4}
                                    {...form.getInputProps('notes')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Textarea
                                    label="Special Instructions"
                                    placeholder="Enter special instructions"
                                    minRows={4}
                                    {...form.getInputProps('special_instructions')}
                                />
                            </Grid.Col>

                            <Grid.Col span={12}>
                                <JsonInput
                                    label="Custom Fields"
                                    placeholder="Enter custom fields"
                                    formatOnBlur
                                    {...form.getInputProps('custom_fields')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Create Equipment</Button>
                </Group>
            </form>
        </Modal>
    );
} 