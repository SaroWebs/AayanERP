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

interface Props {
    opened: boolean;
    onClose: () => void;
}

interface FormData {
    name: string;
    description: string;
    status: 'active' | 'inactive';
    [key: string]: FormDataConvertible;
}

export default function CreateSeriesModal({ opened, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        description: '',
        status: 'active',
    });

    useEffect(() => {
        if (!opened) {
            reset();
        }
    }, [opened]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.series.store'), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Create Equipment Series" size="xl">
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
                        Create Series
                    </Button>
                </Group>
            </form>
        </Modal>
    );
} 