import { useState } from 'react';
import { Button, TextInput, Select } from '@mantine/core';

interface Address {
    type: 'permanent' | 'residential' | 'work';
    care_of: string | null;
    house_number: string | null;
    street: string | null;
    landmark: string | null;
    police_station: string | null;
    post_office: string | null;
    city: string | null;
    state: string | null;
    pin_code: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    is_verified: boolean;
}

interface AddressDetailsProps {
    addresses: Address[];
    onAddressesChange: (addresses: Address[]) => void;
}

const AddressDetails = ({ addresses, onAddressesChange }: AddressDetailsProps) => {
    const [address, setAddress] = useState<Address>({
        type: 'permanent',
        care_of: null,
        house_number: null,
        street: null,
        landmark: null,
        police_station: null,
        post_office: null,
        city: null,
        state: null,
        pin_code: null,
        country: null,
        phone: null,
        email: null,
        is_verified: false,
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const resetForm = () => {
        setAddress({
            type: 'permanent',
            care_of: null,
            house_number: null,
            street: null,
            landmark: null,
            police_station: null,
            post_office: null,
            city: null,
            state: null,
            pin_code: null,
            country: null,
            phone: null,
            email: null,
            is_verified: false,
        });
        setEditingIndex(null);
    };

    const handleSubmit = () => {
        if (editingIndex !== null) {
            const updatedAddresses = [...addresses];
            updatedAddresses[editingIndex] = address;
            onAddressesChange(updatedAddresses);
        } else {
            onAddressesChange([...addresses, address]);
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setAddress(addresses[index]);
    };

    const handleDelete = (index: number) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        onAddressesChange(updatedAddresses);
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {editingIndex !== null ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <Select
                        label="Address Type"
                        value={address.type}
                        onChange={(value) => setAddress({ ...address, type: value as Address['type'] })}
                        data={[
                            { value: 'permanent', label: 'Permanent' },
                            { value: 'residential', label: 'Residential' },
                            { value: 'work', label: 'Work' },
                        ]}
                    />
                    <TextInput
                        label="Care Of"
                        value={address.care_of || ''}
                        onChange={(e) => setAddress({ ...address, care_of: e.target.value || null })}
                    />
                    <TextInput
                        label="House Number"
                        value={address.house_number || ''}
                        onChange={(e) => setAddress({ ...address, house_number: e.target.value || null })}
                    />
                    <TextInput
                        label="Street"
                        value={address.street || ''}
                        onChange={(e) => setAddress({ ...address, street: e.target.value || null })}
                    />
                    <TextInput
                        label="Landmark"
                        value={address.landmark || ''}
                        onChange={(e) => setAddress({ ...address, landmark: e.target.value || null })}
                    />
                    <TextInput
                        label="Police Station"
                        value={address.police_station || ''}
                        onChange={(e) => setAddress({ ...address, police_station: e.target.value || null })}
                    />
                    <TextInput
                        label="Post Office"
                        value={address.post_office || ''}
                        onChange={(e) => setAddress({ ...address, post_office: e.target.value || null })}
                    />
                    <TextInput
                        label="City"
                        value={address.city || ''}
                        onChange={(e) => setAddress({ ...address, city: e.target.value || null })}
                    />
                    <TextInput
                        label="State"
                        value={address.state || ''}
                        onChange={(e) => setAddress({ ...address, state: e.target.value || null })}
                    />
                    <TextInput
                        label="PIN Code"
                        value={address.pin_code || ''}
                        onChange={(e) => setAddress({ ...address, pin_code: e.target.value || null })}
                    />
                    <TextInput
                        label="Country"
                        value={address.country || ''}
                        onChange={(e) => setAddress({ ...address, country: e.target.value || null })}
                    />
                    <TextInput
                        label="Phone"
                        value={address.phone || ''}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value || null })}
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        value={address.email || ''}
                        onChange={(e) => setAddress({ ...address, email: e.target.value || null })}
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleSubmit}>
                        {editingIndex !== null ? 'Update Address' : 'Add Address'}
                    </Button>
                </div>
            </div>

            {addresses.length > 0 && (
                <div className="rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Addresses List</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {addresses.map((addr, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {addr.type.charAt(0).toUpperCase() + addr.type.slice(1)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {[
                                                addr.house_number,
                                                addr.street,
                                                addr.landmark,
                                                addr.city,
                                                addr.state,
                                                addr.pin_code,
                                                addr.country
                                            ].filter(Boolean).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {[addr.phone, addr.email].filter(Boolean).join(' | ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                            <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressDetails; 