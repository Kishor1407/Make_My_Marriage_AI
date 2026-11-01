'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <footer className="border-t border-neutral-200 bg-[#FAFAFA] py-8 mt-auto text-xs text-neutral-500">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold text-neutral-900 font-editorial text-sm">
          <span>Make My Marriage</span>
          <span className="text-[10px] uppercase font-bold text-[#C81E38] bg-[#C81E38]/10 px-2.5 py-0.5 rounded-full border border-[#C81E38]/20 font-sans tracking-wider">
            Pure White & Crimson Edition
          </span>
        </div>
        <p className="text-center sm:text-right text-neutral-500">
          Engineered for ₹0 Cloud Cost • Next.js (Vercel) • Node.js (Render) • MongoDB Atlas GridFS
        </p>
      </div>
    </footer>
  );
}
