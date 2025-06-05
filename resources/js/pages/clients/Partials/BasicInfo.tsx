import React, { useState } from 'react';
import { TextInput, Textarea, Select, NumberInput, Button, Group, Stack, Paper, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

interface BasicInfoProps {
    client: any;
    onUpdate: (data: any) => void;
}

export function BasicInfo({ client, onUpdate }: BasicInfoProps) {
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        contact_no: client?.contact_no || '',
        gstin_no: client?.gstin_no || '',
        pan_no: client?.pan_no || '',
        fax: client?.fax || '',
        state: client?.state || '',
        address: client?.address || '',
        correspondence_address: client?.correspondence_address || '',
        company_type: client?.company_type || 'regional',
        turnover: client?.turnover || 0,
        range: client?.range || null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.patch(`/data/clients/${client.id}/basic`, formData);
            notifications.show({
                title: 'Success',
                message: 'Basic information updated successfully',
                color: 'green',
            });
            onUpdate(response.data.client);
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update basic information',
                color: 'red',
            });
        }
    };

    return (
        <Paper shadow="xs" p="md">
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Title order={3}>Basic Information</Title>
                    
                    <TextInput
                        label="Name"
                        placeholder="Enter client name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <TextInput
                        label="Email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <TextInput
                        label="Contact Number"
                        placeholder="Enter contact number"
                        value={formData.contact_no}
                        onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                    />

                    <TextInput
                        label="GSTIN"
                        placeholder="Enter GSTIN number"
                        value={formData.gstin_no}
                        onChange={(e) => setFormData({ ...formData, gstin_no: e.target.value })}
                    />

                    <TextInput
                        label="PAN Number"
                        placeholder="Enter PAN number"
                        value={formData.pan_no}
                        onChange={(e) => setFormData({ ...formData, pan_no: e.target.value })}
                    />

                    <TextInput
                        label="Fax"
                        placeholder="Enter fax number"
                        value={formData.fax}
                        onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    />

                    <TextInput
                        label="State"
                        placeholder="Enter state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />

                    <Textarea
                        label="Address"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        minRows={3}
                    />

                    <Textarea
                        label="Correspondence Address"
                        placeholder="Enter correspondence address"
                        value={formData.correspondence_address}
                        onChange={(e) => setFormData({ ...formData, correspondence_address: e.target.value })}
                        minRows={3}
                    />

                    <Select
                        label="Company Type"
                        placeholder="Select company type"
                        value={formData.company_type}
                        onChange={(value) => setFormData({ ...formData, company_type: value || 'regional' })}
                        data={[
                            { value: 'regional', label: 'Regional' },
                            { value: 'national', label: 'National' },
                            { value: 'government', label: 'Government' },
                        ]}
                        required
                    />

                    <NumberInput
                        label="Turnover"
                        placeholder="Enter turnover"
                        value={formData.turnover}
                        onChange={(value) => setFormData({ ...formData, turnover: value || 0 })}
                        min={0}
                        required
                    />

                    <Select
                        label="Range"
                        placeholder="Select range"
                        value={formData.range}
                        onChange={(value) => setFormData({ ...formData, range: value })}
                        data={[
                            { value: 'state', label: 'State' },
                            { value: 'central', label: 'Central' },
                            { value: 'NA', label: 'NA' },
                        ]}
                        clearable
                    />

                    <Group justify="flex-end">
                        <Button type="submit">Update Basic Information</Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
} 