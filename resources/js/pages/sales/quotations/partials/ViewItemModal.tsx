import { Modal, Button, Group, Stack, Text, Badge, Divider, Grid, Paper } from '@mantine/core';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { getStatusColor, getApprovalStatusColor } from '../columns';
import { ClientDetail, ClientContactDetail } from '@/types/client';
import { Quotation, QuotationItem } from '@/types/quotation';

interface Props {
    opened: boolean;
    onClose: () => void;
    quotation: Quotation;
    clients: ClientDetail[];
    loading: boolean;
}

export function ViewItemModal({ opened, onClose, quotation, clients, loading }: Props) {
    // Lookup client and contact person
    const client = clients.find(c => c.id === quotation.client_detail_id);
    const contactPerson = client?.contact_details?.find(cd => cd.id === quotation.contact_person_id);
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Quotation ${quotation.quotation_no}`}
            size="xl"
        >
            <Stack gap="md">
                <Group justify="space-between">
                    <Stack gap={4}>
                        <Text size="sm" c="dimmed">Status</Text>
                        <Badge color={getStatusColor(quotation.status as any)}>
                            {quotation.status.replace('_', ' ').charAt(0).toUpperCase() +
                                quotation.status.replace('_', ' ').slice(1)}
                        </Badge>
                    </Stack>
                    <Stack gap={4}>
                        <Text size="sm" c="dimmed">Approval Status</Text>
                        <Badge color={getApprovalStatusColor(quotation.approval_status as any)}>
                            {quotation.approval_status.replace('_', ' ').charAt(0).toUpperCase() +
                                quotation.approval_status.replace('_', ' ').slice(1)}
                        </Badge>
                    </Stack>
                </Group>

                <Divider />

                <Grid>
                    <Grid.Col span={6}>
                        <Stack gap={4}>
                            <Text size="sm" c="dimmed">Client</Text>
                            <Text fw={500}>{client?.name || quotation.client_detail_id}</Text>
                            {contactPerson && (
                                <Text size="sm">Contact: {contactPerson.contact_person}</Text>
                            )}
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Divider />

                <Grid>
                    <Grid.Col span={6}>
                        <Stack gap={4}>
                            <Text size="sm" c="dimmed">Quotation Date</Text>
                            <Text>{format(new Date(quotation.quotation_date), 'dd/MM/yyyy')}</Text>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Stack gap={4}>
                            <Text size="sm" c="dimmed">Valid Until</Text>
                            <Text>{format(new Date(quotation.valid_until), 'dd/MM/yyyy')}</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Divider />

                <Paper p="md" withBorder>
                    <Stack gap="md">
                        <Text fw={500}>Financial Details</Text>
                        <Grid>
                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Subtotal</Text>
                                    <Text>
                                        {quotation.currency} {formatCurrency(quotation.subtotal)}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Total Amount</Text>
                                    <Text fw={500}>
                                        {quotation.currency} {formatCurrency(quotation.total_amount)}
                                    </Text>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                        {quotation.tax_amount > 0 && (
                            <Grid>
                                <Grid.Col span={6}>
                                    <Stack gap={4}>
                                        <Text size="sm" c="dimmed">Tax ({quotation.tax_percentage}%)</Text>
                                        <Text>
                                            {quotation.currency} {formatCurrency(quotation.tax_amount)}
                                        </Text>
                                    </Stack>
                                </Grid.Col>
                            </Grid>
                        )}
                        {(quotation.discount_amount ?? 0) > 0 && (
                            <Grid>
                                <Grid.Col span={6}>
                                    <Stack gap={4}>
                                        <Text size="sm" c="dimmed">Discount ({quotation.discount_percentage ?? 0}%)</Text>
                                        <Text>
                                            {quotation.currency} {formatCurrency(quotation.discount_amount ?? 0)}
                                        </Text>
                                    </Stack>
                                </Grid.Col>
                            </Grid>
                        )}
                    </Stack>
                </Paper>

                {quotation.items && quotation.items.length > 0 && (
                    <>
                        <Divider />
                        <Stack gap="md">
                            <Text fw={500}>Items</Text>
                            {quotation.items.map((item, index) => (
                                <Paper key={index} p="md" withBorder>
                                    <Grid>
                                        <Grid.Col span={8}>
                                            <Text fw={500}>{item.item?.name || item.item_id}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <Text>Qty: {item.quantity}</Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text size="sm" c="dimmed">Unit Price</Text>
                                            <Text>
                                                {quotation.currency} {formatCurrency(item.unit_price)}
                                            </Text>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text size="sm" c="dimmed">Total Price</Text>
                                            <Text>
                                                {quotation.currency} {formatCurrency(item.total_price)}
                                            </Text>
                                        </Grid.Col>
                                        {item.rental_period && (
                                            <Grid.Col span={6}>
                                                <Text size="sm" c="dimmed">Rental Period</Text>
                                                <Text>
                                                    {item.rental_period} {item.rental_period_unit}
                                                </Text>
                                            </Grid.Col>
                                        )}
                                        {item.notes && (
                                            <Grid.Col span={12}>
                                                <Text size="sm" c="dimmed">Notes</Text>
                                                <Text>{item.notes}</Text>
                                            </Grid.Col>
                                        )}
                                    </Grid>
                                </Paper>
                            ))}
                        </Stack>
                    </>
                )}

                {(quotation.payment_terms || quotation.delivery_terms || quotation.special_conditions || quotation.terms_conditions) && (
                    <>
                        <Divider />
                        <Stack gap="md">
                            {quotation.payment_terms && (
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Payment Terms</Text>
                                    <Text>{quotation.payment_terms}</Text>
                                </Stack>
                            )}
                            {quotation.delivery_terms && (
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Delivery Terms</Text>
                                    <Text>{quotation.delivery_terms}</Text>
                                </Stack>
                            )}
                            {quotation.special_conditions && (
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Special Conditions</Text>
                                    <Text>{quotation.special_conditions}</Text>
                                </Stack>
                            )}
                            {quotation.terms_conditions && (
                                <Stack gap={4}>
                                    <Text size="sm" c="dimmed">Terms & Conditions</Text>
                                    <Text>{quotation.terms_conditions}</Text>
                                </Stack>
                            )}
                        </Stack>
                    </>
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={onClose}>
                        Close
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}