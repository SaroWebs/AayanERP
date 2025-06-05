import { Modal, Button, TextInput, Select, Textarea, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { router } from '@inertiajs/react';
import { notifications } from '@mantine/notifications';
import { FormDataConvertible } from '@inertiajs/core';
import { FormValues } from '../types';

interface Props {
    opened: boolean;
    onClose: () => void;
    clients: Array<{ id: number; name: string }>;
}

export function AddNew({ opened, onClose, clients }: Props) {
    const form = useForm<FormValues>({
        initialValues: {
            client_id: 0,
            subject: '',
            description: '',
        },
        validate: {
            client_id: (value: FormDataConvertible) => (!value ? 'Client is required' : null),
            subject: (value: FormDataConvertible) => (!value ? 'Subject is required' : null),
            description: (value: FormDataConvertible) => (!value ? 'Description is required' : null),
        },
    });

    const handleSubmit = (values: FormValues) => {
        router.post(route('sales.enquiries.store'), values, {
            onSuccess: () => {
                notifications.show({
                    title: 'Success',
                    message: 'Enquiry created successfully',
                    color: 'green',
                });
                onClose();
            },
            onError: (errors) => {
                notifications.show({
                    title: 'Error',
                    message: Object.values(errors).join('\n'),
                    color: 'red',
                });
            },
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="New Enquiry"
            size="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Select
                        label="Client"
                        placeholder="Select client"
                        data={clients.map(client => ({ value: client.id.toString(), label: client.name }))}
                        searchable
                        required
                        {...form.getInputProps('client_id')}
                    />

                    <TextInput
                        label="Subject"
                        placeholder="Enter subject"
                        required
                        {...form.getInputProps('subject')}
                    />

                    <Textarea
                        label="Description"
                        placeholder="Enter description"
                        minRows={4}
                        required
                        {...form.getInputProps('description')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create Enquiry
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 