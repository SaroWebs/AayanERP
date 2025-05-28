import { useState } from 'react';
import { Button, TextInput, Textarea, Select } from '@mantine/core';

export interface ServiceDetail {
    employee_id?: number;
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
    created_at?: string;
    updated_at?: string;
}

interface ServiceDetailProps {
    serviceDetails: ServiceDetail[];
    onServiceDetailsChange: (details: ServiceDetail[]) => void;
}

// Define required fields
const REQUIRED_FIELDS: (keyof ServiceDetail)[] = [
    'designation',
    'department',
    'joining_date',
    'employment_type',
    'salary',
    'reporting_to',
    'work_location',
    'employment_status'
];

const ServiceDetail = ({ serviceDetails, onServiceDetailsChange }: ServiceDetailProps) => {
    const [serviceInfo, setServiceInfo] = useState<ServiceDetail>({
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

    const validateRequiredFields = (data: ServiceDetail): boolean => {
        return REQUIRED_FIELDS.every(field => {
            const value = data[field];
            if (typeof value === 'string') {
                return value.trim() !== '';
            }
            return value !== undefined && value !== null;
        });
    };

    const resetForm = () => {
        setServiceInfo({
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
        if (!validateRequiredFields(serviceInfo)) {
            return;
        }

        if (editingIndex !== null) {
            const updatedDetails = [...serviceDetails];
            updatedDetails[editingIndex] = serviceInfo;
            onServiceDetailsChange(updatedDetails);
        } else {
            onServiceDetailsChange([...serviceDetails, serviceInfo]);
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setServiceInfo(serviceDetails[index]);
    };

    const handleDelete = (index: number) => {
        const updatedDetails = serviceDetails.filter((_, i) => i !== index);
        onServiceDetailsChange(updatedDetails);
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                        {editingIndex !== null ? 'Edit Service Details' : 'Add New Service Details'}
                    </h3>
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <TextInput 
                        label="Designation" 
                        value={serviceInfo.designation} 
                        onChange={(e) => setServiceInfo({ ...serviceInfo, designation: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Department" 
                        value={serviceInfo.department} 
                        onChange={(e) => setServiceInfo({ ...serviceInfo, department: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Joining Date" 
                        type="date"
                        value={serviceInfo.joining_date} 
                        onChange={(e) => setServiceInfo({ ...serviceInfo, joining_date: e.target.value })}
                        required 
                    />
                    <Select
                        label="Employment Type"
                        value={serviceInfo.employment_type}
                        onChange={(value) => setServiceInfo({ ...serviceInfo, employment_type: value as 'full-time' | 'part-time' | 'contract' | 'internship' })}
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
                        value={serviceInfo.salary} 
                        onChange={(e) => setServiceInfo({ ...serviceInfo, salary: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Reporting To" 
                        value={serviceInfo.reporting_to} 
                        onChange={(e) => setServiceInfo({ ...serviceInfo, reporting_to: e.target.value })}
                        required 
                    />
                    <TextInput 
                        label="Work Location" 
                        value={serviceInfo.work_location} 
                        onChange={(e) => setServiceInfo({ ...serviceInfo, work_location: e.target.value })}
                        required 
                    />
                    <Select
                        label="Employment Status"
                        value={serviceInfo.employment_status}
                        onChange={(value) => setServiceInfo({ ...serviceInfo, employment_status: value as 'active' | 'on-leave' | 'terminated' })}
                        data={[
                            { value: 'active', label: 'Active' },
                            { value: 'on-leave', label: 'On Leave' },
                            { value: 'terminated', label: 'Terminated' },
                        ]}
                        required
                    />
                    <TextInput 
                        label="Notice Period" 
                        value={serviceInfo.notice_period || ''} 
                        onChange={(e) => setServiceInfo({ ...serviceInfo, notice_period: e.target.value })}
                    />
                    <div className="col-span-2">
                        <Textarea 
                            label="Remarks" 
                            value={serviceInfo.remarks || ''} 
                            onChange={(e) => setServiceInfo({ ...serviceInfo, remarks: e.target.value })}
                            minRows={2}
                        />
                    </div>
                </div>
                <Button 
                    className="mt-4" 
                    onClick={handleSubmit}
                    disabled={!validateRequiredFields(serviceInfo)}
                >
                    {editingIndex !== null ? 'Update Details' : 'Add Details'}
                </Button>
            </div>

            {serviceDetails.length > 0 && (
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
                            {serviceDetails.map((detail, index) => (
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

export default ServiceDetail; 