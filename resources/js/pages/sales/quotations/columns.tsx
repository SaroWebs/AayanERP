import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { MoreHorizontal, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';

interface Quotation {
    id: number;
    quotation_no: string;
    client: {
        id: number;
        name: string;
    };
    status: string;
    approval_status: string;
    created_at: string;
    created_by: {
        id: number;
        name: string;
    };
}

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const approvalStatusColors: Record<string, string> = {
    not_required: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export const columns: ColumnDef<Quotation>[] = [
    {
        accessorKey: 'quotation_no',
        header: 'Quotation No.',
    },
    {
        accessorKey: 'client.name',
        header: 'Client',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <Badge variant="secondary" className={statusColors[status]}>
                    {status.replace('_', ' ').toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'approval_status',
        header: 'Approval Status',
        cell: ({ row }) => {
            const status = row.getValue('approval_status') as string;
            return (
                <Badge variant="secondary" className={approvalStatusColors[status]}>
                    {status.replace('_', ' ').toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_by.name',
        header: 'Created By',
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => formatDate(row.getValue('created_at')),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const quotation = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={route('sales.quotations.show', quotation.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        {quotation.status === 'draft' && (
                            <DropdownMenuItem asChild>
                                <Link href={route('sales.quotations.edit', quotation.id)}>
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {quotation.status === 'draft' && (
                            <DropdownMenuItem
                                onClick={() => {
                                    // Handle submit for review
                                }}
                            >
                                Submit for Review
                            </DropdownMenuItem>
                        )}
                        {quotation.approval_status === 'pending' && (
                            <>
                                <DropdownMenuItem
                                    onClick={() => {
                                        // Handle approve
                                    }}
                                >
                                    Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        // Handle reject
                                    }}
                                >
                                    Reject
                                </DropdownMenuItem>
                            </>
                        )}
                        {quotation.status === 'approved' && (
                            <DropdownMenuItem
                                onClick={() => {
                                    // Handle convert to sales order
                                }}
                            >
                                Convert to Sales Order
                            </DropdownMenuItem>
                        )}
                        {['draft', 'pending_review'].includes(quotation.status) && (
                            <DropdownMenuItem
                                onClick={() => {
                                    // Handle cancel
                                }}
                                className="text-red-600"
                            >
                                Cancel
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 