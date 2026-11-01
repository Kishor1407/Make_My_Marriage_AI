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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@200..800&family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Inter:wght@100..900&display=swap"
        />
      </head>
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
