import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
interface Props {
    employees: PaginatedData<any>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/hr/employees',
    },
];
const index = (props: Props) => {
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Employees" />
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            Employees
        </div>
    </AppLayout>
    );
}

export default index