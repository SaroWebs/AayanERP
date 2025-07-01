import { Head, router } from '@inertiajs/react';
import { Paper, Title, Button, Group, Stack, Grid, Badge, Text, Container, Divider, Box, Table, ScrollArea, Tooltip, ActionIcon, Modal } from '@mantine/core';
import { format } from 'date-fns';
import { PurchaseOrder, Department, Vendor, PurchaseOrderItem, Item } from '@/types/purchase';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import React, { useState, useEffect } from 'react';
import { EditOrderItem } from './partials/EditItem';
import axios from 'axios';
import { Eye, Package } from 'lucide-react';
import JsonToList from '@/components/ui/JsonToList';
import PurchaseOrderPrintable from './partials/PurchaseOrderPrintable';
import { useDisclosure } from '@mantine/hooks';

interface Props extends PageProps {
  order: PurchaseOrder;
  vendors: Vendor[];
  products: Item[];
}

export default function OrderShow({ order, products, vendors }: Props) {

  const [opened, { open, close }] = useDisclosure(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [itemModalOpened, setItemModalOpened] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'delivered':
      case 'completed':
      case 'approved':
      case 'received':
        return 'green';
      case 'pending':
      case 'processing':
      case 'ordered':
        return 'yellow';
      case 'cancelled':
      case 'rejected':
        return 'red';
      case 'shipped':
      case 'in_transit':
        return 'blue';
      case 'partial':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getReceiptProgress = (item: PurchaseOrderItem) => {
    if (item.quantity === 0) return 0;
    return Math.round((item.received_quantity / item.quantity) * 100);
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

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Purchases', href: '/purchases' },
    { title: 'Purchase Orders', href: '/purchases/orders' },
    { title: order?.po_no || '', href: `/purchases/orders/${order?.id}` },
  ];

  if (!order) {
    return (
      <AppLayout breadcrumbs={[]}>
        <Head title="Purchase Order Not Found" />
        <Container size="lg" py="xl">
          <Paper p="md" withBorder>
            <Title order={2} c="red">Purchase Order Not Found</Title>
            <Text mt="md">The requested purchase order could not be found.</Text>
          </Paper>
        </Container>
      </AppLayout>
    );
  }

  const handlePrint = () => {
    const printContents = document.getElementById('printable-po')?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'height=900,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Purchase Order</title>');
      printWindow.document.write('<style>@media print { body { margin: 0; } }</style>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleExportPDF = () => {
    notifications.show({ message: 'PDF export coming soon!', color: 'blue' });
  };

  const handleExportCSV = () => {
    // Simple CSV export for items
    if (!order.items || order.items.length === 0) return;
    const header = ['Item Name', 'Code', 'Description', 'Quantity', 'Unit', 'Unit Price', 'Total Price'];
    const rows = order.items.map(item => [
      item.item_name,
      item.item_code || '',
      item.description || '',
      item.quantity,
      item.unit || '',
      item.unit_price,
      item.total_price
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `purchase_order_${order.po_no}_items.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Purchase Order - ${order.po_no}`} />
      <Box className='p-4'>
        <Box className='p-4 w-full'>
          <Paper p="md" withBorder mb="lg">
            <Group justify="space-between" mb="md">
              <Button variant="light" onClick={() => window.history.back()}>
                Back to List
              </Button>
              <Group>
                <Button variant="outline" onClick={() => setEditModalOpened(true)}>
                  Edit
                </Button>
                <Button variant="default" onClick={() => handlePrint()}>
                  Print
                </Button>
                <Button variant="default" onClick={() => handleExportPDF()}>
                  Export PDF
                </Button>
                <Button variant="default" onClick={() => handleExportCSV()}>
                  Export CSV
                </Button>
                {/* test modal */}
                <>
                  <Button variant='outline' color='red' onClick={open}>Test Print Format</Button>
                  <Modal
                    opened={opened}
                    onClose={close}
                    size={'100%'}
                  >
                    <PurchaseOrderPrintable order={order} />
                  </Modal>
                </>
              </Group>
            </Group>
            <Stack gap="md">
              <Title order={3}>Order Details</Title>
              <Grid>
                <Grid.Col span={6}><Text><b>PO No:</b> {order.po_no}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>PO Date:</b> {order.po_date}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Vendor:</b> {order.vendor?.name || ''}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Department:</b> {order.department?.name || ''}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Status:</b> <Badge>{order.status}</Badge></Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Grand Total:</b> {order.currency} {order.grand_total.toLocaleString()}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Delivery Location:</b> {order.delivery_location}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Payment Terms:</b> {order.payment_terms}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Delivery Terms:</b> {order.delivery_terms}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Warranty Terms:</b> {order.warranty_terms}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Special Instructions:</b> {order.special_instructions}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Quality Requirements:</b> {order.quality_requirements}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Inspection Requirements:</b> {order.inspection_requirements}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Certification Requirements:</b> {order.certification_requirements}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Quotation Ref:</b> {order.quotation_reference}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Contract Ref:</b> {order.contract_reference}</Text></Grid.Col>
                <Grid.Col span={6}><Text><b>Project Ref:</b> {order.project_reference}</Text></Grid.Col>
                {/* Add more fields as needed */}
              </Grid>
              <Divider my="md" />
              {order.items && order.items.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Purchase Order Items</h3>
                      <Text size="sm" className="text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Total Value: {formatCurrency(
                          order.items.reduce((sum, item) => sum + (item.total_price || 0), 0),
                          order.currency
                        )}
                      </Text>
                    </div>
                  </div>

                  {/* Simplified Table */}
                  <ScrollArea>
                    <Table highlightOnHover className="w-full text-sm">
                      <Table.Thead className="bg-gray-50">
                        <Table.Tr>
                          <Table.Th className="text-center">#</Table.Th>
                          <Table.Th>Item</Table.Th>
                          <Table.Th className="text-center">Qty</Table.Th>
                          <Table.Th className="text-right">Unit Price</Table.Th>
                          <Table.Th className="text-right">Total</Table.Th>
                          <Table.Th className="text-center">Status</Table.Th>
                          <Table.Th className="text-center">Actions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {order.items.map((item, idx) => (
                          <Table.Tr key={item.id} className="hover:bg-blue-50 transition-colors duration-100">
                            <Table.Td className="text-center">{idx + 1}</Table.Td>
                            <Table.Td>
                              <div className="font-medium text-gray-900">{item.item_name}</div>
                              {item.item_code && (
                                <span className="text-xs text-gray-400">{item.item_code}</span>
                              )}
                              {item.description && (
                                <div className="text-xs text-gray-500 truncate max-w-[180px]">{truncateText(item.description, 40)}</div>
                              )}
                            </Table.Td>
                            <Table.Td className="text-center">{item.quantity?.toLocaleString() || 0} <span className="text-xs text-gray-400">{item.unit || ''}</span></Table.Td>
                            <Table.Td className="text-right">{formatCurrency(item.unit_price || 0, order.currency)}</Table.Td>
                            <Table.Td className="text-right">{formatCurrency(item.total_price || 0, order.currency)}</Table.Td>
                            <Table.Td className="text-center">
                              <Badge variant="light" color={getStatusColor(item.status)} className="font-medium">
                                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown'}
                              </Badge>
                            </Table.Td>
                            <Table.Td className="text-center">
                              <Tooltip label="View Details">
                                <ActionIcon
                                  variant="subtle"
                                  color="blue"
                                  size="sm"
                                  className="hover:bg-blue-100 transition-colors duration-200"
                                  onClick={(e) => { e.stopPropagation(); setItemModalOpened(true); }}
                                >
                                  <Eye className="w-4 h-4" />
                                </ActionIcon>
                              </Tooltip>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                        {order.items.length === 0 && (
                          <Table.Tr>
                            <Table.Td colSpan={7} className="text-center text-gray-400 py-8">
                              <Package className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                              No items found in this order.
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </div>
              ) :
                (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Items Found</h3>
                    <p className="text-gray-500">This order doesn't contain any items yet.</p>
                  </div>
                )}


            </Stack>
          </Paper>
        </Box>
        <EditOrderItem
          opened={editModalOpened}
          onClose={() => setEditModalOpened(false)}
          order={order}
          departments={departments}
          vendors={vendors}
          loading={loading}
          products={products}
        />
        <Modal
          opened={itemModalOpened}
          onClose={() => setItemModalOpened(false)}
          title="Item Details"
          size={'80%'}
        >
          {/* Item details content */}
        </Modal>
        {/* Hidden printable layout for print/export */}
        <div style={{ display: 'none' }}>
          <div id="printable-po">
            <PurchaseOrderPrintable order={order} />
          </div>
        </div>
      </Box>
    </AppLayout>
  );
} 