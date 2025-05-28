import { useState } from 'react';
import { Button, TextInput, Textarea, Select } from '@mantine/core';

export interface DocumentIssue {
    employee_id?: number;
    document_type: string;
    document_number: string;
    document_path: string;
    issue_date: string;
    expiry_date: string | null;
    issuing_authority: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    remarks: string | null;
    created_at?: string;
    updated_at?: string;
}

interface DocumentIssuedProps {
    documents: DocumentIssue[];
    onDocumentsChange: (documents: DocumentIssue[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof DocumentIssue)[] = [
    'document_type',
    'document_number',
    'issue_date',
    'issuing_authority'
];

const DocumentIssued = ({ documents, onDocumentsChange }: DocumentIssuedProps) => {
    const [documentInfo, setDocumentInfo] = useState<DocumentIssue>({
        document_type: '',
        document_number: '',
        document_path: '',
        issue_date: '',
        expiry_date: '',
        issuing_authority: '',
        verification_status: 'pending',
        remarks: '',
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: DocumentIssue): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            if (typeof value === 'string') {
                return value.trim() !== '';
            }
            return value !== undefined && value !== null;
        });
    };

    const resetForm = () => {
        setDocumentInfo({
            document_type: '',
            document_number: '',
            document_path: '',
            issue_date: '',
            expiry_date: '',
            issuing_authority: '',
            verification_status: 'pending',
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
                <div className="grid grid-cols-4 gap-4">
                    <TextInput 
                        label="Document Type" 
                        value={documentInfo.document_type} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, document_type: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Document Number" 
                        value={documentInfo.document_number} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, document_number: e.target.value })}
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
                        label="Issuing Authority" 
                        value={documentInfo.issuing_authority} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, issuing_authority: e.target.value })}
                        required 
                    />
                    <Select
                        label="Verification Status"
                        value={documentInfo.verification_status}
                        onChange={(value) => setDocumentInfo({ ...documentInfo, verification_status: value as 'pending' | 'verified' | 'rejected' })}
                        data={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'verified', label: 'Verified' },
                            { value: 'rejected', label: 'Rejected' },
                        ]}
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
                                <th className="px-4 py-2">Document Number</th>
                                <th className="px-4 py-2">Issue Date</th>
                                <th className="px-4 py-2">Expiry Date</th>
                                <th className="px-4 py-2">Issuing Authority</th>
                                <th className="px-4 py-2">Verification Status</th>
                                <th className="px-4 py-2">Remarks</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{doc.document_type}</td>
                                    <td className="px-4 py-2">{doc.document_number}</td>
                                    <td className="px-4 py-2">{doc.issue_date}</td>
                                    <td className="px-4 py-2">{doc.expiry_date}</td>
                                    <td className="px-4 py-2">{doc.issuing_authority}</td>
                                    <td className="px-4 py-2">{doc.verification_status}</td>
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