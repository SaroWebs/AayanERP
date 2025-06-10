import { Paper, Grid, Select, TextInput, Button, Group, Stack } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { X } from 'lucide-react';
import { EnquiryFilters as Filters } from './types';

interface Props {
    filters: Filters;
    clients?: Array<{ id: number; name: string }>;
    onChange: (filters: Filters) => void;
}

export function EnquiryFilters({ filters, clients, onChange }: Props) {
    const handleFilterChange = (key: keyof Filters, value: any) => {
        onChange({
            ...filters,
            [key]: value,
        });
    };

    const handleClearFilters = () => {
        onChange({
            status: undefined,
            approval_status: undefined,
            client_id: undefined,
            from_date: null,
            to_date: null,
            search: undefined,
        });
    };

    return (
        <Paper withBorder p="md">
            <Stack gap="md">
                <Grid>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Status"
                            placeholder="Select status"
                            data={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'pending_review', label: 'Pending Review' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ]}
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            clearable
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Approval Status"
                            placeholder="Select approval status"
                            data={[
                                { value: 'not_required', label: 'Not Required' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                            ]}
                            value={filters.approval_status}
                            onChange={(value) => handleFilterChange('approval_status', value)}
                            clearable
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Client"
                            placeholder="Select client"
                            data={clients?.map(client => ({ value: client.id.toString(), label: client.name })) || []}
                            value={filters.client_id?.toString()}
                            onChange={(value) => handleFilterChange('client_id', value ? parseInt(value) : undefined)}
                            searchable
                            clearable
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <TextInput
                            label="Search"
                            placeholder="Search enquiries..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <DatePickerInput
                            label="From Date"
                            placeholder="Select date"
                            value={filters.from_date}
                            onChange={(value) => handleFilterChange('from_date', value)}
                            clearable
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <DatePickerInput
                            label="To Date"
                            placeholder="Select date"
                            value={filters.to_date}
                            onChange={(value) => handleFilterChange('to_date', value)}
                            clearable
                        />
                    </Grid.Col>
                </Grid>

                <Group justify="flex-end">
                    <Button
                        variant="light"
                        leftSection={<X size={16} />}
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
} 