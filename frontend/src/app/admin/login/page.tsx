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
        setSuccessMsg('Signed in successfully! Launching host portal...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 800);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body-md antialiased p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/30 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center mx-auto shadow-md font-bold text-lg group-hover:scale-105 transition-transform">
              M
            </div>
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-surface-container px-2.5 py-0.5 rounded-full">
              Host &amp; Planner Access
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface">
            Admin Portal Login
          </h1>
          <p className="text-xs text-on-surface-variant">
            Sign in to manage itineraries, view real-time metrics, and curate media.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
              Host Email Address
            </label>
            <input
              required
              type="email"
              placeholder="e.g. host@makemymarriage.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-xs transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-error text-center font-medium bg-error/10 border border-error/20 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 text-center font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Access Host Portal</span>
                <span className="material-symbols-outlined text-[16px]">login</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <span>Need to host a wedding? </span>
          <Link href="/admin/register" className="text-primary font-semibold hover:underline">
            Register as Host
          </Link>
        </div>
      </div>
    </div>
  );
}
