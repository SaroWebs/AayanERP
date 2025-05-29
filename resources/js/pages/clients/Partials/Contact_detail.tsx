import { useState } from 'react';
import { Button, TextInput } from '@mantine/core';

interface ContactDetail {
    contact_person: string;
    department: string;
    designation: string;
    phone: string;
    email: string;
}

interface ContactDetailsProps {
    contactDetails: ContactDetail[];
    onContactDetailsChange: (contacts: ContactDetail[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof ContactDetail)[] = ['contact_person', 'phone'];

const ContactDetails = ({ contactDetails, onContactDetailsChange }: ContactDetailsProps) => {
    const [contactInfo, setContactInfo] = useState<ContactDetail>({
        contact_person: '',
        department: '',
        designation: '',
        phone: '',
        email: '',
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: ContactDetail): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            return value !== undefined && value !== null && value.trim() !== '';
        });
    };

    const resetForm = () => {
        setContactInfo({
            contact_person: '',
            department: '',
            designation: '',
            phone: '',
            email: '',
        });
        setEditingIndex(null);
    };

    const handleSubmit = () => {
        if (!validateRequiredFields(contactInfo)) {
            return;
        }

        if (editingIndex !== null) {
            const updatedContacts = [...contactDetails];
            updatedContacts[editingIndex] = contactInfo;
            onContactDetailsChange(updatedContacts);
        } else {
            onContactDetailsChange([...contactDetails, contactInfo]);
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setContactInfo(contactDetails[index]);
    };

    const handleDelete = (index: number) => {
        const updatedContacts = contactDetails.filter((_, i) => i !== index);
        onContactDetailsChange(updatedContacts);
        resetForm();
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
                        label="Contact Person" 
                        value={contactInfo.contact_person} 
                        onChange={(e) => setContactInfo({ ...contactInfo, contact_person: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Department" 
                        value={contactInfo.department} 
                        onChange={(e) => setContactInfo({ ...contactInfo, department: e.target.value })}
                    />
                    <TextInput 
                        label="Designation" 
                        value={contactInfo.designation} 
                        onChange={(e) => setContactInfo({ ...contactInfo, designation: e.target.value })}
                    />
                    <TextInput 
                        label="Phone" 
                        value={contactInfo.phone} 
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Email" 
                        value={contactInfo.email} 
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        type="email"
                    />
                </div>
                <Button 
                    className="mt-4" 
                    onClick={handleSubmit}
                    disabled={!validateRequiredFields(contactInfo)}
                >
                    {editingIndex !== null ? 'Update Contact' : 'Add Contact'}
                </Button>
            </div>

            {contactDetails.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Contact Person</th>
                                <th className="px-4 py-2">Department</th>
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2">Phone</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contactDetails.map((contact, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{contact.contact_person}</td>
                                    <td className="px-4 py-2">{contact.department}</td>
                                    <td className="px-4 py-2">{contact.designation}</td>
                                    <td className="px-4 py-2">{contact.phone}</td>
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