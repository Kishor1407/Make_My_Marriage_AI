'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low/50 py-8 mt-auto text-xs text-on-surface-variant">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-headline-sm font-semibold text-on-surface">
          <span>Make My Marriage</span>
          <span className="text-[10px] uppercase font-bold text-primary bg-surface-container px-2 py-0.5 rounded-full">
            Coastal Editorial SaaS
          </span>
        </div>
        <p className="text-center sm:text-right text-on-surface-variant">
          Engineered for ₹0 Cloud Cost • Next.js (Vercel) • Node.js (Render) • MongoDB Atlas GridFS
        </p>
      </div>
    </footer>
  );
}
