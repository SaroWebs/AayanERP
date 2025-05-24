import React, { useEffect, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { notifications } from '@mantine/notifications'
import { BreadcrumbItem, Permission, Role } from '@/types'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import axios from 'axios'
import { Edit, ListChecks, PlusIcon, Trash } from 'lucide-react'


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Permissions',
        href: '/configuration/roles',
    },
];

const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);


    const handleCreate = () => {
        axios.post('/data/config/roles/add', { name })
            .then(res => {
                notifications.show({
                    title: 'Success',
                    message: 'Role created successfully.',
                    color: 'green',
                });
                setOpen(false);
                setName('');
                loadRoles();
            }).catch(err => {
                notifications.show({
                    title: 'Error',
                    message: err.response?.data.message || 'Something went wrong.',
                    color: 'red',
                });
                setOpen(false);
            })
    }

    const loadRoles = () => {
        axios.get('/data/config/roles')
            .then(res => {
                setRoles(res.data);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const loadPermissions = () => {
        axios.get('/data/config/permissions')
            .then(res => setPermissions(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadPermissions();
    }, []);

    useEffect(() => {
        loadRoles();
    }, [permissions]);

    const openPermissionDialog = (role: Role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions.map(p => p.id));
        setAssignDialogOpen(true);
    };

    const handleAssignPermissions = () => {
        if (!selectedRole) return;

        axios.post('/data/config/roles/assign-permissions', {
            role_id: selectedRole.id,
            permission_ids: selectedPermissions,
        }).then(res => {
            notifications.show({
                title: 'Success',
                message: 'Permissions assigned successfully.',
                color: 'green',
            });
            setAssignDialogOpen(false);
            loadRoles();
        }).catch(err => {
            notifications.show({
                title: 'Error',
                message: err.response?.data.message || 'Failed to assign permissions.',
                color: 'red',
            });
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="w-full flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Roles</h2>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant={'outline'}> <PlusIcon /> Role</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Role</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    placeholder="Role name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-900">
                    <div className="max-w-5xl overflow-x-auto">
                        <table className="min-w-full text-sm table-auto">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">#</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Permissions</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role, index) => (
                                    <tr key={role.id} className="border-t">
                                        <td className="p-2">{index + 1}</td>
                                        <td className="p-2">{role.name}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                {role.permissions.length > 0 ? (
                                                    role.permissions.map((perm) => (
                                                        <span key={perm.id} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded capitalize">
                                                            {perm.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="italic text-gray-500">No permissions</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-1">
                                                <Button
                                                    variant={'outline'}
                                                    size={'sm'}
                                                    onClick={() => openPermissionDialog(role)}
                                                    className='text-teal-600'
                                                >
                                                    <ListChecks />
                                                </Button>
                                                <Button
                                                    variant={'outline'}
                                                    size={'sm'}
                                                    className='text-blue-600'
                                                >
                                                    <Edit />
                                                </Button>
                                                <Button
                                                    variant={'outline'}
                                                    size={'sm'}
                                                    className='text-red-600'
                                                >
                                                    <Trash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr />

                <Permissions permissions={permissions} loadPermissions={loadPermissions} />
            </div>

            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Permissions to {selectedRole?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {permissions.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-2 capitalize">
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedPermissions([...selectedPermissions, perm.id]);
                                        } else {
                                            setSelectedPermissions(selectedPermissions.filter(id => id !== perm.id));
                                        }
                                    }}
                                />
                                {perm.name}
                            </label>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAssignPermissions}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    )
}

export default Roles


interface PermissionsProps {
    permissions: Permission[];
    loadPermissions: () => void;
}

const Permissions: React.FC<PermissionsProps> = ({ permissions, loadPermissions }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const handleEdit = (perm: Permission) => {
        setName(perm.name);
        setEditId(perm.id);
        setEditMode(true);
        setOpen(true);
    };

    const handleCreateOrUpdate = () => {
        if (editMode && editId !== null) {
            axios.put(`/data/config/permissions/${editId}/update`, { name })
                .then(res => {
                    notifications.show({
                        title: 'Updated',
                        message: res.data.message,
                        color: 'green',
                    });
                    setName('');
                    setEditMode(false);
                    setEditId(null);
                    setOpen(false);
                    loadPermissions();
                }).catch(err => {
                    notifications.show({
                        title: 'Error',
                        message: err.response?.data.message || 'Failed to update permission.',
                        color: 'red',
                    });
                });
        } else {
            axios.post('/data/config/permissions/add', { name })
                .then(res => {
                    notifications.show({
                        title: 'Permission Added',
                        message: res.data.message,
                        color: 'green',
                    });
                    setName('');
                    setOpen(false);
                    loadPermissions();
                })
                .catch(err => {
                    notifications.show({
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to add permission.',
                        color: 'red',
                    });
                });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this permission?')) return;
        axios.delete(`/data/config/permissions/${id}/delete`)
            .then(res => {
                notifications.show({
                    title: 'Deleted',
                    message: res.data.message,
                    color: 'green',
                });
                loadPermissions();
            }).catch(err => {
                notifications.show({
                    title: 'Error',
                    message: err.response?.data?.message || 'Failed to delete permission.',
                    color: 'red',
                });
            });
    };

    return (
        <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Permissions</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant={'outline'}> <PlusIcon /> Permission</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editMode ? 'Update' : 'New'} Permission</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input placeholder="Permission name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateOrUpdate}>
                                {editMode ? 'Update' : 'Save'}
                            </Button>

                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-900">
                <div className="max-w-5xl overflow-x-auto">
                    <table className="min-w-full text-sm table-auto">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="p-2">#</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Guard</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((perm, idx) => (
                                <tr key={perm.id} className="border-t">
                                    <td className="p-2">{idx + 1}</td>
                                    <td className="p-2 capitalize">{perm.name}</td>
                                    <td className="p-2">{perm.guard_name}</td>
                                    <td className="p-2">
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-600"
                                                onClick={() => handleEdit(perm)}
                                            >
                                                <Edit />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600"
                                                onClick={() => handleDelete(perm.id)}
                                            >
                                                <Trash />
                                            </Button>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};