import { Modal, TextInput, Textarea, Select, Button, Group, Grid, NumberInput, Stack, Divider, Tabs } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { FormDataConvertible } from '@inertiajs/core';
import { useEffect } from 'react';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Props {
    opened: boolean;
    onClose: () => void;
    loadData: () => void;
}

interface FormData {
    // Basic Information
    name: string;
    code: string;
    description_1: string | null;
    description_2: string | null;
    applicable_for: 'all' | 'equipment' | 'scaffolding';
    hsn: string | null;
    unit: 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'na' | null;
    minimum_stock: number;
    current_stock: number;
    maximum_stock: number | null;
    reorder_point: number | null;
    sort_order: number;
    status: 'active' | 'inactive';

    // Technical Specifications
    temperature_rating: number | null;
    max_service_temperature: number | null;
    thermal_conductivity: number | null;
    bulk_density: number | null;
    cold_crushing_strength: number | null;
    porosity: number | null;
    chemical_composition: string | null;
    application_temperature_range: string | null;
    thermal_expansion: number | null;
    abrasion_resistance: string | null;
    corrosion_resistance: string | null;
    thermal_shock_resistance: string | null;

    // Certifications and Standards
    certifications: string | null;
    standards_compliance: string | null;
    quality_grade: string | null;

    // Additional Information
    installation_guide: string | null;
    safety_data_sheet: string | null;
    technical_data_sheet: string | null;
    maintenance_guide: string | null;

    [key: string]: FormDataConvertible;
}

export default function CreateRefractoryProductModal({ opened, onClose, loadData }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        // Basic Information
        name: '',
        code: '',
        description_1: '',
        description_2: '',
        applicable_for: 'all',
        hsn: '',
        unit: null,
        minimum_stock: 0,
        current_stock: 0,
        maximum_stock: null,
        reorder_point: null,
        sort_order: 0,
        status: 'active',

        // Technical Specifications
        temperature_rating: null,
        max_service_temperature: null,
        thermal_conductivity: null,
        bulk_density: null,
        cold_crushing_strength: null,
        porosity: null,
        chemical_composition: null,
        application_temperature_range: null,
        thermal_expansion: null,
        abrasion_resistance: null,
        corrosion_resistance: null,
        thermal_shock_resistance: null,

        // Certifications and Standards
        certifications: null,
        standards_compliance: null,
        quality_grade: null,

        // Additional Information
        installation_guide: null,
        safety_data_sheet: null,
        technical_data_sheet: null,
        maintenance_guide: null,
    });

    // Fetch the last code when modal opens
    useEffect(() => {
        if (opened) {
            axios.get(route('equipment.items.last-code'))
                .then(response => {
                    setData('code', response.data.code);
                })
                .catch(error => {
                    console.error('Error fetching last code:', error);
                });
        }
    }, [opened]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.items.store'), {
            onSuccess: () => {
                reset();
                onClose();
                loadData();
            },
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create Refractory Product" size="xl">
            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="basic">
                    <Tabs.List>
                        <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
                        <Tabs.Tab value="technical">Technical Specifications</Tabs.Tab>
                        <Tabs.Tab value="certifications">Certifications</Tabs.Tab>
                        <Tabs.Tab value="documents">Documents</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic">
                        <Stack>
                            <Grid>
                                <Grid.Col span={3}>
                                    <TextInput
                                        label="Code"
                                        placeholder="Enter item code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        error={errors.code}
                                        required
                                        readOnly
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Name"
                                        placeholder="Enter product name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <TextInput
                                        label="HSN Code"
                                        placeholder="Enter HSN code"
                                        value={data.hsn || ''}
                                        onChange={(e) => setData('hsn', e.target.value || null)}
                                        error={errors.hsn}
                                    />
                                </Grid.Col>
                            </Grid>

                            <Divider label="Descriptions" labelPosition="center" />

                            <Grid>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Description 1"
                                        placeholder="Enter primary description"
                                        value={data.description_1 || ''}
                                        onChange={(e) => setData('description_1', e.target.value || null)}
                                        error={errors.description_1}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Description 2"
                                        placeholder="Enter secondary description"
                                        value={data.description_2 || ''}
                                        onChange={(e) => setData('description_2', e.target.value || null)}
                                        error={errors.description_2}
                                    />
                                </Grid.Col>
                            </Grid>

                            <Divider label="Stock Information" labelPosition="center" />

                            <Grid>
                                <Grid.Col span={3}>
                                    <Select
                                        label="Unit"
                                        placeholder="Select unit"
                                        data={[
                                            { value: 'set', label: 'Set' },
                                            { value: 'nos', label: 'Numbers' },
                                            { value: 'rmt', label: 'Running Meter' },
                                            { value: 'sqm', label: 'Square Meter' },
                                            { value: 'ltr', label: 'Liter' },
                                            { value: 'na', label: 'Not Applicable' }
                                        ]}
                                        value={data.unit}
                                        onChange={(value) => setData('unit', value as 'set' | 'nos' | 'rmt' | 'sqm' | 'ltr' | 'na' | null)}
                                        error={errors.unit}
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <NumberInput
                                        label="Minimum Stock"
                                        placeholder="Enter minimum stock level"
                                        value={data.minimum_stock}
                                        onChange={(value) => setData('minimum_stock', Number(value))}
                                        error={errors.minimum_stock}
                                        min={0}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <NumberInput
                                        label="Current Stock"
                                        placeholder="Enter current stock"
                                        value={data.current_stock}
                                        onChange={(value) => setData('current_stock', Number(value))}
                                        error={errors.current_stock}
                                        min={0}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <NumberInput
                                        label="Maximum Stock"
                                        placeholder="Enter maximum stock level"
                                        value={data.maximum_stock || undefined}
                                        onChange={(value) => setData('maximum_stock', value ? Number(value) : null)}
                                        error={errors.maximum_stock}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <NumberInput
                                        label="Reorder Point"
                                        placeholder="Enter reorder point"
                                        value={data.reorder_point || undefined}
                                        onChange={(value) => setData('reorder_point', value ? Number(value) : null)}
                                        error={errors.reorder_point}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <NumberInput
                                        label="Sort Order"
                                        placeholder="Enter sort order"
                                        value={data.sort_order}
                                        onChange={(value) => setData('sort_order', Number(value))}
                                        error={errors.sort_order}
                                        min={0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Select
                                        label="Type"
                                        placeholder="Select type"
                                        data={[
                                            { value: 'all', label: 'All' },
                                            { value: 'equipment', label: 'Equipment' },
                                            { value: 'scaffolding', label: 'Scaffolding' }
                                        ]}
                                        value={data.applicable_for}
                                        onChange={(value) => setData('applicable_for', (value as 'all' | 'equipment' | 'scaffolding') || 'all')}
                                        error={errors.applicable_for}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Select
                                        label="Status"
                                        placeholder="Select status"
                                        data={[
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Inactive' }
                                        ]}
                                        value={data.status}
                                        onChange={(value) => setData('status', (value as 'active' | 'inactive') || 'active')}
                                        error={errors.status}
                                        required
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="technical">
                        <Stack>
                            <Grid>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Temperature Rating (°C)"
                                        placeholder="Enter temperature rating"
                                        value={data.temperature_rating || undefined}
                                        onChange={(value) => setData('temperature_rating', value ? Number(value) : null)}
                                        error={errors.temperature_rating}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Max Service Temperature (°C)"
                                        placeholder="Enter max service temperature"
                                        value={data.max_service_temperature || undefined}
                                        onChange={(value) => setData('max_service_temperature', value ? Number(value) : null)}
                                        error={errors.max_service_temperature}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Thermal Conductivity (W/m·K)"
                                        placeholder="Enter thermal conductivity"
                                        value={data.thermal_conductivity || undefined}
                                        onChange={(value) => setData('thermal_conductivity', value ? Number(value) : null)}
                                        error={errors.thermal_conductivity}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Bulk Density (g/cm³)"
                                        placeholder="Enter bulk density"
                                        value={data.bulk_density || undefined}
                                        onChange={(value) => setData('bulk_density', value ? Number(value) : null)}
                                        error={errors.bulk_density}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Cold Crushing Strength (MPa)"
                                        placeholder="Enter cold crushing strength"
                                        value={data.cold_crushing_strength || undefined}
                                        onChange={(value) => setData('cold_crushing_strength', value ? Number(value) : null)}
                                        error={errors.cold_crushing_strength}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Porosity (%)"
                                        placeholder="Enter porosity"
                                        value={data.porosity || undefined}
                                        onChange={(value) => setData('porosity', value ? Number(value) : null)}
                                        error={errors.porosity}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Textarea
                                        label="Chemical Composition"
                                        placeholder="Enter chemical composition details"
                                        value={data.chemical_composition || ''}
                                        onChange={(e) => setData('chemical_composition', e.target.value || null)}
                                        error={errors.chemical_composition}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Application Temperature Range"
                                        placeholder="Enter temperature range (e.g., 1000-1500°C)"
                                        value={data.application_temperature_range || ''}
                                        onChange={(e) => setData('application_temperature_range', e.target.value || null)}
                                        error={errors.application_temperature_range}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <NumberInput
                                        label="Thermal Expansion (×10⁻⁶/°C)"
                                        placeholder="Enter thermal expansion"
                                        value={data.thermal_expansion || undefined}
                                        onChange={(value) => setData('thermal_expansion', value ? Number(value) : null)}
                                        error={errors.thermal_expansion}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <TextInput
                                        label="Abrasion Resistance"
                                        placeholder="Enter abrasion resistance rating"
                                        value={data.abrasion_resistance || ''}
                                        onChange={(e) => setData('abrasion_resistance', e.target.value || null)}
                                        error={errors.abrasion_resistance}
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <TextInput
                                        label="Corrosion Resistance"
                                        placeholder="Enter corrosion resistance details"
                                        value={data.corrosion_resistance || ''}
                                        onChange={(e) => setData('corrosion_resistance', e.target.value || null)}
                                        error={errors.corrosion_resistance}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Thermal Shock Resistance"
                                        placeholder="Enter thermal shock resistance details"
                                        value={data.thermal_shock_resistance || ''}
                                        onChange={(e) => setData('thermal_shock_resistance', e.target.value || null)}
                                        error={errors.thermal_shock_resistance}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="certifications">
                        <Stack>
                            <Grid>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Certifications"
                                        placeholder="Enter product certifications"
                                        value={data.certifications || ''}
                                        onChange={(e) => setData('certifications', e.target.value || null)}
                                        error={errors.certifications}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Standards Compliance"
                                        placeholder="Enter standards compliance details"
                                        value={data.standards_compliance || ''}
                                        onChange={(e) => setData('standards_compliance', e.target.value || null)}
                                        error={errors.standards_compliance}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Quality Grade"
                                        placeholder="Enter quality grade"
                                        value={data.quality_grade || ''}
                                        onChange={(e) => setData('quality_grade', e.target.value || null)}
                                        error={errors.quality_grade}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="documents">
                        <Stack>
                            <Grid>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Installation Guide"
                                        placeholder="Enter installation guide details or URL"
                                        value={data.installation_guide || ''}
                                        onChange={(e) => setData('installation_guide', e.target.value || null)}
                                        error={errors.installation_guide}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Safety Data Sheet"
                                        placeholder="Enter safety data sheet details or URL"
                                        value={data.safety_data_sheet || ''}
                                        onChange={(e) => setData('safety_data_sheet', e.target.value || null)}
                                        error={errors.safety_data_sheet}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Technical Data Sheet"
                                        placeholder="Enter technical data sheet details or URL"
                                        value={data.technical_data_sheet || ''}
                                        onChange={(e) => setData('technical_data_sheet', e.target.value || null)}
                                        error={errors.technical_data_sheet}
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea
                                        label="Maintenance Guide"
                                        placeholder="Enter maintenance guide details or URL"
                                        value={data.maintenance_guide || ''}
                                        onChange={(e) => setData('maintenance_guide', e.target.value || null)}
                                        error={errors.maintenance_guide}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={processing}>Create Product</Button>
                </Group>
            </form>
        </Modal>
    );
} 