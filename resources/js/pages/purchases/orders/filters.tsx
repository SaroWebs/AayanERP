import { Paper, Group, Select, TextInput, DateInput, Button, Stack } from '@mantine/core';
import { router } from '@inertiajs/react';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { PurchaseOrderFilters } from '@/types/purchase';

interface Props {
    filters: PurchaseOrderFilters;
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent', label: 'Sent' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'partial_received', label: 'Partial Received' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'closed', label: 'Closed' },
];

const APPROVAL_STATUS_OPTIONS = [
    { value: '', label: 'All Approval Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'not_required', label: 'Not Required' },
];

export function PurchaseOrderFilters({ filters }: Props) {
    const [localFilters, setLocalFilters] = useState<PurchaseOrderFilters>(filters);

    const handleFilterChange = (key: keyof PurchaseOrderFilters, value: string | number | null) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }));
    };

    const handleApplyFilters = () => {
        router.get(
            route('purchases.orders.index'),
            localFilters,
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleClearFilters = () => {
        const clearedFilters: PurchaseOrderFilters = {};
        setLocalFilters(clearedFilters);
        router.get(
            route('purchases.orders.index'),
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
                        placeholder="Search PO number, vendor..."
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
                    <DateInput
                        placeholder="From Date"
                        value={localFilters.from_date ? new Date(localFilters.from_date) : null}
                        onChange={(value) => handleFilterChange('from_date', value ? value.toISOString().split('T')[0] : null)}
                        clearable
                        style={{ minWidth: 130 }}
                    />
                    <DateInput
                        placeholder="To Date"
                        value={localFilters.to_date ? new Date(localFilters.to_date) : null}
                        onChange={(value) => handleFilterChange('to_date', value ? value.toISOString().split('T')[0] : null)}
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