'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface WeddingRecord {
  id: string;
  partnerOne: string;
  partnerTwo: string;
  code: string;
  venue: string;
  date: string;
  totalPhotos: number;
  totalVideos: number;
  guestsEngaged: number;
  status: 'live' | 'published' | 'upcoming';
  statusText: string;
}

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'manage'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'archived'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMarriageForManage, setSelectedMarriageForManage] = useState<string>('RAHUL24');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New marriage form state
  const [newPartnerOne, setNewPartnerOne] = useState('');
  const [newPartnerTwo, setNewPartnerTwo] = useState('');
  const [newCustomCode, setNewCustomCode] = useState('');
  const [newVenue, setNewVenue] = useState('');

  // Sample data conforming to Stitch Design
  const [weddings, setWeddings] = useState<WeddingRecord[]>([
    {
      id: '1',
      partnerOne: 'Rahul',
      partnerTwo: 'Anjali',
      code: 'RAHUL24',
      venue: 'The Taj Mahal Palace, Mumbai',
      date: 'Dec 14, 2026',
      totalPhotos: 420,
      totalVideos: 8,
      guestsEngaged: 340,
      status: 'live',
      statusText: 'Live Stream Active'
    },
    {
      id: '2',
      partnerOne: 'Vikram',
      partnerTwo: 'Neha',
      code: 'VIKNEH25',
      venue: 'Umaid Bhawan Palace, Jodhpur',
      date: 'Jan 08, 2027',
      totalPhotos: 1120,
      totalVideos: 14,
      guestsEngaged: 580,
      status: 'published',
      statusText: 'Published'
    },
    {
      id: '3',
      partnerOne: 'Kabir',
      partnerTwo: 'Rhea',
      code: 'KABRHE25',
      venue: 'Wildflower Hall, Shimla',
      date: 'Feb 20, 2027',
      totalPhotos: 85,
      totalVideos: 2,
      guestsEngaged: 95,
      status: 'upcoming',
      statusText: 'Itinerary Drafted'
    }
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateMarriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerOne || !newPartnerTwo) return;

    const generatedCode =
      newCustomCode.trim().toUpperCase() ||
      `${newPartnerOne.slice(0, 3).toUpperCase()}${newPartnerTwo.slice(0, 3).toUpperCase()}26`;

    const newRecord: WeddingRecord = {
      id: String(Date.now()),
      partnerOne: newPartnerOne,
      partnerTwo: newPartnerTwo,
      code: generatedCode,
      venue: newVenue || 'Grand Ballroom, Heritage Hotel',
      date: 'Upcoming',
      totalPhotos: 0,
      totalVideos: 0,
      guestsEngaged: 0,
      status: 'upcoming',
      statusText: 'Itinerary Initialized (6 Events)'
    };

    setWeddings([newRecord, ...weddings]);
    setIsAddModalOpen(false);
    setNewPartnerOne('');
    setNewPartnerTwo('');
    setNewCustomCode('');
    setNewVenue('');
  };

  const filteredWeddings = weddings.filter((w) => {
    const matchesSearch =
      `${w.partnerOne} ${w.partnerTwo} ${w.code} ${w.venue}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'live') return w.status === 'live';
    if (statusFilter === 'upcoming') return w.status === 'upcoming';
    return true;
  });

  return (
    <div className="flex bg-surface min-h-screen text-on-surface font-body-md antialiased">
      {/* SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex-col pt-4 pb-6 border-r border-outline-variant/30">
        <div className="px-6 mb-6 flex items-center gap-space-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
              M
            </div>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Make My Marriage
            </span>
          </Link>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              currentView === 'dashboard'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setCurrentView('manage')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md transition-all ${
              currentView === 'manage'
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">loyalty</span>
            <span>Marriages &amp; Itineraries</span>
          </button>

          <button
            onClick={() => setCurrentView('manage')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">photo_library</span>
            <span>Media Vault &amp; Dump</span>
          </button>

          <button
            onClick={() => setCurrentView('manage')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span>Guest Attribution</span>
          </button>

          <button
            onClick={() => setCurrentView('manage')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">sensors</span>
            <span>Live Broadcasts</span>
          </button>
        </nav>

        {/* Free-tier Storage Footprint Meter */}
        <div className="mx-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between text-caption font-semibold text-on-surface-variant">
            <span>MONGODB M0 FREE TIER</span>
            <span className="text-primary font-mono">512 MB</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '42%' }} />
          </div>
          <p className="text-[11px] text-on-surface-variant leading-tight">
            Client-side image compression protects the free storage quota automatically.
          </p>
        </div>

        {/* Host Profile */}
        <div className="px-4 pt-4 border-t border-outline-variant/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            KH
          </div>
          <div className="flex-1 truncate">
            <p className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
              Kishor Hegge
            </p>
            <p className="text-[11px] text-on-surface-variant truncate">Master Admin (Host)</p>
          </div>
          <Link href="/" className="p-1 text-on-surface-variant hover:text-error transition-colors" title="Exit to Home">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* TOP TOOLBAR */}
        <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* View Switcher Pills */}
            <div className="flex items-center p-1 bg-surface-container rounded-full shadow-inner">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-label-md transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span>Dashboard View</span>
              </button>

              <button
                onClick={() => setCurrentView('manage')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-label-md transition-all ${
                  currentView === 'manage'
                    ? 'bg-surface text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">view_agenda</span>
                <span>Marriages View</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add Marriage</span>
            </button>
          </div>
        </header>

        {/* BODY CONTAINER */}
        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] mx-auto w-full">
          {/* 4 KEY METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Metric 1 */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-start justify-between">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Active Hosted Weddings
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">diamond</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {weddings.length}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +3 this week
                </span>
              </div>
              <div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-start justify-between">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Total Photos Stored
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">photo_library</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  1,625
                </span>
                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  GridFS Stream
                </span>
              </div>
              <div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-start justify-between">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Total Videos Streamed
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">24</span>
                <span className="inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  YouTube Live
                </span>
              </div>
              <div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '90%' }} />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-start justify-between">
                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                  Total Guests Engaged
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">public</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  1,015
                </span>
                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  Attributed
                </span>
              </div>
              <div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary-container h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>

          {/* VIEW SECTION A: DASHBOARD VIEW (TABLE) */}
          {currentView === 'dashboard' && (
            <div className="space-y-4">
              {/* Toolbar Controls */}
              <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-outline-variant/20">
                <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                      search
                    </span>
                    <input
                      className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Search by couple name, code, venue..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                    {(['all', 'live', 'upcoming'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-md text-label-sm font-semibold capitalize transition-all ${
                          statusFilter === status
                            ? 'bg-surface text-primary shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {status} ({status === 'all' ? weddings.length : weddings.filter(w => w.status === status).length})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-outline-variant/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-caption text-caption uppercase tracking-wider">
                        <th className="py-3.5 px-5">Couple Name</th>
                        <th className="py-3.5 px-4">Marriage Code</th>
                        <th className="py-3.5 px-4 text-center">Total Photos</th>
                        <th className="py-3.5 px-4 text-center">Total Videos</th>
                        <th className="py-3.5 px-4 text-center">Guests Engaged</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container text-body-md text-on-surface">
                      {filteredWeddings.map((w) => (
                        <tr key={w.id} className="hover:bg-surface-container-low/60 transition-colors group">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-headline-sm text-headline-sm font-semibold">
                                {w.partnerOne[0]}
                                {w.partnerTwo[0]}
                              </div>
                              <div>
                                <div className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                                  {w.partnerOne} &amp; {w.partnerTwo}
                                </div>
                                <div className="font-caption text-caption text-on-surface-variant">
                                  {w.venue} • {w.date}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => copyToClipboard(w.code)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-primary font-mono text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
                              title="Click to copy code"
                            >
                              <span>{w.code}</span>
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedCode === w.code ? 'check' : 'content_copy'}
                              </span>
                            </button>
                          </td>
                          <td className="py-4 px-4 text-center font-medium">{w.totalPhotos}</td>
                          <td className="py-4 px-4 text-center font-medium">{w.totalVideos}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-secondary">
                              <span className="material-symbols-outlined text-[16px]">groups</span>{' '}
                              {w.guestsEngaged}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                                w.status === 'live'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-surface-container-high text-primary'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  w.status === 'live' ? 'bg-emerald-500 animate-ping' : 'bg-primary'
                                }`}
                              />
                              {w.statusText}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedMarriageForManage(w.code);
                                  setCurrentView('manage');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold hover:opacity-90 transition-opacity"
                              >
                                Manage
                              </button>
                              <Link
                                href={`/marriage/${w.code.toLowerCase()}`}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                                title="Open Guest Dashboard"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  open_in_new
                                </span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW SECTION B: MARRIAGES & TIMELINE MANAGEMENT VIEW */}
          {currentView === 'manage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Managing: Rahul &amp; Anjali ({selectedMarriageForManage})
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    6 Predefined Itinerary Events • Guest Photo Dump Moderation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/guest/upload?code=${selectedMarriageForManage}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">qr_code</span>
                    <span>Test Guest QR Upload</span>
                  </Link>
                  <Link
                    href={`/marriage/${selectedMarriageForManage.toLowerCase()}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>View Guest Dashboard</span>
                  </Link>
                </div>
              </div>

              {/* Six-Part Timeline Event Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { type: 'ENGAGEMENT', title: 'Engagement Ceremony', time: '6:00 PM', venue: 'Crystal Ballroom', photos: 24, icon: 'diamond' },
                  { type: 'MEHNDI', title: 'Mehndi & Sangeet Lounge', time: '3:00 PM', venue: 'Seaside Poolside Lawn', photos: 38, icon: 'spa' },
                  { type: 'HALDI', title: 'Haldi Golden Splash', time: '10:00 AM', venue: 'Courtyard Pavillion', photos: 145, icon: 'wb_sunny', live: true },
                  { type: 'SANGEET', title: 'Sangeet Gala Night', time: '7:30 PM', venue: 'Grand Marquee', photos: 0, icon: 'music_note' },
                  { type: 'MARRIAGE', title: 'Vedic Pheras Wedding', time: '11:00 AM', venue: 'Beachfront Mandap', photos: 0, icon: 'favorite' },
                  { type: 'OTHERS', title: 'Reception & Afterparty', time: '8:00 PM', venue: 'Sky Lounge Deck', photos: 5, icon: 'celebration' }
                ].map((event) => (
                  <div
                    key={event.type}
                    className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">{event.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                            {event.title}
                          </h4>
                          <span className="text-[11px] font-mono text-on-surface-variant font-semibold">
                            {event.type}
                          </span>
                        </div>
                      </div>
                      {event.live && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-on-surface-variant border-t border-surface-container pt-3">
                      <div className="flex items-center justify-between">
                        <span>Time:</span>
                        <strong className="text-on-surface">{event.time}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Venue:</span>
                        <strong className="text-on-surface truncate max-w-[150px]">{event.venue}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Photos Uploaded:</span>
                        <strong className="text-primary font-bold">{event.photos} shots</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guest Photo Dump Moderation Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Recent Guest Uploads (Attributed Media)
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Photos tagged with guest names &amp; emails before upload.
                    </p>
                  </div>
                  <span className="text-xs text-primary font-semibold">All Attributed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    {
                      uploader: 'Pooja Deshmukh',
                      email: 'pooja.d@yahoo.com',
                      time: '8 mins ago',
                      event: 'Haldi',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgSR821Z5DFrfVq4ZndCEw5vqltS24w8TwcY7gFue5-e5qC8A2rCT_F2ojsY-3x1h4wUk-y3CKqpikhPh0nX_fut0r91acPas2Wm6J7SSftru4eCMVbYvsoAZVebwHXsu3uTQVWo92pTQcBe8cpwFW09IL65OwOPqBauUACocVfE-6NWVd6oCemUwQTjokeV9pMxnxCsKiFLHaEiSfQVBdI6s0J6kX8PJv2ruPnAA'
                    },
                    {
                      uploader: 'Ramesh Kulkarni',
                      email: 'ramesh.k@gmail.com',
                      time: '12 mins ago',
                      event: 'Haldi',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXToPktDIvWBZh-n4fPZKZRABxtpV9HSwbb3fpd5yxYMWWT7HNp6PG_wH1MFu4tXzaAsdmpPiUPbdrA5OVKioECHzexLD9HPWasiD9q4RYSFsbeRjwtqRfcpZYoXjzDzW5T5UXK01-6XZYT7hvlDPWadWI3j36Nu1_VmlDudf3Upvv-C4y1DuJ5g7Xvc-xRR-ODdXr5WMJ9BcR_m7H6fsOxMfU5Fz6tmegARyfZMw'
                    },
                    {
                      uploader: 'Dr. Sunita Varma',
                      email: 'sunita.v@apollo.org',
                      time: '24 mins ago',
                      event: 'Mehndi',
                      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrrJp8H5k4Kn9lsGcBSJkIvsyJ0WaekgNeXIJlRo8becUl0yxex3uelYPo8SCGer_N6xS0iKWc0WCpnXo59Eg70UhVYjNdmNaRIPxeQdSzuQBEs2vlCDd-msm3JtTpVwt4jwaqXaVd3EOQSr_foYp6ygVqlNf7E2y1mmzNrvJF6ECLO8U1JkWRb9Eu0Dd6qUh0_eNBjRA-_tB9XnFCUNtrkHV4eKGEp1ZoJEDihBk'
                    }
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] bg-surface-container overflow-hidden">
                        <img
                          alt="Uploaded memory"
                          className="w-full h-full object-cover"
                          src={card.img}
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-on-surface text-[10px] font-bold">
                          {card.time}
                        </span>
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-white text-[10px] font-semibold">
                          {card.event}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div>
                          <div className="font-headline-sm text-sm font-bold text-on-surface">
                            {card.uploader}
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate font-mono">
                            {card.email}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-on-surface">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-3.5 h-3.5 rounded text-primary focus:ring-primary/20 accent-primary"
                            />
                            <span>Slideshow</span>
                          </label>
                          <button
                            type="button"
                            className="text-error hover:text-error-container text-xs font-semibold flex items-center gap-0.5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            Flag / Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD MARRIAGE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-black/10 p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Create New Wedding Profile
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                This will automatically create a unique passcode, QR upload link, and initialize all 6 timeline events.
              </p>
            </div>

            <form onSubmit={handleCreateMarriage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                    Partner 1 Name
                  </label>
                  <input
                    required
                    placeholder="e.g. Rahul"
                    value={newPartnerOne}
                    onChange={(e) => setNewPartnerOne(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                    Partner 2 Name
                  </label>
                  <input
                    required
                    placeholder="e.g. Anjali"
                    value={newPartnerTwo}
                    onChange={(e) => setNewPartnerTwo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                  Custom Passcode (Optional)
                </label>
                <input
                  placeholder="e.g. RAHUL24 (Auto-generated if blank)"
                  value={newCustomCode}
                  onChange={(e) => setNewCustomCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-sm font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                  Venue &amp; City
                </label>
                <input
                  placeholder="e.g. The Taj Mahal Palace, Mumbai"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none text-sm"
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  The 6 events (Engagement, Mehndi, Haldi, Sangeet, Marriage, Others) will be generated automatically.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant/40 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm hover:opacity-90"
                >
                  Create Wedding &amp; 6 Events
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

