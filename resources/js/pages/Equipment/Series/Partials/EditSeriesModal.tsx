import { Modal, TextInput, Textarea, Select, Button, Group, Grid } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { FormDataConvertible } from '@inertiajs/core';

interface Category {
    id: number;
    name: string;
    slug: string;
    variant: string;
    status: 'active' | 'inactive';
}

interface Series {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'active' | 'inactive';
}

interface Props {
    opened: boolean;
    onClose: () => void;
    series: Series;
}

interface FormData {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    [key: string]: FormDataConvertible;
}

export default function EditSeriesModal({ opened, onClose, series }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        name: series.name,
        description: series.description || '',
        status: series.status,
    });

    useEffect(() => {
        if (opened) {
            setData({
                name: series.name,
                description: series.description || '',
                status: series.status,
            });
        } else {
            reset();
        }
    }, [opened, series]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('equipment.series.update', series.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Edit Equipment Series" size="xl">
            <form onSubmit={handleSubmit}>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput
                            label="Name"
                            placeholder="Enter series name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Status"
                            placeholder="Select status"
                            data={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                            value={data.status}
                            onChange={(value) => setData('status', (value as 'active' | 'inactive') || 'active')}
                            error={errors.status}
                            required
                        />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Textarea
                            label="Description"
                            placeholder="Enter series description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
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
                        Update Series
                    </Button>
                </Group>
            </form>
        </Modal>
    );
} 