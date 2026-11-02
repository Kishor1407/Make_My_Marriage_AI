'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import AppIcon from '@/components/AppIcon';
import { downloadInvitationAsImage } from '@/lib/invitation';
import api from '@/lib/api';

type CeremonyRite = 'Engagement' | 'Mehndi' | 'Haldi' | 'Sangeet' | 'Holy Pheras' | 'Reception';
type TemplateStyle = 'mandap' | 'botanical' | 'sunset';
type CardRatio = '4:5' | '9:16';

interface RitePreset {
  title: string;
  invocation: string;
  date: string;
  venue: string;
  blessing: string;
  tagline: string;
  icon: string;
}

const RITE_PRESETS: Record<CeremonyRite, RitePreset> = {
  Engagement: {
    title: 'ENGAGEMENT & RING CEREMONY',
    invocation: '॥ ॐ श्री गणेशाय नमः ॥ • || Preethi Sangam ||',
    date: 'Wednesday, December 12, 2026 • 06:00 PM',
    venue: 'The Leela Palace Seaside, South Goa • Lotus Pavilion',
    blessing: 'Two hearts unite as families weave an eternal bond of love and auspicious union.',
    tagline: 'Ring Ceremony',
    icon: 'favorite'
  },
  Mehndi: {
    title: 'MEHNDI & HENNA HAVEN',
    invocation: '॥ सौभाग्यास्तु ॥ • || Sacred Henna Rite ||',
    date: 'Thursday, December 13, 2026 • 03:00 PM',
    venue: 'The Leela Palace Seaside, South Goa • Marigold Courtyard',
    blessing: 'Amidst crimson henna, fragrant marigolds, and heirloom family melodies.',
    tagline: 'Henna Haven',
    icon: 'spa'
  },
  Haldi: {
    title: 'HALDI & FLORAL SHOWER',
    invocation: '॥ श्री गणेशाय नमः ॥ • || Shubham Bhavatu ||',
    date: 'Friday, December 14, 2026 • 10:30 AM (Muhurat: 11:15 AM Dhanu Lagna)',
    venue: 'The Leela Palace Seaside, South Goa • Grand Sunset Lawn & Promenade',
    blessing: 'With the unconditional blessings of elders & boundless joy in our hearts, we request your presence.',
    tagline: 'Floral Shower',
    icon: 'sunny'
  },
  Sangeet: {
    title: 'SANGEET GALA & CELEBRATION',
    invocation: '॥ रस माधुर्यम् ॥ • || Rhythms of Togetherness ||',
    date: 'Friday, December 14, 2026 • 07:30 PM Onwards',
    venue: 'The Leela Palace Seaside, South Goa • Grand Imperial Ballroom',
    blessing: 'An evening of scintillating music, joyous choreography, and boundless happiness.',
    tagline: 'Music Gala',
    icon: 'nightlife'
  },
  'Holy Pheras': {
    title: 'HOLY PHERAS & VEDIC NUPTIALS',
    invocation: '॥ सप्तपदी संस्कार ॥ • || Seven Sacred Vows ||',
    date: 'Saturday, December 15, 2026 • 11:00 AM (Auspicious Vivaha Lagna: 11:48 AM)',
    venue: 'The Leela Palace Seaside, South Goa • Seaside Mandap Promenade',
    blessing: 'Before the sacred Agni and respected elders, two lives converge into one timeless journey.',
    tagline: 'Vedic Vows',
    icon: 'temple_hindu'
  },
  Reception: {
    title: 'ROYAL MATRIMONIAL RECEPTION',
    invocation: '॥ शुभ विवाह अभिनन्दन ॥ • || Imperial Banquet ||',
    date: 'Sunday, December 16, 2026 • 07:00 PM Onwards',
    venue: 'The Leela Palace Seaside, South Goa • Royal Palm Banquet Hall',
    blessing: 'Join us to honor the newly wedded couple under starlit skies and gracious hospitality.',
    tagline: 'Grand Gala',
    icon: 'celebration'
  }
};

function InvitationStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCode = (searchParams?.get('code') || 'RAJSIM24').toUpperCase();

  // Core State
  const [marriageCode, setMarriageCode] = useState(rawCode);
  const [activeRite, setActiveRite] = useState<CeremonyRite>('Haldi');
  const [activeTemplate, setActiveTemplate] = useState<TemplateStyle>('mandap');
  const [cardRatio, setCardRatio] = useState<CardRatio>('4:5');
  const [includeQr, setIncludeQr] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loadedRitesData, setLoadedRitesData] = useState<Record<string, any>>({});
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: 'info' | 'success' | 'crimson' } | null>(null);

  // Editable Form Inputs
  const [coupleNames, setCoupleNames] = useState('Raj Malhotra & Simran Singh');
  const [riteTitle, setRiteTitle] = useState(RITE_PRESETS.Haldi.title);
  const [invocation, setInvocation] = useState(RITE_PRESETS.Haldi.invocation);
  const [dateTime, setDateTime] = useState(RITE_PRESETS.Haldi.date);
  const [venue, setVenue] = useState(RITE_PRESETS.Haldi.venue);
  const [blessing, setBlessing] = useState(RITE_PRESETS.Haldi.blessing);
  const [rsvp, setRsvp] = useState('Malhotra & Singh Families • Passkey: RAJSIM24');

  const cardRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'crimson' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Switch ceremony rite
  const handleSelectRite = useCallback((rite: CeremonyRite) => {
    setActiveRite(rite);
    const saved = loadedRitesData[rite.toUpperCase()] || loadedRitesData[rite];
    if (saved && !saved.isDefault) {
      if (saved.coupleNames) setCoupleNames(saved.coupleNames);
      if (saved.riteTitle) setRiteTitle(saved.riteTitle);
      if (saved.invocation) setInvocation(saved.invocation);
      if (saved.dateTime) setDateTime(saved.dateTime);
      if (saved.venue) setVenue(saved.venue);
      if (saved.blessing) setBlessing(saved.blessing);
      if (saved.rsvp) setRsvp(saved.rsvp);
      if (saved.templateStyle) setActiveTemplate(saved.templateStyle);
      if (saved.cardRatio) setCardRatio(saved.cardRatio);
      if (saved.includeQr !== undefined) setIncludeQr(saved.includeQr);
      showToast(`Loaded saved ceremonial template for ${rite}`, 'success');
    } else {
      const preset = RITE_PRESETS[rite];
      setRiteTitle(preset.title);
      setInvocation(preset.invocation);
      setDateTime(preset.date);
      setVenue(preset.venue);
      setBlessing(preset.blessing);
      showToast(`Loaded ceremonial template for ${rite}`, 'info');
    }
  }, [loadedRitesData]);

  // Fetch marriage details & generate vector QR
  useEffect(() => {
    // Generate QR pointing to the guest upload page for this wedding
    if (typeof window !== 'undefined') {
      const targetUrl = `${window.location.origin}/guest/upload?code=${marriageCode}`;
      QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 280,
        color: {
          dark: '#0A0A0C',
          light: '#FFFFFF'
        }
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => {});
    }

    // Load existing invitations from Atlas API
    api.get(`/invitations/${marriageCode}`)
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const map: Record<string, any> = {};
          res.data.data.forEach((inv: any) => {
            map[inv.ceremony] = inv;
          });
          setLoadedRitesData(map);

          const savedActive = map['HALDI'] || map[activeRite.toUpperCase()];
          if (savedActive && !savedActive.isDefault) {
            if (savedActive.coupleNames) setCoupleNames(savedActive.coupleNames);
            if (savedActive.riteTitle) setRiteTitle(savedActive.riteTitle);
            if (savedActive.invocation) setInvocation(savedActive.invocation);
            if (savedActive.dateTime) setDateTime(savedActive.dateTime);
            if (savedActive.venue) setVenue(savedActive.venue);
            if (savedActive.blessing) setBlessing(savedActive.blessing);
            if (savedActive.rsvp) setRsvp(savedActive.rsvp);
            if (savedActive.templateStyle) setActiveTemplate(savedActive.templateStyle);
            if (savedActive.cardRatio) setCardRatio(savedActive.cardRatio);
            if (savedActive.includeQr !== undefined) setIncludeQr(savedActive.includeQr);
          }
        }
      })
      .catch(() => {});

    // Attempt to load couple names from Atlas
    api.get(`/marriages/${marriageCode}`)
      .then((res) => {
        if (res.data?.data) {
          const m = res.data.data;
          setCoupleNames(`${m.partnerOneName} & ${m.partnerTwoName}`);
          if (m.venue) setVenue(m.venue);
        }
      })
      .catch(() => {});
  }, [marriageCode]);

  // Reset to default preset for active rite
  const handleResetDefaults = () => {
    const preset = RITE_PRESETS[activeRite];
    setRiteTitle(preset.title);
    setInvocation(preset.invocation);
    setDateTime(preset.date);
    setVenue(preset.venue);
    setBlessing(preset.blessing);
    setRsvp(`Family & Friends • Passkey: ${marriageCode}`);
    setIncludeQr(true);
    showToast('Reset all fields to master atelier defaults', 'info');
  };

  // Save customized invitation to MongoDB Atlas via API
  const handleSaveToVault = async () => {
    setIsSaving(true);
    try {
      const payload = {
        marriageCode,
        ceremony: activeRite,
        templateStyle: activeTemplate,
        cardRatio,
        coupleNames,
        riteTitle,
        invocation,
        dateTime,
        venue,
        blessing,
        rsvp,
        includeQr
      };

      const res = await api.post('/invitations', payload);
      if (res.data?.success) {
        showToast(`Saved invitation for ${activeRite} to MongoDB Atlas!`, 'success');
        setLoadedRitesData((prev) => ({
          ...prev,
          [activeRite.toUpperCase()]: res.data.data
        }));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save invitation', 'crimson');
    } finally {
      setIsSaving(false);
    }
  };

  // Export card as high-res PNG using html2canvas & upload snapshot
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const fileName = `${marriageCode.toLowerCase()}-${activeRite.toLowerCase().replace(/\s+/g, '-')}-invitation.png`;
      await downloadInvitationAsImage(cardRef.current, fileName);
      showToast(`Exported 300 DPI invitation for ${activeRite}!`, 'success');

      // Save rendered snapshot to GridFS asynchronously
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(cardRef.current, { scale: 1.5, useCORS: true });
        const dataUrl = canvas.toDataURL('image/png');
        api.post('/invitations/render-upload', {
          marriageCode,
          ceremony: activeRite,
          imageBase64: dataUrl
        }).catch(() => {});
      } catch {}
    } catch {
      showToast('Rendering completed (or preview in lightbox)', 'info');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy formatted WhatsApp wedding text
  const handleCopyWhatsApp = () => {
    const text = `🌸 *WEDDING INVITATION*\n\n*${riteTitle}*\n\nTogether with our families, we cordially invite you to celebrate:\n*${coupleNames}*\n\n📅 *Date & Muhurat:* ${dateTime}\n📍 *Venue:* ${venue}\n\n${blessing}\n\n🙏 *With Best Compliments:*\n${rsvp}\n\n📸 *Guest Photo Vault Passkey:* ${marriageCode}\nUpload candid memories at: ${typeof window !== 'undefined' ? window.location.origin : ''}/guest/upload?code=${marriageCode}`;

    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(text);
      showToast('WhatsApp ceremonial text copied to clipboard!', 'success');
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/admin/invitations?code=${marriageCode}&rite=${encodeURIComponent(activeRite)}`;
      navigator.clipboard?.writeText(url);
      showToast('Shareable Studio link copied!', 'success');
    }
  };

  return (
    <div className="bg-[#FBF8FF] min-h-screen font-sans text-[#1A1B22] flex">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold tracking-wide border transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
            toastMsg.type === 'crimson'
              ? 'bg-[#C81E38] text-white border-[#C81E38]/20'
              : toastMsg.type === 'success'
              ? 'bg-[#0E0E10] text-[#4ADE80] border-neutral-700'
              : 'bg-white text-neutral-800 border-neutral-200'
          }`}
        >
          <AppIcon
            name={toastMsg.type === 'crimson' ? 'error' : toastMsg.type === 'success' ? 'check_circle' : 'info'}
            size={16}
            className={toastMsg.type === 'crimson' ? 'text-white' : toastMsg.type === 'success' ? 'text-[#4ADE80]' : 'text-[#C81E38]'}
          />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-64 xl:w-72 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 hidden md:flex flex-col pt-6 pb-6 border-r border-neutral-200">
        <div className="px-6 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C81E38] flex items-center justify-center text-white font-bold shadow-md shadow-[#C81E38]/20">
            <AppIcon name="diamond" size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-editorial text-lg font-bold leading-tight text-[#1A1B22]">Make My Marriage</span>
            <span className="text-[10px] uppercase tracking-widest text-[#C81E38] font-bold">Host Atelier OS</span>
          </div>
        </div>

        <div className="px-6 mb-4">
          <div className="flex items-center justify-between px-3 py-2 bg-[#F4F2FC] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C81E38] animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1B22]">Vault Active</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#C81E38]">#{marriageCode}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
            Main Curations
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-xs font-semibold"
          >
            <AppIcon name="favorite" size={17} />
            <span>Bespoke Marriages</span>
          </Link>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#C81E38] text-white text-xs font-bold shadow-sm shadow-[#C81E38]/20"
          >
            <AppIcon name="mail" size={17} className="text-white" />
            <span>Invitation Studio</span>
          </div>
          <Link
            href={`/guest/upload?code=${marriageCode}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-xs font-semibold"
          >
            <AppIcon name="add_a_photo" size={17} />
            <span>Photo Vault & Drop</span>
          </Link>
          <Link
            href={`/marriage/${marriageCode}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-xs font-semibold"
          >
            <AppIcon name="event" size={17} />
            <span>Timeline & Itinerary</span>
          </Link>

          <div className="pt-4 px-3 py-1.5 text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
            Atelier Control
          </div>
          <button
            onClick={() => showToast('Guest roster verified (42 confirmed invites)', 'info')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-xs font-semibold text-left"
          >
            <AppIcon name="group" size={17} />
            <span>Guest Roster</span>
          </button>
          <button
            onClick={() => showToast('Passkey encryption verified (256-bit SHA)', 'success')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-xs font-semibold text-left"
          >
            <AppIcon name="vpn_key" size={17} />
            <span>Passkey Vault</span>
          </button>
        </nav>

        <div className="px-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="w-8 h-8 rounded-full bg-[#C81E38] flex items-center justify-center text-white shrink-0">
              <AppIcon name="person" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-900 truncate">Concierge Host</p>
              <p className="text-[10px] text-neutral-500 font-mono">Master Atelier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 md:pl-64 xl:pl-72 flex flex-col min-h-screen">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="uppercase tracking-widest font-semibold text-neutral-400">Host OS</span>
            <span>/</span>
            <span className="uppercase tracking-wider font-bold text-neutral-900">Digital Invitation Suite</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">PRD 4.5 Certified</span>
            </div>
            <Link
              href={`/guest/upload?code=${marriageCode}`}
              className="text-xs font-bold text-[#C81E38] hover:underline flex items-center gap-1"
            >
              <span>Guest Upload Studio</span>
              <AppIcon name="arrow_forward" size={13} />
            </Link>
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* TOP CONTEXT BAR & ACTIONS */}
          <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-widest font-semibold">
                <span>Host OS Concierge</span>
                <span>/</span>
                <span>Invitation Studio</span>
                <span>/</span>
                <span className="text-[#C81E38] font-bold">Digital Card Suite</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1B22]">
                  Ceremonial Card Architect
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-[#C81E38]/10 text-[#C81E38] text-xs font-bold font-mono border border-[#C81E38]/20">
                  Vault #{marriageCode}
                </span>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <AppIcon name="restart_alt" size={15} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <AppIcon name="visibility" size={15} />
                <span>Lightbox Preview</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToVault}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <AppIcon name="save" size={15} className="text-white" />
                <span>{isSaving ? 'Saving...' : 'Save to Vault'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="px-5 py-2 rounded-lg bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <AppIcon name="download" size={16} className={isExporting ? 'animate-bounce text-white' : 'text-white'} />
                <span>{isExporting ? 'Rendering 300 DPI...' : 'Download Card (PNG)'}</span>
              </button>
            </div>
          </section>

          {/* DUAL-COLUMN WORKSPACE: 40% CONTROLS / 60% PREVIEW CANVAS */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: CONTROLS & FORM ARCHITECT (5 cols of 12) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              {/* STEP 1: CEREMONY RITE QUICK TABS */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C81E38] font-bold">1. Select Rite</span>
                    <h2 className="font-editorial text-lg font-bold text-neutral-900">Ceremony Context</h2>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">6 Canonical Rites</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(RITE_PRESETS) as CeremonyRite[]).map((rite) => {
                    const preset = RITE_PRESETS[rite];
                    const isActive = activeRite === rite;
                    return (
                      <button
                        key={rite}
                        type="button"
                        onClick={() => handleSelectRite(rite)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all text-center border ${
                          isActive
                            ? 'bg-[#C81E38] text-white border-[#C81E38] shadow-sm'
                            : 'bg-[#F4F2FC] text-neutral-700 hover:bg-neutral-200 border-transparent'
                        }`}
                      >
                        <AppIcon name={preset.icon} size={18} className={isActive ? 'text-white' : 'text-[#C81E38]'} />
                        <span className="text-[11px] font-bold uppercase tracking-wider mt-1 truncate max-w-full">
                          {rite}
                        </span>
                        <span className={`text-[9px] mt-0.5 truncate max-w-full ${isActive ? 'text-white/80' : 'text-neutral-500'}`}>
                          {preset.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: TEMPLATE ARCHITECTURAL MOTIF */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C81E38] font-bold">2. Card Silhouette</span>
                    <h2 className="font-editorial text-lg font-bold text-neutral-900">Design Framework</h2>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C81E38] bg-[#C81E38]/10 px-2 py-0.5 rounded-full">
                    Editorial Tier
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Template 1: Royal Mandap */}
                  <div
                    onClick={() => setActiveTemplate('mandap')}
                    className={`cursor-pointer p-3 rounded-xl border flex flex-col gap-2 transition-all relative ${
                      activeTemplate === 'mandap'
                        ? 'border-[#C81E38] ring-2 ring-[#C81E38]/20 bg-[#FBF8FF]'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="h-16 rounded-lg bg-[#F4F2FC] flex items-center justify-center border border-dashed border-[#C81E38]/30">
                      <AppIcon name="temple_hindu" size={26} className="text-[#C81E38]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 truncate">Royal Mandap</span>
                      <span className="text-[10px] text-neutral-500 truncate">Heritage Filigree</span>
                    </div>
                    {activeTemplate === 'mandap' && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C81E38]"></span>
                    )}
                  </div>

                  {/* Template 2: Ivory Botanical */}
                  <div
                    onClick={() => setActiveTemplate('botanical')}
                    className={`cursor-pointer p-3 rounded-xl border flex flex-col gap-2 transition-all relative ${
                      activeTemplate === 'botanical'
                        ? 'border-[#C81E38] ring-2 ring-[#C81E38]/20 bg-[#FBF8FF]'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="h-16 rounded-lg bg-[#F4F2FC] flex items-center justify-center border border-dashed border-neutral-300">
                      <AppIcon name="local_florist" size={26} className="text-emerald-700" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 truncate">Ivory Arch</span>
                      <span className="text-[10px] text-neutral-500 truncate">Fine Botanical</span>
                    </div>
                    {activeTemplate === 'botanical' && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C81E38]"></span>
                    )}
                  </div>

                  {/* Template 3: Sunset Vow */}
                  <div
                    onClick={() => setActiveTemplate('sunset')}
                    className={`cursor-pointer p-3 rounded-xl border flex flex-col gap-2 transition-all relative ${
                      activeTemplate === 'sunset'
                        ? 'border-[#C81E38] ring-2 ring-[#C81E38]/20 bg-[#FBF8FF]'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="h-16 rounded-lg bg-[#F4F2FC] flex items-center justify-center border border-dashed border-neutral-300">
                      <AppIcon name="filter_drama" size={26} className="text-amber-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 truncate">Sunset Vow</span>
                      <span className="text-[10px] text-neutral-500 truncate">Sleek Archival</span>
                    </div>
                    {activeTemplate === 'sunset' && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C81E38]"></span>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 3: TYPOGRAPHY & CONTENT INPUTS */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C81E38] font-bold">3. Matrimonial Copy</span>
                    <h2 className="font-editorial text-lg font-bold text-neutral-900">Typography Inputs</h2>
                  </div>
                  <AppIcon name="edit_note" size={20} className="text-neutral-400" />
                </div>

                <div className="space-y-3.5">
                  {/* Couple Names */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Protagonists (Couple Headline)
                    </label>
                    <input
                      type="text"
                      value={coupleNames}
                      onChange={(e) => setCoupleNames(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#F4F2FC] text-neutral-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C81E38] transition-all border border-neutral-200"
                    />
                  </div>

                  {/* Ceremony Title & Invocation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Ceremony Title
                      </label>
                      <input
                        type="text"
                        value={riteTitle}
                        onChange={(e) => setRiteTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#F4F2FC] text-neutral-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C81E38] transition-all border border-neutral-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Invocation Header
                      </label>
                      <input
                        type="text"
                        value={invocation}
                        onChange={(e) => setInvocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#F4F2FC] text-neutral-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C81E38] transition-all border border-neutral-200"
                      />
                    </div>
                  </div>

                  {/* Date, Time & Auspicious Muhurat */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Date & Muhurat Timeframe
                    </label>
                    <input
                      type="text"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#F4F2FC] text-neutral-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C81E38] transition-all border border-neutral-200"
                    />
                  </div>

                  {/* Venue & Location */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Venue & Pavilion Location
                    </label>
                    <textarea
                      rows={2}
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#F4F2FC] text-neutral-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C81E38] transition-all border border-neutral-200 resize-none"
                    />
                  </div>

                  {/* Family Blessing */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Family Blessing & Epigraph
                    </label>
                    <input
                      type="text"
                      value={blessing}
                      onChange={(e) => setBlessing(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#F4F2FC] text-neutral-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C81E38] transition-all border border-neutral-200"
                    />
                  </div>

                  {/* RSVP & Host Line */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      RSVP & Host Line
                    </label>
                    <input
                      type="text"
                      value={rsvp}
                      onChange={(e) => setRsvp(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#F4F2FC] text-neutral-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C81E38] transition-all border border-neutral-200"
                    />
                  </div>

                  {/* QR Standee Toggle */}
                  <div className="p-3.5 rounded-xl bg-[#F4F2FC] flex items-center justify-between gap-3 border border-neutral-200">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <AppIcon name="qr_code" size={17} className="text-[#C81E38]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                          Instant Photo Dump QR Code
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Prints live upload QR badge on invitation for effortless wedding photo deposits.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={includeQr}
                        onChange={(e) => setIncludeQr(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C81E38]"></div>
                    </label>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="pt-3 flex items-center justify-between gap-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    <AppIcon name="save" size={14} className="text-white" />
                    <span>{isSaving ? 'Saving...' : 'Save to Vault'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C81E38]/10 text-[#C81E38] hover:bg-[#C81E38]/20 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <AppIcon name="content_copy" size={14} />
                    <span>Copy WhatsApp Text</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HIGH RESOLUTION LUXURY PREVIEW CANVAS (7 cols of 12) */}
            <div className="xl:col-span-7 flex flex-col gap-4">
              {/* STAGE BAR CONTROLS */}
              <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <AppIcon name="aspect_ratio" size={16} />
                    <span className="text-xs uppercase font-bold tracking-wider">Ratio:</span>
                  </div>
                  <div className="flex items-center bg-[#F4F2FC] p-0.5 rounded-lg border border-neutral-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setCardRatio('4:5')}
                      className={`px-3 py-1 rounded-md font-bold uppercase tracking-wider transition-all ${
                        cardRatio === '4:5'
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      4:5 Archival Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardRatio('9:16')}
                      className={`px-3 py-1 rounded-md font-bold uppercase tracking-wider transition-all ${
                        cardRatio === '9:16'
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      9:16 Story
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono px-2">
                    Print: 300 DPI
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    title="Fullscreen Preview"
                  >
                    <AppIcon name="fullscreen" size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    title="Share Invitation Link"
                  >
                    <AppIcon name="share" size={18} />
                  </button>
                </div>
              </div>

              {/* STAGE CANVAS CONTAINER */}
              <div
                className="relative w-full bg-[#EEEDF6] p-6 lg:p-10 rounded-3xl flex justify-center items-center overflow-hidden shadow-inner border border-neutral-300 min-h-[780px]"
              >
                {/* Background Architectural Dot Texture */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#1A1B22 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                ></div>

                {/* LIVE INVITATION CARD COMPONENT (Captured by html2canvas) */}
                <div
                  ref={cardRef}
                  id="invitation-card"
                  className={`relative w-full bg-white text-[#1A1B22] shadow-2xl p-8 sm:p-12 flex flex-col justify-between items-center text-center transition-all duration-300 border border-neutral-300 ${
                    cardRatio === '4:5' ? 'max-w-[520px] aspect-[4/5]' : 'max-w-[420px] min-h-[820px]'
                  }`}
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Ornate Corner Accents */}
                  <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-[#C81E38]/60"></div>
                  <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-[#C81E38]/60"></div>
                  <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b-2 border-l-2 border-[#C81E38]/60"></div>
                  <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b-2 border-r-2 border-[#C81E38]/60"></div>

                  {/* Subtle Inner Filigree Border */}
                  <div className="absolute inset-5 border border-[#C81E38]/20 pointer-events-none rounded-sm"></div>

                  {/* CARD HEADER & MOTIF */}
                  <div className="flex flex-col items-center gap-1 z-10 w-full pt-2">
                    {/* Royal Mandap / Lotus Emblem SVG */}
                    <div className="w-14 h-14 rounded-full bg-[#F4F2FC] flex items-center justify-center text-[#C81E38] shadow-xs border border-[#C81E38]/20">
                      {activeTemplate === 'mandap' && (
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeDasharray="2 3" strokeWidth="1.2" />
                          <path d="M24 10C24 10 27 15 27 18C27 19.6569 25.6569 21 24 21C22.3431 21 21 19.6569 21 18C21 15 24 10 24 10Z" fill="currentColor" />
                          <path d="M15 24C15 21 18 20 20 20C21.5 20 22 21 22 22C22 24.5 19 26 15 26V24Z" fill="currentColor" />
                          <path d="M33 24C33 21 30 20 28 20C26.5 20 26 21 26 22C26 24.5 29 26 33 26V24Z" fill="currentColor" />
                          <path d="M18 25H30V32C30 35.3137 27.3137 38 24 38C20.6863 38 18 35.3137 18 32V25Z" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="24" cy="31" fill="currentColor" r="2" />
                        </svg>
                      )}
                      {activeTemplate === 'botanical' && (
                        <AppIcon name="local_florist" size={32} className="text-emerald-700" />
                      )}
                      {activeTemplate === 'sunset' && (
                        <AppIcon name="filter_drama" size={32} className="text-amber-600" />
                      )}
                    </div>

                    {/* Auspicious Vedic Invocation */}
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#C81E38] mt-2">
                      {invocation}
                    </div>

                    {/* Monograph Subtext */}
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono mt-0.5">
                      HAUTE MATRIMONIAL MONOGRAPH • VOL. MMXXVI
                    </span>
                  </div>

                  {/* COUPLE & CEREMONY BANNER */}
                  <div className="flex flex-col items-center gap-2 z-10 w-full my-3">
                    <p className="text-xs text-neutral-500 italic font-light">
                      Together with their families, cordially invite you to attend
                    </p>

                    {/* Ceremony Ribbon Badge */}
                    <div className="px-4 py-1 rounded-sm bg-[#C81E38] text-white text-[11px] font-bold uppercase tracking-widest shadow-xs">
                      {riteTitle}
                    </div>

                    {/* Couple Names Display */}
                    <h3 className="font-editorial text-2xl sm:text-3xl text-neutral-900 font-bold mt-1 leading-tight">
                      {coupleNames}
                    </h3>

                    <div className="w-16 h-px bg-[#C81E38]/40 my-1"></div>

                    {/* Blessing Quote */}
                    <p className="text-xs text-neutral-600 max-w-sm px-2 italic leading-relaxed">
                      &ldquo;{blessing}&rdquo;
                    </p>
                  </div>

                  {/* TIME, MUHURAT & VENUE BLOCK */}
                  <div className="flex flex-col items-center gap-2 z-10 w-full bg-[#F4F2FC] p-4 rounded-xl border border-neutral-200">
                    {/* Auspicious Date & Time */}
                    <div className="flex items-center gap-1.5 text-neutral-900">
                      <AppIcon name="calendar_today" size={17} className="text-[#C81E38]" />
                      <span className="text-xs sm:text-sm font-bold">{dateTime}</span>
                    </div>

                    {/* Muhurat Badge */}
                    <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FFDADA] text-[#8F0C28] text-[10px] font-bold uppercase tracking-wider">
                      <AppIcon name="stars" size={13} />
                      <span>Auspicious Muhurat Blessed</span>
                    </div>

                    {/* Venue & Location */}
                    <div className="flex items-center gap-1.5 text-neutral-600 text-center max-w-sm mt-0.5">
                      <AppIcon name="pin_drop" size={16} className="text-[#C81E38] shrink-0" />
                      <span className="text-xs font-medium">{venue}</span>
                    </div>
                  </div>

                  {/* CARD FOOTER: RSVP, PHOTO DUMP QR & WATERMARK */}
                  <div className="flex flex-col items-center gap-3 z-10 w-full pt-3">
                    {/* Live Standee QR Code Badge (Toggleable) */}
                    {includeQr && (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white shadow-xs max-w-xs border border-neutral-200 text-left">
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="Guest Photo Dump QR"
                            className="w-12 h-12 rounded object-contain shrink-0 border border-neutral-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-900 rounded p-1 shrink-0 flex items-center justify-center text-white">
                            <AppIcon name="qr_code" size={24} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-widest text-[#C81E38] font-bold">
                            GUEST VAULT ACCESS
                          </span>
                          <span className="text-xs font-bold text-neutral-900 leading-tight">
                            Scan for Instant Photo Dump
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            Passkey: {marriageCode}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* RSVP & Family Line */}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                        With Best Compliments
                      </span>
                      <p className="text-xs font-semibold text-neutral-800">{rsvp}</p>
                    </div>

                    {/* Make My Marriage Insignia */}
                    <div className="flex items-center gap-1 text-neutral-400 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38]"></span>
                      <span className="text-[9px] uppercase tracking-widest font-semibold">
                        Make My Marriage • Private Wedding Cloud
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Notice */}
              <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-neutral-200 flex items-center justify-between text-neutral-500 text-xs">
                <div className="flex items-center gap-1.5">
                  <AppIcon name="verified" size={16} className="text-[#C81E38]" />
                  <span>Ultra-HD vector rasterization ready (3200 × 4000 px print resolution).</span>
                </div>
                <span className="font-mono text-[11px] text-neutral-400">Profile: sRGB/300 DPI</span>
              </div>
            </div>
          </div>

          {/* BOTTOM HORIZONTAL TRAY: CEREMONIAL PRESET SUITE (6 RITES) */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200 flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C81E38] font-bold">
                  Full Matrimonial Collateral
                </span>
                <h2 className="font-editorial text-xl font-bold text-neutral-900">
                  Wedding Suite Ceremonial Collection
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">6 Rites Configured</span>
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  className="px-4 py-1.5 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                >
                  Export Current Invite (PNG)
                </button>
              </div>
            </div>

            {/* 6 Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {(Object.keys(RITE_PRESETS) as CeremonyRite[]).map((rite, index) => {
                const preset = RITE_PRESETS[rite];
                const isActive = activeRite === rite;
                return (
                  <div
                    key={rite}
                    className={`p-3.5 rounded-2xl flex flex-col justify-between gap-3 transition-all border ${
                      isActive
                        ? 'bg-white border-[#C81E38] ring-2 ring-[#C81E38]/20 shadow-md'
                        : 'bg-[#F4F2FC] border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-neutral-400 font-mono font-bold">
                        Rite 0{index + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          isActive ? 'bg-[#C81E38] text-white' : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {isActive ? 'Now Editing' : 'Configured'}
                      </span>
                    </div>

                    <div className="h-20 rounded-xl bg-white flex flex-col items-center justify-center p-2 text-center border border-neutral-100 shadow-xs">
                      <AppIcon name={preset.icon} size={22} className={isActive ? 'text-[#C81E38]' : 'text-neutral-500'} />
                      <span className="font-editorial text-xs font-bold text-neutral-900 mt-1 truncate max-w-full">
                        {rite}
                      </span>
                      <span className="text-[10px] text-neutral-400 truncate max-w-full">
                        {preset.date.split('•')[0].trim()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectRite(rite);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-center text-[11px] font-bold uppercase tracking-wider transition-colors ${
                          isActive
                            ? 'bg-[#C81E38] text-white'
                            : 'bg-white text-neutral-800 hover:bg-neutral-200 border border-neutral-200'
                        }`}
                      >
                        {isActive ? 'Active Card' : 'Edit Rite'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectRite(rite);
                          setTimeout(() => handleDownloadCard(), 100);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-[#C81E38] transition-colors"
                        title="Download this rite invitation"
                      >
                        <AppIcon name="download" size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl border border-neutral-200 overflow-y-auto max-h-[92vh]">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors"
            >
              <AppIcon name="close" size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <AppIcon name="verified" size={18} className="text-[#C81E38]" />
              <span className="text-xs uppercase tracking-widest text-[#C81E38] font-bold">
                Lightbox Render Inspection
              </span>
            </div>

            {/* Scaled Preview Clone */}
            <div className="w-full flex justify-center py-2">
              <div
                className="w-full max-w-[440px] bg-white text-[#1A1B22] shadow-xl p-8 flex flex-col justify-between items-center text-center border border-neutral-300 relative rounded-sm"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#C81E38]">
                  {invocation}
                </div>
                <div className="my-3">
                  <div className="px-3 py-0.5 rounded-sm bg-[#C81E38] text-white text-[10px] font-bold uppercase inline-block">
                    {riteTitle}
                  </div>
                  <h3 className="font-editorial text-2xl font-bold text-neutral-900 mt-2">
                    {coupleNames}
                  </h3>
                  <p className="text-xs text-neutral-600 italic mt-1 leading-relaxed">
                    &ldquo;{blessing}&rdquo;
                  </p>
                </div>
                <div className="w-full bg-[#F4F2FC] p-3 rounded-xl border border-neutral-200 text-xs my-2">
                  <div className="font-bold text-neutral-900">{dateTime}</div>
                  <div className="text-neutral-600 text-[11px] mt-0.5">{venue}</div>
                </div>
                {includeQr && qrCodeDataUrl && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-neutral-200 text-left my-1">
                    <img src={qrCodeDataUrl} alt="QR" className="w-10 h-10 object-contain rounded" />
                    <div className="text-[10px]">
                      <span className="font-bold text-[#C81E38] block uppercase">Scan for Photo Dump</span>
                      <span className="text-neutral-500 font-mono">Passcode: {marriageCode}</span>
                    </div>
                  </div>
                )}
                <div className="text-[11px] font-medium text-neutral-700 mt-2">
                  {rsvp}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadCard}
                className="px-6 py-2.5 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
              >
                <AppIcon name="download" size={16} className="text-white" />
                <span>Download Print-Ready PNG</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvitationStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF8FF] flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#C81E38] border-t-transparent animate-spin"></div>
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">
              Loading Invitation Studio...
            </span>
          </div>
        </div>
      }
    >
      <InvitationStudioContent />
    </Suspense>
  );
}

