import { useForm } from '@inertiajs/react';
import { Modal, TextInput, Select, Button, Stack, Textarea } from '@mantine/core';

interface CategoryType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    variant: 'equipment' | 'scaffolding';
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category_type_id: number;
    hsn: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at: string;
    updated_at: string;
    category_type: CategoryType;
}

type FormData = {
    name: string;
    slug: string;
    description: string | null;
    category_type_id: number;
    hsn: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
}

interface Props {
    opened: boolean;
    onClose: () => void;
    category: Category | null;
}

export default function EditCategoryModal({ opened, onClose, category }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>('edit-category', {
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? null,
        category_type_id: category?.category_type_id ?? 0,
        hsn: category?.hsn ?? null,
        status: category?.status ?? 'active',
        sort_order: category?.sort_order ?? 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        put(route('equipment.categories.update', { category }), {
            ...data,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit Category"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        required
                    />

                    <TextInput
                        label="Slug"
                        id="slug"
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                        error={errors.slug}
                        required
                    />

                    <Textarea
                        label="Description"
                        id="description"
                        value={data.description ?? ''}
                        onChange={(e) => setData('description', e.target.value || null)}
                        error={errors.description}
                        rows={4}
                    />

                    <Select
                        label="Category Type"
                        id="category_type_id"
                        value={data.category_type_id.toString()}
                        onChange={(value) => value && setData('category_type_id', parseInt(value))}
                        error={errors.category_type_id}
                        data={[
                            { value: '1', label: 'Equipment' },
                            { value: '2', label: 'Scaffolding' }
                        ]}
                        required
                    />

                    <TextInput
                        label="HSN"
                        id="hsn"
                        value={data.hsn ?? ''}
                        onChange={(e) => setData('hsn', e.target.value || null)}
                        error={errors.hsn}
                    />

                    <Select
                        label="Status"
                        id="status"
                        value={data.status}
                        onChange={(value) => setData('status', value as 'active' | 'inactive')}
                        error={errors.status}
                        data={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' }
                        ]}
                        required
                    />

                    <TextInput
                        label="Sort Order"
                        id="sort_order"
                        value={data.sort_order.toString()}
                        onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                        error={errors.sort_order}
                        required
                    />

                    <Button type="submit" loading={processing}>
                        Update Category
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
} 