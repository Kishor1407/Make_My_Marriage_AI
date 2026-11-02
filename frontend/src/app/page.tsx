'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';
import api from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();

  // 6-PIN code input boxes state
  const [pinDigits, setPinDigits] = useState(['R', 'A', 'J', 'S', 'I', 'M']);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Marriages loaded dynamically from MongoDB Atlas
  const [marriages, setMarriages] = useState<any[]>([]);

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isConciergeModalOpen, setIsConciergeModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fullCode = pinDigits.join('').toUpperCase();

  // Load real marriages from backend
  useEffect(() => {
    api.get('/marriages')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setMarriages(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Handle single digit PIN changes with auto-focus forward
  const handleDigitChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);

    if (char && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePresetClick = (code: string) => {
    const chars = code.split('').slice(0, 6);
    setPinDigits(chars);
    showToast(`Loaded wedding vault key: ${code}`);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullCode.length >= 4) {
      router.push(`/marriage/${fullCode.toLowerCase()}`);
    } else {
      showToast('Please enter at least 4 passcode characters.');
    }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#0A0A0C] font-sans antialiased min-h-screen flex flex-col selection:bg-[#C81E38] selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-[100] px-4 py-3 rounded-2xl bg-white border border-neutral-200 text-[#0A0A0C] text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in slide-in-from-right-4">
          <AppIcon name="info" size={18} className="text-[#C81E38]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Gateway Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAFA] via-[#FFFFFF] to-[#FAFAFA] border-b border-neutral-200 py-12 md:py-20">
        {/* Subtle Decorative Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[#C81E38]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C81E38]/10 border border-[#C81E38]/30 text-[#C81E38] text-[11px] font-bold uppercase tracking-widest shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C81E38] animate-pulse"></span>
              <span>Exclusive Private Wedding Portal • Pure White &amp; Crimson</span>
            </div>

            {/* Editorial Main Title */}
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-[#0A0A0C] tracking-tight leading-[1.15]">
              Unlock Your Couple&apos;s Private Celebration Vault
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Enter your invitation passkey or scan the dining table acrylic standee QR code to stream ceremonies live, download high-res stationery, and drop candid moments into the family archive.
            </p>
          </div>

          {/* Interactive Vault Unlocker Card & Real-Time Card Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto mt-10">
            {/* Left Box: Passcode Entry (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#C81E38]/10 text-[#C81E38] flex items-center justify-center font-bold text-sm border border-[#C81E38]/20">
                    <AppIcon name="key" size={18} />
                  </span>
                  <div>
                    <h3 className="font-editorial font-bold text-lg text-[#0A0A0C]">VIP Guest Passcode</h3>
                    <p className="text-[11px] text-neutral-500">Found on wedding stationery or table standee</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C81E38] bg-[#C81E38]/10 px-2 py-0.5 rounded border border-[#C81E38]/20">
                  AES-256 Cloud
                </span>
              </div>

              {/* 6 Digit Input Boxes */}
              <form onSubmit={handleUnlock} className="space-y-5">
                <div className="flex justify-between gap-2 sm:gap-3">
                  {pinDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        pinInputRefs.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-editorial uppercase rounded-2xl bg-neutral-50 border-2 border-neutral-200 text-[#0A0A0C] focus:bg-white focus:border-[#C81E38] focus:ring-2 focus:ring-[#C81E38]/20 outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Passcode: <strong className="font-mono text-[#C81E38]">{fullCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setPinDigits(['', '', '', '', '', ''])}
                    className="hover:text-[#C81E38] transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-[#C81E38] hover:bg-[#9E1B32] text-white font-editorial text-base sm:text-lg font-bold tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>Enter Sovereign Celebration Vault</span>
                  <AppIcon name="arrow_forward" size={20} />
                </button>
              </form>

              {/* Sample Passcode Quick Presets */}
              <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Bollywood Celebration Vault Presets:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: 'RAJSIM24', couple: 'Raj & Simran (DDLJ)' },
                    { code: 'LAILAM25', couple: 'Laila & Majnu' },
                    { code: 'HEERRAN26', couple: 'Heer & Ranjha' },
                    { code: 'BUNNYNA27', couple: 'Bunny & Naina (YJHD)' }
                  ].map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => handlePresetClick(p.code)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-[#C81E38] hover:text-white text-[#0A0A0C] text-xs font-semibold border border-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="font-mono font-bold">{p.code}</span>
                      <span className="text-[10px] opacity-75">({p.couple})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Box: Live Standee Visualizer Card (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-500">Live Card View</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Venue Standee
                </span>
              </div>

              {/* Acrylic Standee Preview */}
              {(() => {
                const activeMarriage = marriages.find((m) => m.marriageCode?.toUpperCase() === fullCode) || marriages[0] || {
                  partnerOneName: 'Raj Malhotra',
                  partnerTwoName: 'Simran Singh',
                  marriageCode: 'RAJSIM24',
                  venue: 'The Grand Oberoi Amarvilas, Agra',
                  coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk'
                };
                return (
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md">
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={activeMarriage.coverImage}
                        alt="Wedding Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] uppercase font-bold text-[#FFB3B3] tracking-widest">
                          Live Celebration Standee
                        </span>
                        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white leading-tight">
                          {activeMarriage.partnerOneName} &amp; {activeMarriage.partnerTwoName}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-neutral-500 font-medium">Destination Sanctuary</p>
                        <p className="font-semibold text-[#0A0A0C] mt-0.5">
                          {activeMarriage.venue}
                        </p>
                        <p className="text-[11px] text-[#C81E38] font-bold mt-1">Key: {activeMarriage.marriageCode || fullCode}</p>
                      </div>
                      <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                        <AppIcon name="qr_code_2" size={28} className="text-[#0A0A0C]" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Bottom Quick Triggers */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <AppIcon name="qr_code_scanner" size={16} className="text-[#C81E38]" />
                  <span>Scan Table QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConciergeModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <AppIcon name="support_agent" size={16} className="text-[#C81E38]" />
                  <span>Host Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Active Celebrations Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0A0A0C]">
                Iconic Bollywood Celebrations
              </h2>
              <p className="text-xs text-neutral-600 mt-1">Live streaming, candid guest drops, and cinema-grade celebration vaults.</p>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#0A0A0C] border border-neutral-200 transition-colors w-fit shadow-xs"
            >
              <AppIcon name="add_circle" size={16} className="text-[#C81E38]" />
              <span>Host Admin Portal</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(marriages.length > 0
              ? marriages
              : [
                  {
                    partnerOneName: 'Raj Malhotra',
                    partnerTwoName: 'Simran Singh',
                    marriageCode: 'RAJSIM24',
                    dates: 'October 18–20, 2024',
                    venue: 'The Grand Oberoi Amarvilas, Agra',
                    status: 'Celebrated (Past)',
                    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk',
                    globalStats: { totalPhotos: 5, totalVideos: 1, totalGuestsEngaged: 125 }
                  },
                  {
                    partnerOneName: 'Qais (Majnu)',
                    partnerTwoName: 'Laila',
                    marriageCode: 'LAILAM25',
                    dates: 'November 14–16, 2025',
                    venue: 'The Khyber Himalayan Resort, Gulmarg',
                    status: 'Celebrated (Past)',
                    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc9C1voRVWDpitAXvHixh6nqQ4Fr79mnyuw9Xe3IcAQgZAd-Uv3awiaBCqPc9wnryGg6K_YtjvXw33aS0iPw333R8nNhGrxKssGs9kAEFQutT4sDRp5swxSF4PKKzpyne6cjdxSMvTeL4C-gEgct3msqLoQmVt6GrsyBYVuNDf8XOEWyRE8h2qqZjSVu1Q0NDPzcE68G9R3cAcloU2HG0DmHfapfJmWYtk0quRUrg',
                    globalStats: { totalPhotos: 4, totalVideos: 1, totalGuestsEngaged: 113 }
                  },
                  {
                    partnerOneName: 'Dido Ranjha',
                    partnerTwoName: 'Heer Sial',
                    marriageCode: 'HEERRAN26',
                    dates: 'December 18–20, 2026',
                    venue: 'Umaid Bhawan Palace, Jodhpur',
                    status: 'Live Realtime',
                    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSFCd_cy05beANlWSREfxP3NXg8ctYEY9AVrp-_XUcFVt_w_abbeTJoNmpWgcl8BVyWp4mMIEKmkoQCot9EjdJ8Qctuj_og0TdF89uVPf1ArAbEHmfMvwAjzk11O8dlquI1hLl94jYCQPEmyWg6L3oF39f_dnAAHfgwtKtVrHHwXAxAnTWY3rVge3SuEwTHGpMbYt9YVQpN3S6n00H5ow31iMzhlMSaFkbEID1-jQ',
                    globalStats: { totalPhotos: 4, totalVideos: 1, totalGuestsEngaged: 113 }
                  },
                  {
                    partnerOneName: 'Bunny',
                    partnerTwoName: 'Naina Talwar',
                    marriageCode: 'BUNNYNA27',
                    dates: 'March 24–26, 2027',
                    venue: 'The Oberoi Udaivilas, Udaipur',
                    status: 'Scheduled (Future)',
                    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk',
                    globalStats: { totalPhotos: 5, totalVideos: 1, totalGuestsEngaged: 137 }
                  }
                ]
            ).map((vault: any) => {
              const code = (vault.marriageCode || vault.code || '').toUpperCase();
              const couple = vault.partnerOneName ? `${vault.partnerOneName} & ${vault.partnerTwoName}` : (vault.couple || 'Matrimonial Couple');
              const photosCount = vault.globalStats?.totalPhotos ?? vault.photos ?? 0;
              const videosCount = vault.globalStats?.totalVideos ?? vault.videos ?? 0;
              const guestsCount = vault.globalStats?.totalGuestsEngaged ?? vault.guests ?? 0;
              const coverImg = vault.coverImage || vault.img;

              return (
                <div
                  key={vault._id || vault.id || code}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={coverImg}
                        alt={couple}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C81E38] text-white shadow">
                          {vault.status || 'Active Vault'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-editorial text-lg font-bold text-[#0A0A0C]">{couple}</h3>
                        <span className="font-mono text-xs font-bold text-[#C81E38] bg-[#C81E38]/10 px-2 py-0.5 rounded border border-[#C81E38]/20">
                          {code}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-600">
                        📅 {vault.dates || 'Celebration Schedule'}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 line-clamp-1">
                        <AppIcon name="location_on" size={14} className="text-[#C81E38] shrink-0" />
                        <span className="truncate">{vault.venue}</span>
                      </p>
                      <div className="pt-1.5 flex items-center gap-2 text-[11px] text-neutral-600">
                        <span><strong>{photosCount}</strong> Photos</span>
                        <span>•</span>
                        <span><strong>{videosCount}</strong> Reels</span>
                        <span>•</span>
                        <span><strong>{guestsCount}</strong> Guests</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/marriage/${code.toLowerCase()}`}
                      className="w-full py-2.5 rounded-xl bg-neutral-50 hover:bg-[#C81E38] hover:text-white border border-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Enter Vault</span>
                      <AppIcon name="arrow_forward" size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Standee QR Scanner Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xl relative text-[#0A0A0C]">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black cursor-pointer"
            >
              <AppIcon name="close" size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#C81E38]/10 text-[#C81E38] flex items-center justify-center border border-[#C81E38]/30">
                <AppIcon name="qr_code_scanner" size={20} className="text-[#C81E38]" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#0A0A0C]">Scan Table Standee QR</h3>
                <p className="text-[11px] text-neutral-500">Position camera over your dining table standee card</p>
              </div>
            </div>

            <div className="relative aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden bg-neutral-900 border-2 border-[#C81E38]/60 flex items-center justify-center my-4 group shadow-inner">
              <div className="absolute inset-4 border border-dashed border-white/40 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#C81E38] to-transparent animate-pulse shadow-[0_0_12px_#C81E38]"></div>
              </div>
              <p className="text-xs text-white/60 text-center px-6">Camera Viewfinder Active<br /><span className="text-[10px] text-[#FFB3B3]">Hold steady over table QR code</span></p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-700">Or type 6-character Passcode manually:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  placeholder="e.g. RAHUL24"
                  value={fullCode}
                  onChange={(e) => {
                    const chars = e.target.value.toUpperCase().split('').slice(0, 6);
                    setPinDigits(chars);
                  }}
                  className="flex-1 h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-xl text-center text-sm font-bold tracking-widest text-[#0A0A0C] uppercase focus:outline-none focus:border-[#C81E38] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (fullCode) {
                      router.push(`/marriage/${fullCode.toLowerCase()}`);
                    }
                  }}
                  className="px-4 h-10 rounded-xl bg-[#C81E38] hover:bg-[#9E1B32] text-white text-xs font-bold flex items-center justify-center transition-all shadow-sm cursor-pointer"
                >
                  Unlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concierge Modal */}
      {isConciergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xl relative text-[#0A0A0C]">
            <button
              onClick={() => setIsConciergeModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black cursor-pointer"
            >
              <AppIcon name="close" size={18} />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-xl bg-[#C81E38]/10 text-[#C81E38] flex items-center justify-center">
                <AppIcon name="support_agent" size={18} className="text-[#C81E38]" />
              </span>
              <h3 className="font-editorial text-lg font-bold">Host Concierge Desk</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Need assistance finding your table standee code or connecting to the WebRTC private live feed? Contact the couple&apos;s wedding coordinator.
            </p>
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1 mb-4">
              <p className="font-semibold text-[#0A0A0C]">Emergency Host Hotline</p>
              <p className="text-neutral-500 font-mono">+91 98765 43210 (Desk Table 1)</p>
            </div>
            <button
              onClick={() => setIsConciergeModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#C81E38] text-white text-xs font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-neutral-200 bg-[#FAFAFA] py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-editorial tracking-widest uppercase font-bold text-[#0A0A0C]">Make My Marriage</span>
            <span>• Pure White &amp; Crimson Luxury Wedding Cloud</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-black transition-colors font-medium">
              Host Portal
            </Link>
            <span>•</span>
            <Link href="/guest/upload?code=RAHUL24" className="hover:text-black transition-colors font-medium">
              Venue Photo Dump
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
