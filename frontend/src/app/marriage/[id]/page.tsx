'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { downloadInvitationAsImage } from '@/lib/invitation';
import { compressImage } from '@/lib/compression';

export default function GuestDashboardPage() {
  const params = useParams();
  const marriageId = (params?.id as string) || 'rahul24';

  const [activeEvent, setActiveEvent] = useState<'engagement' | 'mehndi' | 'haldi' | 'sangeet' | 'marriage' | 'others'>('haldi');
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [isPlayingStream, setIsPlayingStream] = useState(false);
  const [isWishesModalOpen, setIsWishesModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newWishAuthor, setNewWishAuthor] = useState('');
  const [newWishText, setNewWishText] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // In-page upload state
  const [modalUploaderName, setModalUploaderName] = useState('Rohan Varma');
  const [modalCeremonyTag, setModalCeremonyTag] = useState('Haldi (Active Event)');
  const [modalFiles, setModalFiles] = useState<File[]>([]);
  const [isModalUploading, setIsModalUploading] = useState(false);
  const [modalUploadProgress, setModalUploadProgress] = useState(0);

  const invitationRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDownloadInvite = async () => {
    if (invitationRef.current) {
      try {
        showToast('Generating high-res invite image...');
        await downloadInvitationAsImage(invitationRef.current, `Wedding-Invite-${activeEvent.toUpperCase()}.png`);
        showToast('Invitation downloaded successfully!');
      } catch (err) {
        showToast('Error generating invite.');
      }
    }
  };

  const [wishes, setWishes] = useState([
    { author: 'Pooja & Kabir', text: 'May your lives be showered with golden joy! Beautiful Haldi glow!' },
    { author: 'Nani & Dadu', text: 'Lots of blessings, keep laughing together always.' },
    { author: 'Team Groom', text: 'Rahul dance solos ready for the Sangeet tonight!' },
    { author: 'Aisha S.', text: 'Gorgeous decor! Anjali, your lehenga looks stunning.' },
    { author: 'Uncle Vijay', text: 'Sending warm hugs and hearty congratulations from London!' }
  ]);

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishAuthor || !newWishText) return;
    setWishes([{ author: newWishAuthor, text: newWishText }, ...wishes]);
    setNewWishAuthor('');
    setNewWishText('');
    setIsWishesModalOpen(false);
    showToast('Your blessing was posted to the live feed!');
  };

  const handleModalUpload = async () => {
    if (modalFiles.length === 0) {
      showToast('Please select at least one photo.');
      return;
    }
    setIsModalUploading(true);
    setModalUploadProgress(30);

    // Compress first
    for (const f of modalFiles) {
      await compressImage(f, { maxSizeMB: 0.5 });
    }
    setModalUploadProgress(75);

    setTimeout(() => {
      setModalUploadProgress(100);
      setTimeout(() => {
        setIsModalUploading(false);
        setIsUploadModalOpen(false);
        setModalFiles([]);
        setModalUploadProgress(0);
        showToast(`Successfully added ${modalFiles.length} photo(s) to the collective album!`);
      }, 500);
    }, 800);
  };

  const eventsData = {
    engagement: {
      name: 'Engagement Ceremony',
      time: 'Dec 12, 2026 • 6:00 PM',
      venue: 'Crystal Ballroom, The Taj, Mumbai',
      photosCount: 24,
      videosCount: 1,
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    mehndi: {
      name: 'Mehndi & Sangeet Lounge',
      time: 'Dec 13, 2026 • 3:00 PM',
      venue: 'Seaside Lawn, The Leela, Goa',
      photosCount: 38,
      videosCount: 2,
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    haldi: {
      name: 'The Haldi & Floral Shower',
      time: 'Dec 14, 2026 • 10:00 AM',
      venue: 'Courtyard Pavillion, The Leela, Goa',
      photosCount: 145,
      videosCount: 3,
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    sangeet: {
      name: 'Sangeet Gala Night',
      time: 'Dec 14, 2026 • 7:30 PM',
      venue: 'Grand Marquee, The Leela, Goa',
      photosCount: 0,
      videosCount: 0,
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    marriage: {
      name: 'Vedic Pheras Wedding Ceremony',
      time: 'Dec 15, 2026 • 11:00 AM',
      venue: 'Beachfront Mandap, The Leela, Goa',
      photosCount: 0,
      videosCount: 0,
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    others: {
      name: 'Reception & Afterparty',
      time: 'Dec 15, 2026 • 8:00 PM',
      venue: 'Sky Lounge Deck, The Leela, Goa',
      photosCount: 5,
      videosCount: 1,
      streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  };

  const currentEvent = eventsData[activeEvent];

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[100] px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* TOP HEADER */}
      <section className="bg-white border-b border-outline-variant/30 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-display font-bold text-xl shadow-md">
              R&amp;A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-xl sm:text-2xl text-on-surface">
                  Rahul &amp; Anjali
                </h1>
                <span className="material-symbols-outlined text-[18px] text-primary" title="Verified Vault">
                  verified
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Haldi Live</span>
                </span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                <span>The Leela Palace Seaside, Goa</span>
                <span>•</span>
                <span className="text-primary font-medium">145 Photos &amp; 3 Live Reels</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">320 Guests Connected</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Wedding link copied to clipboard!');
              }}
              className="px-3 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">share</span>
              <span>Share</span>
            </button>

            <button
              onClick={() => setIsWishesModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600">favorite</span>
              <span>Send Blessing</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
              <span>Drop Media</span>
            </button>
          </div>
        </div>

        {/* Live Guest Wishes Marquee */}
        <div className="mt-3 border-t border-outline-variant/20 pt-2 px-4 sm:px-6 overflow-hidden flex items-center gap-3 bg-surface-container-low/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider shrink-0">
            <span className="material-symbols-outlined text-[14px] text-amber-500">volunteer_activism</span>
            <span>Live Wishes:</span>
          </div>
          <div className="overflow-x-auto whitespace-nowrap text-xs text-on-surface-variant flex items-center gap-6">
            {wishes.map((w, idx) => (
              <span key={idx}>
                💐 <strong>{w.author}:</strong> &quot;{w.text}&quot;
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsWishesModalOpen(true)}
            className="shrink-0 text-xs font-semibold text-primary hover:underline"
          >
            + Add Wish
          </button>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        {/* 6-CEREMONY SWITCHER BAR */}
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center gap-2 min-w-max p-1.5 bg-surface-container rounded-2xl border border-outline-variant/30">
            {[
              { id: 'engagement', name: 'Engagement', icon: 'diamond', count: '24' },
              { id: 'mehndi', name: 'Mehndi', icon: 'spa', count: '38' },
              { id: 'haldi', name: 'Haldi', icon: 'wb_sunny', count: 'Active • 145' },
              { id: 'sangeet', name: 'Sangeet', icon: 'music_note', count: 'Tonight' },
              { id: 'marriage', name: 'Wedding', icon: 'favorite', count: 'Tomorrow' },
              { id: 'others', name: 'Afterparty', icon: 'interests', count: '5' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveEvent(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeEvent === tab.id
                    ? 'bg-surface text-primary font-bold shadow-sm ring-1 ring-primary/20'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.name}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-[10px]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE CEREMONY FOCUS: LIVE STREAM & DIGITAL INVITATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Stream Embed (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col">
            <div className="relative aspect-video bg-slate-900 group overflow-hidden">
              {isPlayingStream ? (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"
                  title="Wedding Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    alt="Haldi ceremony"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXToPktDIvWBZh-n4fPZKZRABxtpV9HSwbb3fpd5yxYMWWT7HNp6PG_wH1MFu4tXzaAsdmpPiUPbdrA5OVKioECHzexLD9HPWasiD9q4RYSFsbeRjwtqRfcpZYoXjzDzW5T5UXK01-6XZYT7hvlDPWadWI3j36Nu1_VmlDudf3Upvv-C4y1DuJ5g7Xvc-xRR-ODdXr5WMJ9BcR_m7H6fsOxMfU5Fz6tmegARyfZMw"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5 shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Live 1080p Stream</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] bg-black/60 backdrop-blur-md text-white font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">visibility</span>
                      <span>84 Watching</span>
                    </span>
                  </div>

                  {/* Play Button Trigger */}
                  <div
                    onClick={() => setIsPlayingStream(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all ring-4 ring-white/30">
                      <span className="material-symbols-outlined text-[32px]">play_arrow</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                  {currentEvent.name}
                </h3>
                <p className="text-xs text-on-surface-variant">{currentEvent.venue}</p>
              </div>
              <button
                onClick={() => setIsPlayingStream(!isPlayingStream)}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-primary hover:bg-surface-container-high"
              >
                {isPlayingStream ? 'Close Stream' : 'Watch Broadcast'}
              </button>
            </div>
          </div>

          {/* Digital Invitation Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm">
            <div ref={invitationRef} className="space-y-4 p-5 rounded-xl bg-gradient-to-b from-surface-container-low to-surface-container border border-outline-variant/30 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                Official Digital Invitation
              </span>
              <h2 className="font-display text-2xl font-bold text-on-surface">
                {currentEvent.name}
              </h2>
              <div className="w-12 h-0.5 bg-tertiary mx-auto my-2" />
              <p className="text-xs text-on-surface font-medium">{currentEvent.time}</p>
              <p className="text-xs text-on-surface-variant font-normal">{currentEvent.venue}</p>
              <p className="text-[11px] text-tertiary font-serif italic pt-2">
                &ldquo;Join us to celebrate our joyous union with smiles and blessings.&rdquo;
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                onClick={handleDownloadInvite}
                className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Invitation (PNG)</span>
              </button>
            </div>
          </div>
        </div>

        {/* MEDIA DUMP GALLERY & ATTRIBUTION */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/30">
            <div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface">
                Candid Photo Dump &amp; Guest Memories
              </h3>
              <p className="text-xs text-on-surface-variant">
                Every photo dumped by guests at the venue with verified name attribution.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-surface-container rounded-lg">
                <button
                  onClick={() => setActiveMediaTab('photos')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                    activeMediaTab === 'photos'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Photos (145)
                </button>
                <button
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                    activeMediaTab === 'videos'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Videos (3)
                </button>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm flex items-center gap-1 hover:opacity-95"
              >
                <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                <span>Upload Shot</span>
              </button>
            </div>
          </div>

          {/* Photo Cards Grid with Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                uploader: 'Pooja Deshmukh',
                email: 'pooja.d@yahoo.com',
                time: '8 mins ago',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgSR821Z5DFrfVq4ZndCEw5vqltS24w8TwcY7gFue5-e5qC8A2rCT_F2ojsY-3x1h4wUk-y3CKqpikhPh0nX_fut0r91acPas2Wm6J7SSftru4eCMVbYvsoAZVebwHXsu3uTQVWo92pTQcBe8cpwFW09IL65OwOPqBauUACocVfE-6NWVd6oCemUwQTjokeV9pMxnxCsKiFLHaEiSfQVBdI6s0J6kX8PJv2ruPnAA'
              },
              {
                uploader: 'Ramesh Kulkarni',
                email: 'ramesh.k@gmail.com',
                time: '12 mins ago',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXToPktDIvWBZh-n4fPZKZRABxtpV9HSwbb3fpd5yxYMWWT7HNp6PG_wH1MFu4tXzaAsdmpPiUPbdrA5OVKioECHzexLD9HPWasiD9q4RYSFsbeRjwtqRfcpZYoXjzDzW5T5UXK01-6XZYT7hvlDPWadWI3j36Nu1_VmlDudf3Upvv-C4y1DuJ5g7Xvc-xRR-ODdXr5WMJ9BcR_m7H6fsOxMfU5Fz6tmegARyfZMw'
              },
              {
                uploader: 'Dr. Sunita Varma',
                email: 'sunita.v@apollo.org',
                time: '24 mins ago',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrrJp8H5k4Kn9lsGcBSJkIvsyJ0WaekgNeXIJlRo8becUl0yxex3uelYPo8SCGer_N6xS0iKWc0WCpnXo59Eg70UhVYjNdmNaRIPxeQdSzuQBEs2vlCDd-msm3JtTpVwt4jwaqXaVd3EOQSr_foYp6ygVqlNf7E2y1mmzNrvJF6ECLO8U1JkWRb9Eu0Dd6qUh0_eNBjRA-_tB9XnFCUNtrkHV4eKGEp1ZoJEDihBk'
              },
              {
                uploader: 'Aarav Mehta',
                email: 'aarav.m@gmail.com',
                time: '45 mins ago',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoWB-VLDfrThPPxnllFL5MhYAjbGirUSK5IrNJ2opW92LBMQo2KS0uguSPF4ayFX4jxtJRNJaoUVZ3nrQ6vGFyaMlWJUGJ8M4zCssFa09cce3cokCD_swrh7iOmneYUZPGKhsPThqKwkygQK3LXTXRC3Q0lbruEF04qgFdYi-5Ih4n5_V48UdP_uestpxRCocUpt5iqvRakiKo9Iv5n-7eSFSdzFkp78qUDgYPq24'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container">
                  <img
                    alt={item.uploader}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={item.img}
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-on-surface text-[10px] font-bold">
                    {item.time}
                  </span>
                </div>
                <div className="p-3">
                  <div className="font-headline-sm text-xs font-bold text-on-surface truncate">
                    {item.uploader}
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate font-mono">
                    {item.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DROP MEDIA TO COUPLE'S VAULT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">cloud_upload</span>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Drop Media to Couple&apos;s Vault
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={modalUploaderName}
                  onChange={(e) => setModalUploaderName(e.target.value)}
                  type="text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tag Ceremony</label>
                <select
                  value={modalCeremonyTag}
                  onChange={(e) => setModalCeremonyTag(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>Haldi (Active Event)</option>
                  <option>Engagement</option>
                  <option>Mehndi</option>
                  <option>Sangeet</option>
                  <option>Marriage</option>
                  <option>Others / Candid</option>
                </select>
              </div>

              <label className="block p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 text-center cursor-pointer hover:bg-slate-100/50 transition-colors">
                <span className="material-symbols-outlined text-[32px] text-primary mb-1">photo_library</span>
                <p className="text-xs font-bold text-slate-800">
                  {modalFiles.length > 0 ? `${modalFiles.length} photo(s) selected` : 'Tap to choose photos or videos'}
                </p>
                <p className="text-[11px] text-slate-400">High-res JPEG, Apple HEIC, and 4K MP4</p>
                <input
                  className="hidden"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setModalFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </label>

              {isModalUploading && (
                <div className="p-3 rounded-xl bg-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Compressing and streaming to vault...</span>
                    <span className="text-primary">{modalUploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${modalUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50"
              >
                Cancel
              </button>
              <button
                disabled={isModalUploading}
                onClick={handleModalUpload}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {isModalUploading ? 'Uploading...' : 'Start Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLESSINGS / WISHES MODAL */}
      {isWishesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-black/10 p-6 space-y-4">
            <button
              onClick={() => setIsWishesModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface">
                Send Blessing to the Couple
              </h3>
              <p className="text-xs text-on-surface-variant">
                Your message will appear live on the wedding dashboard marquee.
              </p>
            </div>

            <form onSubmit={handleAddWish} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                  Your Name
                </label>
                <input
                  required
                  placeholder="e.g. Uncle Ramesh"
                  value={newWishAuthor}
                  onChange={(e) => setNewWishAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                  Your Blessing / Message
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Wishing you endless laughter and joy together!"
                  value={newWishText}
                  onChange={(e) => setNewWishText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWishesModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant/40 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm hover:opacity-90"
                >
                  Send Blessing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
