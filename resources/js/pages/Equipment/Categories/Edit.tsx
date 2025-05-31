import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface CategoryType {
    id: number;
    name: string;
    variant: 'equipment' | 'scaffolding';
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    category_type_id: number;
    hsn: string;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    category: Category;
    categoryTypes: CategoryType[];
}

export default function Edit({ auth, category, categoryTypes }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description || '',
        category_type_id: category.category_type_id.toString(),
        hsn: category.hsn || '',
        status: category.status,
        sort_order: category.sort_order,
    });

    const breadcrumbs = [
        { title: 'Equipment', href: '#' },
        { title: 'Categories', href: route('categories.index') },
        { title: category.name, href: route('categories.edit', category.id) },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('categories.update', category.id));
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title="Edit Category" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Edit Category</CardTitle>
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Back
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_type_id">Category Type</Label>
                                    <Select
                                        value={data.category_type_id}
                                        onValueChange={(value) => setData('category_type_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_type_id && (
                                        <p className="text-sm text-red-500">{errors.category_type_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hsn">HSN</Label>
                                    <Input
                                        id="hsn"
                                        value={data.hsn}
                                        onChange={(e) => setData('hsn', e.target.value)}
                                        maxLength={50}
                                    />
                                    {errors.hsn && (
                                        <p className="text-sm text-red-500">{errors.hsn}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value as 'active' | 'inactive')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">{errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                    />
                                    {errors.sort_order && (
                                        <p className="text-sm text-red-500">{errors.sort_order}</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        Update Category
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 