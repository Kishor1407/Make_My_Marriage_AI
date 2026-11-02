'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { compressImage } from '@/lib/compression';
import { downloadInvitationAsImage } from '@/lib/invitation';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';

interface PhotoMoment {
  id: string;
  src: string;
  author: string;
  timeAgo: string;
  location: string;
  side: 'bride' | 'groom' | 'both';
  isFavorite?: boolean;
  likes: number;
  liked?: boolean;
}

interface CuratedReel {
  id: string;
  filename: string;
  title: string;
  ceremony: string;
  duration: string;
  curatorName: string;
  posterUrl: string;
  streamUrl: string;
  plays: number;
}

export default function GuestDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'rajsim24';
  const passcode = rawId.toUpperCase();

  // Dynamic Marriage Vault State
  const [coupleTitle, setCoupleTitle] = useState('Raj Malhotra & Simran Singh');
  const [coupleInitials, setCoupleInitials] = useState('R&S');
  const [venueTitle, setVenueTitle] = useState('The Grand Oberoi Amarvilas, Agra');
  const [datesTitle, setDatesTitle] = useState('October 18–20, 2024');
  const [vaultStatus, setVaultStatus] = useState('Celebrated (Past)');
  const [coverPhoto, setCoverPhoto] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk');
  const [guestCount, setGuestCount] = useState(0);

  // Active Ceremony & Media State
  const [activeEvent, setActiveEvent] = useState<'engagement' | 'mehndi' | 'haldi' | 'sangeet' | 'marriage' | 'others'>('haldi');
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bride' | 'groom' | 'favorites'>('all');
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  // Interactive Counters & Modals
  const [totalCheers, setTotalCheers] = useState(0);
  const [isLivePlayerModalOpen, setIsLivePlayerModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [curatedReels, setCuratedReels] = useState<CuratedReel[]>([]);
  const [selectedReel, setSelectedReel] = useState<CuratedReel | null>(null);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSwitchCodeModalOpen, setIsSwitchCodeModalOpen] = useState(false);
  const [newSwitchCode, setNewSwitchCode] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: 'info' | 'success' | 'crimson' } | null>(null);

  // Floating Celebration Particles
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([]);

  // Media Upload State
  const [uploaderName, setUploaderName] = useState('');
  const [uploaderCeremony, setUploaderCeremony] = useState('Haldi (Active Event)');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const invitationRef = useRef<HTMLDivElement>(null);
  const [customInviteUrl, setCustomInviteUrl] = useState<string | null>(null);

  useEffect(() => {
    if (passcode) {
      // 1. Fetch real marriage vault details from MongoDB Atlas
      api.get(`/marriages/${passcode}`)
        .then((res) => {
          if (res.data?.data) {
            const m = res.data.data;
            const fullTitle = `${m.partnerOneName} & ${m.partnerTwoName}`;
            setCoupleTitle(fullTitle);
            const init1 = (m.partnerOneName || 'R')[0];
            const init2 = (m.partnerTwoName || 'S')[0];
            setCoupleInitials(`${init1}&${init2}`);
            if (m.venue) setVenueTitle(m.venue);
            if (m.dates) setDatesTitle(m.dates);
            if (m.status) setVaultStatus(m.status);
            if (m.coverImage) setCoverPhoto(m.coverImage);
            if (m.globalStats?.totalGuestsEngaged) setGuestCount(m.globalStats.totalGuestsEngaged);
          }
        })
        .catch(() => {});

      // 2. Fetch real invitations
      api.get(`/invitations/${passcode}?ceremony=HALDI`)
        .then((res) => {
          if (res.data?.data?.cardImageUrl) {
            const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
            const imgUrl = res.data.data.cardImageUrl.startsWith('http')
              ? res.data.data.cardImageUrl
              : `${backendBase}${res.data.data.cardImageUrl}`;
            setCustomInviteUrl(imgUrl);
          }
        })
        .catch(() => {});

      // 3. Fetch real scheduled ceremonies & live streams from Event model
      api.get(`/events/marriage/${passcode}`)
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setDbEvents(res.data.data);
          }
        })
        .catch(() => {});

      // 4. Fetch real gallery candid moments & video reels from GridFS (PRD 4.7)
      const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

      api.get(`/media/gallery/${passcode}?mediaType=PHOTO`)
        .then((res) => {
          if (res.data?.photos && Array.isArray(res.data.photos)) {
            const loadedMoments: PhotoMoment[] = res.data.photos.map((p: any) => ({
              id: p.id,
              src: p.streamUrl.startsWith('http') ? p.streamUrl : `${backendBase}${p.streamUrl}`,
              author: p.uploaderName || 'Wedding Guest',
              timeAgo: p.uploadDate ? new Date(p.uploadDate).toLocaleDateString() : 'Just now',
              location: `${p.ceremony || 'Ceremony'} Celebration`,
              side: 'both',
              isFavorite: true,
              likes: 0,
              liked: false
            }));
            setMoments(loadedMoments);
          }
        })
        .catch(() => {});

      // 5. Fetch official curated video reels (PRD 4.7)
      api.get(`/media/gallery/${passcode}?mediaType=VIDEO`)
        .then((res) => {
          const rawVideos = res.data?.videos || res.data?.media || [];
          if (Array.isArray(rawVideos) && rawVideos.length > 0) {
            const loadedReels: CuratedReel[] = rawVideos.map((v: any, idx: number) => ({
              id: v.id || v._id,
              filename: v.filename || `reel-${idx}.mp4`,
              title: v.title || `${v.ceremony || 'Celebration'} Official Highlight Reel`,
              ceremony: v.ceremony || 'SANGEET',
              duration: v.duration || '02:45',
              curatorName: v.curatorName || v.uploaderName || 'Wedding Hosts',
              posterUrl: v.posterUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA55Hy4h3141dkGq_vL33-UITtTVym4N09dB435L9BjwGMwIw7qcGByK20-Lsb-u1AdvBVBotHwhFsD_xZGKn3aKbQ-b_v6gX7Oq384UMS9cyoHkNSiTJDV16jyYXE88p46TpdxVynimUhuHMtJRT3u_w38tGH8CCSOjmkeksIROJ0jOI2J9A-DB_vXZ_r0fS1NbZsl-5D6bSeDQHUE9EZFTXYjyBpQtT1Ka6rOok',
              plays: v.plays || 0,
              streamUrl: v.streamUrl?.startsWith('http')
                ? v.streamUrl
                : `${backendBase}${v.streamUrl}`
            }));
            setCuratedReels(loadedReels);
          }
        })
        .catch(() => {});
    }
  }, [passcode]);

  const showToast = (text: string, type: 'info' | 'success' | 'crimson' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Trigger floating particle animations across the screen
  const triggerPetalBurst = (emoji: string, e?: React.MouseEvent) => {
    setTotalCheers((prev) => prev + 1);
    const originX = e ? e.clientX : window.innerWidth / 2 + (Math.random() * 200 - 100);
    const originY = e ? e.clientY : window.innerHeight / 2;

    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      x: originX + (Math.random() * 80 - 40),
      y: originY + (Math.random() * 40 - 20)
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 2400);
  };

  // Photo Gallery Moments Data from GridFS
  const [moments, setMoments] = useState<PhotoMoment[]>([]);

  // Dynamic Ceremonies Data from MongoDB Atlas
  const activeEventDoc = dbEvents.find((e: any) => e.eventType?.toLowerCase() === activeEvent.toLowerCase());
  const currentCeremony = {
    title: activeEventDoc?.customTitle || `${activeEvent.charAt(0).toUpperCase() + activeEvent.slice(1)} Rite & Celebration`,
    sequence: 'Ceremonial Rite',
    date: activeEventDoc?.eventDate || datesTitle,
    time: activeEventDoc?.eventTime || 'Muhurat Scheduled',
    venue: activeEventDoc?.venueAddress || venueTitle,
    status: activeEventDoc?.streamStatus === 'LIVE' ? 'In Progress • Live' : activeEventDoc?.streamStatus || 'Scheduled',
    streamBadge: activeEventDoc?.streamStatus === 'LIVE' ? 'Live Stream Active' : 'Ceremony Schedule',
    streamUrl: activeEventDoc?.liveStreamUrl || '',
    viewers: activeEventDoc?.viewerCount ? `${activeEventDoc.viewerCount} Guests Watching` : 'Private Broadcast'
  };

  // Upload Photos with Client-Side Compression
  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast('Please select at least one photo or video.', 'crimson');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Step 1: Compress all files client-side to protect ₹0 GridFS quota
      const compressedList: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.type.startsWith('image/')) {
          const comp = await compressImage(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920 });
          compressedList.push(comp);
        } else {
          compressedList.push(file);
        }
        setUploadProgress(20 + Math.round(((i + 1) / selectedFiles.length) * 40));
      }

      setUploadProgress(70);

      // Step 2: Create mock preview moments in the feed immediately
      const newMoments: PhotoMoment[] = compressedList.map((file, idx) => ({
        id: `up_${Date.now()}_${idx}`,
        src: URL.createObjectURL(file),
        author: uploaderName.trim() || 'Guest',
        timeAgo: 'Just now',
        location: uploaderCeremony.split(' ')[0],
        side: 'both',
        likes: 0,
        liked: false
      }));

      // Try uploading to backend API if marriage exists
      try {
        const formData = new FormData();
        compressedList.forEach((file) => formData.append('photos', file));
        formData.append('ceremony', activeEvent);
        formData.append('uploader', uploaderName);
        formData.append('passcode', passcode);
        await api.post(`/photos/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch {
        // Fallback gracefully
      }

      setUploadProgress(100);

      setTimeout(() => {
        setMoments((prev) => [...newMoments, ...prev]);
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setSelectedFiles([]);
        setUploadProgress(0);
        showToast(`Successfully added ${compressedList.length} memory to the collective vault!`, 'success');
        triggerPetalBurst('✨');
      }, 500);
    } catch {
      setIsUploading(false);
      showToast('Error uploading photos. Please try again.', 'crimson');
    }
  };

  // Toggle favorite/like on moment
  const handleToggleMomentLike = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMoments((prev) =>
      prev.map((m, i) => {
        if (i === idx) {
          const newLiked = !m.liked;
          return {
            ...m,
            liked: newLiked,
            likes: newLiked ? m.likes + 1 : m.likes - 1
          };
        }
        return m;
      })
    );
    triggerPetalBurst('❤️', e);
  };

  // Filter moments
  const filteredMoments = moments.filter((m) => {
    if (activeFilter === 'bride') return m.side === 'bride' || m.side === 'both';
    if (activeFilter === 'groom') return m.side === 'groom' || m.side === 'both';
    if (activeFilter === 'favorites') return m.isFavorite || m.liked;
    return true;
  });

  // Download invite
  const handleDownloadInviteImage = async () => {
    if (invitationRef.current) {
      try {
        showToast('Rendering high-resolution wedding stationery...', 'info');
        await downloadInvitationAsImage(invitationRef.current, `Wedding-Invitation-${passcode}.png`);
        showToast('Stationery downloaded successfully!', 'success');
      } catch {
        showToast('Unable to export invite card.', 'crimson');
      }
    }
  };

  // Switch Passcode
  const handleSwitchPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSwitchCode.trim()) {
      router.push(`/marriage/${newSwitchCode.trim().toLowerCase()}`);
      setIsSwitchCodeModalOpen(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-[#0A0A0C] font-sans antialiased min-h-screen flex flex-col selection:bg-[#C81E38] selection:text-white">
      {/* Toast Shelf */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-[100] flex flex-col gap-2.5 animate-in slide-in-from-right-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 ${toastMsg.type === 'success'
              ? 'bg-white border-emerald-500/40 text-emerald-600'
              : toastMsg.type === 'crimson'
                ? 'bg-white border-[#C81E38]/50 text-[#C81E38]'
                : 'bg-white border-neutral-200 text-[#0A0A0C]'
              }`}
          >
            <AppIcon
              name={toastMsg.type === 'success' ? 'check_circle' : toastMsg.type === 'crimson' ? 'error' : 'info'}
              size={18}
            />
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Floating Particles Overlay */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="fixed pointer-events-none z-[120] text-2xl animate-float-particle select-none"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Main Container */}
      <main className="flex-1">
        {/* Welcoming Header with Couple & Quick Actions (Pure White Edition) */}
        <section className="bg-white border-b border-neutral-200 py-6 transition-colors shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 px-3 py-2.5 rounded-2xl bg-gradient-to-br from-[#c81e38] via-[#9e1b32] to-[#680014] text-white flex items-center justify-center font-editorial font-bold text-xl shadow-md shrink-0">
                {coupleInitials}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#0a0a0c] tracking-tight">
                    {coupleTitle}
                  </h1>
                  <AppIcon
                    name="verified"
                    size={20}
                    className="text-[#c81e38]"
                    title="Verified Celebration Vault"
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#c81e38]/10 text-[#c81e38] border border-[#c81e38]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c81e38] animate-pulse"></span>
                    <span>{vaultStatus}</span>
                  </span>
                </div>
                <p className="text-xs text-neutral-600 flex items-center gap-2 mt-1 flex-wrap">
                  <span>{venueTitle}</span>
                  <span className="text-neutral-300">•</span>
                  <span>{datesTitle}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-[#c81e38] font-medium">{moments.length} Photos &amp; Reels</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-800 font-semibold">{guestCount} Guests Connected</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-[11px] font-mono font-bold text-[#c81e38] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    Passcode: {passcode}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Interaction Bar in Crisp White */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/marriage/${passcode.toLowerCase()}/cinema`}
                className="px-3.5 py-2 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 animate-pulse"
              >
                <AppIcon name="videocam" size={16} />
                <span>Live Cinema</span>
              </Link>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard?.writeText(window.location.href);
                    showToast('Celebration link copied to clipboard!', 'success');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 transition-colors shadow-xs"
              >
                <AppIcon name="share" size={16} className="text-neutral-700" />
                <span>Share</span>
              </button>

              <button
                onClick={(e) => triggerPetalBurst('🪔', e)}
                className="px-3.5 py-2 rounded-xl bg-[#c81e38]/10 hover:bg-[#c81e38]/15 text-[#c81e38] border border-[#c81e38]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <AppIcon name="favorite" size={16} className="text-[#c81e38]" fill="currentColor" />
                <span>Shower Blessings</span>
              </button>

              <button
                onClick={() => setIsSwitchCodeModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 transition-colors shadow-xs"
                title="Switch wedding passcode"
              >
                <AppIcon name="key" size={16} className="text-[#c81e38]" />
                <span>Switch Passcode</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <AppIcon name="add_a_photo" size={16} />
                <span>Drop Media</span>
              </button>
            </div>
          </div>

          {/* LUXURY: Real-time Interactive Celebration & Cheers Bar */}
          <div className="mt-5 border-t border-neutral-200 pt-4 px-4 sm:px-6 bg-gradient-to-b from-[#c81e38]/5 via-[#fafafa] to-white">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c81e38] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c81e38]"></span>
                  </span>
                  <h2 className="font-editorial font-bold text-base sm:text-lg text-[#0a0a0c] flex items-center gap-1.5 tracking-wide">
                    Live Guest Blessings &amp; Shagun
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white text-[#c81e38] border border-neutral-200 shadow-xs">
                  <AppIcon name="favorite" size={13} className="text-[#c81e38]" fill="currentColor" />
                  <span>{totalCheers.toLocaleString()} cheers showered</span>
                </span>
              </div>

              {/* Quick One-Tap Floating Reactions Bar */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-neutral-200 flex-wrap">
                <span className="text-[11px] font-medium text-neutral-500 px-1 hidden md:inline">Quick Blessing:</span>
                <button
                  onClick={(e) => triggerPetalBurst('✨', e)}
                  className="px-2.5 py-1 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 text-xs font-medium text-neutral-700 transition-transform active:scale-125"
                  title="Shine"
                >
                  ✨ Shine
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('❤️', e)}
                  className="px-2.5 py-1 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 text-xs font-medium text-neutral-700 transition-transform active:scale-125"
                  title="Love"
                >
                  ❤️ Love
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('🌹', e)}
                  className="px-2.5 py-1 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 text-xs font-medium text-neutral-700 transition-transform active:scale-125"
                  title="Rose Petals"
                >
                  🌹 Roses
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('🥂', e)}
                  className="px-2.5 py-1 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 text-xs font-medium text-neutral-700 transition-transform active:scale-125"
                  title="Toast"
                >
                  🥂 Cheers
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('🪔', e)}
                  className="px-2.5 py-1 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 text-xs font-medium text-neutral-700 transition-transform active:scale-125"
                  title="Aashirwaad"
                >
                  🪔 Aashirwaad
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('🧿', e)}
                  className="px-2.5 py-1 rounded-lg hover:bg-neutral-100 hover:text-neutral-900 text-xs font-medium text-neutral-700 transition-transform active:scale-125"
                  title="Nazar Na Lage"
                >
                  🧿 Nazar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-7">
          {/* 6-Ceremony Switcher Bar */}
          <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
            <div className="flex items-center gap-2 min-w-max p-1.5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
              {[
                { key: 'engagement' as const, label: 'Engagement', icon: 'diamond' },
                { key: 'mehndi' as const, label: 'Mehndi', icon: 'spa' },
                { key: 'haldi' as const, label: 'Haldi', icon: 'wb_sunny' },
                { key: 'sangeet' as const, label: 'Sangeet', icon: 'music_note' },
                { key: 'marriage' as const, label: 'Wedding', icon: 'favorite' },
                { key: 'others' as const, label: 'Afterparty', icon: 'interests' },
              ].map(({ key, label, icon }) => {
                const ev = dbEvents.find((e: any) => e.eventType?.toLowerCase() === key);
                const isSelected = activeEvent === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveEvent(key)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#c81e38] text-white font-bold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    <AppIcon name={icon} size={16} fill={key === 'marriage' ? 'currentColor' : undefined} />
                    <span>{label}</span>
                    {ev?.streamStatus === 'LIVE' ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold animate-pulse">
                        LIVE
                      </span>
                    ) : ev?.streamStatus ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[9px] text-neutral-600">
                        {ev.streamStatus}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Ceremony Focus (Live Stream & Digital Invitation) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Stream & Key Details (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm flex flex-col transition-colors">
              <div
                className="relative aspect-video bg-neutral-900 group overflow-hidden cursor-pointer"
                onClick={() => setIsLivePlayerModalOpen(true)}
              >
                <img
                  alt={currentCeremony.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXToPktDIvWBZh-n4fPZKZRABxtpV9HSwbb3fpd5yxYMWWT7HNp6PG_wH1MFu4tXzaAsdmpPiUPbdrA5OVKioECHzexLD9HPWasiD9q4RYSFsbeRjwtqRfcpZYoXjzDzW5T5UXK01-6XZYT7hvlDPWadWI3j36Nu1_VmlDudf3Upvv-C4y1DuJ5g7Xvc-xRR-ODdXr5WMJ9BcR_m7H6fsOxMfU5Fz6tmegARyfZMw"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c81e38] text-white flex items-center gap-1.5 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>{currentCeremony.streamBadge}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] bg-black/70 backdrop-blur-md text-white font-medium flex items-center gap-1 border border-white/20">
                    <AppIcon name="visibility" size={13} className="text-[#ffb3b3]" />
                    <span>{currentCeremony.viewers}</span>
                  </span>
                </div>

                {/* Play button trigger */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white text-[#c81e38] flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-95 transition-all ring-4 ring-white/30">
                    <AppIcon name="play_arrow" size={32} />
                  </div>
                </div>

                {/* Stream info strip */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1 text-white/90">
                    <AppIcon name="hub" size={14} className="text-[#ffb3b3]" />
                    <span>WebRTC Mesh • 42ms Ultra Low Latency</span>
                  </span>
                  <span className="font-medium text-white/90">Camera: Lawn Stage Rig A</span>
                </div>
              </div>

              {/* Ceremony Details */}
              <div className="p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#c81e38] uppercase tracking-wider">
                      {currentCeremony.sequence}
                    </span>
                    <h2 className="font-editorial font-bold text-xl sm:text-2xl text-[#0a0a0c] mt-0.5">
                      {currentCeremony.title}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#c81e38]/10 text-[#c81e38] border border-[#c81e38]/30">
                    {currentCeremony.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Date</p>
                    <p className="text-xs font-semibold text-[#0a0a0c] mt-0.5">{currentCeremony.date}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Time</p>
                    <p className="text-xs font-semibold text-[#0a0a0c] mt-0.5">{currentCeremony.time}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Venue</p>
                    <p className="text-xs font-semibold text-[#0a0a0c] mt-0.5 truncate">{currentCeremony.venue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Invitation Card (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-sm transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <AppIcon name="mark_email_read" size={20} className="text-[#c81e38]" />
                    <h3 className="font-editorial font-bold text-lg text-[#0a0a0c]">Official Wedding Invitation</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    Artisanal Suite
                  </span>
                </div>

                <div
                  ref={invitationRef}
                  className="relative aspect-[4/5] max-h-[340px] rounded-xl overflow-hidden bg-neutral-50 border border-neutral-200 flex items-center justify-center group cursor-pointer mt-4"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <img
                    alt="Artisanal invitation card"
                    className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                    src={customInviteUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk"}
                  />
                  <div className="absolute bottom-3 right-3">
                    <button className="px-3 py-1.5 rounded-lg bg-neutral-900/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#c81e38] transition-colors shadow-sm">
                      <AppIcon name="fullscreen" size={15} />
                      <span>View Card</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-2.5">
                <button
                  onClick={handleDownloadInviteImage}
                  className="flex-1 h-10 px-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-neutral-300 shadow-xs"
                >
                  <AppIcon name="download" size={16} className="text-neutral-700" />
                  <span>Download Card</span>
                </button>
                <Link
                  href={`/admin/invitations?code=${passcode}`}
                  className="h-10 px-3.5 rounded-xl bg-[#0A0A0C] hover:bg-[#c81e38] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <AppIcon name="edit_note" size={15} />
                  <span>Card Studio ↗</span>
                </Link>
                <button
                  onClick={() => {
                    showToast('Celebration added to your calendar!', 'success');
                  }}
                  className="flex-1 h-10 px-3 rounded-xl bg-[#c81e38]/10 hover:bg-[#c81e38]/20 text-[#c81e38] border border-[#c81e38]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <AppIcon name="calendar_add_on" size={16} className="text-[#c81e38]" />
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guest Media Feed Section */}
          <div className="pt-3 space-y-4">
            {/* Gallery Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-neutral-200/80 shadow-xs w-fit">
                <button
                  onClick={() => setActiveMediaTab('photos')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeMediaTab === 'photos'
                    ? 'bg-[#c81e38] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                >
                  <AppIcon name="image" size={16} />
                  <span>Photos ({moments.length})</span>
                </button>
                <button
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeMediaTab === 'videos'
                    ? 'bg-[#c81e38] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                >
                  <AppIcon name="videocam" size={16} />
                  <span>Official Reels ({curatedReels.length})</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded font-extrabold bg-[#ffd700] text-black">PRD 4.7</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/marriage/${passcode}/vault`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#c81e38] bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">workspace_premium</span>
                  <span>Full Atelier Media Vault →</span>
                </Link>
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${activeFilter === 'all'
                    ? 'bg-[#c81e38] text-white shadow-sm'
                    : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('bride')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${activeFilter === 'bride'
                    ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                    : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs font-medium'
                    }`}
                >
                  Bride Side
                </button>
                <button
                  onClick={() => setActiveFilter('groom')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${activeFilter === 'groom'
                    ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                    : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs font-medium'
                    }`}
                >
                  Groom Side
                </button>
                <button
                  onClick={() => setActiveFilter('favorites')}
                  className={`px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all ${activeFilter === 'favorites'
                    ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                    : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs font-medium'
                    }`}
                >
                  <AppIcon name="star" size={14} className="text-[#c81e38]" />
                  <span>Favorites</span>
                </button>
              </div>
            </div>

            {/* Segregated Media View (PRD 4.7) */}
            {activeMediaTab === 'videos' ? (
              <div className="space-y-4">
                {/* PRD 4.7 Curatorial Banner */}
                <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#c81e38] text-[20px]">workspace_premium</span>
                    <p className="text-xs text-neutral-800">
                      <strong className="uppercase font-bold text-[#c81e38]">PRD 4.7 Curated Reels:</strong> Strictly official, admin-curated wedding highlight reels streamed directly from GridFS in 4K resolution.
                    </p>
                  </div>
                  <Link
                    href={`/marriage/${passcode}/vault`}
                    className="text-xs font-bold text-[#c81e38] hover:text-[#9e1b32] uppercase tracking-wider flex items-center gap-1 shrink-0"
                  >
                    <span>Full Atelier View</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </Link>
                </div>

                {/* 2x2 Curated Video Reels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curatedReels.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-neutral-200">
                      <AppIcon name="videocam" size={36} className="mx-auto text-neutral-300 mb-2" />
                      <p className="text-sm font-semibold text-neutral-700">No curated reels uploaded yet</p>
                      <p className="text-xs text-neutral-400 mt-1">Official highlight reels will appear here once published by the couple.</p>
                    </div>
                  ) : (
                    curatedReels.map((reel) => (
                      <div
                        key={reel.id}
                        onClick={() => {
                          setSelectedReel(reel);
                          setIsReelModalOpen(true);
                        }}
                        className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-video bg-black overflow-hidden">
                          <img
                            src={reel.posterUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35"></div>

                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-1 bg-[#c81e38] text-white text-[10px] uppercase font-bold tracking-wider rounded">
                              {reel.ceremony}
                            </span>
                            <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white font-mono text-[10px] rounded flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px] text-[#c81e38]">schedule</span>
                              {reel.duration}
                            </span>
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/85 backdrop-blur-md text-[#c81e38] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#c81e38] group-hover:text-white transition-all">
                              <AppIcon name="play" size={26} />
                            </div>
                          </div>

                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                            <span className="truncate pr-2 font-medium">{reel.title}</span>
                            <span className="font-mono text-[10px] opacity-75 shrink-0">4K DCI</span>
                          </div>
                        </div>

                        <div className="p-3.5 flex items-center justify-between text-xs">
                          <span className="text-neutral-500 font-medium">Curated by: {reel.curatorName}</span>
                          <span className="text-[#c81e38] font-bold flex items-center gap-1">
                            <AppIcon name="videocam" size={14} /> Stream 4K Reel
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Responsive Candid Moments Grid */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMoments.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-neutral-200">
                    <AppIcon name="photo_camera" size={40} className="mx-auto text-neutral-300 mb-2" />
                    <p className="text-sm font-semibold text-neutral-700">No candid photos uploaded yet for this ceremony</p>
                    <p className="text-xs text-neutral-400 mt-1">Be the first guest to capture and upload a cherished moment!</p>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-[#c81e38] text-white text-xs font-semibold rounded-xl hover:bg-[#9e1b32] transition-colors"
                    >
                      Upload Photo
                    </button>
                  </div>
                ) : (
                  filteredMoments.map((moment, idx) => (
                    <div
                      key={moment.id}
                      onClick={() => {
                        setLightboxIndex(idx);
                        setIsLightboxOpen(true);
                      }}
                      className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-white shadow-sm border border-neutral-200/80 cursor-pointer"
                    >
                      <img
                        alt={moment.author}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={moment.src}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={(e) => handleToggleMomentLike(idx, e)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${moment.liked
                              ? 'bg-[#c81e38] text-white'
                              : 'bg-white/20 backdrop-blur-md text-white hover:bg-[#c81e38]'
                              }`}
                          >
                            <AppIcon
                              name="favorite"
                              size={18}
                              className={moment.liked ? "text-white" : "text-white/80"}
                              fill={moment.liked ? "currentColor" : "none"}
                            />
                          </button>
                          <a
                            href={moment.src}
                            download={`memory-${idx}.jpg`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 flex items-center justify-center transition-colors"
                          >
                            <AppIcon name="download" size={18} />
                          </a>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{moment.author}</p>
                          <p className="text-[10px] text-white/80">{moment.timeAgo} • {moment.location}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Upcoming Event Teaser */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#c81e38]/10 via-neutral-50 to-white border border-[#c81e38]/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#c81e38]/10 text-[#c81e38] flex items-center justify-center shrink-0 border border-[#c81e38]/20">
                  <AppIcon name="flare" size={24} />
                </div>
                <div>
                  <h4 className="font-editorial font-bold text-sm text-[#0a0a0c]">Live Celebration Moments &amp; Highlights</h4>
                  <p className="text-xs text-neutral-600">Drop your candids or watch the live broadcast with friends and family.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploaderCeremony(`${activeEvent.toUpperCase()} Celebration`);
                  setIsUploadModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#c81e38] hover:text-white text-neutral-800 border border-neutral-200 text-xs font-semibold transition-all shrink-0 shadow-xs"
              >
                Upload Memory
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <aside className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="w-14 h-14 rounded-full bg-[#c81e38] hover:bg-[#9e1b32] text-white shadow-xl flex items-center justify-center ring-4 ring-[#c81e38]/20 hover:scale-105 active:scale-95 transition-all group"
          title="Drop Photos into Couple's Vault"
        >
          <AppIcon name="add_a_photo" size={26} />
        </button>
      </aside>

      {/* MODAL 1: Interactive Live Player with Reaction Emojis */}
      {isLivePlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-white flex items-center justify-between text-[#0a0a0c] z-10 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#c81e38] text-white text-[10px] font-bold uppercase tracking-wider">
                  WebRTC Broadcast
                </span>
                <span className="font-editorial font-bold text-base">{currentCeremony.title}</span>
                <span className="text-xs text-neutral-500 hidden sm:inline">• {currentCeremony.viewers}</span>
              </div>
              <button
                onClick={() => setIsLivePlayerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
              {currentCeremony.streamUrl ? (
                <iframe
                  src={currentCeremony.streamUrl}
                  title="Live Wedding Stream"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 text-neutral-400">
                  <AppIcon name="videocam" size={48} className="mx-auto text-neutral-600 mb-2" />
                  <p className="text-sm font-semibold text-white">Broadcast Standby</p>
                  <p className="text-xs text-neutral-400 mt-1">Live streaming will commence when the hosts go live for this ceremony.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Tap cheer reaction:</span>
                <button
                  onClick={(e) => triggerPetalBurst('❤️', e)}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#c81e38] hover:text-white active:scale-125 text-neutral-700 text-xs transition-all"
                >
                  ❤️ Love
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('🌹', e)}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#c81e38] hover:text-white active:scale-125 text-neutral-700 text-xs transition-all"
                >
                  🌹 Roses
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('👏', e)}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#c81e38] hover:text-white active:scale-125 text-neutral-700 text-xs transition-all"
                >
                  👏 Cheers
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('✨', e)}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#c81e38] hover:text-white active:scale-125 text-neutral-700 text-xs transition-all"
                >
                  ✨ Blessings
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/marriage/${passcode.toLowerCase()}/cinema`}
                  className="px-3 py-1.5 rounded-lg bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <AppIcon name="aspect_ratio" size={14} />
                  <span>Full Cinema</span>
                </Link>
                <button
                  onClick={() => showToast('Switched to Drone Overhead 4K view', 'info')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-200"
                >
                  Drone Feed
                </button>
                <button
                  onClick={() => {
                    setIsLivePlayerModalOpen(false);
                    setIsUploadModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-semibold"
                >
                  Upload Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Lightbox View */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-white p-2">
              <div>
                <p className="font-bold text-sm">{filteredMoments[lightboxIndex]?.author}</p>
                <p className="text-xs text-white/70">
                  {filteredMoments[lightboxIndex]?.timeAgo} • {filteredMoments[lightboxIndex]?.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleToggleMomentLike(lightboxIndex, e)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors ${filteredMoments[lightboxIndex]?.liked ? 'bg-[#c81e38]' : 'bg-white/10 hover:bg-[#c81e38]'
                    }`}
                  title="Favorite"
                >
                  <AppIcon
                    name="favorite"
                    size={18}
                    className={filteredMoments[lightboxIndex]?.liked ? "text-white" : "text-white/80"}
                    fill={filteredMoments[lightboxIndex]?.liked ? "currentColor" : "none"}
                  />
                </button>
                <a
                  href={filteredMoments[lightboxIndex]?.src}
                  download="vault-highres.jpg"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  title="Download High-Res"
                >
                  <AppIcon name="download" size={18} />
                </a>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  title="Close"
                >
                  <AppIcon name="close" size={18} />
                </button>
              </div>
            </div>

            <div className="relative w-full flex items-center justify-center flex-1 max-h-[75vh] overflow-hidden my-2">
              <button
                onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredMoments.length - 1))}
                className="absolute left-2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#c81e38] text-white flex items-center justify-center z-10"
              >
                <AppIcon name="chevron_left" size={20} />
              </button>
              <img
                alt="Full view"
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/20"
                src={filteredMoments[lightboxIndex]?.src}
              />
              <button
                onClick={() => setLightboxIndex((prev) => (prev < filteredMoments.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#c81e38] text-white flex items-center justify-center z-10"
              >
                <AppIcon name="chevron_right" size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 4K Curated Video Reel Player Lightbox (PRD 4.7) */}
      {isReelModalOpen && selectedReel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setIsReelModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#0a0a0c] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#121216] flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-[#c81e38] text-white rounded text-[10px] uppercase font-bold tracking-wider">
                  {selectedReel.ceremony} 4K REEL
                </span>
                <div>
                  <h3 className="text-white text-sm sm:text-base font-bold truncate max-w-[280px] sm:max-w-md">
                    {selectedReel.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Curated by: {selectedReel.curatorName} • GridFS 4K Stream
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <AppIcon name="close" size={16} />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                src={selectedReel.streamUrl}
                poster={selectedReel.posterUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-3 bg-[#121216] flex items-center justify-between border-t border-white/10 text-xs text-neutral-400">
              <span className="font-mono text-[11px]">{selectedReel.filename}</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/marriage/${passcode}/vault`}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">workspace_premium</span>
                  <span>Full Atelier Vault</span>
                </Link>
                <a
                  href={selectedReel.streamUrl}
                  download={selectedReel.filename}
                  className="px-3 py-1.5 bg-[#c81e38] hover:bg-[#9e1b32] text-white rounded-lg font-bold uppercase tracking-wider text-[11px] flex items-center gap-1 transition-all"
                >
                  <AppIcon name="download" size={14} />
                  <span>Download MP4</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Guest Upload Modal in Pure White Theme */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white text-[#0a0a0c] rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
            <div className="p-4 bg-neutral-50 flex items-center justify-between border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <AppIcon name="cloud_upload" size={20} className="text-[#c81e38]" />
                <h3 className="font-editorial font-bold text-base text-[#0a0a0c]">Drop Media to Vault</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-black"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm text-[#0a0a0c] focus:outline-none focus:border-[#c81e38] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tag Ceremony</label>
                <select
                  value={uploaderCeremony}
                  onChange={(e) => setUploaderCeremony(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-300 text-sm text-[#0a0a0c] focus:outline-none focus:border-[#c81e38] focus:bg-white"
                >
                  <option>Haldi (Active Event)</option>
                  <option>Engagement</option>
                  <option>Mehndi</option>
                  <option>Sangeet</option>
                  <option>Marriage</option>
                  <option>Others / Candid</option>
                </select>
              </div>

              <label className="block p-6 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-center cursor-pointer hover:border-[#c81e38] transition-colors">
                <AppIcon name="photo_library" size={32} className="text-[#c81e38] mb-1" />
                <p className="text-xs font-bold text-[#0a0a0c]">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Tap to choose photos or videos'}
                </p>
                <p className="text-[11px] text-neutral-500">Auto-compressed to ~500KB (₹0 GridFS Cloud)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />
              </label>

              {isUploading && (
                <div className="p-3 rounded-xl bg-neutral-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-700">Compressing &amp; uploading to vault...</span>
                    <span className="text-[#c81e38]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-[#c81e38] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-2">
              <Link
                href={`/guest/upload?code=${passcode}`}
                className="text-xs text-[#c81e38] font-bold hover:underline flex items-center gap-1"
              >
                Full Upload Studio ↗
              </Link>
              <div className="flex items-center gap-2">
                <button
                  disabled={isUploading}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  disabled={isUploading}
                  onClick={handleStartUpload}
                  className="px-5 py-2 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Start Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Digital Invitation Full Card */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-neutral-50 flex items-center justify-between border-b border-neutral-200">
              <h3 className="font-editorial font-bold text-sm text-[#0a0a0c]">{coupleTitle} • Wedding Invitation</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-black"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex flex-col items-center">
              <img
                alt="Full card preview"
                className="max-h-[440px] object-contain rounded-xl shadow-sm border border-neutral-200"
                src={customInviteUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk"}
              />
            </div>
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-2">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-black"
              >
                Close
              </button>
              <button
                onClick={handleDownloadInviteImage}
                className="px-4 py-2 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <AppIcon name="download" size={16} />
                <span>Download Card</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* MODAL 6: Switch Passcode Modal */}
      {isSwitchCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 text-[#0a0a0c]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-editorial font-bold text-base">Enter Vault Passcode</h3>
              <button
                onClick={() => setIsSwitchCodeModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-black"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleSwitchPasscode} className="space-y-4">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. RAJSIM24"
                value={newSwitchCode}
                onChange={(e) => setNewSwitchCode(e.target.value.toUpperCase())}
                className="w-full h-11 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-center text-base font-bold tracking-widest uppercase focus:outline-none focus:border-[#c81e38] focus:bg-white"
              />
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-sm"
              >
                Access Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-neutral-200 bg-[#FAFAFA] py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-editorial tracking-widest uppercase font-bold text-[#0a0a0c]">Make My Marriage</span>
            <span>• Pure White &amp; Crimson Luxury Wedding Cloud</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#c81e38] font-medium">₹0 Serverless Architecture • GridFS Streaming</span>
            <Link href="/admin/login" className="hover:text-black transition-colors font-semibold">
              Host Concierge
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
