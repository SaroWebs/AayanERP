import React, { useState } from 'react';
import { Button, TextInput, Group } from '@mantine/core';
import { notifications } from "@mantine/notifications";
import { ContactDetailsProps, ContactDetail } from '../types';

// Define required fields
const REQUIRED_FIELDS: (keyof ContactDetail)[] = ['name', 'designation', 'mobile', 'email'];

const ContactDetails: React.FC<ContactDetailsProps> = ({ contactDetails, setContactDetails, isEdit = false }) => {
    const [contactInfo, setContactInfo] = useState<ContactDetail>({
        name: '',
        designation: '',
        mobile: '',
        email: '',
        landline: '',
        is_primary: false
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const resetForm = () => {
        setContactInfo({
            name: '',
            designation: '',
            mobile: '',
            email: '',
            landline: '',
            is_primary: false
        });
        setEditingIndex(null);
    };

    const handleSubmit = () => {
        // Validate required fields
        const missingFields = REQUIRED_FIELDS.filter(field => !contactInfo[field]);
        if (missingFields.length > 0) {
            notifications.show({
                title: 'Validation Error',
                message: `Please fill in all required fields: ${missingFields.join(', ')}`,
                color: 'red',
            });
            return;
        }

        if (editingIndex !== null) {
            const updatedContacts = [...contactDetails];
            updatedContacts[editingIndex] = contactInfo;
            setContactDetails(updatedContacts);
            notifications.show({
                title: 'Success',
                message: 'Contact updated successfully',
                color: 'green',
            });
            resetForm();
        } else {
            setContactDetails([...contactDetails, contactInfo]);
            notifications.show({
                title: 'Success',
                message: 'Contact added successfully',
                color: 'green',
            });
            resetForm();
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setContactInfo(contactDetails[index]);
    };

    const handleDelete = (index: number) => {
        const updatedContacts = contactDetails.filter((_, i) => i !== index);
        setContactDetails(updatedContacts);
        resetForm();
        notifications.show({
            title: 'Success',
            message: 'Contact deleted successfully',
            color: 'green',
        });
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {editingIndex !== null ? 'Edit Contact Person' : 'Add New Contact Person'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TextInput 
                        label="Name" 
                        value={contactInfo.name} 
                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Landline" 
                        value={contactInfo.landline} 
                        onChange={(e) => setContactInfo({ ...contactInfo, landline: e.target.value })}
                    />
                    <TextInput 
                        label="Designation" 
                        value={contactInfo.designation} 
                        onChange={(e) => setContactInfo({ ...contactInfo, designation: e.target.value })}
                        required
                    />
                    <TextInput 
                        label="Mobile" 
                        value={contactInfo.mobile} 
                        onChange={(e) => setContactInfo({ ...contactInfo, mobile: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Email" 
                        value={contactInfo.email} 
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        type="email"
                        required
                    />
                </div>
                <Button 
                    className="mt-4" 
                    onClick={handleSubmit}
                    disabled={!REQUIRED_FIELDS.every(field => contactInfo[field])}
                >
                    {editingIndex !== null ? 'Update Contact' : 'Add Contact'}
                </Button>
            </div>

            {contactDetails.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Landline</th>
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2">Mobile</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contactDetails.map((contact, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{contact.name}</td>
                                    <td className="px-4 py-2">{contact.landline}</td>
                                    <td className="px-4 py-2">{contact.designation}</td>
                                    <td className="px-4 py-2">{contact.mobile}</td>
                                    <td className="px-4 py-2">{contact.email}</td>
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

export default ContactDetails; 