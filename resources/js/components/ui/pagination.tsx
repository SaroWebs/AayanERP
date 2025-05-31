import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

export function Pagination({ links, className }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className={cn('flex items-center justify-center gap-1', className)}>
            {links.map((link, i) => {
                if (i === 0) {
                    return (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={cn(
                                'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                link.url
                                    ? 'hover:bg-accent hover:text-accent-foreground'
                                    : 'pointer-events-none opacity-50',
                                'border border-input bg-background'
                            )}
                            preserveScroll
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                        </Link>
                    );
                }

                if (i === links.length - 1) {
                    return (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={cn(
                                'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                                link.url
                                    ? 'hover:bg-accent hover:text-accent-foreground'
                                    : 'pointer-events-none opacity-50',
                                'border border-input bg-background'
                            )}
                            preserveScroll
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                            <span className="sr-only">Next</span>
                        </Link>
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url || '#'}
                        className={cn(
                            'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                            link.active
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                            !link.url && 'pointer-events-none opacity-50'
                        )}
                        preserveScroll
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
} 