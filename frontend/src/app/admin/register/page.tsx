'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import api from '@/lib/api';

export default function AdminRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/admin/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data?.user) {
        dispatch(setUser(response.data.user));
        if (response.data.token && typeof window !== 'undefined') {
          localStorage.setItem('mmm_token', response.data.token);
        }
        setSuccessMsg('Account created successfully! Redirecting to host dashboard...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
              ₹0 Free Tier Platform
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface">
            Create Host Account
          </h1>
          <p className="text-xs text-on-surface-variant">
            Set up digital companion dashboards and QR venue links for your weddings.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
              Host Full Name
            </label>
            <input
              required
              placeholder="e.g. Kishor Hegge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
              Email Address
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
              Password (Min 6 Characters)
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

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
              Confirm Password
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register &amp; Create Vault</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <span>Already have a host account? </span>
          <Link href="/admin/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
