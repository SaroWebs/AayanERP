import { useState } from 'react';
import { Button, TextInput, Select, FileInput } from '@mantine/core';

interface Document {
    document_type: string;
    document_name: string;
    document_number: string;
    remarks: string;
    sharing_option: 'public' | 'private';
    file: File | null;
}

interface DocumentDetailsProps {
    documents: Document[];
    onDocumentsChange: (documents: Document[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof Document)[] = ['document_type', 'document_name', 'document_number'];

const DOCUMENT_TYPES = [
    { value: 'pan', label: 'PAN Card' },
    { value: 'gst', label: 'GST Certificate' },
    { value: 'msme', label: 'MSME Certificate' },
    { value: 'other', label: 'Other' },
];

const SHARING_OPTIONS = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
];

const DocumentDetails = ({ documents, onDocumentsChange }: DocumentDetailsProps) => {
    const [documentInfo, setDocumentInfo] = useState<Document>({
        document_type: '',
        document_name: '',
        document_number: '',
        remarks: '',
        sharing_option: 'private',
        file: null,
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: Document): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            if (field === 'file') {
                return value !== null;
            }
            return typeof value === 'string' && value.trim() !== '';
        });
    };

    const resetForm = () => {
        setDocumentInfo({
            document_type: '',
            document_name: '',
            document_number: '',
            remarks: '',
            sharing_option: 'private',
            file: null,
        });
        setEditingIndex(null);
    };

    const handleSubmit = () => {
        if (!validateRequiredFields(documentInfo)) {
            return;
        }

        if (editingIndex !== null) {
            const updatedDocuments = [...documents];
            updatedDocuments[editingIndex] = documentInfo;
            onDocumentsChange(updatedDocuments);
        } else {
            onDocumentsChange([...documents, documentInfo]);
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setDocumentInfo(documents[index]);
    };

    const handleDelete = (index: number) => {
        const updatedDocuments = documents.filter((_, i) => i !== index);
        onDocumentsChange(updatedDocuments);
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {editingIndex !== null ? 'Edit Document' : 'Add New Document'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Document Type"
                        value={documentInfo.document_type}
                        onChange={(value) => setDocumentInfo({ ...documentInfo, document_type: value || '' })}
                        data={DOCUMENT_TYPES}
                        required
                    />
                    <TextInput 
                        label="Document Name" 
                        value={documentInfo.document_name} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, document_name: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Document Number" 
                        value={documentInfo.document_number} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, document_number: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Remarks" 
                        value={documentInfo.remarks} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, remarks: e.target.value })}
                    />
                    <Select
                        label="Sharing Option"
                        value={documentInfo.sharing_option}
                        onChange={(value) => setDocumentInfo({ ...documentInfo, sharing_option: value as 'public' | 'private' })}
                        data={SHARING_OPTIONS}
                    />
                    <FileInput
                        label="Upload Document"
                        value={documentInfo.file}
                        onChange={(file) => setDocumentInfo({ ...documentInfo, file })}
                        accept="application/pdf,image/*"
                    />
                </div>
                <Button 
                    className="mt-4" 
                    onClick={handleSubmit}
                    disabled={!validateRequiredFields(documentInfo)}
                >
                    {editingIndex !== null ? 'Update Document' : 'Add Document'}
                </Button>
            </div>

            {documents.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Number</th>
                                <th className="px-4 py-2">Remarks</th>
                                <th className="px-4 py-2">Sharing</th>
                                <th className="px-4 py-2">File</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{doc.document_type}</td>
                                    <td className="px-4 py-2">{doc.document_name}</td>
                                    <td className="px-4 py-2">{doc.document_number}</td>
                                    <td className="px-4 py-2">{doc.remarks}</td>
                                    <td className="px-4 py-2">{doc.sharing_option}</td>
                                    <td className="px-4 py-2">{doc.file?.name || 'No file'}</td>
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

export default DocumentDetails; 