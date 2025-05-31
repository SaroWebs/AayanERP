import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Globe, LayoutGrid, TruckIcon, Users, ShoppingCart, UserCircle, FileText, Receipt, Package, Wallet, CogIcon, ShieldIcon, User2, Wrench, Layers, Boxes, ListTree } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Equipment',
        href: '#',
        icon: Wrench,
        children: [
            {
                title: 'Category Types',
                href: route('equipment.category-types.index'),
                icon: ListTree,
            },
            {
                title: 'Categories',
                href: route('equipment.categories.index'),
                icon: Layers,
            },
            {
                title: 'Equipment Series',
                href: route('equipment.series.index'),
                icon: Boxes,
            },
            {
                title: 'Equipment',
                href: route('equipment.equipment.index'),
                icon: TruckIcon,
            },
            {
                title: 'Items',
                href: route('equipment.items.index'),
                icon: Package,
            },
        ],
    },
    {
        title: 'Master',
        href: '#',
        icon: LayoutGrid,
        children:[
            {
                title: 'Vendors',
                href: '/master/vendors',
                icon: TruckIcon,
            },
            {
                title: 'Clients',
                href: '/master/clients',
                icon: UserCircle,
            },
        ]
    },
    {
        title: 'Sales',
        href: '#',
        icon: ShoppingCart,
        children: [
            {
                title: 'Enquiry',
                href: '/sales/enquiry',
                icon: FileText,
            },
            {
                title: 'Quotation',
                href: '/sales/quotation',
                icon: Receipt,
            },
            {
                title: 'Billing',
                href: '/sales/billing',
                icon: ShoppingCart,
            },
            {
                title: 'Dispatch',
                href: '/sales/dispatch',
                icon: Package,
            },
            {
                title: 'Collection',
                href: '/sales/collection',
                icon: Wallet,
            },
        ],
    },
    {
        title: 'Purchase',
        href: '#',
        icon: Receipt,
        children: [
            {
                title: 'Intend & PO',
                href: '/purchase/intend-and-po',
                icon: FileText,
            },
            {
                title: 'Aproval & Receive',
                href: '/purchase/aproval-and-receive',
                icon: FileText,
            }
        ],
    },
    {
        title: 'HR',
        href: '#',
        icon: User2,
        children: [
            {
                title: 'Employees',
                href: '/hr/employees',
                icon: Users,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Configuration',
        href: '#',
        icon: CogIcon,
        children: [
            {
                title: 'Roles & permissions',
                href: '/configuration/roles',
                icon: ShieldIcon,
            },
            {
                title: 'Users',
                href: '/configuration/users',
                icon: UserCircle,
            },
        ],
    },
    {
        title: 'Browse website',
        href: 'http://aayangroup.in/',
        icon: Globe,
        target: '_blank',
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
