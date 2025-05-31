import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button, TextInput, Select, Textarea, Paper, Group, Stack, Title, Text } from '@mantine/core';
import { BreadcrumbItem } from '@/types';
import { ArrowLeftIcon } from 'lucide-react';

interface Props extends PageProps {}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        variant: 'equipment',
        status: 'active',
        sort_order: 0,
    });

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
            title: 'Create',
            href: route('equipment.category-types.create'),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('category-types.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category Type" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Paper shadow="sm" p="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Title order={2}>Create Category Type</Title>
                            <Button
                                variant="light"
                                onClick={() => window.history.back()}
                                leftSection={<ArrowLeftIcon size={16} />}
                            >
                                Back
                            </Button>
                        </Group>

                        <form onSubmit={handleSubmit}>
                            <Stack>
                                <TextInput
                                    label="Name"
                                    placeholder="Enter category type name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    required
                                />

                                <Textarea
                                    label="Description"
                                    placeholder="Enter category type description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={errors.description}
                                    minRows={4}
                                />

                                <Select
                                    label="Variant"
                                    placeholder="Select variant"
                                    value={data.variant}
                                    onChange={(value) => setData('variant', value as 'equipment' | 'scaffolding')}
                                    data={[
                                        { value: 'equipment', label: 'Equipment' },
                                        { value: 'scaffolding', label: 'Scaffolding' },
                                    ]}
                                    error={errors.variant}
                                />

                                <Select
                                    label="Status"
                                    placeholder="Select status"
                                    value={data.status}
                                    onChange={(value) => setData('status', value as 'active' | 'inactive')}
                                    data={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                    ]}
                                    error={errors.status}
                                />

                                <TextInput
                                    label="Sort Order"
                                    type="number"
                                    min={0}
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                    error={errors.sort_order}
                                />

                                <Group justify="flex-end" mt="md">
                                    <Button type="submit" loading={processing}>
                                        Create Category Type
                                    </Button>
                                </Group>
                            </Stack>
                        </form>
                    </Paper>
                </div>
            </div>
        </AppLayout>
    );
} 