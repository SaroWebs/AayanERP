import { useForm } from '@inertiajs/react';
import { Modal, TextInput, Select, Button, Stack } from '@mantine/core';

interface Props {
    opened: boolean;
    onClose: () => void;
}

export default function CreateCategoryModal({ opened, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        variant: 'equipment' as 'equipment' | 'scaffolding',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('equipment.categories.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Create Category"
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

                    <Button type="submit" loading={processing}>
                        Create Category
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
} 