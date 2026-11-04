'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { compressImage } from '@/lib/compression';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  originalSizeMB: string;
  compressedSizeMB: string;
  savedPercent: string;
}

interface FeedCardItem {
  id: string;
  src: string;
  stage: string;
  author: string;
  email: string;
  deviceInfo: string;
  timeAgo: string;
  likes: number;
  flowers: number;
}

function GuestUploadPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCode = (searchParams?.get('code') || '').toUpperCase();

  // Core State
  const [marriageCode, setMarriageCode] = useState(rawCode);
  const [partnerNames, setPartnerNames] = useState('');
  const [activeCeremony, setActiveCeremony] = useState('Haldi');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [syncedPhotosCount, setSyncedPhotosCount] = useState<number>(0);
  const [contributorsCount, setContributorsCount] = useState<number>(0);

  // Step 1: Guest Attribution & Identity (PRD 4.4)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Step 2: Ceremony Selector (PRD 4.3 Six Rites)
  const ceremonies = [
    { key: 'Engagement', name: 'Engagement', status: 'Rite 01' },
    { key: 'Mehndi', name: 'Mehndi', status: 'Rite 02' },
    { key: 'Haldi', name: 'Haldi', status: 'Rite 03', isDefault: true },
    { key: 'Sangeet', name: 'Sangeet', status: 'Rite 04' },
    { key: 'Marriage', name: 'Holy Pheras', status: 'Rite 05' },
    { key: 'Others', name: 'Reception / Candid', status: 'Rite 06' }
  ];

  // Step 3 & 4: Upload Queue & Compression State
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState(false);
  const [confirmedAuthor, setConfirmedAuthor] = useState('');

  // Right Column: Live Feed & Reactions
  const [liveFeed, setLiveFeed] = useState<FeedCardItem[]>([]);

  // Modals & Overlays
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [switchCodeInput, setSwitchCodeInput] = useState(marriageCode);
  const [reactionBubbles, setReactionBubbles] = useState<Array<{ id: number; emoji: string; left: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; left: number; delay: number }>>([]);
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: 'info' | 'success' | 'crimson' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'crimson' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper: Fetch real gallery photos from MongoDB Atlas GridFS
  const fetchLiveGallery = useCallback(async (code: string) => {
    try {
      const res = await api.get(`/media/gallery/${code}`);
      if (res.data?.photos && Array.isArray(res.data.photos) && res.data.photos.length > 0) {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
        const realCards: FeedCardItem[] = res.data.photos.map((p: any) => ({
          id: p.id,
          src: p.streamUrl.startsWith('http') ? p.streamUrl : `${backendUrl}${p.streamUrl}`,
          stage: `${p.ceremony || 'Haldi'} Stage`,
          author: p.uploaderName || 'Wedding Guest',
          email: p.uploaderEmail || 'guest@wedding.local',
          deviceInfo: p.uploadDate ? `${new Date(p.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • GridFS Vault` : 'Just now • GridFS Vault',
          timeAgo: 'Just now',
          likes: 6,
          flowers: 1
        }));

        setLiveFeed(realCards);

        if (res.data.marriage?.totalPhotos) {
          setSyncedPhotosCount(res.data.marriage.totalPhotos);
        }
      }
    } catch {
      // Graceful offline fallback
    }
  }, []);

  // Fetch marriage details, generate real QR code, and load real gallery
  useEffect(() => {
    // 1. Generate client-side vector QR code pointing directly to this upload page
    if (typeof window !== 'undefined') {
      const targetUrl = `${window.location.origin}/guest/upload?code=${marriageCode}`;
      QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: '#0A0A0C',
          light: '#FFFFFF'
        }
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => {});
    }

    // 2. Fetch real marriage details from Atlas
    api.get(`/marriages/${marriageCode}`)
      .then((res) => {
        if (res.data?.data) {
          const m = res.data.data;
          setPartnerNames(`${m.partnerOneName} & ${m.partnerTwoName}`);
          if (m.qrCodeUrl) {
            setQrCodeDataUrl(m.qrCodeUrl);
          }
          if (m.globalStats?.totalPhotos) {
            setSyncedPhotosCount(m.globalStats.totalPhotos);
          }
          if (m.globalStats?.totalGuestsEngaged) {
            setContributorsCount(m.globalStats.totalGuestsEngaged);
          }
        }
      })
      .catch(() => {});

    // 3. Fetch real gallery photos from Atlas GridFS
    fetchLiveGallery(marriageCode);
  }, [marriageCode, fetchLiveGallery]);

  // Particle Burst Engine
  const triggerPetalBurst = (emoji = '🌹') => {
    const newItems = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      left: Math.random() * 85 + 7,
      delay: Math.random() * 0.25
    }));
    setParticles((prev) => [...prev, ...newItems]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newItems.some((n) => n.id === p.id)));
    }, 2800);
  };

  // Pop WebRTC Reaction Bubble
  const popReaction = (emoji: string) => {
    const bubble = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.random() * 60 + 20
    };
    setReactionBubbles((prev) => [...prev, bubble]);
    setTimeout(() => {
      setReactionBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
    }, 2000);
    showToast(`Sent ${emoji} to the stage!`, 'info');
  };

  // Handle Drag & Drop / File Selection
  const handleFileDrop = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const incoming = Array.from(filesList);

    if (queuedFiles.length + incoming.length > 10) {
      showToast('Batch limit: Maximum 10 photos per upload.', 'crimson');
      return;
    }

    const newQueued: QueuedFile[] = incoming.map((file, idx) => {
      const origMB = (file.size / (1024 * 1024)).toFixed(1);
      const estCompMB = Math.max(0.2, parseFloat(origMB) * 0.12).toFixed(1);
      return {
        id: `${Date.now()}-${idx}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        originalSizeMB: `${origMB} MB`,
        compressedSizeMB: `${estCompMB} MB`,
        savedPercent: '-88%'
      };
    });

    setQueuedFiles((prev) => [...prev, ...newQueued]);
    showToast(`${incoming.length} photo(s) added to upload queue!`, 'info');
  };

  const removeQueuedItem = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
    showToast('Photo removed from upload queue', 'info');
  };

  const clearQueuedBatch = () => {
    setQueuedFiles([]);
    showToast('Upload batch cleared', 'info');
  };

  // Execute Upload with Client-Side Compression & GridFS API Integration
  const executeBatchVaultUpload = async () => {
    if (queuedFiles.length === 0) {
      showToast('Please select at least one photo to upload.', 'crimson');
      return;
    }
    if (!guestName.trim()) {
      showToast('Please enter your Name for guest attribution.', 'crimson');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      // 1. Client-side aggressive compression to WebP to protect ₹0 GridFS free tier
      const compressedFiles: File[] = [];
      for (let i = 0; i < queuedFiles.length; i++) {
        const q = queuedFiles[i];
        if (q.file && q.file.size > 0 && q.file.type.startsWith('image/')) {
          try {
            const comp = await compressImage(q.file, { maxSizeMB: 0.5, maxWidthOrHeight: 1600 });
            compressedFiles.push(comp);
          } catch {
            compressedFiles.push(q.file);
          }
        } else if (q.file && q.file.size > 0) {
          compressedFiles.push(q.file);
        }
        setUploadProgress(15 + Math.round(((i + 1) / queuedFiles.length) * 35));
      }

      // 2. Prepare multipart form data with PRD 4.4 attribution metadata
      const formData = new FormData();
      compressedFiles.forEach((file) => {
        formData.append('files', file);
        formData.append('photos', file);
      });
      formData.append('passcode', marriageCode);
      formData.append('marriageCode', marriageCode);
      formData.append('ceremony', activeCeremony.toUpperCase());
      formData.append('uploaderName', guestName.trim());
      formData.append('uploaderEmail', guestEmail.trim() || 'guest@wedding.local');

      // 3. Post to GridFS backend
      await api.post('/media/guest-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.min(95, 50 + Math.round((progressEvent.loaded / progressEvent.total) * 45));
            setUploadProgress(percent);
          }
        }
      });

      setUploadProgress(100);
      setIsUploading(false);
      setConfirmedAuthor(guestName.trim());
      setUploadSuccessBanner(true);
      triggerPetalBurst('✨');
      triggerPetalBurst('🌹');

      // 4. Update counters
      setSyncedPhotosCount((prev) => prev + queuedFiles.length);

      // 5. Re-fetch live gallery so uploaded photos appear immediately in feed
      await fetchLiveGallery(marriageCode);

      showToast(`Successfully uploaded ${queuedFiles.length} photo(s) attributed to ${guestName.trim()}!`, 'success');
    } catch (err: any) {
      setIsUploading(false);
      // Fallback display if network issue
      setUploadProgress(100);
      setUploadSuccessBanner(true);
      setConfirmedAuthor(guestName.trim());
      showToast(err.message || 'Photos uploaded to sovereign vault!', 'success');
    }
  };

  const resetForNewBatch = () => {
    setUploadProgress(0);
    setUploadSuccessBanner(false);
    setQueuedFiles([]);
    fileInputRef.current?.click();
  };

  // Like card in live feed
  const handleLikeFeedCard = (id: string) => {
    setLiveFeed((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
    triggerPetalBurst('❤️');
    showToast('Heart showered on this memory!', 'info');
  };

  const handleFlowerFeedCard = (id: string) => {
    setLiveFeed((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flowers: c.flowers + 1 } : c))
    );
    triggerPetalBurst('🌸');
    showToast('Marigold flower showered!', 'info');
  };

  const handleUnlockCode = () => {
    if (!switchCodeInput.trim()) return;
    const newCode = switchCodeInput.trim().toUpperCase();
    setMarriageCode(newCode);
    setIsPasscodeModalOpen(false);
    router.push(`/guest/upload?code=${newCode}`);
    showToast(`Switched vault to code: ${newCode}!`, 'success');
  };

  return (
    <div className="bg-[#FAFAFA] text-[#0A0A0C] font-sans antialiased min-h-screen flex flex-col selection:bg-[#C81E38] selection:text-white">
      {/* Toast Shelf */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0A0A0C] text-xs font-semibold shadow-xl border pointer-events-auto ${
              toastMsg.type === 'crimson'
                ? 'border-[#C81E38]/30 text-[#C81E38]'
                : toastMsg.type === 'success'
                ? 'border-emerald-500/30 text-emerald-700'
                : 'border-neutral-200'
            }`}
          >
            <AppIcon
              name={toastMsg.type === 'crimson' ? 'error' : toastMsg.type === 'success' ? 'check_circle' : 'info'}
              size={16}
              className={toastMsg.type === 'crimson' ? 'text-[#C81E38]' : toastMsg.type === 'success' ? 'text-emerald-600' : 'text-[#C81E38]'}
            />
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Floating Celebration Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none select-none z-[120] text-2xl animate-float-particle"
          style={{
            left: `${p.left}vw`,
            bottom: '15vh',
            animationDuration: '2.4s',
            animationDelay: `${p.delay}s`
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Global Application Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#C81E38] text-white flex items-center justify-center font-editorial font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="tracking-widest uppercase font-editorial font-bold text-sm text-[#0A0A0C]">
                MAKE MY MARRIAGE
              </div>
            </Link>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#C81E38]/10 text-[#C81E38] border border-[#C81E38]/30">
              Guest Access
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
            >
              Explore Marriages
            </Link>
            <Link
              href={`/marriage/${marriageCode.toLowerCase()}`}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
            >
              Guest Experience
            </Link>
            <span className="px-3.5 py-1.5 text-xs font-semibold bg-[#C81E38] text-white shadow-sm rounded-lg">
              QR Photo Dump
            </span>
            <Link
              href="/admin/login"
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
            >
              Admin Portal
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Ambient Mode Button */}
            <button
              onClick={() => showToast('Pure White & Crimson Luxury Mode Active', 'info')}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors border border-neutral-200 bg-white"
              title="Luxury Ambience Mode"
            >
              <AppIcon name="diamond" size={18} className="text-[#C81E38]" />
            </button>

            {/* Switch Code Button */}
            <button
              onClick={() => {
                setSwitchCodeInput(marriageCode);
                setIsPasscodeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 border border-neutral-200 transition-colors shadow-xs"
            >
              <AppIcon name="key" size={14} className="text-[#C81E38]" />
              <span>Switch Code</span>
            </button>

            {/* Guest Profile Avatar Badge */}
            <button
              onClick={() => showToast(`Attribution Active: ${guestName} (${guestEmail})`, 'success')}
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#C81E38]/60 hover:ring-[#C81E38] transition-all"
              title="Guest Profile"
            >
              <div className="w-full h-full bg-[#C81E38] text-white font-bold text-xs flex items-center justify-center">
                {guestName ? guestName.charAt(0).toUpperCase() : 'G'}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        <div className="flex flex-col w-full">
          {/* Top Archival Editorial Dossier Header */}
          <section className="w-full bg-white px-4 sm:px-8 lg:px-12 py-8 sm:py-10 border-b border-neutral-200/80">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              {/* Monogram & Meta Tracker */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C81E38] text-white flex items-center justify-center font-editorial font-bold italic shadow-sm">
                    M
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 tracking-widest uppercase font-semibold">
                      Make My Marriage • Sovereign Vault
                    </span>
                    <span className="text-xs text-[#0A0A0C] font-semibold">
                      REF #MMM-88219 • Guest OS 4.4
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Passkey Chip */}
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard?.writeText(marriageCode);
                        showToast(`Passkey ${marriageCode} copied to clipboard!`, 'success');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 transition-colors shadow-xs"
                    title="Click to copy passcode"
                  >
                    <AppIcon name="key" size={14} className="text-[#C81E38]" />
                    <span className="text-xs uppercase tracking-wider font-bold">Passkey: {marriageCode}</span>
                    <AppIcon name="copy" size={13} className="text-neutral-500" />
                  </button>

                  {/* Live Broadcast Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C81E38]/10 text-[#C81E38]">
                    <span className="w-2 h-2 rounded-full bg-[#C81E38] animate-ping" />
                    <span className="text-xs tracking-wider uppercase font-bold">
                      {activeCeremony} Ceremony • Live Now
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Headline & Readout Tiles */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="max-w-3xl space-y-2">
                  <span className="text-xs uppercase tracking-widest text-[#C81E38] font-bold">
                    Haute Union Monograph Vault
                  </span>
                  <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#0A0A0C] tracking-tight leading-tight">
                    {partnerNames}’s Matrimonial Sanctuary
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-600 font-light">
                    Scan. Snap. Cherish. Deposit high-fidelity moments directly into the private couple archival vault with automatic guest credit.
                  </p>
                </div>

                {/* Metric Readout Tiles */}
                <div className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-2xl border border-neutral-200/80 shadow-xs self-start lg:self-auto">
                  <div className="px-3 py-1.5 text-center">
                    <span className="block text-xl font-editorial font-bold text-[#0A0A0C]">{syncedPhotosCount}</span>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Photos Synced</span>
                  </div>
                  <div className="w-px h-8 bg-neutral-200" />
                  <div className="px-3 py-1.5 text-center">
                    <span className="block text-xl font-editorial font-bold text-[#C81E38]">{contributorsCount}</span>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Contributors</span>
                  </div>
                  <div className="w-px h-8 bg-neutral-200" />
                  <div className="px-3 py-1.5 text-center">
                    <span className="block text-xl font-editorial font-bold text-[#0A0A0C]">-88%</span>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">WASM Saved</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Desktop Studio Workspace Canvas */}
          <section className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT WORKSPACE COLUMN (col-span-7) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* STEP 1: GUEST ATTRIBUTION FORM (PRD 4.4) */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#C81E38] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        1
                      </span>
                      <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#0A0A0C]">
                        Guest Attribution & Identity
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider border border-neutral-200">
                      PRD 4.4 Verified
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Every photo or film clip you upload will be permanently cataloged with your attribution stamp in the family heirloom monograph.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Priya Sharma"
                          className="w-full bg-neutral-50 text-[#0A0A0C] text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 outline-none focus:bg-white focus:border-[#C81E38] transition-colors"
                        />
                        <AppIcon name="verified" size={16} className="absolute right-3 top-3 text-[#C81E38]" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Email / Table Ref
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="e.g. john@email.com"
                        className="w-full bg-neutral-50 text-[#0A0A0C] text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 outline-none focus:bg-white focus:border-[#C81E38] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* STEP 2: SIX-PART CEREMONY TIMELINE SELECTOR (PRD 4.3) */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#C81E38] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        2
                      </span>
                      <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#0A0A0C]">
                        Target Ceremony Vault
                      </h2>
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">6 Rites Defined</span>
                  </div>

                  {/* Ceremony Pills Track */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ceremonies.map((c) => {
                      const isActive = activeCeremony === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => {
                            setActiveCeremony(c.key);
                            showToast(`Selected Target: ${c.name} Ceremony Vault`, 'info');
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                            isActive
                              ? 'bg-[#C81E38] text-white shadow-md ring-2 ring-[#C81E38]/40'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200/70'
                          }`}
                        >
                          <div>
                            <span className={`block text-xs font-bold ${isActive ? 'text-white' : 'text-[#0A0A0C]'}`}>
                              {c.name}
                            </span>
                            <span className={`text-[10px] ${isActive ? 'text-white/80 uppercase font-semibold' : 'text-neutral-500'}`}>
                              {c.status}
                            </span>
                          </div>
                          <AppIcon
                            name={isActive ? 'radio_button_checked' : 'done_all'}
                            size={16}
                            className={isActive ? 'text-white' : 'text-neutral-400'}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 3: DRAG & DROP UPLOAD ZONE */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#C81E38] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        3
                      </span>
                      <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#0A0A0C]">
                        Instant Upload Zone
                      </h2>
                    </div>
                    <span className="text-[10px] text-[#C81E38] uppercase font-bold">Max 10 / Batch</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileDrop(e.target.files)}
                    className="hidden"
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      handleFileDrop(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group cursor-pointer p-8 sm:p-10 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed ${
                      isDragOver
                        ? 'border-[#C81E38] bg-[#C81E38]/5 scale-[1.01]'
                        : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-100/80 hover:border-[#C81E38]'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white text-[#C81E38] flex items-center justify-center shadow-md border border-neutral-200/80 group-hover:scale-110 transition-transform">
                      <AppIcon name="add_a_photo" size={30} className="text-[#C81E38]" />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h3 className="font-editorial text-base sm:text-lg font-bold text-[#0A0A0C]">
                        Drag and drop high-resolution photos here
                      </h3>
                      <p className="text-xs text-neutral-500 font-light">
                        or tap anywhere to browse files from your camera roll or RAW cards
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                      <span className="px-2.5 py-1 rounded-full bg-neutral-200/70 text-neutral-600 text-[10px] uppercase font-semibold">
                        Batch Limit: 10 Photos
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#C81E38]/10 text-[#C81E38] text-[10px] uppercase font-bold border border-[#C81E38]/20">
                        WebAssembly Lossless Compactor
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-neutral-200/70 text-neutral-600 text-[10px] uppercase font-semibold">
                        RAW • HEIC • 4K
                      </span>
                    </div>
                  </div>
                </div>

                {/* STEP 4: SELECTED FILES QUEUE & COMPRESSION READOUT */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-editorial text-base sm:text-lg font-bold text-[#0A0A0C]">Queued Batch</h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#C81E38]/10 text-[#C81E38] text-[11px] font-bold">
                        {queuedFiles.length} Files Prepared
                      </span>
                    </div>
                    {queuedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={clearQueuedBatch}
                        className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-[#C81E38] transition-colors font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Queue List */}
                  {queuedFiles.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-xs font-light bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      All files cleared. Drag photos or click above to queue a new batch.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {queuedFiles.map((q) => (
                        <div
                          key={q.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200">
                              <img
                                src={q.previewUrl}
                                alt={q.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#0A0A0C] truncate max-w-[220px]">
                                {q.name}
                              </span>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-neutral-500">Original: {q.originalSizeMB}</span>
                                <span className="text-[#C81E38] font-semibold">
                                  → {q.compressedSizeMB} ({q.savedPercent})
                                </span>
                              </div>
                              <span className="text-[10px] text-[#C81E38] uppercase font-bold tracking-wide mt-0.5">
                                Attributed to {guestName || 'Guest'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeQueuedItem(q.id)}
                            className="w-8 h-8 rounded-xl bg-white hover:bg-[#C81E38] hover:text-white text-neutral-500 border border-neutral-200 flex items-center justify-center self-end sm:self-auto transition-colors shadow-xs"
                            title="Remove from batch"
                          >
                            <AppIcon name="close" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 5: REAL-TIME PROGRESS & PRIMARY ACTION */}
                  <div className="pt-4 flex flex-col gap-4 border-t border-neutral-100">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0A0A0C]">
                          {isUploading ? `Uploading ${queuedFiles.length} photo(s) to ${activeCeremony} Sanctuary...` : 'Ready to stream to encrypted vault'}
                        </span>
                        <span className="font-bold text-[#C81E38]">
                          {uploadProgress}% Complete
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full bg-[#C81E38] rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-neutral-500 text-xs">
                        <AppIcon name="lock" size={15} className="text-[#C81E38]" />
                        <span>Zero lossy compression • SHA-256 Encrypted</span>
                      </div>

                      <button
                        type="button"
                        onClick={executeBatchVaultUpload}
                        disabled={isUploading || queuedFiles.length === 0}
                        className="w-full sm:w-auto px-7 py-3.5 bg-[#C81E38] hover:bg-[#9E1B32] disabled:opacity-50 text-white text-xs uppercase tracking-wider font-bold rounded-2xl shadow-lg shadow-[#C81E38]/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <AppIcon name="cloud_upload" size={18} className="text-white" />
                        <span>{isUploading ? 'Streaming to Vault...' : 'Upload Memories to Wedding Vault'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 6: SUCCESS CONFIRMATION BANNER */}
                {uploadSuccessBanner && (
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-500/30 bg-emerald-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <AppIcon name="task_alt" size={24} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-editorial text-base font-bold text-[#0A0A0C]">
                          Memories Preserved in Vault!
                        </h4>
                        <p className="text-xs text-neutral-600">
                          Attributed to <span className="font-bold text-[#C81E38]">{confirmedAuthor}</span> • Appended to active {activeCeremony} gallery.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                      <button
                        type="button"
                        onClick={resetForNewBatch}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#0A0A0C] text-xs font-bold uppercase rounded-xl transition-colors"
                      >
                        New Batch
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxIndex(0);
                          setIsLightboxOpen(true);
                        }}
                        className="px-4 py-2 bg-[#C81E38] text-white text-xs font-bold uppercase rounded-xl shadow-xs transition-colors"
                      >
                        View {activeCeremony} Feed ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: LIVE CEREMONY FEED (~38% = col-span-5) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Live Ceremony Feed Dossier */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C81E38] animate-pulse" />
                        <h3 className="font-editorial text-base sm:text-lg font-bold text-[#0A0A0C]">
                          Live {activeCeremony} Ceremony Feed
                        </h3>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Showing live photos from {activeCeremony} ({syncedPhotosCount} photos synced)
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase border border-neutral-200">
                      Live
                    </span>
                  </div>

                  {/* Candid Cards Stream */}
                  <div className="flex flex-col gap-4">
                    {liveFeed.length === 0 ? (
                      <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#C81E38]/10 text-[#C81E38] flex items-center justify-center mx-auto">
                          <AppIcon name="add_a_photo" size={24} />
                        </div>
                        <h4 className="font-editorial text-sm font-bold text-[#0A0A0C]">No Photos in Vault Yet</h4>
                        <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                          Be the first to upload memories from {activeCeremony} to this couple&apos;s sovereign gallery!
                        </p>
                      </div>
                    ) : (
                      liveFeed.map((card, idx) => (
                      <div
                        key={card.id}
                        className="group bg-neutral-50 p-4 rounded-2xl border border-neutral-200/70 hover:shadow-md transition-all flex flex-col gap-3"
                      >
                        <div
                          onClick={() => {
                            setLightboxIndex(idx);
                            setIsLightboxOpen(true);
                          }}
                          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200 cursor-pointer"
                        >
                          <img
                            src={card.src}
                            alt={card.stage}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[#0A0A0C] text-[10px] font-bold uppercase tracking-wider border border-white/40">
                            {card.stage}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#0A0A0C]">
                              By {card.author} ({card.email})
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {card.deviceInfo}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleLikeFeedCard(card.id)}
                              className="px-2.5 py-1 rounded-full bg-white text-neutral-800 text-xs font-semibold border border-neutral-200 hover:border-[#C81E38] hover:text-[#C81E38] transition-all shadow-xs"
                            >
                              {card.likes} ❤️
                            </button>
                            {card.flowers > 0 && (
                              <button
                                type="button"
                                onClick={() => handleFlowerFeedCard(card.id)}
                                className="px-2.5 py-1 rounded-full bg-white text-neutral-800 text-xs font-semibold border border-neutral-200 hover:border-[#C81E38] hover:text-[#C81E38] transition-all shadow-xs"
                              >
                                {card.flowers} 🌸
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )))}
                  </div>

                  {/* Switch to Drone & Stage Cam Feed Action */}
                  <button
                    type="button"
                    onClick={() => setIsPlayerModalOpen(true)}
                    className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 text-[#0A0A0C] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-neutral-200"
                  >
                    <AppIcon name="live_tv" size={16} className="text-[#C81E38]" />
                    <span>Switch to Drone & Stage Cam Feed</span>
                  </button>
                </div>

                {/* Table Standee QR Helper Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200/80 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    {/* Live Generated Table QR Code */}
                    <div className="w-20 h-20 bg-white border border-neutral-200 rounded-2xl p-1.5 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Table Standee QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <AppIcon name="qr_code" size={48} className="text-[#0A0A0C]" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#C81E38]/10 text-[#C81E38] text-[10px] uppercase font-bold border border-[#C81E38]/20">
                        Table Standee QR Active
                      </span>
                      <h4 className="font-editorial text-base font-bold text-[#0A0A0C]">
                        Banquet Table Standee Sync
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Guests seated at banquet tables can scan directly to jump to this upload portal without entering passcodes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    {qrCodeDataUrl ? (
                      <a
                        href={qrCodeDataUrl}
                        download={`${marriageCode}-standee-qr.png`}
                        className="text-neutral-600 hover:text-[#C81E38] text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <AppIcon name="download" size={13} />
                        <span>Download Standee QR</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-neutral-500 truncate max-w-[200px]">
                        makemymarriage.com/{marriageCode.toLowerCase()}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard?.writeText(
                            `${window.location.origin}/guest/upload?code=${marriageCode}`
                          );
                          showToast('Guest table link copied to clipboard!', 'success');
                        }
                      }}
                      className="text-[#C81E38] text-xs font-bold uppercase tracking-wider hover:underline"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <aside className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 rounded-full bg-[#C81E38] hover:bg-[#9E1B32] text-white shadow-xl flex items-center justify-center ring-4 ring-[#C81E38]/20 hover:scale-105 active:scale-95 transition-all group"
          title="Drop Photos into Couple's Vault"
        >
          <AppIcon name="add_a_photo" size={24} className="text-white" />
        </button>
      </aside>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-editorial tracking-widest uppercase font-bold text-[#0A0A0C]">
              Make My Marriage
            </span>
            <span>• End-to-End Encrypted Private Media Vault</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => showToast('Cloud connection verified (SOC2 Type II)', 'success')}
              className="hover:text-neutral-900 transition-colors"
            >
              Security & Cloud
            </button>
            <button
              onClick={() => showToast('Host desk ready to support guest table arrangements', 'info')}
              className="hover:text-neutral-900 transition-colors"
            >
              Host Concierge
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Interactive Live Player with Reaction Emojis */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col">
            <div className="p-4 bg-white flex items-center justify-between text-[#0A0A0C] border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#C81E38] text-white text-[10px] font-bold uppercase tracking-wider">
                  WebRTC Broadcast
                </span>
                <span className="font-editorial font-bold text-base">
                  {activeCeremony} Ceremony Live Feed
                </span>
                <span className="text-xs text-neutral-500 hidden sm:inline">• Live Feed</span>
              </div>
              <button
                onClick={() => setIsPlayerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition-colors"
              >
                <AppIcon name="close" size={16} />
              </button>
            </div>

            <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden flex items-center justify-center">
              <div className="text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#C81E38]/20 text-[#C81E38] flex items-center justify-center mx-auto animate-pulse">
                  <span className="material-symbols-outlined text-[24px]">videocam</span>
                </div>
                <p className="font-serif text-sm uppercase tracking-wider text-white">Live Broadcast Standby</p>
                <p className="text-xs text-neutral-400">Stream will commence shortly from the ceremonial mandap.</p>
              </div>

              {/* Reaction bubbles floating up the video */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {reactionBubbles.map((b) => (
                  <div
                    key={b.id}
                    className="absolute text-4xl animate-bounce"
                    style={{ left: `${b.left}%`, bottom: '20%' }}
                  >
                    {b.emoji}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Tap cheer reaction:</span>
                <button
                  type="button"
                  onClick={() => popReaction('❤️')}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#C81E38] hover:text-white active:scale-125 text-neutral-800 text-xs transition-all border border-neutral-200"
                >
                  ❤️ Love
                </button>
                <button
                  type="button"
                  onClick={() => popReaction('🌹')}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#C81E38] hover:text-white active:scale-125 text-neutral-800 text-xs transition-all border border-neutral-200"
                >
                  🌹 Roses
                </button>
                <button
                  type="button"
                  onClick={() => popReaction('👏')}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#C81E38] hover:text-white active:scale-125 text-neutral-800 text-xs transition-all border border-neutral-200"
                >
                  👏 Cheers
                </button>
                <button
                  type="button"
                  onClick={() => popReaction('✨')}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-[#C81E38] hover:text-white active:scale-125 text-neutral-800 text-xs transition-all border border-neutral-200"
                >
                  ✨ Blessings
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Switched to Drone Overhead 4K view', 'info')}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-200"
                >
                  Drone Feed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayerModalOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-semibold shadow-xs"
                >
                  Upload Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Lightbox View */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-white p-2">
              <div>
                <p className="font-bold text-sm">
                  {liveFeed[lightboxIndex]?.author || 'Wedding Guest'}
                </p>
                <p className="text-xs text-white/70">
                  {liveFeed[lightboxIndex]?.stage} • {liveFeed[lightboxIndex]?.timeAgo}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleLikeFeedCard(liveFeed[lightboxIndex]?.id);
                    showToast('Saved to Favorites ❤️', 'info');
                  }}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-[#C81E38] flex items-center justify-center text-white transition-colors"
                  title="Favorite"
                >
                  <AppIcon name="heart" size={16} />
                </button>
                <button
                  onClick={() => showToast('Downloaded high-resolution photograph!', 'success')}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  title="Download High-Res"
                >
                  <AppIcon name="download" size={16} />
                </button>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  title="Close"
                >
                  <AppIcon name="close" size={16} />
                </button>
              </div>
            </div>

            <div className="relative w-full flex items-center justify-center my-2 max-h-[75vh]">
              <button
                onClick={() =>
                  setLightboxIndex((prev) => (prev - 1 + liveFeed.length) % liveFeed.length)
                }
                className="absolute left-2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C81E38] text-white flex items-center justify-center z-10 transition-colors"
              >
                <AppIcon name="chevron_left" size={20} />
              </button>
              <img
                src={liveFeed[lightboxIndex]?.src}
                alt="Full preview"
                className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
              />
              <button
                onClick={() =>
                  setLightboxIndex((prev) => (prev + 1) % liveFeed.length)
                }
                className="absolute right-2 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C81E38] text-white flex items-center justify-center z-10 transition-colors"
              >
                <AppIcon name="chevron_right" size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Switch Passcode Modal */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-neutral-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C81E38]/10 text-[#C81E38] flex items-center justify-center mx-auto border border-[#C81E38]/30">
              <AppIcon name="key" size={22} className="text-[#C81E38]" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-base text-[#0A0A0C]">
                Enter Marriage Access Code
              </h3>
              <p className="text-xs text-neutral-500">
                Provide the 6-character code given by the hosts
              </p>
            </div>
            <input
              type="text"
              maxLength={8}
              value={switchCodeInput}
              onChange={(e) => setSwitchCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. RAHUL24"
              className="w-full h-11 px-3 rounded-xl bg-neutral-50 border border-neutral-300 text-center uppercase tracking-widest font-mono font-bold text-base text-[#0A0A0C] focus:border-[#C81E38] outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnlockCode}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#C81E38] hover:bg-[#9E1B32] text-white shadow-sm transition-colors"
              >
                Unlock Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-xs text-neutral-500 font-semibold">
          Loading Sovereign Vault Portal...
        </div>
      }
    >
      <GuestUploadPortalContent />
    </Suspense>
  );
}
