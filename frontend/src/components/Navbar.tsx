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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');

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

  // Hide the global navbar on the admin dashboard since it has its own bespoke luxury dual-tab workspace
  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  // Handle Exit / Switch Role: Return to Gateway
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

  const handleScanQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      router.push(`/marriage/${qrCodeInput.trim().toLowerCase()}`);
      setIsQrModalOpen(false);
    }
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

          {/* Center: Simplified Navigation (NO CLUTTER) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {isAdmin ? (
              /* Admin Dual-View Switch Tabs */
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                <Link
                  href="/admin/dashboard"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-black text-white shadow-xs flex items-center gap-1.5"
                >
                  <AppIcon name="admin_panel_settings" size={15} />
                  <span>Dashboard &amp; Marriages</span>
                </Link>
                <Link
                  href="/marriage/rajsim24"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <AppIcon name="visibility" size={15} className="text-[#c81e38]" />
                  <span>Live Guest View</span>
                </Link>
              </div>
            ) : (
              /* Guest Navigation: Only Celebrations Anchor */
              <Link
                href="/"
                className="relative flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0C] hover:text-[#c81e38] transition-colors"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c81e38] animate-pulse"></span>
                <span>Celebrations</span>
              </Link>
            )}
          </nav>

          {/* Right Corner: Role Status Pill & Action */}
          <div className="flex items-center gap-2.5">
            {/* Quick Standee QR Scanner */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 border border-neutral-200 transition-colors shadow-2xs"
              title="Enter wedding passcode or scan banquet table standee"
            >
              <AppIcon name="qr_code_scanner" size={15} className="text-[#c81e38]" />
              <span>Table Standee</span>
            </button>

            {isAdmin ? (
              /* Admin Identity & Logout */
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-bold text-[#0A0A0C]">
                  <span className="w-2 h-2 rounded-full bg-[#c81e38]"></span>
                  <span>Master Admin</span>
                </div>
                <button
                  onClick={handleExitRole}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs"
                  title="Logout and return to Gateway"
                >
                  <AppIcon name="logout" size={14} />
                  <span>Exit to Gateway</span>
                </button>
              </div>
            ) : isGuest ? (
              /* Guest Identity & Exit / Switch Role Button (STRICTLY NO ADMIN LINK) */
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800">
                  <span className="w-2 h-2 rounded-full bg-[#c81e38] animate-pulse"></span>
                  <span className="font-semibold text-neutral-600 hidden md:inline">Guest:</span>
                  <span className="font-bold text-[#0A0A0C] truncate max-w-[120px]">{guestDisplayName}</span>
                </div>
                <button
                  onClick={handleExitRole}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 hover:text-black border border-neutral-200 text-xs font-semibold transition-all shadow-2xs"
                  title="Return to Login Gateway to change role or enter as host"
                >
                  <AppIcon name="sync_alt" size={14} className="text-[#c81e38]" />
                  <span className="hidden sm:inline">Exit / Switch Role</span>
                  <span className="sm:hidden">Exit</span>
                </button>
              </div>
            ) : (
              /* Unauthenticated Visitor */
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>Enter Celebrations</span>
                <span>🌸</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Standee QR Access Passcode Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 text-[#0A0A0C]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AppIcon name="qr_code_scanner" size={20} className="text-[#c81e38]" />
                <h3 className="font-editorial font-bold text-base">Banquet Standee Sync</h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-black"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Enter the 8-character passcode printed on your Banquet Table Acrylic Standee:
            </p>
            <form onSubmit={handleScanQr} className="space-y-4">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. RAJSIM24"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value.toUpperCase())}
                className="w-full h-12 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-center text-base font-bold tracking-widest uppercase focus:outline-none focus:border-[#c81e38] focus:bg-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-sm"
                >
                  Enter Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
