'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      router.push('/admin/dashboard');
    }, 600);
  };

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body-md antialiased p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/30 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center mx-auto shadow-md font-bold text-lg">
            M
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-surface-container px-2.5 py-0.5 rounded-full">
            ₹0 Free Tier Platform
          </span>
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-xs"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-xs"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-xs"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-error text-center font-medium bg-error-container/20 py-2 rounded-lg">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <span>Creating Account...</span> : <span>Register &amp; Create Vault</span>}
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

