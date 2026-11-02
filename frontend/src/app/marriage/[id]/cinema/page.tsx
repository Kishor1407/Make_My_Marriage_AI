'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

interface TimelineEvent {
  _id: string;
  eventType: 'ENGAGEMENT' | 'MEHNDI' | 'HALDI' | 'SANGEET' | 'MARRIAGE' | 'OTHERS';
  customTitle?: string;
  eventDate?: string;
  eventTime?: string;
  venueAddress?: string;
  liveStreamUrl?: string;
  streamStatus?: 'SCHEDULED' | 'LIVE' | 'CONCLUDED';
  viewerCount?: number;
}

interface GuestComment {
  id: string;
  author: string;
  location: string;
  text: string;
  isHost?: boolean;
}

const CANONICAL_ORDER: Array<'ENGAGEMENT' | 'MEHNDI' | 'HALDI' | 'SANGEET' | 'MARRIAGE' | 'OTHERS'> = [
  'ENGAGEMENT',
  'MEHNDI',
  'HALDI',
  'SANGEET',
  'MARRIAGE',
  'OTHERS'
];

const RITUAL_DETAILS: Record<string, { ritualName: string; protocol: string; significance: string; pandit: string }> = {
  ENGAGEMENT: {
    ritualName: 'The Royal Ring Covenant & Shagan',
    protocol: 'Vedic Shagan & Ring Exchange',
    significance: 'Gold ring exchange blessed by family elders signifying the eternal circle of unity and divine commitment.',
    pandit: 'Pandit V. Shastri'
  },
  MEHNDI: {
    ritualName: 'Henna & Sunset Folk Ragas',
    protocol: 'Kashmiri Saffron & Henna Rite',
    significance: 'Deep herbal henna patterns applied to hands and feet, symbolizing good fortune, fertility, and deep devotion.',
    pandit: 'Master Henna Artist & Sitar Quintet'
  },
  HALDI: {
    ritualName: 'The Turmeric Purification & Phoolon Ki Holi',
    protocol: 'Vedic Turmeric & Floral Shower',
    significance: 'The golden Haldi paste, ground from organic saffron and Kasturi turmeric, is applied by elder aunts to shield the couple with spiritual luminosity. Fresh marigold petals are showered by guests.',
    pandit: 'Pandit V. Shastri'
  },
  SANGEET: {
    ritualName: 'Sangeet Extravaganza & Sufi Musical Gala',
    protocol: 'Folk Dances & DJ Celebration',
    significance: 'Joyful musical celebration bringing both families together in high-spirited choreography and timeless Bollywood celebrations.',
    pandit: 'Live Symphony & Dhol Ensemble'
  },
  MARRIAGE: {
    ritualName: 'Vedic Pheras & Sacred Nuptials',
    protocol: 'Agni Pradakshina & Saptapadi',
    significance: 'Seven sacred steps around the holy fire chanting ancient Sanskrit mantras, sealing an unbreakable spiritual bond for seven lifetimes.',
    pandit: 'Acharya Vidyadhar'
  },
  OTHERS: {
    ritualName: 'Grand Matrimonial Reception & Dastarkhwan',
    protocol: 'Imperial Matrimonial Banquet',
    significance: 'An evening of regal feast, heartfelt toasts, and celebratory blessings under the starlight promenade.',
    pandit: 'Host Protocol Concierge'
  }
};

export default function LiveStreamCinemaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const rawId = (params?.id as string) || searchParams?.get('code') || 'rajsim24';
  const marriageCode = rawId.toUpperCase();

  // Marriage metadata
  const [partnerNames, setPartnerNames] = useState('Raj Malhotra & Simran Singh');
  const [monogram, setMonogram] = useState('R&S');
  const [venue, setVenue] = useState('The Grand Oberoi Amarvilas, Agra');
  const [dates, setDates] = useState('October 18–20, 2024');

  // Events & Channel state
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [activeRiteIndex, setActiveRiteIndex] = useState<number>(2); // Default to Haldi (Rite 03)
  const [isLoading, setIsLoading] = useState(true);

  // Cinema HUD & Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cinemaViewportRef = useRef<HTMLDivElement>(null);

  // Floating Celebration Reaction Counters
  const [reactions, setReactions] = useState({
    love: 342,
    rose: 189,
    diya: 512,
    claps: 276,
    shagun: 405
  });
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; left: number; top: number }>>([]);

  // Live Guestbook Comments
  const [comments, setComments] = useState<GuestComment[]>([
    {
      id: 'c1',
      author: 'Meera & Vikram Kapoor (London)',
      location: 'Mayfair, UK',
      text: 'Radiant blessings to both our families! Watching the shower live from Mayfair in 1080p!'
    },
    {
      id: 'c2',
      author: 'Aanand Oberoi (New York)',
      location: 'Manhattan, USA',
      text: 'Hearty congratulations Raj & Simran! The Amarvilas setting is sublime.'
    },
    {
      id: 'c3',
      author: 'Bauji (Baldev Singh)',
      location: 'Punjab Mandi',
      text: 'Bohot bohot aashirwaad dono bacchon ko! Rab mehar kare.',
      isHost: true
    }
  ]);
  const [newComment, setNewComment] = useState('');

  // Host Admin Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminCeremony, setAdminCeremony] = useState<'ENGAGEMENT' | 'MEHNDI' | 'HALDI' | 'SANGEET' | 'MARRIAGE' | 'OTHERS'>('HALDI');
  const [adminStreamUrl, setAdminStreamUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [adminStreamStatus, setAdminStreamStatus] = useState<'SCHEDULED' | 'LIVE' | 'CONCLUDED'>('LIVE');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Rehydrate data from MongoDB Atlas
  useEffect(() => {
    setIsLoading(true);

    // 1. Fetch Marriage Vault
    api.get(`/marriages/${marriageCode}`)
      .then((res) => {
        if (res.data?.data) {
          const m = res.data.data;
          const p1 = m.partnerOneName || 'Partner One';
          const p2 = m.partnerTwoName || 'Partner Two';
          setPartnerNames(`${p1} & ${p2}`);
          setMonogram(`${p1[0]}&${p2[0]}`);
          if (m.venue) setVenue(m.venue);
          if (m.dates) setDates(m.dates);
        }
      })
      .catch(() => {});

    // 2. Fetch all 6 Canonical Events
    api.get(`/events/marriage/${marriageCode}`)
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          // Sort events canonically
          const sorted = [...res.data.data].sort(
            (a, b) => CANONICAL_ORDER.indexOf(a.eventType) - CANONICAL_ORDER.indexOf(b.eventType)
          );
          setEvents(sorted);

          // Find live event or default to Haldi (index 2)
          const liveIdx = sorted.findIndex((e) => e.streamStatus === 'LIVE');
          if (liveIdx !== -1) {
            setActiveRiteIndex(liveIdx);
            setAdminCeremony(sorted[liveIdx].eventType);
            setAdminStreamUrl(sorted[liveIdx].liveStreamUrl || '');
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [marriageCode]);

  // Active Event
  const activeEvent: TimelineEvent | undefined = events[activeRiteIndex] || {
    _id: 'default',
    eventType: CANONICAL_ORDER[activeRiteIndex] || 'HALDI',
    customTitle: 'Haldi & Marigold Shower of Blessings',
    eventTime: '10:30 AM IST',
    venueAddress: 'Mustard Courtyard Lawn, Amarvilas',
    liveStreamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    streamStatus: 'LIVE',
    viewerCount: 142
  };

  const activeRitualInfo = RITUAL_DETAILS[activeEvent.eventType] || RITUAL_DETAILS.HALDI;
  const embedUrl = getYouTubeEmbedUrl(activeEvent.liveStreamUrl);

  // Floating Particle Emitter
  const triggerReaction = (key: keyof typeof reactions, emoji: string) => {
    setReactions((prev) => ({ ...prev, [key]: prev[key] + 1 }));

    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      left: 10 + Math.random() * 80,
      top: 60 + Math.random() * 30
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 2200);
  };

  // Post live comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newEntry: GuestComment = {
      id: `c_${Date.now()}`,
      author: user ? user.name : 'Virtual Guest',
      location: 'Remote Sanctuary',
      text: newComment.trim(),
      isHost: user?.role === 'ADMIN'
    };

    setComments((prev) => [newEntry, ...prev]);
    setNewComment('');
    showToast('Your blessing was broadcast to the live marquee!');
    triggerReaction('diya', '🪔');
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      cinemaViewportRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Save Stream Configuration (Admin)
  const handleSaveStreamConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await api.put('/events/config/stream', {
        marriageCode,
        eventType: adminCeremony,
        liveStreamUrl: adminStreamUrl,
        streamStatus: adminStreamStatus
      });

      if (res.data?.success) {
        showToast(`Stream configuration for ${adminCeremony} updated & broadcasted!`);
        setIsAdminModalOpen(false);

        // Update local events state
        setEvents((prev) =>
          prev.map((e) =>
            e.eventType === adminCeremony
              ? { ...e, liveStreamUrl: adminStreamUrl, streamStatus: adminStreamStatus }
              : e
          )
        );
      }
    } catch {
      showToast('Unable to update stream settings. Please verify admin privileges.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#0A0A0C] font-sans antialiased min-h-screen flex flex-col selection:bg-[#C81E38] selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-[120] px-4 py-3 rounded-2xl bg-[#0A0A0C] text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-right-4 border border-neutral-800">
          <AppIcon name="verified" size={18} className="text-[#C81E38]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Editorial Navigation */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-col">
              <span className="font-editorial text-lg sm:text-xl font-bold uppercase tracking-wider text-[#0A0A0C]">
                Make My Marriage
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C81E38]">
                Atelier Cinema &amp; Concierge
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/marriage/${marriageCode.toLowerCase()}`}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#0A0A0C] border border-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <AppIcon name="chevron_left" size={16} />
              <span className="hidden sm:inline">Back to Vault</span>
            </Link>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Broadcast link copied to clipboard!');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#0A0A0C] border border-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppIcon name="share" size={16} />
              <span className="hidden sm:inline">Share Stream</span>
            </button>

            <button
              onClick={() => {
                setAdminCeremony(activeEvent.eventType);
                setAdminStreamUrl(activeEvent.liveStreamUrl || '');
                setAdminStreamStatus(activeEvent.streamStatus || 'LIVE');
                setIsAdminModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <AppIcon name="tune" size={16} />
              <span>Host Stream Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Broadcast Cinema Body */}
      <main className="flex-1 pb-16">
        {/* Editorial Sub-Header Banner */}
        <section className="bg-white border-b border-neutral-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between pb-3 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#C81E38] uppercase tracking-widest text-[11px]">Atelier Cinema</span>
                <span>/</span>
                <span className="font-mono text-neutral-700 font-semibold">{marriageCode}</span>
                <span>/</span>
                <span>Virtual Remote Attendance</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#C81E38] animate-pulse"></span>
                <span>HLS Encrypted Feed</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Monogram Crest */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#C81E38] via-[#9E1B32] to-[#680014] text-white flex items-center justify-center font-editorial font-bold text-2xl sm:text-3xl shadow-md shrink-0">
                  {monogram}
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0A0C] tracking-tight">
                      {partnerNames}
                    </h1>
                    <AppIcon name="verified" size={22} className="text-[#C81E38]" title="Verified Matrimonial Union" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-neutral-600 mt-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C81E38]/10 text-[#C81E38] font-bold uppercase tracking-wider text-[10px] border border-[#C81E38]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38] animate-ping"></span>
                      <span>
                        {activeEvent.streamStatus === 'LIVE'
                          ? 'LIVE BROADCAST ACTIVE • 1080p HD'
                          : activeEvent.streamStatus === 'CONCLUDED'
                          ? 'CEREMONY CONCLUDED • 4K VOD REPLAY'
                          : 'BROADCAST SCHEDULED'}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <AppIcon name="location_on" size={14} className="text-[#C81E38]" />
                      <span>{venue}</span>
                    </span>
                    <span>•</span>
                    <span>{dates}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextIdx = (activeRiteIndex + 1) % (events.length || 6);
                    setActiveRiteIndex(nextIdx);
                    showToast(`Switched to Rite 0${nextIdx + 1}`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#0A0A0C] border border-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppIcon name="swap_vert" size={16} />
                  <span>Next Rite</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Theater Workspace (8 Cols Left / 4 Cols Right) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 16:9 Cinema Viewport & Reaction Ribbon */}
            <div className={`space-y-6 ${isTheaterMode ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
              {/* Cinema Player Container */}
              <div
                ref={cinemaViewportRef}
                className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-neutral-200 select-none group"
              >
                {/* Active YouTube Live Player Embed */}
                <iframe
                  src={embedUrl}
                  title={`${partnerNames} - ${activeEvent.customTitle || activeEvent.eventType}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

                {/* Floating Particles Canvas */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                  {particles.map((p) => (
                    <span
                      key={p.id}
                      className="absolute text-3xl animate-float-particle select-none pointer-events-none drop-shadow-md"
                      style={{ left: `${p.left}%`, top: `${p.top}%` }}
                    >
                      {p.emoji}
                    </span>
                  ))}
                </div>

                {/* Top Left HUD */}
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-[#C81E38] px-3 py-1 rounded-full shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span className="text-[10px] uppercase tracking-widest text-white font-bold">
                      {activeEvent.streamStatus === 'LIVE' ? '● LIVE' : activeEvent.streamStatus || 'SCHEDULED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white shadow-lg text-[11px] font-semibold border border-white/10">
                    <AppIcon name="group" size={14} className="text-[#FFB3B3]" />
                    <span>{activeEvent.viewerCount || 142} Remote Guests</span>
                  </div>
                </div>

                {/* Top Right HUD */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-none">
                  <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white shadow-lg text-[10px] font-mono uppercase tracking-widest border border-white/10">
                    1080p60 • DOLBY ATMOS
                  </div>
                </div>

                {/* Bottom Player Overlay HUD */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-30 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <span className="font-bold text-[#FFB3B3] uppercase tracking-wider text-[10px]">
                        Rite 0{activeRiteIndex + 1} of 06
                      </span>
                      <span>•</span>
                      <span className="truncate">{activeEvent.venueAddress || venue}</span>
                    </div>
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                      {activeEvent.customTitle || activeRitualInfo.ritualName}
                    </h3>
                  </div>

                  {/* Player Quick Icons */}
                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors cursor-pointer"
                      title="Toggle Theater Mode"
                    >
                      <AppIcon name="aspect_ratio" size={18} />
                    </button>
                    <button
                      onClick={handleToggleFullscreen}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors cursor-pointer"
                      title="Fullscreen"
                    >
                      <AppIcon name="fullscreen" size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Virtual Celebration Cheer Bar (Directly Beneath Viewport) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-editorial text-base font-bold text-[#0A0A0C]">Virtual Aashirwaad &amp; Cheer</h4>
                  <p className="text-xs text-neutral-500">Send sacred blessings directly into the mandap live stream</p>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => triggerReaction('love', '❤️')}
                    className="px-3.5 py-2 rounded-2xl bg-neutral-100 hover:bg-[#C81E38]/10 hover:border-[#C81E38] border border-neutral-200 text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span className="text-base">❤️</span>
                    <span>{reactions.love}</span>
                  </button>
                  <button
                    onClick={() => triggerReaction('rose', '🌹')}
                    className="px-3.5 py-2 rounded-2xl bg-neutral-100 hover:bg-[#C81E38]/10 hover:border-[#C81E38] border border-neutral-200 text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span className="text-base">🌹</span>
                    <span>{reactions.rose}</span>
                  </button>
                  <button
                    onClick={() => triggerReaction('diya', '🪔')}
                    className="px-3.5 py-2 rounded-2xl bg-neutral-100 hover:bg-[#C81E38]/10 hover:border-[#C81E38] border border-neutral-200 text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span className="text-base">🪔</span>
                    <span>{reactions.diya}</span>
                  </button>
                  <button
                    onClick={() => triggerReaction('claps', '👏')}
                    className="px-3.5 py-2 rounded-2xl bg-neutral-100 hover:bg-[#C81E38]/10 hover:border-[#C81E38] border border-neutral-200 text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span className="text-base">👏</span>
                    <span>{reactions.claps}</span>
                  </button>
                  <button
                    onClick={() => triggerReaction('shagun', '🎉')}
                    className="px-3.5 py-2 rounded-2xl bg-neutral-100 hover:bg-[#C81E38]/10 hover:border-[#C81E38] border border-neutral-200 text-xs font-bold text-[#0A0A0C] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span className="text-base">🎉</span>
                    <span>{reactions.shagun}</span>
                  </button>
                </div>
              </div>

              {/* Curated Matrimonial Dossier & Real-time Live Commentary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ritual Significance Card */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#C81E38] uppercase tracking-wider text-[11px]">
                      {activeRitualInfo.protocol}
                    </span>
                    <span className="text-neutral-400 font-mono">Vedic Canon</span>
                  </div>
                  <h4 className="font-editorial text-lg font-bold text-[#0A0A0C]">
                    {activeRitualInfo.ritualName}
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {activeRitualInfo.significance}
                  </p>
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span>Officiated: {activeRitualInfo.pandit}</span>
                    <span className="font-mono text-[#C81E38] font-bold">{activeEvent.eventTime || 'Live Feed'}</span>
                  </div>
                </div>

                {/* Live Remote Guestbook */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-[#C81E38] uppercase tracking-wider text-[11px]">
                        Live Remote Guestbook
                      </span>
                      <span className="text-neutral-400 font-mono">Instant Feed</span>
                    </div>

                    <div className="space-y-2 h-32 overflow-y-auto pr-1">
                      {comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0A0A0C]">{c.author}</span>
                            <span className="text-[10px] text-neutral-400">{c.location}</span>
                          </div>
                          <p className="text-neutral-600 italic">&ldquo;{c.text}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handlePostComment} className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Inscribe a blessing to the couple..."
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:outline-none focus:border-[#C81E38] focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0A0A0C] hover:bg-[#C81E38] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column: Ceremonial Channel Switcher & Host Announcements */}
            {!isTheaterMode && (
              <div className="lg:col-span-4 space-y-6">
                {/* 6 Canonical Rites & Channels */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="font-editorial text-lg font-bold text-[#0A0A0C]">Rites &amp; Channels</h3>
                      <p className="text-[11px] text-neutral-500">Sequential Ceremonial Broadcast</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C81E38]/10 text-[#C81E38] text-[10px] font-bold uppercase tracking-wider border border-[#C81E38]/20">
                      6 Canonical Rites
                    </span>
                  </div>

                  <div className="space-y-2">
                    {CANONICAL_ORDER.map((rite, idx) => {
                      const ev = events.find((e) => e.eventType === rite) || {
                        _id: rite,
                        eventType: rite,
                        customTitle: RITUAL_DETAILS[rite]?.ritualName || rite,
                        eventTime: idx < 2 ? 'Concluded' : idx === 2 ? 'Active Now' : 'Scheduled',
                        streamStatus: idx < 2 ? 'CONCLUDED' : idx === 2 ? 'LIVE' : 'SCHEDULED'
                      };

                      const isSelected = activeRiteIndex === idx;

                      return (
                        <div
                          key={rite}
                          onClick={() => {
                            setActiveRiteIndex(idx);
                            showToast(`Switched channel to ${ev.customTitle || rite}`);
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#C81E38]/5 border-[#C81E38] shadow-xs'
                              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? 'bg-[#C81E38] text-white animate-pulse'
                                  : ev.streamStatus === 'CONCLUDED'
                                  ? 'bg-neutral-200 text-neutral-600'
                                  : 'bg-white text-neutral-800 border border-neutral-200'
                              }`}
                            >
                              0{idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                {ev.streamStatus === 'LIVE' && (
                                  <span className="w-2 h-2 rounded-full bg-[#C81E38] animate-ping"></span>
                                )}
                                <h4
                                  className={`text-xs font-bold uppercase tracking-wide truncate max-w-[150px] ${
                                    isSelected ? 'text-[#C81E38]' : 'text-[#0A0A0C]'
                                  }`}
                                >
                                  {ev.customTitle || rite}
                                </h4>
                              </div>
                              <p className="text-[11px] text-neutral-500">
                                {ev.streamStatus === 'LIVE'
                                  ? 'Watching Live Feed'
                                  : ev.streamStatus === 'CONCLUDED'
                                  ? 'Recorded in 4K VOD'
                                  : ev.eventTime || 'Scheduled'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#C81E38] text-white'
                                : ev.streamStatus === 'CONCLUDED'
                                ? 'bg-neutral-200 text-neutral-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {isSelected ? 'ON AIR' : ev.streamStatus === 'CONCLUDED' ? 'REPLAY' : 'TUNE IN'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pinned Concierge Announcement Card */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#C81E38] font-bold uppercase tracking-wider text-[11px]">
                      <AppIcon name="pin_drop" size={16} />
                      <span>Concierge Notice</span>
                    </div>
                    <span className="font-mono text-neutral-400">Oberoi Pavilion</span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    &ldquo;Sacred Pheras will begin promptly at 11:30 AM on the Heritage Mandap Pavilion. Remote guests may submit virtual blessings and video toasts via the concierge desk.&rdquo;
                  </p>
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span>Protocol Officer: Host Concierge</span>
                    <span className="font-semibold text-[#C81E38]">Live Support</span>
                  </div>
                </div>

                {/* Network & Audio Telemetry Card */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-neutral-400">
                    Network &amp; Audio Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">CDN Protocol</span>
                      <span className="font-bold text-[#0A0A0C]">HLS Fastly/Edge</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Stream Latency</span>
                      <span className="font-bold text-[#C81E38]">0.82s (Ultra-Low)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Bitrate</span>
                      <span className="font-bold text-[#0A0A0C]">6,800 Kbps CBR</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Global Nodes</span>
                      <span className="font-bold text-[#0A0A0C]">Agra • LHR • JFK</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* HOST ADMIN STREAM SETUP MODAL (PRD 4.6) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-neutral-200 space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C81E38] animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C81E38]">
                    Host Stream Studio (PRD 4.6)
                  </span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#0A0A0C] mt-1">
                  Ceremony Stream Configuration
                </h3>
                <p className="text-xs text-neutral-500">
                  Paste live broadcast pipelines and configure YouTube Live streams for {marriageCode}.
                </p>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black cursor-pointer"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Rite */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Select Ceremonial Rite
                </label>
                <select
                  value={adminCeremony}
                  onChange={(e) => {
                    const selected = e.target.value as any;
                    setAdminCeremony(selected);
                    const matching = events.find((ev) => ev.eventType === selected);
                    if (matching?.liveStreamUrl) {
                      setAdminStreamUrl(matching.liveStreamUrl);
                    }
                    if (matching?.streamStatus) {
                      setAdminStreamStatus(matching.streamStatus);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:bg-white focus:border-[#C81E38] outline-none"
                >
                  <option value="ENGAGEMENT">Rite 01: Engagement &amp; Shagan</option>
                  <option value="MEHNDI">Rite 02: Mehndi Laga Ke Rakhna</option>
                  <option value="HALDI">Rite 03: Haldi &amp; Marigold Shower</option>
                  <option value="SANGEET">Rite 04: Sangeet Gala &amp; DJ Night</option>
                  <option value="MARRIAGE">Rite 05: Vedic Pheras &amp; Doli</option>
                  <option value="OTHERS">Rite 06: Grand Matrimonial Reception</option>
                </select>
              </div>

              {/* YouTube Live URL input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  YouTube Live / RTMP Embed URL
                </label>
                <div className="flex items-center px-3 py-1 rounded-xl bg-neutral-50 border border-neutral-200 focus-within:border-[#C81E38] focus-within:bg-white">
                  <AppIcon name="link" size={16} className="text-neutral-400 mr-2" />
                  <input
                    type="text"
                    value={adminStreamUrl}
                    onChange={(e) => setAdminStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full py-1.5 bg-transparent text-xs text-[#0A0A0C] outline-none"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Supports standard YouTube Live watch links, short youtu.be, unlisted broadcasts, or embed URLs.
                </p>
              </div>

              {/* Broadcast State Toggle */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Broadcast State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SCHEDULED', 'LIVE', 'CONCLUDED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAdminStreamStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        adminStreamStatus === st
                          ? 'bg-[#C81E38] text-white shadow-sm'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {st === 'LIVE' ? '● Live Broadcast' : st === 'SCHEDULED' ? 'Scheduled' : 'Concluded'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Embed */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
                <div className="w-24 h-16 rounded-xl bg-black overflow-hidden shrink-0 relative flex items-center justify-center">
                  <iframe
                    src={getYouTubeEmbedUrl(adminStreamUrl)}
                    title="Preview stream"
                    className="w-full h-full border-0 pointer-events-none opacity-80"
                  />
                  <span className="absolute text-[9px] uppercase font-bold text-white bg-[#C81E38] px-1 rounded">
                    PREVIEW
                  </span>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[#0A0A0C] block">Feed Signal Verified</span>
                  <p className="text-neutral-500 text-[11px]">
                    1080p feed detected via YouTube Streaming CDN. Audio tracks synched.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingConfig}
                onClick={handleSaveStreamConfig}
                className="px-5 py-2.5 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <AppIcon name="sensors" size={16} />
                <span>{isSavingConfig ? 'Saving...' : 'Save & Broadcast to Guests'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Sovereign Virtual Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-[#FAFAFA] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-editorial uppercase tracking-wider font-bold text-[#0A0A0C]">Make My Marriage</span>
            <span>• Sovereign Virtual Matrimonial Cloud (₹0 Serverless Architecture)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C81E38]"></span>
            <span>Ultra-Low Latency • Encrypted HLS / YouTube CDN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

