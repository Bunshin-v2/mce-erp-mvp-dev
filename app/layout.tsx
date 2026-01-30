
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Oswald, JetBrains_Mono } from 'next/font/google';
import './style-v1.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Morgan ERP • Financial Command',
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
    <html lang="en" className={`${oswald.variable} ${jetbrainsMono.variable}`} style={{ backgroundColor: '#050505' }}>
      <body className="antialiased" style={{ backgroundColor: '#050505', color: '#f5f5f7', minHeight: '100vh' }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV=${JSON.stringify(publicEnv)};`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
