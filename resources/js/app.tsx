import '../css/app.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.layer.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.layer.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const queryClient = new QueryClient()
        root.render(
            <MantineProvider>
                <QueryClientProvider client={queryClient}>
                    <App {...props} />
                </QueryClientProvider>
                <Notifications />
            </MantineProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
