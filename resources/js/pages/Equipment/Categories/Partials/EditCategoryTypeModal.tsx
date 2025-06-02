import { useForm } from '@inertiajs/react';
import { Modal, TextInput, Select, Button, Stack, Textarea } from '@mantine/core';
import { slugify } from '@/lib/utils';

interface CategoryType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    variant: 'equipment' | 'scaffolding';
    status: 'active' | 'inactive';
}

interface Props {
    opened: boolean;
    onClose: () => void;
    categoryType: CategoryType | null;
}

export default function EditCategoryTypeModal({ opened, onClose, categoryType }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: categoryType?.name || '',
        slug: categoryType?.slug || '',
        description: categoryType?.description || '',
        variant: categoryType?.variant || 'equipment',
        status: categoryType?.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryType) return;

        put(route('equipment.category-types.update', categoryType.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const handleNameChange = (value: string) => {
        setData('name', value);
        setData('slug', slugify(value));
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Edit Category Type"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        id="name"
                        value={data.name}
                        onChange={(e) => handleNameChange(e.target.value)}
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
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        rows={4}
                    />

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

                    <Button type="submit" loading={processing}>
                        Update Category Type
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
} 