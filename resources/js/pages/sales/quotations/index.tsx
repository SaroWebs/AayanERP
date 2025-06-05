import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import { QuotationFilters } from './filters';

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

interface Props extends PageProps {
    quotations: {
        data: Quotation[];
        links: any[];
    };
    filters: {
        status?: string;
        approval_status?: string;
        client_id?: number;
        from_date?: string;
        to_date?: string;
        search?: string;
    };
}

export default function Index({ quotations, filters }: Props) {
    return (
        <>
            <Head title="Quotations" />

            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Quotations</h1>
                    <Button asChild>
                        <Link href={route('sales.quotations.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Quotation
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quotation List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <QuotationFilters filters={filters} />
                        <DataTable
                            columns={columns}
                            data={quotations.data}
                            links={quotations.links}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 