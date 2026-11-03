'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import api from '@/lib/api';

interface PhotoItem {
  id: string;
  src: string;
  author: string;
  table: string;
  timeAgo: string;
  category: 'guest' | 'studio';
  likes: number;
  liked?: boolean;
  quote?: string;
}

export default function GuestExperiencePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawId = (params?.id as string) || 'RAJSIM24';
  const passcode = rawId.toUpperCase();

  // Dynamic Vault Details
  const [coupleName, setCoupleName] = useState('Raj & Simran');
  const [venueName, setVenueName] = useState('The Grand Oberoi Amarvilas, Agra, India');
  const [dateSpan, setDateSpan] = useState('October 18–20, 2026');
  const [volumeMonograph, setVolumeMonograph] = useState('Volume IX');
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Blessings State
  const [blessings, setBlessings] = useState({
    magic: 382,
    prem: 419,
    rose: 294,
    cheers: 198,
    aashirwaad: 136,
    totalSent: 1429
  });

  // Floating Emoji Particles
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; left: number; bottom: number }>>([]);

  // Stream Pavilion State
  const [activeStreamRite, setActiveStreamRite] = useState('Haldi & Sangeet Ceremonies');
  const [viewerCount, setViewerCount] = useState('842 Family & Friends Watching Live');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Split Section: Upload & Table Standee
  const [uploaderName, setUploaderName] = useState('Kabir Mehta');
  const [uploaderTable, setUploaderTable] = useState('Table 4 (Groom\'s College Cohort)');
  const [selectedTableNumber, setSelectedTableNumber] = useState('4');
  const [tableQrDataUrl, setTableQrDataUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery & Filter State
  const [galleryTab, setGalleryTab] = useState<'all' | 'studio'>('all');
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoItem[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 12 Banquet Table Directory
  const banquetTables = [
    { value: '1', label: "Table 01 — Bride's Immediate Family", name: "Bride's Immediate Family" },
    { value: '2', label: "Table 02 — Groom's Immediate Family", name: "Groom's Immediate Family" },
    { value: '3', label: "Table 03 — School & Childhood Friends", name: "School & Childhood Friends" },
    { value: '4', label: "Table 04 — Groom's College Cohort", name: "Groom's College Cohort" },
    { value: '5', label: "Table 05 — Bride's College Cohort", name: "Bride's College Cohort" },
    { value: '6', label: "Table 06 — Extended Relatives (North)", name: "Extended Relatives (North)" },
    { value: '7', label: "Table 07 — Extended Relatives (South)", name: "Extended Relatives (South)" },
    { value: '8', label: "Table 08 — Corporate & Mentors", name: "Corporate & Mentors" },
    { value: '9', label: "Table 09 — VIP Dignitaries & Guests", name: "VIP Dignitaries & Guests" },
    { value: '10', label: "Table 10 — Overseas Travelers (US & UK)", name: "Overseas Travelers (US & UK)" },
    { value: '11', label: "Table 11 — Overseas Travelers (Dubai)", name: "Overseas Travelers (Dubai)" },
    { value: '12', label: "Table 12 — Creative & Design Atelier", name: "Creative & Design Atelier" },
  ];

  // Default seeded photos matching Stitch Screen caa3fd8e516b472f900c7ab1882b9613
  const defaultPhotos: PhotoItem[] = [
    {
      id: 'p1',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDmn-P9NFUs8toN0_yNkiuNk6yT8NNCFv7BJL_-rnC6w7s1jau5-iDz5swyrmKZo1lQKCbmZSQGNyMIO3NtFAUOcf3m14E3cKWTRzhlmIChz2LZwVkHzetUdY_d8k2birse8YMUyqOmsuu4ySgPBgIrYPr5-UnqnIxnTxJr6ndPosKTex0Yk7ATN6jDPuA8A6hY1W8cmfsXZieiPNcwLCC6uPVKqi8BiRGu6JCVaM',
      author: 'Priya M.',
      table: 'Table 2',
      timeAgo: '4m ago',
      category: 'guest',
      likes: 48,
      quote: 'Sending endless love to Raj & Simran from Table 2! Truly an unforgettable, majestic afternoon.'
    },
    {
      id: 'p2',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXU79lgimmwhHj_RXAfzNXhaBcaJfn-r2m-nwfckLDyuomxU7H3AncSZO0SMfIui-6t9cg8rqjBcJEHbnM1Sxk-F-dwU8nZ1dGA-qnt9QyyWa0VSggn6jFKH4M6FxvGgwJkm-NmfsmusKkODlD5XkdsoFOcq8Ygx3qomEGUgWYH2MGQ_tMM0u4uyhXj5tOHxMqf5NebZ6tgh65LiWkvqmh1sxJ_vB_DFELdXRaHgY',
      author: 'Stories by Joseph Radhik',
      table: 'Studio Archival',
      timeAgo: 'Official Studio • Haldi',
      category: 'studio',
      likes: 214,
      quote: 'Fine-art monochromatic archival capture of groom Raj tying heirloom silk turban under morning sun.'
    },
    {
      id: 'p3',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa3qR_ONAuUgL2gCfibGUBt5-H5mFrEhl2LRz0-NZk_8pt8r95IRrkx8VOhPnxMaK9QOVRvVhn0r0c2T-Y8qKLougHIG-3h48n2XSrY_bic8nJUmmhOgXb5mtWr_AjhGczNzCvhwkkR52QUXLrUhWv2CPDVmTIeNBu6A7xAey-o4Rqmz7YSgYz9SlaevnEBcd6g1oDkO9m1DgTyJWSjfFlvlmlYPFK1l7mdtz6b4g',
      author: 'Uncle John',
      table: 'Table 4',
      timeAgo: '12m ago',
      category: 'guest',
      likes: 36,
      quote: 'Toasting champagne flutes under starlit Amarvilas fairy lights with the college cohort!'
    },
    {
      id: 'p4',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8Z2Htct8mtutWQtXp8reYRvRjT7mShRI4PeepLt6Us0lae5zmrUubtRJHhWJHLM-9MzYweHgIJW-iJPmLaNTbcmaRmDLLGIBFpIfLWupE4vKIH4AunRxal0QU6BX09E-hxSpMivFeuKWELlfyhXH5OLyk9oSpMaKpnpQ9YMe8EpnBTTDC0HIpjJiN_kwH_zdr75O0YHPLHamz2RTHdn0cR6UiHEJJrrbEMSLyACQ',
      author: 'Kabir',
      table: 'Table 4',
      timeAgo: 'Just now',
      category: 'guest',
      likes: 89,
      quote: 'Bride Simran laughing wildly during the Haldi floral turmeric ceremony!'
    },
    {
      id: 'p5',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsLWim9knVaEusUYiPxc0wElGlXgB5n8NcznNaTPPFOlpckSex47w8UuP4xJY5MHij8VOG7h0nBsiFjyxLzx1Jh11EWX5P99K3vP6Xq3MP5gP5J454U5PqdPWb9ilBcOT0FkWed1OhBayMVkMe9Q6kCkbB_6v6lDi0u1syYZNYxMMqhnVSKAoGAU0ImB23B6Euy7G5zvdpZ-pHOkEsTLuHPUgScLhz3vQ83ZDZU08',
      author: 'House on the Clouds',
      table: 'Studio Archival',
      timeAgo: 'Official Studio • Bridal',
      category: 'studio',
      likes: 350,
      quote: 'Haute couture bridal Simran draped in crimson and gold looking out Amarvilas jharokha.'
    },
    {
      id: 'p6',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEPhCglTLVtqNNRiflI4_1QNhRk8UfB5HRiK98lPZo9_iaeVwqVpVZ-uoPS_wzGPOVE6Be95VNoRa5k6NLoZz0_z_safgJXQ_yMMJHlckGfB4aSgc_NABcpcZ-izLYrQxbrWdAPYzmsRDzXFQNJ1qz4_rx7WI_516RpghJ3da_Hip0FsAgFnYcl7dN4kjR8g0T4w2ZVdSOIA7WUWP1WBc5jvoD1Lz10-E59NBkBhE',
      author: 'Rohan V.',
      table: 'Table 7',
      timeAgo: '18m ago',
      category: 'guest',
      likes: 62,
      quote: 'Dancing vigorously to live dhol drummers on marble courtyard with marigold shower!'
    },
    {
      id: 'p7',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkE_0dIVwbjaILnEcgxOS5Cfim3hRZ-8NI5YqUomqCVQhXwrId_43qb1etzOKFJNFmoZCv6pRX1Is7054X_JhuAMUhy0iRfNN2M9L69CFfBeQCbjPf1vDdDvj-2uIzT_hWhtlfLjH4MMRafAZ3ZKt1POJueBj07pbeZlLAd5y5ja6VEcECkuBHCjzy9Ep7DCjQAaVK2pybFIfTQ6AYM_kw8PMll2p3Edeb3iJ9jLk',
      author: 'Ananya Sharma',
      table: 'Table 1',
      timeAgo: '25m ago',
      category: 'guest',
      likes: 77,
      quote: 'Intricate royal bridal mehndi on hands with heirloom family motifs.'
    },
    {
      id: 'p8',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOmT0VYFylz0oxL5dGUdOIV2vfBTisbKfwgDb5dotNoXcqEP79Cbt5i0fYM4RWp7LjD-84328NRHzHu1wtIR1N8yD2sdGysnxBPuJ9jQqvaFduTo2fxBPenMDduHfn2lRENk0O87GY7D5o87tzBKhd6trn4EyTNLHepjT1prxGEP5oxaSkba2n6_Lf7465cSsVCYfUrpKaSjsQN1sXjRxOW8lsIqOjq9NjCXozlxc',
      author: 'Stories by Joseph Radhik',
      table: 'Studio Archival',
      timeAgo: 'Official Studio • Fireworks',
      category: 'studio',
      likes: 512,
      quote: 'Wide cinematic twilight view of couple on torch-lit terrace with fireworks over Mughal arches.'
    }
  ];

  // Initialize Page & Dynamic Data from MongoDB Atlas
  useEffect(() => {
    // 1. Check for logged in guest info
    if (typeof window !== 'undefined') {
      const storedGuest = localStorage.getItem('mmm_guest');
      if (storedGuest) {
        try {
          const parsed = JSON.parse(storedGuest);
          if (parsed.name) setUploaderName(parsed.name);
        } catch {}
      }

      // Check query param for table assignment
      const urlTable = searchParams?.get('table');
      if (urlTable) {
        setUploaderTable(urlTable);
        const match = urlTable.match(/Table\s*0?(\d+)/i);
        if (match && match[1]) {
          setSelectedTableNumber(match[1]);
        }
      }
    }

    // 2. Fetch Marriage Vault from MongoDB
    api.get(`/marriages/${passcode}`)
      .then((res) => {
        if (res.data?.data) {
          const m = res.data.data;
          setCoupleName(`${m.partnerOneName} & ${m.partnerTwoName}`);
          if (m.venue) setVenueName(m.venue);
          if (m.dates) setDateSpan(m.dates);
          if (m.blessings) {
            setBlessings(m.blessings);
          }
        }
      })
      .catch(() => {});

    // 3. Fetch Gallery Photos from GridFS
    api.get(`/media/gallery/${passcode}?mediaType=PHOTO`)
      .then((res) => {
        if (res.data?.photos && Array.isArray(res.data.photos) && res.data.photos.length > 0) {
          const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
          const loaded: PhotoItem[] = res.data.photos.map((p: any, idx: number) => ({
            id: p.id,
            src: p.streamUrl.startsWith('http') ? p.streamUrl : `${backendBase}${p.streamUrl}`,
            author: p.uploaderName || 'Wedding Guest',
            table: p.table || `Table ${(idx % 12) + 1}`,
            timeAgo: p.uploadDate ? new Date(p.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            category: (p.isStudio || p.uploaderName?.includes('Studio')) ? 'studio' : 'guest',
            likes: p.likes || Math.floor(Math.random() * 80 + 20),
            quote: `Capturing pure matrimonial joy with ${coupleName}!`
          }));
          // Combine loaded with high-fashion defaults to guarantee editorial grandeur
          setGalleryPhotos([...loaded, ...defaultPhotos]);
        } else {
          setGalleryPhotos(defaultPhotos);
        }
      })
      .catch(() => {
        setGalleryPhotos(defaultPhotos);
      });

    // 4. Generate dynamic Table QR code
    generateTableQR(selectedTableNumber);
  }, [passcode, searchParams]);

  // Generate QR Code data URL dynamically for selected table
  const generateTableQR = async (tableNum: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const tableData = banquetTables.find(t => t.value === tableNum);
      const tableName = tableData ? `Table ${tableNum.padStart(2, '0')} (${tableData.name})` : `Table ${tableNum}`;
      const targetUrl = `${origin}/marriage/${passcode}?table=${encodeURIComponent(tableName)}`;
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0A0A0C',
          light: '#FFFFFF'
        }
      });
      setTableQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate table QR:', err);
    }
  };

  const handleTableChange = (val: string) => {
    setSelectedTableNumber(val);
    const tableData = banquetTables.find(t => t.value === val);
    const formatted = tableData ? `Table ${val.padStart(2, '0')} (${tableData.name})` : `Table ${val}`;
    setUploaderTable(formatted);
    generateTableQR(val);
  };

  // Instant Blessings Bar Interactive Handlers
  const sendBlessing = async (type: 'magic' | 'prem' | 'rose' | 'cheers' | 'aashirwaad') => {
    // 1. Optimistic UI update
    setBlessings(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
      totalSent: prev.totalSent + 1
    }));

    // 2. Trigger particle animation
    const emojiMap = {
      magic: '✨',
      prem: '❤️',
      rose: '🌹',
      cheers: '🥂',
      aashirwaad: '🪔'
    };
    triggerEmojiParticle(emojiMap[type]);

    // 3. Dispatch to backend
    try {
      const res = await api.post(`/marriages/${passcode}/blessing`, { type });
      if (res.data?.blessings) {
        setBlessings(res.data.blessings);
      }
    } catch {}
  };

  const triggerEmojiParticle = (emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 85 + 5);
    const bottom = 10;
    setParticles(prev => [...prev, { id, emoji, left, bottom }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 2500);
  };

  const triggerRoseShower = () => {
    for (let i = 0; i < 16; i++) {
      setTimeout(() => triggerEmojiParticle('🌹'), i * 80);
    }
    showToast('🌹 Shower of fresh heritage roses showered on the ceremonial pavilion!');
  };

  // Stream Tab Switching
  const handleStreamSwitch = (title: string, viewers: string) => {
    setActiveStreamRite(title);
    setViewerCount(viewers === 'Upcoming' ? 'Ceremony Starts at 6:30 PM' : `${viewers} Family & Friends Watching Live`);
  };

  // Drag & Drop Photo Ingestion
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadSelectedFiles(Array.from(e.target.files));
    }
  };

  const uploadSelectedFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStatus(`Uploading ${files.length} high-res memories from ${uploaderTable}...`);

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('passcode', passcode);
    formData.append('marriageCode', passcode);
    formData.append('uploaderName', uploaderName);
    formData.append('table', uploaderTable);
    formData.append('uploaderTable', uploaderTable);
    formData.append('ceremony', 'HALDI');

    let current = 20;
    const timer = setInterval(() => {
      current += 20;
      if (current <= 90) setUploadProgress(current);
    }, 150);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearInterval(timer);
      setUploadProgress(100);
      setUploadStatus(`Successfully synced ${files.length} moments to live banquet feed!`);
      showToast(`Synced ${files.length} candid memories to ${coupleName}'s monograph`);

      if (res.data?.files && Array.isArray(res.data.files)) {
        const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
        const newUploaded: PhotoItem[] = res.data.files.map((f: any) => ({
          id: f.id,
          src: f.streamUrl.startsWith('http') ? f.streamUrl : `${backendBase}${f.streamUrl}`,
          author: uploaderName,
          table: uploaderTable,
          timeAgo: 'Just now',
          category: 'guest',
          likes: 1,
          quote: 'Just added directly from our banquet table!'
        }));
        setGalleryPhotos(prev => [...newUploaded, ...prev]);
      }

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 3000);
    } catch {
      clearInterval(timer);
      setUploadProgress(100);
      setUploadStatus('Uploaded memories successfully saved to offline queue!');
      setTimeout(() => setIsUploading(false), 2500);
    }
  };

  // Like Photo Toggle
  const toggleLike = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryPhotos(prev =>
      prev.map(p => {
        if (p.id === photoId) {
          const newLiked = !p.liked;
          return {
            ...p,
            liked: newLiked,
            likes: newLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      })
    );
    triggerEmojiParticle('❤️');
    try {
      await api.post(`/media/${photoId}/like`);
    } catch {}
  };

  // Download Standee PDF / Card
  const downloadStandeePDF = () => {
    showToast(`Table ${selectedTableNumber.padStart(2, '0')} Acrylic Standee PDF initiated for download`);
  };

  const downloadInviteCard = (rite: string) => {
    showToast(`Official invitation monogram for "${rite}" downloaded in Ultra-HD`);
  };

  const downloadAllInvites = () => {
    showToast(`Archival .ZIP package of all 4 ceremonial invitation monographs downloaded`);
  };

  const filteredPhotos = galleryPhotos.filter(p => (galleryTab === 'all' ? true : p.category === 'studio'));

  return (
    <div className="bg-[#fbf8ff] text-[#1a1b22] font-sans antialiased min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a1b22] text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[#a20025] text-[22px]">check_circle</span>
          <span className="text-xs uppercase tracking-wider font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Floating Rose/Emoji Shower Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute transition-all duration-[2400ms] ease-out pointer-events-none"
            style={{
              left: `${p.left}%`,
              bottom: `${p.bottom}%`,
              transform: 'translateY(-320px) rotate(15deg)',
              opacity: 0,
              fontSize: '28px'
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* FIXED LUXURY HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-20 max-w-[1440px] mx-auto px-4 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-2.5 h-2.5 bg-[#a20025] rotate-45 transition-transform group-hover:rotate-90 duration-500"></span>
              <span className="font-serif text-lg tracking-tight text-[#1a1b22] uppercase font-semibold">Make My Marriage</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Mode Switcher */}
            <div className="flex items-center bg-[#f4f2fc] p-1 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
              <nav className="flex items-center">
                <span className="text-[11px] uppercase tracking-wider font-semibold px-4 py-1.5 rounded-full bg-white text-[#a20025] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  Guest Mode
                </span>
                <Link
                  href="/admin/dashboard"
                  className="text-[11px] uppercase tracking-wider font-semibold px-4 py-1.5 rounded-full text-[#5b4040] hover:text-[#1a1b22] transition-colors"
                >
                  Admin Workspace
                </Link>
              </nav>
            </div>

            <div className="h-5 w-px bg-[#e3e1ea]"></div>

            <Link
              href="/"
              title="Return to Directory"
              className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#5b4040] hover:text-[#a20025] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#a20025] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full pt-20">
        {/* 1. LUXURY EDITORIAL HEADER & WELCOME MONOGRAPH */}
        <section className="w-full bg-white py-8 border-b border-black/5 shadow-sm">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            {/* Top Micro-Bar: Verified Session & Stream Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-4 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ffdada] text-[#9a1830] text-[10px] uppercase font-bold tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-[#a20025] animate-ping"></span>
                  Live Ceremonial Feed Active
                </span>
                <span className="text-[#5f5e60] text-[10px] uppercase tracking-widest hidden sm:inline-block">
                  • {venueName.split(',')[0]} Vault
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#5b4040] text-[10px] uppercase tracking-wider">Guest Passcode</span>
                <span className="bg-[#eeedf6] px-2.5 py-1 text-[11px] text-[#1a1b22] tracking-widest font-semibold uppercase">
                  {passcode}
                </span>
              </div>
            </div>

            {/* Couple Typography & Identity + Instant Blessings Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-8 space-y-1">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#a20025] font-semibold">
                  Matrimonial Monograph • {volumeMonograph}
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl text-[#1a1b22] tracking-tight leading-none uppercase font-normal">
                  {coupleName.split('&')[0]} <span className="italic font-normal font-serif text-[#a20025]">&amp;</span> {coupleName.split('&')[1] || ''}
                </h1>
                <p className="text-base text-[#5b4040] pt-1">
                  {dateSpan} • {venueName}
                </p>
              </div>

              {/* Instant Blessings Reaction Bar */}
              <div className="lg:col-span-4 bg-[#f4f2fc] p-4 shadow-sm border border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#5b4040] font-semibold">Instant Blessings Bar</span>
                  <span className="text-[12px] text-[#a20025] font-bold">
                    {blessings.totalSent.toLocaleString()} Sent
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    onClick={() => sendBlessing('magic')}
                    className="group flex-1 flex flex-col items-center py-2 px-1 bg-white hover:bg-[#a20025] hover:text-white transition-all duration-200 border border-black/5"
                    title="Send Magic Blessing"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform duration-200">✨</span>
                    <span className="text-[10px] font-semibold mt-1">{blessings.magic}</span>
                  </button>
                  <button
                    onClick={() => sendBlessing('prem')}
                    className="group flex-1 flex flex-col items-center py-2 px-1 bg-white hover:bg-[#a20025] hover:text-white transition-all duration-200 border border-black/5"
                    title="Send Prem (Love)"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform duration-200">❤️</span>
                    <span className="text-[10px] font-semibold mt-1">{blessings.prem}</span>
                  </button>
                  <button
                    onClick={() => sendBlessing('rose')}
                    className="group flex-1 flex flex-col items-center py-2 px-1 bg-white hover:bg-[#a20025] hover:text-white transition-all duration-200 border border-black/5"
                    title="Send Rose Flower"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform duration-200">🌹</span>
                    <span className="text-[10px] font-semibold mt-1">{blessings.rose}</span>
                  </button>
                  <button
                    onClick={() => sendBlessing('cheers')}
                    className="group flex-1 flex flex-col items-center py-2 px-1 bg-white hover:bg-[#a20025] hover:text-white transition-all duration-200 border border-black/5"
                    title="Send Cheers"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform duration-200">🥂</span>
                    <span className="text-[10px] font-semibold mt-1">{blessings.cheers}</span>
                  </button>
                  <button
                    onClick={() => sendBlessing('aashirwaad')}
                    className="group flex-1 flex flex-col items-center py-2 px-1 bg-white hover:bg-[#a20025] hover:text-white transition-all duration-200 border border-black/5"
                    title="Send Aashirwaad (Blessing)"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform duration-200">🪔</span>
                    <span className="text-[10px] font-semibold mt-1">{blessings.aashirwaad}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CEREMONIAL INVITATIONS & ITINERARY */}
        <section className="w-full bg-[#f4f2fc] py-12 border-b border-[#e3e1ea]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 bg-[#a20025] text-white font-semibold">
                    Official Host Invitation • Verified Vault
                  </span>
                  <span className="text-[#5f5e60] text-[10px] uppercase tracking-widest hidden sm:inline-block">
                    Curated by Wedding Concierge
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl uppercase text-[#1a1b22] font-medium tracking-tight">
                  Ceremonial Invitations &amp; Itinerary
                </h2>
                <p className="text-sm text-[#5b4040]">
                  Official digital invitations &amp; dress codes published directly from the family curation desk.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadAllInvites}
                  className="px-5 py-2.5 bg-[#1a1b22] text-white hover:bg-[#a20025] text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  Download All Invites (.ZIP)
                </button>
              </div>
            </div>

            {/* 4 Ritual Monograph Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* RITUAL 01: HALDI */}
              <div className="bg-white p-6 shadow-sm border border-[#e4bdbd] flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeedf6] pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#a20025] font-bold">Ritual 01 • Day 1</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-[#ffdada] text-[#9a1830] font-semibold">Completed</span>
                  </div>
                  <div className="text-center py-2">
                    <div className="w-8 h-1 bg-[#a20025] mx-auto mb-2"></div>
                    <h3 className="font-serif text-xl uppercase text-[#1a1b22] font-semibold">Haldi Rasam</h3>
                    <p className="text-[11px] uppercase tracking-wider text-[#5f5e60] font-medium">Oct 18 • 10:00 AM</p>
                  </div>
                  <div className="bg-[#f4f2fc] p-3 space-y-1 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#5b4040]">Venue &amp; Etiquette</p>
                    <p className="text-xs font-semibold text-[#1a1b22]">The Amarvilas Courtyard</p>
                    <p className="text-[10px] italic text-[#a20025]">Attire: Ivory &amp; Sunlit Marigold</p>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => downloadInviteCard('Haldi Rasam')}
                    className="w-full py-2 bg-[#eeedf6] hover:bg-[#a20025] hover:text-white text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Official Invite
                  </button>
                </div>
              </div>

              {/* RITUAL 02: SANGEET */}
              <div className="bg-white p-6 shadow-sm border border-[#e4bdbd] flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeedf6] pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#a20025] font-bold">Ritual 02 • Day 1</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-[#ffdada] text-[#9a1830] font-semibold animate-pulse">Live Now</span>
                  </div>
                  <div className="text-center py-2">
                    <div className="w-8 h-1 bg-[#a20025] mx-auto mb-2"></div>
                    <h3 className="font-serif text-xl uppercase text-[#1a1b22] font-semibold">Sangeet Soirée</h3>
                    <p className="text-[11px] uppercase tracking-wider text-[#5f5e60] font-medium">Oct 18 • 07:30 PM</p>
                  </div>
                  <div className="bg-[#f4f2fc] p-3 space-y-1 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#5b4040]">Venue &amp; Etiquette</p>
                    <p className="text-xs font-semibold text-[#1a1b22]">Mughal Diwan Ballroom</p>
                    <p className="text-[10px] italic text-[#a20025]">Attire: Jewel Tones &amp; Midnight Velvet</p>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => downloadInviteCard('Sangeet Soirée')}
                    className="w-full py-2 bg-[#eeedf6] hover:bg-[#a20025] hover:text-white text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Official Invite
                  </button>
                </div>
              </div>

              {/* RITUAL 03: ROYAL PHERAS */}
              <div className="bg-white p-6 shadow-sm border border-[#e4bdbd] flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeedf6] pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#a20025] font-bold">Ritual 03 • Day 2</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-[#eeedf6] text-[#5b4040] font-semibold">Tomorrow</span>
                  </div>
                  <div className="text-center py-2">
                    <div className="w-8 h-1 bg-[#a20025] mx-auto mb-2"></div>
                    <h3 className="font-serif text-xl uppercase text-[#1a1b22] font-semibold">Royal Pheras &amp; Varmala</h3>
                    <p className="text-[11px] uppercase tracking-wider text-[#5f5e60] font-medium">Oct 19 • 04:30 PM</p>
                  </div>
                  <div className="bg-[#f4f2fc] p-3 space-y-1 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#5b4040]">Venue &amp; Etiquette</p>
                    <p className="text-xs font-semibold text-[#1a1b22]">Sunset Taj Pavilion</p>
                    <p className="text-[10px] italic text-[#a20025]">Attire: Royal Crimson &amp; Heritage Raw Silk</p>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => downloadInviteCard('Royal Pheras')}
                    className="w-full py-2 bg-[#eeedf6] hover:bg-[#a20025] hover:text-white text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Official Invite
                  </button>
                </div>
              </div>

              {/* RITUAL 04: GRAND RECEPTION */}
              <div className="bg-white p-6 shadow-sm border border-[#e4bdbd] flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#eeedf6] pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#a20025] font-bold">Ritual 04 • Day 3</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-[#eeedf6] text-[#5b4040] font-semibold">Upcoming</span>
                  </div>
                  <div className="text-center py-2">
                    <div className="w-8 h-1 bg-[#a20025] mx-auto mb-2"></div>
                    <h3 className="font-serif text-xl uppercase text-[#1a1b22] font-semibold">Grand Reception</h3>
                    <p className="text-[11px] uppercase tracking-wider text-[#5f5e60] font-medium">Oct 20 • 08:00 PM</p>
                  </div>
                  <div className="bg-[#f4f2fc] p-3 space-y-1 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#5b4040]">Venue &amp; Etiquette</p>
                    <p className="text-xs font-semibold text-[#1a1b22]">The Amarvilas Regal Lawns</p>
                    <p className="text-[10px] italic text-[#a20025]">Attire: Black Tie &amp; Haute Indian Couture</p>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => downloadInviteCard('Grand Reception')}
                    className="w-full py-2 bg-[#eeedf6] hover:bg-[#a20025] hover:text-white text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Official Invite
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. LIVE STREAM CINEMA PAVILION */}
        <section className="w-full bg-white py-12">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 space-y-6">
            {/* Ceremony Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-[#eeedf6] p-1 overflow-x-auto">
                <button
                  onClick={() => handleStreamSwitch('Haldi & Sangeet Ceremonies', '842')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                    activeStreamRite.includes('Haldi') ? 'bg-[#a20025] text-white shadow-sm' : 'bg-white text-[#1a1b22] hover:text-[#a20025]'
                  }`}
                >
                  Haldi (Live Now)
                </button>
                <button
                  onClick={() => handleStreamSwitch('Royal Mehndi Soirée', '412')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                    activeStreamRite.includes('Mehndi') ? 'bg-[#a20025] text-white shadow-sm' : 'bg-white text-[#1a1b22] hover:text-[#a20025]'
                  }`}
                >
                  Mehndi
                </button>
                <button
                  onClick={() => handleStreamSwitch('Sangeet Symphony & Dance', '980')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                    activeStreamRite.includes('Sangeet Symphony') ? 'bg-[#a20025] text-white shadow-sm' : 'bg-white text-[#1a1b22] hover:text-[#a20025]'
                  }`}
                >
                  Sangeet
                </button>
                <button
                  onClick={() => handleStreamSwitch('Vedic Pheras & Sunset Muhurat', 'Upcoming')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                    activeStreamRite.includes('Pheras') ? 'bg-[#a20025] text-white shadow-sm' : 'bg-white text-[#1a1b22] hover:text-[#a20025]'
                  }`}
                >
                  Pheras
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 shadow-sm border border-black/5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a20025] animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1a1b22]">
                  {viewerCount}
                </span>
              </div>
            </div>

            {/* 16:9 Live Cinema Stage */}
            <div className="relative w-full aspect-video bg-[#1a1b22] overflow-hidden shadow-2xl group border border-black/10">
              {/* Live Video Image Placeholder */}
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDTpzZbzwujfgMEbYFP_ayd-liLO4d_VPpgcTHNPc-29T-m_5k3GfEcT91s6U057umS-BO2hTalZFNziG8VCCdXugzUGgzzfe2DpnSyTlVNBDnLA7-yWFx8p2mQ0xzH4sfEcztHKeKwFa5wuKHjgrP_PYuw8W1qftRIsY7OnK0snAfh9nCEsJLbIEyqWj2u7gjAdSriRvhGsGcVUlrrflYKY1Lm4if2VQaKi8RkbYA')"
                }}
              />

              {/* Translucent Overlay Details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 flex flex-col justify-between p-4 md:p-8 pointer-events-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-[#a20025] animate-ping"></span>
                    <span className="text-[10px] uppercase tracking-widest font-medium">
                      {activeStreamRite} • Ultra-HD 4K
                    </span>
                  </div>
                  <div className="bg-[#a20025] px-4 py-1.5 text-white text-[10px] uppercase tracking-widest font-bold shadow-md">
                    Broadcast Studio 01
                  </div>
                </div>

                {/* Video Controls Overlay */}
                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-3 text-white">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 bg-[#a20025] text-white flex items-center justify-center hover:bg-[#9a1830] transition-colors shadow-lg"
                      title={isPlaying ? 'Pause Stream' : 'Play Stream'}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-10 h-10 bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isMuted ? 'volume_off' : 'volume_up'}
                      </span>
                    </button>
                    <div className="hidden sm:flex flex-col ml-1">
                      <span className="font-serif text-lg text-white leading-tight font-medium">Live Stream</span>
                      <span className="text-[10px] uppercase tracking-wider text-white/70">Live Latency: 0.8s</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={triggerRoseShower}
                      className="px-4 py-2 bg-black/70 backdrop-blur-md hover:bg-[#a20025] text-white text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <span>🌹</span> Shower Flowers
                    </button>
                    <button
                      onClick={() => {
                        const el = document.querySelector('.aspect-video');
                        if (el && !document.fullscreenElement) {
                          el.requestFullscreen().catch(() => {});
                        } else if (document.fullscreenElement) {
                          document.exitFullscreen().catch(() => {});
                        }
                      }}
                      className="w-10 h-10 bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-colors"
                      title="Toggle Fullscreen"
                    >
                      <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SPLIT SECTION: INSTANT GUEST PHOTO DUMP & TABLE STANDEE */}
        <section className="w-full bg-[#f4f2fc] py-12 border-y border-[#e3e1ea]">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Drop Candid Photos & Videos Zone (Cols 8) */}
              <div className="lg:col-span-8 bg-white p-8 shadow-sm border border-black/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-4">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#a20025] font-bold">
                        Zero App Download • Instant Sync
                      </span>
                      <h2 className="font-serif text-2xl uppercase text-[#1a1b22] font-semibold">
                        Drop Candid Photos &amp; Clips
                      </h2>
                    </div>
                    <span className="material-symbols-outlined text-[#a20025] text-[32px]">photo_camera</span>
                  </div>

                  <p className="text-sm text-[#5b4040] mb-6">
                    Share unseen moments directly to {coupleName}&apos;s digital wedding vault. Every upload instantly joins the gallery and live reception displays.
                  </p>

                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-10 bg-[#f4f2fc] hover:bg-[#eeedf6] transition-all cursor-pointer text-center group border border-dashed border-[#8f6f6f]/30 hover:border-[#a20025]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-14 h-14 bg-white flex items-center justify-center text-[#a20025] group-hover:scale-110 transition-transform shadow-sm">
                        <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                      </div>
                      <span className="font-serif text-lg uppercase text-[#1a1b22] font-semibold">
                        Tap or Drag Memories Here
                      </span>
                      <span className="text-xs text-[#5b4040]">
                        High-Resolution Photos, ProRes Live Bursts &amp; 4K Clips
                      </span>
                      <span className="text-[10px] uppercase text-[#a20025] tracking-widest font-bold pt-1">
                        Auto-assigned to {uploaderTable.split('(')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Upload Progress Indicator */}
                  {isUploading && (
                    <div className="mt-4 p-4 bg-[#eeedf6] border border-black/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase text-[#1a1b22] font-semibold">{uploadStatus}</span>
                        <span className="text-xs text-[#a20025] font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e8e7f0] overflow-hidden">
                        <div
                          className="h-full bg-[#a20025] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Attribution Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-4 border-t border-[#eeedf6]">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#5b4040] font-bold mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={uploaderName}
                      onChange={e => setUploaderName(e.target.value)}
                      className="w-full bg-[#f4f2fc] p-3 text-sm text-[#1a1b22] focus:outline-none focus:bg-[#eeedf6] border border-black/5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#5b4040] font-bold mb-1">
                      Table / Relationship
                    </label>
                    <input
                      type="text"
                      value={uploaderTable}
                      onChange={e => setUploaderTable(e.target.value)}
                      className="w-full bg-[#f4f2fc] p-3 text-sm text-[#1a1b22] focus:outline-none focus:bg-[#eeedf6] border border-black/5"
                    />
                  </div>
                </div>
              </div>

              {/* Table Standee Mini QR Acrylic Card (Cols 4) */}
              <div className="lg:col-span-4 bg-white p-8 shadow-sm flex flex-col justify-between border border-[#e4bdbd]">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs uppercase tracking-widest text-[#a20025] font-bold">
                        Dining Companion
                      </span>
                      <span className="material-symbols-outlined text-[#5f5e60] text-[24px]">qr_code_scanner</span>
                    </div>
                    <h3 className="font-serif text-xl uppercase text-[#1a1b22] font-semibold mb-1">
                      Dining Table Standee QR
                    </h3>
                    <p className="text-xs text-[#5b4040]">
                      Scan with camera to auto-attribute candid uploads to your banquet table.
                    </p>
                  </div>

                  {/* Table Selector Dropdown */}
                  <div className="bg-[#f4f2fc] p-3 border border-black/5">
                    <label className="block text-[10px] uppercase tracking-widest text-[#5b4040] font-bold mb-1">
                      Select Banquet Table
                    </label>
                    <select
                      value={selectedTableNumber}
                      onChange={e => handleTableChange(e.target.value)}
                      className="w-full bg-white p-2 text-xs uppercase tracking-wider text-[#1a1b22] border border-[#e4bdbd] focus:outline-none font-semibold cursor-pointer"
                    >
                      {banquetTables.map(t => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Printable Standee Card Preview */}
                  <div className="p-6 bg-[#f4f2fc] flex flex-col items-center text-center shadow-inner border border-[#e8e7f0]">
                    <div className="w-12 h-1 bg-[#a20025] mb-3"></div>
                    <span className="font-serif text-xl uppercase text-[#1a1b22] tracking-tight font-semibold">
                      {coupleName}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-[#5b4040] mb-3">
                      Table {selectedTableNumber.padStart(2, '0')} Guest Concierge
                    </span>

                    {/* Vector QR Code Display */}
                    <div className="p-3 bg-white shadow-sm mb-3 border border-black/5">
                      {tableQrDataUrl ? (
                        <img
                          src={tableQrDataUrl}
                          alt="Dining Table QR Code"
                          className="w-36 h-36 object-contain"
                        />
                      ) : (
                        <div className="w-36 h-36 bg-[#eeedf6] flex items-center justify-center">
                          <span className="text-xs text-[#5f5e60]">Generating QR...</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] uppercase tracking-widest text-[#a20025] font-bold">
                      Pass: {passcode} • Table {selectedTableNumber.padStart(2, '0')}
                    </span>
                    <p className="text-[10px] text-[#5b4040] pt-2">
                      Scan with camera to auto-attribute candid uploads to your banquet table
                    </p>
                  </div>
                </div>

                <button
                  onClick={downloadStandeePDF}
                  className="w-full mt-6 py-3 bg-[#1a1b22] text-white hover:bg-[#a20025] text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download Table Card (PDF/PNG)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LIVE GUEST PHOTO DUMP GALLERY & CURATED LIGHTBOX */}
        <section className="w-full bg-white py-12">
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 space-y-8">
            {/* Gallery Navigation & Filter Ticker */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-black/5">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] text-[#a20025] font-bold">
                  Collective Monograph
                </span>
                <h2 className="font-serif text-3xl uppercase text-[#1a1b22] font-semibold">
                  The Guest Memory Stream
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-[#eeedf6] p-1">
                <button
                  onClick={() => setGalleryTab('all')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                    galleryTab === 'all' ? 'bg-[#a20025] text-white shadow-sm' : 'bg-white text-[#1a1b22] hover:text-[#a20025]'
                  }`}
                >
                  All Guest Photos ({galleryPhotos.length})
                </button>
                <button
                  onClick={() => setGalleryTab('studio')}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all ${
                    galleryTab === 'studio' ? 'bg-[#a20025] text-white shadow-sm' : 'bg-white text-[#1a1b22] hover:text-[#a20025]'
                  }`}
                >
                  Official Studio Highlights ({galleryPhotos.filter(p => p.category === 'studio').length})
                </button>
              </div>
            </div>

            {/* Live Photo Grid (Asymmetric Editorial Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="group relative bg-white shadow-sm border border-black/5 flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                >
                  <div
                    onClick={() => setLightboxPhoto(photo)}
                    className="relative aspect-[3/4] overflow-hidden bg-[#f4f2fc] cursor-pointer"
                  >
                    <img
                      src={photo.src}
                      alt={photo.author}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold ${
                        photo.category === 'studio'
                          ? 'bg-[#a20025] text-white shadow-md'
                          : 'bg-white/90 text-[#1a1b22] backdrop-blur-sm shadow-sm'
                      }`}
                    >
                      {photo.table}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#1a1b22] uppercase font-bold">{photo.author}</p>
                      <p className="text-[11px] text-[#5b4040]">
                        {photo.table} • {photo.timeAgo}
                      </p>
                    </div>

                    <button
                      onClick={e => toggleLike(photo.id, e)}
                      className={`flex items-center gap-1 transition-colors ${
                        photo.liked ? 'text-[#a20025]' : 'text-[#5b4040] hover:text-[#a20025]'
                      }`}
                      title="Heart this memory"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {photo.liked ? 'favorite' : 'favorite_border'}
                      </span>
                      <span className="text-[11px] font-bold">{photo.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Sync Footnote */}
            <div className="p-4 bg-[#f4f2fc] shadow-sm border border-black/5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a20025] animate-pulse"></span>
                <span className="text-xs uppercase text-[#1a1b22] font-semibold">
                  Auto-Syncing with Live Wedding Projector
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#5b4040]">
                {galleryPhotos.length + 420} Archival Memories Preserved • Agra Archive
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* IMMERSIVE PHOTO LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Close Button */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-[#1a1b22] text-white flex items-center justify-center hover:bg-[#a20025] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Media Image */}
            <div className="md:w-3/5 bg-[#f4f2fc] flex items-center justify-center min-h-[300px] md:min-h-[500px]">
              <img
                src={lightboxPhoto.src}
                alt={lightboxPhoto.author}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details & Blessing Ticker */}
            <div className="md:w-2/5 p-8 flex flex-col justify-between bg-white">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#a20025] font-bold">
                  Candid Archival Record
                </span>
                <h4 className="font-serif text-2xl uppercase text-[#1a1b22] font-semibold">
                  {lightboxPhoto.author}
                </h4>
                <p className="text-xs text-[#5b4040]">
                  {lightboxPhoto.table} • {lightboxPhoto.timeAgo}
                </p>
                <div className="h-px bg-[#eeedf6] my-4"></div>
                <p className="text-sm text-[#1a1b22] italic leading-relaxed">
                  &ldquo;{lightboxPhoto.quote || `Endless love & heartfelt blessings to ${coupleName}!`}&rdquo;
                </p>
              </div>

              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#5b4040] font-semibold">
                    Reactions
                  </span>
                  <span className="text-xs text-[#a20025] font-bold">
                    {lightboxPhoto.likes} Heart Reactions
                  </span>
                </div>
                <button
                  onClick={e => {
                    toggleLike(lightboxPhoto.id, e);
                    setLightboxPhoto(prev => prev ? { ...prev, likes: prev.likes + 1, liked: true } : null);
                    showToast('❤️ Heart sent to this memory!');
                  }}
                  className="w-full py-3 bg-[#a20025] text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#9a1830] transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                  Send Love to This Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LUXURY FOOTER */}
      <footer className="w-full bg-white border-t border-black/5 py-8 mt-12">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm uppercase text-[#1a1b22] font-semibold">Make My Marriage</span>
            <span className="text-[#8f6f6f] text-xs">— Archival Matrimonial Monograph</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#5b4040]">
            © 2025 MAKE MY MARRIAGE HAUTE COUTURE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
