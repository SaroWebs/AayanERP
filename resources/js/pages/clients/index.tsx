import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { useEffect, useState, type ReactElement } from 'react';
import { Head } from '@inertiajs/react';
import AddNew from './AddNew';
import ViewClient from './ViewClient';
import EditClient from './EditClient';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { TextInput, Select, Button, Group, Badge, Menu, ActionIcon, Text, Paper } from '@mantine/core';
import { Search, Filter, MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import { useDebouncedValue } from '@mantine/hooks';

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
    document_number: string | undefined;
    document_path: string;
    sharing_option: 'public' | 'private';
    remarks: string | undefined;
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
    contact_details: ClientContact[];
    bank_accounts: ClientBankAccount[];
    documents: ClientDocument[];
    created_at: string | null;
    updated_at: string | null;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: '/clients',
    },
];

const ClientsList = (): ReactElement => {
    const [clients, setClients] = useState<PaginatedData<Client>>();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [filters, setFilters] = useState({
        company_type: '',
        range: '',
        state: '',
    });

    // Modal states
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [viewModalOpened, setViewModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);

    const getData = async (params: Record<string, string> = {}) => {
        try {
            setLoading(true);
            const response = await axios.get('/data/clients', { params });
            setClients(response.data);
        } catch (error: any) {
            notifications.show({
                title: 'Error loading clients',
                message: error.response?.data?.message || 'Failed to load clients data',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params: Record<string, string> = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.company_type) params.company_type = filters.company_type;
        if (filters.range) params.range = filters.range;
        if (filters.state) params.state = filters.state;
        getData(params);
    }, [debouncedSearch, filters]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this client?')) return;
        
        try {
            await axios.delete(`/data/clients/${id}`);
            notifications.show({
                title: 'Success',
                message: 'Client deleted successfully',
                color: 'green',
            });
            getData();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete client',
                color: 'red',
            });
        }
    };

    const handleView = (client: Client) => {
        // Transform null values to undefined to match Document type
        const transformedClient = {
            ...client,
            documents: client.documents.map(doc => ({
                ...doc,
                document_number: doc.document_number ?? undefined,
                remarks: doc.remarks ?? undefined
            }))
        };
        setSelectedClient(transformedClient);
        setViewModalOpened(true);
    };

    const handleEdit = (client: Client) => {
        setSelectedClient(client);
        setEditModalOpened(true);
    };

    const handleClientUpdate = (updatedClient: Client) => {
        if (clients) {
            const updatedClients = {
                ...clients,
                data: clients.data.map(client => 
                    client.id === updatedClient.id ? updatedClient : client
                )
            };
            setClients(updatedClients);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="p-4 bg-white dark:text-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Clients List</h2>
                        <AddNew />
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[180px]">
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'rgb(107 114 128)', // text-gray-500
                                        pointerEvents: 'none',
                                        zIndex: 2,
                                    }}
                                >
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full py-1 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xs border border-gray-300 dark:border-gray-700 px-10 focus:outline-none transition"
                                />
                            </div>
                            <select
                                value={filters.company_type}
                                onChange={e => setFilters(prev => ({ ...prev, company_type: e.target.value }))}
                                className="rounded-xs py-1 px-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 min-w-[130px]"
                            >
                                <option value="">Company Type</option>
                                <option value="regional">Regional</option>
                                <option value="national">National</option>
                                <option value="government">Government</option>
                            </select>
                            <select
                                value={filters.range}
                                onChange={e => setFilters(prev => ({ ...prev, range: e.target.value }))}
                                className="rounded-xs py-1 px-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 min-w-[110px]"
                            >
                                <option value="">Range</option>
                                <option value="state">State</option>
                                <option value="central">Central</option>
                                <option value="NA">Not Applicable</option>
                            </select>
                            <Button
                                variant="light"
                                leftSection={<Filter size={16} />}
                                onClick={() => setFilters({ company_type: '', range: '', state: '' })}
                                className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                style={{ height: '32px' }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-900 dark:text-gray-100">Loading...</div>
                    ) : clients?.data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No clients found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bank Accounts</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Persons</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {clients?.data.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <Text fw={500} className="text-gray-900 dark:text-gray-100">{client.name}</Text>
                                                    <Group gap="xs">
                                                        <Badge size="sm" variant="light" className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                                            {client.company_type}
                                                        </Badge>
                                                        <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                            {client.state}
                                                        </Text>
                                                    </Group>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <Text className="text-gray-900 dark:text-gray-100">{client.contact_no}</Text>
                                                    {client.fax && (
                                                        <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                            Fax: {client.fax}
                                                        </Text>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <Text className="text-gray-900 dark:text-gray-100">{client.email}</Text>
                                                    {client.gstin_no && (
                                                        <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                            GSTIN: {client.gstin_no}
                                                        </Text>
                                                    )}
                                                    {client.pan_no && (
                                                        <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                            PAN: {client.pan_no}
                                                        </Text>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {client.bank_accounts.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {client.bank_accounts.map(account => (
                                                            <div key={account.id} className="text-xs">
                                                                <Text fw={500} className="text-gray-900 dark:text-gray-100">{account.bank_name}</Text>
                                                                <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                                    {account.account_number} • {account.ifsc}
                                                                </Text>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">No bank accounts</Text>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {client?.contact_details?.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {client.contact_details.map(contact => (
                                                            <div key={contact.id} className="text-xs">
                                                                <Text fw={500} className="text-gray-900 dark:text-gray-100">{contact.contact_person}</Text>
                                                                <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                                    {contact.designation}
                                                                </Text>
                                                                <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                                    {contact.phone} • {contact.email}
                                                                </Text>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">No contacts</Text>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <Text size="xs" className="text-gray-900 dark:text-gray-100">
                                                        Total: {client.documents.length}
                                                    </Text>
                                                    <Text size="xs" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                                        {client.documents.filter(doc => doc.sharing_option === 'public').length} public
                                                    </Text>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Menu position="bottom-end">
                                                    <Menu.Target>
                                                        <ActionIcon variant="subtle" className="text-gray-900 dark:text-gray-100">
                                                            <MoreVertical size={16} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                        <Menu.Item
                                                            leftSection={<Eye size={16} />}
                                                            onClick={() => handleView(client)}
                                                            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            View
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={<Edit size={16} />}
                                                            onClick={() => handleEdit(client)}
                                                            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            Edit
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={<Trash2 size={16} />}
                                                            color="red"
                                                            onClick={() => handleDelete(client.id)}
                                                            className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            Delete
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {clients && clients.data.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <Text size="sm" c="dimmed" className="text-gray-500 dark:text-gray-400">
                                Showing {clients.from} to {clients.to} of {clients.total} results
                            </Text>
                            <Group gap="xs">
                                {clients.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        component="a"
                                        href={link.url || '#'}
                                        variant={link.active ? 'filled' : 'light'}
                                        size="xs"
                                        disabled={!link.url}
                                        className={link.active ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </Group>
                        </div>
                    )}
                </div>
            </div>

            {selectedClient && (
                <>
                    <ViewClient
                        client={selectedClient}
                        opened={viewModalOpened}
                        onClose={() => setViewModalOpened(false)}
                    />
                    <EditClient
                        client={selectedClient}
                        opened={editModalOpened}
                        onClose={() => setEditModalOpened(false)}
                        onUpdate={handleClientUpdate}
                    />
                </>
            )}
        </AppLayout>
    );
};

export default ClientsList;