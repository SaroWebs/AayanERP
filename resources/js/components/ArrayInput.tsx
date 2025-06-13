import { TextInput, ActionIcon, Paper, Text, Group, Stack } from '@mantine/core';
import { useState } from 'react';
import { Plus, Trash } from 'lucide-react';

interface ArrayInputProps {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
    placeholder?: string;
}

export default function ArrayInput({ label, value, onChange, error, placeholder = 'Enter item' }: ArrayInputProps) {
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