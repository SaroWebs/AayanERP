import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Head } from '@inertiajs/react';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Role {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/configuration/users',
    },
];

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [open, setOpen] = useState(false);

    const loadUsers = () => {
        axios.get('/data/config/users')
            .then(res => {
                setUsers(res.data)
            })
            .catch(err => console.error(err));
    };

    const loadRoles = () => {
        axios.get('/data/config/roles')
            .then(res => setRoles(res.data))
            .catch(err => console.error(err));
    };

    const handleAssignRoles = () => {
        axios.post('/data/config/users/assign-roles', {
          user_id: selectedUser?.id,
          roles: selectedRoles,
        }).then(res => {
          notifications.show({
            title: 'Success',
            message: res.data.message,
            color: 'green',
          });
          setOpen(false);
          setSelectedRoles([]);
          setSelectedUser(null);
          loadUsers(); // Refresh
        }).catch(err => {
          notifications.show({
            title: 'Error',
            message: err.response?.data?.message || 'Failed to assign roles.',
            color: 'red',
          });
        });
      };
      
    const openAssignRolesDialog = (user: User) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles.map(role => role.name));
        setOpen(true);
    };

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="p-4 space-y-6">
                <h2 className="text-2xl font-semibold">Users</h2>

                <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-900">
                    <table className="min-w-full text-sm table-auto">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="p-2">#</th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Roles</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <tr key={user.id} className="border-t">
                                    <td className="p-2">{idx + 1}</td>
                                    <td className="p-2">{user.name}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2 space-x-1">
                                        {user.roles.length > 0 ? user.roles.map((role) => (
                                            <span
                                                key={role.id}
                                                className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                                            >
                                                {role.name}
                                            </span>
                                        )) : (
                                            <span className="italic text-gray-500">No Roles</span>
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <Dialog
                                            open={open && selectedUser?.id === user.id}
                                            onOpenChange={(v) => {
                                                setOpen(v);
                                                if (!v) {
                                                    setSelectedUser(null);
                                                    setSelectedRoles([]);
                                                }
                                            }}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openAssignRolesDialog(user)}
                                                >
                                                    Assign Role
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Assign Roles to {user.name}</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                        {roles.map((role) => (
                                                            <label key={role.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    value={role.name}
                                                                    checked={selectedRoles.includes(role.name)}
                                                                    onChange={(e) => {
                                                                        const checked = e.target.checked;
                                                                        setSelectedRoles((prev) =>
                                                                            checked ? [...prev, role.name] : prev.filter((r) => r !== role.name)
                                                                        );
                                                                    }}
                                                                />
                                                                <span>{role.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>

                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleAssignRoles}>Assign</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
};

export default Users;
