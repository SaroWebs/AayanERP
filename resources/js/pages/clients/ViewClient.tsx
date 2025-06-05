import React from 'react';
import { Modal, Tabs, Text, Group, Button, Stack, Badge, Table, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BankAccount, Contact, Document } from './types';

interface ViewClientProps {
    client: {
        id: number;
        name: string;
        contact_no: string;
        email: string;
        gstin_no: string | null;
        pan_no: string | null;
        fax: string | null;
        state: string;
        company_type: string;
        turnover: number;
        range: string;
        address: string;
        correspondence_address: string;
        contacts: Contact[];
        bank_accounts: BankAccount[];
        documents: Document[];
    };
    opened: boolean;
    onClose: () => void;
}

const ViewClient = ({ client, opened, onClose }: ViewClientProps) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="80%"
            title="Client Details"
        >
            <Tabs defaultValue="basic_profile">
                <Tabs.List>
                    <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
                    <Tabs.Tab value="bank_details">Bank Details</Tabs.Tab>
                    <Tabs.Tab value="contact_details">Contact Details</Tabs.Tab>
                    <Tabs.Tab value="documents">Documents</Tabs.Tab>
                </Tabs.List>

                <Stack mt="md">
                    <Tabs.Panel value="basic_profile">
                        <Paper shadow="xs" p="md">
                            <Stack>
                                <Group>
                                    <Text fw={500} size="lg">{client.name}</Text>
                                    <Badge>{client.company_type}</Badge>
                                </Group>

                                <Group>
                                    <Stack>
                                        <Text fw={500}>Contact Information</Text>
                                        <Text>Phone: {client.contact_no}</Text>
                                        <Text>Email: {client.email}</Text>
                                        {client.fax && <Text>Fax: {client.fax}</Text>}
                                    </Stack>

                                    <Stack>
                                        <Text fw={500}>Business Information</Text>
                                        {client.gstin_no && <Text>GSTIN: {client.gstin_no}</Text>}
                                        {client.pan_no && <Text>PAN: {client.pan_no}</Text>}
                                        <Text>State: {client.state}</Text>
                                        <Text>Turnover: {client.turnover}</Text>
                                        <Text>Range: {client.range}</Text>
                                    </Stack>
                                </Group>

                                <Stack>
                                    <Text fw={500}>Address</Text>
                                    <Text>{client.address}</Text>
                                    {client.correspondence_address && (
                                        <>
                                            <Text fw={500}>Correspondence Address</Text>
                                            <Text>{client.correspondence_address}</Text>
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="bank_details">
                        <Paper shadow="xs" p="md">
                            {client.bank_accounts.length > 0 ? (
                                <div className="rounded-lg border overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b">
                                                <th className="px-4 py-2">Holder Name</th>
                                                <th className="px-4 py-2">Account No</th>
                                                <th className="px-4 py-2">Bank (Code)</th>
                                                <th className="px-4 py-2">IFSC</th>
                                                <th className="px-4 py-2">Branch Address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {client.bank_accounts && client.bank_accounts.map((account: BankAccount) => (
                                                <tr key={account.id} className="border-b text-sm">
                                                    <td className="px-4 py-2">{account.account_holder_name}</td>
                                                    <td className="px-4 py-2">{account.account_number}</td>
                                                    <td className="px-4 py-2">{account.bank_name}</td>
                                                    <td className="px-4 py-2">{account.ifsc}</td>
                                                    <td className="px-4 py-2">{account.branch_address}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <Text c="dimmed">No bank accounts found</Text>
                            )}
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="contact_details">
                        <Paper shadow="xs" p="md">
                            {client.contacts.length > 0 ? (
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Contact Person</Table.Th>
                                            <Table.Th>Department</Table.Th>
                                            <Table.Th>Designation</Table.Th>
                                            <Table.Th>Phone</Table.Th>
                                            <Table.Th>Email</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {client.contacts.map((contact: Contact) => (
                                            <Table.Tr key={contact.id}>
                                                <Table.Td>{contact.contact_person}</Table.Td>
                                                <Table.Td>{contact.department}</Table.Td>
                                                <Table.Td>{contact.designation}</Table.Td>
                                                <Table.Td>{contact.phone}</Table.Td>
                                                <Table.Td>{contact.email}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed">No contacts found</Text>
                            )}
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="documents">
                        <Paper shadow="xs" p="md">
                            {client.documents.length > 0 ? (
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Document Type</Table.Th>
                                            <Table.Th>Document Name</Table.Th>
                                            <Table.Th>Document Number</Table.Th>
                                            <Table.Th>Sharing Option</Table.Th>
                                            <Table.Th>Remarks</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {client.documents.map((document: Document) => (
                                            <Table.Tr key={document.id}>
                                                <Table.Td>{document.document_type}</Table.Td>
                                                <Table.Td>{document.document_name}</Table.Td>
                                                <Table.Td>{document.document_number}</Table.Td>
                                                <Table.Td>
                                                    <Badge>{document.sharing_option}</Badge>
                                                </Table.Td>
                                                <Table.Td>{document.remarks}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed">No documents found</Text>
                            )}
                        </Paper>
                    </Tabs.Panel>
                </Stack>
            </Tabs>

            <Group justify="flex-end" mt="xl">
                <Button variant="outline" onClick={onClose}>Close</Button>
            </Group>
        </Modal>
    );
};

export default ViewClient; 