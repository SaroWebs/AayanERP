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


interface PermissionsProps {
    permissions: Permission[];
    loadPermissions: () => void;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Permissions',
        href: '/configuration/roles',
    },
];

const crudActions = ['create', 'read', 'update', 'delete'];

const groupPermissionsByModule = (permissions: Permission[]) => {
    const grouped: Record<string, Record<string, Permission>> = {};

    permissions.forEach((perm) => {
        const [module, action] = perm.name.split('.');

        if (!grouped[module]) {
            grouped[module] = {};
        }

        grouped[module][action] = perm;
    });

    return grouped;
};

const formatRolePermissions = (permissions: Permission[]) => {
    const grouped: Record<string, string[]> = {};

    permissions.forEach((perm) => {
        const [module, action] = perm.name.split('.');
        if (!grouped[module]) grouped[module] = [];
        grouped[module].push(action);
    });

    return grouped;
};


const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const grouped = groupPermissionsByModule(permissions);


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
                                                    Object.entries(formatRolePermissions(role.permissions)).map(([module, actions]) => (
                                                        <span
                                                            key={module}
                                                            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm capitalize block mb-1"
                                                        >
                                                            {module} ({actions.sort().join(', ')})
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
                <DialogContent className='min-w-[60vw]'>
                    <DialogHeader>
                        <DialogTitle>Assign Permissions to {selectedRole?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {Object.entries(grouped).map(([module, actions]) => (
                            <div key={module}>
                                <h4 className="font-semibold capitalize mb-2">{module}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {crudActions.map(action => {
                                        const perm = actions[action];
                                        if (!perm) return null;

                                        const isChecked = selectedPermissions.includes(perm.id);
                                        return (
                                            <label key={perm.id} className="flex items-center gap-2 capitalize">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedPermissions(prev => [...prev, perm.id]);
                                                        } else {
                                                            setSelectedPermissions(prev => prev.filter(id => id !== perm.id));
                                                        }
                                                    }}
                                                />
                                                {action}
                                            </label>
                                        );
                                    })}
                                </div>
                                <hr className="my-2" />
                            </div>
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


const Permissions: React.FC<PermissionsProps> = ({ permissions, loadPermissions }) => {
    const [open, setOpen] = useState(false);
    const [moduleName, setModuleName] = useState('');
    const [selectedActions, setSelectedActions] = useState<string[]>([]);
    const groupedPermissions = groupPermissionsByModule(permissions);

    const handleCheckboxToggle = (action: string) => {
        setSelectedActions((prev) =>
            prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
        );
    };

    const handleCreate = () => {
        if (!moduleName || selectedActions.length === 0) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please enter module name and select at least one action.',
                color: 'red',
            });
            return;
        }

        axios
            .post('/data/config/permissions/add', {
                module: moduleName,
                actions: selectedActions,
            })
            .then((res) => {
                notifications.show({
                    title: 'Permission Group Added',
                    message: res.data.message,
                    color: 'green',
                });
                setModuleName('');
                setSelectedActions([]);
                setOpen(false);
                loadPermissions();
            })
            .catch((err) => {
                notifications.show({
                    title: 'Error',
                    message: err.response?.data?.message || 'Failed to add permission.',
                    color: 'red',
                });
            });
    };

    const handleDelete = (module: string) => {
        if (!confirm(`Are you sure you want to delete all permissions under "${module}"?`)) return;

        axios
            .delete(`/data/config/permissions/module/${module}/delete`)
            .then((res) => {
                notifications.show({
                    title: 'Deleted',
                    message: res.data.message,
                    color: 'green',
                });
                loadPermissions();
            })
            .catch((err) => {
                notifications.show({
                    title: 'Error',
                    message: err.response?.data?.message || 'Failed to delete permissions.',
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
                        <Button variant="outline">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Permission Group
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Permission Group</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <Input
                                placeholder="Module name (e.g., posts)"
                                value={moduleName}
                                onChange={(e) => setModuleName(e.target.value)}
                            />

                            <div className="flex flex-wrap gap-4">
                                {crudActions.map((action) => (
                                    <label key={action} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedActions.includes(action)}
                                            onChange={() => handleCheckboxToggle(action)}
                                        />
                                        {action.toUpperCase()}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Permissions</Button>
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
                                {crudActions.map((action) => (
                                    <th key={action} className="p-2 capitalize text-center">
                                        {action}
                                    </th>
                                ))}
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedPermissions).map(([module, perms], index) => (
                                <tr key={module} className="border-t">
                                    <td className="p-2 font-semibold">{index + 1}</td>
                                    <td className="p-2 font-semibold capitalize">{module}</td>
                                    {crudActions.map((action) => (
                                        <td key={action} className="p-2 text-center">
                                            {perms[action] ? (
                                                <span className="text-green-600 font-bold">✔</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-2 text-center">
                                        <Button
                                            key={module}
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(module)}
                                            className="text-red-500"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {Object.keys(groupedPermissions).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-4 text-gray-500">
                                        No permissions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};