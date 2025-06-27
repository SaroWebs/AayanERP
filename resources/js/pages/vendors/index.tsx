import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AddNew from './AddNew';
import EditVendor from './EditVendor';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { LoadingOverlay } from '@mantine/core';
import { Vendor } from './types';

interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vendors',
        href: '/vendors',
    },
];

const VendorsList = () => {
    const [vendors, setVendors] = useState<PaginatedData<Vendor>>();
    const [loading, setLoading] = useState(true);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

    const loadVendor = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/data/vendors');
            setVendors(response.data);
            console.log('Vendors loaded:', response.data);
            console.log('Total vendors:', response.data.total);
            notifications.show({
                title: 'Vendors loaded',
                message: 'Vendors data has been successfully loaded',
                color: 'green',
            });
        } catch (error) {
            console.error('Failed to load vendors:', error);
            notifications.show({
                title: 'Error loading vendors',
                message: 'Failed to load vendors data',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVendor();
    }, []);

    // Debug effect to log when vendors changes
    useEffect(() => {
        if (vendors) {
            console.log('Vendors state updated:', vendors.total);
        }
    }, [vendors]);

    const handleVendorUpdate = (updatedVendor: Vendor) => {
        if (updatedVendor) {
            console.log(updatedVendor);
            loadVendor();
        }
    };

    // Calculate total for AddNew component
    const totalVendors = vendors?.total || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="p-6 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Vendors List</h2>
                        <AddNew loadVendor={loadVendor} total={totalVendors} />
                    </div>
                    <div className="relative">
                        <LoadingOverlay
                            visible={loading}
                            overlayProps={{ radius: 'sm', blur: 2 }}
                            loaderProps={{ color: 'pink', type: 'bars' }}
                        />
                        {vendors ?
                            <>
                                <div className="overflow-x-scroll">
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
                                            {vendors.data.length > 0 ? vendors.data.map((vendor, index) => (
                                                <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                                                                        {contact.name} {contact.designation ? `(${contact.designation})` : ''}
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
                                                            <button
                                                                onClick={() => setEditingVendor(vendor)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Edit
                                                            </button>
                                                            <a
                                                                href={`/master/vendors/${vendor.id}`}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            >
                                                                View
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                        No vendors found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing {vendors.from} to {vendors.to} of {vendors.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {vendors.links.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded ${link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </>
                            : <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Failed to load vendors data. Please try again later.
                            </div>}
                    </div>
                </div>
            </div>

            {editingVendor && (
                <EditVendor
                    vendor={editingVendor}
                    onClose={() => setEditingVendor(null)}
                    onUpdate={handleVendorUpdate}
                />
            )}
        </AppLayout>
    )
}

export default VendorsList