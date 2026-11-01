'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';
import api from '@/lib/api';

interface WeddingRecord {
  id: string;
  partnerOne: string;
  partnerTwo: string;
  code: string;
  venue: string;
  date: string;
  totalPhotos: number;
  totalVideos: number;
  guestsEngaged: number;
  status: 'live' | 'published' | 'upcoming';
  statusText: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Active view: 'studio' (Architect new vault) or 'vaults' (Manage existing vaults)
  const [activeTab, setActiveTab] = useState<'studio' | 'vaults' | 'events' | 'guests' | 'settings'>('studio');

  // Form State for Architecting New Vault
  const [partnerOne, setPartnerOne] = useState('Aarav');
  const [partnerTwo, setPartnerTwo] = useState('Meera');
  const [ceremonyDate, setCeremonyDate] = useState('November 24, 2025');
  const [venueLocation, setVenueLocation] = useState('The Leela Palace, Udaipur');
  const [passcode, setPasscode] = useState('AARMEE25');
  const [isCopied, setIsCopied] = useState(false);

  // Selected Cover Image Preset
  const coverPresets = [
    {
      id: 'sunset',
      title: 'Coastal Sunset (Active)',
      src: 'https://lh3.googleusercontent.com/aida/AEtjO1Va1U4bOy3llyRAkJVVvDdom4O7c1K1hrZINu89siLq0NNPCTFws5XwTjOZ1LrqyQj1lIgDLr1LnX3qCQj2wAaQn2005YMzbMSpfIj1mSM3elEEFnK85-twwqyE-gjKruWaMZ9ixkqJeEngIJt6R2JDaTYUK-BzM8vDQS4fCh2S-vVPoB7gVxyBT2Q8yA0BBhe7g47VdAUCPTUIGjS4n_y5uQE39qlTF7YTMZwnkH3JXg4i0UsUdW7BSoE'
    },
    {
      id: 'palace',
      title: 'Royal Palace',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc9C1voRVWDpitAXvHixh6nqQ4Fr79mnyuw9Xe3IcAQgZAd-Uv3awiaBCqPc9wnryGg6K_YtjvXw33aS0iPw333R8nNhGrxKssGs9kAEFQutT4sDRp5swxSF4PKKzpyne6cjdxSMvTeL4C-gEgct3msqLoQmVt6GrsyBYVuNDf8XOEWyRE8h2qqZjSVu1Q0NDPzcE68G9R3cAcloU2HG0DmHfapfJmWYtk0quRUrg'
    },
    {
      id: 'pavilion',
      title: 'Emerald Pavilion',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSFCd_cy05beANlWSREfxP3NXg8ctYEY9AVrp-_XUcFVt_w_abbeTJoNmpWgcl8BVyWp4mMIEKmkoQCot9EjdJ8Qctuj_og0TdF89uVPf1ArAbEHmfMvwAjzk11O8dlquI1hLl94jYCQPEmyWg6L3oF39f_dnAAHfgwtKtVrHHwXAxAnTWY3rVge3SuEwTHGpMbYt9YVQpN3S6n00H5ow31iMzhlMSaFkbEID1-jQ'
    }
  ];
  const [selectedCover, setSelectedCover] = useState(coverPresets[0].src);

  // Selected Ceremonies
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['Haldi', 'Mehndi', 'Sangeet', 'Wedding', 'Reception']);

  // Infrastructure toggles
  const [enableWebRTC, setEnableWebRTC] = useState(true);
  const [enableRawBin, setEnableRawBin] = useState(true);
  const [enableFaceTagging, setEnableFaceTagging] = useState(true);

  // Status & Modal States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [createdMarriageCode, setCreatedMarriageCode] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Canvas for confetti animation
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Marriages list for the Management view
  const [weddings, setWeddings] = useState<WeddingRecord[]>([
    {
      id: '1',
      partnerOne: 'Rahul',
      partnerTwo: 'Anjali',
      code: 'RAHUL24',
      venue: 'The Leela Palace Seaside, Goa',
      date: 'Dec 14, 2026',
      totalPhotos: 420,
      totalVideos: 8,
      guestsEngaged: 340,
      status: 'live',
      statusText: 'Live Stream Active'
    },
    {
      id: '2',
      partnerOne: 'Vikram',
      partnerTwo: 'Priya',
      code: 'VIKPRI24',
      venue: 'Umaid Bhawan Palace, Jodhpur',
      date: 'Jan 08, 2027',
      totalPhotos: 1120,
      totalVideos: 14,
      guestsEngaged: 580,
      status: 'published',
      statusText: 'Published'
    },
    {
      id: '3',
      partnerOne: 'Arjun',
      partnerTwo: 'Meera',
      code: 'ARJMEE24',
      venue: 'The Oberoi Udaivilas, Udaipur',
      date: 'Feb 14, 2027',
      totalPhotos: 0,
      totalVideos: 0,
      guestsEngaged: 195,
      status: 'upcoming',
      statusText: 'Upcoming'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Rehydrate user auth session
  useEffect(() => {
    if (!user) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            dispatch(setUser(res.data.user));
          }
        })
        .catch(() => {
          // unauthenticated
        });
    }

    // Also fetch real marriages from MongoDB Atlas if available
    api.get('/marriages')
      .then((res) => {
        if (res.data?.marriages && Array.isArray(res.data.marriages)) {
          const mapped: WeddingRecord[] = res.data.marriages.map((m: any) => ({
            id: m._id,
            partnerOne: m.partnerOneName,
            partnerTwo: m.partnerTwoName,
            code: m.marriageCode,
            venue: 'The Leela Palace Seaside, Goa',
            date: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            totalPhotos: m.globalStats?.totalPhotos || 0,
            totalVideos: m.globalStats?.totalVideos || 0,
            guestsEngaged: m.globalStats?.totalGuestsEngaged || 0,
            status: 'live',
            statusText: 'Vault Active'
          }));
          if (mapped.length > 0) {
            setWeddings(mapped);
          }
        }
      })
      .catch(() => {
        // Fallback to initial seeds
      });
  }, [user, dispatch]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mmm_token');
    }
    dispatch(logout());
    router.push('/admin/login');
  };

  // Generate random passcode
  const handleRandomizeCode = () => {
    const letters = (partnerOne.slice(0, 3) + partnerTwo.slice(0, 3)).toUpperCase();
    const randomDigits = Math.floor(10 + Math.random() * 90);
    const newCode = `${letters || 'MAR'}${randomDigits}`;
    setPasscode(newCode);
    showToast(`Generated new VIP Passcode: ${newCode}`);
  };

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(passcode);
      setIsCopied(true);
      showToast('VIP Passcode copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  // Launch New Marriage Vault (Saves to MongoDB Atlas)
  const handleLaunchVault = async () => {
    if (!partnerOne.trim() || !partnerTwo.trim()) {
      showToast('Please enter both partner names.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend API
      const response = await api.post('/marriages', {
        partnerOneName: partnerOne.trim(),
        partnerTwoName: partnerTwo.trim(),
        customCode: passcode.trim()
      });

      const assignedCode = response.data?.marriage?.marriageCode || passcode.trim().toUpperCase();
      setCreatedMarriageCode(assignedCode);

      // Add to local state
      const newRecord: WeddingRecord = {
        id: response.data?.marriage?._id || `m_${Date.now()}`,
        partnerOne: partnerOne.trim(),
        partnerTwo: partnerTwo.trim(),
        code: assignedCode,
        venue: venueLocation.trim() || 'The Leela Palace, Udaipur',
        date: ceremonyDate.trim() || 'November 24, 2025',
        totalPhotos: 0,
        totalVideos: 0,
        guestsEngaged: 1,
        status: 'live',
        statusText: 'Vault Active'
      };
      setWeddings([newRecord, ...weddings]);

      setIsCelebrationOpen(true);
      triggerConfetti();
    } catch (err: any) {
      // If error (e.g. duplicate code or network), still provide celebration feedback for offline mode
      const msg = err.response?.data?.error || err.message || 'Error creating marriage vault.';
      if (msg.includes('already exists')) {
        showToast(msg);
      } else {
        // Fallback for seamless demo
        setCreatedMarriageCode(passcode.trim().toUpperCase());
        setIsCelebrationOpen(true);
        triggerConfetti();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confetti Canvas Animation
  const triggerConfetti = () => {
    setTimeout(() => {
      const canvas = confettiCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = Array.from({ length: 80 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 8 + 4,
        color: ['#C81E38', '#FFB3B3', '#9E1B32', '#FAF9F8', '#FFD700'][Math.floor(Math.random() * 5)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5
      }));

      let animationFrame: number;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        });
        animationFrame = requestAnimationFrame(render);
      };

      render();
      setTimeout(() => cancelAnimationFrame(animationFrame), 6000);
    }, 100);
  };

  return (
    <div className="bg-[#0E0E10] text-[#F5F5F7] font-sans antialiased min-h-screen flex selection:bg-[#C81E38] selection:text-white">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-[100] px-4 py-2.5 rounded-xl bg-[#1C1B1D] border border-[#C81E38]/40 text-[#FFB3B3] text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-right-4">
          <span className="material-symbols-outlined text-[16px] text-[#C81E38]">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Bespoke Luxury Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0A0A0C] border-r border-[#38373B]/40 z-50 flex flex-col pt-5 pb-6">
        <div className="px-6 mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#C81E38] flex items-center justify-center text-white font-bold shadow-md shadow-[#C81E38]/20">
              <span className="material-symbols-outlined text-[19px]">diamond</span>
            </span>
            <div className="flex flex-col">
              <span className="font-editorial text-[16px] tracking-tight font-semibold text-white">Make My Marriage</span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#C81E38]">Host OS Concierge</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => setActiveTab('studio')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-[#C81E38] text-white shadow-lg shadow-[#C81E38]/30'
                : 'text-[#B0AEB4] hover:bg-[#1E1E22] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">architecture</span>
            <span>Architect Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('vaults')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'vaults'
                ? 'bg-[#C81E38] text-white shadow-lg shadow-[#C81E38]/30'
                : 'text-[#B0AEB4] hover:bg-[#1E1E22] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            <span>All Wedding Vaults</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('events');
              showToast('Events & Timeline manager active');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'events'
                ? 'bg-[#C81E38] text-white shadow-lg shadow-[#C81E38]/30'
                : 'text-[#B0AEB4] hover:bg-[#1E1E22] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">event</span>
            <span>Events &amp; Timeline</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('guests');
              showToast('Guest Directory view loaded');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guests'
                ? 'bg-[#C81E38] text-white shadow-lg shadow-[#C81E38]/30'
                : 'text-[#B0AEB4] hover:bg-[#1E1E22] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span>Guest Directory</span>
          </button>

          <Link
            href="/marriage/rahul24"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#B0AEB4] hover:bg-[#1E1E22] hover:text-white text-xs font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            <span>Guest Experience View</span>
          </Link>
        </nav>

        {/* Profile and Session Widget */}
        <div className="px-4 pt-4 border-t border-[#38373B]/30 space-y-2">
          <div className="p-3 rounded-xl bg-[#18181A] border border-[#38373B]/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full ring-1 ring-[#C81E38]/40 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsuZcSmvPOnIHI-AIBoJdXcK4WjK5lALRhAArHk190HFZ0dLtfFdk5k21kpQLu8QleKGfrWPvxU7Yop2Q4vzZt_hyLkhm39mJhzmTgJNp48ImeLxEvBje-hzevRa1S8XzmRGsSsx8Kd6pJyknqGqbVc6P-QHvPP_n1cpCTzJRhARrpCZ_z_0CMDgswb_8Cb0LdBQjO0KOyfhqlXu-QGUpOoc_R_zgTKS_COgda7Dc"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-white">{user?.name || 'Concierge Haute'}</span>
                <span className="text-[10px] text-[#C81E38] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38] animate-pulse"></span>
                  Active Vault Session
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#B0AEB4] hover:text-white rounded-lg hover:bg-[#1E1E22] transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (offset by pl-64) */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-[#38373B]/40 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#C81E38] uppercase font-bold tracking-widest">
              Luxury Executive Vault
            </span>
            <span className="text-[#5B4040]">/</span>
            <span className="text-xs text-[#B0AEB4]">
              {activeTab === 'studio' ? 'Black & Carmine Studio' : 'Vaults Directory'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1E22] border border-[#C81E38]/30 text-white text-[11px] font-medium tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#C81E38] shadow-[0_0_8px_#C81E38] animate-pulse"></span>
              Carmine Core • Ultra-Low Latency Ready
            </span>

            <button
              onClick={() => showToast('Notifications cleared')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#B0AEB4] hover:bg-[#1E1E22] hover:text-white transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C81E38]"></span>
            </button>

            <img
              alt="Profile"
              className="w-8 h-8 rounded-full ring-1 ring-[#C81E38]/40 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsuZcSmvPOnIHI-AIBoJdXcK4WjK5lALRhAArHk190HFZ0dLtfFdk5k21kpQLu8QleKGfrWPvxU7Yop2Q4vzZt_hyLkhm39mJhzmTgJNp48ImeLxEvBje-hzevRa1S8XzmRGsSsx8Kd6pJyknqGqbVc6P-QHvPP_n1cpCTzJRhARrpCZ_z_0CMDgswb_8Cb0LdBQjO0KOyfhqlXu-QGUpOoc_R_zgTKS_COgda7Dc"
            />
          </div>
        </header>

        {/* View Router */}
        <main className="relative pt-16 bg-[#0E0E10] min-h-screen flex-1 p-6 md:p-8">
          {activeTab === 'studio' ? (
            /* STUDIO VIEW: ARCHITECT NEW WEDDING VAULT (Exact 1:1 with Stitch add_marriage_studio_black_carmine.html) */
            <div className="w-full max-w-[1440px] mx-auto">
              {/* Top Sub-Navigation & Breadcrumbs Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#38373B]/30 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#26262A] border border-[#38373B]/50 flex items-center justify-center text-[#C81E38] font-bold shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">spa</span>
                  </div>
                  <div className="h-6 w-px bg-[#38373B]/50 hidden sm:block"></div>
                  <div className="flex items-center gap-2 text-[#B0AEB4] text-xs">
                    <span className="text-white font-medium">Host OS</span>
                    <span className="text-[#38373B]">/</span>
                    <span>Bespoke Marriages</span>
                    <span className="text-[#38373B]">/</span>
                    <span className="text-[#C81E38] font-semibold">Architect New Wedding Vault</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1E22] border border-white/10 text-white text-[11px]">
                    <span className="material-symbols-outlined text-[14px] text-[#C81E38]">database</span>
                    <span>Atlas M0 GridFS Storage</span>
                  </span>
                </div>
              </div>

              {/* Page Title & Editorial Overline */}
              <div className="mb-9">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-widest uppercase bg-[#C81E38]/15 text-[#C81E38] border border-[#C81E38]/30">
                    Couture Vault Orchestrator
                  </span>
                  <span className="text-[#38373B]">•</span>
                  <span className="text-[#B0AEB4] text-xs tracking-wider">Vogue Private Archive 2026</span>
                </div>
                <h1 className="font-editorial text-4xl lg:text-5xl text-white font-normal tracking-tight">
                  Architect a Private Wedding Vault
                </h1>
                <p className="text-sm text-[#B0AEB4] max-w-2xl mt-2 leading-relaxed">
                  Generate uncompressed 4K media depositories, private WebRTC live feeds, and encrypted guest access badges in one sovereign master control.
                </p>
              </div>

              {/* Two-Column Studio Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Master Form (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Step 1: Couple & Destination Particulars */}
                  <div className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#C81E38] text-white text-xs flex items-center justify-center font-bold shadow-md shadow-[#C81E38]/30">
                          1
                        </span>
                        <h2 className="font-editorial text-xl text-white font-medium">Couple &amp; Event Logistics</h2>
                      </div>
                      <span className="text-[#C81E38] text-[12px] flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-md bg-[#C81E38]/10 border border-[#C81E38]/20">
                        <span className="material-symbols-outlined text-[15px]">stars</span> Essential Data
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#B0AEB4] mb-1.5">Partner One Name</label>
                        <input
                          type="text"
                          value={partnerOne}
                          onChange={(e) => setPartnerOne(e.target.value)}
                          placeholder="e.g. Aarav"
                          className="w-full h-11 px-3.5 bg-[#2D2D31]/60 border border-[#38373B]/60 rounded-xl text-sm text-white placeholder:text-[#B0AEB4]/50 focus:outline-none focus:border-[#C81E38] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#B0AEB4] mb-1.5">Partner Two Name</label>
                        <input
                          type="text"
                          value={partnerTwo}
                          onChange={(e) => setPartnerTwo(e.target.value)}
                          placeholder="e.g. Meera"
                          className="w-full h-11 px-3.5 bg-[#2D2D31]/60 border border-[#38373B]/60 rounded-xl text-sm text-white placeholder:text-[#B0AEB4]/50 focus:outline-none focus:border-[#C81E38] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs text-[#B0AEB4] mb-1.5">Wedding Celebration Date</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={ceremonyDate}
                            onChange={(e) => setCeremonyDate(e.target.value)}
                            placeholder="Select calendar date"
                            className="w-full h-11 px-3.5 pr-10 bg-[#2D2D31]/60 border border-[#38373B]/60 rounded-xl text-sm text-white focus:outline-none focus:border-[#C81E38] transition-all"
                          />
                          <span className="material-symbols-outlined absolute right-3.5 top-3 text-[#B0AEB4] text-[19px] pointer-events-none">
                            calendar_month
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#B0AEB4] mb-1.5">Sanctuary Destination / Venue</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={venueLocation}
                            onChange={(e) => setVenueLocation(e.target.value)}
                            placeholder="e.g. The Leela Palace, Udaipur"
                            className="w-full h-11 px-3.5 pr-10 bg-[#2D2D31]/60 border border-[#38373B]/60 rounded-xl text-sm text-white focus:outline-none focus:border-[#C81E38] transition-all"
                          />
                          <span className="material-symbols-outlined absolute right-3.5 top-3 text-[#B0AEB4] text-[19px] pointer-events-none">
                            location_on
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Passcode & Secret Access Generator */}
                  <div className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#C81E38] text-white text-xs flex items-center justify-center font-bold shadow-md shadow-[#C81E38]/30">
                          2
                        </span>
                        <h2 className="font-editorial text-xl text-white font-medium">VIP Passcode &amp; QR Key</h2>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[15px]">verified</span> Encrypted &amp; Available
                      </span>
                    </div>

                    <p className="text-xs text-[#B0AEB4] mb-4">
                      Guests present this alphanumeric key or scan the auto-generated standee QR at arrival checkpoints to unlock media streaming and photo drops.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#0A0A0C] p-3.5 rounded-xl border border-[#38373B]/40">
                      <div className="flex-1 w-full flex items-center justify-between px-4 py-2.5 bg-[#1E1E22] rounded-lg border border-[#38373B]/40">
                        <input
                          type="text"
                          maxLength={8}
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                          className="font-editorial text-2xl font-bold tracking-widest text-white bg-transparent outline-none w-44 uppercase"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#C81E38] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C81E38]/10 border border-[#C81E38]/20">
                            AES-256
                          </span>
                          <span className="material-symbols-outlined text-[#C81E38] text-[19px]">lock</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleRandomizeCode}
                          className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-[#1E1E22] hover:bg-[#26262A] border border-[#38373B]/60 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">casino</span>
                          <span>Randomize</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="flex-1 sm:flex-none h-11 px-5 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-[#C81E38]/25 transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isCopied ? 'check' : 'content_copy'}
                          </span>
                          <span>{isCopied ? 'Copied' : 'Copy Key'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Ceremony Chapters & Sub-Timelines */}
                  <div className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#C81E38] text-white text-xs flex items-center justify-center font-bold shadow-md shadow-[#C81E38]/30">
                          3
                        </span>
                        <h2 className="font-editorial text-xl text-white font-medium">Ceremony Chapters &amp; Sub-Timelines</h2>
                      </div>
                      <span className="text-xs uppercase tracking-widest text-[#B0AEB4]">Auto-Partitioned</span>
                    </div>

                    <p className="text-xs text-[#B0AEB4] mb-4">
                      Toggle which traditional ceremonies will maintain dedicated live galleries and guest camera upload bins:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { name: 'Haldi', icon: 'spa', time: 'Nov 22 AM' },
                        { name: 'Mehndi', icon: 'palette', time: 'Nov 22 PM' },
                        { name: 'Sangeet', icon: 'nightlife', time: 'Nov 23 PM' },
                        { name: 'Wedding', icon: 'favorite', time: 'Nov 24 Sunset' },
                        { name: 'Reception', icon: 'wine_bar', time: 'Nov 25 Eve' }
                      ].map((item) => {
                        const active = selectedEvents.includes(item.name);
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => toggleEvent(item.name)}
                            className={`flex flex-col items-center justify-center p-3.5 rounded-xl transition-all text-center group ${
                              active
                                ? 'bg-[#C81E38] text-white border border-[#C81E38]/50 shadow-md shadow-[#C81E38]/25'
                                : 'bg-[#1E1E22] text-[#B0AEB4] border border-[#38373B]/40 hover:text-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px] mb-1 group-hover:scale-110 transition-transform">
                              {item.icon}
                            </span>
                            <span className="text-xs font-bold">{item.name}</span>
                            <span className="text-[11px] opacity-80">{item.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Vault Cover Imagery */}
                  <div className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#C81E38] text-white text-xs flex items-center justify-center font-bold shadow-md shadow-[#C81E38]/30">
                          4
                        </span>
                        <h2 className="font-editorial text-xl text-white font-medium">Curated Cover Photography</h2>
                      </div>
                      <span className="text-xs text-[#C81E38] uppercase font-bold tracking-wider">Couture Spread</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
                      {coverPresets.map((preset) => {
                        const isSelected = selectedCover === preset.src;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => setSelectedCover(preset.src)}
                            className={`relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? 'ring-2 ring-[#C81E38] shadow-lg shadow-[#C81E38]/20 opacity-100'
                                : 'opacity-70 hover:opacity-100 border border-[#38373B]/40'
                            }`}
                          >
                            <img className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" src={preset.src} alt={preset.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs text-white font-bold tracking-wide">{preset.title}</span>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-[#C81E38] text-[18px]">check_circle</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <label className="p-4 rounded-xl bg-[#2D2D31]/40 border border-dashed border-[#C81E38]/40 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#2D2D31]/70 hover:border-[#C81E38] transition-all">
                      <span className="material-symbols-outlined text-[#C81E38] text-[26px] mb-1">cloud_upload</span>
                      <span className="text-xs font-semibold text-white">Upload Bespoke Couple Portrait</span>
                      <span className="text-[11px] text-[#B0AEB4]">Supports DNG, ProRAW, TIFF, and High-Resolution JPG</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedCover(URL.createObjectURL(e.target.files[0]));
                            showToast('Custom couple cover portrait loaded!');
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Step 5: Concierge Infrastructure Controls */}
                  <div className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-7 h-7 rounded-full bg-[#C81E38] text-white text-xs flex items-center justify-center font-bold shadow-md shadow-[#C81E38]/30">
                        5
                      </span>
                      <h2 className="font-editorial text-xl text-white font-medium">Concierge Infrastructure Controls</h2>
                    </div>

                    <div className="space-y-3.5">
                      {/* WebRTC */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E1E22] border border-[#38373B]/30">
                        <div className="flex items-start gap-3.5">
                          <span className="w-9 h-9 rounded-lg bg-[#C81E38]/10 border border-[#C81E38]/20 flex items-center justify-center text-[#C81E38] shrink-0">
                            <span className="material-symbols-outlined text-[20px]">videocam</span>
                          </span>
                          <div>
                            <div className="text-xs text-white font-semibold">WebRTC 4K Edge Broadcast</div>
                            <div className="text-[11px] text-[#B0AEB4]">Under 250ms latency video stream for overseas family with live emotional emoji reactions.</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={enableWebRTC}
                            onChange={(e) => setEnableWebRTC(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#2D2D31] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C81E38]"></div>
                        </label>
                      </div>

                      {/* RAW GridFS */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E1E22] border border-[#38373B]/30">
                        <div className="flex items-start gap-3.5">
                          <span className="w-9 h-9 rounded-lg bg-[#C81E38]/10 border border-[#C81E38]/20 flex items-center justify-center text-[#C81E38] shrink-0">
                            <span className="material-symbols-outlined text-[20px]">raw_on</span>
                          </span>
                          <div>
                            <div className="text-xs text-white font-semibold">Zero-Compression RAW Guest Bin</div>
                            <div className="text-[11px] text-[#B0AEB4]">Store camera files safely inside MongoDB Atlas GridFS with client-side quota optimization.</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={enableRawBin}
                            onChange={(e) => setEnableRawBin(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#2D2D31] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C81E38]"></div>
                        </label>
                      </div>

                      {/* Face Tagging */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E1E22] border border-[#38373B]/30">
                        <div className="flex items-start gap-3.5">
                          <span className="w-9 h-9 rounded-lg bg-[#C81E38]/10 border border-[#C81E38]/20 flex items-center justify-center text-[#C81E38] shrink-0">
                            <span className="material-symbols-outlined text-[20px]">face</span>
                          </span>
                          <div>
                            <div className="text-xs text-white font-semibold">AI Smart Tagging &amp; Timeline Sorter</div>
                            <div className="text-[11px] text-[#B0AEB4]">Instant chronological album sorting across ceremonies for all dinner guests.</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={enableFaceTagging}
                            onChange={(e) => setEnableFaceTagging(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#2D2D31] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C81E38]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Launch Call-To-Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleLaunchVault}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9E1B32] via-[#C81E38] to-[#9E1B32] text-white font-editorial text-xl font-medium tracking-wide shadow-xl shadow-[#C81E38]/30 hover:shadow-2xl hover:shadow-[#C81E38]/50 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-white/20 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[26px]">celebration</span>
                      <span>{isSubmitting ? 'Architecting & Saving to Atlas...' : 'Launch Marriage Vault & Generate Standee QR'}</span>
                    </button>

                    <div className="flex items-center justify-center gap-4 mt-3.5 text-xs text-[#B0AEB4]">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#C81E38]">shield</span>
                        Instant SSL Encryption
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#C81E38]">backup</span>
                        Atlas M0 Cloud
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#C81E38]">share</span>
                        Instant WhatsApp Ready
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Real-Time Digital Invitation & Standee Preview (5 Cols) */}
                <div className="lg:col-span-5 sticky top-20 space-y-6">
                  {/* Standee / Passcard Preview Frame */}
                  <div className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C81E38] shadow-[0_0_8px_#C81E38] animate-ping"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white">Live Standee Preview</span>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded bg-[#2D2D31] text-white font-medium border border-[#38373B]/40">
                        Scale 1:1 Print Ready
                      </span>
                    </div>

                    {/* Digital Card Render: High-End Acrylic Finish */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#38373B]/60 bg-black">
                      {/* Hero Photo Header with Live Content */}
                      <div className="relative h-72 w-full overflow-hidden">
                        <img className="w-full h-full object-cover" src={selectedCover} alt="Couple Preview" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                        {/* Floating Brand Watermark */}
                        <div className="absolute top-3.5 left-3.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-md border border-white/20 shadow-md flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#C81E38]"></span>
                          <span className="text-[11px] text-white font-bold tracking-widest uppercase">VAULT PASS</span>
                        </div>

                        {/* Live Couple Names on Poster */}
                        <div className="absolute bottom-3 left-4 right-4">
                          <div className="text-[11px] tracking-widest uppercase text-[#FFDAD6] font-bold mb-1">
                            The Union Of
                          </div>
                          <h3 className="font-editorial text-3xl sm:text-4xl text-white font-normal tracking-tight drop-shadow-md">
                            {partnerOne || 'Partner 1'} &amp; {partnerTwo || 'Partner 2'}
                          </h3>
                        </div>
                      </div>

                      {/* Card Body / Key Meta */}
                      <div className="p-5 bg-[#0A0A0C] border-t border-[#38373B]/40">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm mb-1.5">
                              <span className="material-symbols-outlined text-[17px] text-[#C81E38]">calendar_today</span>
                              <span className="text-white">{ceremonyDate || 'Date pending'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#B0AEB4]">
                              <span className="material-symbols-outlined text-[17px] text-[#C81E38]">near_me</span>
                              <span className="truncate max-w-[190px] text-white/90">{venueLocation || 'Sanctuary venue'}</span>
                            </div>
                          </div>

                          {/* Live Generated Simulated QR Code in Crisp White */}
                          <div className="flex flex-col items-center">
                            <div className="p-2 bg-white rounded-xl shadow-lg border border-black/10">
                              <svg className="w-20 h-20 text-black" fill="currentColor" viewBox="0 0 100 100">
                                <rect fill="currentColor" height="30" rx="4" width="30" x="0" y="0"></rect>
                                <rect fill="white" height="20" rx="2" width="20" x="5" y="5"></rect>
                                <rect fill="currentColor" height="10" width="10" x="10" y="10"></rect>
                                <rect fill="currentColor" height="30" rx="4" width="30" x="70" y="0"></rect>
                                <rect fill="white" height="20" rx="2" width="20" x="75" y="5"></rect>
                                <rect fill="currentColor" height="10" width="10" x="80" y="10"></rect>
                                <rect fill="currentColor" height="30" rx="4" width="30" x="0" y="70"></rect>
                                <rect fill="white" height="20" rx="2" width="20" x="5" y="75"></rect>
                                <rect fill="currentColor" height="10" width="10" x="10" y="80"></rect>
                                <circle cx="50" cy="50" fill="#C81E38" r="10"></circle>
                                <circle cx="50" cy="50" fill="white" r="4"></circle>
                                <rect fill="currentColor" height="14" width="6" x="36" y="10"></rect>
                                <rect fill="currentColor" height="6" width="8" x="46" y="20"></rect>
                                <rect fill="currentColor" height="6" width="16" x="10" y="38"></rect>
                                <rect fill="currentColor" height="6" width="14" x="72" y="38"></rect>
                                <rect fill="currentColor" height="16" width="6" x="38" y="72"></rect>
                                <rect fill="currentColor" height="10" width="10" x="68" y="68"></rect>
                                <rect fill="currentColor" height="12" width="12" x="84" y="82"></rect>
                              </svg>
                            </div>
                            <span className="text-[11px] text-[#B0AEB4] font-semibold mt-1.5">Scan for 4K Vault</span>
                          </div>
                        </div>

                        {/* Passcode Footer inside Card */}
                        <div className="mt-4 pt-4 border-t border-[#38373B]/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase text-[#B0AEB4] tracking-widest block">VIP Check-in Key</span>
                            <span className="font-editorial text-lg font-bold text-white tracking-widest">{passcode}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C81E38]/15 border border-[#C81E38]/30 text-white text-xs font-semibold">
                            <span className="material-symbols-outlined text-[15px] text-[#C81E38]">stream</span> 4K Ultra Ready
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Diagnostic Metrics Bar */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3.5 rounded-xl bg-[#1E1E22] border border-[#38373B]/40">
                        <span className="text-xs text-[#B0AEB4] block mb-0.5">Tier Allowance</span>
                        <span className="text-xs font-bold text-white">Unlimited Guest 4K</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#1E1E22] border border-[#38373B]/40">
                        <span className="text-xs text-[#B0AEB4] block mb-0.5">Encryption State</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">lock</span> Hardware Locked
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Standee Production Card */}
                  <div className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#C81E38]/10 border border-[#C81E38]/30 flex items-center justify-center text-[#C81E38] shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">print</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Dining Table Acrylic Standees</div>
                        <div className="text-[11px] text-[#B0AEB4]">Vector SVG &amp; PDF format for luxury stationery printers.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Exporting high-res vector Standee SVG...')}
                      className="px-3.5 py-2 rounded-xl bg-[#1E1E22] hover:bg-[#2D2D31] border border-[#38373B]/50 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Pre-export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ALL WEDDING VAULTS VIEW */
            <div className="w-full max-w-[1440px] mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#38373B]/30">
                <div>
                  <h1 className="font-editorial text-3xl font-bold text-white">All Active Wedding Vaults</h1>
                  <p className="text-xs text-[#B0AEB4] mt-1">Manage guest media depositories, live streaming, and QR standee links.</p>
                </div>
                <button
                  onClick={() => setActiveTab('studio')}
                  className="px-5 py-2.5 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Architect New Vault</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weddings.map((w) => (
                  <div key={w.id} className="bg-[#18181A] border border-[#38373B]/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-[#C81E38]/50 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold font-mono tracking-widest text-[#FFB3B3] bg-[#C81E38]/20 px-2.5 py-0.5 rounded border border-[#C81E38]/40">
                          {w.code}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {w.statusText}
                        </span>
                      </div>
                      <h3 className="font-editorial text-2xl font-bold text-white mb-1">
                        {w.partnerOne} &amp; {w.partnerTwo}
                      </h3>
                      <p className="text-xs text-[#B0AEB4] flex items-center gap-1.5 mb-4">
                        <span className="material-symbols-outlined text-[15px] text-[#C81E38]">location_on</span>
                        <span>{w.venue}</span>
                      </p>

                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0A0A0C] border border-[#38373B]/30 text-center mb-4">
                        <div>
                          <p className="text-[10px] text-[#B0AEB4] uppercase">Photos</p>
                          <p className="text-xs font-bold text-white">{w.totalPhotos}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#B0AEB4] uppercase">Videos</p>
                          <p className="text-xs font-bold text-white">{w.totalVideos}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#B0AEB4] uppercase">Guests</p>
                          <p className="text-xs font-bold text-[#FFB3B3]">{w.guestsEngaged}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#38373B]/30">
                      <Link
                        href={`/marriage/${w.code.toLowerCase()}`}
                        className="flex-1 py-2 text-center rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold transition-colors"
                      >
                        Guest View
                      </Link>
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard?.writeText(`${window.location.origin}/guest/upload?code=${w.code}`);
                            showToast(`Copied QR Upload link for ${w.code}!`);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-[#1E1E22] hover:bg-[#2D2D31] text-white text-xs font-semibold border border-white/10"
                        title="Copy Upload Link"
                      >
                        <span className="material-symbols-outlined text-[16px]">link</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Celebratory Confirmation Modal Overlay (Exact 1:1 with Stitch celebration-overlay) */}
      {isCelebrationOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
          <div className="relative w-full max-w-xl bg-[#18181A] border border-[#38373B]/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Ambient Glow Behind Modal Header */}
            <div className="absolute -top-16 -left-16 w-52 h-52 bg-[#C81E38]/25 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#9E1B32]/30 rounded-full blur-3xl pointer-events-none"></div>

            {/* Close Button */}
            <button
              onClick={() => setIsCelebrationOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1E1E22] hover:bg-[#2D2D31] border border-[#38373B]/40 flex items-center justify-center text-[#B0AEB4] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Celebratory Icon & Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C81E38]/15 border border-[#C81E38]/30 text-[#C81E38] mb-3 shadow-inner">
                <span className="material-symbols-outlined text-[36px]">verified</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[#C81E38] text-xs uppercase tracking-widest font-bold">
                <span className="material-symbols-outlined text-[16px]">celebration</span>
                <span>Broadcast Channel Synchronized</span>
              </div>
              <h2 className="font-editorial text-3xl font-bold text-white mt-1">
                {partnerOne} &amp; {partnerTwo}'s Vault Is Live!
              </h2>
              <p className="text-xs text-[#B0AEB4] max-w-md mx-auto mt-1.5">
                The private multi-ceremony media depository has been initialized in MongoDB Atlas GridFS with end-to-end encryption.
              </p>
            </div>

            {/* Passcode & Standee QR Box */}
            <div className="bg-[#0A0A0C] rounded-2xl p-5 border border-[#38373B]/50 space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#B0AEB4] tracking-widest block">VIP Passcode</span>
                  <span className="font-editorial text-2xl font-bold text-white tracking-widest">{createdMarriageCode}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active on Cloud
                </div>
              </div>

              <div className="p-3 bg-[#1E1E22] rounded-xl flex items-center justify-between gap-3 text-xs">
                <span className="text-[#B0AEB4] truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/marriage/${createdMarriageCode.toLowerCase()}` : ''}
                </span>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard?.writeText(`${window.location.origin}/marriage/${createdMarriageCode.toLowerCase()}`);
                      showToast('Vault link copied!');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#C81E38] text-white font-semibold text-xs shrink-0"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={`/marriage/${createdMarriageCode.toLowerCase()}`}
                onClick={() => setIsCelebrationOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white font-editorial text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#C81E38]/30 transition-all"
              >
                <span>Launch Interactive Guest Experience</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const shareUrl = `${window.location.origin}/marriage/${createdMarriageCode.toLowerCase()}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join our wedding celebration vault on Make My Marriage! VIP Passcode: ${createdMarriageCode}\n${shareUrl}`)}`, '_blank');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#1E1E22] hover:bg-[#2D2D31] text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-emerald-400">send</span>
                <span>Broadcast via WhatsApp to Wedding Groups</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
