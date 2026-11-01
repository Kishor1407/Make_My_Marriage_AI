'use client';

import React, { useEffect, useState } from 'react';
import { Lock, Heart, Calendar, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';

interface PublicMarriage {
  _id: string;
  partnerOneName: string;
  partnerTwoName: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [marriages, setMarriages] = useState<PublicMarriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarriage, setSelectedMarriage] = useState<PublicMarriage | null>(null);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    fetchMarriages();
  }, []);

  const fetchMarriages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/marriages');
      if (res.data.success) {
        setMarriages(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load marriages:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Please enter the wedding passcode.');
      return;
    }

    try {
      setUnlocking(true);
      setErrorMsg('');

      const res = await api.post('/auth/guest/login', {
        marriageCode: passcode.trim().toUpperCase()
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        // Redirect to dashboard
        router.push(`/marriage/${res.data.user.assignedMarriageId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid passcode. Please verify with the host.');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your Digital Wedding Companion</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight">
          Celebrate, Stream & Share Candid Moments
        </h1>
        <p className="text-zinc-600 text-base sm:text-lg">
          Explore upcoming wedding celebrations, access schedules, watch live streams,
          and upload high-resolution memories directly to the couple&apos;s photo dump.
        </p>
      </div>

      {/* Marriages Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-rose-100 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-zinc-900">
              Active Weddings
            </h2>
            <p className="text-xs text-zinc-500">
              Select your host couple and enter their secret passcode to unlock.
            </p>
          </div>
          <span className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full font-medium">
            {marriages.length} Registered
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200"
              />
            ))}
          </div>
        ) : marriages.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-rose-200 p-8 space-y-3">
            <Heart className="w-10 h-10 text-rose-300 mx-auto" />
            <h3 className="font-medium text-zinc-800">No Weddings Yet</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Be the first to host! Create a wedding profile from the Host Login portal to get your QR codes and dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marriages.map((m) => (
              <div
                key={m._id}
                onClick={() => {
                  setSelectedMarriage(m);
                  setPasscode('');
                  setErrorMsg('');
                }}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100/80 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Private Event
                    </span>
                    <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-zinc-900 group-hover:text-rose-600 transition">
                    {m.partnerOneName} & {m.partnerTwoName}
                  </h3>

                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Added {new Date(m.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-rose-50 flex items-center justify-between text-xs font-medium text-rose-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Click to Unlock Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Unlock Passcode Modal */}
      {selectedMarriage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedMarriage(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-lg p-1"
            >
              ✕
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-zinc-900">
                Unlock Wedding
              </h3>
              <p className="text-xs text-zinc-500">
                Enter the passcode shared on your invitation for{' '}
                <strong className="text-zinc-800">
                  {selectedMarriage.partnerOneName} & {selectedMarriage.partnerTwoName}
                </strong>
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Wedding Passcode
                </label>
                <input
                  type="text"
                  placeholder="e.g. RAHUL2026"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                  className="w-full text-center font-mono tracking-widest text-lg px-4 py-2.5 rounded-xl border border-zinc-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none uppercase transition"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-center">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMarriage(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlocking}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                >
                  {unlocking ? 'Verifying...' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

