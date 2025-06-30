import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useAppearance, Appearance } from '@/hooks/use-appearance';
import { Sun, Moon, Monitor } from 'lucide-react';

const themeIcons: { value: Appearance; Icon: any; label: string }[] = [
    { value: 'light', Icon: Sun, label: 'Light mode' },
    { value: 'dark', Icon: Moon, label: 'Dark mode' },
    { value: 'system', Icon: Monitor, label: 'System mode' },
];

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { appearance, updateAppearance } = useAppearance();
    const iconBase =
        'h-5 w-5 cursor-pointer transition-colors duration-200';
    const activeColor =
        'text-yellow-400 dark:text-lime-300'; // yellow-green mix for dark
    const inactiveColor =
        'text-neutral-400 hover:text-yellow-400 dark:text-neutral-500 dark:hover:text-lime-300';

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div
                className="relative ml-auto flex items-center group"
                tabIndex={0}
                aria-label="Theme switcher"
            >
                <div
                    className="flex items-center justify-end overflow-hidden transition-all duration-300 ease-in-out bg-transparent rounded-md group-hover:bg-neutral-100/60 dark:group-hover:bg-neutral-800/60"
                    style={{ width: 40 + (themeIcons.length - 1) * 40 + 'px' }} // max width for all icons
                >
                    {themeIcons.map(({ value, Icon, label }, idx) => {
                        const isActive = appearance === value;
                        return (
                            <button
                                key={value}
                                onClick={() => updateAppearance(value)}
                                aria-label={label}
                                className={`flex items-center justify-center h-10 w-10 transition-all duration-300 ease-in-out
                                    ${isActive ? 'z-10' : 'z-0'}
                                    ${isActive ? activeColor : inactiveColor}
                                    ${isActive ? '' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}
                                    group-hover:ml-0 ml-[-40px] first:ml-0
                                `}
                                tabIndex={isActive ? 0 : -1}
                                style={{
                                    transitionProperty: 'opacity, margin',
                                }}
                            >
                                <Icon className={iconBase} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
