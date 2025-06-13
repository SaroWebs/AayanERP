import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { User } from '@/types/user';

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

export interface NavItem {
    title: string;
    href: string;
    target?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
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

