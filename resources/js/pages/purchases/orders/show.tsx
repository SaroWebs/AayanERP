import { Head, router } from '@inertiajs/react';
import { Paper, Title, Button, Group, Stack, Grid, Badge, Text, Container, Divider, Box, Table, ScrollArea, Tooltip, ActionIcon, Collapse, Modal } from '@mantine/core';
import { format } from 'date-fns';
import { PurchaseOrder, Department, Vendor, PurchaseOrderItem } from '@/types/purchase';
import AppLayout from '@/layouts/app-layout';
import { notifications } from '@mantine/notifications';
import { BreadcrumbItem, PageProps } from '@/types/index.d';
import React, { useState, useEffect } from 'react';
import { EditOrderItem } from './partials/EditItem';
import axios from 'axios';
import { AlertCircle, Calendar, CheckCircle, ChevronDown, ChevronUp, Eye, FileText, MapPin, Package, Truck } from 'lucide-react';

interface Props extends PageProps {
  order: PurchaseOrder;
}

export default function OrderShow({ order }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemModalOpened, setItemModalOpened] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadDepartments();
  }, []);

  const toggleRowExpansion = (itemId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <Button variant="outline" onClick={() => setEditModalOpened(true)}>
                Edit
              </Button>
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
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <Group className="justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Purchase Order Items</h3>
                        <Text size="sm" className="text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Total Value: {formatCurrency(
                            order.items.reduce((sum, item) => sum + (item.total_price || 0), 0),
                            order.currency
                          )}
                        </Text>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="light" color="blue" size="lg" className="font-semibold">
                          {order.items.length} Items
                        </Badge>
                        <Badge variant="light" color="green" size="lg" className="font-semibold">
                          {order.items.filter(item => item.status === 'delivered' || item.status === 'received').length} Delivered
                        </Badge>
                      </div>
                    </Group>
                  </div>

                  {/* Scrollable Table */}
                  <ScrollArea>
                    <div className="min-w-[2000px]">
                      <Table highlightOnHover className="w-full">
                        <Table.Thead className="bg-gray-50 sticky top-0 z-10">
                          <Table.Tr>
                            <Table.Th className="font-semibold text-gray-700 min-w-[50px] sticky left-0 bg-gray-50 border-r border-gray-200 z-20 text-center">
                              #
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[280px] sticky left-[50px] bg-gray-50 border-r border-gray-200 z-20">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Item Details
                              </div>
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[140px] text-center">
                              <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Quantity & Unit
                              </div>
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[160px] text-right">
                              Pricing Details
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[200px]">
                              Brand & Model
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[180px]">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Delivery Info
                              </div>
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[160px]">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Receipt Status
                              </div>
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[140px] text-center">
                              Order Status
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[200px]">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Quality & Testing
                              </div>
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[120px] text-center">
                              Warranty
                            </Table.Th>
                            <Table.Th className="font-semibold text-gray-700 min-w-[100px] text-center">
                              Actions
                            </Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {order.items.map((item, idx) => (
                            <React.Fragment key={item.id}>
                              <Table.Tr className="hover:bg-gray-50 transition-colors duration-150" style={{ cursor: 'pointer', background: selectedItem === item ? '#f0f4ff' : undefined }}>
                                {/* Row Number */}
                                <Table.Td className="sticky left-0 bg-white border-r border-gray-200 z-10 hover:bg-gray-50 text-center">
                                  <Text size="sm" fw={600} className="text-gray-600">
                                    {idx + 1}
                                  </Text>
                                </Table.Td>

                                {/* Sticky Item Details Column */}
                                <Table.Td className="sticky left-[50px] bg-white border-r border-gray-200 z-10 hover:bg-gray-50">
                                  <div className="py-2">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <Text size="sm" fw={600} className="text-gray-900 mb-1 leading-tight">
                                          {item.item_name}
                                        </Text>
                                        {item.item_code && (
                                          <Badge variant="outline" size="xs" className="mb-2">
                                            {item.item_code}
                                          </Badge>
                                        )}
                                      </div>
                                      <Button
                                        variant="subtle"
                                        size="xs"
                                        onClick={(e) => { e.stopPropagation(); toggleRowExpansion(item.id); }}
                                        className="ml-2 flex-shrink-0"
                                      >
                                        {expandedRows.has(item.id) ? (
                                          <ChevronUp className="w-3 h-3" />
                                        ) : (
                                          <ChevronDown className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </div>
                                    {item.description && (
                                      <Text size="xs" className="text-gray-500 leading-tight">
                                        {truncateText(item.description, 80)}
                                      </Text>
                                    )}
                                  </div>
                                </Table.Td>

                                {/* Quantity & Unit */}
                                <Table.Td className="text-center">
                                  <div className="py-2">
                                    <Text size="sm" fw={600} className="text-gray-900 mb-1">
                                      {item.quantity?.toLocaleString() || 0}
                                    </Text>
                                    <Text size="xs" className="text-gray-500">
                                      {item.unit || 'units'}
                                    </Text>
                                  </div>
                                </Table.Td>

                                {/* Pricing */}
                                <Table.Td className="text-right">
                                  <div className="py-2">
                                    <Text size="xs" className="text-gray-500 mb-1">
                                      {formatCurrency(item.unit_price || 0, order.currency)} / unit
                                    </Text>
                                    <Text size="sm" fw={600} className="text-gray-900">
                                      {formatCurrency(item.total_price || 0, order.currency)}
                                    </Text>
                                  </div>
                                </Table.Td>

                                {/* Brand & Model */}
                                <Table.Td>
                                  <div className="py-2">
                                    <Text size="sm" fw={500} className="text-gray-900 mb-1">
                                      {item.brand || 'No brand specified'}
                                    </Text>
                                    <Text size="xs" className="text-gray-500">
                                      {item.model || 'No model specified'}
                                    </Text>
                                  </div>
                                </Table.Td>

                                {/* Delivery Info */}
                                <Table.Td>
                                  <div className="py-2">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Calendar className="w-3 h-3 text-gray-400" />
                                      <Text size="xs" className="text-gray-600">
                                        {formatDate(item.expected_delivery_date)}
                                      </Text>
                                    </div>
                                    {item.delivery_location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-gray-400" />
                                        <Text size="xs" className="text-gray-500">
                                          {truncateText(item.delivery_location, 25)}
                                        </Text>
                                      </div>
                                    )}
                                  </div>
                                </Table.Td>

                                {/* Receipt Status */}
                                <Table.Td>
                                  <div className="py-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Text size="xs" className="text-gray-600">
                                        {item.received_quantity} / {item.quantity}
                                      </Text>
                                      <Badge
                                        size="xs"
                                        variant="light"
                                        color={getReceiptProgress(item) === 100 ? 'green' : getReceiptProgress(item) > 0 ? 'orange' : 'gray'}
                                      >
                                        {getReceiptProgress(item)}%
                                      </Badge>
                                    </div>
                                    {item.received_date && (
                                      <Text size="xs" className="text-gray-500">
                                        Received: {formatDate(item.received_date)}
                                      </Text>
                                    )}
                                  </div>
                                </Table.Td>

                                {/* Status */}
                                <Table.Td className="text-center">
                                  <div className="py-2">
                                    <Badge
                                      variant="light"
                                      color={getStatusColor(item.status)}
                                      className="font-medium"
                                    >
                                      {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown'}
                                    </Badge>
                                  </div>
                                </Table.Td>

                                {/* Quality & Testing */}
                                <Table.Td>
                                  <div className="py-2 space-y-1">
                                    {item.quality_requirements && (
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <Text size="xs" className="text-gray-600">Quality req.</Text>
                                      </div>
                                    )}
                                    {item.inspection_requirements && (
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        <Text size="xs" className="text-gray-600">Inspection req.</Text>
                                      </div>
                                    )}
                                    {item.testing_requirements && (
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                        <Text size="xs" className="text-gray-600">Testing req.</Text>
                                      </div>
                                    )}
                                    {!item.quality_requirements && !item.inspection_requirements && !item.testing_requirements && (
                                      <Text size="xs" className="text-gray-400 italic">Standard</Text>
                                    )}
                                  </div>
                                </Table.Td>

                                {/* Warranty */}
                                <Table.Td className="text-center">
                                  <div className="py-2">
                                    <Badge
                                      variant="light"
                                      color={item.warranty_period ? 'green' : 'gray'}
                                      size="sm"
                                    >
                                      {item.warranty_period || 'No warranty'}
                                    </Badge>
                                  </div>
                                </Table.Td>

                                {/* Actions */}
                                <Table.Td className="text-center">
                                  <div className="py-2">
                                    <Group gap="xs" className="justify-center">
                                      <Tooltip label="View Details">
                                        <ActionIcon
                                          variant="subtle"
                                          color="blue"
                                          size="sm"
                                          className="hover:bg-blue-50 transition-colors duration-200"
                                          onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setItemModalOpened(true); }}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </ActionIcon>
                                      </Tooltip>
                                      <Tooltip label="View Notes">
                                        <ActionIcon
                                          variant="subtle"
                                          color="gray"
                                          size="sm"
                                          className="hover:bg-gray-50 transition-colors duration-200"
                                          disabled={!item.notes}
                                        >
                                          <FileText className="w-4 h-4" />
                                        </ActionIcon>
                                      </Tooltip>
                                    </Group>
                                  </div>
                                </Table.Td>
                              </Table.Tr>

                              {/* Expanded Row Details */}
                              <Table.Tr className={expandedRows.has(item.id) ? '' : 'hidden'}>
                                <Table.Td colSpan={11} className="p-0 border-t-0">
                                  <Collapse in={expandedRows.has(item.id)}>
                                    <Box className="bg-gray-50 p-6 border-t border-gray-200">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Specifications */}
                                        {item.specifications && (
                                          <div>
                                            <Text size="sm" fw={600} className="text-gray-900 mb-2">Specifications</Text>
                                            <Text size="sm" className="text-gray-700 bg-white p-3 rounded border">
                                              {item.specifications}
                                            </Text>
                                          </div>
                                        )}

                                        {/* Quality Requirements */}
                                        {item.quality_requirements && (
                                          <div>
                                            <Text size="sm" fw={600} className="text-gray-900 mb-2">Quality Requirements</Text>
                                            <Text size="sm" className="text-gray-700 bg-white p-3 rounded border">
                                              {item.quality_requirements}
                                            </Text>
                                          </div>
                                        )}

                                        {/* Inspection Requirements */}
                                        {item.inspection_requirements && (
                                          <div>
                                            <Text size="sm" fw={600} className="text-gray-900 mb-2">Inspection Requirements</Text>
                                            <Text size="sm" className="text-gray-700 bg-white p-3 rounded border">
                                              {item.inspection_requirements}
                                            </Text>
                                          </div>
                                        )}

                                        {/* Testing Requirements */}
                                        {item.testing_requirements && (
                                          <div>
                                            <Text size="sm" fw={600} className="text-gray-900 mb-2">Testing Requirements</Text>
                                            <Text size="sm" className="text-gray-700 bg-white p-3 rounded border">
                                              {item.testing_requirements}
                                            </Text>
                                          </div>
                                        )}

                                        {/* Notes */}
                                        {item.notes && (
                                          <div>
                                            <Text size="sm" fw={600} className="text-gray-900 mb-2">Notes</Text>
                                            <Text size="sm" className="text-gray-700 bg-white p-3 rounded border">
                                              {item.notes}
                                            </Text>
                                          </div>
                                        )}

                                        {/* Receipt Remarks */}
                                        {item.receipt_remarks && (
                                          <div>
                                            <Text size="sm" fw={600} className="text-gray-900 mb-2">Receipt Remarks</Text>
                                            <Text size="sm" className="text-gray-700 bg-white p-3 rounded border">
                                              {item.receipt_remarks}
                                            </Text>
                                          </div>
                                        )}

                                        {/* Timestamps */}
                                        <div>
                                          <Text size="sm" fw={600} className="text-gray-900 mb-2">Timeline</Text>
                                          <div className="bg-white p-3 rounded border space-y-2">
                                            <div className="flex justify-between">
                                              <Text size="xs" className="text-gray-500">Created:</Text>
                                              <Text size="xs" className="text-gray-700">{formatDate(item.created_at)}</Text>
                                            </div>
                                            <div className="flex justify-between">
                                              <Text size="xs" className="text-gray-500">Updated:</Text>
                                              <Text size="xs" className="text-gray-700">{formatDate(item.updated_at)}</Text>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Box>
                                  </Collapse>
                                </Table.Td>
                              </Table.Tr>
                            </React.Fragment>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </div>
                  </ScrollArea>

                  {/* Footer Summary */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Text size="lg" fw={700} className="text-gray-900">
                          {order.items.length}
                        </Text>
                        <Text size="xs" className="text-gray-600">Total Items</Text>
                      </div>
                      <div className="text-center">
                        <Text size="lg" fw={700} className="text-green-600">
                          {order.items.filter(item => getReceiptProgress(item) === 100).length}
                        </Text>
                        <Text size="xs" className="text-gray-600">Fully Received</Text>
                      </div>
                      <div className="text-center">
                        <Text size="lg" fw={700} className="text-orange-600">
                          {order.items.filter(item => getReceiptProgress(item) > 0 && getReceiptProgress(item) < 100).length}
                        </Text>
                        <Text size="xs" className="text-gray-600">Partially Received</Text>
                      </div>
                      <div className="text-center">
                        <Text size="lg" fw={700} className="text-blue-600">
                          {formatCurrency(
                            order.items.reduce((sum, item) => sum + (item.total_price || 0), 0),
                            order.currency
                          )}
                        </Text>
                        <Text size="xs" className="text-gray-600">Total Value</Text>
                      </div>
                    </div>
                  </div>
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
          loading={loading}
        />
        <Modal opened={itemModalOpened} onClose={() => setItemModalOpened(false)} title={selectedItem ? selectedItem.item_name : 'Item Details'}>
          {selectedItem && (
            <Stack>
              <Text><b>Item Name:</b> {selectedItem.item_name}</Text>
              <Text><b>Quantity:</b> {selectedItem.quantity}</Text>
              <Text><b>Unit:</b> {selectedItem.unit}</Text>
              <Text><b>Unit Price:</b> {order.currency} {selectedItem.unit_price}</Text>
              <Text><b>Total Price:</b> {order.currency} {selectedItem.total_price}</Text>
              <Text><b>Description:</b> {selectedItem.description}</Text>
              <Text><b>Specs:</b> {selectedItem.specifications}</Text>
              <Text><b>Brand:</b> {selectedItem.brand}</Text>
              <Text><b>Model:</b> {selectedItem.model}</Text>
              <Text><b>Warranty:</b> {selectedItem.warranty_period}</Text>
              <Text><b>Quality:</b> {selectedItem.quality_requirements}</Text>
              <Text><b>Inspection:</b> {selectedItem.inspection_requirements}</Text>
              <Text><b>Status:</b> {selectedItem.status}</Text>
            </Stack>
          )}
        </Modal>
      </Box>
    </AppLayout>
  );
} 