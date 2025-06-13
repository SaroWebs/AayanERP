import { useForm } from '@inertiajs/react';
import { Modal, TextInput, Select, Button, Stack, Grid, Textarea, Group, NumberInput, ActionIcon, Paper, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { slugify } from '@/lib/utils';
import { Plus, Trash } from 'lucide-react';

interface ArrayInputProps {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
    placeholder?: string;
}

function ArrayInput({ label, value, onChange, error, placeholder = 'Enter item' }: ArrayInputProps) {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            onChange([...value, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="xs">
            <Text size="sm" fw={500}>{label}</Text>
            <Group gap="xs">
                <TextInput
                    placeholder={placeholder}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                />
                <ActionIcon variant="light" color="blue" onClick={handleAdd}>
                    <Plus size={16} />
                </ActionIcon>
            </Group>
            {error && <Text size="xs" c="red">{error}</Text>}
            <Stack gap="xs">
                {value.map((item, index) => (
                    <Paper key={index} p="xs" withBorder>
                        <Group justify="space-between">
                            <Text size="sm">{item}</Text>
                            <ActionIcon variant="light" color="red" onClick={() => handleRemove(index)}>
                                <Trash size={16} />
                            </ActionIcon>
                        </Group>
                    </Paper>
                ))}
            </Stack>
        </Stack>
    );
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    parent_id: number | null;
    technical_requirements: string[] | null;
    application_areas: string[] | null;
    quality_standards: string[] | null;
    created_at: string;
    updated_at: string;
    parent: Category | null;
    children: Category[];
}

type FormData = {
    name: string;
    slug: string;
    description: string | null;
    parent_id: string;
    status: 'active' | 'inactive';
    sort_order: number;
    technical_requirements: string[];
    application_areas: string[];
    quality_standards: string[];
}

interface Props {
    opened: boolean;
    onClose: () => void;
    category: Category | null;
    categories: Category[];
}

export default function EditCategoryModal({ opened, onClose, category, categories }: Props) {
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: '',
        slug: '',
        description: null,
        parent_id: '',
        status: 'active',
        sort_order: 0,
        technical_requirements: [],
        application_areas: [],
        quality_standards: [],
    });

    useEffect(() => {
        if (category) {
            setData({
                name: category.name,
                slug: category.slug,
                description: category.description,
                parent_id: category.parent_id?.toString() || '',
                status: category.status,
                sort_order: category.sort_order,
                technical_requirements: category.technical_requirements || [],
                application_areas: category.application_areas || [],
                quality_standards: category.quality_standards || [],
            });
        }
    }, [category, setData]);

    useEffect(() => {
        // Filter categories based on selected parent
        const filtered = categories.filter(cat => 
            cat.parent_id === (data.parent_id ? parseInt(data.parent_id) : null)
        );
        setFilteredCategories(filtered);
        
        // Reset parent when selected parent becomes inactive
        if (data.parent_id) {
            const selectedParent = categories.find(cat => cat.id === parseInt(data.parent_id));
            if (selectedParent?.status !== 'active') {
                setData('parent_id', '');
            }
        }
    }, [data.parent_id, categories]);

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
                                label="Parent Category"
                                id="parent_id"
                                value={data.parent_id}
                                onChange={(value) => setData('parent_id', value || '')}
                                error={errors.parent_id}
                                data={filteredCategories.map(cat => ({
                                    value: cat.id.toString(),
                                    label: cat.name
                                }))}
                                disabled={!data.parent_id}
                                required
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
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Sort Order"
                                id="sort_order"
                                value={data.sort_order}
                                onChange={(value) => setData('sort_order', Number(value))}
                                error={errors.sort_order}
                                min={0}
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
                        <Grid.Col span={12}>
                            <ArrayInput
                                label="Technical Requirements"
                                value={data.technical_requirements}
                                onChange={(value) => setData('technical_requirements', value)}
                                error={errors.technical_requirements}
                                placeholder="Enter technical requirement"
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <ArrayInput
                                label="Application Areas"
                                value={data.application_areas}
                                onChange={(value) => setData('application_areas', value)}
                                error={errors.application_areas}
                                placeholder="Enter application area"
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <ArrayInput
                                label="Quality Standards"
                                value={data.quality_standards}
                                onChange={(value) => setData('quality_standards', value)}
                                error={errors.quality_standards}
                                placeholder="Enter quality standard"
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