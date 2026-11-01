'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function Navbar() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

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
            <div className="h-9 w-auto flex items-center">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1UfPBbeSlAkCyq5-pwjaoaiq0GGpx9YgfLpbzEKjeU8HM5Y8ehV4mZ3hN9b8oEQ7K_rcAQ-yO2uq1XaJmWEfZsBuvBQmnlaV_fWKmPNEQJUMZLB9gPtINBkxn6l9hgXAYhvkoQYLisIGb_HxY3VWLCXI3Yb92ApcvGN63zmWHogPr_d1hInLCR1Qrvwep7703oifn_jb6M_73mu021zIYharFGt6UjFTUm6eZTHNRL8"
                alt="Make My Marriage"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
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
            <span className="material-symbols-outlined text-[16px] text-primary">qr_code_scanner</span>
            <span className="hidden sm:inline">Scan Table QR</span>
          </Link>

          {user?.role === 'ADMIN' ? (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-95 shadow-sm transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <span>{user.name.split(' ')[0]} (Host)</span>
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-95 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">lock_person</span>
              <span>Planner Portal</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
