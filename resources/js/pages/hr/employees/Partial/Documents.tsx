import { useState } from 'react';
import { Button, TextInput, Textarea, Select } from '@mantine/core';

export interface Documents {
    employee_id?: number;
    document_type: string;
    document_number: string | null;
    document_path: string;
    document_file?: File | null;
    issue_date: string;
    expiry_date: string | null;
    issuing_authority: string | null;
    verification_status: 'pending' | 'verified' | 'rejected';
    remarks: string | null;
}

interface DocumentSubmittedProps {
    documents: Documents[];
    onDocumentsChange: (documents: Documents[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof Documents)[] = ['document_type', 'document_file', 'issue_date'];

const Documents = ({ documents, onDocumentsChange }: DocumentSubmittedProps) => {
    const [documentInfo, setDocumentInfo] = useState<Documents>({
        document_type: '',
        document_number: '',
        document_path: '',
        document_file: null,
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        issuing_authority: '',
        verification_status: 'pending',
        remarks: '',
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: Documents): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            if (field === 'document_file') {
                return value !== null && value !== undefined;
            }
            return value !== undefined && value !== null && String(value).trim() !== '';
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is PDF or image
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                setDocumentInfo({ ...documentInfo, document_file: file });
            } else {
                // You might want to show an error notification here
                console.error('Please upload a PDF or image file');
            }
        }
    };

    const resetForm = () => {
        setDocumentInfo({
            document_type: '',
            document_number: '',
            document_path: '',
            document_file: null,
            issue_date: new Date().toISOString().split('T')[0],
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
                        {editingIndex !== null ? 'Edit Document' : 'Add New Document'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <Select
                        label="Document Type"
                        value={documentInfo.document_type}
                        onChange={(value) => setDocumentInfo({ ...documentInfo, document_type: value || '' })}
                        data={[
                            { value: 'passport', label: 'Passport' },
                            { value: 'pan_card', label: 'PAN Card' },
                            { value: 'gst_certificate', label: 'GST Certificate' },
                            { value: 'identity_proof', label: 'Identity Proof' },
                            { value: 'address_proof', label: 'Address Proof' },
                            { value: 'bank_documents', label: 'Bank Documents' },
                            { value: 'registration_documents', label: 'Registration Documents' },
                            { value: 'invoice', label: 'Invoice' },
                            { value: 'quotation', label: 'Quotation' },
                            { value: 'other', label: 'Other' }
                        ]}
                        required
                    />
                    <TextInput 
                        label="Document Number" 
                        value={documentInfo.document_number || ''} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, document_number: e.target.value })}
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
                        value={documentInfo.issuing_authority || ''} 
                        onChange={(e) => setDocumentInfo({ ...documentInfo, issuing_authority: e.target.value })}
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
                            {documentInfo.document_file && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Selected file: {documentInfo.document_file.name}
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

export default Documents; 