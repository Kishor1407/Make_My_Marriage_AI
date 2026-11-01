'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // If on admin dashboard or guest upload, keep header minimal or hide
  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-colors duration-300">
      <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold">
              Make My Marriage
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-caption text-[11px] font-semibold">
            ₹0 Cloud
          </span>
        </div>

        {/* Main Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-lg font-label-md text-label-md transition-all ${
              pathname === '/'
                ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Explore Marriages
          </Link>

          <Link
            href="/marriage/rahul24"
            className={`px-3.5 py-2 rounded-lg font-label-md text-label-md transition-all ${
              pathname?.startsWith('/marriage')
                ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Guest Experience
          </Link>

          <Link
            href="/guest/upload?code=RAHUL24"
            className="px-3.5 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          >
            QR Photo Dump
          </Link>

          <Link
            href="/admin/dashboard"
            className="px-3.5 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          >
            Admin Portal
          </Link>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/guest/upload?code=RAHUL24"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">add_a_photo</span>
            <span className="hidden sm:inline">Upload Shot</span>
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-95 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Host Portal</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
