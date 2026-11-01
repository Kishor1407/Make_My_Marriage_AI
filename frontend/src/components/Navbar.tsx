'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import api from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  // Hide the global navbar on the admin dashboard since it has its own bespoke luxury sidebar
  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mmm_token');
    }
    dispatch(logout());
  };

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#c81e38] flex items-center justify-center text-white font-bold shadow-md shadow-[#c81e38]/20 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[19px]">diamond</span>
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-[16px] tracking-tight font-bold text-[#0a0a0c] leading-tight">
                  MAKE MY MARRIAGE
                </span>
                <span className="text-[9px] tracking-widest uppercase font-semibold text-[#c81e38]">
                  Luxury Wedding Cloud
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#c81e38]/10 text-[#c81e38] border border-[#c81e38]/30">
              Guest Access • ₹0 Cloud
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <Link
              href="/"
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors ${
                pathname === '/'
                  ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                  : 'font-medium text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Explore Marriages
            </Link>
            <Link
              href="/marriage/rahul24"
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors ${
                pathname?.startsWith('/marriage')
                  ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                  : 'font-medium text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Guest Experience
            </Link>
            <Link
              href="/guest/upload?code=RAHUL24"
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors ${
                pathname?.startsWith('/guest')
                  ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                  : 'font-medium text-neutral-600 hover:text-neutral-900'
              }`}
            >
              QR Photo Dump
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
            >
              Admin Portal
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 border border-neutral-200 transition-colors shadow-xs"
              title="Scan Table Standee QR Code"
            >
              <span className="material-symbols-outlined text-[16px] text-[#c81e38]">qr_code_scanner</span>
              <span className="hidden sm:inline">Scan Table QR</span>
            </button>

            {user?.role === 'ADMIN' ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-xs font-bold text-white shadow-sm transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-normal opacity-90">(Host)</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors border border-neutral-200"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Host Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Standee QR Scanner Modal */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xl relative text-[#0a0a0c]">
            <button
              onClick={() => setIsQrScannerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#c81e38]/10 text-[#c81e38] flex items-center justify-center border border-[#c81e38]/30">
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#0a0a0c]">Scan Dining Standee QR</h3>
                <p className="text-[11px] text-neutral-500">Position camera over your dining table standee card</p>
              </div>
            </div>

            <div className="relative aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden bg-neutral-900 border-2 border-[#c81e38]/60 flex items-center justify-center my-4 group shadow-inner">
              <div className="absolute inset-4 border border-dashed border-white/40 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#c81e38] to-transparent animate-pulse shadow-[0_0_12px_#c81e38]"></div>
              </div>
              <p className="text-xs text-white/60 text-center px-6">Camera Viewfinder Active<br /><span className="text-[10px] text-[#ffb3b3]">Hold steady over table QR code</span></p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-700">Or type 6-character Passcode manually:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  placeholder="e.g. RAHUL24"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value.toUpperCase())}
                  className="flex-1 h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-center text-sm font-bold tracking-widest text-[#0a0a0c] uppercase focus:outline-none focus:border-[#c81e38] focus:bg-white"
                />
                <Link
                  href={`/marriage/${scannedCode.toLowerCase() || 'rahul24'}`}
                  onClick={() => setIsQrScannerOpen(false)}
                  className="px-4 h-10 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold flex items-center justify-center transition-all shadow-sm"
                >
                  Unlock
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
