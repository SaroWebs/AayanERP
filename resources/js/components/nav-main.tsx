import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // Check if a menu item or its children should be active
    const isItemActive = (item: NavItem): boolean => {
        if (page.url.startsWith(item.href)) {
            return true;
        }
        if (item.children) {
            return item.children.some(child => page.url.startsWith(child.href));
        }
        return false;
    };

    // Initialize open menus based on current URL
    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {};
        items.forEach(item => {
            if (item.children && isItemActive(item)) {
                initialOpenState[item.title] = true;
            }
        });
        setOpenMenus(initialOpenState);
    }, [page.url]);

    const toggleMenu = (title: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const renderNavItem = (item: NavItem) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const isOpen = openMenus[item.title];
        const isActive = isItemActive(item);

        return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                    asChild={!hasChildren}
                    isActive={isActive}
                    tooltip={{ children: item.title }}
                    onClick={hasChildren ? () => toggleMenu(item.title) : undefined}
                >
                    {hasChildren ? (
                        <button className="flex w-full items-center justify-between">
                            <div className="flex items-center">
                                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                <span>{item.title}</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                    ) : (
                        <Link href={item.href} prefetch>
                            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                            <span>{item.title}</span>
                        </Link>
                    )}
                </SidebarMenuButton>
                {hasChildren && isOpen && item.children && (
                    <ul className="ml-4 mt-1 space-y-1">
                        {item.children.map(child => (
                            <SidebarMenuItem key={child.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(child.href)}
                                    tooltip={{ children: child.title }}
                                >
                                    <Link href={child.href} prefetch>
                                        {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </ul>
                )}
            </SidebarMenuItem>
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel></SidebarGroupLabel>
            <SidebarMenu>
                {items.map(renderNavItem)}
            </SidebarMenu>
        </SidebarGroup>
    );
}
