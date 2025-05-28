import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import AddNew from './Partial/AddNew';
import { useState, type ReactElement } from 'react';
import { Head, Link } from '@inertiajs/react';

interface EmployeeAddress {
    id: number;
    city: string;
    police_station: string;
    house_no: string;
    bye_lane: string;
    street: string;
    landmark: string;
    state: string;
    country: string;
    pin_code: string;
}

interface EmployeeQualification {
    id: number;
    degree: string;
    Qualification: 'HSLC' | 'M.A.' | 'B.A.' | 'intern';
    year_of_passing: string;
    institution: string;
    Board_University: string;
    completion_date: string;
    subject: string;
    medium: string;
    marks_percentage: string;
    specialization: string | null;
    grade: string;
    board: string | null;
}

interface OtherDetail {
    id: number;
    blood_group: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    emergency_contact_relation: string;
    hobbies: string | null;
    achievements: string | null;
}

interface EmploymentDetail {
    id: number;
    employee_id: string;
    joining_date: string;
    confirmation_date: string | null;
    employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
    employment_status: 'active' | 'on-leave' | 'terminated';
    notice_period: number;
    reporting_manager: string;
    department: string;
    designation: string;
    cost_center: string | null;
}

interface ServiceDetail {
    id: number;
    service_type: string;
    service_start_date: string;
    service_end_date: string | null;
    service_status: 'active' | 'completed' | 'terminated';
    service_location: string;
    service_description: string | null;
}

interface DocumentSubmitted {
    id: number;
    document_type: string;
    submission_date: string;
    document_number: string | null;
    document_path: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    remarks: string | null;
}

interface DocumentIssue {
    id: number;
    document_type: string;
    issue_date: string;
    expiry_date: string | null;
    issued_by: string;
    document_number: string;
    remarks: string | null;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
    marital_status: string;
    contact_no: string;
    email: string;
    address: EmployeeAddress | null;
    qualifications: EmployeeQualification[];
    other_details: OtherDetail[];
    employment_details: EmploymentDetail[];
    service_details: ServiceDetail[];
    documents_issued: DocumentIssue[];
    documents_submitted: DocumentSubmitted[];
    created_at: string | null;
    updated_at: string | null;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Props {
    employees: PaginatedData<Employee>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/hr/employees',
    },
];

const EmployeesList = (): ReactElement => {
    const [employees, setEmployees] = useState<PaginatedData<Employee> | null>(null);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Employees List</h2>
                        <AddNew />
                    </div>
                    {employees ?
                        <>
                            <div className="max-w-7xl min-h-64 overflow-x-auto">
                                <table className="min-w-full text-sm table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sl. No.</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employment</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qualifications</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {employees.data.length > 0 ? employees.data.map((employee, index) => (
                                            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.first_name} {employee.last_name}
                                                    <div className="text-xs text-gray-500">
                                                        {employee.date_of_birth} • {employee.nationality}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.contact_no}
                                                    {employee.address && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {employee.address.city}, {employee.address.state}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{employee.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.employment_details.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {employee.employment_details.map(detail => (
                                                                <div key={detail.id} className="text-xs">
                                                                    {detail.designation} ({detail.employment_type})
                                                                    <div className="text-gray-500">
                                                                        {detail.department} • {detail.employee_id}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No employment details</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.qualifications.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {employee.qualifications.map(qual => (
                                                                <div key={qual.id} className="text-xs">
                                                                    {qual.degree} ({qual.year_of_passing})
                                                                    {qual.specialization && (
                                                                        <div className="text-gray-500">{qual.specialization}</div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No qualifications</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-xs">
                                                            Issued: {employee.documents_issued.length}
                                                        </div>
                                                        <div className="text-xs">
                                                            Submitted: {employee.documents_submitted.length}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/hr/employees/${employee.id}/edit`}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={`/hr/employees/${employee.id}`}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                        >
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )):(
                                            <tr>
                                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                    No employees found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {employees.from} to {employees.to} of {employees.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {employees.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded ${link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            preserveScroll
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                        : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Failed to load employees data. Please try again later.
                            </div>
                        )}
                </div>
            </div>
        </AppLayout>
    );
};

export default EmployeesList;