import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { PageProps } from "@/types";
import { Quotation } from "@/types/quotation";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { ViewItem } from "./partials/ViewItem";
import { Loader, Center } from "@mantine/core";
import axios from "axios";
import { ClientDetail } from "@/types/client";

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
    const [clients, setClients] = useState<ClientDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClients = async () => {
            setLoading(true);
            try {
                const response = await axios.get("/data/clients/all");
                setClients(response.data);
            } catch (error) {
                setClients([]);
            } finally {
                setLoading(false);
            }
        };
        loadClients();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={quotation.quotation_no} />
            {loading ? (
                <Center py="xl">
                    <Loader size="lg" />
                </Center>
            ) : (
                <ViewItem
                    quotation={quotation}
                    clients={clients}
                    loading={loading}
                />
            )}
        </AppLayout>
    );
}