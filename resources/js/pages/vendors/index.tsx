import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import AddNew from './AddNew';

interface VendorBankAccount {
    id: number;
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc: string;
    branch_address: string | null;
}

interface VendorContactDetail {
    id: number;
    contact_person: string;
    department: string | null;
    designation: string | null;
    phone: string | null;
    email: string | null;
}

interface VendorDocument {
    id: number;
    document_type: string;
    document_name: string | null;
    document_number: string | null;
    remarks: string | null;
    sharing_option: 'public' | 'private';
    document_path: string | null;
}

interface Vendor {
    id: number;
    name: string;
    contact_no: string;
    email: string;
    gstin: string;
    pan_no: string;
    fax: string;
    state: string;
    address: string;
    created_at: string | null;
    updated_at: string | null;
    bank_accounts: VendorBankAccount[];
    contact_details: VendorContactDetail[];
    documents: VendorDocument[];
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
    vendors: PaginatedData<Vendor>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vendors',
        href: '/vendors',
    },
];

const VendorsList = (props: Props) => {
    const { vendors } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Vendors List</h2>
                        <AddNew />
                    </div>
                    <div className="max-w-5xl overflow-x-auto">
                        <table className="min-w-full text-sm table-auto divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sl. No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GSTIN</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">State</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bank Accounts</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Persons</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {vendors.data.map((vendor, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.contact_no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.gstin}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{vendor.state}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {vendor.bank_accounts.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {vendor.bank_accounts.map(account => (
                                                        <div key={account.id} className="text-xs">
                                                            {account.bank_name} - {account.account_number}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No accounts</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {vendor.contact_details.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {vendor.contact_details.map(contact => (
                                                        <div key={contact.id} className="text-xs">
                                                            {contact.contact_person} {contact.designation ? `(${contact.designation})` : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No contacts</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {vendor.documents.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {vendor.documents.map(doc => (
                                                        <div key={doc.id} className="text-xs">
                                                            {doc.document_type} {doc.document_number ? `- ${doc.document_number}` : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No documents</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/vendors/${vendor.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/vendors/${vendor.id}`}
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {vendors.from} to {vendors.to} of {vendors.total} results
                        </div>
                        <div className="flex space-x-2">
                            {vendors.links.map((link, index) => (
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
                </div>

            </div>
        </AppLayout>
    )
}

export default VendorsList