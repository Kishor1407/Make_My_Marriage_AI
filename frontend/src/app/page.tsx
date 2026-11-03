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

  // Secret Passcode Unlock Modal State (Stitch Screen 7a358ae8)
  const [selectedWeddingForUnlock, setSelectedWeddingForUnlock] = useState<any | null>(null);
  const [unlockPasscode, setUnlockPasscode] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Admin Modal & Form State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
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

  // Handle Guest Enter Celebrations (Instant Zero-Password Pass into Directory)
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
        email: guestEmail.trim().toLowerCase()
      });

      const session: GuestSession = {
        name: guestName.trim(),
        email: guestEmail.trim().toLowerCase()
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
      showToast(`Welcome, Honored Guest ${session.name}! Celebrations directory unlocked.`, 'success');
    } catch {
      // Fallback: local session if offline
      const session: GuestSession = {
        name: guestName.trim(),
        email: guestEmail.trim().toLowerCase()
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
      showToast(`Welcome, Honored Guest ${session.name}! Celebrations directory unlocked.`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Secret Passcode Verification to Unlock a Specific Wedding Sanctuary (Stitch Screen 7a358ae8)
  const handleVerifySecretPasscode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedWeddingForUnlock) return;

    const code = unlockPasscode.trim().toUpperCase();
    if (!code) {
      setUnlockError('Please enter the confidential 8-character secret passcode.');
      return;
    }

    setIsVerifyingCode(true);
    setUnlockError(null);
    setUnlockSuccess(false);

    try {
      const res = await api.post('/auth/guest/verify-passcode', {
        marriageCode: code,
        name: guestSession?.name || guestName,
        email: guestSession?.email || guestEmail
      });

      if (res.data?.success) {
        setUnlockSuccess(true);
        if (res.data?.token && typeof window !== 'undefined') {
          localStorage.setItem('mmm_token', res.data.token);
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`mmm_unlocked_${code.toLowerCase()}`, 'true');
        }
        showToast(`Passcode Authenticated! Decrypting ${selectedWeddingForUnlock.partnerOneName} & ${selectedWeddingForUnlock.partnerTwoName}'s sanctuary...`, 'success');
        setTimeout(() => {
          router.push(`/marriage/${code.toLowerCase()}`);
        }, 750);
      }
    } catch (err: any) {
      setUnlockError(
        err.response?.data?.error ||
        err.message ||
        'The code entered does not match this wedding sanctuary. Verify with the host family or physical stationery.'
      );
    } finally {
      setIsVerifyingCode(false);
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



  // =========================================================================
  // GUEST CELEBRATIONS DIRECTORY (Permanent Sovereign Screen • Zero Toggling)
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
                <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  {user?.role === 'ADMIN' ? (
                    <Link
                      href="/admin/dashboard"
                      className="text-xs font-bold text-[#C81E38] hover:underline flex items-center gap-1"
                    >
                      <span>Admin Workspace</span>
                      <AppIcon name="arrow_forward" size={14} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAdminModalOpen(true)}
                      className="text-[11px] font-bold text-neutral-600 hover:text-[#C81E38] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <AppIcon name="admin_panel_settings" size={14} className="text-[#C81E38]" />
                      <span>Host Admin Sign In</span>
                    </button>
                  )}
                  <span className="text-[10px] uppercase font-bold text-neutral-400">₹0 Cloud Cost</span>
                </div>
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

                      {/* Primary Crimson Interactive Unlock Button (Stitch Screen e978ae5b & 7a358ae8) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWeddingForUnlock(wedding);
                          setUnlockPasscode('');
                          setUnlockError(null);
                          setUnlockSuccess(false);
                        }}
                        className="w-full py-3.5 bg-[#a20025] hover:bg-[#9a1830] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Enter Wedding Vault</span>
                        <AppIcon name="arrow_forward" size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCREEN 3: SECRET PASSCODE UNLOCK MODAL (Stitch Screen 7a358ae8c08649a2)   */}
      {/* ========================================================================= */}
      {selectedWeddingForUnlock && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg my-auto bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden transform transition-all duration-300">
            {/* Top Decorative Gold/Crimson Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#C81E38] via-amber-400 to-[#C81E38]" />

            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedWeddingForUnlock(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 hover:bg-[#C81E38] hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              <AppIcon name="close" size={18} />
            </button>

            <div className="p-6 sm:p-8 md:p-9 flex flex-col gap-6">
              {/* Couple Header & Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#C81E38] via-amber-400 to-[#C81E38] shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100">
                      <img
                        alt={selectedWeddingForUnlock.partnerOneName}
                        src={selectedWeddingForUnlock.coverImage}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C81E38] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <AppIcon name="lock" size={12} className="text-white" />
                  </div>
                </div>

                {/* Auspicious Inscription Overline */}
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <span className="w-4 h-px bg-[#C81E38]" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C81E38]">
                    ॥ शुभं भवतु ॥ • Private Access Protocol
                  </span>
                  <span className="w-4 h-px bg-[#C81E38]" />
                </div>

                {/* Main Headline */}
                <h3 className="font-editorial text-2xl font-bold text-[#0A0A0C] tracking-tight leading-snug mb-1">
                  Unlock {selectedWeddingForUnlock.partnerOneName} &amp; {selectedWeddingForUnlock.partnerTwoName}&apos;s Sanctuary
                </h3>

                {/* Meta Date & Venue */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-neutral-500 text-xs tracking-wider uppercase mb-2">
                  <span className="flex items-center gap-1">
                    <AppIcon name="calendar_today" size={13} className="text-[#C81E38]" />
                    <span>{selectedWeddingForUnlock.dates || 'Celebration Schedule'}</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1">
                    <AppIcon name="location_on" size={13} className="text-[#C81E38]" />
                    <span className="truncate max-w-[200px]">{selectedWeddingForUnlock.venue || 'Private Venue'}</span>
                  </span>
                </div>

                <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                  Please enter the confidential 8-character secret passcode printed on your physical stationery, WhatsApp invitation, or banquet table standee.
                </p>
              </div>

              {/* Passcode Input Form */}
              <form onSubmit={handleVerifySecretPasscode} className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <span>Confidential Passcode</span>
                  <span className="text-[#C81E38] text-[10px] lowercase font-normal">8-character key</span>
                </div>

                <div className="relative flex items-center">
                  <input
                    autoFocus
                    type="text"
                    maxLength={8}
                    value={unlockPasscode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setUnlockPasscode(val);
                      if (unlockError) setUnlockError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-neutral-50 px-4 py-3.5 pr-12 text-center text-[#0A0A0C] font-mono text-2xl font-bold tracking-[0.35em] uppercase rounded-xl border border-neutral-200 focus:bg-white focus:border-[#C81E38] outline-none transition-colors shadow-inner"
                  />
                  <div className="absolute right-3.5 flex items-center justify-center pointer-events-none">
                    <AppIcon
                      name={unlockSuccess ? 'verified_user' : unlockError ? 'error' : 'key'}
                      size={20}
                      className={unlockSuccess ? 'text-emerald-600' : unlockError ? 'text-[#C81E38]' : 'text-neutral-400'}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>
                    Case-insensitive (e.g. <span className="font-mono text-neutral-800 font-semibold">{selectedWeddingForUnlock.marriageCode}</span>)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockPasscode('');
                      setUnlockError(null);
                      setUnlockSuccess(false);
                    }}
                    className="text-neutral-500 hover:text-[#C81E38] uppercase tracking-wider font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Validation Status Badges */}
                {unlockSuccess && (
                  <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 animate-in fade-in duration-200">
                    <AppIcon name="check_circle" size={18} className="text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold uppercase tracking-wider block">Passcode Authenticated</span>
                      <span className="text-[11px] text-emerald-700">Access granted to Private Matrimonial Archive &amp; Live Ceremonies.</span>
                    </div>
                  </div>
                )}

                {unlockError && (
                  <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 animate-in fade-in duration-200">
                    <AppIcon name="error" size={18} className="text-[#C81E38] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold uppercase tracking-wider block">Invalid Secret Key</span>
                      <span className="text-[11px] text-rose-700">{unlockError}</span>
                    </div>
                  </div>
                )}

                {/* Action CTA Buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    disabled={isVerifyingCode || unlockSuccess}
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl bg-[#C81E38] hover:bg-[#9e1b32] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#C81E38]/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingCode ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Decrypting Sanctuary...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Sacred Sanctuary</span>
                        <span className="text-base leading-none">🌸</span>
                        <AppIcon name="arrow_forward" size={16} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWeddingForUnlock(null)}
                    className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer"
                  >
                    Cancel &amp; Return to Celebrations
                  </button>
                </div>
              </form>

              {/* Table Standee & Brass QR Notice Card (Stitch Screen 7a358ae8) */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#C81E38]">
                  <AppIcon name="table_restaurant" size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Banquet Standee &amp; QR Instant Unlock
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Don&apos;t have the secret code? Scan the bespoke brass QR code mounted on your dinner table standee for instantaneous biometric zero-code access, or contact the host family concierge.
                </p>

                {/* Quick Test Demo Key Pill */}
                <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Need demo key?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockPasscode(selectedWeddingForUnlock.marriageCode);
                      setUnlockError(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#0A0A0C] border border-neutral-200 rounded-lg font-mono text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <AppIcon name="key" size={12} className="text-[#C81E38]" />
                    <span>{selectedWeddingForUnlock.marriageCode}</span>
                    <span className="text-[10px] text-[#C81E38] font-sans font-semibold uppercase tracking-wider ml-1">
                      (Auto-fill)
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Archival Encrypted Stamp */}
            <div className="bg-neutral-100 px-6 py-2.5 flex items-center justify-between text-neutral-500 text-[10px] uppercase font-semibold tracking-widest border-t border-neutral-200">
              <span>Vault: {selectedWeddingForUnlock.marriageCode}-2026</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38]"></span>
                <span>Encrypted Gateway</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* HOST ADMIN LOGIN MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 sm:p-8 text-[#0A0A0C]">
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black cursor-pointer"
            >
              <AppIcon name="close" size={20} />
            </button>

            <div className="space-y-1 mb-6">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-3 shadow-md">
                <AppIcon name="admin_panel_settings" size={20} className="text-amber-400" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                Host Sovereign Clearance
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#0A0A0C]">
                Admin Workspace Sign In
              </h2>
              <p className="text-xs text-neutral-500">
                Enter sovereign credentials to orchestrate wedding vaults, stream keys & digital invitations.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Admin Email
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Password
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
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                  <span>👑</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
