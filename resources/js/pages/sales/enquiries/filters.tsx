import { useState } from 'react';
import { 
    Paper, 
    Group, 
    TextInput, 
    Select, 
    MultiSelect, 
    Button, 
    Stack,
    NumberInput,
    ActionIcon,
    Tooltip
} from '@mantine/core';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { Filter, X } from 'lucide-react';
import { EnquiryFilters, ENQUIRY_STATUS_COLORS, ENQUIRY_PRIORITY_COLORS, ENQUIRY_SOURCE_LABELS } from './types';

interface FiltersProps {
    filters: EnquiryFilters;
    onFiltersChange: (filters: EnquiryFilters) => void;
    onReset: () => void;
    users: Array<{ id: number; name: string }>;
    clients: Array<{ id: number; name: string }>;
}

export function Filters({ filters, onFiltersChange, onReset, users, clients }: FiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: keyof EnquiryFilters, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
        if (showFilters) {
            onReset();
        }
    };

    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="md">
                <Group>
                    <TextInput
                        placeholder="Search enquiries..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Tooltip label={showFilters ? "Hide Filters" : "Show Filters"}>
                        <ActionIcon 
                            variant={showFilters ? "filled" : "light"} 
                            color="blue" 
                            onClick={toggleFilters}
                        >
                            <Filter size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
                {showFilters && (
                    <Button 
                        variant="subtle" 
                        color="red" 
                        leftSection={<X size={16} />}
                        onClick={onReset}
                    >
                        Clear Filters
                    </Button>
                )}
            </Group>

            {showFilters && (
                <Stack>
                    <Group grow>
                        <MultiSelect
                            label="Status"
                            placeholder="Select statuses"
                            data={Object.entries(ENQUIRY_STATUS_COLORS).map(([value, color]) => ({
                                value,
                                label: value.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' '),
                                color
                            }))}
                            value={filters.status || []}
                            onChange={(value) => handleFilterChange('status', value)}
                            clearable
                        />
                        <MultiSelect
                            label="Priority"
                            placeholder="Select priorities"
                            data={Object.entries(ENQUIRY_PRIORITY_COLORS).map(([value, color]) => ({
                                value,
                                label: value.charAt(0).toUpperCase() + value.slice(1),
                                color
                            }))}
                            value={filters.priority || []}
                            onChange={(value) => handleFilterChange('priority', value)}
                            clearable
                        />
                    </Group>

                    <Group grow>
                        <MultiSelect
                            label="Source"
                            placeholder="Select sources"
                            data={Object.entries(ENQUIRY_SOURCE_LABELS).map(([value, label]) => ({
                                value,
                                label
                            }))}
                            value={filters.source || []}
                            onChange={(value) => handleFilterChange('source', value)}
                            clearable
                        />
                    </Group>

                    <Group grow>
                        <Select
                            label="Assigned To"
                            placeholder="Select user"
                            data={users.map(user => ({
                                value: user.id.toString(),
                                label: user.name
                            }))}
                            value={filters.assigned_to?.toString()}
                            onChange={(value) => handleFilterChange('assigned_to', value ? parseInt(value) : undefined)}
                            clearable
                        />
                        <Select
                            label="Client"
                            placeholder="Select client"
                            data={clients.map(client => ({
                                value: client.id.toString(),
                                label: client.name
                            }))}
                            value={filters.client_id?.toString()}
                            onChange={(value) => handleFilterChange('client_id', value ? parseInt(value) : undefined)}
                            clearable
                        />
                        <DatePickerInput
                            type="range"
                            label="Date Range"
                            placeholder="Select date range"
                            value={filters.date_range}
                            onChange={(value: DatesRangeValue) => handleFilterChange('date_range', value)}
                            clearable
                        />
                        <Group grow>
                            <NumberInput
                                label="Min Estimated Value"
                                placeholder="Enter min value"
                                value={filters.min_estimated_value}
                                onChange={(value) => handleFilterChange('min_estimated_value', value)}
                                min={0}
                            />
                            <NumberInput
                                label="Max Estimated Value"
                                placeholder="Enter max value"
                                value={filters.max_estimated_value}
                                onChange={(value) => handleFilterChange('max_estimated_value', value)}
                                min={0}
                            />
                        </Group>
                    </Group>
                </Stack>
            )}
        </Paper>
    );
} 