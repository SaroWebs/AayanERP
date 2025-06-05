import { router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <Card className="mb-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilter('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Approval Status</label>
                    <Select
                        value={filters.approval_status}
                        onValueChange={(value) => handleFilter('approval_status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select approval status" />
                        </SelectTrigger>
                        <SelectContent>
                            {approvalStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">From Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !filters.from_date && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.from_date ? (
                                    format(new Date(filters.from_date), 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.from_date ? new Date(filters.from_date) : undefined}
                                onSelect={(date) =>
                                    handleFilter('from_date', date?.toISOString())
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">To Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !filters.to_date && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.to_date ? (
                                    format(new Date(filters.to_date), 'PPP')
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.to_date ? new Date(filters.to_date) : undefined}
                                onSelect={(date) =>
                                    handleFilter('to_date', date?.toISOString())
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by quotation no..."
                            value={filters.search}
                            onChange={(e) => handleFilter('search', e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={clearFilters}
                            title="Clear filters"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
} 