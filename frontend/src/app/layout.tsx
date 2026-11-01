import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WakingServerBanner from '@/components/WakingServerBanner';

export const metadata: Metadata = {
  title: 'Make My Marriage | Digital Wedding Companion & Media Sharing',
  description:
    'Free-tier digital wedding hub for families and guests. Timelines, live streams, and collaborative venue photo dumping via QR codes.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen antialiased selection:bg-rose-100 selection:text-rose-900">
        <Providers>
          <WakingServerBanner />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

