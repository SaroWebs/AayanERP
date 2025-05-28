import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react'
import React from 'react'

type Props = {}

const breadcrumbs: BreadcrumbItem[] = [
  {
      title: 'Clients',
      href: '/master/clients',
  },
];

const index = (props: Props) => {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
       <Head title="Clients" />
    </AppLayout>
  )
}

export default index