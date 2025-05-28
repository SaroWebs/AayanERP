import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react'
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

type Props = {}


interface Client {
  id: number;
  // fill the remaining
  created_at: string | null;
  updated_at: string | null;
}

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


const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Clients',
    href: '/master/clients',
  },
];

const index = (props: Props) => {
  const [clients, setClients] = useState<PaginatedData<Client>>();

  const loadClientDetails = () => {
    axios.get('/data/clients')
      .then(res => {
        setClients(res.data);
        notifications.show({
          title: 'Success',
          message: 'Clients data loaded successfully',
          color: 'green',
        });
      })
      .catch(err => {
        console.log(err);
        notifications.show({
          title: 'Error loading clients',
          message: 'Failed to load clients data',
          color: 'red',
        });
      });
  }

  useEffect(() => {
    loadClientDetails();
  }, [])
  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Clients" />
      {/*  */}
    </AppLayout>
  )
}

export default index