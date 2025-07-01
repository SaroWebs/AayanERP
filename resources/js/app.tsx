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
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const theme = createTheme({
    // TODO: Add theme here
    primaryColor: 'blue',
    primaryShade: 6,
    fontFamily: 'nunito, Inter, sans-serif',
    headings: {
        fontFamily: 'nunito, Inter, sans-serif',
    },
    components: {
        TextInput: {
            defaultProps: {
                classNames: {
                    input: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    label: 'dark:text-gray-100',
                },
            },
        },
        Textarea: {
            defaultProps: {
                classNames: {
                    input: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    label: 'dark:text-gray-100',
                },
            },
        },
        Button: {
            defaultProps: {
                className: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
            },
        },
        Select: {
            defaultProps: {
                classNames: {
                    input: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    label: 'dark:text-gray-100',
                },
            },
        },
    },
});


createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const queryClient = new QueryClient()
        root.render(
            <MantineProvider theme={theme}>
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
