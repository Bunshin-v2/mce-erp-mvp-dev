import React from 'react';
import type { Preview } from '@storybook/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { ToastProvider } from '../lib/toast-context';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../index.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            disable: true, // Let the theme-switcher handle backgrounds
        },
    },
    decorators: [
        withThemeByDataAttribute({
            themes: {
                light: 'light',
                dark: 'dark',
            },
            defaultTheme: 'light',
            attributeName: 'data-theme',
        }),
        (Story) => (
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <ToastProvider>
                        <div className="font-sans antialiased bg-base text-primary min-h-screen p-4">
                            <Story />
                        </div>
                    </ToastProvider>
                </ErrorBoundary>
            </QueryClientProvider>
        ),
    ],
};

export default preview;