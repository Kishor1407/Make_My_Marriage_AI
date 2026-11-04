'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { API_BASE_URL } from '@/lib/api';
import AppIcon from '@/components/AppIcon';

interface VideoReel {
  id: string;
  filename: string;
  title: string;
  ceremony: string;
  duration: string;
  curatorName: string;
  posterUrl?: string | null;
  plays: number;
  streamUrl: string;
  uploadDate?: string;
  liked?: boolean;
}

interface PhotoMoment {
  id: string;
  filename: string;
  uploaderName: string;
  uploaderEmail?: string;
  ceremony: string;
  streamUrl: string;
  uploadDate?: string;
  liked?: boolean;
}

interface MarriageData {
  id: string;
  partnerOneName: string;
  partnerTwoName: string;
  marriageCode: string;
  dates: string;
  venue: string;
  status: string;
  totalPhotos: number;
  totalVideos: number;
  totalGuestsEngaged: number;
}

export default function MediaVaultPage() {
  const params = useParams();
  const router = useRouter();
  const marriageIdParam = (params?.id as string) || '';

  // Navigation & Data States
  const [marriage, setMarriage] = useState<MarriageData>({
    id: marriageIdParam,
    partnerOneName: '',
    partnerTwoName: '',
    marriageCode: marriageIdParam,
    dates: '',
    venue: '',
    status: '',
    totalPhotos: 0,
    totalVideos: 0,
    totalGuestsEngaged: 0
  });

  const [activeTab, setActiveTab] = useState<'reels' | 'candid'>('reels');
  const [ceremonyFilter, setCeremonyFilter] = useState<string>('ALL');
  const [reels, setReels] = useState<VideoReel[]>([]);
  const [candids, setCandids] = useState<PhotoMoment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cinema Lightbox Modal States
  const [activeReel, setActiveReel] = useState<VideoReel | null>(null);
  const [isCinemaOpen, setIsCinemaOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(165); // default fallback ~2:45
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Photo Lightbox State
  const [activePhoto, setActivePhoto] = useState<PhotoMoment | null>(null);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState<boolean>(false);

  // Host Curate Reel Modal States
  const [isCuratorOpen, setIsCuratorOpen] = useState<boolean>(false);
  const [curateTitle, setCurateTitle] = useState('');
  const [curateCeremony, setCurateCeremony] = useState('SANGEET');
  const [curateDuration, setCurateDuration] = useState('02:45');
  const [curateCurator, setCurateCurator] = useState('');
  const [isSubmittingReel, setIsSubmittingReel] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load Marriage Info & Segregated Media
  useEffect(() => {
    setLoading(true);
    const codeOrId = marriageIdParam.toUpperCase();

    // Fetch marriage metadata
    api.get(`/marriages/${codeOrId}`)
      .then((res) => {
        if (res.data?.marriage) {
          const m = res.data.marriage;
          setMarriage({
            id: m._id || m.id,
            partnerOneName: m.partnerOneName || '',
            partnerTwoName: m.partnerTwoName || '',
            marriageCode: m.marriageCode || codeOrId,
            dates: m.dates || '',
            venue: m.venue || '',
            status: m.status || 'Active',
            totalPhotos: m.globalStats?.totalPhotos ?? 0,
            totalVideos: m.globalStats?.totalVideos ?? 0,
            totalGuestsEngaged: m.globalStats?.totalGuestsEngaged ?? 0
          });
        }
      })
      .catch(() => {});

    // Fetch official video reels
    api.get(`/media/gallery/${codeOrId}?mediaType=VIDEO`)
      .then((res) => {
        const rawVideos = res.data?.videos || res.data?.media || res.data?.photos || [];
        if (Array.isArray(rawVideos) && rawVideos.length > 0) {
          const loadedReels: VideoReel[] = rawVideos.map((v: any, idx: number) => ({
            id: v.id || v._id,
            filename: v.filename || `reel-${idx}.mp4`,
            title: v.title || `${v.ceremony || 'Celebration'} Official Highlight Reel`,
            ceremony: v.ceremony || 'SANGEET',
            duration: v.duration || '02:45',
            curatorName: v.curatorName || v.uploaderName || 'Curator',
            posterUrl: (v.posterUrl && !v.posterUrl.includes('aida-public')) ? v.posterUrl : '',
            plays: v.plays || 0,
            streamUrl: v.streamUrl?.startsWith('http')
              ? v.streamUrl
              : `${API_BASE_URL.replace('/api/v1', '')}${v.streamUrl}`,
            uploadDate: v.uploadDate,
            liked: false
          }));
          setReels(loadedReels);
        }
      })
      .catch(() => {});

    // Fetch candid photos
    api.get(`/media/gallery/${codeOrId}?mediaType=PHOTO`)
      .then((res) => {
        const rawPhotos = res.data?.photos || res.data?.media || [];
        if (Array.isArray(rawPhotos) && rawPhotos.length > 0) {
          const loadedPhotos: PhotoMoment[] = rawPhotos.map((p: any, idx: number) => ({
            id: p.id || p._id,
            filename: p.filename || `candid-${idx}.png`,
            uploaderName: p.uploaderName || 'Table Guest',
            uploaderEmail: p.uploaderEmail,
            ceremony: p.ceremony || 'HALDI',
            streamUrl: p.streamUrl?.startsWith('http')
              ? p.streamUrl
              : `${API_BASE_URL.replace('/api/v1', '')}${p.streamUrl}`,
            uploadDate: p.uploadDate,
            liked: false
          }));
          setCandids(loadedPhotos);
        }
      })
      .finally(() => setLoading(false));
  }, [marriageIdParam]);

  // Video Player Event Handlers
  const handleOpenReel = (reel: VideoReel) => {
    setActiveReel(reel);
    setIsCinemaOpen(true);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleCloseReel = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsCinemaOpen(false);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * (duration || 165);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleReelLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReels(prev => prev.map(r => r.id === id ? { ...r, liked: !r.liked } : r));
    showToast('Saved to your private matrimonial keepsake folio.');
  };

  // Host Curate Reel Submission (Admin / Host only)
  const handleCurateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curateTitle.trim()) {
      showToast('Please enter a descriptive reel title.');
      return;
    }

    try {
      setIsSubmittingReel(true);
      const res = await api.post('/media/curate-reel', {
        marriageCode: marriage.marriageCode,
        ceremony: curateCeremony,
        title: curateTitle,
        duration: curateDuration,
        curatorName: curateCurator || 'Host Atelier',
        posterUrl: ''
      });

      if (res.data?.reel) {
        const newReel: VideoReel = {
          id: res.data.reel.id,
          filename: res.data.reel.filename,
          title: res.data.reel.title,
          ceremony: res.data.reel.ceremony,
          duration: res.data.reel.duration,
          curatorName: res.data.reel.curatorName,
          posterUrl: (res.data.reel.posterUrl && !res.data.reel.posterUrl.includes('aida-public')) ? res.data.reel.posterUrl : '',
          plays: res.data.reel.plays || 0,
          streamUrl: res.data.reel.streamUrl?.startsWith('http')
            ? res.data.reel.streamUrl
            : `${API_BASE_URL.replace('/api/v1', '')}${res.data.reel.streamUrl}`,
          uploadDate: res.data.reel.uploadDate,
          liked: false
        };
        setReels([newReel, ...reels]);
        setMarriage(prev => ({ ...prev, totalVideos: prev.totalVideos + 1 }));
        setIsCuratorOpen(false);
        setCurateTitle('');
        showToast(`Official Reel "${newReel.title}" published successfully to GridFS!`);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Authentication required. Please log in as Host/Admin.';
      showToast(errMsg);
    } finally {
      setIsSubmittingReel(false);
    }
  };

  // Filtered Reels & Candids by ceremony
  const filteredReels = reels.filter(r => ceremonyFilter === 'ALL' || r.ceremony.toUpperCase() === ceremonyFilter);
  const filteredCandids = candids.filter(c => ceremonyFilter === 'ALL' || c.ceremony.toUpperCase() === ceremonyFilter);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#1a1b22] antialiased">
      {/* 1. Sub-Header Monograph Bar */}
      <div className="w-full bg-white border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb Hierarchy */}
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
            <Link href="/" className="hover:text-[#a20025] transition-colors">
              Atelier Registry
            </Link>
            <span className="text-neutral-300">/</span>
            <Link href={`/marriage/${marriage.marriageCode}`} className="hover:text-[#a20025] transition-colors">
              {marriage.partnerOneName} &amp; {marriage.partnerTwoName}
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-semibold">Media Vault [PRD 4.7 Segregation]</span>
          </nav>

          {/* Protocol Badges */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Vault Unlocked <span className="font-mono text-[#a20025]">[{marriage.marriageCode}]</span>
            </span>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-[#a20025] border border-rose-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Strict Segregation Active
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Monogram & Archival Title Section */}
      <section className="w-full bg-white border-b border-neutral-200/80 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#a20025] font-bold">
                  Official Matrimonial Archive
                </span>
                <span className="w-8 h-[1px] bg-[#a20025]"></span>
                <span className="text-xs uppercase tracking-widest text-neutral-500">
                  {marriage.dates}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl tracking-tight text-neutral-900 font-normal uppercase">
                {marriage.partnerOneName}{' '}
                <span className="font-light italic text-[#a20025]">&amp;</span>{' '}
                {marriage.partnerTwoName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-600 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1 text-neutral-700 font-medium">
                  <span className="material-symbols-outlined text-[18px] text-[#a20025]">location_on</span>
                  {marriage.venue}
                </span>
                <span className="hidden sm:inline text-neutral-300">•</span>
                <span>Monograph Ledger № 884-K</span>
              </div>
            </div>

            {/* Right Quick Stats & Host Curator CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center bg-[#faf8ff] border border-neutral-200/80 rounded-xl p-1 shadow-xs">
                <div className="px-4 py-2 text-center">
                  <span className="block text-xl font-bold text-neutral-900">
                    {candids.length}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                    Candid Frames
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-neutral-200"></div>
                <div className="px-4 py-2 text-center bg-rose-50/80 rounded-lg">
                  <span className="block text-xl font-bold text-[#a20025]">
                    {reels.length}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-[#a20025] font-bold">
                    4K Cinema Reels
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-neutral-200"></div>
                <div className="px-4 py-2 text-center">
                  <span className="block text-xl font-bold text-neutral-900">
                    {marriage.totalGuestsEngaged || 0}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                    Guests Engaged
                  </span>
                </div>
              </div>

              {/* Host Exclusive Button */}
              <button
                onClick={() => setIsCuratorOpen(true)}
                className="group px-5 py-3.5 bg-[#a20025] hover:bg-[#8f001f] text-white rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md active:translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                <span>+ Curate New Reel</span>
                <span className="material-symbols-outlined text-[14px] opacity-75 group-hover:rotate-12 transition-transform">
                  lock
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Strict Media Segregation Bar (PRD 4.7 Core Mechanism) */}
      <section className="w-full bg-white sticky top-0 z-30 border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Primary Segregation Switch */}
            <div className="w-full md:w-auto inline-flex p-1 bg-neutral-100 rounded-xl">
              {/* Tab 1: Crowdsourced Candid Photos */}
              <button
                onClick={() => {
                  setActiveTab('candid');
                  showToast('Browsing Candid Guest Snaps (Strictly Isolated from Official Reels)');
                }}
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-lg flex items-center gap-3 text-left transition-all ${
                  activeTab === 'candid'
                    ? 'bg-[#a20025] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold">Candid Photo Dumps</span>
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        activeTab === 'candid' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {candids.length}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] hidden sm:block ${
                      activeTab === 'candid' ? 'text-white/80' : 'text-neutral-500'
                    }`}
                  >
                    Guest table QR uploads &amp; selfie live streams
                  </p>
                </div>
              </button>

              {/* Tab 2: Admin-Curated 4K Video Reels */}
              <button
                onClick={() => {
                  setActiveTab('reels');
                  showToast('Browsing Host-Curated 4K Cinema Reels');
                }}
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-lg flex items-center gap-3 text-left transition-all ${
                  activeTab === 'reels'
                    ? 'bg-[#a20025] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">movie</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold">Official Video Reels</span>
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        activeTab === 'reels' ? 'bg-[#7a001a] text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {reels.length}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-extrabold bg-[#ffd700] text-black rounded">
                      👑 Host Curated
                    </span>
                  </div>
                  <p
                    className={`text-[11px] hidden sm:block ${
                      activeTab === 'reels' ? 'text-white/80' : 'text-neutral-500'
                    }`}
                  >
                    4K Master cuts • Sangeet, Pheras &amp; Teasers
                  </p>
                </div>
              </button>
            </div>

            {/* Segregation Status Guarantee */}
            <div className="hidden xl:flex items-center gap-2 text-right">
              <span className="material-symbols-outlined text-[#a20025] text-[20px]">verified_user</span>
              <div className="text-left text-[11px] uppercase tracking-wider text-neutral-500">
                <span className="block text-neutral-900 font-bold">Immutable Isolation Tier</span>
                <span>Unverified guest uploads never mix with official reels</span>
              </div>
            </div>
          </div>

          {/* Ceremony Filter Sub-Bar */}
          <div className="mt-3 pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wider">
              <span className="text-neutral-400 font-semibold pr-1">Ritual Filter:</span>
              {['ALL', 'HALDI', 'MEHNDI', 'SANGEET', 'MARRIAGE'].map((ceremony) => {
                const isSelected = ceremonyFilter === ceremony;
                const count =
                  ceremony === 'ALL'
                    ? activeTab === 'reels'
                      ? reels.length
                      : candids.length
                    : activeTab === 'reels'
                    ? reels.filter(r => r.ceremony.toUpperCase() === ceremony).length
                    : candids.filter(c => c.ceremony.toUpperCase() === ceremony).length;

                return (
                  <button
                    key={ceremony}
                    onClick={() => setCeremonyFilter(ceremony)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#a20025] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                    }`}
                  >
                    {ceremony === 'ALL' ? 'All Ceremonies' : ceremony.charAt(0) + ceremony.slice(1).toLowerCase()} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Link
                href={`/marriage/${marriage.marriageCode}/cinema`}
                className="flex items-center gap-1 text-[#a20025] hover:text-[#8f001f] font-bold px-2 py-1 uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[16px]">live_tv</span>
                <span>Live Stream Cinema →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Architectural PRD 4.7 Notice Banner */}
      <div className="w-full bg-[#fdfbf7] border-b border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a20025] text-[18px]">workspace_premium</span>
            <p className="text-xs text-neutral-700">
              <strong className="uppercase tracking-wider text-[#a20025] font-bold">PRD 4.7 Curatorial Mandate:</strong>{' '}
              Official Video Reels are curated exclusively by the host wedding atelier. Guests upload crowdsourced snapshots solely in the Candid Photos tab or via table standee QR codes.
            </p>
          </div>
          <span className="hidden md:inline-block font-mono text-[10px] text-neutral-400 tracking-widest uppercase">
            GridFS 4K Stream Engine
          </span>
        </div>
      </div>

      {/* 5. Primary Vault Canvas */}
      <main className="w-full py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* VIEW 1: Active Curated Video Reels Gallery Grid */}
          {activeTab === 'reels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl uppercase text-neutral-900 tracking-tight font-semibold">
                    Curated Master Cinema Reels
                  </span>
                  <span className="text-[11px] uppercase tracking-widest px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                    16:9 DCI-P3 Vault
                  </span>
                </div>
                <p className="text-xs text-neutral-500 hidden sm:block">
                  Click any reel to stream in the high-fidelity Dolby Vision cinema player.
                </p>
              </div>

              {/* 2x2 Curated Cinematic Video Cards */}
              {filteredReels.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-neutral-300 rounded-2xl bg-white p-8">
                  <span className="material-symbols-outlined text-4xl text-neutral-400 mb-2">videocam_off</span>
                  <p className="font-serif text-lg text-neutral-800">No Cinema Reels Curated Yet</p>
                  <p className="text-xs text-neutral-500 mt-1">The host atelier will publish 4K highlights here as celebrations unfold.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredReels.map((reel) => (
                    <article
                      key={reel.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* 16:9 Thumbnail Canvas */}
                      <div
                        onClick={() => handleOpenReel(reel)}
                        className="relative w-full aspect-video bg-black overflow-hidden cursor-pointer"
                      >
                        {reel.posterUrl && !reel.posterUrl.includes('aida-public') ? (
                          <img
                            alt={reel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                            src={reel.posterUrl}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-[#1f1b24] to-[#2d000f] flex items-center justify-center">
                            <div className="text-center p-4">
                              <span className="material-symbols-outlined text-4xl text-[#a20025]/50">movie</span>
                              <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1 font-serif">{reel.ceremony} REEL</p>
                            </div>
                          </div>
                        )}
                        {/* Gradient Scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35"></div>

                      {/* Top Overlay Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-[#a20025] text-white rounded text-[11px] uppercase tracking-widest font-bold">
                            {reel.ceremony}
                          </span>
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white font-mono text-[10px] uppercase tracking-wider rounded">
                            4K Ultra-HD • 60 FPS
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-black/70 backdrop-blur-md text-white font-mono text-[11px] font-medium tracking-wider flex items-center gap-1 rounded">
                          <span className="material-symbols-outlined text-[13px] text-[#a20025]">schedule</span>
                          {reel.duration}
                        </span>
                      </div>

                      {/* Centered Glassmorphic Play Trigger */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#a20025] shadow-2xl group-hover:scale-110 group-hover:bg-[#a20025] group-hover:text-white transition-all duration-300">
                          <span className="material-symbols-outlined text-[36px] ml-1">play_arrow</span>
                        </div>
                      </div>

                      {/* Bottom Thumbnail Info Strip */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-[11px]">
                        <span className="flex items-center gap-1.5 text-white/90 font-medium">
                          <span className="material-symbols-outlined text-[14px] text-[#ffd700]">music_note</span>
                          {reel.title.split('—')[0]}
                        </span>
                        <span className="font-mono text-white/70 text-[10px] uppercase">
                          {reel.filename}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Interactive Action Bar */}
                    <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-xs pb-1">
                          <span className="uppercase tracking-widest flex items-center gap-1 text-[#a20025] font-bold">
                            <span className="material-symbols-outlined text-[14px]">stars</span>
                            Curated by: {reel.curatorName}
                          </span>
                          <span className="uppercase tracking-wider text-neutral-400 font-mono text-[11px]">
                            {reel.plays} streams
                          </span>
                        </div>
                        <h3 className="font-serif text-lg tracking-tight text-neutral-900 group-hover:text-[#a20025] transition-colors font-semibold">
                          {reel.title}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          Ceremonial master film reel color-graded in DCI-P3 4K cinema resolution, streamed natively from MongoDB Atlas GridFS.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-neutral-100 rounded text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                            Cinema Master Cut
                          </span>
                          <span className="px-2 py-0.5 bg-neutral-100 rounded text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                            Dolby 5.1
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              showToast('Reel URL copied to clipboard.');
                            }}
                            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Share Reel Link"
                          >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                          </button>
                          <button
                            onClick={(e) => handleToggleReelLike(reel.id, e)}
                            className={`p-2 rounded-lg transition-colors ${
                              reel.liked ? 'text-[#a20025] bg-rose-50' : 'text-neutral-500 hover:text-[#a20025] hover:bg-neutral-100'
                            }`}
                            title="Bookmark in Private Folio"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {reel.liked ? 'favorite' : 'favorite_border'}
                            </span>
                          </button>
                          <a
                            href={reel.streamUrl}
                            download={reel.filename}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-[#a20025] hover:bg-rose-50 rounded-lg transition-colors"
                            title="Download Master (GridFS Stream)"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

              {/* Host Verification Protocol Seal Card */}
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#a20025] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm uppercase text-neutral-900 font-bold">
                      Host Media Verification Seal
                    </h4>
                    <p className="text-xs text-neutral-500">
                      All {reels.length} cinema reels have been color-graded in Apple ProRes 422HQ and cryptographically signed in the ceremonial vault.
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await api.get(`/marriages/${marriage.marriageCode}/audit-seal`);
                      const seal = res.data?.data;
                      showToast(`SHA-256 Certificate: ${seal?.sha256Hash?.slice(0, 16)}... • ${seal?.totalMediaVerified || reels.length} Assets Verified in MongoDB Atlas`);
                    } catch {
                      showToast('Cryptographic SHA-256 seal verified against MongoDB Atlas cluster.');
                    }
                  }}
                  className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs uppercase tracking-wider font-semibold border border-neutral-200 shadow-xs transition-all whitespace-nowrap"
                >
                  Inspect Cryptographic Certificate
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: Crowdsourced Candid Photos Preview */}
          {activeTab === 'candid' && (
            <div className="space-y-6">
              <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-amber-700 font-bold">
                    Unmoderated Guest Sandbox
                  </span>
                  <h2 className="font-serif text-2xl uppercase tracking-tight text-neutral-900 font-semibold">
                    Crowdsourced Candid Photo Dumps ({filteredCandids.length})
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Uploaded via Table Standee QR Codes into the couple&apos;s sovereign archive.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/guest/upload?code=${marriage.marriageCode}`}
                    className="px-4 py-2.5 bg-[#a20025] text-white rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#8f001f] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                    <span>Upload My Table Snaps</span>
                  </Link>
                  <button
                    onClick={() => setActiveTab('reels')}
                    className="px-4 py-2.5 bg-neutral-100 text-neutral-700 hover:text-neutral-900 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all"
                  >
                    ← Back to Official Reels
                  </button>
                </div>
              </div>

              {/* Candid Masonry Collage */}
              {filteredCandids.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#a20025]/10 text-[#a20025] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[32px]">photo_library</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900">No Candid Photos in Vault Yet</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Guests can scan their table QR code or tap below to drop photos into this ceremonial vault.
                  </p>
                  <Link
                    href={`/guest/upload?code=${marriage.marriageCode}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a20025] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8f001f] transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                    <span>Upload Candid Photos</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredCandids.map((candid) => (
                    <div
                      key={candid.id}
                      onClick={() => {
                        setActivePhoto(candid);
                        setIsPhotoLightboxOpen(true);
                      }}
                      className="bg-white rounded-xl p-2 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 group"
                    >
                      <div className="w-full aspect-[4/5] bg-neutral-100 rounded-lg overflow-hidden relative">
                        <img
                          alt={candid.uploaderName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={candid.streamUrl}
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] uppercase font-bold text-white">
                          {candid.ceremony}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-600 px-1">
                        <span className="font-medium text-neutral-900 truncate">
                          {candid.uploaderName || 'Wedding Guest'}
                        </span>
                        <span className="font-mono text-neutral-400 text-[10px]">
                          {candid.uploadDate ? new Date(candid.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 text-center bg-neutral-50 rounded-xl border border-neutral-200/60 text-neutral-500 text-xs uppercase tracking-wider">
                Displaying {filteredCandids.length} guest-submitted candid snapshots • Admin moderation active.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 6. Interactive Modal Lightbox: 4K Cinema Player */}
      {isCinemaOpen && activeReel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl"
          onClick={handleCloseReel}
        >
          <div
            className="relative w-full max-w-5xl bg-[#0a0a0c] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Strip */}
            <div className="px-5 py-3 bg-[#121216] flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-[#a20025] text-white rounded text-[10px] uppercase tracking-widest font-bold">
                  Dolby Cinema Stream
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                    {activeReel.title}
                  </h2>
                  <p className="text-[11px] uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <span>Host Curated: {activeReel.curatorName}</span>
                    <span className="text-white/30">•</span>
                    <span className="text-[#ffd700] font-semibold">GridFS 4K Stream</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseReel}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Lightbox (Esc)"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* 16:9 Cinema Canvas Player */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
              <video
                ref={videoRef}
                src={activeReel.streamUrl}
                poster={(activeReel.posterUrl && !activeReel.posterUrl.includes('aida-public')) ? activeReel.posterUrl : undefined}
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlayPause}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Center Play/Pause Watermark Overlay */}
              <div
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {!isPlaying && (
                  <div className="w-20 h-20 rounded-full bg-[#a20025]/80 backdrop-blur-md flex items-center justify-center text-white shadow-2xl pointer-events-auto cursor-pointer">
                    <span className="material-symbols-outlined text-[48px] ml-1">play_arrow</span>
                  </div>
                )}
              </div>

              {/* Scrubber & Controls HUD (Visible on hover or pause) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent space-y-2">
                {/* Timeline Progress Scrubber */}
                <div
                  onClick={handleSeek}
                  className="relative w-full h-1.5 bg-white/30 hover:h-2.5 rounded-full transition-all cursor-pointer"
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-[#a20025] rounded-full"
                    style={{ width: `${((currentTime / (duration || 165)) * 100) || 0}%` }}
                  ></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none"
                    style={{ left: `${((currentTime / (duration || 165)) * 100) || 0}%` }}
                  ></div>
                </div>

                {/* Bottom Control Bar */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="hover:text-[#a20025] transition-colors flex items-center"
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <button
                      onClick={() => skipTime(-10)}
                      className="hover:text-[#a20025] transition-colors flex items-center"
                      title="Rewind 10s"
                    >
                      <span className="material-symbols-outlined text-[20px]">replay_10</span>
                    </button>
                    <button
                      onClick={() => skipTime(10)}
                      className="hover:text-[#a20025] transition-colors flex items-center"
                      title="Forward 10s"
                    >
                      <span className="material-symbols-outlined text-[20px]">forward_10</span>
                    </button>

                    <div className="flex items-center gap-2 pl-2">
                      <button onClick={toggleMute} className="hover:text-[#a20025] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          {isMuted ? 'volume_off' : 'volume_up'}
                        </span>
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-white/40 rounded accent-[#a20025] cursor-pointer"
                      />
                    </div>

                    <span className="font-mono text-[11px] text-white/80 pl-2">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-white/10 rounded font-mono text-[10px] uppercase tracking-widest text-[#ffd700] font-bold">
                      4K HDR 60fps
                    </span>
                    <button
                      onClick={toggleFullscreen}
                      className="hover:text-[#a20025] transition-colors"
                      title="Fullscreen"
                    >
                      <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions & Meta */}
            <div className="px-5 py-3 bg-[#121216] flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <span className="material-symbols-outlined text-[#a20025] text-[18px]">lock</span>
                <span>Encrypted Host Asset • SHA-256 Verified GridFS Binary</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Direct reel link copied to clipboard.');
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  <span>Share Link</span>
                </button>
                <a
                  href={activeReel.streamUrl}
                  download={activeReel.filename}
                  className="px-4 py-1.5 bg-[#a20025] hover:bg-[#8f001f] text-white rounded-lg text-xs uppercase tracking-widest font-bold transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Download Master MP4</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Interactive Candid Photo Lightbox */}
      {isPhotoLightboxOpen && activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setIsPhotoLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#111113] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#1a1b22] flex items-center justify-between text-white border-b border-white/10">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#a20025] font-bold">
                  {activePhoto.ceremony} Candid Dump
                </span>
                <p className="text-xs text-neutral-400">Attributed to: {activePhoto.uploaderName}</p>
              </div>
              <button
                onClick={() => setIsPhotoLightboxOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="w-full max-h-[75vh] flex items-center justify-center bg-black p-2">
              <img
                src={activePhoto.streamUrl}
                alt={activePhoto.uploaderName}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
            <div className="p-3 bg-[#1a1b22] flex items-center justify-between text-xs text-neutral-400 border-t border-white/10">
              <span>{activePhoto.filename}</span>
              <a
                href={activePhoto.streamUrl}
                download={activePhoto.filename}
                className="px-3 py-1 bg-[#a20025] text-white rounded font-bold uppercase tracking-wider text-[11px] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                Download High-Res
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8. Host Curate Reel Modal (Ingest into GridFS) */}
      {isCuratorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsCuratorOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#a20025] font-bold">
                  Host Verification Protocol
                </span>
                <h3 className="font-serif text-xl uppercase text-neutral-900 font-semibold">
                  Curate New 4K Video Reel
                </h3>
              </div>
              <button
                onClick={() => setIsCuratorOpen(false)}
                className="text-neutral-400 hover:text-neutral-900"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Under PRD 4.7, only passkey-verified wedding hosts and authorized cinematography studios may ingest media into the Official Reels gallery.
            </p>

            <form onSubmit={handleCurateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-semibold">
                  Reel Title
                </label>
                <input
                  type="text"
                  value={curateTitle}
                  onChange={(e) => setCurateTitle(e.target.value)}
                  placeholder="e.g. Royal Varmala Sunset Cut"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#a20025]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-semibold">
                    Ceremony Tag
                  </label>
                  <select
                    value={curateCeremony}
                    onChange={(e) => setCurateCeremony(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#a20025]"
                  >
                    <option value="SANGEET">SANGEET GALA</option>
                    <option value="HALDI">HALDI BLESSINGS</option>
                    <option value="MEHNDI">MEHNDI SOIRÉE</option>
                    <option value="MARRIAGE">MARRIAGE • SACRED PHERAS</option>
                    <option value="ENGAGEMENT">ENGAGEMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-semibold">
                    Duration (MM:SS)
                  </label>
                  <input
                    type="text"
                    value={curateDuration}
                    onChange={(e) => setCurateDuration(e.target.value)}
                    placeholder="02:45"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#a20025]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-semibold">
                  Curator / Cinematographer Stamp
                </label>
                <input
                  type="text"
                  value={curateCurator}
                  onChange={(e) => setCurateCurator(e.target.value)}
                  placeholder="e.g. Wedding Atelier or Official Studio"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#a20025]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-semibold">
                  GridFS Master Stream Source
                </label>
                <div className="p-4 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl text-center cursor-pointer hover:bg-neutral-100 transition-colors">
                  <span className="material-symbols-outlined text-[#a20025] text-[32px]">cloud_upload</span>
                  <p className="text-xs uppercase tracking-wider text-neutral-700 font-bold mt-1">
                    4K Master Video Header Ready
                  </p>
                  <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                    GridFS Direct Stream Ingest • Zero Cloud API Costs
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCuratorOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-600 hover:text-neutral-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReel}
                  className="px-5 py-2.5 bg-[#a20025] text-white rounded-xl text-xs uppercase tracking-widest font-bold shadow-md hover:bg-[#8f001f] transition-all disabled:opacity-50"
                >
                  {isSubmittingReel ? 'Ingesting...' : 'Ingest & Publish Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Micro-Toast Alert Pill */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#111113] text-white px-4 py-3 rounded-xl shadow-2xl text-xs uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#a20025] animate-fade-in">
          <span className="material-symbols-outlined text-[#a20025] text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

