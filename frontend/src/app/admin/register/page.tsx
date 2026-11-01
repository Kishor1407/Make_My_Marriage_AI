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
        setSuccessMsg('Account registered in MongoDB Atlas! Redirecting to studio...');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 800);
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#0A0A0C] font-sans antialiased p-4 sm:p-6 flex items-center justify-center selection:bg-[#C81E38] selection:text-white relative overflow-hidden">
      {/* Decorative ambient crimson blurs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C81E38]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#C81E38]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-6 sm:p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <div className="w-12 h-12 rounded-2xl bg-[#C81E38] text-white flex items-center justify-center mx-auto shadow-md shadow-[#C81E38]/25 font-editorial font-bold text-xl group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">diamond</span>
            </div>
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C81E38] bg-[#C81E38]/10 px-3 py-1 rounded-full border border-[#C81E38]/20">
              Host OS Concierge
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0A0A0C] tracking-tight">
            Create Host Account
          </h1>
          <p className="text-xs text-neutral-500">
            Register to architect and host bespoke luxury wedding vaults with zero server bills.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#C81E38] focus:bg-white outline-none text-xs text-[#0A0A0C] placeholder:text-neutral-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Host Email Address
            </label>
            <input
              required
              type="email"
              placeholder="e.g. host@makemymarriage.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#C81E38] focus:bg-white outline-none text-xs text-[#0A0A0C] placeholder:text-neutral-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="•••••••• (Min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#C81E38] focus:bg-white outline-none text-xs text-[#0A0A0C] placeholder:text-neutral-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-[#C81E38] focus:bg-white outline-none text-xs text-[#0A0A0C] placeholder:text-neutral-400 transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#C81E38]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C81E38]/20 transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Creating Account in Atlas...</span>
              </>
            ) : (
              <span>Create Host Account</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100">
          Already have an account?{' '}
          <Link href="/admin/login" className="text-[#C81E38] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
