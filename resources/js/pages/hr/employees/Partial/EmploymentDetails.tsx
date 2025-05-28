import { useState } from 'react';
import { Button, TextInput, Textarea, Select } from '@mantine/core';

export interface EmploymentDetail {
    designation: string;
    department: string;
    joining_date: string;
    employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    salary: string;
    reporting_to: string;
    work_location: string;
    employment_status: 'active' | 'on-leave' | 'terminated';
    notice_period: string | null;
    remarks: string | null;
}

interface EmploymentDetailsProps {
    employmentDetails: EmploymentDetail[];
    onEmploymentDetailsChange: (details: EmploymentDetail[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof EmploymentDetail)[] = [
    'designation',
    'department',
    'joining_date',
    'employment_type',
    'salary',
    'reporting_to',
    'work_location',
    'employment_status'
];

const EmploymentDetails = ({ employmentDetails, onEmploymentDetailsChange }: EmploymentDetailsProps) => {
    const [employmentInfo, setEmploymentInfo] = useState<EmploymentDetail>({
        designation: '',
        department: '',
        joining_date: '',
        employment_type: 'full-time',
        salary: '',
        reporting_to: '',
        work_location: '',
        employment_status: 'active',
        notice_period: '',
        remarks: '',
    });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const validateRequiredFields = (data: EmploymentDetail): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            return value !== undefined && value !== null && value.trim() !== '';
        });
    };

    const resetForm = () => {
        setEmploymentInfo({
            designation: '',
            department: '',
            joining_date: '',
            employment_type: 'full-time',
            salary: '',
            reporting_to: '',
            work_location: '',
            employment_status: 'active',
            notice_period: '',
            remarks: '',
        });
        setEditingIndex(null);
    };

    const handleSubmit = () => {
        if (!validateRequiredFields(employmentInfo)) {
            return;
        }

        if (editingIndex !== null) {
            const updatedDetails = [...employmentDetails];
            updatedDetails[editingIndex] = employmentInfo;
            onEmploymentDetailsChange(updatedDetails);
        } else {
            onEmploymentDetailsChange([...employmentDetails, employmentInfo]);
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEmploymentInfo(employmentDetails[index]);
    };

    const handleDelete = (index: number) => {
        const updatedDetails = employmentDetails.filter((_, i) => i !== index);
        onEmploymentDetailsChange(updatedDetails);
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {editingIndex !== null ? 'Edit Employment Details' : 'Add New Employment Details'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TextInput 
                        label="Designation" 
                        value={employmentInfo.designation} 
                        onChange={(e) => setEmploymentInfo({ ...employmentInfo, designation: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Department" 
                        value={employmentInfo.department} 
                        onChange={(e) => setEmploymentInfo({ ...employmentInfo, department: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Joining Date" 
                        type="date"
                        value={employmentInfo.joining_date} 
                        onChange={(e) => setEmploymentInfo({ ...employmentInfo, joining_date: e.target.value })}
                        required 
                    />
                    <Select
                        label="Employment Type"
                        value={employmentInfo.employment_type}
                        onChange={(value) => setEmploymentInfo({ ...employmentInfo, employment_type: value as 'full-time' | 'part-time' | 'contract' | 'internship' })}
                        data={[
                            { value: 'full-time', label: 'Full Time' },
                            { value: 'part-time', label: 'Part Time' },
                            { value: 'contract', label: 'Contract' },
                            { value: 'internship', label: 'Internship' },
                        ]}
                        required
                    />
                    <TextInput 
                        label="Salary" 
                        value={employmentInfo.salary} 
                        onChange={(e) => setEmploymentInfo({ ...employmentInfo, salary: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Reporting To" 
                        value={employmentInfo.reporting_to} 
                        onChange={(e) => setEmploymentInfo({ ...employmentInfo, reporting_to: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Work Location" 
                        value={employmentInfo.work_location} 
                        onChange={(e) => setEmploymentInfo({ ...employmentInfo, work_location: e.target.value })}
                        required 
                    />
                    <Select
                        label="Employment Status"
                        value={employmentInfo.employment_status}
                        onChange={(value) => setEmploymentInfo({ ...employmentInfo, employment_status: value as 'active' | 'on-leave' | 'terminated' })}
                        data={[
                            { value: 'active', label: 'Active' },
                            { value: 'on-leave', label: 'On Leave' },
                            { value: 'terminated', label: 'Terminated' },
                        ]}
                        required
                    />
                    <TextInput 
                        label="Notice Period" 
                        value={employmentInfo.notice_period || ''} 
                        onChange={(e) => setEmploymentInfo({ ...employmentInfo, notice_period: e.target.value })}
                    />
                    <div className="col-span-2">
                        <Textarea 
                            label="Remarks" 
                            value={employmentInfo.remarks || ''} 
                            onChange={(e) => setEmploymentInfo({ ...employmentInfo, remarks: e.target.value })}
                            minRows={2}
                        />
                    </div>
                </div>
                <Button 
                    className="mt-4" 
                    onClick={handleSubmit}
                    disabled={!validateRequiredFields(employmentInfo)}
                >
                    {editingIndex !== null ? 'Update Details' : 'Add Details'}
                </Button>
            </div>

            {employmentDetails.length > 0 && (
                <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2">Department</th>
                                <th className="px-4 py-2">Joining Date</th>
                                <th className="px-4 py-2">Employment Type</th>
                                <th className="px-4 py-2">Salary</th>
                                <th className="px-4 py-2">Reporting To</th>
                                <th className="px-4 py-2">Work Location</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employmentDetails.map((detail, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{detail.designation}</td>
                                    <td className="px-4 py-2">{detail.department}</td>
                                    <td className="px-4 py-2">{detail.joining_date}</td>
                                    <td className="px-4 py-2">{detail.employment_type}</td>
                                    <td className="px-4 py-2">{detail.salary}</td>
                                    <td className="px-4 py-2">{detail.reporting_to}</td>
                                    <td className="px-4 py-2">{detail.work_location}</td>
                                    <td className="px-4 py-2">{detail.employment_status}</td>
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

export default EmploymentDetails; 