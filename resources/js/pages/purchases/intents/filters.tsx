import { Paper, Group, Select, TextInput, Button, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { router } from '@inertiajs/react';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface PurchaseIntentFilters {
    status?: string;
    approval_status?: string;
    type?: string;
    priority?: string;
    department_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
}

interface Props {
    filters: PurchaseIntentFilters;
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'converted', label: 'Converted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
];

const APPROVAL_STATUS_OPTIONS = [
    { value: '', label: 'All Approval Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'not_required', label: 'Not Required' },
];

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'scaffolding', label: 'Scaffolding' },
    { value: 'spares', label: 'Spares' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export function PurchaseIntentFilters({ filters }: Props) {
    const [localFilters, setLocalFilters] = useState<PurchaseIntentFilters>(filters);

    const handleFilterChange = (key: keyof PurchaseIntentFilters, value: string | number | null) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }));
    };

    const handleApplyFilters = () => {
        router.get(
            route('purchases.intents.index'),
            localFilters as Record<string, any>,
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleClearFilters = () => {
        const clearedFilters: PurchaseIntentFilters = {};
        setLocalFilters(clearedFilters);
        router.get(
            route('purchases.intents.index'),
            {},
            { preserveState: true, preserveScroll: true }
        );
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

    return (
        <Paper p="md" withBorder>
            <Stack gap="md">
                <Group gap="md" align="flex-end">
                    <TextInput
                        placeholder="Search intent number, subject..."
                        value={localFilters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        leftSection={<Search size={16} />}
                        style={{ flex: 1 }}
                    />
                    <Select
                        placeholder="Status"
                        data={STATUS_OPTIONS}
                        value={localFilters.status || ''}
                        onChange={(value) => handleFilterChange('status', value)}
                        clearable
                        style={{ minWidth: 150 }}
                    />
                    <Select
                        placeholder="Approval Status"
                        data={APPROVAL_STATUS_OPTIONS}
                        value={localFilters.approval_status || ''}
                        onChange={(value) => handleFilterChange('approval_status', value)}
                        clearable
                        style={{ minWidth: 150 }}
                    />
                    <Select
                        placeholder="Type"
                        data={TYPE_OPTIONS}
                        value={localFilters.type || ''}
                        onChange={(value) => handleFilterChange('type', value)}
                        clearable
                        style={{ minWidth: 120 }}
                    />
                    <Select
                        placeholder="Priority"
                        data={PRIORITY_OPTIONS}
                        value={localFilters.priority || ''}
                        onChange={(value) => handleFilterChange('priority', value)}
                        clearable
                        style={{ minWidth: 120 }}
                    />
                </Group>
                <Group gap="md" align="flex-end">
                    <DateInput
                        placeholder="From Date"
                        value={localFilters.from_date ? new Date(localFilters.from_date) : null}
                        onChange={(value) => handleFilterChange('from_date', value ? format(value, 'yyyy-MM-dd') : null)}
                        clearable
                        style={{ minWidth: 130 }}
                    />
                    <DateInput
                        placeholder="To Date"
                        value={localFilters.to_date ? new Date(localFilters.to_date) : null}
                        onChange={(value) => handleFilterChange('to_date', value ? format(value, 'yyyy-MM-dd') : null)}
                        clearable
                        style={{ minWidth: 130 }}
                    />
                    <Group gap="xs">
                        <Button
                            leftSection={<Filter size={16} />}
                            onClick={handleApplyFilters}
                            variant="filled"
                        >
                            Apply
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                leftSection={<X size={16} />}
                                onClick={handleClearFilters}
                                variant="light"
                                color="red"
                            >
                                Clear
                            </Button>
                        )}
                    </Group>
                </Group>
            </Stack>
        </Paper>
    );
} 