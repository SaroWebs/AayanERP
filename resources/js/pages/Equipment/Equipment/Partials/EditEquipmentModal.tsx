import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider, Tabs, JsonInput } from '@mantine/core';
import { YearPickerInput, DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { FormDataConvertible } from '@inertiajs/core';
import axios from 'axios';
import {
    Equipment,
    SimplifiedCategory,
    Series,
    EquipmentFormData,
} from '@/types/equipment';

interface Props {
    opened: boolean;
    onClose: () => void;
    equipment: Equipment | null;
    series: Series[];
    categories: SimplifiedCategory[];
}

export default function EditEquipmentModal({ opened, onClose, equipment, series, categories }: Props) {
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

    useEffect(() => {
        if (equipment) {
            form.setValues({
                // Basic Information
                code: equipment.code,
                name: equipment.name,
                category_id: equipment.category_id,
                equipment_series_id: equipment.equipment_series_id,
                description: equipment.description,

                // Equipment Details
                make: equipment.make,
                model: equipment.model,
                serial_no: equipment.serial_no,
                make_year: equipment.make_year,
                capacity: equipment.capacity,
                power_rating: equipment.power_rating,
                fuel_type: equipment.fuel_type,
                operating_conditions: equipment.operating_conditions,

                // Physical Details
                weight: equipment.weight,
                dimensions_length: equipment.dimensions_length,
                dimensions_width: equipment.dimensions_width,
                dimensions_height: equipment.dimensions_height,
                color: equipment.color,
                material: equipment.material,

                // Financial Details
                purchase_price: equipment.purchase_price,
                purchase_date: equipment.purchase_date,
                purchase_order_no: equipment.purchase_order_no,
                supplier: equipment.supplier,
                rental_rate: equipment.rental_rate,
                depreciation_rate: equipment.depreciation_rate,
                current_value: equipment.current_value,

                // Maintenance Details
                maintenance_frequency: equipment.maintenance_frequency,
                last_maintenance_date: equipment.last_maintenance_date,
                next_maintenance_date: equipment.next_maintenance_date,
                maintenance_hours: equipment.maintenance_hours,
                maintenance_instructions: equipment.maintenance_instructions,
                maintenance_checklist: equipment.maintenance_checklist,

                // Warranty and Insurance
                warranty_start_date: equipment.warranty_start_date,
                warranty_end_date: equipment.warranty_end_date,
                warranty_terms: equipment.warranty_terms,
                insurance_policy_no: equipment.insurance_policy_no,
                insurance_expiry_date: equipment.insurance_expiry_date,
                insurance_coverage: equipment.insurance_coverage,

                // Location and Status
                status: equipment.status,
                current_location: equipment.current_location,
                assigned_to: equipment.assigned_to,
                condition: equipment.condition,
                usage_hours: equipment.usage_hours,

                // Documentation
                technical_specifications: equipment.technical_specifications,
                safety_requirements: equipment.safety_requirements,
                operating_instructions: equipment.operating_instructions,
                certifications: equipment.certifications,
                attachments: equipment.attachments,

                // Additional Details
                notes: equipment.notes,
                special_instructions: equipment.special_instructions,
                custom_fields: equipment.custom_fields,
            });
        }
    }, [equipment]);

    const handleSubmit = async (values: EquipmentFormData) => {
        if (!equipment) return;

        try {
            setLoading(true);
            await axios.put(route('equipment.equipment.update', equipment.id), values);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Error updating equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit Equipment"
            size="xl"
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Tabs defaultValue="basic">
                    <Tabs.List>
                        <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
                        <Tabs.Tab value="equipment">Equipment Details</Tabs.Tab>
                        <Tabs.Tab value="physical">Physical Details</Tabs.Tab>
                        <Tabs.Tab value="financial">Financial Details</Tabs.Tab>
                        <Tabs.Tab value="maintenance">Maintenance</Tabs.Tab>
                        <Tabs.Tab value="warranty">Warranty & Insurance</Tabs.Tab>
                        <Tabs.Tab value="location">Location & Status</Tabs.Tab>
                        <Tabs.Tab value="documentation">Documentation</Tabs.Tab>
                        <Tabs.Tab value="additional">Additional Details</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic" pt="xs">
                        <Stack>
                            <TextInput
                                label="Code"
                                placeholder="Enter equipment code"
                                required
                                {...form.getInputProps('code')}
                            />
                            <TextInput
                                label="Name"
                                placeholder="Enter equipment name"
                                required
                                {...form.getInputProps('name')}
                            />
                            <Select
                                label="Category"
                                placeholder="Select category"
                                required
                                data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
                                {...form.getInputProps('category_id')}
                            />
                            <Select
                                label="Series"
                                placeholder="Select series"
                                clearable
                                data={series.map(s => ({ value: s.id.toString(), label: s.name }))}
                                {...form.getInputProps('equipment_series_id')}
                            />
                            <Textarea
                                label="Description"
                                placeholder="Enter equipment description"
                                {...form.getInputProps('description')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="equipment" pt="xs">
                        <Stack>
                            <TextInput
                                label="Make"
                                placeholder="Enter manufacturer name"
                                {...form.getInputProps('make')}
                            />
                            <TextInput
                                label="Model"
                                placeholder="Enter model number"
                                {...form.getInputProps('model')}
                            />
                            <TextInput
                                label="Serial Number"
                                placeholder="Enter serial number"
                                {...form.getInputProps('serial_no')}
                            />
                            <NumberInput
                                label="Make Year"
                                placeholder="Enter year of manufacture"
                                min={1800}
                                max={new Date().getFullYear()}
                                {...form.getInputProps('make_year')}
                            />
                            <TextInput
                                label="Capacity"
                                placeholder="Enter equipment capacity"
                                {...form.getInputProps('capacity')}
                            />
                            <TextInput
                                label="Power Rating"
                                placeholder="Enter power rating"
                                {...form.getInputProps('power_rating')}
                            />
                            <TextInput
                                label="Fuel Type"
                                placeholder="Enter fuel type"
                                {...form.getInputProps('fuel_type')}
                            />
                            <TextInput
                                label="Operating Conditions"
                                placeholder="Enter operating conditions"
                                {...form.getInputProps('operating_conditions')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="physical" pt="xs">
                        <Stack>
                            <NumberInput
                                label="Weight"
                                placeholder="Enter weight"
                                min={0}
                                {...form.getInputProps('weight')}
                            />
                            <Group grow>
                                <NumberInput
                                    label="Length"
                                    placeholder="Enter length"
                                    min={0}
                                    {...form.getInputProps('dimensions_length')}
                                />
                                <NumberInput
                                    label="Width"
                                    placeholder="Enter width"
                                    min={0}
                                    {...form.getInputProps('dimensions_width')}
                                />
                                <NumberInput
                                    label="Height"
                                    placeholder="Enter height"
                                    min={0}
                                    {...form.getInputProps('dimensions_height')}
                                />
                            </Group>
                            <TextInput
                                label="Color"
                                placeholder="Enter color"
                                {...form.getInputProps('color')}
                            />
                            <TextInput
                                label="Material"
                                placeholder="Enter material"
                                {...form.getInputProps('material')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="financial" pt="xs">
                        <Stack>
                            <NumberInput
                                label="Purchase Price"
                                placeholder="Enter purchase price"
                                min={0}
                                {...form.getInputProps('purchase_price')}
                            />
                            <DateInput
                                label="Purchase Date"
                                placeholder="Select purchase date"
                                clearable
                                {...form.getInputProps('purchase_date')}
                            />
                            <TextInput
                                label="Purchase Order No"
                                placeholder="Enter purchase order number"
                                {...form.getInputProps('purchase_order_no')}
                            />
                            <TextInput
                                label="Supplier"
                                placeholder="Enter supplier name"
                                {...form.getInputProps('supplier')}
                            />
                            <NumberInput
                                label="Rental Rate"
                                placeholder="Enter rental rate"
                                min={0}
                                {...form.getInputProps('rental_rate')}
                            />
                            <NumberInput
                                label="Depreciation Rate"
                                placeholder="Enter depreciation rate"
                                min={0}
                                max={100}
                                {...form.getInputProps('depreciation_rate')}
                            />
                            <NumberInput
                                label="Current Value"
                                placeholder="Enter current value"
                                min={0}
                                {...form.getInputProps('current_value')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="maintenance" pt="xs">
                        <Stack>
                            <Select
                                label="Maintenance Frequency"
                                placeholder="Select maintenance frequency"
                                clearable
                                data={[
                                    { value: 'daily', label: 'Daily' },
                                    { value: 'weekly', label: 'Weekly' },
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'quarterly', label: 'Quarterly' },
                                    { value: 'bi-annual', label: 'Bi-Annual' },
                                    { value: 'annual', label: 'Annual' },
                                    { value: 'as-needed', label: 'As Needed' },
                                ]}
                                {...form.getInputProps('maintenance_frequency')}
                            />
                            <DateInput
                                label="Last Maintenance Date"
                                placeholder="Select last maintenance date"
                                clearable
                                {...form.getInputProps('last_maintenance_date')}
                            />
                            <DateInput
                                label="Next Maintenance Date"
                                placeholder="Select next maintenance date"
                                clearable
                                {...form.getInputProps('next_maintenance_date')}
                            />
                            <NumberInput
                                label="Maintenance Hours"
                                placeholder="Enter maintenance hours"
                                min={0}
                                {...form.getInputProps('maintenance_hours')}
                            />
                            <Textarea
                                label="Maintenance Instructions"
                                placeholder="Enter maintenance instructions"
                                {...form.getInputProps('maintenance_instructions')}
                            />
                            <JsonInput
                                label="Maintenance Checklist"
                                placeholder="Enter maintenance checklist"
                                formatOnBlur
                                {...form.getInputProps('maintenance_checklist')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="warranty" pt="xs">
                        <Stack>
                            <DateInput
                                label="Warranty Start Date"
                                placeholder="Select warranty start date"
                                clearable
                                {...form.getInputProps('warranty_start_date')}
                            />
                            <DateInput
                                label="Warranty End Date"
                                placeholder="Select warranty end date"
                                clearable
                                {...form.getInputProps('warranty_end_date')}
                            />
                            <TextInput
                                label="Warranty Terms"
                                placeholder="Enter warranty terms"
                                {...form.getInputProps('warranty_terms')}
                            />
                            <TextInput
                                label="Insurance Policy No"
                                placeholder="Enter insurance policy number"
                                {...form.getInputProps('insurance_policy_no')}
                            />
                            <DateInput
                                label="Insurance Expiry Date"
                                placeholder="Select insurance expiry date"
                                clearable
                                {...form.getInputProps('insurance_expiry_date')}
                            />
                            <TextInput
                                label="Insurance Coverage"
                                placeholder="Enter insurance coverage details"
                                {...form.getInputProps('insurance_coverage')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="location" pt="xs">
                        <Stack>
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
                                    { value: 'scrapped', label: 'Scrapped' },
                                ]}
                                {...form.getInputProps('status')}
                            />
                            <TextInput
                                label="Current Location"
                                placeholder="Enter current location"
                                {...form.getInputProps('current_location')}
                            />
                            <TextInput
                                label="Assigned To"
                                placeholder="Enter assigned person/department"
                                {...form.getInputProps('assigned_to')}
                            />
                            <TextInput
                                label="Condition"
                                placeholder="Enter equipment condition"
                                {...form.getInputProps('condition')}
                            />
                            <NumberInput
                                label="Usage Hours"
                                placeholder="Enter usage hours"
                                min={0}
                                {...form.getInputProps('usage_hours')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="documentation" pt="xs">
                        <Stack>
                            <JsonInput
                                label="Technical Specifications"
                                placeholder="Enter technical specifications"
                                formatOnBlur
                                {...form.getInputProps('technical_specifications')}
                            />
                            <JsonInput
                                label="Safety Requirements"
                                placeholder="Enter safety requirements"
                                formatOnBlur
                                {...form.getInputProps('safety_requirements')}
                            />
                            <JsonInput
                                label="Operating Instructions"
                                placeholder="Enter operating instructions"
                                formatOnBlur
                                {...form.getInputProps('operating_instructions')}
                            />
                            <JsonInput
                                label="Certifications"
                                placeholder="Enter certifications"
                                formatOnBlur
                                {...form.getInputProps('certifications')}
                            />
                            <JsonInput
                                label="Attachments"
                                placeholder="Enter attachments"
                                formatOnBlur
                                {...form.getInputProps('attachments')}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="additional" pt="xs">
                        <Stack>
                            <Textarea
                                label="Notes"
                                placeholder="Enter additional notes"
                                {...form.getInputProps('notes')}
                            />
                            <Textarea
                                label="Special Instructions"
                                placeholder="Enter special instructions"
                                {...form.getInputProps('special_instructions')}
                            />
                            <JsonInput
                                label="Custom Fields"
                                placeholder="Enter custom fields"
                                formatOnBlur
                                {...form.getInputProps('custom_fields')}
                            />
                        </Stack>
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Update Equipment</Button>
                </Group>
            </form>
        </Modal>
    );
} 