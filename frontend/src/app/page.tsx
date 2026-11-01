'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [quickCode, setQuickCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCode, setModalCode] = useState('RAHUL24');
  const [modalCouple, setModalCouple] = useState('Rahul & Anjali');
  const [pinInputs, setPinInputs] = useState(['', '', '', '', '', '']);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  // New Stitch Modals
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isGuestSuiteOpen, setIsGuestSuiteOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyData, setPolicyData] = useState({ title: '', desc: '', icon: 'speed' });

  const celebrations = [
    {
      id: 'rahul-anjali',
      couple: 'Rahul & Anjali',
      code: 'RAHUL24',
      category: 'beachfront',
      location: 'Coastal Goa Celebration',
      venue: 'The Leela Palace Seaside, Goa',
      badge: 'HALDI STREAM',
      badgeType: 'live',
      photos: 420,
      videos: 8,
      guests: 340,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrrJp8H5k4Kn9lsGcBSJkIvsyJ0WaekgNeXIJlRo8becUl0yxex3uelYPo8SCGer_N6xS0iKWc0WCpnXo59Eg70UhVYjNdmNaRIPxeQdSzuQBEs2vlCDd-msm3JtTpVwt4jwaqXaVd3EOQSr_foYp6ygVqlNf7E2y1mmzNrvJF6ECLO8U1JkWRb9Eu0Dd6qUh0_eNBjRA-_tB9XnFCUNtrkHV4eKGEp1ZoJEDihBk'
    },
    {
      id: 'vikram-priya',
      couple: 'Vikram & Priya',
      code: 'VIKPRI24',
      category: 'royal',
      location: 'Udaipur Lake Palace',
      venue: 'Taj Lake Palace, Udaipur',
      badge: 'LIVE NOW • SANGEET',
      badgeType: 'live',
      photos: 650,
      videos: 12,
      guests: 580,
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
      guests: 180,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWJccZA13DdqBZUU5cIjXtljFmPORVHN8HjpsXBRewnhfBvJ3NwW-dpYOibjzDC5PBkNfu_OXQRhWzXuUkLi-Pa7hXS--6qYzsg6DlxL_TFw1loKXCgCp4mRrmVGE-hHdYlHoSQAIL2AXNR7Q2pS_USmCvIdO-S3PqSm4FTR_hmGarQMxc4zQK6TzOipu3uf5Js6WK2AQMvSqnmVqpRGpvaFk0Eq1_5jSo7tYArdE'
    },
    {
      id: 'arjun-meera',
      couple: 'Arjun & Meera',
      code: 'ARJMEE24',
      category: 'royal',
      location: 'Jaipur Heritage Fort',
      venue: 'Rambagh Palace, Jaipur',
      badge: 'PRE-WEDDING DUMP',
      badgeType: 'secured',
      photos: 520,
      videos: 6,
      guests: 410,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY1d8v7mC6T49G1k3Vv5l1w6R2t0bY4z8uQ1a6x9pP3sD2f7gH5jK8l0mN'
    }
  ];

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openModal = (code: string, couple: string) => {
    setModalCode(code);
    setModalCouple(couple);
    const codeChars = code.slice(0, 6).split('');
    while (codeChars.length < 6) codeChars.push('');
    setPinInputs(codeChars);
    setAuthError('');
    setIsModalOpen(true);
  };

  const handlePinChange = (index: number, val: string) => {
    const uppercaseVal = val.toUpperCase().slice(-1);
    const newPins = [...pinInputs];
    newPins[index] = uppercaseVal;
    setPinInputs(newPins);

    if (uppercaseVal && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleUnlockProceed = () => {
    setIsVerifying(true);
    setAuthError('');

    setTimeout(() => {
      setIsVerifying(false);
      setIsModalOpen(false);
      showToast('Vault Decrypted', `Accessing ${modalCouple}'s celebration...`);
      router.push(`/marriage/${modalCode.toLowerCase()}`);
    }, 700);
  };

  const handleQuickUnlock = () => {
    if (!quickCode.trim()) {
      showToast('Passcode Required', 'Please enter a 6-digit marriage code.');
      return;
    }
    const matched = celebrations.find(
      (c) => c.code.toUpperCase() === quickCode.trim().toUpperCase()
    );
    if (matched) {
      openModal(matched.code, matched.couple);
    } else {
      openModal(quickCode.trim().toUpperCase(), 'Custom Celebration');
    }
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
          <span className="material-symbols-outlined text-secondary text-[20px]">
            check_circle
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-sm font-semibold">{toastMessage.title}</span>
            <span className="font-body-sm text-xs text-slate-300">{toastMessage.desc}</span>
          </div>
        </div>
      )}

      {/* Decorative ambient glow */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-primary/10 via-secondary-container/20 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-96 right-10 w-96 h-96 bg-tertiary-fixed/15 blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* 1. HERO SECTION */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pb-24 w-full">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            {/* Eyebrow Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high shadow-sm cursor-pointer hover:scale-105 transition-transform"
              onClick={() =>
                openPolicy(
                  'Zero-Loss Destination Architecture',
                  'High-throughput edge caching nodes placed directly across destination wedding corridors ensuring instant bufferless previews of multi-gigabyte media packages.',
                  'speed'
                )
              }
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">
                arrow_back_ios_new
              </span>
              <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                The Next-Gen Private Wedding Cloud
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-display text-on-surface tracking-tight font-bold max-w-3xl leading-[1.1]">
              Celebrate, Stream &amp; Preserve Wedding Memories in Real Time.
            </h1>

            {/* Subtitle */}
            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl font-normal">
              A trustable, high-fidelity platform engineered for modern couples and guests. Zero
              compression, private access codes, and live streams across every ceremony.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
                onClick={() => openModal('RAHUL24', 'Rahul & Anjali')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Enter Marriage Code</span>
              </button>

              <button
                className="h-11 px-5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-high active:scale-[0.98] transition-colors"
                onClick={() => setIsShowcaseOpen(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  explore
                </span>
                <span>Explore Demo Celebration</span>
              </button>

              <button
                className="h-11 px-4 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-high transition-colors"
                onClick={() => setIsGuestSuiteOpen(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">
                  how_to_reg
                </span>
                <span>Guest Experience Suite</span>
              </button>
            </div>

            {/* Floating Quick Code Unlock Bar */}
            <div className="w-full max-w-xl mt-6 p-2 rounded-xl bg-surface-container-lowest shadow-md flex flex-col sm:flex-row items-center gap-2 border border-black/5">
              <div className="flex items-center gap-2 px-3 w-full sm:w-auto flex-1">
                <span className="material-symbols-outlined text-secondary text-[20px]">pin</span>
                <input
                  className="w-full bg-transparent font-label-md text-label-md text-on-surface uppercase tracking-wider placeholder:normal-case placeholder:text-outline focus:outline-none"
                  maxLength={8}
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickUnlock()}
                  placeholder="Enter 6-digit Code (e.g. RAHUL24)"
                  type="text"
                />
              </div>
              <button
                className="w-full sm:w-auto h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-95 transition-all"
                onClick={handleQuickUnlock}
                type="button"
              >
                <span>Unlock Gallery</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Fast Presets Chips */}
            <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap justify-center pt-1">
              <span className="font-medium">Try instant test vaults:</span>
              {['RAHUL24', 'VIKPRI24', 'SAMTAN24', 'ARJMEE24'].map((presetCode) => (
                <button
                  key={presetCode}
                  className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-primary font-mono font-semibold transition-colors"
                  onClick={() => {
                    const found = celebrations.find((c) => c.code === presetCode);
                    openModal(presetCode, found?.couple || 'Celebration');
                  }}
                >
                  {presetCode}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-14 pt-8 bg-surface-container-low rounded-xl px-6 py-6 shadow-sm border border-black/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() =>
                  showToast('Broadcast SLA', 'Continuous WebRTC latency under 200ms globally')
                }
              >
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[20px]">stream</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">
                    99.98%
                  </span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">
                  Live Stream Uptime
                </span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() =>
                  showToast('Hardware Vault', 'AES-256 GCM authenticated military grade encryption')
                }
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">
                    256-Bit
                  </span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">
                  Encrypted Vaults
                </span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() =>
                  showToast('Zero Cloud Cost', 'Free MongoDB GridFS binary chunking')
                }
              >
                <div className="flex items-center gap-1.5 text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">photo_library</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">
                    50,000+
                  </span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">
                  High-Res Memories
                </span>
              </div>

              <div
                className="flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-surface-container/50 transition-colors"
                onClick={() =>
                  showToast('Global CDN', 'Local caching points across Goa, Udaipur, Bali, & Lake Como')
                }
              >
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">
                    120+
                  </span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant uppercase mt-1">
                  Destination Weddings
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CURATED GRID OF MARRIAGE CARDS */}
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
                  className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all whitespace-nowrap font-medium ${
                    activeFilter === pill.id
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveFilter(pill.id)}
                  type="button"
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
                className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-black/5 cursor-pointer"
                onClick={() => openModal(c.code, c.couple)}
              >
                <div className="relative h-64 overflow-hidden bg-surface-container">
                  <img
                    alt={c.couple}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={c.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-black/20" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-caption text-caption shadow-sm">
                    {c.badgeType === 'live' ? (
                      <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                    ) : (
                      <span className="material-symbols-outlined text-[14px] text-secondary">
                        lock
                      </span>
                    )}
                    <span className="font-bold">{c.badge}</span>
                  </div>

                  {/* Code pill */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
                    <span className="font-mono font-bold">{c.code}</span>
                  </div>

                  {/* Bottom title */}
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
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        photo_camera
                      </span>
                      <span>{c.photos} Photos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-error">
                        videocam
                      </span>
                      <span>{c.videos} Videos</span>
                    </div>
                  </div>

                  <button
                    className="w-full h-10 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(c.code, c.couple);
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span>Enter Code to View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. NEW STITCH FEATURE HIGHLIGHTS */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
          <div className="bg-surface-container rounded-2xl p-6 lg:p-12 shadow-sm border border-black/5 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="font-caption text-caption text-secondary uppercase font-bold">
                    Zero Quality Loss
                  </span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Engineered for Destination Scale
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Every photograph, 4K reel, and drone capture uploaded by guests or official photographers is streamed and stored in crisp high resolution.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md active:scale-[0.99]"
                  onClick={() =>
                    openPolicy(
                      'Zero-Loss Destination CDN',
                      'High-throughput edge caching nodes placed directly across destination wedding corridors ensuring instant bufferless previews of multi-gigabyte media packages.',
                      'speed'
                    )
                  }
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[28px]">speed</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-1.5">
                      Sub-Second Delivery
                      <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Edge nodes across Goa, Udaipur, and destination hotspots.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="font-caption text-caption text-tertiary uppercase font-bold">
                    Privacy First
                  </span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Guest-Level Permissions
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Keep Haldi rituals, bridal suites, and evening afterparties contained to specific friend circles and families with passcodes.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-4 hover:border-tertiary/50 transition-all cursor-pointer hover:shadow-md active:scale-[0.99]"
                  onClick={() =>
                    openPolicy(
                      'Granular Privacy Permissions',
                      'Couples can partition ceremonies into distinct access groups using passcode tiers. No public crawler indexing.',
                      'shield_person'
                    )
                  }
                >
                  <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-[28px]">shield_person</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-1.5">
                      Passcode Enforced
                      <span className="material-symbols-outlined text-[16px] text-tertiary">arrow_forward</span>
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      No indexed public search. Only authorized guests enter.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="font-caption text-caption text-primary uppercase font-bold">
                    Live Real-Time Sync
                  </span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Instant Guest Broadcasts
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Broadcast live ceremony streams to overseas elders and relatives who couldn&apos;t fly in.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-4 hover:border-secondary/50 transition-all cursor-pointer hover:shadow-md active:scale-[0.99]"
                  onClick={() => router.push('/marriage/rahul24')}
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[28px]">broadcast_on_personal</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-1.5">
                      Ultra-Low Latency
                      <span className="material-symbols-outlined text-[16px] text-secondary">arrow_forward</span>
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Crystal clear interactive ceremony streaming.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. MARRIAGE CODE UNLOCK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-black/10 p-6 sm:p-8 space-y-6">
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-primary">
                <span className="material-symbols-outlined text-[28px]">lock_open</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Unlock Private Vault
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enter access code for{' '}
                <strong className="text-on-surface">{modalCouple}</strong>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {pinInputs.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center font-mono font-bold text-xl rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none uppercase transition-all"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                />
              ))}
            </div>

            {authError && (
              <div className="text-xs text-error text-center font-medium bg-error-container/20 py-2 rounded-lg">
                {authError}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
                disabled={isVerifying}
                onClick={handleUnlockProceed}
                type="button"
              >
                {isVerifying ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Decrypt Celebration Vault</span>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 px-1">
                <span>Code on invitation card</span>
                <button
                  className="text-primary hover:underline font-semibold"
                  onClick={() => {
                    const preset = 'RAHUL24';
                    setPinInputs(preset.split(''));
                  }}
                  type="button"
                >
                  Autofill RAHUL24
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DEMO SHOWCASE MODAL */}
      {isShowcaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-black/10">
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsShowcaseOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[28px]">favorite</span>
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-secondary">
                  Demo Celebration Archive
                </span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Rahul &amp; Anjali&apos;s Coastal Wedding
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Palacio Do Mar, South Goa • March 2026
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="p-3 rounded-lg bg-surface-container text-center cursor-pointer hover:bg-surface-container-high transition-colors"
                onClick={() => {
                  setIsShowcaseOpen(false);
                  router.push('/marriage/rahul24');
                }}
              >
                <span className="material-symbols-outlined text-secondary text-[24px]">live_tv</span>
                <div className="font-bold text-on-surface mt-1 text-sm">Haldi Replay</div>
                <div className="text-xs text-on-surface-variant">1080p 60fps Broadcast</div>
              </div>

              <div
                className="p-3 rounded-lg bg-surface-container text-center cursor-pointer hover:bg-surface-container-high transition-colors"
                onClick={() => {
                  setIsShowcaseOpen(false);
                  router.push('/marriage/rahul24');
                }}
              >
                <span className="material-symbols-outlined text-tertiary text-[24px]">photo_library</span>
                <div className="font-bold text-on-surface mt-1 text-sm">420 RAW Photos</div>
                <div className="text-xs text-on-surface-variant">Guest &amp; Crew Uploads</div>
              </div>

              <div
                className="p-3 rounded-lg bg-surface-container text-center cursor-pointer hover:bg-surface-container-high transition-colors"
                onClick={() => {
                  setIsShowcaseOpen(false);
                  router.push('/marriage/rahul24');
                }}
              >
                <span className="material-symbols-outlined text-primary text-[24px]">edit_note</span>
                <div className="font-bold text-on-surface mt-1 text-sm">Live Guestbook</div>
                <div className="text-xs text-on-surface-variant">88 Blessing Notes</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[22px]">key</span>
                <div>
                  <div className="font-bold text-sm text-on-surface">
                    Guest Passkey: <span className="font-mono text-primary font-bold">RAHUL24</span>
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Instant access unlocked for demo evaluators
                  </div>
                </div>
              </div>
              <button
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-95 transition-opacity"
                onClick={() => {
                  setIsShowcaseOpen(false);
                  openModal('RAHUL24', 'Rahul & Anjali');
                }}
              >
                Open Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. GUEST EXPERIENCE SUITE MODAL */}
      {isGuestSuiteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-black/10">
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsGuestSuiteOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[28px]">how_to_reg</span>
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-secondary">
                  Guest Experience Suite
                </span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Effortless Guest Participation
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Zero apps to download. Guests scan, capture, watch, and celebrate directly in their mobile browser.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-primary text-sm">
                  <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                  Tabletop QR Ingestion
                </div>
                <p className="text-xs text-on-surface-variant">
                  Guests scan the dining table or welcome card QR to snap instant photos directly into the collective album with name attribution.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-tertiary text-sm">
                  <span className="material-symbols-outlined text-[20px]">stream</span>
                  Global Family Streaming
                </div>
                <p className="text-xs text-on-surface-variant">
                  Overseas grandparents and relatives watch low-latency ceremonies and send blessings straight to the live marquee.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-secondary text-sm">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Digital Invitation Cards
                </div>
                <p className="text-xs text-on-surface-variant">
                  Download high-resolution digital invitation cards powered on-device by html2canvas without server load.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-primary text-sm">
                  <span className="material-symbols-outlined text-[20px]">compress</span>
                  Aggressive Edge Compression
                </div>
                <p className="text-xs text-on-surface-variant">
                  Automatically shrinks photos to ~500KB on the guest phone, respecting the strictly ₹0 MongoDB Atlas 512MB quota.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
                onClick={() => setIsGuestSuiteOpen(false)}
              >
                Dismiss
              </button>
              <button
                className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-95"
                onClick={() => {
                  setIsGuestSuiteOpen(false);
                  openModal('RAHUL24', 'Rahul & Anjali');
                }}
              >
                Test Guest Passkey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. POLICY & ARCHITECTURE MODAL */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-6 space-y-4 border border-black/10">
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              onClick={() => setIsPolicyModalOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">{policyData.icon}</span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                {policyData.title}
              </h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {policyData.desc}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
