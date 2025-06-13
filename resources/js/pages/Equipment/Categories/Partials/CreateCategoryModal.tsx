import { useForm } from '@inertiajs/react';
import { Modal, TextInput, Select, Button, Stack, Grid, Textarea, Group, NumberInput, ActionIcon, Paper, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { slugify } from '@/lib/utils';
import { Plus, Trash } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    sort_order: number;
    parent_id: number | null;
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

export default function CreateCategoryModal({ opened, onClose, categories }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        description: '',
        status: 'active',
        sort_order: 0,
        parent_id: '',
        technical_requirements: [] as string[],
        application_areas: [] as string[],
        quality_standards: [] as string[],
    });

    useEffect(() => {
        if (data.name) {
            setData('slug', slugify(data.name));
        }
    }, [data.name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.categories.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const parentCategories = categories.filter(cat => !cat.parent_id);

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
                        <Grid.Col span={12}>
                            <Textarea
                                label="Description"
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Select
                                label="Parent Category"
                                id="parent_id"
                                value={data.parent_id}
                                onChange={(value) => setData('parent_id', value || '')}
                                error={errors.parent_id}
                                data={[
                                    { value: '', label: 'None' },
                                    ...parentCategories.map(cat => ({
                                        value: cat.id.toString(),
                                        label: cat.name
                                    }))
                                ]}
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="Sort Order"
                                id="sort_order"
                                value={data.sort_order}
                                onChange={(value: string | number) => setData('sort_order', Number(value) || 0)}
                                error={errors.sort_order}
                                min={0}
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
                            Create
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 