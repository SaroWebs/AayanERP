import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Pencil } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    hsn: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
    equipment_count: number;
}

interface CategoryType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    variant: 'equipment' | 'scaffolding';
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
    categories: Category[];
}

interface Props extends PageProps {
    categoryType: CategoryType;
}

export default function Show({ categoryType }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Equipment',
            href: '#',
        },
        {
            title: 'Category Types',
            href: route('equipment.category-types.index'),
        },
        {
            title: categoryType.name,
            href: route('equipment.category-types.show', categoryType.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={categoryType.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Category Type Details</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    Back
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={() => window.location.href = route('category-types.edit', categoryType.id)}
                                    className="flex items-center gap-2"
                                >
                                    <Pencil className="h-5 w-5" />
                                    Edit
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{categoryType.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Variant</dt>
                                    <dd className="mt-1">
                                        <Badge variant={categoryType.variant === 'equipment' ? 'default' : 'secondary'}>
                                            {categoryType.variant}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <Badge variant={categoryType.status === 'active' ? 'success' : 'destructive'}>
                                            {categoryType.status}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Sort Order</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{categoryType.sort_order}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{categoryType.description || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(categoryType.created_at).toLocaleString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(categoryType.updated_at).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>HSN</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Sort Order</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categoryType.categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell>{category.name}</TableCell>
                                            <TableCell>{category.hsn || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={category.status === 'active' ? 'success' : 'destructive'}>
                                                    {category.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{category.equipment_count}</TableCell>
                                            <TableCell>{category.sort_order}</TableCell>
                                            <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 