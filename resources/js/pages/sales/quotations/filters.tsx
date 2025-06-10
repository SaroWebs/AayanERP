import { router } from '@inertiajs/react';
import { Paper, Select, TextInput, Button, Group, Stack, Text, ActionIcon } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Search, X } from 'lucide-react';

interface Filters {
    status?: string;
    approval_status?: string;
    client_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
}

interface Props {
    filters: Filters;
}

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
];

const approvalStatusOptions = [
    { value: 'not_required', label: 'Not Required' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export function QuotationFilters({ filters }: Props) {
    const handleFilter = (key: keyof Filters, value: string | undefined) => {
        router.get(
            route('sales.quotations.index'),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        router.get(route('sales.quotations.index'), {}, { preserveState: true });
    };

    return (
        <Paper shadow="xs" p="md" withBorder className="mb-4">
            <Stack>
                <Group grow>
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Status</Text>
                        <Select
                            placeholder="Select status"
                            value={filters.status}
                            onChange={(value) => handleFilter('status', value || undefined)}
                            data={statusOptions}
                            clearable
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>Approval Status</Text>
                        <Select
                            placeholder="Select approval status"
                            value={filters.approval_status}
                            onChange={(value) => handleFilter('approval_status', value || undefined)}
                            data={approvalStatusOptions}
                            clearable
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>From Date</Text>
                        <DatePickerInput
                            label="From Date"
                            placeholder="Pick a date"
                            value={filters.from_date}
                            onChange={(date) => handleFilter('from_date', date || undefined)}
                            clearable
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text size="sm" fw={500}>To Date</Text>
                        <DatePickerInput
                            placeholder="Pick a date"
                            value={filters.to_date ? new Date(filters.to_date) : null}
                            onChange={(date) => handleFilter('to_date', date || undefined)}
                            clearable
                        />
                    </Stack>
                </Group>

                <Group>
                    <TextInput
                        placeholder="Search by quotation no..."
                        value={filters.search}
                        onChange={(e) => handleFilter('search', e.target.value)}
                        leftSection={<Search size={16} />}
                        style={{ flex: 1 }}
                    />
                    <ActionIcon
                        variant="light"
                        color="gray"
                        onClick={clearFilters}
                        title="Clear filters"
                    >
                        <X size={16} />
                    </ActionIcon>
                </Group>
            </Stack>
        </Paper>
    );
} 