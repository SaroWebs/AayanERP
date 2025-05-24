import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
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
                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                    onClick={hasChildren ? () => toggleMenu(item.title) : undefined}
                >
                    {hasChildren ? (
                        <button className="flex w-full items-center justify-between">
                            <div className="flex items-center">
                                {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                <span>{item.title}</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                    ) : (
                        <a href={item.href} target={item.target || "_self"} rel="noopener noreferrer">
                            {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                            <span>{item.title}</span>
                        </a>
                    )}
                </SidebarMenuButton>
                {hasChildren && isOpen && item.children && (
                    <ul className="ml-4 mt-1 space-y-1">
                        {item.children.map(child => (
                            <SidebarMenuItem key={child.title}>
                                <SidebarMenuButton
                                    asChild
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                >
                                    <a href={child.href} target={child.target || "_self"} rel="noopener noreferrer">
                                        {child.icon && <Icon iconNode={child.icon} className="h-5 w-5" />}
                                        <span>{child.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </ul>
                )}
            </SidebarMenuItem>
        );
    };

    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map(renderNavItem)}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
