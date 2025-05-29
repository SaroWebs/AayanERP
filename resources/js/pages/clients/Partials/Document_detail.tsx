import { useState } from 'react';
import { Button, TextInput, Textarea, Select } from '@mantine/core';

export interface ClientDocument {
    id: number;
    document_type: string;
    document_name: string;
    document_number: string | null;
    document_path: string;
    sharing_option: string;
    remarks: string | null;
}

interface DocumentDetailProps {
    documents: ClientDocument[];
    onDocumentsChange: (documents: ClientDocument[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof ClientDocument)[] = ['document_type', 'document_name', 'sharing_option'];

const DocumentDetail = ({ documents, onDocumentsChange }: DocumentDetailProps) => {
    const [documentInfo, setDocumentInfo] = useState<ClientDocument>({
        id: 0,
        document_type: '',
        document_name: '',
        document_number: null,
        document_path: '',
        sharing_option: 'private',
        remarks: null,
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: ClientDocument): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            return value !== undefined && value !== null && String(value).trim() !== '';
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is PDF or image
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                // Here you would typically handle the file upload and get the document_path
                // For now, we'll just set a placeholder
                setDocumentInfo({ 
                    ...documentInfo, 
                    document_path: URL.createObjectURL(file)
                });
            } else {
                console.error('Please upload a PDF or image file');
            }
        }
    };

    const resetForm = () => {
        setDocumentInfo({
            id: 0,
            document_type: '',
            document_name: '',
            document_number: null,
            document_path: '',
            sharing_option: 'private',
            remarks: null,
        });
        setEditingIndex(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
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
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput 
                            label="Document Type" 
                            value={documentInfo.document_type} 
                            onChange={(e) => setDocumentInfo({ ...documentInfo, document_type: e.target.value })}
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
                            value={documentInfo.document_number || ''} 
                            onChange={(e) => setDocumentInfo({ ...documentInfo, document_number: e.target.value })}
                        />
                        <Select
                            label="Sharing Option"
                            value={documentInfo.sharing_option}
                            onChange={(value) => setDocumentInfo({ ...documentInfo, sharing_option: value || 'private' })}
                            data={[
                                { value: 'private', label: 'Private' },
                                { value: 'public', label: 'Public' },
                            ]}
                            required
                        />
                        <div className="col-span-2">
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Document File (PDF or Image)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        dark:file:bg-blue-900 dark:file:text-blue-300"
                                />
                                {documentInfo.document_path && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Document uploaded
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <Textarea 
                                label="Remarks" 
                                value={documentInfo.remarks || ''} 
                                onChange={(e) => setDocumentInfo({ ...documentInfo, remarks: e.target.value })}
                                minRows={2}
                            />
                        </div>
                    </div>
                    <Button 
                        type="submit"
                        className="mt-4" 
                        disabled={!validateRequiredFields(documentInfo)}
                    >
                        {editingIndex !== null ? 'Update Document' : 'Add Document'}
                    </Button>
                </form>
            </div>

            {documents.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Document Type</th>
                                <th className="px-4 py-2">Document Name</th>
                                <th className="px-4 py-2">Document Number</th>
                                <th className="px-4 py-2">Sharing Option</th>
                                <th className="px-4 py-2">Remarks</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{doc.document_type}</td>
                                    <td className="px-4 py-2">{doc.document_name}</td>
                                    <td className="px-4 py-2">{doc.document_number}</td>
                                    <td className="px-4 py-2">{doc.sharing_option}</td>
                                    <td className="px-4 py-2">{doc.remarks}</td>
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

export default DocumentDetail; 