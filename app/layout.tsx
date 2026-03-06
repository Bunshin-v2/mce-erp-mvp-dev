
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Inter, JetBrains_Mono, Oswald } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './style-v1.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Morgan ERP • Financial Command',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_DISABLE_AUTH: process.env.NEXT_PUBLIC_DISABLE_AUTH,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };

  return (
    <html lang="en" suppressHydrationWarning={true} className={`${inter.variable} ${jetbrainsMono.variable} ${oswald.variable} font-sans antialiased bg-base text-default selection:bg-brand-500/30`}>
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `(function () {
  const setInitialTheme = () => {
    const savedConfig = localStorage.getItem('mce-style-config');
    let theme = 'light'; // Default to light mode for now

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig.theme) {
          theme = parsedConfig.theme;
        }
      } catch (e) {
        console.error("Failed to parse mce-style-config from localStorage", e);
      }
    }

    if (theme === 'system') {
      document.documentElement.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      document.documentElement.dataset.theme = theme;
    }
  };

  setInitialTheme();
})();`
          }}
        />
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV=${JSON.stringify(publicEnv)};`,
          }}
        />
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
