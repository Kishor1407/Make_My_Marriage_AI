'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [adminEmail, setAdminEmail] = useState('modi@makemymarriage.com');
  const [adminPassword, setAdminPassword] = useState('Password@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated as ADMIN, redirect to dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/auth/admin/login', {
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword
      });

      if (response.data?.user) {
        dispatch(setUser(response.data.user));
        if (response.data.token && typeof window !== 'undefined') {
          localStorage.setItem('mmm_token', response.data.token);
          localStorage.removeItem('mmm_guest');
        }
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#C81E38] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-[#C81E38] text-white flex items-center justify-center shadow-lg shadow-[#C81E38]/20 group-hover:scale-105 transition-transform">
            <AppIcon name="diamond" size={20} className="text-white" />
          </div>
          <span className="font-editorial text-2xl font-bold tracking-tight text-[#0A0A0C]">
            MAKE MY MARRIAGE
          </span>
        </Link>
        <span className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] text-[#C81E38] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Host Sovereign Administration
        </span>
        <h2 className="mt-3 text-2xl font-bold text-[#0A0A0C] font-editorial">
          Sign In to Master Vault
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Manage matrimonial ceremonies, live broadcasts &amp; archival ingress.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-neutral-200">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-[#C81E38]">
              <AppIcon name="error" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative flex items-center">
                <AppIcon name="mail" size={18} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="modi@makemymarriage.com"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-[#0A0A0C] font-semibold focus:bg-white focus:border-black outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Master Password
                </label>
                <span className="text-[10px] font-mono text-neutral-400">Default: Password@2026</span>
              </div>
              <div className="relative flex items-center">
                <AppIcon name="lock" size={18} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-[#0A0A0C] font-semibold focus:bg-white focus:border-black outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-neutral-400 hover:text-black cursor-pointer"
                >
                  <AppIcon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating Sovereign Vault...' : 'Sign In to Workspace'}</span>
                <span>👑</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <Link href="/" className="hover:text-black flex items-center gap-1 transition-colors">
              <AppIcon name="arrow_back" size={14} />
              <span>Back to Celebrations</span>
            </Link>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Zero-Cost Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
}
