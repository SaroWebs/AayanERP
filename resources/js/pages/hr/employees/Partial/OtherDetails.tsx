import { useState } from 'react';
import { Button, TextInput, Textarea } from '@mantine/core';

interface OtherDetail {
    blood_group: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    emergency_contact_relation: string;
    hobbies: string | null;
    achievements: string | null;
}

interface OtherDetailsProps {
    otherDetails: OtherDetail[];
    onOtherDetailsChange: (details: OtherDetail[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof OtherDetail)[] = ['blood_group', 'emergency_contact_name', 'emergency_contact_number', 'emergency_contact_relation'];

const OtherDetails = ({ otherDetails, onOtherDetailsChange }: OtherDetailsProps) => {
    const [otherInfo, setOtherInfo] = useState<OtherDetail>({
        blood_group: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        emergency_contact_relation: '',
        hobbies: '',
        achievements: '',
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: OtherDetail): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            return value !== undefined && value !== null && value.trim() !== '';
        });
    };

    const resetForm = () => {
        setOtherInfo({
            blood_group: '',
            emergency_contact_name: '',
            emergency_contact_number: '',
            emergency_contact_relation: '',
            hobbies: '',
            achievements: '',
        });
        setEditingIndex(null);
    };

    const handleSubmit = () => {
        if (!validateRequiredFields(otherInfo)) {
            return;
        }

        if (editingIndex !== null) {
            const updatedDetails = [...otherDetails];
            updatedDetails[editingIndex] = otherInfo;
            onOtherDetailsChange(updatedDetails);
        } else {
            onOtherDetailsChange([...otherDetails, otherInfo]);
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setOtherInfo(otherDetails[index]);
    };

    const handleDelete = (index: number) => {
        const updatedDetails = otherDetails.filter((_, i) => i !== index);
        onOtherDetailsChange(updatedDetails);
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {editingIndex !== null ? 'Edit Other Details' : 'Add New Other Details'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TextInput 
                        label="Blood Group" 
                        value={otherInfo.blood_group} 
                        onChange={(e) => setOtherInfo({ ...otherInfo, blood_group: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Emergency Contact Name" 
                        value={otherInfo.emergency_contact_name} 
                        onChange={(e) => setOtherInfo({ ...otherInfo, emergency_contact_name: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Emergency Contact Number" 
                        value={otherInfo.emergency_contact_number} 
                        onChange={(e) => setOtherInfo({ ...otherInfo, emergency_contact_number: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Emergency Contact Relation" 
                        value={otherInfo.emergency_contact_relation} 
                        onChange={(e) => setOtherInfo({ ...otherInfo, emergency_contact_relation: e.target.value })}
                        required 
                    />
                    <div className="col-span-2">
                        <Textarea 
                            label="Hobbies" 
                            value={otherInfo.hobbies || ''} 
                            onChange={(e) => setOtherInfo({ ...otherInfo, hobbies: e.target.value })}
                            minRows={2}
                        />
                    </div>
                    <div className="col-span-2">
                        <Textarea 
                            label="Achievements" 
                            value={otherInfo.achievements || ''} 
                            onChange={(e) => setOtherInfo({ ...otherInfo, achievements: e.target.value })}
                            minRows={2}
                        />
                    </div>
                </div>
                <Button 
                    className="mt-4" 
                    onClick={handleSubmit}
                    disabled={!validateRequiredFields(otherInfo)}
                >
                    {editingIndex !== null ? 'Update Details' : 'Add Details'}
                </Button>
            </div>

            {otherDetails.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Blood Group</th>
                                <th className="px-4 py-2">Emergency Contact</th>
                                <th className="px-4 py-2">Emergency Number</th>
                                <th className="px-4 py-2">Relation</th>
                                <th className="px-4 py-2">Hobbies</th>
                                <th className="px-4 py-2">Achievements</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {otherDetails.map((detail, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{detail.blood_group}</td>
                                    <td className="px-4 py-2">{detail.emergency_contact_name}</td>
                                    <td className="px-4 py-2">{detail.emergency_contact_number}</td>
                                    <td className="px-4 py-2">{detail.emergency_contact_relation}</td>
                                    <td className="px-4 py-2">{detail.hobbies}</td>
                                    <td className="px-4 py-2">{detail.achievements}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OtherDetails; 