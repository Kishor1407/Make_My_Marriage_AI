'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import api from '@/lib/api';

export default function Navbar() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-zinc-900 tracking-tight">
              Make My Marriage
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              ₹0 Platform
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-700 hidden sm:inline">
                {user?.name} ({user?.role})
              </span>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className="text-xs sm:text-sm font-medium bg-rose-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-rose-700 transition"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 text-zinc-500 hover:text-rose-600 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/login"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-rose-300 transition"
              >
                <User className="w-4 h-4" />
                <span>Host Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

