'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import api from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/admin/login', {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data?.user) {
        dispatch(setUser(response.data.user));
        if (response.data.token && typeof window !== 'undefined') {
          localStorage.setItem('mmm_token', response.data.token);
        }
        setSuccessMsg('Authenticated! Entering luxury host concierge...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 600);
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Invalid credentials. Please verify your email and password.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0E0E10] min-h-screen text-[#F5F5F7] font-sans antialiased p-4 sm:p-6 flex items-center justify-center selection:bg-[#C81E38] selection:text-white">
      <div className="w-full max-w-md bg-[#18181A] rounded-3xl shadow-2xl border border-[#38373B]/50 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <div className="w-12 h-12 rounded-2xl bg-[#C81E38] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#C81E38]/30 font-editorial font-bold text-xl group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">diamond</span>
            </div>
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFB3B3] bg-[#C81E38]/20 px-3 py-1 rounded-full border border-[#C81E38]/40">
              Host OS Concierge
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Admin Portal Sign In
          </h1>
          <p className="text-xs text-[#B0AEB4]">
            Access your private wedding vaults, real-time live feeds, and guest media depositories.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
              Host Email Address
            </label>
            <input
              required
              type="email"
              placeholder="e.g. host@makemymarriage.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0C] border border-[#38373B]/60 focus:border-[#C81E38] outline-none text-xs text-white placeholder:text-[#B0AEB4]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0C] border border-[#38373B]/60 focus:border-[#C81E38] outline-none text-xs text-white placeholder:text-[#B0AEB4]/50 transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#C81E38]/15 border border-[#C81E38]/40 text-[#FFB3B3] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#C81E38]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C81E38]/30 transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Host Portal</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#B0AEB4] border-t border-[#38373B]/30 space-y-2">
          <p>
            Need a new Host account?{' '}
            <Link href="/admin/register" className="text-[#FFB3B3] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <div className="p-2.5 rounded-xl bg-[#0A0A0C] border border-white/5 text-[11px] text-[#B0AEB4]/80">
            <span className="text-white font-medium">Demo Host:</span> host@makemymarriage.com / WeddingHost2026!
          </div>
        </div>
      </div>
    </div>
  );
}
