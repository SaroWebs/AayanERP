import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import AddNew from './Partial/AddNew';
import { useEffect, useState, type ReactElement } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

interface EmployeeAddress {
    id: number;
    employee_id: number;
    type: 'permanent' | 'residential' | 'work';
    care_of: string | null;
    house_number: string | null;
    street: string | null;
    landmark: string | null;
    police_station: string | null;
    post_office: string | null;
    city: string | null;
    state: string | null;
    pin_code: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    is_verified: boolean;
}

interface EmployeeQualification {
    id: number;
    employee_id: number;
    qualification_type: string;
    institution: string;
    board_university: string;
    year_of_passing: string;
    marks_percentage: string;
    grade: string;
    specialization: string | null;
    medium: string;
    subject: string;
}

interface EmployeeDocument {
    id: number;
    employee_id: number;
    document_type: string;
    document_number: string | null;
    document_path: string;
    issue_date: string | null;
    expiry_date: string | null;
    verification_status: 'pending' | 'verified' | 'rejected';
    remarks: string | null;
}

interface EmployeeServiceDetail {
    id: number;
    employee_id: number;
    service_type: string;
    service_start_date: string;
    service_end_date: string | null;
    service_status: 'active' | 'completed' | 'terminated';
    service_location: string;
    service_description: string | null;
}

interface EmployeeJoiningDetail {
    id: number;
    employee_id: number;
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

interface EmployeeChild {
    id: number;
    employee_id: number;
    name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
}

interface EmployeeSpouse {
    id: number;
    employee_id: number;
    name: string;
    date_of_birth: string;
    occupation: string | null;
    contact_number: string | null;
}

interface EmployeeNominee {
    id: number;
    employee_id: number;
    name: string;
    relationship: string;
    contact_number: string;
    address: string;
}

interface EmployeeReference {
    id: number;
    employee_id: number;
    name: string;
    designation: string;
    organization: string;
    contact_number: string;
    email: string | null;
    relationship: string;
}

interface EmployeeKnownLanguage {
    id: number;
    employee_id: number;
    language: string;
    proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
}

interface EmployeeSpecialTraining {
    id: number;
    employee_id: number;
    training_name: string;
    institution: string;
    duration: string;
    completion_date: string;
}

interface EmployeeCurricularActivity {
    id: number;
    employee_id: number;
    activity_name: string;
    role: string;
    achievement: string | null;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string | null;
    pf_no: string | null;
    date_of_birth: string | null;
    gender: 'male' | 'female' | 'other';
    blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
    pan_no: string | null;
    aadhar_no: string | null;
    guardian_name: string | null;
    contact_no: string | null;
    email: string | null;
    country: string | null;
    addresses: EmployeeAddress[];
    educational_qualifications: EmployeeQualification[];
    professional_qualifications: EmployeeQualification[];
    documents: EmployeeDocument[];
    service_details: EmployeeServiceDetail[];
    joining_details: EmployeeJoiningDetail[];
    children: EmployeeChild[];
    spouses: EmployeeSpouse[];
    nominees: EmployeeNominee[];
    references: EmployeeReference[];
    known_languages: EmployeeKnownLanguage[];
    special_trainings: EmployeeSpecialTraining[];
    curricular_activities: EmployeeCurricularActivity[];
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/hr/employees',
    },
];

const EmployeesList = (): ReactElement => {
    const [employees, setEmployees] = useState<PaginatedData<Employee> | null>(null);


    const loadDetails = () => {
        axios.get('/data/employees')
            .then(res => {
                setEmployees(res.data);
                notifications.show({
                    title: 'Success',
                    message: 'Employees data loaded successfully',
                    color: 'green',
                });
            })
            .catch(err => {
                console.log(err);
                notifications.show({
                    title: 'Error loading employees',
                    message: 'Failed to load employees data',
                    color: 'red',
                });
            });
    }

    useEffect(() => {
        loadDetails();
    }, []);
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {employees.data.length > 0 ? employees.data.map((employee, index) => (
                                            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.joining_details[0]?.employee_id || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.first_name} {employee.last_name}
                                                    <div className="text-xs text-gray-500">
                                                        {employee.date_of_birth} • {employee.country}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.contact_no}
                                                    <div className="text-xs text-gray-500">
                                                        {employee.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.joining_details[0]?.department || 'N/A'}
                                                    <div className="text-xs text-gray-500">
                                                        {employee.joining_details[0]?.designation || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {employee.joining_details[0]?.employment_status ? (
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${employee.joining_details[0].employment_status === 'active' ? 'bg-green-100 text-green-800' : 
                                                            employee.joining_details[0].employment_status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' : 
                                                            'bg-red-100 text-red-800'}`}>
                                                            {employee.joining_details[0].employment_status}
                                                        </span>
                                                    ) : 'N/A'}
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
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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