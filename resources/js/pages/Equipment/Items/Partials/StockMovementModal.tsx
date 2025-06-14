import { Modal, TextInput, NumberInput, Select, Textarea, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    opened: boolean;
    onClose: () => void;
    item: {
        id: number;
        name: string;
        code: string;
        current_stock: number;
    };
    loadData: () => void;
}

interface FormData {
    type: 'in' | 'out';
    quantity: number;
    reference_type: string | null;
    reference_id: string | null;
    notes: string | null;
    [key: string]: 'in' | 'out' | number | string | null;
}

export default function StockMovementModal({ opened, onClose, item, loadData }: Props) {
    const [processing, setProcessing] = useState(false);

    const { data, setData, post, processing: formProcessing, errors, reset } = useForm<FormData>({
        type: 'in',
        quantity: 1,
        reference_type: null,
        reference_id: null,
        notes: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        post(route('equipment.items.stock-movement.store', item.id), {
            onSuccess: () => {
                reset();
                onClose();
                loadData();
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Stock Movement - ${item.name} (${item.code})`}
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Select
                        label="Movement Type"
                        placeholder="Select movement type"
                        data={[
                            { value: 'in', label: 'Stock In' },
                            { value: 'out', label: 'Stock Out' },
                        ]}
                        value={data.type}
                        onChange={(value) => setData('type', value as 'in' | 'out')}
                        error={errors.type}
                        required
                    />

                    <NumberInput
                        label="Quantity"
                        placeholder="Enter quantity"
                        min={1}
                        value={data.quantity}
                        onChange={(value) => setData('quantity', typeof value === 'number' ? value : 1)}
                        error={errors.quantity}
                        required
                    />

                    <Select
                        label="Reference Type (Optional)"
                        placeholder="Select reference type"
                        data={[
                            { value: 'purchase_order', label: 'Purchase Order' },
                            { value: 'sales_order', label: 'Sales Order' },
                            { value: 'goods_receipt', label: 'Goods Receipt' },
                            { value: 'dispatch', label: 'Dispatch' },
                            { value: 'adjustment', label: 'Stock Adjustment' },
                        ]}
                        value={data.reference_type}
                        onChange={(value) => setData('reference_type', value)}
                        error={errors.reference_type}
                        clearable
                    />

                    {data.reference_type && (
                        <TextInput
                            label="Reference ID"
                            placeholder="Enter reference ID"
                            value={data.reference_id || ''}
                            onChange={(e) => setData('reference_id', e.currentTarget.value)}
                            error={errors.reference_id}
                        />
                    )}

                    <Textarea
                        label="Notes"
                        placeholder="Enter any additional notes"
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.currentTarget.value)}
                        error={errors.notes}
                        minRows={3}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={processing || formProcessing}>
                            Save Movement
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 