import React from 'react';
import type { Preview } from '@storybook/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { ToastProvider } from '../lib/toast-context';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { StyleProvider } from '../lib/StyleSystem';
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
        a11y: {
            test: 'todo'
        }
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
                <StyleProvider>
                    <ErrorBoundary>
                        <ToastProvider>
                            <div className="--font-inter var(--font-inter) --font-mono var(--font-mono) --font-oswald var(--font-oswald) font-sans antialiased bg-base text-primary min-h-screen p-4">
                                <style dangerouslySetInnerHTML={{ __html: `
                                    :root {
                                        --font-inter: 'Inter', system-ui, sans-serif;
                                        --font-mono: 'JetBrains Mono', monospace;
                                        --font-oswald: 'Oswald', sans-serif;
                                    }
                                `}} />
                                <Story />
                            </div>
                        </ToastProvider>
                    </ErrorBoundary>
                </StyleProvider>
            </QueryClientProvider>
        ),
    ],
};

export default preview;