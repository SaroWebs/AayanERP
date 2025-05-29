import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import AddNew from './Partial/AddNew';
import { useEffect, useState, type ReactElement } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { LoadingOverlay } from '@mantine/core';
import { Employee, PaginatedData } from './types';
import EditEmployee from './EditEmployee';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/hr/employees',
    },
];

const EmployeesList = (): ReactElement => {
    const [employees, setEmployees] = useState<PaginatedData<Employee> | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/data/employees');
            setEmployees(response.data);
            notifications.show({
                title: 'Success',
                message: 'Employees data loaded successfully',
                color: 'green',
            });
        } catch (err) {
            console.error('Failed to load employees:', err);
            notifications.show({
                title: 'Error loading employees',
                message: 'Failed to load employees data',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDetails();
    }, []);

    const handleEmployeeUpdate = (updatedEmployee: Employee) => {
        if (updatedEmployee) {
            loadDetails();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="p-6 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Employees List</h2>
                        <AddNew />
                    </div>
                    <div className="relative">
                        <LoadingOverlay
                            visible={loading}
                            overlayProps={{ radius: 'sm', blur: 2 }}
                            loaderProps={{ color: 'pink', type: 'bars' }}
                        />
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                            {employees.data.length > 0 ? employees.data.map((employee, index) => (
                                                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {employee.joining_details?.[0]?.employee_id || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {employee.first_name} {employee.last_name || ''}
                                                        <div className="text-xs text-gray-500">
                                                            {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'} • {employee.country || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {employee.contact_no || 'N/A'}
                                                        <div className="text-xs text-gray-500">
                                                            {employee.email || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {employee.joining_details?.[0]?.department || 'N/A'}
                                                        <div className="text-xs text-gray-500">
                                                            {employee.joining_details?.[0]?.designation || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {employee.joining_details?.[0]?.employment_status ? (
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${employee.joining_details[0].employment_status === 'active' ? 'bg-green-100 text-green-800' : 
                                                                employee.joining_details[0].employment_status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' : 
                                                                'bg-red-100 text-red-800'}`}>
                                                                {employee.joining_details[0].employment_status}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {employee.documents?.length > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                {employee.documents.map(doc => (
                                                                    <div key={doc.id} className="text-xs">
                                                                        {doc.document_type || 'Unnamed Document'} 
                                                                        {doc.document_number ? ` - ${doc.document_number}` : ''}
                                                                        {doc.verification_status && (
                                                                            <span className={`ml-1 px-1 rounded text-[10px] ${
                                                                                doc.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                                                                                doc.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-red-100 text-red-800'
                                                                            }`}>
                                                                                {doc.verification_status}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">No documents</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => setEditingEmployee(employee)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Edit
                                                            </button>
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
            </div>

            {editingEmployee && (
                <EditEmployee
                    employee={editingEmployee}
                    onClose={() => setEditingEmployee(null)}
                    onUpdate={handleEmployeeUpdate}
                />
            )}
        </AppLayout>
    );
};

export default EmployeesList;