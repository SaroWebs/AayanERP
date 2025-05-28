import { useState } from 'react';
import { Button, TextInput, Textarea } from '@mantine/core';

export interface DocumentIssue {
    document_type: string;
    issue_date: string;
    expiry_date: string | null;
    issued_by: string;
    document_number: string;
    remarks: string | null;
}

interface DocumentIssuedProps {
    documents: DocumentIssue[];
    onDocumentsChange: (documents: DocumentIssue[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof DocumentIssue)[] = ['document_type', 'issue_date', 'issued_by', 'document_number'];

const DocumentIssued = ({ documents, onDocumentsChange }: DocumentIssuedProps) => {
    const [documentInfo, setDocumentInfo] = useState<DocumentIssue>({
        document_type: '',
        issue_date: '',
        expiry_date: '',
        issued_by: '',
        document_number: '',
        remarks: '',
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: DocumentIssue): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            return value !== undefined && value !== null && value.trim() !== '';
        });
    };

    const resetForm = () => {
        setDocumentInfo({
            document_type: '',
            issue_date: '',
            expiry_date: '',
            issued_by: '',
            document_number: '',
            remarks: '',
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
                        {editingIndex !== null ? 'Edit Issued Document' : 'Add New Issued Document'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TextInput 
                        label="Document Type" 
                        value={documentInfo.document_type} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, document_type: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Issue Date" 
                        type="date"
                        value={documentInfo.issue_date} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, issue_date: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Expiry Date" 
                        type="date"
                        value={documentInfo.expiry_date || ''} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, expiry_date: e.target.value })}
                    />
                    <TextInput 
                        label="Issued By" 
                        value={documentInfo.issued_by} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, issued_by: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Document Number" 
                        value={documentInfo.document_number} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, document_number: e.target.value })}
                        required 
                    />
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
                                <th className="px-4 py-2">Document Type</th>
                                <th className="px-4 py-2">Issue Date</th>
                                <th className="px-4 py-2">Expiry Date</th>
                                <th className="px-4 py-2">Issued By</th>
                                <th className="px-4 py-2">Document Number</th>
                                <th className="px-4 py-2">Remarks</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{doc.document_type}</td>
                                    <td className="px-4 py-2">{doc.issue_date}</td>
                                    <td className="px-4 py-2">{doc.expiry_date}</td>
                                    <td className="px-4 py-2">{doc.issued_by}</td>
                                    <td className="px-4 py-2">{doc.document_number}</td>
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

export default DocumentIssued; 