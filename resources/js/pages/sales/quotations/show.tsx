import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { PageProps } from "@/types";
import { Quotation } from "@/types/sales";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { 
    Loader, 
    Center, 
    Stack, 
    Group, 
    Text, 
    Badge, 
    Divider, 
    Grid, 
    Paper, 
    Table, 
    Button, 
    ActionIcon,
    Container,
    Box,
    Title,
    Card,
    Flex,
    Avatar,
    ThemeIcon,
    Alert,
    RingProgress,
    Progress
} from "@mantine/core";
import { 
    Printer, 
    Download, 
    Mail, 
    FileText,
    Calendar,
    User,
    Building2,
    DollarSign,
    Calculator,
    StickyNote,
    Info,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { getApprovalStatusColor, getStatusColor } from "./columns";
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';

interface Props extends PageProps {
    quotation: Quotation;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Quotations",
        href: "/sales/quotations",
    },
    {
        title: "Quotation Details",
        href: `/sales/quotations/${typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''}`,
    },
];

export default function Show({ quotation }: Props) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, [quotation])

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Implement PDF download functionality
        console.log('Download PDF');
    };

    const handleEmail = () => {
        // Implement email functionality
        console.log('Send email');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quotation - ${quotation.quotation_no}`} />
            {loading ? (
                <Center py="xl">
                    <Loader size="lg" />
                </Center>
            ) : (
                <Container size="xl" py="md">
                    {/* Header Actions */}
                    <Card withBorder mb="lg" p="md">
                        <Flex justify="space-between" align="center">
                            <Stack gap={4}>
                                <Title order={2} size="h3">Quotation #{quotation.quotation_no}</Title>
                                <Text size="sm" c="dimmed">
                                    Generated on {format(new Date(quotation.created_at), 'dd MMMM yyyy')}
                                </Text>
                            </Stack>
                            <Group>
                                <Button 
                                    leftSection={<Printer size={16} />}
                                    variant="light"
                                    onClick={handlePrint}
                                >
                                    Print
                                </Button>
                                <Button 
                                    leftSection={<Download size={16} />}
                                    variant="light"
                                    onClick={handleDownload}
                                >
                                    Download PDF
                                </Button>
                                <Button 
                                    leftSection={<Mail size={16} />}
                                    variant="light"
                                    onClick={handleEmail}
                                >
                                    Send Email
                                </Button>
                            </Group>
                        </Flex>
                    </Card>

                    {/* Company Header */}
                    <Card withBorder mb="lg" p="xl">
                        <Grid>
                            <Grid.Col span={8}>
                                <Stack gap="xs">
                                    <Group align="center" gap="sm">
                                        <Avatar size="lg" color="blue" radius="sm">
                                            <Building2 size={24} />
                                        </Avatar>
                                        <div>
                                            <Title order={3} size="h4">Aayan Group</Title>
                                            <Text size="sm" c="dimmed">Your Trusted Business Partner</Text>
                                        </div>
                                    </Group>
                                    <Text size="sm">
                                        123 Business Street, Industrial Area<br />
                                        City, State 12345<br />
                                        Phone: +1 (555) 123-4567 | Email: info@aayangroup.com
                                    </Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Stack gap="md" align="flex-end">
                                    <Box>
                                        <Text size="sm" c="dimmed" ta="right" mb={8}>Quotation Status</Text>
                                        <Badge 
                                            size="lg" 
                                            color={getStatusColor(quotation.status)}
                                            variant="filled"
                                            radius="md"
                                        >
                                            {quotation.status.replace('_', ' ').charAt(0).toUpperCase() +
                                                quotation.status.replace('_', ' ').slice(1)}
                                        </Badge>
                                    </Box>
                                    <Box>
                                        <Text size="sm" c="dimmed" ta="right" mb={8}>Approval Status</Text>
                                        <Badge 
                                            size="lg" 
                                            color={getApprovalStatusColor(quotation.approval_status)}
                                            variant="filled"
                                            radius="md"
                                        >
                                            {quotation.approval_status.replace('_', ' ').charAt(0).toUpperCase() +
                                                quotation.approval_status.replace('_', ' ').slice(1)}
                                        </Badge>
                                    </Box>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Card>

                    {/* Summary Metrics */}
                    <Grid mb="lg">
                        <Grid.Col span={3}>
                            <Card withBorder p="md" ta="center">
                                <Stack gap="xs">
                                    <ThemeIcon size="lg" variant="light" color="blue" mx="auto">
                                        <FileText size={20} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">Total Items</Text>
                                    <Text size="xl" fw={700} c="blue">
                                        {quotation.items?.length || 0}
                                    </Text>
                                </Stack>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Card withBorder p="md" ta="center">
                                <Stack gap="xs">
                                    <ThemeIcon size="lg" variant="light" color="green" mx="auto">
                                        <DollarSign size={20} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">Total Amount</Text>
                                    <Text size="xl" fw={700} c="green">
                                        {quotation.currency} {formatCurrency(quotation.total_amount)}
                                    </Text>
                                </Stack>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Card withBorder p="md" ta="center">
                                <Stack gap="xs">
                                    <ThemeIcon size="lg" variant="light" color="orange" mx="auto">
                                        <Calendar size={20} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">Quotation Date</Text>
                                    <Text size="lg" fw={600}>
                                        {format(new Date(quotation.quotation_date), 'dd MMM yyyy')}
                                    </Text>
                                </Stack>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Card withBorder p="md" ta="center">
                                <Stack gap="xs">
                                    <ThemeIcon size="lg" variant="light" color="red" mx="auto">
                                        <Calendar size={20} />
                                    </ThemeIcon>
                                    <Text size="sm" c="dimmed">Valid Until</Text>
                                    <Text size="lg" fw={600}>
                                        {quotation.valid_until 
                                            ? format(new Date(quotation.valid_until), 'dd MMM yyyy')
                                            : 'N/A'
                                        }
                                    </Text>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>

                    {/* Status Alert */}
                    <Alert 
                        icon={<Info size={16} />} 
                        title="Quotation Information" 
                        color="blue" 
                        variant="light"
                        mb="lg"
                    >
                        This quotation is valid until {quotation.valid_until 
                            ? format(new Date(quotation.valid_until), 'dd MMMM yyyy')
                            : 'further notice'
                        }. Please review all terms and conditions before proceeding.
                    </Alert>

                    {/* Client Information */}
                    <Card withBorder mb="lg" p="xl">
                        <Title order={4} mb="md" size="h5">
                            <User size={20} style={{ marginRight: 8 }} />
                            Client Information
                        </Title>
                        <Grid>
                            <Grid.Col span={6}>
                                <Stack gap="md">
                                    <Box>
                                        <Text size="sm" c="dimmed" mb={4}>Client Name</Text>
                                        <Text fw={600} size="lg">{quotation.client?.name}</Text>
                                    </Box>
                                    {quotation.contact_person && (
                                        <Box>
                                            <Text size="sm" c="dimmed" mb={4}>Contact Person</Text>
                                            <Text fw={500}>{quotation.contact_person.contact_person}</Text>
                                            {quotation.contact_person.email && (
                                                <Text size="sm" c="dimmed">{quotation.contact_person.email}</Text>
                                            )}
                                            {quotation.contact_person.phone && (
                                                <Text size="sm" c="dimmed">{quotation.contact_person.phone}</Text>
                                            )}
                                        </Box>
                                    )}
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Stack gap="md">
                                    <Box>
                                        <Text size="sm" c="dimmed" mb={4}>Quotation Date</Text>
                                        <Group gap="xs">
                                            <ThemeIcon size="sm" variant="light" color="blue">
                                                <Calendar size={14} />
                                            </ThemeIcon>
                                            <Text fw={500}>{format(new Date(quotation.quotation_date), 'dd MMMM yyyy')}</Text>
                                        </Group>
                                    </Box>
                                    <Box>
                                        <Text size="sm" c="dimmed" mb={4}>Valid Until</Text>
                                        <Group gap="xs">
                                            <ThemeIcon size="sm" variant="light" color="green">
                                                <Calendar size={14} />
                                            </ThemeIcon>
                                            <Text fw={500}>
                                                {quotation.valid_until 
                                                    ? format(new Date(quotation.valid_until), 'dd MMMM yyyy')
                                                    : 'Not specified'
                                                }
                                            </Text>
                                        </Group>
                                    </Box>
                                    <Box>
                                        <Text size="sm" c="dimmed" mb={4}>Currency</Text>
                                        <Group gap="xs">
                                            <ThemeIcon size="sm" variant="light" color="yellow">
                                                <DollarSign size={14} />
                                            </ThemeIcon>
                                            <Text fw={500}>{quotation.currency}</Text>
                                        </Group>
                                    </Box>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Card>

                    {/* Items Table */}
                    {quotation.items && quotation.items.length > 0 && (
                        <Card withBorder mb="lg" p="xl">
                            <Title order={4} mb="md" size="h5">
                                <FileText size={20} style={{ marginRight: 8 }} />
                                Quotation Items
                            </Title>
                            <Paper withBorder>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Item</Table.Th>
                                            <Table.Th>Quantity</Table.Th>
                                            <Table.Th>Unit Price</Table.Th>
                                            <Table.Th>Total Price</Table.Th>
                                            <Table.Th>Notes</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {quotation.items.map((item, index) => (
                                            <Table.Tr key={index}>
                                                <Table.Td>
                                                    <Stack gap={4}>
                                                        <Text fw={600}>{item.item?.name || item.item_id}</Text>
                                                        {item.item?.description && (
                                                            <Text size="sm" c="dimmed">{item.item.description}</Text>
                                                        )}
                                                    </Stack>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge variant="light" size="sm">
                                                        {item.quantity}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text fw={500}>
                                                        {quotation.currency} {formatCurrency(item.unit_price)}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text fw={600} c="blue">
                                                        {quotation.currency} {formatCurrency(item.total_price)}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    {item.notes ? (
                                                        <Text size="sm" c="dimmed" style={{ maxWidth: 200 }}>
                                                            {item.notes}
                                                        </Text>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">-</Text>
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Paper>
                        </Card>
                    )}

                    {/* Financial Summary */}
                    <Card withBorder mb="lg" p="xl">
                        <Title order={4} mb="md" size="h5">
                            <Calculator size={20} style={{ marginRight: 8 }} />
                            Financial Summary
                        </Title>
                        <Grid>
                            <Grid.Col span={8}>
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Text size="lg">Subtotal</Text>
                                        <Text size="lg" fw={500}>
                                            {quotation.currency} {formatCurrency(quotation.subtotal)}
                                        </Text>
                                    </Group>
                                    
                                    {quotation.tax_amount > 0 && (
                                        <Group justify="space-between">
                                            <Text size="lg">Tax ({quotation.tax_percentage}%)</Text>
                                            <Text size="lg" fw={500}>
                                                {quotation.currency} {formatCurrency(quotation.tax_amount)}
                                            </Text>
                                        </Group>
                                    )}
                                    
                                    {(quotation.discount_amount ?? 0) > 0 && (
                                        <Group justify="space-between">
                                            <Text size="lg" c="green">Discount ({quotation.discount_percentage ?? 0}%)</Text>
                                            <Text size="lg" fw={500} c="green">
                                                - {quotation.currency} {formatCurrency(quotation.discount_amount ?? 0)}
                                            </Text>
                                        </Group>
                                    )}
                                    
                                    <Divider />
                                    
                                    <Group justify="space-between">
                                        <Text size="xl" fw={700}>Total Amount</Text>
                                        <Text size="xl" fw={700} c="blue">
                                            {quotation.currency} {formatCurrency(quotation.total_amount)}
                                        </Text>
                                    </Group>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Card withBorder p="md" bg="gray.0">
                                    <Stack gap="xs">
                                        <Text size="sm" c="dimmed">Payment Terms</Text>
                                        <Text size="sm" fw={500}>
                                            {quotation.payment_terms || 'Standard terms apply'}
                                        </Text>
                                        
                                        <Text size="sm" c="dimmed" mt="md">Delivery Terms</Text>
                                        <Text size="sm" fw={500}>
                                            {quotation.delivery_terms || 'Standard delivery'}
                                        </Text>
                                    </Stack>
                                </Card>
                            </Grid.Col>
                        </Grid>
                    </Card>

                    {/* Terms and Conditions */}
                    {(quotation.special_conditions || quotation.terms_conditions) && (
                        <Card withBorder mb="lg" p="xl">
                            <Title order={4} mb="md" size="h5">
                                <StickyNote size={20} style={{ marginRight: 8 }} />
                                Terms & Conditions
                            </Title>
                            <Stack gap="lg">
                                {quotation.special_conditions && (
                                    <Box>
                                        <Text size="sm" c="dimmed" mb={8}>Special Conditions</Text>
                                        <Text style={{ whiteSpace: 'pre-line' }}>
                                            {quotation.special_conditions}
                                        </Text>
                                    </Box>
                                )}
                                {quotation.terms_conditions && (
                                    <Box>
                                        <Text size="sm" c="dimmed" mb={8}>General Terms & Conditions</Text>
                                        <Text style={{ whiteSpace: 'pre-line' }}>
                                            {quotation.terms_conditions}
                                        </Text>
                                    </Box>
                                )}
                            </Stack>
                        </Card>
                    )}

                    {/* Footer */}
                    <Card withBorder p="xl" bg="gray.0">
                        <Stack gap="md" align="center">
                            <Text size="sm" c="dimmed" ta="center">
                                Thank you for your business. We look forward to working with you.
                            </Text>
                            <Text size="xs" c="dimmed" ta="center">
                                This quotation is valid until {quotation.valid_until 
                                    ? format(new Date(quotation.valid_until), 'dd MMMM yyyy')
                                    : 'further notice'
                                }
                            </Text>
                        </Stack>
                    </Card>
                </Container>
            )}
        </AppLayout>
    );
}