import { useForm } from '@inertiajs/react';
import { Modal, TextInput, Select, Button, Stack, Grid, Textarea, Group, NumberInput, ActionIcon, Paper, Text } from '@mantine/core';
import { useEffect, useState, useMemo } from 'react';
import { slugify } from '@/lib/utils';
import { Plus, Trash } from 'lucide-react';

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
    deleted_at: string | null;
    parent: Category | null;
    children: Category[];
    parent_id: number | null;
    technical_requirements: any[] | null;
    application_areas: any[] | null;
    quality_standards: any[] | null;
}

interface Props {
    opened: boolean;
    onClose: () => void;
    categories: Category[];
}

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
        const trimmedItem = newItem.trim();
        if (trimmedItem) {
            onChange([...value, trimmedItem]);
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
                <ActionIcon 
                    variant="light" 
                    color="blue" 
                    onClick={handleAdd}
                    disabled={!newItem.trim()}
                >
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

interface FormData {
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'inactive';
    sort_order: number;
    parent_id: string;
    technical_requirements: string[];
    application_areas: string[];
    quality_standards: string[];
    [key: string]: string | number | string[] | undefined;
}

export default function CreateCategoryModal({ opened, onClose, categories }: Props) {
    const form = useForm<FormData>({
        name: '',
        slug: '',
        description: '',
        status: 'active',
        sort_order: 0,
        parent_id: '',
        technical_requirements: [],
        application_areas: [],
        quality_standards: [],
    });

    useEffect(() => {
        if (form.data.name) {
            form.setData('slug', slugify(form.data.name));
        }
    }, [form.data.name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update form data with filtered arrays
        form.setData({
            ...form.data,
            technical_requirements: form.data.technical_requirements.filter(Boolean),
            application_areas: form.data.application_areas.filter(Boolean),
            quality_standards: form.data.quality_standards.filter(Boolean),
        });
        
        form.post(route('equipment.categories.store'), {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    const parentCategories = categories
        .filter(cat => !cat.parent_id && !cat.deleted_at) // Filter out deleted categories and only show top-level categories
        .map(cat => ({
            value: cat.id.toString(),
            label: cat.name
        }));

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Create Category"
            size="xl"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Name"
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                error={form.errors.name}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Slug"
                                id="slug"
                                value={form.data.slug}
                                onChange={(e) => form.setData('slug', e.target.value)}
                                error={form.errors.slug}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Description"
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                error={form.errors.description}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Parent Category"
                                id="parent_id"
                                value={form.data.parent_id}
                                onChange={(value) => form.setData('parent_id', value || '')}
                                error={form.errors.parent_id}
                                data={[
                                    { value: '', label: 'None' },
                                    ...parentCategories
                                ]}
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Sort Order"
                                id="sort_order"
                                value={form.data.sort_order}
                                onChange={(value: string | number) => form.setData('sort_order', Number(value) || 0)}
                                error={form.errors.sort_order}
                                min={0}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Status"
                                id="status"
                                value={form.data.status}
                                onChange={(value) => form.setData('status', value as 'active' | 'inactive')}
                                error={form.errors.status}
                                data={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' }
                                ]}
                                required
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <ArrayInput
                                label="Technical Requirements"
                                value={form.data.technical_requirements}
                                onChange={(value) => form.setData('technical_requirements', value)}
                                error={form.errors.technical_requirements}
                                placeholder="Enter technical requirement"
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <ArrayInput
                                label="Application Areas"
                                value={form.data.application_areas}
                                onChange={(value) => form.setData('application_areas', value)}
                                error={form.errors.application_areas}
                                placeholder="Enter application area"
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <ArrayInput
                                label="Quality Standards"
                                value={form.data.quality_standards}
                                onChange={(value) => form.setData('quality_standards', value)}
                                error={form.errors.quality_standards}
                                placeholder="Enter quality standard"
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={form.processing}>
                            Create
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 