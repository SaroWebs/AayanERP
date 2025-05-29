import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { useEffect, useState, type ReactElement } from 'react';
import { Head, Link } from '@inertiajs/react';
import AddNew from './Add_New';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

interface ClientContact {
    id: number;
    contact_person: string;
    department: string;
    designation: string;
    phone: string;
    email: string;
    is_active: boolean;
}

interface ClientBankAccount {
    id: number;
    account_holder_name: string;
    bank_name: string;
    branch_address: string;
    account_number: string;
    ifsc: string;
}

interface ClientDocument {
    id: number;
    document_type: string;
    document_name: string;
    document_number: string | null;
    document_path: string;
    sharing_option: string;
    remarks: string | null;
}

interface Client {
    id: number;
    name: string;
    contact_no: string;
    email: string;
    gstin_no: string | null;
    pan_no: string | null;
    fax: string | null;
    state: string;
    company_type: string;
    turnover: number;
    range: string;
    address: string;
    correspondence_address: string;
    contacts: ClientContact[];
    bank_accounts: ClientBankAccount[];
    documents: ClientDocument[];
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
        title: 'Clients',
        href: '/clients',
    },
];

const ClientsList = (): ReactElement => {
    const [clients, setClients] = useState<PaginatedData<Client>>();


    const getData = () => {
        axios.get('/data/clients')
            .then(res => {
                setClients(res.data);
                notifications.show({
                    title: 'Clients loaded',
                    message: 'Clients data has been successfully loaded',
                    color: 'green',
                });
            })
            .catch(err => {
                console.log(err.response?.data.message);
                notifications.show({
                    title: 'Error loading clients',
                    message: `${err.response.data.message ? err.response.data.message :'Failed to load clients data'}`,
                    color: 'red',
                });
            });
    }

    useEffect(() => {
        getData();
    }, [])


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Clients List</h2>
                        <AddNew />
                    </div>

                    {(clients && clients.data) ? (
                        <>
                            <div className="max-w-7xl min-h-64 overflow-x-auto">
                                <table className="min-w-full text-sm table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sl. No.</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bank Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Persons</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {clients.data.length > 0 ? clients.data.map((client, index) => (
                                            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {client.name}
                                                    <div className="text-xs text-gray-500">
                                                        {client.company_type} • {client.state}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {client.contact_no}
                                                    {client.fax && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Fax: {client.fax}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{client.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {client.bank_accounts.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {client.bank_accounts.map(account => (
                                                                <div key={account.id} className="text-xs">
                                                                    {account.bank_name}
                                                                    <div className="text-gray-500">
                                                                        {account.account_number} • {account.ifsc}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No bank accounts</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {client.contacts.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            {client.contacts.map(contact => (
                                                                <div key={contact.id} className="text-xs">
                                                                    {contact.contact_person} ({contact.designation})
                                                                    <div className="text-gray-500">
                                                                        {contact.phone} • {contact.email}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No contacts</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-xs">
                                                            Total: {client.documents.length}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {client.documents.filter(doc => doc.sharing_option === 'public').length} public
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/clients/${client.id}/edit`}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={`/clients/${client.id}`}
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
                                                    No clients found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {clients.from} to {clients.to} of {clients.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {clients.links.map((link, index) => (
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
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Failed to load clients data. Please try again later.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default ClientsList;