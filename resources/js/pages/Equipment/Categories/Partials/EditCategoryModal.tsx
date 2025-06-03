import { useForm } from '@inertiajs/react';
import { Modal, TextInput, Select, Button, Stack, Grid, Textarea, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import { slugify } from '@/lib/utils';

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
    variant: 'equipment' | 'scaffolding';
}

interface Props {
    opened: boolean;
    onClose: () => void;
    category: Category | null;
    categoryTypes: CategoryType[];
}

export default function EditCategoryModal({ opened, onClose, category, categoryTypes }: Props) {
    const [filteredCategoryTypes, setFilteredCategoryTypes] = useState<CategoryType[]>([]);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: '',
        slug: '',
        description: null,
        category_type_id: 0,
        hsn: null,
        status: 'active',
        variant: 'equipment',
    });

    useEffect(() => {
        if (category) {
            setData({
                name: category.name,
                slug: category.slug,
                description: category.description,
                category_type_id: category.category_type_id,
                hsn: category.hsn,
                status: category.status,
                variant: category.category_type.variant,
            });
        }
    }, [category, setData]);

    useEffect(() => {
        // Filter category types based on selected variant and active status
        const filtered = categoryTypes.filter(type => 
            type.variant === data.variant && 
            type.status === 'active'
        );
        setFilteredCategoryTypes(filtered);
        
        // Reset category type when variant changes or if selected type becomes inactive
        if (data.category_type_id) {
            const selectedType = categoryTypes.find(type => type.id === data.category_type_id);
            if (selectedType?.variant !== data.variant || selectedType?.status !== 'active') {
                setData('category_type_id', 0);
            }
        }
    }, [data.variant, categoryTypes]);

    useEffect(() => {
        // Auto-generate slug from name
        if (data.name) {
            setData('slug', slugify(data.name));
        }
    }, [data.name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        put(route('equipment.categories.update', category.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit Category"
            size="xl"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Name"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Slug"
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                error={errors.slug}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Variant"
                                id="variant"
                                value={data.variant}
                                onChange={(value) => setData('variant', value as 'equipment' | 'scaffolding')}
                                error={errors.variant}
                                data={[
                                    { value: 'equipment', label: 'Equipment' },
                                    { value: 'scaffolding', label: 'Scaffolding' }
                                ]}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Category Type"
                                id="category_type_id"
                                value={data.category_type_id.toString()}
                                onChange={(value) => value && setData('category_type_id', parseInt(value))}
                                error={errors.category_type_id}
                                data={filteredCategoryTypes.map(type => ({
                                    value: type.id.toString(),
                                    label: type.name
                                }))}
                                disabled={!data.variant}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="HSN"
                                id="hsn"
                                value={data.hsn ?? ''}
                                onChange={(e) => setData('hsn', e.target.value || null)}
                                error={errors.hsn}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
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
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Description"
                                id="description"
                                value={data.description ?? ''}
                                onChange={(e) => setData('description', e.target.value || null)}
                                error={errors.description}
                                minRows={3}
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={processing}>
                            Update Category
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 