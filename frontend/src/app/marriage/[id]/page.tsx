'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { compressImage } from '@/lib/compression';
import { downloadInvitationAsImage } from '@/lib/invitation';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';

interface WishItem {
  id: string;
  initials: string;
  author: string;
  relation: string;
  timeAgo: string;
  text: string;
  tag: string;
  likes: number;
  badgeBg: string;
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

  // Wishes Ribbon Data in Pure White Edition
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
      badgeBg: 'bg-[#c81e38]'
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
      badgeBg: 'bg-[#9e1b32]'
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
      badgeBg: 'bg-[#111113]'
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
      badgeBg: 'bg-[#680014]'
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
      badgeBg: 'bg-[#c81e38]'
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
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 ${
              toastMsg.type === 'success'
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
                R&amp;A
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#0a0a0c] tracking-tight">
                    Rahul &amp; Anjali
                  </h1>
                  <AppIcon
                    name="verified"
                    size={20}
                    className="text-[#c81e38]"
                    title="Verified Celebration Vault"
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#c81e38]/10 text-[#c81e38] border border-[#c81e38]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c81e38] animate-pulse"></span>
                    <span>{currentCeremony.status}</span>
                  </span>
                </div>
                <p className="text-xs text-neutral-600 flex items-center gap-2 mt-1 flex-wrap">
                  <span>The Leela Palace Seaside, Goa</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-[#c81e38] font-medium">{moments.length * 35} Photos &amp; 3 Live Reels</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-800 font-semibold">320 Guests Connected</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-[11px] font-mono font-bold text-[#c81e38] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    Passcode: {passcode}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Interaction Bar in Crisp White */}
            <div className="flex items-center gap-2 flex-wrap">
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
                onClick={() => setIsWishesModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#c81e38]/10 hover:bg-[#c81e38]/15 text-[#c81e38] border border-[#c81e38]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <AppIcon name="favorite" size={16} className="text-[#c81e38]" fill="currentColor" />
                <span>Send Blessing</span>
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

          {/* LUXURY: Live Wishes & Shagun Experience Section */}
          <div className="mt-5 border-t border-neutral-200 pt-4 px-4 sm:px-6 bg-gradient-to-b from-[#c81e38]/5 via-[#fafafa] to-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c81e38] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c81e38]"></span>
                    </span>
                    <h2 className="font-editorial font-bold text-base sm:text-lg text-[#0a0a0c] flex items-center gap-1.5 tracking-wide">
                      Real-time Guest Blessings &amp; Shagun
                    </h2>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white text-[#c81e38] border border-neutral-200 shadow-xs">
                    <AppIcon name="favorite" size={13} className="text-[#c81e38]" fill="currentColor" />
                    <span>{totalCheers.toLocaleString()} cheers showered</span>
                  </span>
                </div>

                {/* Quick One-Tap Floating Reactions Bar + Action Trigger */}
                <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs border border-neutral-200">
                    <span className="text-[11px] font-medium text-neutral-500 px-1 hidden lg:inline">Quick Cheer:</span>
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

                  <button
                    onClick={() => setIsWishesModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <AppIcon name="edit_note" size={15} />
                    <span>+ Add Blessing</span>
                  </button>
                </div>
              </div>

              {/* Live Wish Cards Carousel Ribbon in Crisp White */}
              <div className="relative group">
                <div
                  ref={wishesTrackRef}
                  className="flex gap-3 overflow-x-auto pb-2 pt-1 hide-scrollbar scroll-smooth"
                >
                  {wishesList.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-[280px] sm:min-w-[310px] max-w-[320px] shrink-0 p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-[#c81e38]/50 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${item.badgeBg} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                              {item.initials}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0a0a0c] leading-tight">{item.author}</h4>
                              <p className="text-[10px] text-[#c81e38] font-semibold tracking-wide">{item.relation}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-neutral-400">{item.timeAgo}</span>
                        </div>
                        <p className="text-xs text-neutral-700 italic leading-relaxed">
                          "{item.text}"
                        </p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {item.tag}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                        <button
                          onClick={() => handleLikeWish(item.id)}
                          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#c81e38] transition-colors"
                        >
                          <AppIcon name="favorite" size={16} className="text-[#c81e38]" fill="currentColor" />
                          <span className="text-[11px] font-bold text-neutral-800">{item.likes}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { triggerPetalBurst('❤️', e); handleLikeWish(item.id); }}
                            className="w-6 h-6 rounded-md hover:bg-neutral-100 text-xs flex items-center justify-center"
                            title="Love"
                          >
                            ❤️
                          </button>
                          <button
                            onClick={(e) => { triggerPetalBurst('🌹', e); handleLikeWish(item.id); }}
                            className="w-6 h-6 rounded-md hover:bg-neutral-100 text-xs flex items-center justify-center"
                            title="Roses"
                          >
                            🌹
                          </button>
                          <button
                            onClick={(e) => { triggerPetalBurst('🥂', e); handleLikeWish(item.id); }}
                            className="w-6 h-6 rounded-md hover:bg-neutral-100 text-xs flex items-center justify-center"
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
                  className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full bg-white shadow-md border border-neutral-200 text-neutral-800 items-center justify-center hover:bg-[#c81e38] hover:text-white transition-all"
                  title="Scroll left"
                >
                  <AppIcon name="chevron_left" size={18} />
                </button>
                <button
                  onClick={() => scrollWishes(280)}
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full bg-white shadow-md border border-neutral-200 text-neutral-800 items-center justify-center hover:bg-[#c81e38] hover:text-white transition-all"
                  title="Scroll right"
                >
                  <AppIcon name="chevron_right" size={18} />
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
              <button
                onClick={() => setActiveEvent('engagement')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'engagement'
                    ? 'bg-[#c81e38] text-white font-bold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <AppIcon name="diamond" size={16} />
                <span>Engagement</span>
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-600">24</span>
              </button>

              <button
                onClick={() => setActiveEvent('mehndi')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'mehndi'
                    ? 'bg-[#c81e38] text-white font-bold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <AppIcon name="spa" size={16} />
                <span>Mehndi</span>
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-600">38</span>
              </button>

              <button
                onClick={() => setActiveEvent('haldi')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all ${
                  activeEvent === 'haldi'
                    ? 'bg-[#c81e38] text-white font-bold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950 font-medium'
                }`}
              >
                <AppIcon name="wb_sunny" size={16} className="text-white" />
                <span>Haldi</span>
                <span className="px-2 py-0.5 rounded-full bg-black/25 text-white text-[10px] font-bold">Active • 145</span>
              </button>

              <button
                onClick={() => setActiveEvent('sangeet')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'sangeet'
                    ? 'bg-[#c81e38] text-white font-bold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <AppIcon name="music_note" size={16} />
                <span>Sangeet</span>
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-600">Tonight</span>
              </button>

              <button
                onClick={() => setActiveEvent('marriage')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'marriage'
                    ? 'bg-[#c81e38] text-white font-bold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <AppIcon name="favorite" size={16} fill="currentColor" />
                <span>Wedding</span>
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-600">Tomorrow</span>
              </button>

              <button
                onClick={() => setActiveEvent('others')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeEvent === 'others'
                    ? 'bg-[#c81e38] text-white font-bold shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <AppIcon name="interests" size={16} />
                <span>Afterparty</span>
                <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] text-neutral-600">5</span>
              </button>
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
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk"
                  />
                  <div className="absolute bottom-3 right-3">
                    <button className="px-3 py-1.5 rounded-lg bg-neutral-900/85 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#c81e38] transition-colors shadow-sm">
                      <AppIcon name="fullscreen" size={15} />
                      <span>View Card</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2.5">
                <button
                  onClick={handleDownloadInviteImage}
                  className="flex-1 h-10 px-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-neutral-300 shadow-xs"
                >
                  <AppIcon name="download" size={16} className="text-neutral-700" />
                  <span>Download Card</span>
                </button>
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeMediaTab === 'photos'
                      ? 'bg-[#c81e38] text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <AppIcon name="image" size={16} />
                  <span>Photos ({moments.length * 35})</span>
                </button>
                <button
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activeMediaTab === 'videos'
                      ? 'bg-[#c81e38] text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <AppIcon name="videocam" size={16} />
                  <span>Videos (3)</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeFilter === 'all'
                      ? 'bg-[#c81e38] text-white shadow-sm'
                      : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('bride')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    activeFilter === 'bride'
                      ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                      : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs font-medium'
                  }`}
                >
                  Bride Side
                </button>
                <button
                  onClick={() => setActiveFilter('groom')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    activeFilter === 'groom'
                      ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                      : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs font-medium'
                  }`}
                >
                  Groom Side
                </button>
                <button
                  onClick={() => setActiveFilter('favorites')}
                  className={`px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all ${
                    activeFilter === 'favorites'
                      ? 'bg-[#c81e38] text-white font-semibold shadow-sm'
                      : 'bg-white text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200/80 shadow-xs font-medium'
                  }`}
                >
                  <AppIcon name="star" size={14} className="text-[#c81e38]" />
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          moment.liked
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
              ))}
            </div>

            {/* Upcoming Event Teaser */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#c81e38]/10 via-neutral-50 to-white border border-[#c81e38]/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#c81e38]/10 text-[#c81e38] flex items-center justify-center shrink-0 border border-[#c81e38]/20">
                  <AppIcon name="flare" size={24} />
                </div>
                <div>
                  <h4 className="font-editorial font-bold text-sm text-[#0a0a0c]">Tonight: Sangeet Dance Battles Live</h4>
                  <p className="text-xs text-neutral-600">Stream starts at 7:30 PM with interactive voting for Bride vs Groom choreography!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploaderCeremony('Sangeet');
                  setIsUploadModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#c81e38] hover:text-white text-neutral-800 border border-neutral-200 text-xs font-semibold transition-all shrink-0 shadow-xs"
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
              <iframe
                src={currentCeremony.streamUrl}
                title="Live Wedding Stream"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors ${
                    filteredMoments[lightboxIndex]?.liked ? 'bg-[#c81e38]' : 'bg-white/10 hover:bg-[#c81e38]'
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

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-2">
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
      )}

      {/* MODAL 4: Digital Invitation Full Card */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-neutral-50 flex items-center justify-between border-b border-neutral-200">
              <h3 className="font-editorial font-bold text-sm text-[#0a0a0c]">Rahul &amp; Anjali • Wedding Invitation</h3>
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk"
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

      {/* ENHANCED MODAL 5: Interactive Blessing & Shagun Creator Modal */}
      {isWishesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#c81e38]/10 via-neutral-50 to-white flex items-center justify-between border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#c81e38]/10 text-[#c81e38] flex items-center justify-center border border-[#c81e38]/30">
                  <AppIcon name="favorite" size={22} className="text-[#c81e38]" fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-editorial font-bold text-base text-[#0a0a0c]">Send Wedding Blessing &amp; Shagun</h3>
                  <p className="text-[11px] text-neutral-500">Broadcast your warm wishes directly to the couple</p>
                </div>
              </div>
              <button
                onClick={() => setIsWishesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitWish} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pooja & Kabir"
                    value={wishAuthor}
                    onChange={(e) => setWishAuthor(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-[#0a0a0c] focus:outline-none focus:border-[#c81e38] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Relation / Table</label>
                  <input
                    type="text"
                    placeholder="e.g. Bride's Friend • Table 2"
                    value={wishRelation}
                    onChange={(e) => setWishRelation(e.target.value)}
                    className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-[#0a0a0c] focus:outline-none focus:border-[#c81e38] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Blessing Theme / Ceremony Tag</label>
                <select
                  value={wishTag}
                  onChange={(e) => setWishTag(e.target.value)}
                  className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-[#0a0a0c] focus:outline-none focus:border-[#c81e38] focus:bg-white"
                >
                  <option>Golden Haldi Glow ✨</option>
                  <option>Aashirwaad 🪔</option>
                  <option>Sangeet Ready 💃🕺</option>
                  <option>Soulmates Forever 💛</option>
                  <option>Nazar Na Lage 🧿</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Blessing Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your heartfelt wishes for Rahul & Anjali..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-[#0a0a0c] focus:outline-none focus:border-[#c81e38] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWishesModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c81e38] hover:bg-[#9e1b32] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <AppIcon name="send" size={16} />
                  <span>Broadcast Blessing</span>
                </button>
              </div>
            </form>
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
                placeholder="e.g. RAHUL24"
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
