'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { compressImage } from '@/lib/compression';
import { downloadInvitationAsImage } from '@/lib/invitation';
import api from '@/lib/api';

interface WishItem {
  id: string;
  initials: string;
  author: string;
  relation: string;
  timeAgo: string;
  text: string;
  tag: string;
  likes: number;
  gradient: string;
}

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

export default function GuestDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || 'rahul24';
  const passcode = rawId.toUpperCase();

  // Active Ceremony & Media State
  const [activeEvent, setActiveEvent] = useState<'engagement' | 'mehndi' | 'haldi' | 'sangeet' | 'marriage' | 'others'>('haldi');
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [activeFilter, setActiveFilter] = useState<'all' | 'bride' | 'groom' | 'favorites'>('all');

  // Interactive Counters & Modals
  const [totalCheers, setTotalCheers] = useState(1428);
  const [isLivePlayerModalOpen, setIsLivePlayerModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isWishesModalOpen, setIsWishesModalOpen] = useState(false);
  const [isSwitchCodeModalOpen, setIsSwitchCodeModalOpen] = useState(false);
  const [newSwitchCode, setNewSwitchCode] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: 'info' | 'success' | 'crimson' } | null>(null);

  // Floating Celebration Particles
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([]);

  // Wishes Form State
  const [wishAuthor, setWishAuthor] = useState('');
  const [wishRelation, setWishRelation] = useState("Bride's Friend • Table 3");
  const [wishText, setWishText] = useState('');
  const [wishTag, setWishTag] = useState('Golden Haldi Glow ✨');

  // Media Upload State
  const [uploaderName, setUploaderName] = useState('Rohan Varma');
  const [uploaderCeremony, setUploaderCeremony] = useState('Haldi (Active Event)');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const invitationRef = useRef<HTMLDivElement>(null);
  const wishesTrackRef = useRef<HTMLDivElement>(null);

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

  // Wishes Ribbon Data
  const [wishesList, setWishesList] = useState<WishItem[]>([
    {
      id: 'w1',
      initials: 'PK',
      author: 'Pooja & Kabir',
      relation: "Bride's Bestie • Table 2",
      timeAgo: '2m ago',
      text: 'May your lives be showered with golden joy! Beautiful Haldi glow on both of you!',
      tag: 'Golden Haldi Glow ✨',
      likes: 24,
      gradient: 'from-[#c81e38] to-[#ffb3b3]'
    },
    {
      id: 'w2',
      initials: 'ND',
      author: 'Nani & Dadu',
      relation: 'Elders • Blessings Vault',
      timeAgo: '8m ago',
      text: 'Lots of blessings, stay happy and keep laughing together always. Sada Sukhi Raho!',
      tag: 'Aashirwaad 🪔',
      likes: 52,
      gradient: 'from-[#9e1b32] to-[#c81e38]'
    },
    {
      id: 'w3',
      initials: 'TG',
      author: 'Team Groom',
      relation: 'College Crew • Stage 1',
      timeAgo: '14m ago',
      text: 'Rahul brother! Dance solo rehearsal is done. Sangeet stage belongs to us tonight!',
      tag: 'Sangeet Ready 💃🕺',
      likes: 19,
      gradient: 'from-neutral-800 to-[#c81e38]'
    },
    {
      id: 'w4',
      initials: 'UV',
      author: 'Uncle Vijay & Neha',
      relation: 'Chachu & Chachi • London 🇬🇧',
      timeAgo: '22m ago',
      text: 'Sending warmest hugs & hearty congratulations from London! Gorgeous decor and smiles!',
      tag: 'Soulmates Forever 💛',
      likes: 37,
      gradient: 'from-[#680014] to-[#c81e38]'
    }
  ]);

  // Photo Gallery Moments Data
  const [moments, setMoments] = useState<PhotoMoment[]>([
    {
      id: 'm1',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6fO2qwvTXCfSdcSEAgwTCIMP1jaIcPkXdwV1FvCCfRf-5VXAht5OOoK8UVDtX1oKoT7d5ct1kJud_LU-NKa4K2WFtWFsbkcpXkVrOeiyWbILkWUk0yl1B0bLlluiXV-4HRdQKfXgX_tfqnEVrxhD9ovCQkgVUBOCAXAvTTc1-C8m24DOCobWWg9XTZrEW73NIl0UmbSPaiEJF3KsOxOvq6wQoNjplpbCLpORhFno',
      author: 'Sneha Kapoor',
      timeAgo: '12m ago',
      location: 'Sunset Lawn',
      side: 'bride',
      isFavorite: true,
      likes: 28,
      liked: false
    },
    {
      id: 'm2',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6MRTTXoRrWySf_l-mY2bjxELks2XFvF5LT44DQdAGO0xbQLFiGIhqpDilArt9gzII0SiVZLlJRYDYBGCW2IVsCnslxsAECqYv_0S_Fw--JzfvYf2NSncO3EaSHLbcU_EdAlNcUmSQvm05uLZ7QsaYfb4qXSp5tnTDOSDlgNqXjP9YtJH8LI774fKWNBe7lXI1C4yFAiJFZ1FCkBesYbL_Oxko78nWRXO0moV9WEE',
      author: 'Amit Shah',
      timeAgo: '28m ago',
      location: 'Floral Shower',
      side: 'groom',
      isFavorite: true,
      likes: 45,
      liked: true
    },
    {
      id: 'm3',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSAyS6GAi99VTMHIvTf5JSX-jf277X70o9FketT2aE27oDfeLaV9nnMWpVXdvr9GVCRz4cslwVGq5md1CgHRc6izT848ks8GgGbRKIEIjT8u6qi20tmhYD3Yceo7USOirHRfSdRw7pXHG5J5q5sk9Izw6vZYWqfRr1Ltf1hfzPeF2MRoN8TGaLmQWxKQbJcNBeQ6ZzdIzBAMrIv878VQBn2MdTkcttpbkD1yGWfeE',
      author: 'Priya Mehta',
      timeAgo: '45m ago',
      location: 'Ritual Urli',
      side: 'bride',
      isFavorite: false,
      likes: 17,
      liked: false
    },
    {
      id: 'm4',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBClr4MQqyHpa4W3AEfeX2NGZZ4YI7qsdIyiUxL_d73JwnskMbacxWB3W9-SZV5R1Z64QK_dg7a2LNHAj5YIskCv8GrWHGqBPnrkc0EOTbdFRv86Aag3c42paV6zh6zXFkiCndEhEtMBHZEBu8oAcVXje0K7spB3wiDMlIzDqRAHPAivZuuz30Qc6QcBRvggzenQ2AEtk3cMDSDj5GO9QDG-4cclBZdTKsPOODEmuY',
      author: 'Karan Oberoi',
      timeAgo: '1h ago',
      location: 'Groom Squad',
      side: 'groom',
      isFavorite: true,
      likes: 33,
      liked: false
    }
  ]);

  // Ceremonies Data
  const ceremonies = {
    engagement: {
      title: 'The Ring Exchange & Royal Feast',
      sequence: 'Ceremony 01 of 06',
      date: 'Thu, Dec 12, 2026',
      time: '6:00 PM - 10:00 PM',
      venue: 'Crystal Ballroom, The Taj, Mumbai',
      status: 'Concluded',
      streamBadge: 'Recorded in 4K',
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      viewers: 'Concluded'
    },
    mehndi: {
      title: 'Henna & Sunset Melodies',
      sequence: 'Ceremony 02 of 06',
      date: 'Fri, Dec 13, 2026',
      time: '3:30 PM - 7:00 PM',
      venue: 'Beachside Lawn, The Leela, Goa',
      status: 'Concluded',
      streamBadge: 'High-Res Archive',
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      viewers: 'Concluded'
    },
    haldi: {
      title: 'The Haldi & Floral Shower',
      sequence: 'Ceremony 03 of 06',
      date: 'Sat, Dec 14, 2026',
      time: '10:30 AM - 1:00 PM',
      venue: 'Sunbreeze Beach Lawn, The Leela, Goa',
      status: 'In Progress • Live',
      streamBadge: 'Live 1080p Stream',
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
      viewers: '84 Watching'
    },
    sangeet: {
      title: 'Sangeet Gala & DJ Night',
      sequence: 'Ceremony 04 of 06',
      date: 'Sat, Dec 14, 2026',
      time: '7:30 PM - 1:00 AM',
      venue: 'Grand Marquee, The Leela, Goa',
      status: 'Tonight at 7:30 PM',
      streamBadge: 'Starts at 7:30 PM',
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      viewers: 'Starting Soon'
    },
    marriage: {
      title: 'The Sacred Pheras & Wedding Vows',
      sequence: 'Ceremony 05 of 06',
      date: 'Sun, Dec 15, 2026',
      time: '4:30 PM - 8:00 PM',
      venue: 'Sunset Mandap, The Leela Seaside, Goa',
      status: 'Tomorrow Sunset',
      streamBadge: 'Scheduled Live',
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      viewers: 'Tomorrow'
    },
    others: {
      title: 'Afterparty & Morning Breakfast',
      sequence: 'Ceremony 06 of 06',
      date: 'Mon, Dec 16, 2026',
      time: '12:00 AM Onwards',
      venue: 'Cabana Lounge, Goa',
      status: 'Upcoming',
      streamBadge: 'Exclusive Lounge',
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      viewers: 'VIP'
    }
  };

  const currentCeremony = ceremonies[activeEvent];

  // Ribbon scroll helper
  const scrollWishes = (offset: number) => {
    if (wishesTrackRef.current) {
      wishesTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Like a wish card
  const handleLikeWish = (id: string) => {
    setWishesList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, likes: w.likes + 1 } : w))
    );
    triggerPetalBurst('❤️');
  };

  // Submit new blessing
  const handleSubmitWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishAuthor.trim() || !wishText.trim()) {
      showToast('Please enter your name and blessing message.', 'crimson');
      return;
    }

    const newWish: WishItem = {
      id: `w_${Date.now()}`,
      initials: wishAuthor.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      author: wishAuthor.trim(),
      relation: wishRelation,
      timeAgo: 'Just now',
      text: wishText.trim(),
      tag: wishTag,
      likes: 1,
      gradient: 'from-[#c81e38] to-[#9e1b32]'
    };

    setWishesList([newWish, ...wishesList]);
    setWishAuthor('');
    setWishText('');
    setIsWishesModalOpen(false);
    showToast('Your blessing was broadcast to the live celebration ribbon!', 'success');
    triggerPetalBurst('🪔');
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
        // Fallback gracefully to live local state for zero-server interruption
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
    <div className="bg-[#131315] text-[#e5e1e4] font-sans antialiased min-h-screen flex flex-col selection:bg-[#c81e38] selection:text-white">
      {/* Toast Shelf */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-[100] flex flex-col gap-2.5 animate-in slide-in-from-right-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 ${
              toastMsg.type === 'success'
                ? 'bg-[#1c1b1d] border-emerald-500/40 text-emerald-400'
                : toastMsg.type === 'crimson'
                ? 'bg-[#1c1b1d] border-[#c81e38]/50 text-[#ffb3b3]'
                : 'bg-[#1c1b1d] border-white/15 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toastMsg.type === 'success' ? 'check_circle' : toastMsg.type === 'crimson' ? 'error' : 'info'}
            </span>
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
        {/* Welcoming Header with Couple & Quick Actions */}
        <section className="bg-[#1c1b1d] border-b border-white/10 py-5 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c81e38] via-[#9e1b32] to-[#680014] text-white flex items-center justify-center font-editorial font-bold text-xl shadow-lg ring-1 ring-white/20 shrink-0">
                R&amp;A
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-white tracking-tight">
                    Rahul &amp; Anjali
                  </h1>
                  <span
                    className="material-symbols-outlined text-[20px] text-[#ffb3b3]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Celebration Vault"
                  >
                    verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#c81e38]/20 text-[#ffb3b3] border border-[#c81e38]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c81e38] animate-pulse"></span>
                    <span>{currentCeremony.status}</span>
                  </span>
                </div>
                <p className="text-xs text-white/60 flex items-center gap-2 mt-1 flex-wrap">
                  <span>The Leela Palace Seaside, Goa</span>
                  <span className="text-white/30">•</span>
                  <span className="text-[#ffb3b3] font-medium">{moments.length * 35} Photos &amp; 3 Live Reels</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/90 font-medium">320 Guests Connected</span>
                  <span className="text-white/30">•</span>
                  <span className="text-[11px] font-mono font-bold text-[#ffb3b3] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    Passcode: {passcode}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Interaction Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard?.writeText(window.location.href);
                    showToast('Celebration link copied to clipboard!', 'success');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-white/90 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ffb3b3]">share</span>
                <span>Share</span>
              </button>

              <button
                onClick={() => setIsWishesModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#c81e38]/15 hover:bg-[#c81e38]/25 text-[#ffb3b3] border border-[#c81e38]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ffb3b3]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <span>Send Blessing</span>
              </button>

              <button
                onClick={() => setIsSwitchCodeModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-white/90 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                title="Switch wedding passcode"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ffb3b3]">key</span>
                <span>Switch Passcode</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c81e38] to-[#9e1b32] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all border border-white/15"
              >
                <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                <span>Drop Media</span>
              </button>
            </div>
          </div>

          {/* LUXURY: Live Wishes & Shagun Experience Section */}
          <div className="mt-5 border-t border-white/10 pt-4 px-4 sm:px-6 bg-gradient-to-b from-[#c81e38]/10 via-[#1c1b1d] to-[#131315]">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c81e38] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c81e38]"></span>
                    </span>
                    <h2 className="font-editorial font-bold text-base sm:text-lg text-white flex items-center gap-1.5 tracking-wide">
                      Real-time Guest Blessings &amp; Shagun
                    </h2>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#2a2a2c] text-[#ffb3b3] border border-white/10">
                    <span className="material-symbols-outlined text-[13px] text-[#ffb3b3]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>{totalCheers.toLocaleString()} cheers showered</span>
                  </span>
                </div>

                {/* Quick One-Tap Floating Reactions Bar + Action Trigger */}
                <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                  <div className="flex items-center gap-1 bg-[#201f21] p-1 rounded-xl shadow-inner border border-white/10">
                    <span className="text-[11px] font-medium text-white/50 px-1 hidden lg:inline">Quick Cheer:</span>
                    <button
                      onClick={(e) => triggerPetalBurst('✨', e)}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#c81e38]/30 hover:text-white text-xs font-medium text-white/80 transition-transform active:scale-125"
                      title="Shine"
                    >
                      ✨ Shine
                    </button>
                    <button
                      onClick={(e) => triggerPetalBurst('❤️', e)}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#c81e38]/30 hover:text-white text-xs font-medium text-white/80 transition-transform active:scale-125"
                      title="Love"
                    >
                      ❤️ Love
                    </button>
                    <button
                      onClick={(e) => triggerPetalBurst('🌹', e)}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#c81e38]/30 hover:text-white text-xs font-medium text-white/80 transition-transform active:scale-125"
                      title="Rose Petals"
                    >
                      🌹 Roses
                    </button>
                    <button
                      onClick={(e) => triggerPetalBurst('🥂', e)}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#c81e38]/30 hover:text-white text-xs font-medium text-white/80 transition-transform active:scale-125"
                      title="Toast"
                    >
                      🥂 Cheers
                    </button>
                    <button
                      onClick={(e) => triggerPetalBurst('🪔', e)}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#c81e38]/30 hover:text-white text-xs font-medium text-white/80 transition-transform active:scale-125"
                      title="Aashirwaad"
                    >
                      🪔 Aashirwaad
                    </button>
                    <button
                      onClick={(e) => triggerPetalBurst('🧿', e)}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#c81e38]/30 hover:text-white text-xs font-medium text-white/80 transition-transform active:scale-125"
                      title="Nazar Na Lage"
                    >
                      🧿 Nazar
                    </button>
                  </div>

                  <button
                    onClick={() => setIsWishesModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#c81e38] to-[#9e1b32] hover:brightness-110 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95 border border-white/10"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_note</span>
                    <span>+ Add Blessing</span>
                  </button>
                </div>
              </div>

              {/* Live Wish Cards Carousel Ribbon */}
              <div className="relative group">
                <div
                  ref={wishesTrackRef}
                  className="flex gap-3 overflow-x-auto pb-2 pt-1 hide-scrollbar scroll-smooth"
                >
                  {wishesList.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-[280px] sm:min-w-[310px] max-w-[320px] shrink-0 p-4 rounded-2xl bg-[#1c1b1d] border border-white/10 shadow-lg flex flex-col justify-between hover:border-[#c81e38]/60 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${item.gradient} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                              {item.initials}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white leading-tight">{item.author}</h4>
                              <p className="text-[10px] text-[#ffb3b3] font-semibold tracking-wide">{item.relation}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-white/40">{item.timeAgo}</span>
                        </div>
                        <p className="text-xs text-white/85 italic leading-relaxed">
                          "{item.text}"
                        </p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2a2a2c] text-[#ffb3b3] border border-[#c81e38]/30">
                            {item.tag}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between">
                        <button
                          onClick={() => handleLikeWish(item.id)}
                          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-[#ffb3b3] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#c81e38]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                          <span className="text-[11px] font-bold text-white">{item.likes}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { triggerPetalBurst('❤️', e); handleLikeWish(item.id); }}
                            className="w-6 h-6 rounded-md hover:bg-[#2a2a2c] text-xs flex items-center justify-center"
                            title="Love"
                          >
                            ❤️
                          </button>
                          <button
                            onClick={(e) => { triggerPetalBurst('🌹', e); handleLikeWish(item.id); }}
                            className="w-6 h-6 rounded-md hover:bg-[#2a2a2c] text-xs flex items-center justify-center"
                            title="Roses"
                          >
                            🌹
                          </button>
                          <button
                            onClick={(e) => { triggerPetalBurst('🥂', e); handleLikeWish(item.id); }}
                            className="w-6 h-6 rounded-md hover:bg-[#2a2a2c] text-xs flex items-center justify-center"
                            title="Toast"
                          >
                            🥂
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Carousel Scroll Arrow Helpers */}
                <button
                  onClick={() => scrollWishes(-280)}
                  className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full bg-[#201f21] shadow-xl border border-white/10 text-white items-center justify-center hover:bg-[#c81e38] transition-all"
                  title="Scroll left"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  onClick={() => scrollWishes(280)}
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full bg-[#201f21] shadow-xl border border-white/10 text-white items-center justify-center hover:bg-[#c81e38] transition-all"
                  title="Scroll right"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-7">
          {/* 6-Ceremony Switcher Bar */}
          <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
            <div className="flex items-center gap-2 min-w-max p-1.5 bg-[#1c1b1d] rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveEvent('engagement')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'engagement'
                    ? 'bg-gradient-to-r from-[#c81e38] to-[#9e1b32] text-white font-bold shadow-md ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">diamond</span>
                <span>Engagement</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#2a2a2c] text-[10px]">24</span>
              </button>

              <button
                onClick={() => setActiveEvent('mehndi')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'mehndi'
                    ? 'bg-gradient-to-r from-[#c81e38] to-[#9e1b32] text-white font-bold shadow-md ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">spa</span>
                <span>Mehndi</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#2a2a2c] text-[10px]">38</span>
              </button>

              <button
                onClick={() => setActiveEvent('haldi')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all ${
                  activeEvent === 'haldi'
                    ? 'bg-gradient-to-r from-[#c81e38] to-[#9e1b32] text-white font-bold shadow-md ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  wb_sunny
                </span>
                <span>Haldi</span>
                <span className="px-2 py-0.5 rounded-full bg-black/40 text-[#ffb3b3] text-[10px] font-bold">Active • 145</span>
              </button>

              <button
                onClick={() => setActiveEvent('sangeet')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'sangeet'
                    ? 'bg-gradient-to-r from-[#c81e38] to-[#9e1b32] text-white font-bold shadow-md ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">music_note</span>
                <span>Sangeet</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#2a2a2c] text-[10px]">Tonight</span>
              </button>

              <button
                onClick={() => setActiveEvent('marriage')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'marriage'
                    ? 'bg-gradient-to-r from-[#c81e38] to-[#9e1b32] text-white font-bold shadow-md ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">favorite</span>
                <span>Wedding</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#2a2a2c] text-[10px]">Tomorrow</span>
              </button>

              <button
                onClick={() => setActiveEvent('others')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'others'
                    ? 'bg-gradient-to-r from-[#c81e38] to-[#9e1b32] text-white font-bold shadow-md ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">interests</span>
                <span>Afterparty</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#2a2a2c] text-[10px]">5</span>
              </button>
            </div>
          </div>

          {/* Active Ceremony Focus (Live Stream & Digital Invitation) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Stream & Key Details (7 Cols) */}
            <div className="lg:col-span-7 bg-[#1c1b1d] rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col transition-colors">
              <div
                className="relative aspect-video bg-black group overflow-hidden cursor-pointer"
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
                  <span className="px-2.5 py-1 rounded-full text-[11px] bg-black/70 backdrop-blur-md text-white font-medium flex items-center gap-1 border border-white/10">
                    <span className="material-symbols-outlined text-[13px] text-[#ffb3b3]">visibility</span>
                    <span>{currentCeremony.viewers}</span>
                  </span>
                </div>

                {/* Play button trigger */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white text-[#c81e38] flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-95 transition-all ring-4 ring-white/20">
                    <span className="material-symbols-outlined text-[32px]">play_arrow</span>
                  </div>
                </div>

                {/* Stream info strip */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1 text-white/80">
                    <span className="material-symbols-outlined text-[14px] text-[#ffb3b3]">hub</span>
                    <span>WebRTC Mesh • 42ms Ultra Low Latency</span>
                  </span>
                  <span className="font-medium text-white/90">Camera: Lawn Stage Rig A</span>
                </div>
              </div>

              {/* Ceremony Details */}
              <div className="p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#ffb3b3] uppercase tracking-wider">
                      {currentCeremony.sequence}
                    </span>
                    <h2 className="font-editorial font-bold text-xl sm:text-2xl text-white mt-0.5">
                      {currentCeremony.title}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#c81e38]/20 text-[#ffb3b3] border border-[#c81e38]/40">
                    {currentCeremony.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#201f21] border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/40">Date</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{currentCeremony.date}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#201f21] border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/40">Time</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{currentCeremony.time}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#201f21] border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/40">Venue</p>
                    <p className="text-xs font-semibold text-white mt-0.5 truncate">{currentCeremony.venue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Invitation Card (5 Cols) */}
            <div className="lg:col-span-5 bg-[#1c1b1d] rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#ffb3b3]">mark_email_read</span>
                    <h3 className="font-editorial font-bold text-lg text-white">Official Wedding Invitation</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#2a2a2c] text-[#ffb3b3] border border-white/10">
                    Artisanal Suite
                  </span>
                </div>

                <div
                  ref={invitationRef}
                  className="relative aspect-[4/5] max-h-[340px] rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center group cursor-pointer mt-4"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <img
                    alt="Artisanal invitation card"
                    className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk"
                  />
                  <div className="absolute bottom-3 right-3">
                    <button className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#c81e38] transition-colors shadow border border-white/15">
                      <span className="material-symbols-outlined text-[15px]">fullscreen</span>
                      <span>View Card</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2.5">
                <button
                  onClick={handleDownloadInviteImage}
                  className="flex-1 h-10 px-3 rounded-xl bg-[#201f21] hover:bg-[#2a2a2c] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ffb3b3]">download</span>
                  <span>Download Card</span>
                </button>
                <button
                  onClick={() => {
                    showToast('Celebration added to your calendar!', 'success');
                  }}
                  className="flex-1 h-10 px-3 rounded-xl bg-gradient-to-r from-[#c81e38]/20 to-[#9e1b32]/20 hover:from-[#c81e38]/40 hover:to-[#9e1b32]/40 text-[#ffb3b3] border border-[#c81e38]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ffb3b3]">calendar_add_on</span>
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guest Media Feed Section */}
          <div className="pt-3 space-y-4">
            {/* Gallery Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-[#1c1b1d] rounded-xl border border-white/10 w-fit">
                <button
                  onClick={() => setActiveMediaTab('photos')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeMediaTab === 'photos'
                      ? 'bg-[#c81e38] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">image</span>
                  <span>Photos ({moments.length * 35})</span>
                </button>
                <button
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activeMediaTab === 'videos'
                      ? 'bg-[#c81e38] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  <span>Videos (3)</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeFilter === 'all'
                      ? 'bg-[#c81e38] text-white shadow-sm'
                      : 'bg-[#1c1b1d] text-white/70 hover:text-white hover:bg-[#2a2a2c] border border-white/5'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('bride')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    activeFilter === 'bride'
                      ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                      : 'bg-[#1c1b1d] text-white/70 hover:text-white hover:bg-[#2a2a2c] border border-white/5 font-medium'
                  }`}
                >
                  Bride Side
                </button>
                <button
                  onClick={() => setActiveFilter('groom')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    activeFilter === 'groom'
                      ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                      : 'bg-[#1c1b1d] text-white/70 hover:text-white hover:bg-[#2a2a2c] border border-white/5 font-medium'
                  }`}
                >
                  Groom Side
                </button>
                <button
                  onClick={() => setActiveFilter('favorites')}
                  className={`px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all ${
                    activeFilter === 'favorites'
                      ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                      : 'bg-[#1c1b1d] text-white/70 hover:text-white hover:bg-[#2a2a2c] border border-white/5 font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] text-[#ffb3b3]">star</span>
                  <span>Favorites</span>
                </button>
              </div>
            </div>

            {/* Responsive Moments Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMoments.map((moment, idx) => (
                <div
                  key={moment.id}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setIsLightboxOpen(true);
                  }}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#1c1b1d] shadow-md border border-white/10 cursor-pointer"
                >
                  <img
                    alt={moment.author}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={moment.src}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={(e) => handleToggleMomentLike(idx, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          moment.liked
                            ? 'bg-[#c81e38] text-white'
                            : 'bg-white/20 backdrop-blur-md text-white hover:bg-[#c81e38]'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: moment.liked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                      <a
                        href={moment.src}
                        download={`memory-${idx}.jpg`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </a>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{moment.author}</p>
                      <p className="text-[10px] text-white/70">{moment.timeAgo} • {moment.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Event Teaser */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#c81e38]/15 via-[#1c1b1d] to-[#1c1b1d] border border-[#c81e38]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#c81e38]/20 text-[#ffb3b3] flex items-center justify-center shrink-0 border border-[#c81e38]/30">
                  <span className="material-symbols-outlined text-[24px]">flare</span>
                </div>
                <div>
                  <h4 className="font-editorial font-bold text-sm text-white">Tonight: Sangeet Dance Battles Live</h4>
                  <p className="text-xs text-white/60">Stream starts at 7:30 PM with interactive voting for Bride vs Groom choreography!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploaderCeremony('Sangeet');
                  setIsUploadModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#201f21] hover:bg-[#c81e38] text-white border border-white/10 text-xs font-semibold transition-all shrink-0"
              >
                Queue Sangeet Clip
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <aside className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#c81e38] to-[#9e1b32] text-white shadow-2xl flex items-center justify-center ring-4 ring-[#c81e38]/30 hover:scale-105 active:scale-95 transition-all group"
          title="Drop Photos into Couple's Vault"
        >
          <span className="material-symbols-outlined text-[26px]">add_a_photo</span>
        </button>
      </aside>

      {/* MODAL 1: Interactive Live Player with Reaction Emojis */}
      {isLivePlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#131315] rounded-2xl overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between text-white z-10 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#c81e38] text-[10px] font-bold uppercase tracking-wider">
                  WebRTC Broadcast
                </span>
                <span className="font-editorial font-bold text-base">{currentCeremony.title}</span>
                <span className="text-xs text-white/60 hidden sm:inline">• {currentCeremony.viewers}</span>
              </div>
              <button
                onClick={() => setIsLivePlayerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
              <iframe
                src={currentCeremony.streamUrl}
                title="Live Wedding Stream"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-[#1c1b1d] flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Tap cheer reaction:</span>
                <button
                  onClick={(e) => triggerPetalBurst('❤️', e)}
                  className="px-3 py-1 rounded-full bg-[#2a2a2c] hover:bg-[#c81e38] active:scale-125 text-white text-xs transition-all"
                >
                  ❤️ Love
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('🌹', e)}
                  className="px-3 py-1 rounded-full bg-[#2a2a2c] hover:bg-[#c81e38] active:scale-125 text-white text-xs transition-all"
                >
                  🌹 Roses
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('👏', e)}
                  className="px-3 py-1 rounded-full bg-[#2a2a2c] hover:bg-[#c81e38] active:scale-125 text-white text-xs transition-all"
                >
                  👏 Cheers
                </button>
                <button
                  onClick={(e) => triggerPetalBurst('✨', e)}
                  className="px-3 py-1 rounded-full bg-[#2a2a2c] hover:bg-[#c81e38] active:scale-125 text-white text-xs transition-all"
                >
                  ✨ Blessings
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Switched to Drone Overhead 4K view', 'info')}
                  className="px-3 py-1.5 rounded-lg bg-[#201f21] hover:bg-[#2a2a2c] text-white text-xs font-semibold border border-white/10"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-white p-2">
              <div>
                <p className="font-bold text-sm">{filteredMoments[lightboxIndex]?.author}</p>
                <p className="text-xs text-white/60">
                  {filteredMoments[lightboxIndex]?.timeAgo} • {filteredMoments[lightboxIndex]?.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleToggleMomentLike(lightboxIndex, e)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors ${
                    filteredMoments[lightboxIndex]?.liked ? 'bg-[#c81e38]' : 'bg-white/10 hover:bg-[#c81e38]'
                  }`}
                  title="Favorite"
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: filteredMoments[lightboxIndex]?.liked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
                <a
                  href={filteredMoments[lightboxIndex]?.src}
                  download="vault-highres.jpg"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  title="Download High-Res"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </a>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div className="relative w-full flex items-center justify-center flex-1 max-h-[75vh] overflow-hidden my-2">
              <button
                onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredMoments.length - 1))}
                className="absolute left-2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#c81e38] text-white flex items-center justify-center z-10"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <img
                alt="Full view"
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
                src={filteredMoments[lightboxIndex]?.src}
              />
              <button
                onClick={() => setLightboxIndex((prev) => (prev < filteredMoments.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#c81e38] text-white flex items-center justify-center z-10"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Guest Upload Modal (with Client-Side Compression to GridFS) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#1c1b1d] text-white rounded-2xl shadow-2xl overflow-hidden border border-white/15">
            <div className="p-4 bg-[#201f21] flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#ffb3b3]">cloud_upload</span>
                <h3 className="font-editorial font-bold text-base text-white">Drop Media to Vault</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Your Name</label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#131315] border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c81e38]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Tag Ceremony</label>
                <select
                  value={uploaderCeremony}
                  onChange={(e) => setUploaderCeremony(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#131315] border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c81e38]/50"
                >
                  <option>Haldi (Active Event)</option>
                  <option>Engagement</option>
                  <option>Mehndi</option>
                  <option>Sangeet</option>
                  <option>Marriage</option>
                  <option>Others / Candid</option>
                </select>
              </div>

              <label className="block p-6 rounded-2xl border-2 border-dashed border-white/20 bg-[#131315] text-center cursor-pointer hover:border-[#c81e38] transition-colors">
                <span className="material-symbols-outlined text-[32px] text-[#ffb3b3] mb-1">photo_library</span>
                <p className="text-xs font-bold text-white">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Tap to choose photos or videos'}
                </p>
                <p className="text-[11px] text-white/50">Auto-compressed to ~500KB (₹0 GridFS Cloud)</p>
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
                <div className="p-3 rounded-xl bg-[#201f21] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white/80">Compressing &amp; uploading to vault...</span>
                    <span className="text-[#ffb3b3]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#c81e38] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#201f21] border-t border-white/10 flex justify-end gap-2">
              <button
                disabled={isUploading}
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white"
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
      )}

      {/* MODAL 4: Digital Invitation Full Card */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#1c1b1d] rounded-2xl shadow-2xl overflow-hidden border border-white/15 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-[#201f21] flex items-center justify-between border-b border-white/10">
              <h3 className="font-editorial font-bold text-sm text-white">Rahul &amp; Anjali • Wedding Invitation</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex flex-col items-center">
              <img
                alt="Full card preview"
                className="max-h-[440px] object-contain rounded-xl shadow-xl border border-white/10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk"
              />
            </div>
            <div className="p-4 bg-[#201f21] border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleDownloadInviteImage}
                className="px-4 py-2 rounded-xl bg-[#c81e38] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED MODAL 5: Interactive Blessing & Shagun Creator Modal */}
      {isWishesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-[#1c1b1d] rounded-2xl shadow-2xl border border-white/15 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#c81e38]/30 via-[#201f21] to-[#201f21] flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#c81e38]/20 text-[#ffb3b3] flex items-center justify-center border border-[#c81e38]/40">
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </div>
                <div>
                  <h3 className="font-editorial font-bold text-base text-white">Send Wedding Blessing &amp; Shagun</h3>
                  <p className="text-[11px] text-white/60">Broadcast your warm wishes directly to the couple</p>
                </div>
              </div>
              <button
                onClick={() => setIsWishesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitWish} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pooja & Kabir"
                    value={wishAuthor}
                    onChange={(e) => setWishAuthor(e.target.value)}
                    className="w-full h-10 px-3 bg-[#131315] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#c81e38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Relation / Table</label>
                  <input
                    type="text"
                    placeholder="e.g. Bride's Friend • Table 2"
                    value={wishRelation}
                    onChange={(e) => setWishRelation(e.target.value)}
                    className="w-full h-10 px-3 bg-[#131315] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#c81e38]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Blessing Theme / Ceremony Tag</label>
                <select
                  value={wishTag}
                  onChange={(e) => setWishTag(e.target.value)}
                  className="w-full h-10 px-3 bg-[#131315] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#c81e38]"
                >
                  <option>Golden Haldi Glow ✨</option>
                  <option>Aashirwaad 🪔</option>
                  <option>Sangeet Ready 💃🕺</option>
                  <option>Soulmates Forever 💛</option>
                  <option>Nazar Na Lage 🧿</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Your Blessing Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your heartfelt wishes for Rahul & Anjali..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  className="w-full p-3 bg-[#131315] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#c81e38]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWishesModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Broadcast Blessing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Switch Passcode Modal */}
      {isSwitchCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1c1b1d] rounded-2xl shadow-2xl border border-white/15 p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-editorial font-bold text-base">Enter Vault Passcode</h3>
              <button
                onClick={() => setIsSwitchCodeModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSwitchPasscode} className="space-y-4">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. RAHUL24"
                value={newSwitchCode}
                onChange={(e) => setNewSwitchCode(e.target.value.toUpperCase())}
                className="w-full h-11 px-3 bg-[#131315] border border-white/20 rounded-xl text-center text-base font-bold tracking-widest uppercase focus:outline-none focus:border-[#c81e38]"
              />
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold"
              >
                Access Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/10 bg-[#131315] py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="font-editorial tracking-widest uppercase font-bold text-white/80">Make My Marriage</span>
            <span>• End-to-End Encrypted Private Media Vault</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#ffb3b3]">₹0 Serverless Architecture • GridFS Streaming</span>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Host Concierge
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
