import React, { useState } from 'react';
import { TextInput, Button, Group, Stack, Paper, Title, Table, ActionIcon, Select, FileInput } from '@mantine/core';
import { Edit, Trash2 } from 'lucide-react';
import { Document } from '../types';

interface DocumentDetailsProps {
    documents: Document[];
    onDocumentsChange: (documents: Document[]) => void;
}

const DocumentDetails = ({ documents, onDocumentsChange }: DocumentDetailsProps) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [documentInfo, setDocumentInfo] = useState<Document>({
        document_type: '',
        document_name: '',
        document_number: '',
        remarks: '',
        sharing_option: 'private',
        document_path: undefined,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIndex !== null) {
            const updatedDocuments = [...documents];
            updatedDocuments[editingIndex] = documentInfo;
            onDocumentsChange(updatedDocuments);
            setEditingIndex(null);
        } else {
            onDocumentsChange([...documents, documentInfo]);
        }
        setDocumentInfo({
            document_type: '',
            document_name: '',
            document_number: '',
            remarks: '',
            sharing_option: 'private',
            document_path: undefined,
        });
    };

    const editDocument = (index: number) => {
        setDocumentInfo(documents[index]);
        setEditingIndex(index);
    };

    const deleteDocument = (index: number) => {
        const updatedDocuments = documents.filter((_, i) => i !== index);
        onDocumentsChange(updatedDocuments);
    };

    return (
        <Paper shadow="xs" p="md">
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Title order={3}>Document Details</Title>

                    <Stack>
                        <Select
                            label="Document Type"
                            placeholder="Select document type"
                            data={[
                                { value: 'id_proof', label: 'ID Proof' },
                                { value: 'address_proof', label: 'Address Proof' },
                                { value: 'business_proof', label: 'Business Proof' },
                                { value: 'other', label: 'Other' },
                            ]}
                            value={documentInfo.document_type}
                            onChange={(value) => setDocumentInfo({ ...documentInfo, document_type: value || '' })}
                            required
                        />

                        <TextInput
                            label="Document Name"
                            placeholder="Enter document name"
                            value={documentInfo.document_name}
                            onChange={(e) => setDocumentInfo({ ...documentInfo, document_name: e.target.value })}
                            required
                        />

                        <TextInput
                            label="Document Number"
                            placeholder="Enter document number"
                            value={documentInfo.document_number}
                            onChange={(e) => setDocumentInfo({ ...documentInfo, document_number: e.target.value })}
                        />

                        <TextInput
                            label="Remarks"
                            placeholder="Enter remarks"
                            value={documentInfo.remarks}
                            onChange={(e) => setDocumentInfo({ ...documentInfo, remarks: e.target.value })}
                        />

                        <Select
                            label="Sharing Option"
                            placeholder="Select sharing option"
                            data={[
                                { value: 'private', label: 'Private' },
                                { value: 'public', label: 'Public' },
                            ]}
                            value={documentInfo.sharing_option}
                            onChange={(value) => setDocumentInfo({ ...documentInfo, sharing_option: (value as 'private' | 'public') || 'private' })}
                            required
                        />

                        <FileInput
                            label="Document File"
                            placeholder="Upload document"
                            accept="application/pdf,image/*"
                            value={documentInfo.document_path as File | null}
                            onChange={(file) => setDocumentInfo({ ...documentInfo, document_path: file || undefined })}
                            required
                        />

                        <Group>
                            <Button type="submit">
                                {editingIndex !== null ? 'Update Document' : 'Add Document'}
                            </Button>
                            {editingIndex !== null && (
                                <Button variant="outline" onClick={() => {
                                    setEditingIndex(null);
                                    setDocumentInfo({
                                        document_type: '',
                                        document_name: '',
                                        document_number: '',
                                        remarks: '',
                                        sharing_option: 'private',
                                        document_path: undefined,
                                    });
                                }}>
                                    Cancel
                                </Button>
                            )}
                        </Group>
                    </Stack>

                    {documents.length > 0 && (
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Document Type</Table.Th>
                                    <Table.Th>Document Name</Table.Th>
                                    <Table.Th>Document Number</Table.Th>
                                    <Table.Th>Remarks</Table.Th>
                                    <Table.Th>Sharing Option</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {documents.map((document, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>{document.document_type}</Table.Td>
                                        <Table.Td>{document.document_name}</Table.Td>
                                        <Table.Td>{document.document_number}</Table.Td>
                                        <Table.Td>{document.remarks}</Table.Td>
                                        <Table.Td>{document.sharing_option}</Table.Td>
                                        <Table.Td>
                                            <Group>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="blue"
                                                    onClick={() => editDocument(index)}
                                                >
                                                    <Edit size={16} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={() => deleteDocument(index)}
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

export default DocumentDetails;