import { Paper, Group, TextInput, Select, Button, Stack, Collapse, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { router } from '@inertiajs/react';
import { SearchIcon, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { DateInput } from '@mantine/dates';
import { useState } from 'react';

interface Filters {
    status?: string;
    approval_status?: string;
    client_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
    type?: 'equipment' | 'scaffolding' | 'both';
    min_amount?: number;
    max_amount?: number;
    currency?: string;
    [key: string]: string | number | undefined;
}

interface Props {
    filters: Filters;
}

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
    { value: 'converted', label: 'Converted' },
    { value: 'cancelled', label: 'Cancelled' },
];

const approvalStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'not_required', label: 'Not Required' },
];

const typeOptions = [
    { value: 'equipment', label: 'Equipment' },
    { value: 'scaffolding', label: 'Scaffolding' },
    { value: 'both', label: 'Both' },
];

const currencyOptions = [
    { value: 'INR', label: 'Indian Rupee (INR)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'AED', label: 'UAE Dirham (AED)' },
];

export function QuotationFilters({ filters }: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const form = useForm<Filters>({
        initialValues: filters,
    });

    const handleSubmit = (values: Filters) => {
        router.get(
            route('sales.quotations.index'),
            values,
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        form.reset();
        router.get(
            route('sales.quotations.index'),
            {},
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <Paper p="md" withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <Group gap="md" align="flex-end">
                        <TextInput
                            label="Search"
                            placeholder="Search by quotation no. or subject"
                            leftSection={<SearchIcon size={16} />}
                            style={{ flex: 2 }}
                            {...form.getInputProps('search')}
                        />

                        <Select
                            label="Status"
                            placeholder="Select status"
                            data={statusOptions}
                            clearable
                            style={{ flex: 1 }}
                            {...form.getInputProps('status')}
                        />

                        <Select
                            label="Approval Status"
                            placeholder="Select approval status"
                            data={approvalStatusOptions}
                            clearable
                            style={{ flex: 1 }}
                            {...form.getInputProps('approval_status')}
                        />

                        <Button
                            variant="light"
                            leftSection={showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            Advanced Filters
                        </Button>
                    </Group>

                    <Collapse in={showAdvanced}>
                        <Box pt="md">
                            <Group gap="md" align="flex-end">
                                <Select
                                    label="Type"
                                    placeholder="Select type"
                                    data={typeOptions}
                                    clearable
                                    style={{ flex: 1 }}
                                    {...form.getInputProps('type')}
                                />

                                <Select
                                    label="Currency"
                                    placeholder="Select currency"
                                    data={currencyOptions}
                                    clearable
                                    style={{ flex: 1 }}
                                    {...form.getInputProps('currency')}
                                />

                                <TextInput
                                    label="Min Amount"
                                    placeholder="Enter minimum amount"
                                    type="number"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps('min_amount')}
                                />

                                <TextInput
                                    label="Max Amount"
                                    placeholder="Enter maximum amount"
                                    type="number"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps('max_amount')}
                                />
                            </Group>

                            <Group gap="md" align="flex-end" mt="md">
                                <DateInput
                                    label="From Date"
                                    placeholder="Select from date"
                                    clearable
                                    valueFormat="YYYY-MM-DD"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps('from_date')}
                                />

                                <DateInput
                                    label="To Date"
                                    placeholder="Select to date"
                                    clearable
                                    valueFormat="YYYY-MM-DD"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps('to_date')}
                                />
                            </Group>
                        </Box>
                    </Collapse>

                    <Group justify="flex-end" gap="xs">
                        <Button
                            variant="light"
                            color="gray"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            leftSection={<Filter size={16} />}
                        >
                            Apply Filters
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
} 