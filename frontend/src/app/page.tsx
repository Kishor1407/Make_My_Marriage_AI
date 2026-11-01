'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import api from '@/lib/api';

interface CelebrationRegistryItem {
  couple: string;
  avatar: string;
  status: string;
  venue: string;
  photos: string;
  attendees: string;
  themeColor: string;
}

const CELEBRATION_REGISTRY: Record<string, CelebrationRegistryItem> = {
  'RAHUL24': {
    couple: 'Rahul & Anjali',
    avatar: 'R&A',
    status: 'Live Haldi Stream',
    venue: 'The Leela Palace, South Goa • Sundowner Pavilion',
    photos: '520 Uncompressed Photos',
    attendees: '184 Family & Friends active',
    themeColor: '#cca72f'
  },
  'VIKPRI24': {
    couple: 'Vikram & Priya',
    avatar: 'V&P',
    status: 'Live Sangeet Night',
    venue: 'The Oberoi Udaivilas, Udaipur • Lakeside Courtyard',
    photos: '840 Uncompressed Photos',
    attendees: '312 Family & Friends active',
    themeColor: '#006687'
  },
  'ARJMEE24': {
    couple: 'Arjun & Meera',
    avatar: 'A&M',
    status: 'Mehndi & Welcome Feast',
    venue: 'Rayong Seaside Resort, Thailand • Andaman Lawn',
    photos: '410 Uncompressed Photos',
    attendees: '145 Family & Friends active',
    themeColor: '#735c00'
  },
  'SAMTAN24': {
    couple: 'Sameer & Tanvi',
    avatar: 'S&T',
    status: 'Vault Secured',
    venue: 'Radisson Blu Resort, Alibaug • Coconut Grove',
    photos: '310 Uncompressed Photos',
    attendees: '98 Family & Friends active',
    themeColor: '#004b6f'
  }
};

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // PIN / Passcode State
  const [pinDigits, setPinDigits] = useState(['R', 'A', 'H', 'U', 'L', '2']);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; isSuccess?: boolean } | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCode, setModalCode] = useState('RAHUL24');
  const [modalCouple, setModalCouple] = useState('Rahul & Anjali');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isGuestSuiteOpen, setIsGuestSuiteOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyData, setPolicyData] = useState({ title: '', desc: '', icon: 'speed' });

  // Curated Celebrations for Grid
  const celebrations = [
    {
      id: 'rahul-anjali',
      couple: 'Rahul & Anjali',
      code: 'RAHUL24',
      category: 'beachfront',
      location: 'Coastal Goa Celebration',
      venue: 'The Leela Palace, South Goa',
      badge: 'HALDI STREAM',
      badgeType: 'live',
      photos: 520,
      videos: 8,
      guests: 184,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrrJp8H5k4Kn9lsGcBSJkIvsyJ0WaekgNeXIJlRo8becUl0yxex3uelYPo8SCGer_N6xS0iKWc0WCpnXo59Eg70UhVYjNdmNaRIPxeQdSzuQBEs2vlCDd-msm3JtTpVwt4jwaqXaVd3EOQSr_foYp6ygVqlNf7E2y1mmzNrvJF6ECLO8U1JkWRb9Eu0Dd6qUh0_eNBjRA-_tB9XnFCUNtrkHV4eKGEp1ZoJEDihBk'
    },
    {
      id: 'vikram-priya',
      couple: 'Vikram & Priya',
      code: 'VIKPRI24',
      category: 'royal',
      location: 'Udaipur Lake Palace',
      venue: 'The Oberoi Udaivilas, Udaipur',
      badge: 'LIVE NOW • SANGEET',
      badgeType: 'live',
      photos: 840,
      videos: 12,
      guests: 312,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoWB-VLDfrThPPxnllFL5MhYAjbGirUSK5IrNJ2opW92LBMQo2KS0uguSPF4ayFX4jxtJRNJaoUVZ3nrQ6vGFyaMlWJUGJ8M4zCssFa09cce3cokCD_swrh7iOmneYUZPGKhsPThqKwkygQK3LXTXRC3Q0lbruEF04qgFdYi-5Ih4n5_V48UdP_uestpxRCocUpt5iqvRakiKo9Iv5n-7eSFSdzFkp78qUDgYPq24'
    },
    {
      id: 'sameer-tanvi',
      couple: 'Sameer & Tanvi',
      code: 'SAMTAN24',
      category: 'intimate',
      location: 'Alibaug Beach Retreat',
      venue: 'Radisson Blu Resort, Alibaug',
      badge: 'VAULT SECURED',
      badgeType: 'secured',
      photos: 310,
      videos: 4,
      guests: 98,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWJccZA13DdqBZUU5cIjXtljFmPORVHN8HjpsXBRewnhfBvJ3NwW-dpYOibjzDC5PBkNfu_OXQRhWzXuUkLi-Pa7hXS--6qYzsg6DlxL_TFw1loKXCgCp4mRrmVGE-hHdYlHoSQAIL2AXNR7Q2pS_USmCvIdO-S3PqSm4FTR_hmGarQMxc4zQK6TzOipu3uf5Js6WK2AQMvSqnmVqpRGpvaFk0Eq1_5jSo7tYArdE'
    },
    {
      id: 'arjun-meera',
      couple: 'Arjun & Meera',
      code: 'ARJMEE24',
      category: 'beachfront',
      location: 'Rayong Seaside Resort',
      venue: 'Rayong Seaside Resort, Thailand',
      badge: 'MEHNDI VAULT',
      badgeType: 'vault',
      photos: 410,
      videos: 6,
      guests: 145,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6g9Pz_yA_3bO7VnQfrBKKc2cf_qvRFiogh7nVHa9o-2y0SerT2MSs1iABIo6Wkg-P63KMFe9aLuJx6bfSDIPxawUrNYuniGKo0aimH-bAVHDchzetMF-XWG_t6GcVy4yJuWINZwYQCtUUkQUBXsm-h2QOnOwoa4Xzvx7lzCh1qRx70R6bnH_ci7DLJa16NUayzAMh-YIDDfbDAzPSIqZU09hX5r6zVPycW4tB0Ww'
    }
  ];

  // Dynamic Current Code computation
  const currentCode = pinDigits.join('').trim().toUpperCase();
  const currentPreview = CELEBRATION_REGISTRY[currentCode] || null;

  const showToast = (title: string, desc: string, isSuccess = true) => {
    setToastMessage({ title, desc, isSuccess });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDigitChange = (index: number, val: string) => {
    const uppercaseVal = val.toUpperCase().slice(-1);
    const updated = [...pinDigits];
    updated[index] = uppercaseVal;
    setPinDigits(updated);

    if (uppercaseVal && index < 5) {
      const nextInput = document.getElementById(`hero-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`hero-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const applyPreset = (code: string) => {
    const chars = code.split('');
    const padded = [chars[0] || '', chars[1] || '', chars[2] || '', chars[3] || '', chars[4] || '', chars[5] || ''];
    setPinDigits(padded);
    showToast(`Passcode Loaded: ${code}`, `Connected to ${CELEBRATION_REGISTRY[code]?.couple || 'Celebration'}`);
  };

  const handleUnlockProceed = async (overrideCode?: string) => {
    const targetCode = (overrideCode || currentCode || 'RAHUL24').toUpperCase();

    if (targetCode.length < 4) {
      showToast('Incomplete Passcode', 'Please enter your 6-digit invitation code.', false);
      return;
    }

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await api.post('/auth/guest/login', { marriageCode: targetCode });
      if (res.data?.user) {
        dispatch(setUser(res.data.user));
        if (res.data.token && typeof window !== 'undefined') {
          localStorage.setItem('mmm_token', res.data.token);
        }
      }
      setIsVerifying(false);
      setIsModalOpen(false);
      showToast('Vault Decrypted', `Accessing ${currentPreview?.couple || targetCode}'s celebration...`);
      router.push(`/marriage/${targetCode.toLowerCase()}`);
    } catch {
      // Demo fallback if testing pre-loaded stitch demonstrations
      if (['RAHUL24', 'VIKPRI24', 'ARJMEE24', 'SAMTAN24'].includes(targetCode)) {
        setIsVerifying(false);
        setIsModalOpen(false);
        showToast('Demo Access Granted', `Opening ${CELEBRATION_REGISTRY[targetCode]?.couple || targetCode}'s celebration...`);
        router.push(`/marriage/${targetCode.toLowerCase()}`);
      } else {
        setIsVerifying(false);
        setAuthError('Invalid marriage passcode. Please check your wedding invitation.');
        showToast('Passcode Unrecognized', 'Passcode does not match any active wedding vault.', false);
      }
    }
  };

  const copyPasscodeLink = () => {
    const code = currentCode || 'RAHUL24';
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/marriage/${code.toLowerCase()}`;
      navigator.clipboard?.writeText(url);
      showToast('Direct Link Copied', `Guest invite link for [${code}] copied to clipboard.`);
    }
  };

  const openModal = (code: string, couple: string) => {
    setModalCode(code);
    setModalCouple(couple);
    const chars = code.split('');
    setPinDigits([chars[0] || '', chars[1] || '', chars[2] || '', chars[3] || '', chars[4] || '', chars[5] || '']);
    setIsModalOpen(true);
  };

  const openPolicy = (title: string, desc: string, icon: string) => {
    setPolicyData({ title, desc, icon });
    setIsPolicyModalOpen(true);
  };

  const filteredCelebrations =
    activeFilter === 'all'
      ? celebrations
      : celebrations.filter((c) => c.category === activeFilter);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <span className={`material-symbols-outlined text-[20px] ${toastMessage.isSuccess ? 'text-secondary' : 'text-amber-400'}`}>
            {toastMessage.isSuccess ? 'check_circle' : 'info'}
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-semibold">{toastMessage.title}</span>
            <span className="font-body-sm text-xs text-slate-300">{toastMessage.desc}</span>
          </div>
        </div>
      )}

      {/* Subtle decorative ambient glow backdrops */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-primary/10 via-secondary-container/20 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-96 right-10 w-96 h-96 bg-tertiary-fixed/15 blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* 1. EDITORIAL SPLIT-SCREEN LUXURY GATEWAY (Stitch AI Screen a219a4e2ad1b4658972db161fbe43353) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 lg:pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Passcode Entry & Reactive Vault Preview */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pr-4">
              {/* Eyebrow Ribbon */}
              <div
                className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 text-amber-800 text-xs font-semibold tracking-wide cursor-pointer hover:scale-105 transition-transform"
                onClick={() =>
                  openPolicy(
                    'Private Hardware Encryption',
                    '256-bit AES encryption ensures only authenticated invitees with the wedding passkey or QR code can access the media stream.',
                    'shield'
                  )
                }
              >
                <span className="material-symbols-outlined text-[15px] text-amber-600">verified</span>
                <span>Exclusive Private Wedding Portal</span>
              </div>

              {/* Headline & Value Pitch */}
              <div className="space-y-3">
                <h1 className="font-headline text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-on-surface tracking-tight leading-[1.15]">
                  Enter Your Marriage Passcode to Access the Celebration.
                </h1>
                <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-xl">
                  Stream uncompressed 4K ceremonies, view ultra-high-resolution photo albums, and share blessings in real time. Private, invitation-only, and ad-free.
                </p>
              </div>

              {/* PRIMARY INTERACTIVE GATEWAY BOX */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-outline-variant/30 space-y-5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
                    6-Digit Invitation Passkey
                  </span>
                  <span className="text-xs text-on-surface-variant flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                    Protected Vault
                  </span>
                </div>

                {/* 6 Individual PIN/Character Boxes */}
                <div className="flex items-center justify-between gap-2 sm:gap-3" id="hero-pin-boxes">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`hero-pin-${index}`}
                      type="text"
                      maxLength={1}
                      value={pinDigits[index]}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      className="w-12 sm:w-14 h-14 text-center font-display text-xl sm:text-2xl font-bold uppercase rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-on-surface-variant pt-1">
                  <span className="font-medium">Try Sample Passcodes:</span>
                  <button
                    onClick={() => applyPreset('RAHUL24')}
                    className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-mono font-bold transition-all shadow-xs"
                  >
                    RAHUL24
                  </button>
                  <button
                    onClick={() => applyPreset('VIKPRI24')}
                    className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-mono font-bold transition-all shadow-xs"
                  >
                    VIKPRI24
                  </button>
                  <button
                    onClick={() => applyPreset('ARJMEE24')}
                    className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-mono font-bold transition-all shadow-xs"
                  >
                    ARJMEE24
                  </button>
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-semibold flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                    <span>Scan QR</span>
                  </button>
                </div>

                {/* DYNAMIC LIVE VAULT FOUND PREVIEW CARD */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/70 to-blue-50/50 border border-amber-200/80 transition-all flex flex-col space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
                        {currentPreview ? currentPreview.avatar : (currentCode.slice(0, 2) || 'MM')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline font-bold text-on-surface text-base">
                            {currentPreview ? currentPreview.couple : (currentCode.length >= 4 ? `Celebration [${currentCode}]` : 'Private Celebration Vault')}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 animate-pulse">
                            {currentPreview ? currentPreview.status : 'Invitation Protected'}
                          </span>
                        </div>
                        <p className="font-body text-xs text-on-surface-variant">
                          {currentPreview ? currentPreview.venue : 'Destination Venue • Ready for passcode decryption'}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/40">
                      {currentCode || '------'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-black/5">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-primary">photo_camera</span>
                      <span>{currentPreview ? currentPreview.photos : 'High-Resolution Media Stream'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">group</span>
                      <span>{currentPreview ? currentPreview.attendees : 'Authorized Guests Only'}</span>
                    </span>
                  </div>
                </div>

                {/* Main CTA Unlock Button */}
                <div className="space-y-3 pt-1">
                  <button
                    onClick={() => handleUnlockProceed()}
                    disabled={isVerifying}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-container hover:opacity-95 text-on-primary font-headline text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-900/20 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        <span>Decrypting Private Cloud...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">lock_open</span>
                        <span>{currentPreview ? `Enter ${currentPreview.couple}'s Vault` : 'Enter Celebration Vault'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                    <button
                      onClick={copyPasscodeLink}
                      className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">share</span>
                      <span>Copy Direct Passkey Link</span>
                    </button>
                    <button
                      onClick={() => setIsHelpModalOpen(true)}
                      className="hover:underline text-on-surface-variant"
                      type="button"
                    >
                      Lost code? Help Desk
                    </button>
                  </div>
                </div>
              </div>

              {/* High-Trust Minimal Badge Ribbon */}
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-on-surface-variant pt-1 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">shield</span>
                  256-Bit Private Encryption
                </span>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-primary">raw_on</span>
                  Zero Lossy Compression
                </span>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">admin_panel_settings</span>
                  Host Moderated
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Cinematic Editorial Visual Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-slate-900 group">
                {/* Master Luxury Destination Couple Photo */}
                <img
                  alt="Luxury Destination Wedding Couple Portrait"
                  className="w-full h-[460px] sm:h-[560px] lg:h-[620px] object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT_yf8HUr15vJOdqxd57TrvYiXOxiwihldlvBX83jJMQK0LhR75KY3pRW7U04j1kjv7l1aUB0yhnzQ79PlTgUxcoxUIvuyZuGCwWKOBl83Kw4-89gVR5UWU6-YA-6j9qBB49TNa_mOVE9MMEuBnlRa8eBSI3jeOre4nT8PhlAWT1z1nrK8HoeytF_jEJgsZpwbIyNcabx9fyu00k70kuiU_VTUSBM-6QjRTBlQI2Y"
                />

                {/* Warm Editorial Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />

                {/* Top Floating Badges */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold tracking-wider text-[11px] uppercase">Ultra 4K Edge Broadcast</span>
                  </div>

                  <button
                    onClick={() => {
                      applyPreset('RAHUL24');
                      handleUnlockProceed('RAHUL24');
                    }}
                    className="h-8 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Explore Live Showcase</span>
                  </button>
                </div>

                {/* Bottom Floating Card Details */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/80 backdrop-blur-sm text-slate-950 text-[11px] font-bold uppercase tracking-wider">
                    <span>Palacio Do Mar • Sunset Pavilion</span>
                  </div>

                  <div>
                    <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
                      Rahul &amp; Anjali’s Coastal Wedding
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-slate-200/90 line-clamp-2 max-w-md pt-1 drop-shadow">
                      Multi-camera Sony FX3 Cinema Line streaming live from Goa. Relatives across 14 countries connected with sub-second latency.
                    </p>
                  </div>

                  {/* Mini stats row inside picture */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/15 text-xs text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-300">videocam</span>
                      <span>8 Live Angles</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-300">favorite</span>
                      <span>420 Blessings Sent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-300">download</span>
                      <span>Instant RAW Keepsake</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle Ambient Glow Behind Card */}
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="absolute -top-6 -left-6 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
            </div>

          </div>
        </section>

        {/* 2. TRUST METRICS BAR */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <div className="bg-surface-container-low rounded-xl px-6 py-6 shadow-sm border border-outline-variant/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() => showToast('Broadcast SLA', 'Continuous WebRTC latency under 200ms globally')}
              >
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[20px]">stream</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">99.98%</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">Live Stream Uptime</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() => showToast('Hardware Vault', 'AES-256 GCM authenticated military grade encryption')}
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">256-Bit</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">Encrypted Vaults</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() => showToast('Zero Compression', 'Raw camera DNG & full 4K Dolby Vision supported')}
              >
                <div className="flex items-center gap-1.5 text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">photo_library</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">50,000+</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">High-Res Memories</span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() => showToast('Global CDN', 'Local caching points across Goa, Udaipur, Bali, & Lake Como')}
              >
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">120+</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">Destination Weddings</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CURATED GRID OF MARRIAGE CARDS */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full" id="active-celebrations">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-primary font-caption text-caption uppercase mb-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary inline-block animate-ping" />
                Private Cloud Archives
              </div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                Featured Active Celebrations
              </h2>
            </div>

            {/* Filter Pill Controls */}
            <div className="inline-flex p-1 bg-surface-container rounded-full overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All Couples' },
                { id: 'beachfront', label: 'Beachfront Luxury' },
                { id: 'royal', label: 'Royal Palace' },
                { id: 'intimate', label: 'Intimate Coastal' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all whitespace-nowrap font-medium ${
                    activeFilter === pill.id
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCelebrations.map((c) => (
              <div
                key={c.id}
                onClick={() => openModal(c.code, c.couple)}
                className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-outline-variant/30 cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden bg-surface-container">
                  <img
                    src={c.image}
                    alt={c.couple}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-black/20" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-caption text-caption shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${c.badgeType === 'live' ? 'bg-error animate-ping' : 'bg-primary'}`} />
                    <span className="font-bold">{c.badge}</span>
                  </div>

                  {/* Code Tag */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
                    <span className="font-mono font-bold">{c.code}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-surface">
                    <span className="font-caption text-caption uppercase text-surface-variant">
                      {c.location}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-white">
                      {c.couple}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 space-y-4">
                  <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">photo_camera</span>
                      <span>{c.photos} Photos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-error">videocam</span>
                      <span>{c.videos} Streams</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(c.code, c.couple);
                    }}
                    type="button"
                    className="w-full h-10 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span>Enter Code to View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FEATURE ARCHITECTURE HIGHLIGHT SECTION */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
          <div className="bg-surface-container rounded-2xl p-6 lg:p-12 shadow-sm border border-outline-variant/30 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="font-caption text-caption text-secondary uppercase font-semibold">Zero Quality Loss</span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Engineered for Destination Scale</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Every photograph, 4K reel, and drone capture uploaded by guests or official photographers is saved in uncompressed raw quality.
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => showToast('Infrastructure Report', '36 globally synchronized storage buckets active')}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[28px]">speed</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Sub-Second Delivery</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Edge CDN nodes at all major resort destinations.</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="font-caption text-caption text-tertiary uppercase font-semibold">Privacy First</span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Guest-Level Permissions</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Keep Haldi rituals, bridal suites, and evening afterparties contained to specific friend circles and families.
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-4 hover:border-tertiary/50 transition-colors cursor-pointer"
                  onClick={() => showToast('Permission Config', 'Custom segmented access tiers enabled')}
                >
                  <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-[28px]">shield_person</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Passcode Enforced</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">No indexed public search. Only authorized guests enter.</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="font-caption text-caption text-primary uppercase font-semibold">Live Real-Time Sync</span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Instant Guest Broadcasts</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Broadcast live ceremony streams to overseas elders and relatives who couldn&apos;t fly in.
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-4 hover:border-secondary/50 transition-colors cursor-pointer"
                  onClick={() => showToast('Streaming Server', 'Adaptive bitrate WebRTC engine operating smoothly')}
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[28px]">broadcast_on_personal</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Ultra-Low Latency</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Crystal clear WebRTC interactive streaming.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>

      {/* MODAL 1: SCAN TABLE STANDEE QR MODAL */}
      {isQrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl p-6 border border-outline-variant/30 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Scan Venue Table Standee</h3>
              <p className="font-body text-xs text-on-surface-variant">
                Aim your camera at the wedding invitation QR or dining table placard.
              </p>
            </div>

            {/* Simulated Scanner Viewport */}
            <div className="relative w-56 h-56 mx-auto rounded-xl bg-slate-950 border-2 border-dashed border-primary flex flex-col items-center justify-center overflow-hidden group">
              <div className="w-40 h-40 border-2 border-white/60 rounded-lg relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                <span className="material-symbols-outlined text-4xl text-white/80 animate-bounce">qr_code_2</span>
              </div>
              <div className="absolute bottom-2 text-[10px] text-slate-400 font-mono">Camera Scanner Ready</div>
            </div>

            <button
              onClick={() => {
                setIsQrModalOpen(false);
                applyPreset('RAHUL24');
                showToast('Table Standee Detected', 'Decoded Passcode [RAHUL24] for Rahul & Anjali');
                handleUnlockProceed('RAHUL24');
              }}
              type="button"
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-headline text-xs font-semibold hover:opacity-95 transition-all"
            >
              Simulate Scanning &quot;RAHUL24&quot; Table Code
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: HELP & CONCIERGE MODAL */}
      {isHelpModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsHelpModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl p-6 border border-outline-variant/30 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[22px]">contact_support</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">Need Invitation Code?</h3>
              <p className="font-body text-xs text-on-surface-variant">
                Marriage passcodes are printed on physical wedding cards or sent via WhatsApp groups.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/40">
                <span className="font-semibold block text-on-surface">1. Check your WhatsApp Invitation</span>
                <span className="text-on-surface-variant">Look for a 6-character code like RAHUL24 or VIKPRI24.</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/40">
                <span className="font-semibold block text-on-surface">2. Scan Physical Table Standee</span>
                <span className="text-on-surface-variant">Each reception banquet table has a direct QR code for instant entry.</span>
              </div>
            </div>

            <button
              onClick={() => {
                applyPreset('RAHUL24');
                setIsHelpModalOpen(false);
              }}
              type="button"
              className="w-full h-10 rounded-lg bg-primary text-on-primary font-headline text-xs font-semibold hover:opacity-95 transition-opacity"
            >
              Load Demo Wedding (Rahul &amp; Anjali)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: PASSCODE UNLOCK MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-on-surface/50 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col space-y-6 border border-outline-variant/30"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined text-[24px]">key</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-caption text-caption uppercase font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>{modalCouple}</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Enter Marriage Code
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enter the invitation passkey provided on your wedding invite card.
              </p>
            </div>

            {/* PIN boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={pinDigits[index]}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  className="w-11 sm:w-12 h-12 text-center font-display text-xl font-bold uppercase rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:border-primary focus:outline-none shadow-inner"
                />
              ))}
            </div>

            {authError && (
              <div className="text-xs text-error text-center font-medium bg-error/10 py-2 rounded-lg">
                {authError}
              </div>
            )}

            <button
              onClick={() => handleUnlockProceed(modalCode)}
              disabled={isVerifying}
              className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Decrypt Celebration Vault</span>
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: POLICY POPUP */}
      {isPolicyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsPolicyModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-6 border border-outline-variant/30 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPolicyModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{policyData.icon}</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface">{policyData.title}</h3>
            </div>

            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              {policyData.desc}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:opacity-95 transition-all"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DEMO SHOWCASE (Rahul & Anjali) */}
      {isShowcaseOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-on-surface/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsShowcaseOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT_yf8HUr15vJOdqxd57TrvYiXOxiwihldlvBX83jJMQK0LhR75KY3pRW7U04j1kjv7l1aUB0yhnzQ79PlTgUxcoxUIvuyZuGCwWKOBl83Kw4-89gVR5UWU6-YA-6j9qBB49TNa_mOVE9MMEuBnlRa8eBSI3jeOre4nT8PhlAWT1z1nrK8HoeytF_jEJgsZpwbIyNcabx9fyu00k70kuiU_VTUSBM-6QjRTBlQI2Y"
                alt="Rahul & Anjali"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <button
                onClick={() => setIsShowcaseOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Live Demonstration Vault</span>
                <h3 className="font-headline-md text-2xl sm:text-3xl font-bold">Rahul &amp; Anjali’s Coastal Wedding</h3>
                <p className="text-xs text-slate-200">The Leela Palace, South Goa • 6 Interactive Ceremonies</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-surface-container">
                  <span className="block font-headline-md text-lg font-bold text-primary">520</span>
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Candid Photos</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container">
                  <span className="block font-headline-md text-lg font-bold text-secondary">8</span>
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Live Streams</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container">
                  <span className="block font-headline-md text-lg font-bold text-tertiary">184</span>
                  <span className="text-[11px] text-on-surface-variant uppercase font-semibold">Guests Engaged</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsShowcaseOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/50 text-xs font-semibold hover:bg-surface-container transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/marriage/rahul24"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <span>Launch Live Guest Dashboard</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: GUEST EXPERIENCE SUITE */}
      {isGuestSuiteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-on-surface/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsGuestSuiteOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl p-6 sm:p-8 border border-outline-variant/30 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsGuestSuiteOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">celebration</span>
              </div>
              <div>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Guest Experience Suite</h3>
                <p className="text-xs text-on-surface-variant">Frictionless wedding participation for every family member</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">qr_code_2</span>
                <div>
                  <h4 className="font-semibold text-on-surface text-xs">Zero-Download QR Camera Access</h4>
                  <p className="text-on-surface-variant text-[11px]">Guests scan physical banquet table placards to upload candid shots instantly without app installs.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">download</span>
                <div>
                  <h4 className="font-semibold text-on-surface text-xs">Dynamic Digital Pass &amp; Invitation Export</h4>
                  <p className="text-on-surface-variant text-[11px]">Personalized itinerary pass generated client-side via html2canvas without consuming server compute.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">stream</span>
                <div>
                  <h4 className="font-semibold text-on-surface text-xs">Real-Time Wishes &amp; Live Tickers</h4>
                  <p className="text-on-surface-variant text-[11px]">Interactive ceremony tickers broadcast loving messages and toasts from guests worldwide.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsGuestSuiteOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/50 text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                Done
              </button>
              <Link
                href="/guest/upload?code=RAHUL24"
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <span>Try Venue QR Uploader</span>
                <span className="material-symbols-outlined text-[16px]">qr_code</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
