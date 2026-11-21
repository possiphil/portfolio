import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Outfit, Syne } from 'next/font/google';
import { profile } from '@/content/site';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['500', '600', '700'], display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || profile.siteUrl),
  icons: { icon: '/favicon.svg' },
  openGraph: { images: ['/social-card.jpg'], type: 'website' },
};

export const viewport: Viewport = {
  themeColor: '#0c0a08',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} ${jetbrains.variable} dark`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
