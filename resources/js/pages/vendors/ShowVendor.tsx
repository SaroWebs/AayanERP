import React from 'react';
import { Card, Text, Group, Stack, Grid, Badge, Table, Title, Divider, Paper } from '@mantine/core';
import { Vendor } from './types';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface ShowVendorProps {
    vendor: Vendor;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vendors', href: '/master/vendors' },
    { title: 'Vendor Details', href: '#' },
];

const ShowVendor: React.FC<ShowVendorProps> = ({ vendor }) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="p-6 relative">
                    <Stack gap="lg">
                        {/* Basic Information */}
                        <Card withBorder shadow="sm" p="lg">
                            <Title order={2} mb="md">Basic Information</Title>
                            <Grid>
                                <Grid.Col span={6}>
                                    <Stack gap="xs">
                                        <Group>
                                            <Text fw={500} size="sm">Name:</Text>
                                            <Text>{vendor.name}</Text>
                                        </Group>
                                        <Group>
                                            <Text fw={500} size="sm">Email:</Text>
                                            <Text>{vendor.email}</Text>
                                        </Group>
                                        <Group>
                                            <Text fw={500} size="sm">Contact No:</Text>
                                            <Text>{vendor.contact_no}</Text>
                                        </Group>
                                    </Stack>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Stack gap="xs">
                                        <Group>
                                            <Text fw={500} size="sm">GSTIN:</Text>
                                            <Text>{vendor.gstin || 'N/A'}</Text>
                                        </Group>
                                        <Group>
                                            <Text fw={500} size="sm">PAN No:</Text>
                                            <Text>{vendor.pan_no || 'N/A'}</Text>
                                        </Group>
                                        <Group>
                                            <Text fw={500} size="sm">State:</Text>
                                            <Text>{vendor.state || 'N/A'}</Text>
                                        </Group>
                                    </Stack>
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Group>
                                        <Text fw={500} size="sm">Address:</Text>
                                        <Text>{vendor.address || 'N/A'}</Text>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                        </Card>

                        {/* Bank Accounts */}
                        <Card withBorder shadow="sm" p="lg">
                            <Title order={2} mb="md">Bank Accounts</Title>
                            {vendor.bank_accounts.length > 0 ? (
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Account Holder</Table.Th>
                                            <Table.Th>Account Number</Table.Th>
                                            <Table.Th>Bank Name</Table.Th>
                                            <Table.Th>IFSC Code</Table.Th>
                                            <Table.Th>Branch Address</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {vendor.bank_accounts.map((account) => (
                                            <Table.Tr key={account.id}>
                                                <Table.Td>{account.account_holder_name}</Table.Td>
                                                <Table.Td>{account.account_number}</Table.Td>
                                                <Table.Td>{account.bank_name}</Table.Td>
                                                <Table.Td>{account.ifsc}</Table.Td>
                                                <Table.Td>{account.branch_address || 'N/A'}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed" ta="center">No bank accounts found</Text>
                            )}
                        </Card>

                        {/* Contact Persons */}
                        <Card withBorder shadow="sm" p="lg">
                            <Title order={2} mb="md">Contact Persons</Title>
                            {vendor.contact_details.length > 0 ? (
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Name</Table.Th>
                                            <Table.Th>Designation</Table.Th>
                                            <Table.Th>Department</Table.Th>
                                            <Table.Th>Mobile</Table.Th>
                                            <Table.Th>Email</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {vendor.contact_details.map((contact) => (
                                            <Table.Tr key={contact.id}>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        {contact.contact_person}
                                                        {contact.is_primary && (
                                                            <Badge size="sm" color="blue">Primary</Badge>
                                                        )}
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>{contact.designation || 'N/A'}</Table.Td>
                                                <Table.Td>{contact.department || 'N/A'}</Table.Td>
                                                <Table.Td>{contact.phone || 'N/A'}</Table.Td>
                                                <Table.Td>{contact.email || 'N/A'}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed" ta="center">No contact persons found</Text>
                            )}
                        </Card>

                        {/* Documents */}
                        <Card withBorder shadow="sm" p="lg">
                            <Title order={2} mb="md">Documents</Title>
                            {vendor.documents.length > 0 ? (
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Name</Table.Th>
                                            <Table.Th>Number</Table.Th>
                                            <Table.Th>Remarks</Table.Th>
                                            <Table.Th>Sharing</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {vendor.documents.map((doc) => (
                                            <Table.Tr key={doc.id}>
                                                <Table.Td>{doc.document_type}</Table.Td>
                                                <Table.Td>{doc.document_name || 'N/A'}</Table.Td>
                                                <Table.Td>{doc.document_number || 'N/A'}</Table.Td>
                                                <Table.Td>{doc.remarks || 'N/A'}</Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        color={doc.sharing_option === 'public' ? 'green' : 'red'}
                                                    >
                                                        {doc.sharing_option}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            ) : (
                                <Text c="dimmed" ta="center">No documents found</Text>
                            )}
                        </Card>
                    </Stack>
                </div>
            </div>
        </AppLayout>
    );
};

export default ShowVendor;