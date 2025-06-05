import { router } from '@inertiajs/react';
import { Paper, Grid, Select, TextInput, Button, Group, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Search, X } from 'lucide-react';
import { EnquiryFilters as Filters } from './types';

interface Props {
    filters: Filters;
    clients?: Array<{ id: number; name: string }>;
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

export function EnquiryFilters({ filters, clients = [] }: Props) {
    const handleFilter = (key: keyof Filters, value: string | Date | number | undefined) => {
        router.get(
            route('sales.enquiries.index'),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        router.get(route('sales.enquiries.index'), {}, { preserveState: true });
    };

    return (
        <Paper withBorder p="md">
            <Stack gap="md">
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <Select
                            label="Status"
                            placeholder="Select status"
                            value={filters.status}
                            onChange={(value) => handleFilter('status', value || undefined)}
                            data={statusOptions}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <Select
                            label="Approval Status"
                            placeholder="Select approval status"
                            value={filters.approval_status}
                            onChange={(value) => handleFilter('approval_status', value || undefined)}
                            data={approvalStatusOptions}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <Select
                            label="Client"
                            placeholder="Select client"
                            value={filters.client_id?.toString()}
                            onChange={(value) => handleFilter('client_id', value ? parseInt(value) : undefined)}
                            data={clients.map(client => ({ value: client.id.toString(), label: client.name }))}
                            clearable
                            searchable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <DatePickerInput
                            label="From Date"
                            placeholder="Pick a date"
                            value={filters.from_date}
                            onChange={(date) => handleFilter('from_date', date || undefined)}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <DatePickerInput
                            label="To Date"
                            placeholder="Pick a date"
                            value={filters.to_date}
                            onChange={(date) => handleFilter('to_date', date || undefined)}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                        <TextInput
                            label="Search"
                            placeholder="Search by enquiry no..."
                            value={filters.search}
                            onChange={(e) => handleFilter('search', e.target.value)}
                            leftSection={<Search size={16} />}
                        />
                    </Grid.Col>
                </Grid>

                <Group justify="flex-end">
                    <Button
                        variant="light"
                        leftSection={<X size={16} />}
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
} 