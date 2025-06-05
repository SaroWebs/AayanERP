import React, { useState } from 'react';
import { TextInput, Button, Group, Stack, Paper, Title, Table, ActionIcon } from '@mantine/core';
import { Edit, Trash2 } from 'lucide-react';
import { Contact } from '../types';

interface ContactDetailsProps {
    contacts: Contact[];
    onContactsChange: (contacts: Contact[]) => void;
}

const ContactDetails = ({ contacts, onContactsChange }: ContactDetailsProps) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [contactInfo, setContactInfo] = useState<Contact>({
        contact_person: '',
        department: '',
        designation: '',
        email: '',
        phone: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIndex !== null) {
            const updatedContacts = [...contacts];
            updatedContacts[editingIndex] = contactInfo;
            onContactsChange(updatedContacts);
            setEditingIndex(null);
        } else {
            onContactsChange([...contacts, contactInfo]);
        }
        setContactInfo({
            contact_person: '',
            department: '',
            designation: '',
            email: '',
            phone: '',
            is_active: true,
        });
    };

    const editContact = (index: number) => {
        setContactInfo(contacts[index]);
        setEditingIndex(index);
    };

    const deleteContact = (index: number) => {
        const updatedContacts = contacts.filter((_, i) => i !== index);
        onContactsChange(updatedContacts);
    };

    return (
        <Paper shadow="xs" p="md">
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Title order={3}>Contact Details</Title>

                    <Stack>
                        <TextInput
                            label="Contact Person"
                            placeholder="Enter contact person name"
                            value={contactInfo.contact_person}
                            onChange={(e) => setContactInfo({ ...contactInfo, contact_person: e.target.value })}
                            required
                        />

                        <TextInput
                            label="Department"
                            placeholder="Enter department"
                            value={contactInfo.department}
                            onChange={(e) => setContactInfo({ ...contactInfo, department: e.target.value })}
                        />

                        <TextInput
                            label="Designation"
                            placeholder="Enter designation"
                            value={contactInfo.designation}
                            onChange={(e) => setContactInfo({ ...contactInfo, designation: e.target.value })}
                        />

                        <TextInput
                            label="Email"
                            placeholder="Enter email address"
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        />

                        <TextInput
                            label="Phone"
                            placeholder="Enter phone number"
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        />

                        <Group>
                            <Button type="submit">
                                {editingIndex !== null ? 'Update Contact' : 'Add Contact'}
                            </Button>
                            {editingIndex !== null && (
                                <Button variant="outline" onClick={() => {
                                    setEditingIndex(null);
                                    setContactInfo({
                                        contact_person: '',
                                        department: '',
                                        designation: '',
                                        email: '',
                                        phone: '',
                                        is_active: true,
                                    });
                                }}>
                                    Cancel
                                </Button>
                            )}
                        </Group>
                    </Stack>

                    {contacts.length > 0 && (
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Contact Person</Table.Th>
                                    <Table.Th>Department</Table.Th>
                                    <Table.Th>Designation</Table.Th>
                                    <Table.Th>Email</Table.Th>
                                    <Table.Th>Phone</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {contacts.map((contact, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>{contact.contact_person}</Table.Td>
                                        <Table.Td>{contact.department}</Table.Td>
                                        <Table.Td>{contact.designation}</Table.Td>
                                        <Table.Td>{contact.email}</Table.Td>
                                        <Table.Td>{contact.phone}</Table.Td>
                                        <Table.Td>
                                            <Group>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="blue"
                                                    onClick={() => editContact(index)}
                                                >
                                                    <Edit size={16} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={() => deleteContact(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Stack>
            </form>
        </Paper>
    );
};

export default ContactDetails;