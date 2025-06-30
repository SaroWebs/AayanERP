import { DataTableColumn } from 'mantine-datatable';
import { PurchaseOrder } from '@/types/purchase';
import { Badge, Button, Group } from '@mantine/core';
import { router } from '@inertiajs/react';

export const columns = (handleAction: (order: PurchaseOrder, action: string) => void): DataTableColumn<PurchaseOrder>[] => [
  {
    accessor: 'po_no',
    title: 'PO No',
    render: (order) => order.po_no,
  },
  {
    accessor: 'vendor',
    title: 'Vendor',
    render: (order) => order.vendor?.name || '',
  },
  {
    accessor: 'po_date',
    title: 'PO Date',
    render: (order) => order.po_date,
  },
  {
    accessor: 'status',
    title: 'Status',
    render: (order) => <Badge color={getStatusColor(order.status)}>{order.status}</Badge>,
  },
  {
    accessor: 'grand_total',
    title: 'Grand Total',
    render: (order) => `${order.currency} ${order.grand_total.toLocaleString()}`,
  },
  {
    accessor: 'actions',
    title: 'Actions',
    render: (order) => (
      <Group gap={4}>
        <Button size="xs" variant="light" onClick={() => router.visit(`/purchases/orders/${order.id}`)}>View</Button>
        <Button size="xs" variant="outline" onClick={() => handleAction(order, 'edit')}>Edit</Button>
      </Group>
    ),
  },
];

function getStatusColor(status: PurchaseOrder['status']) {
  switch (status) {
    case 'draft': return 'gray';
    case 'pending_approval': return 'yellow';
    case 'approved': return 'blue';
    case 'sent': return 'cyan';
    case 'acknowledged': return 'teal';
    case 'partial_received': return 'orange';
    case 'received': return 'green';
    case 'cancelled': return 'red';
    case 'closed': return 'gray';
    default: return 'gray';
  }
} 