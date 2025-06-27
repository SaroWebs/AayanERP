import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types/index.d';
import StatsCard from '@/components/widgets/dashboard/StatsCard';
import RecentActivities from '@/components/widgets/dashboard/RecentActivities';
import StockAlerts from '@/components/widgets/dashboard/StockAlerts';
import PendingApprovals from '@/components/widgets/dashboard/PendingApprovals';
import MonthlyChart from '@/components/widgets/dashboard/MonthlyChart';
import {
    Users,
    Building2,
    Truck,
    Wrench,
    Package,
    FileText,
    ShoppingCart,
    AlertTriangle,
    Clock,
    TrendingUp
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        employees: { total: number; active: number; new_this_month: number };
        clients: { total: number; active: number; new_this_month: number };
        vendors: { total: number; active: number; new_this_month: number };
        equipment: { total: number; active: number; maintenance_due: number };
        inventory: { total_items: number; low_stock: number; out_of_stock: number; total_value: number };
        sales: { enquiries: number; quotations: number; orders: number; pending_quotations: number };
        purchases: { intents: number; orders: number; pending_orders: number };
    };
    recentActivities: Array<{
        type: 'enquiry' | 'quotation' | 'stock_movement' | 'purchase_order';
        id: number;
        title: string;
        description: string;
        status: string;
        date: string;
        user: string;
    }>;
    stockAlerts: Array<{
        id: number;
        name: string;
        code: string;
        current_stock: number;
        minimum_stock: number;
        status: 'low_stock' | 'out_of_stock';
        category: string;
    }>;
    pendingApprovals: Array<{
        type: 'quotation' | 'purchase_order';
        id: number;
        title: string;
        description: string;
        status: string;
        date: string;
        user: string;
    }>;
    monthlyData: Array<{
        month: string;
        enquiries: number;
        quotations: number;
        orders: number;
        purchases: number;
    }>;
}

export default function Dashboard({
    stats,
    recentActivities,
    stockAlerts,
    pendingApprovals,
    monthlyData
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                        title="Total Employees"
                        value={stats.employees.total}
                        description={`${stats.employees.active} active, ${stats.employees.new_this_month} new this month`}
                        icon={Users}
                        color="blue"
                    />
                    <StatsCard
                        title="Total Clients"
                        value={stats.clients.total}
                        description={`${stats.clients.active} active, ${stats.clients.new_this_month} new this month`}
                        icon={Building2}
                        color="green"
                    />
                    <StatsCard
                        title="Total Vendors"
                        value={stats.vendors.total}
                        description={`${stats.vendors.active} active, ${stats.vendors.new_this_month} new this month`}
                        icon={Truck}
                        color="orange"
                    />
                </div>

                {/* Second Row Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Inventory Items"
                        value={stats.inventory.total_items}
                        description={`${stats.inventory.low_stock} low stock, ${stats.inventory.out_of_stock} out of stock`}
                        icon={Package}
                        color="red"
                    />
                    <StatsCard
                        title="Sales Enquiries"
                        value={stats.sales.enquiries}
                        description={`${stats.sales.quotations} quotations, ${stats.sales.pending_quotations} pending`}
                        icon={FileText}
                        color="orange"
                    />
                    <StatsCard
                        title="Sales Orders"
                        value={stats.sales.orders}
                        description="Total confirmed orders"
                        icon={ShoppingCart}
                        color="purple"
                    />
                    <StatsCard
                        title="Purchase Orders"
                        value={stats.purchases.orders}
                        description={`${stats.purchases.pending_orders} pending approval`}
                        icon={Truck}
                        color="green"
                    />
                </div>

                {/* Charts and Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Chart */}
                    <div className="lg:col-span-2">
                        <MonthlyChart data={monthlyData} />
                    </div>

                    {/* Recent Activities */}
                    <div>
                        <RecentActivities activities={recentActivities} />
                    </div>
                </div>

                {/* Alerts and Approvals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StockAlerts alerts={stockAlerts} />
                    <PendingApprovals approvals={pendingApprovals} />
                </div>
            </div>
        </AppLayout>
    );
}
