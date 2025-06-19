import { Home, Package, ShoppingCart, ShoppingBag, Warehouse, Settings } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { User } from '@/types/user';

export interface NavItem {
    title: string;
    href: string;
    target?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export const defaultNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home
    },
    {
        title: 'Products',
        href: '/equipment',
        icon: Package,
        children: [
            {
                title: 'All Products',
                href: '/equipment/items'
            },
            {
                title: 'Categories',
                href: '/equipment/categories'
            },
            {
                title: 'Basic Bricks',
                href: '/equipment/categories/basic-bricks'
            },
            {
                title: 'Dense Fire Bricks',
                href: '/equipment/categories/dense-fire-bricks'
            },
            {
                title: 'High Alumina Bricks',
                href: '/equipment/categories/high-alumina-bricks'
            },
            {
                title: 'Special Quality Bricks',
                href: '/equipment/categories/special-quality-bricks'
            },
            {
                title: 'Castables & Mortars',
                href: '/equipment/categories/castables-mortars'
            },
            {
                title: 'Insulation Products',
                href: '/equipment/categories/insulation-products'
            },
            {
                title: 'Flow Control Products',
                href: '/equipment/categories/flow-control-products'
            },
            {
                title: 'Ceramic Products',
                href: '/equipment/categories/ceramic-products'
            }
        ]
    },
    {
        title: 'Sales',
        href: '/sales',
        icon: ShoppingCart,
        children: [
            {
                title: 'Orders',
                href: '/sales/orders'
            },
            {
                title: 'Quotations',
                href: '/sales/quotations'
            },
            {
                title: 'Technical Support',
                href: '/sales/technical-support'
            }
        ]
    },
    {
        title: 'Purchases',
        href: '/purchases',
        icon: ShoppingBag,
        children: [
            {
                title: 'Orders',
                href: '/purchases/orders'
            },
            {
                title: 'Suppliers',
                href: '/purchases/suppliers'
            },
            {
                title: 'Quality Control',
                href: '/purchases/quality-control'
            }
        ]
    },
    {
        title: 'Inventory',
        href: '/inventory',
        icon: Warehouse,
        children: [
            {
                title: 'Stock',
                href: '/inventory/stock'
            },
            {
                title: 'Quality Certificates',
                href: '/inventory/certificates'
            },
            {
                title: 'Batch Tracking',
                href: '/inventory/batch-tracking'
            }
        ]
    },
    {
        title: 'Configuration',
        href: '/configuration',
        icon: Settings,
        children: [
            {
                title: 'Product Specifications',
                href: '/configuration/specifications'
            },
            {
                title: 'Quality Parameters',
                href: '/configuration/quality-parameters'
            },
            {
                title: 'Certifications',
                href: '/configuration/certifications'
            }
        ]
    }
]; 

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: unknown;
}

export interface PaginatedData<T> {
    data: T[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface BadgeVariant {
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

