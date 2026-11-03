'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [guestSession, setGuestSession] = useState<{ name: string; email: string; marriageCode?: string } | null>(null);

  // Rehydrate guest session from localStorage on mount & listen for storage events
  useEffect(() => {
    const updateSession = () => {
      if (typeof window !== 'undefined') {
        const storedGuest = localStorage.getItem('mmm_guest');
        if (storedGuest) {
          try {
            setGuestSession(JSON.parse(storedGuest));
          } catch {
            setGuestSession(null);
          }
        } else {
          setGuestSession(null);
        }
      }
    };

    updateSession();
    window.addEventListener('storage', updateSession);
    return () => window.removeEventListener('storage', updateSession);
  }, [pathname, user]);

  // Hide the global navbar on admin dashboard & marriage sanctuary since they have bespoke Stitch headers
  if (pathname?.startsWith('/admin/dashboard') || pathname?.startsWith('/marriage/')) {
    return null;
  }

  // Handle Exit / Logout
  const handleExitRole = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mmm_guest');
      localStorage.removeItem('mmm_token');
    }
    setGuestSession(null);
    dispatch(logout());
    router.push('/');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isGuest = !!guestSession || user?.role === 'GUEST';
  const guestDisplayName = guestSession?.name || user?.name || 'Honored Guest';

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Presentation */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#c81e38] flex items-center justify-center text-white font-bold shadow-md shadow-[#c81e38]/20 group-hover:scale-105 transition-transform">
                <AppIcon name="diamond" size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-[16px] tracking-tight font-bold text-[#0a0a0c] leading-tight">
                  MAKE MY MARRIAGE
                </span>
                <span className="text-[9px] tracking-widest uppercase font-semibold text-[#c81e38]">
                  {isAdmin ? 'Sovereign Admin Master' : 'Celebration Access'}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Simplified Clean Celebrations Anchor */}
          <nav className="flex items-center">
            <Link
              href="/"
              className="relative flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0C] hover:text-[#c81e38] transition-colors"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c81e38] animate-pulse"></span>
              <span>Celebrations</span>
            </Link>
          </nav>

          {/* Right Corner: Role Status Pill & Action */}
          <div className="flex items-center gap-2.5">
            {isAdmin ? (
              /* Admin Identity & Logout */
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-bold text-[#0A0A0C] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#c81e38]"></span>
                  <span>Master Admin</span>
                </Link>
                <button
                  onClick={handleExitRole}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Logout from Admin"
                >
                  <AppIcon name="logout" size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* Guest / Visitor View: Name pill + Host Admin Link (NO screen toggle) */
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800">
                  <span className="w-2 h-2 rounded-full bg-[#c81e38] animate-pulse"></span>
                  <span className="font-semibold text-neutral-600 hidden md:inline">Guest:</span>
                  <span className="font-bold text-[#0A0A0C] truncate max-w-[120px]">{guestDisplayName}</span>
                </div>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 hover:text-black border border-neutral-200 text-xs font-semibold transition-all shadow-2xs"
                  title="Host Admin Portal Sign In"
                >
                  <AppIcon name="admin_panel_settings" size={14} className="text-[#c81e38]" />
                  <span className="hidden sm:inline">Host Admin</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
