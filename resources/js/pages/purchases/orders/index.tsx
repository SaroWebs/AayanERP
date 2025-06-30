import { Head, router } from '@inertiajs/react';
import { Paper, Title, Button, Group, Stack, Box } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { columns } from './columns';
import { AddNewOrder } from './partials/AddNew';
import { EditOrderItem } from './partials/EditItem';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import { PurchaseOrder, Department, Item } from '@/types/purchase';
import axios from 'axios';

interface Props extends PageProps {
  items: Item[];
  orders: {
    data: PurchaseOrder[];
    links: any[];
    total: number;
    per_page: number;
    current_page: number;
  };
  filters: {
    status?: string;
    approval_status?: string;
    department_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
  };
}

export default function OrdersIndex({ orders, items, filters }: Props) {
  const [ordersState, setOrdersState] = useState<PurchaseOrder[]>([]);
  const [pagination, setPagination] = useState({ total: 0, per_page: 10, current_page: 1 });
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders(1);
    loadDepartments();
  }, []);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get('/purchases/data/orders', { params: { page } });
      setOrdersState(response.data.data);
      setPagination({
        total: response.data.total,
        per_page: response.data.per_page,
        current_page: response.data.current_page,
      });
    } catch (error) {
      notifications.show({ message: 'Failed to load purchase orders', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/purchases/data/departments/all');
      setDepartments(response.data);
    } catch (error) {
      notifications.show({ message: 'Failed to load departments', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleAction = (order: PurchaseOrder, action: string) => {
    switch (action) {
      case 'view':
        setSelectedOrder(order);
        setEditModalOpened(false);
        break;
      case 'edit':
        setSelectedOrder(order);
        setEditModalOpened(true);
        break;
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Purchases',
      href: '/purchases',
    },
    {
      title: 'Purchase Orders',
      href: '/purchases/orders',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Purchase Orders" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <Box className='p-4 w-full'>
          <Group justify="space-between" mb="md">
            <Title order={2}>Purchase Orders</Title>
            <Button
              leftSection={<Plus size={16} />}
              onClick={() => setAddModalOpened(true)}
            >
              Add New
            </Button>
          </Group>
          <Stack gap="md">
            <DataTable
              columns={columns(handleAction)}
              records={ordersState}
              totalRecords={pagination.total}
              recordsPerPage={pagination.per_page}
              page={pagination.current_page}
              onPageChange={handlePageChange}
              withTableBorder
              borderColor="gray.3"
              striped
              highlightOnHover
              withColumnBorders
              verticalAlign="top"
              pinLastColumn
              fetching={loading}
            />
          </Stack>
        </Box>

        <AddNewOrder
          opened={addModalOpened}
          onClose={() => setAddModalOpened(false)}
          departments={departments}
          loading={loading}
        />

        {selectedOrder && (
          <EditOrderItem
            opened={editModalOpened}
            onClose={() => {
              setEditModalOpened(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            departments={departments}
            loading={loading}
          />
        )}
      </div>
    </AppLayout>
  );
} 