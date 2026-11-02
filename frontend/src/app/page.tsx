'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';

interface GuestSession {
  name: string;
  email: string;
  marriageCode?: string;
}

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Active Role in Gateway Toggle: 'guest' | 'admin'
  const [gatewayRole, setGatewayRole] = useState<'guest' | 'admin'>('guest');

  // Guest Form State
  const [guestName, setGuestName] = useState('Kabir Malhotra');
  const [guestEmail, setGuestEmail] = useState('kabir@gmail.com');
  const [guestPasscode, setGuestPasscode] = useState('RAJSIM24');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('modi@makemymarriage.com');
  const [adminPassword, setAdminPassword] = useState('Password@2026');
  const [showPassword, setShowPassword] = useState(false);

  // Session State
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Marriages Directory State
  const [marriages, setMarriages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'live' | 'upcoming'>('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: 'info' | 'success' | 'crimson' } | null>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'crimson' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Rehydrate sessions on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedGuest = localStorage.getItem('mmm_guest');
      if (storedGuest) {
        try {
          const parsed = JSON.parse(storedGuest);
          setGuestSession(parsed);
          dispatch(setUser({
            id: `guest_${Date.now()}`,
            name: parsed.name,
            email: parsed.email,
            role: 'GUEST'
          }));
        } catch {
          localStorage.removeItem('mmm_guest');
        }
      }

      // Check for Admin Token
      const storedToken = localStorage.getItem('mmm_token');
      if (storedToken && !storedGuest) {
        api.get('/auth/me')
          .then((res) => {
            if (res.data?.user) {
              dispatch(setUser(res.data.user));
              if (res.data.user.role === 'ADMIN') {
                router.push('/admin/dashboard');
              }
            }
          })
          .catch(() => {
            localStorage.removeItem('mmm_token');
          });
      }
    }
    setIsInitializing(false);
  }, [dispatch, router]);

  // Load active marriages from MongoDB Atlas
  useEffect(() => {
    api.get('/marriages')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setMarriages(res.data.data);
        } else {
          // Fallback to Bollywood marriages
          setMarriages([
            {
              id: 'm1',
              partnerOneName: 'Raj Malhotra',
              partnerTwoName: 'Simran Singh',
              marriageCode: 'RAJSIM24',
              venue: 'The Grand Oberoi Amarvilas, Agra',
              dates: 'October 18–20, 2026',
              status: 'LIVE',
              coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk',
              globalStats: { totalPhotos: 420, totalGuestsEngaged: 240 }
            },
            {
              id: 'm2',
              partnerOneName: 'Qais Bhatt (Majnu)',
              partnerTwoName: 'Laila Sharma',
              marriageCode: 'LAILAM25',
              venue: 'The Khyber Himalayan Resort, Gulmarg',
              dates: 'November 14–16, 2026',
              status: 'Scheduled',
              coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc9C1voRVWDpitAXvHixh6nqQ4Fr79mnyuw9Xe3IcAQgZAd-Uv3awiaBCqPc9wnryGg6K_YtjvXw33aS0iPw333R8nNhGrxKssGs9kAEFQutT4sDRp5swxSF4PKKzpyne6cjdxSMvTeL4C-gEgct3msqLoQmVt6GrsyBYVuNDf8XOEWyRE8h2qqZjSVu1Q0NDPzcE68G9R3cAcloU2HG0DmHfapfJmWYtk0quRUrg',
              globalStats: { totalPhotos: 520, totalGuestsEngaged: 360 }
            },
            {
              id: 'm3',
              partnerOneName: 'Dido Ranjha',
              partnerTwoName: 'Heer Sial',
              marriageCode: 'HEERRAN26',
              venue: 'Umaid Bhawan Palace, Jodhpur',
              dates: 'December 18–20, 2026',
              status: 'Upcoming',
              coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSFCd_cy05beANlWSREfxP3NXg8ctYEY9AVrp-_XUcFVt_w_abbeTJoNmpWgcl8BVyWp4mMIEKmkoQCot9EjdJ8Qctuj_og0TdF89uVPf1ArAbEHmfMvwAjzk11O8dlquI1hLl94jYCQPEmyWg6L3oF39f_dnAAHfgwtKtVrHHwXAxAnTWY3rVge3SuEwTHGpMbYt9YVQpN3S6n00H5ow31iMzhlMSaFkbEID1-jQ',
              globalStats: { totalPhotos: 310, totalGuestsEngaged: 180 }
            },
            {
              id: 'm4',
              partnerOneName: 'Kabir Thapar (Bunny)',
              partnerTwoName: 'Naina Talwar',
              marriageCode: 'BUNNYNA27',
              venue: 'The Oberoi Udaivilas, Udaipur',
              dates: 'March 24–26, 2027',
              status: 'Upcoming',
              coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk',
              globalStats: { totalPhotos: 195, totalGuestsEngaged: 140 }
            }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Guest Enter Celebrations (Instant Zero-Password Pass)
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      showToast('Please enter your full name and email.', 'crimson');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/guest/login', {
        name: guestName.trim(),
        email: guestEmail.trim().toLowerCase(),
        marriageCode: guestPasscode || undefined
      });

      const session: GuestSession = {
        name: guestName.trim(),
        email: guestEmail.trim().toLowerCase(),
        marriageCode: guestPasscode
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('mmm_guest', JSON.stringify(session));
        if (response.data?.token) {
          localStorage.setItem('mmm_token', response.data.token);
        }
      }

      dispatch(setUser({
        id: response.data?.user?.id || `guest_${Date.now()}`,
        name: session.name,
        email: session.email,
        role: 'GUEST'
      }));

      setGuestSession(session);
      showToast(`Welcome, Honored Guest ${session.name}! Celebrations unlocked.`, 'success');

      // If user selected a specific wedding code, optionally navigate straight in
      if (guestPasscode) {
        setTimeout(() => {
          router.push(`/marriage/${guestPasscode.toLowerCase()}`);
        }, 600);
      }
    } catch {
      // Fallback: local session if offline
      const session: GuestSession = {
        name: guestName.trim(),
        email: guestEmail.trim().toLowerCase(),
        marriageCode: guestPasscode
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mmm_guest', JSON.stringify(session));
      }
      setGuestSession(session);
      dispatch(setUser({
        id: `guest_${Date.now()}`,
        name: session.name,
        email: session.email,
        role: 'GUEST'
      }));
      showToast(`Welcome, Honored Guest ${session.name}!`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Admin Sign In
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      showToast('Please provide your admin email and sovereign password.', 'crimson');
      return;
    }

    setIsSubmitting(true);
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
        showToast('Authenticated! Entering Host Sovereign Dashboard...', 'success');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 500);
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid admin credentials.', 'crimson');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exit / Switch Role: Return to Gateway
  const handleExitRole = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mmm_guest');
      localStorage.removeItem('mmm_token');
    }
    setGuestSession(null);
    dispatch(logout());
    showToast('Switched to Entry Gateway. Choose your access role.');
  };

  // Filtered Celebrations for the Directory View
  const filteredMarriages = marriages.filter((m) => {
    const title = `${m.partnerOneName || ''} ${m.partnerTwoName || ''} ${m.venue || ''} ${m.marriageCode || ''}`.toLowerCase();
    const matchesQuery = !searchQuery || title.includes(searchQuery.toLowerCase());
    const isLive = m.status?.toUpperCase() === 'LIVE' || m.status?.toLowerCase() === 'live';
    if (filterCategory === 'live') return matchesQuery && isLive;
    if (filterCategory === 'upcoming') return matchesQuery && !isLive;
    return matchesQuery;
  });

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c81e38] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: UNIFIED ROLE-SWITCH GATEWAY (When no session is active)
  // =========================================================================
  if (!guestSession && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0C] font-sans antialiased flex flex-col selection:bg-[#C81E38] selection:text-white relative overflow-hidden">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-[100] px-4 py-3 rounded-2xl bg-white border border-neutral-200 text-[#0A0A0C] text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-right-4">
            <AppIcon
              name={toastMsg.type === 'success' ? 'check_circle' : toastMsg.type === 'crimson' ? 'error' : 'info'}
              size={18}
              className={toastMsg.type === 'success' ? 'text-emerald-600' : toastMsg.type === 'crimson' ? 'text-[#C81E38]' : 'text-neutral-700'}
            />
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Ambient Decorative Luxury Glow */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C81E38]/10 via-neutral-100/40 to-transparent blur-3xl pointer-events-none -top-40 -left-20" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-100/30 via-[#C81E38]/5 to-transparent blur-3xl pointer-events-none -bottom-32 -right-20" />

        {/* Main Gateway Center Panel */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative z-10">
          <div className="w-full max-w-xl mx-auto flex flex-col items-center">
            {/* Brand Presentation */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#C81E38] text-white flex items-center justify-center mb-4 shadow-xl shadow-[#C81E38]/20 transition-transform duration-300 hover:scale-105">
                <AppIcon name="diamond" size={28} className="text-white" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200 mb-3 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38] animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#0A0A0C]">
                  India&apos;s ₹0 Cloud Sovereign Wedding Vault
                </span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0C] tracking-tight mb-2">
                Make My Marriage
              </h1>
              <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                Bespoke Matrimonial Archives &amp; Guest Experience Atelier
              </p>
            </div>

            {/* Master Role Switcher Segmented Capsule */}
            <div className="w-full bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 mb-6 shadow-xs flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => setGatewayRole('guest')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-xs font-bold uppercase tracking-wider ${
                  gatewayRole === 'guest'
                    ? 'text-[#C81E38] bg-white shadow-md border border-neutral-200/80'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span className="text-base leading-none">🌸</span>
                <span>Guest Experience</span>
                {gatewayRole === 'guest' && <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38] ml-0.5"></span>}
              </button>
              <button
                type="button"
                onClick={() => setGatewayRole('admin')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-xs font-bold uppercase tracking-wider ${
                  gatewayRole === 'admin'
                    ? 'text-black bg-white shadow-md border border-neutral-200/80'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span className="text-base leading-none">👑</span>
                <span>Host / Admin Portal</span>
                {gatewayRole === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-black ml-0.5"></span>}
              </button>
            </div>

            {/* Main Interactive Card */}
            <div className="w-full bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden relative">
              {/* Top Decorative Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#C81E38] via-[#9e1b32] to-amber-400" />

              {/* ---------------------------------------------------- */}
              {/* GUEST MODE: ZERO-PASSWORD PROCEED SCREEN             */}
              {/* ---------------------------------------------------- */}
              {gatewayRole === 'guest' ? (
                <div className="p-7 sm:p-9 flex flex-col animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C81E38] block mb-1">
                        Direct Invitation Entry
                      </span>
                      <h2 className="font-editorial font-bold text-2xl text-[#0A0A0C]">
                        Welcome, Honored Guest
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1">
                        Join the royal celebrations as an honored guest and preserve live memoirs.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#C81E38]/10 text-[#C81E38] flex items-center justify-center shrink-0 border border-[#C81E38]/20">
                      <AppIcon name="celebration" size={20} />
                    </div>
                  </div>

                  <form onSubmit={handleGuestSubmit} className="space-y-4">
                    {/* Field 1: Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Your Full Name <span className="text-[#C81E38]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 text-[18px]">
                          badge
                        </span>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Kabir Malhotra"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#0A0A0C] placeholder:text-neutral-400 focus:bg-white focus:border-[#C81E38] outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Field 2: Email Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Your Email Address <span className="text-[#C81E38]">*</span>
                        </label>
                        <span className="text-[10px] text-neutral-400">Photo Attribution</span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 text-[18px]">
                          mail
                        </span>
                        <input
                          required
                          type="email"
                          placeholder="e.g. kabir@gmail.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#0A0A0C] placeholder:text-neutral-400 focus:bg-white focus:border-[#C81E38] outline-none transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-1">
                        <AppIcon name="verified" size={13} className="text-[#C81E38]" />
                        <span>Attribution for all archival photos and blessings you upload.</span>
                      </p>
                    </div>

                    {/* Field 3: Wedding Passcode Dropdown */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Wedding Vault Access Code <span className="text-neutral-400 font-normal lowercase">(optional)</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 text-[18px]">
                          key
                        </span>
                        <select
                          value={guestPasscode}
                          onChange={(e) => setGuestPasscode(e.target.value)}
                          className="w-full pl-11 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#0A0A0C] appearance-none focus:bg-white focus:border-[#C81E38] outline-none cursor-pointer"
                        >
                          <option value="RAJSIM24">RAJSIM24 • Raj &amp; Simran Nuptials (Agra)</option>
                          <option value="LAILAM25">LAILAM25 • Laila &amp; Majnu Himalayan Gala (Gulmarg)</option>
                          <option value="HEERRAN26">HEERRAN26 • Heer &amp; Ranjha Royal Sangeet (Jodhpur)</option>
                          <option value="BUNNYNA27">BUNNYNA27 • Bunny &amp; Naina Lake Palace (Udaipur)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3.5 pointer-events-none text-neutral-400 text-[18px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Quick Access Privileges */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Access:</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 rounded-lg text-neutral-700 text-[11px] font-medium border border-neutral-200">
                        <AppIcon name="photo_library" size={12} className="text-[#C81E38]" /> 4K Stream
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 rounded-lg text-neutral-700 text-[11px] font-medium border border-neutral-200">
                        <AppIcon name="schedule" size={12} className="text-[#C81E38]" /> Live Itinerary
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 rounded-lg text-neutral-700 text-[11px] font-medium border border-neutral-200">
                        <AppIcon name="qr_code" size={12} className="text-[#C81E38]" /> Standee QR
                      </span>
                    </div>

                    {/* Big Primary Enter Celebrations Button */}
                    <div className="pt-3">
                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-4 px-6 rounded-2xl bg-[#C81E38] hover:bg-[#9e1b32] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#C81E38]/25 active:scale-95 transition-all group disabled:opacity-50 cursor-pointer"
                      >
                        <span>{isSubmitting ? 'Entering Celebrations...' : 'Enter Celebrations'}</span>
                        <span className="text-base group-hover:translate-x-1 transition-transform">🌸</span>
                      </button>
                    </div>

                    <div className="pt-2 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-neutral-500 text-[10px] uppercase font-semibold tracking-wider">
                      <span className="flex items-center gap-1">
                        <AppIcon name="bolt" size={13} className="text-[#C81E38]" /> Instant Zero-Login Pass
                      </span>
                      <span className="hidden sm:inline text-neutral-300">•</span>
                      <span className="flex items-center gap-1">
                        <AppIcon name="lock" size={13} className="text-[#C81E38]" /> Encrypted Sovereign Vault
                      </span>
                    </div>
                  </form>
                </div>
              ) : (
                /* ---------------------------------------------------- */
                /* ADMIN MODE: SOVEREIGN HOST CREDENTIALS LOGIN        */
                /* ---------------------------------------------------- */
                <div className="p-7 sm:p-9 flex flex-col animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0C] block mb-1">
                        Vault Administration
                      </span>
                      <h2 className="font-editorial font-bold text-2xl text-[#0A0A0C]">
                        Host Concierge &amp; Governance
                      </h2>
                      <p className="text-xs text-neutral-500 mt-1">
                        Sovereign wedding control plane, rites scheduling, and cloud media orchestration.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
                      <AppIcon name="admin_panel_settings" size={20} />
                    </div>
                  </div>

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    {/* Admin Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Master Custodian Email <span className="text-[#C81E38]">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 text-[18px]">
                          shield_person
                        </span>
                        <input
                          required
                          type="email"
                          placeholder="modi@makemymarriage.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#0A0A0C] focus:bg-white focus:border-black outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Admin Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Master Sovereign Passkey <span className="text-[#C81E38]">*</span>
                        </label>
                        <span className="text-[10px] text-[#C81E38] font-bold">Encrypted 256-Bit</span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 text-[18px]">
                          lock
                        </span>
                        <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#0A0A0C] focus:bg-white focus:border-black outline-none tracking-widest transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-neutral-400 hover:text-black transition-colors"
                        >
                          <AppIcon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Domain Identifier Badge */}
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AppIcon name="domain_verification" size={16} className="text-neutral-500" />
                        <span className="text-xs font-semibold text-neutral-700">raj-simran.makemymarriage.com</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white text-[#C81E38] text-[10px] font-bold uppercase border border-neutral-200">
                        Cloud ₹0 Tier Active
                      </span>
                    </div>

                    {/* Primary Admin Sign In Button */}
                    <div className="pt-2">
                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-4 px-6 rounded-2xl bg-[#0A0A0C] hover:bg-[#1a1a20] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all group disabled:opacity-50 cursor-pointer"
                      >
                        <span>{isSubmitting ? 'Authenticating Sovereign Vault...' : 'Sign In to Master Vault'}</span>
                        <span className="text-base group-hover:scale-110 transition-transform">👑</span>
                      </button>
                    </div>

                    <div className="pt-1 text-center text-neutral-500 text-[10px] uppercase font-semibold tracking-wider">
                      Protected by Sovereign Host Multi-Zone Encryption
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Quick Switcher Help Footer */}
            <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-between text-neutral-500 gap-4 px-2 text-xs">
              <div className="flex items-center gap-2">
                <AppIcon name="hotel_class" size={16} className="text-[#C81E38]" />
                <span>Need a royal concierge pass?</span>
                <a href="mailto:concierge@makemymarriage.com" className="font-bold text-[#C81E38] hover:underline">
                  Contact Host Helpdesk
                </a>
              </div>
              <div className="flex items-center gap-3 font-semibold uppercase tracking-widest text-[10px]">
                <span>© 2026 Make My Marriage</span>
                <span>•</span>
                <span>Zero-Cost Sovereign Cloud</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: GUEST CELEBRATIONS DIRECTORY (When guest is logged in)
  // =========================================================================
  return (
    <div className="min-h-screen bg-white text-[#0A0A0C] font-sans antialiased flex flex-col selection:bg-[#C81E38] selection:text-white">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[100] px-4 py-3 rounded-2xl bg-white border border-neutral-200 text-[#0A0A0C] text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-right-4">
          <AppIcon
            name={toastMsg.type === 'success' ? 'check_circle' : toastMsg.type === 'crimson' ? 'error' : 'info'}
            size={18}
            className={toastMsg.type === 'success' ? 'text-emerald-600' : toastMsg.type === 'crimson' ? 'text-[#C81E38]' : 'text-neutral-700'}
          />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Welcoming Editorial Hero Banner */}
      <section className="w-full bg-[#FAFAFA] border-b border-neutral-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#C81E38]"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#C81E38]">
                  Private Access Dossier
                </span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0C] tracking-tight leading-tight">
                Royal Celebrations &amp; Sovereign Vaults
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
                Welcome, <strong className="text-[#0A0A0C]">{guestSession?.name || 'Honored Guest'}</strong>. Select a wedding below to view live ceremonial broadcasts, digital invitation suites, and upload your candid memories directly to the couple&apos;s heirloom monograph.
              </p>
            </div>

            {/* Archival Status & Quick Metric */}
            <div className="lg:col-span-4 flex flex-col justify-end lg:items-end">
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs max-w-xs w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Vault Accreditation
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                    Active Pass
                  </span>
                </div>
                <div className="mt-2 text-xl font-bold font-editorial text-[#0A0A0C]">
                  {marriages.length} Sovereign Invitations
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Ceremonial permissions synchronized for {guestSession?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Console */}
      <section className="w-full bg-white border-b border-neutral-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <AppIcon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search couple names, venue, or passcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] placeholder:text-neutral-400 focus:bg-white focus:border-[#C81E38] outline-none transition-colors"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filterCategory === 'all'
                  ? 'bg-[#0A0A0C] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-200'
              }`}
            >
              All Weddings ({marriages.length})
            </button>
            <button
              onClick={() => setFilterCategory('live')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                filterCategory === 'live'
                  ? 'bg-[#C81E38] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38] animate-ping"></span>
              Live Now
            </button>
            <button
              onClick={() => setFilterCategory('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filterCategory === 'upcoming'
                  ? 'bg-[#0A0A0C] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-200'
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </section>

      {/* Celebrations Showcase Grid (3-Column Minimalist Luxury Cards) */}
      <section className="w-full bg-white py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredMarriages.length === 0 ? (
            <div className="py-20 text-center bg-neutral-50 rounded-3xl border border-neutral-200 p-8">
              <AppIcon name="search_off" size={40} className="mx-auto text-neutral-300 mb-2" />
              <h3 className="font-editorial text-lg font-bold text-neutral-800">No Sovereign Celebrations Found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No weddings matched your query. Try resetting your search filters or search by alternate couple names.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-[#0A0A0C] text-white text-xs font-bold rounded-xl"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMarriages.map((wedding) => {
                const code = wedding.marriageCode || 'RAJSIM24';
                const couple = `${wedding.partnerOneName} & ${wedding.partnerTwoName}`;
                const isLive = wedding.status?.toUpperCase() === 'LIVE' || wedding.status?.toLowerCase() === 'live';

                return (
                  <article
                    key={wedding._id || wedding.id || code}
                    className="group flex flex-col bg-white rounded-3xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Portrait Ratio Cover */}
                    <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-100">
                      <img
                        alt={couple}
                        src={wedding.coverImage}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Top Status Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                        {isLive ? (
                          <span className="px-3 py-1 rounded-full bg-[#C81E38] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Live Broadcast Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-white/95 text-neutral-800 text-[10px] font-bold uppercase tracking-widest shadow-md">
                            {wedding.status || 'Scheduled'}
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold">
                          {code}
                        </span>
                      </div>

                      {/* Bottom Subtle Vignette */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 text-white text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <AppIcon name="videocam" size={16} className="text-[#ffb3b3]" />
                        <span>Sovereign Memory Vault</span>
                      </div>
                    </div>

                    {/* Dossier Body Content */}
                    <div className="p-6 flex flex-col flex-1 justify-between gap-5 bg-white">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C81E38]">
                          {wedding.dates || 'Wedding Schedule'}
                        </span>
                        <h2 className="font-editorial font-bold text-xl text-[#0A0A0C] tracking-tight group-hover:text-[#C81E38] transition-colors">
                          {couple}
                        </h2>
                        <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                          <AppIcon name="location_on" size={15} className="text-[#C81E38]" />
                          <span className="truncate">{wedding.venue || 'Palace Banquet'}</span>
                        </div>
                      </div>

                      {/* Engagement Telemetry */}
                      <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-neutral-400">Archived Moments</span>
                          <span className="font-editorial text-lg font-bold text-[#0A0A0C] mt-0.5 leading-none">
                            {wedding.globalStats?.totalPhotos || 0}
                          </span>
                        </div>
                        <div className="h-7 w-px bg-neutral-200" />
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold uppercase text-neutral-400">Attending Guests</span>
                          <span className="font-editorial text-lg font-bold text-[#0A0A0C] mt-0.5 leading-none">
                            {wedding.globalStats?.totalGuestsEngaged || 0}
                          </span>
                        </div>
                      </div>

                      {/* Primary Crimson Interactive Anchor */}
                      <Link
                        href={`/marriage/${code.toLowerCase()}`}
                        className="w-full py-3.5 rounded-xl bg-[#C81E38] hover:bg-[#9e1b32] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                      >
                        <span>Enter Wedding Vault</span>
                        <AppIcon name="arrow_forward" size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Guest Fast Upload Banner Tray */}
      <section className="w-full bg-[#FAFAFA] border-t border-neutral-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C81E38]/10 text-[#C81E38] flex items-center justify-center shrink-0 border border-[#C81E38]/20">
              <AppIcon name="photo_camera" size={24} />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-base text-[#0A0A0C]">
                Have candid photographs from today&apos;s celebrations?
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Guest uploads are authenticated instantly and delivered directly to the couple&apos;s physical archival album.
              </p>
            </div>
          </div>
          <Link
            href={`/guest/upload?code=${guestSession?.marriageCode || 'RAJSIM24'}`}
            className="px-6 py-3 rounded-xl bg-[#C81E38] hover:bg-[#9e1b32] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2 shrink-0 active:scale-95"
          >
            <AppIcon name="upload_file" size={16} />
            <span>Fast Guest Upload</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
