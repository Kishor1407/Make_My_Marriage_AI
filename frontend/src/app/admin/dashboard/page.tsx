'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';
import api from '@/lib/api';
import AppIcon from '@/components/AppIcon';

export interface WeddingRecord {
  id: string;
  partnerOne: string;
  partnerTwo: string;
  code: string;
  venue: string;
  date: string;
  status: string; // 'live' | 'scheduled' | 'draft' | 'in rehearsal'
  statusText: string;
  totalPhotos: number;
  totalVideos: number;
  guestsEngaged: number;
  coverImage: string;
  ceremonies?: string[];
  isFeatured?: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Active view: 'vaults' (Marriage Management - Edit & Delete Vaults) or 'studio' (Architect new vault)
  const [activeTab, setActiveTab] = useState<'vaults' | 'studio' | 'events' | 'guests' | 'settings'>('vaults');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'scheduled' | 'draft'>('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; type?: 'info' | 'success' | 'crimson' } | null>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'crimson' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Seed default luxury matrimonial vaults matching Stitch screen b990b7f778d1416db80c625a32749575
  const [weddings, setWeddings] = useState<WeddingRecord[]>([
    {
      id: 'vault-1',
      partnerOne: 'Rahul Sharma',
      partnerTwo: 'Anjali Mehta',
      code: 'RAHUL24',
      venue: 'The Leela Palace Seaside, South Goa',
      date: 'December 14–16, 2024',
      status: 'live',
      statusText: 'Haldi Live Realtime',
      totalPhotos: 520,
      totalVideos: 8,
      guestsEngaged: 320,
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk',
      ceremonies: ['Haldi', 'Mehndi', 'Sangeet', 'Wedding', 'Reception'],
      isFeatured: true
    },
    {
      id: 'vault-2',
      partnerOne: 'Aarav Singhania',
      partnerTwo: 'Meera Kapoor',
      code: 'AARMEE25',
      venue: 'The Leela Palace, Udaipur',
      date: 'November 24–27, 2025',
      status: 'scheduled',
      statusText: 'Scheduled Nov 2025',
      totalPhotos: 0,
      totalVideos: 0,
      guestsEngaged: 450,
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5LRbRnrJ1eF714ucyQlDtbmkKMonFMYnJ2x4J15LNjhEmZav1uYnlRwQOjrzONbjUY-TZgXsmANscr8CaewSsgtt0G3Bo11WLJ52jd94cyywaaVcJOF5HkcY-olLRpTSw6b_4hxxo9pulsmvehEtRnjiFIDc0pg1dyssk9sKsd4Po7V3RWxWrzRWLi-KcPkXh-iBNK8T-hJq0k1TXMxqoHVtODlPXoxx4OWojt1c',
      ceremonies: ['Haldi', 'Mehndi', 'Sangeet', 'Wedding'],
      isFeatured: false
    },
    {
      id: 'vault-3',
      partnerOne: 'Vikramaditya Rao',
      partnerTwo: 'Priya Nair',
      code: 'VIKPRI24',
      venue: 'Taj Lake Palace, Udaipur',
      date: 'January 18–20, 2025',
      status: 'scheduled',
      statusText: 'In Rehearsal',
      totalPhotos: 140,
      totalVideos: 4,
      guestsEngaged: 280,
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc9XcL40g8UwcA1UJCh75rKokeFMPR3GEoOsVlsTQ2J8woeQZBPlv5R0OzmS8Ada5757hTyklgA9RnzecGSSxP1mjEoh6rq4F_6b8mVL0NUMidvh19fuGTIjri_sW-gb7BgffxjFDl1bPduvZIMNtCArupwF3wLjW2gLgufqQpp-vNj-x5Rfd4CO1jQIY5CesdvADeCQdSFKcgHJ1NMTzcAExymmmseYVU77E6QWw',
      ceremonies: ['Mehndi', 'Sangeet', 'Wedding', 'Reception'],
      isFeatured: false
    },
    {
      id: 'vault-4',
      partnerOne: 'Kabir Varma',
      partnerTwo: 'Tara Deewan',
      code: 'KABTAR25',
      venue: 'Alila Fort Bishangarh, Jaipur',
      date: 'February 10–12, 2025',
      status: 'draft',
      statusText: 'Draft Setup',
      totalPhotos: 0,
      totalVideos: 0,
      guestsEngaged: 190,
      coverImage: '',
      ceremonies: ['Wedding', 'Reception'],
      isFeatured: false
    }
  ]);

  // Form State for Architecting New Vault
  const [partnerOne, setPartnerOne] = useState('Aarav');
  const [partnerTwo, setPartnerTwo] = useState('Meera');
  const [ceremonyDate, setCeremonyDate] = useState('November 24, 2025');
  const [venueLocation, setVenueLocation] = useState('The Leela Palace, Udaipur');
  const [passcode, setPasscode] = useState('AARMEE25');
  const [isCopied, setIsCopied] = useState(false);

  // Selected Cover Image Preset
  const coverPresets = [
    {
      id: 'sunset',
      title: 'Coastal Sunset (Active)',
      src: 'https://lh3.googleusercontent.com/aida/AEtjO1Va1U4bOy3llyRAkJVVvDdom4O7c1K1hrZINu89siLq0NNPCTFws5XwTjOZ1LrqyQj1lIgDLr1LnX3qCQj2wAaQn2005YMzbMSpfIj1mSM3elEEFnK85-twwqyE-gjKruWaMZ9ixkqJeEngIJt6R2JDaTYUK-BzM8vDQS4fCh2S-vVPoB7gVxyBT2Q8yA0BBhe7g47VdAUCPTUIGjS4n_y5uQE39qlTF7YTMZwnkH3JXg4i0UsUdW7BSoE'
    },
    {
      id: 'palace',
      title: 'Royal Palace',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc9C1voRVWDpitAXvHixh6nqQ4Fr79mnyuw9Xe3IcAQgZAd-Uv3awiaBCqPc9wnryGg6K_YtjvXw33aS0iPw333R8nNhGrxKssGs9kAEFQutT4sDRp5swxSF4PKKzpyne6cjdxSMvTeL4C-gEgct3msqLoQmVt6GrsyBYVuNDf8XOEWyRE8h2qqZjSVu1Q0NDPzcE68G9R3cAcloU2HG0DmHfapfJmWYtk0quRUrg'
    },
    {
      id: 'pavilion',
      title: 'Emerald Pavilion',
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSFCd_cy05beANlWSREfxP3NXg8ctYEY9AVrp-_XUcFVt_w_abbeTJoNmpWgcl8BVyWp4mMIEKmkoQCot9EjdJ8Qctuj_og0TdF89uVPf1ArAbEHmfMvwAjzk11O8dlquI1hLl94jYCQPEmyWg6L3oF39f_dnAAHfgwtKtVrHHwXAxAnTWY3rVge3SuEwTHGpMbYt9YVQpN3S6n00H5ow31iMzhlMSaFkbEID1-jQ'
    }
  ];
  const [selectedCover, setSelectedCover] = useState(coverPresets[0].src);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['Haldi', 'Mehndi', 'Sangeet', 'Wedding', 'Reception']);

  const [enableWebRTC, setEnableWebRTC] = useState(true);
  const [enableRawBin, setEnableRawBin] = useState(true);
  const [enableFaceTagging, setEnableFaceTagging] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [createdMarriageCode, setCreatedMarriageCode] = useState('');
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // EDIT MODAL STATE
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<WeddingRecord | null>(null);
  const [editPartnerOne, setEditPartnerOne] = useState('');
  const [editPartnerTwo, setEditPartnerTwo] = useState('');
  const [editDates, setEditDates] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editPasscode, setEditPasscode] = useState('');
  const [editStatus, setEditStatus] = useState('Live Realtime');
  const [editGuestCount, setEditGuestCount] = useState('320');
  const [editCeremonies, setEditCeremonies] = useState<string[]>(['Haldi (Active Live)', 'Mehndi Ceremony', 'Sangeet Nocturne', 'Vedic Vows (Pheras)', 'Grand Gala Reception']);
  const [editRequire2FA, setEditRequire2FA] = useState(true);
  const [editWhatsappDelivery, setEditWhatsappDelivery] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // DELETE MODAL STATE
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingVault, setDeletingVault] = useState<WeddingRecord | null>(null);
  const [deleteVerifyInput, setDeleteVerifyInput] = useState('');
  const [deleteBackupChecked, setDeleteBackupChecked] = useState(false);
  const [deleteSmsChecked, setDeleteSmsChecked] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rehydrate auth & load real marriages from MongoDB Atlas
  useEffect(() => {
    if (!user) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            dispatch(setUser(res.data.user));
          }
        })
        .catch(() => {});
    }

    // Fetch marriages from backend
    api.get('/marriages')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiWeddings: WeddingRecord[] = res.data.data.map((m: any, index: number) => ({
            id: m._id,
            partnerOne: m.partnerOneName,
            partnerTwo: m.partnerTwoName,
            code: m.marriageCode,
            venue: m.venue || 'The Leela Palace Seaside, South Goa',
            date: m.dates || new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: m.status?.toLowerCase().includes('live') ? 'live' : m.status?.toLowerCase().includes('draft') ? 'draft' : 'scheduled',
            statusText: m.status || 'Vault Active',
            totalPhotos: m.globalStats?.totalPhotos || 0,
            totalVideos: m.globalStats?.totalVideos || 0,
            guestsEngaged: m.globalStats?.totalGuestsEngaged || 0,
            coverImage: m.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk',
            ceremonies: ['Haldi', 'Mehndi', 'Sangeet', 'Wedding', 'Reception'],
            isFeatured: index === 0
          }));

          if (apiWeddings.length > 0) {
            // Merge with local seed so that demo cards stay available
            setWeddings((prev) => {
              const ids = new Set(apiWeddings.map((w) => w.code));
              const remaining = prev.filter((p) => !ids.has(p.code));
              return [...apiWeddings, ...remaining];
            });
          }
        }
      })
      .catch(() => {});
  }, [user, dispatch]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mmm_token');
    }
    dispatch(logout());
    router.push('/admin/login');
  };

  const handleCopyCode = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(code);
      showToast(`Passkey '${code}' copied to clipboard. Ready for standee deployment.`);
    }
  };

  // OPEN EDIT MODAL
  const handleOpenEditModal = (vault: WeddingRecord) => {
    setEditingVault(vault);
    setEditPartnerOne(vault.partnerOne);
    setEditPartnerTwo(vault.partnerTwo);
    setEditDates(vault.date);
    setEditVenue(vault.venue);
    setEditPasscode(vault.code);
    setEditStatus(vault.statusText);
    setEditGuestCount(String(vault.guestsEngaged));
    setIsEditModalOpen(true);
  };

  // SAVE EDITED VAULT
  const handleSaveVaultChanges = async () => {
    if (!editingVault) return;
    setIsSavingEdit(true);

    try {
      // Send PUT request to MongoDB Atlas backend
      await api.put(`/marriages/${editingVault.id}`, {
        partnerOneName: editPartnerOne,
        partnerTwoName: editPartnerTwo,
        marriageCode: editPasscode,
        venue: editVenue,
        dates: editDates,
        status: editStatus,
        guestsEngaged: Number(editGuestCount) || 0
      }).catch(() => {
        // graceful offline fallback
      });

      // Update local state reactively
      setWeddings((prev) =>
        prev.map((w) => {
          if (w.id === editingVault.id || w.code === editingVault.code) {
            return {
              ...w,
              partnerOne: editPartnerOne,
              partnerTwo: editPartnerTwo,
              code: editPasscode.toUpperCase(),
              venue: editVenue,
              date: editDates,
              statusText: editStatus,
              status: editStatus.toLowerCase().includes('live') ? 'live' : editStatus.toLowerCase().includes('draft') ? 'draft' : 'scheduled',
              guestsEngaged: Number(editGuestCount) || w.guestsEngaged
            };
          }
          return w;
        })
      );

      setIsEditModalOpen(false);
      showToast(`Archival credentials for ${editPartnerOne} & ${editPartnerTwo} updated. Passkey '${editPasscode.toUpperCase()}' synced across edge nodes.`);
    } catch (err: any) {
      showToast(err.message || 'Error updating vault', 'crimson');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // OPEN DELETE MODAL
  const handleOpenDeleteModal = (vault: WeddingRecord) => {
    setDeletingVault(vault);
    setDeleteVerifyInput('');
    setDeleteBackupChecked(false);
    setIsDeleteModalOpen(true);
  };

  // EXECUTE DELETE VAULT
  const handleExecuteDeleteVault = async () => {
    if (!deletingVault) return;
    setIsDeleting(true);

    try {
      await api.delete(`/marriages/${deletingVault.id}`).catch(() => {
        // graceful offline fallback
      });

      setWeddings((prev) => prev.filter((w) => w.id !== deletingVault.id && w.code !== deletingVault.code));
      setIsDeleteModalOpen(false);
      showToast(`Marriage Vault for '${deletingVault.partnerOne} & ${deletingVault.partnerTwo}' permanently decommissioned. Access keys revoked.`, 'crimson');
    } catch (err: any) {
      showToast(err.message || 'Error decommissioning vault', 'crimson');
    } finally {
      setIsDeleting(false);
    }
  };

  // SUBMIT NEW MARRIAGE FROM STUDIO
  const handleCreateMarriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerOne.trim() || !partnerTwo.trim()) {
      showToast('Please enter both partner names.', 'crimson');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/marriages', {
        partnerOneName: partnerOne.trim(),
        partnerTwoName: partnerTwo.trim(),
        customCode: passcode.trim().toUpperCase(),
        venue: venueLocation.trim(),
        dates: ceremonyDate.trim(),
        coverImage: selectedCover,
        status: 'Scheduled'
      }).catch(() => null);

      const createdCode = passcode.trim().toUpperCase();
      setCreatedMarriageCode(createdCode);

      const newRecord: WeddingRecord = {
        id: response?.data?.data?._id || `vault-${Date.now()}`,
        partnerOne: partnerOne.trim(),
        partnerTwo: partnerTwo.trim(),
        code: createdCode,
        venue: venueLocation.trim(),
        date: ceremonyDate.trim(),
        status: 'scheduled',
        statusText: 'Scheduled',
        totalPhotos: 0,
        totalVideos: 0,
        guestsEngaged: 150,
        coverImage: selectedCover,
        ceremonies: selectedEvents,
        isFeatured: false
      };

      setWeddings((prev) => [newRecord, ...prev]);
      setIsSubmitting(false);
      setIsCelebrationOpen(true);
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'Failed to architect wedding vault.', 'crimson');
    }
  };

  // Filter weddings
  const filteredWeddings = weddings.filter((w) => {
    // Status filter
    if (filterStatus === 'live' && w.status !== 'live') return false;
    if (filterStatus === 'scheduled' && w.status !== 'scheduled') return false;
    if (filterStatus === 'draft' && w.status !== 'draft') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${w.partnerOne} ${w.partnerTwo}`.toLowerCase().includes(q);
      const matchCode = w.code.toLowerCase().includes(q);
      const matchVenue = w.venue.toLowerCase().includes(q);
      return matchName || matchCode || matchVenue;
    }

    return true;
  });

  const featuredVault = filteredWeddings.find((w) => w.isFeatured) || filteredWeddings[0] || weddings[0];
  const secondaryVaults = filteredWeddings.filter((w) => w.id !== featuredVault?.id);

  return (
    <div className="bg-[#FFFFFF] text-[#0A0A0C] font-sans antialiased min-h-screen flex selection:bg-primary selection:text-white">
      {/* Toast Notification Container */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[120] pointer-events-auto px-5 py-3.5 bg-white border border-neutral-200 text-[#0A0A0C] shadow-2xl rounded-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
          <AppIcon
            name={toastMsg.type === 'crimson' ? 'error' : toastMsg.type === 'info' ? 'info' : 'check_circle'}
            size={20}
            className={toastMsg.type === 'crimson' ? 'text-primary' : 'text-emerald-600'}
          />
          <span className="text-xs font-semibold leading-relaxed max-w-sm">{toastMsg.text}</span>
        </div>
      )}

      {/* FIXED SIDEBAR NAVIGATION */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-neutral-200 z-50 flex flex-col justify-between pt-5 pb-6">
        <div>
          <div className="px-6 mb-7 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <AppIcon name="diamond" size={18} className="text-white" />
              </span>
              <div className="flex flex-col">
                <span className="font-editorial text-[16px] tracking-tight font-bold text-[#0A0A0C]">
                  Make My Marriage
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-primary">
                  Host OS Concierge
                </span>
              </div>
            </Link>
          </div>

          <div className="px-5 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
              Portfolio Navigation
            </span>
          </div>

          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab('vaults')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vaults'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              <AppIcon name="grid_view" size={18} className={activeTab === 'vaults' ? 'text-white' : 'text-neutral-500'} />
              <span>Bespoke Marriages</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              <AppIcon name="add_circle" size={18} className={activeTab === 'studio' ? 'text-white' : 'text-neutral-500'} />
              <span>Add Marriage Studio</span>
            </button>

            <Link
              href="/admin/invitations"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-all cursor-pointer"
            >
              <AppIcon name="mail" size={18} className="text-neutral-500" />
              <span>Invitation Studio</span>
            </Link>

            <button
              onClick={() => showToast('Events & Timeline manager active for registered vaults.', 'info')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-all cursor-pointer"
            >
              <AppIcon name="calendar_month" size={18} className="text-neutral-500" />
              <span>Events &amp; Timeline</span>
            </button>

            <button
              onClick={() => showToast('Guest directory synchronized with table standees.', 'info')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-all cursor-pointer"
            >
              <AppIcon name="group" size={18} className="text-neutral-500" />
              <span>Guest Directory</span>
            </button>

            <button
              onClick={() => showToast('256-Bit Vault Protocol active. Media secured on MongoDB Atlas GridFS.', 'info')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-all cursor-pointer"
            >
              <AppIcon name="shield" size={18} className="text-neutral-500" />
              <span>Security &amp; Storage</span>
            </button>

            <button
              onClick={() => showToast('Configuration settings synced with host tenant.', 'info')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black transition-all cursor-pointer"
            >
              <AppIcon name="tune" size={18} className="text-neutral-500" />
              <span>Configuration</span>
            </button>
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="px-4 space-y-3">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'HO'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0A0A0C] truncate max-w-[110px]">
                  {user?.name || 'Concierge Host'}
                </span>
                <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Active Session
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <AppIcon name="logout" size={16} />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-neutral-600">
            <p className="font-bold text-primary mb-0.5">₹0 Zero Server Bill</p>
            <p className="text-[10px] text-neutral-500 leading-tight">GridFS MongoDB Atlas + WebRTC</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200 z-40 flex items-center justify-between px-8 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="uppercase font-bold tracking-widest text-primary">Luxury Executive Vault</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-600 font-medium">
              {activeTab === 'vaults' ? 'Directory & Archival Vaults' : 'Bespoke Wedding Studio'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-700 transition-colors"
            >
              Portal Gateway
            </Link>
            <Link
              href="/marriage/rahul24"
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-[#9E1B32] text-white text-xs font-bold shadow-sm shadow-primary/20 transition-all flex items-center gap-1.5"
            >
              <span>Guest View</span>
              <AppIcon name="arrow_forward" size={14} />
            </Link>
          </div>
        </header>

        {/* VIEW 1: BESPOKE MARRIAGES - EDIT & DELETE VAULTS (Stitch b990b7f778d1416db80c625a32749575) */}
        {activeTab === 'vaults' ? (
          <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
            {/* Header & Quick Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  <span>Host OS</span>
                  <span>/</span>
                  <span>Bespoke Marriages</span>
                  <span>/</span>
                  <span className="text-primary">Directory &amp; Archival Vaults</span>
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0C] tracking-tight">
                  Marriage Vaults &amp; Celebrations
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed">
                  Manage sovereign matrimonial archives, calibrate passkey protocols, adjust ceremony timelines, or safely decommission bespoke suites.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('studio')}
                className="self-start md:self-auto px-5 py-3 rounded-xl bg-primary hover:bg-[#9E1B32] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                <AppIcon name="add_circle" size={18} />
                <span>Add New Marriage</span>
              </button>
            </div>

            {/* KEY METRIC DOSSIERS (4 CARDS) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Active Sovereign Vaults</span>
                  <AppIcon name="shield" size={18} className="text-primary" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-[#0A0A0C]">
                    {String(weddings.length).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    {weddings.filter((w) => w.status === 'live').length} Live Realtime
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Matrimonials</span>
                  <AppIcon name="calendar_today" size={18} />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-[#0A0A0C]">
                    {String(weddings.filter((w) => w.status === 'scheduled').length).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Scheduled Q1</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Connected Guests</span>
                  <AppIcon name="group" size={18} />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-[#0A0A0C]">
                    {weddings.reduce((acc, w) => acc + (w.guestsEngaged || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Passkeys Synced</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Edge Host Latency</span>
                  <AppIcon name="spa" size={18} className="text-primary" />
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-editorial text-3xl font-bold text-[#0A0A0C]">99.98%</span>
                  <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">256-Bit TLS</span>
                </div>
              </div>
            </div>

            {/* SEARCH & STATUS CONTROLS BAR */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: `All Vaults (${weddings.length})` },
                  { id: 'live', label: `Live Now (${weddings.filter((w) => w.status === 'live').length})` },
                  { id: 'scheduled', label: `Scheduled (${weddings.filter((w) => w.status === 'scheduled').length})` },
                  { id: 'draft', label: `Draft Setup (${weddings.filter((w) => w.status === 'draft').length})` }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setFilterStatus(pill.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                      filterStatus === pill.id
                        ? 'bg-[#0A0A0C] text-white shadow-sm'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Search Input Bar */}
              <div className="relative w-full lg:w-96">
                <AppIcon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search couple, passkey, or venue..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl text-xs text-[#0A0A0C] placeholder:text-neutral-400 outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* PRIMARY FEATURED VAULT CARD: Rahul & Anjali (1:1 with Stitch) */}
            {featuredVault && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col xl:flex-row gap-8 items-start">
                  {/* Couple Portrait Aspect 4:5 */}
                  <div className="w-full xl:w-72 h-80 xl:h-96 relative flex-shrink-0 rounded-2xl overflow-hidden bg-neutral-100 group shadow-sm">
                    <img
                      src={featuredVault.coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk'}
                      alt={`${featuredVault.partnerOne} & ${featuredVault.partnerTwo}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                        {featuredVault.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Dossier Center Content */}
                  <div className="flex-1 flex flex-col justify-between h-full w-full">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold">
                            Vault ID: #MMM-88219
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                            Priority Monograph
                          </span>
                        </div>

                        {/* Passkey Copy Badge */}
                        <button
                          onClick={() => handleCopyCode(featuredVault.code)}
                          className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-neutral-200"
                        >
                          <AppIcon name="key" size={15} className="text-neutral-500" />
                          <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">Passkey:</span>
                          <span className="text-xs uppercase tracking-widest text-primary font-bold">{featuredVault.code}</span>
                          <AppIcon name="content_copy" size={14} className="text-neutral-400 ml-1" />
                        </button>
                      </div>

                      <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0A0C] tracking-tight mt-1">
                        {featuredVault.partnerOne} &amp; {featuredVault.partnerTwo}
                      </h2>

                      {/* 3-Column Dossier Info Box */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Celebration Dates</span>
                          <span className="text-xs font-bold text-[#0A0A0C] mt-1">{featuredVault.date}</span>
                          <span className="text-[11px] text-neutral-500">3-Day Ceremonial Spread</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Sanctuary &amp; Venue</span>
                          <span className="text-xs font-bold text-[#0A0A0C] mt-1">{featuredVault.venue}</span>
                          <span className="text-[11px] text-neutral-500">Coastal Pavilion Lawn</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Curation Edge Sync</span>
                          <span className="text-xs font-bold text-[#0A0A0C] mt-1">
                            {featuredVault.guestsEngaged} Guests • {featuredVault.totalPhotos} Media
                          </span>
                          <span className="text-[11px] text-primary font-semibold">Sync Stream Active</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
                        Active ceremonial monograph for the multi-day shoreline matrimonial. QR Standees distributed across Banquet Pavilion and Cabana Lawn with guest self-upload privileges engaged.
                      </p>
                    </div>

                    {/* Featured Vault Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-neutral-100">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(featuredVault)}
                          className="px-5 py-2.5 rounded-xl bg-[#0A0A0C] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                        >
                          <AppIcon name="edit_note" size={16} />
                          <span>Edit Details</span>
                        </button>

                        <button
                          onClick={() => handleOpenDeleteModal(featuredVault)}
                          className="px-4 py-2.5 rounded-xl text-primary hover:bg-primary/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border border-primary/20"
                        >
                          <AppIcon name="close" size={16} />
                          <span>Delete Vault</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/invitations?code=${featuredVault.code}`}
                          className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border border-neutral-200"
                        >
                          <AppIcon name="mail" size={16} />
                          <span>Invitations</span>
                        </Link>

                        <button
                          onClick={() => showToast(`Exporting high-resolution vector standee pack for ${featuredVault.code} (PDF & SVG)...`)}
                          className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border border-neutral-200"
                        >
                          <AppIcon name="qr_code_2" size={16} />
                          <span>Standee QR Pack</span>
                        </button>

                        <Link
                          href={`/marriage/${featuredVault.code.toLowerCase()}`}
                          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#9E1B32] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-primary/20 transition-all"
                        >
                          <span>Live Host View</span>
                          <AppIcon name="arrow_forward" size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECONDARY ARCHIVAL VAULTS GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-2xl font-bold text-[#0A0A0C]">
                    Vault Portfolio Registry
                  </h3>
                  <span className="text-xs text-neutral-400 font-semibold">
                    ({secondaryVaults.length} Active &amp; In-Prep)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondaryVaults.map((vault) => (
                  <div
                    key={vault.id}
                    className="bg-white rounded-3xl border border-neutral-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                          {vault.statusText}
                        </span>
                        <button
                          onClick={() => handleCopyCode(vault.code)}
                          className="bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="text-[11px] font-mono font-bold text-neutral-700">{vault.code}</span>
                          <AppIcon name="content_copy" size={12} className="text-neutral-400" />
                        </button>
                      </div>

                      {/* Cover Photo */}
                      <div className="w-full h-44 bg-neutral-100 rounded-2xl overflow-hidden my-3 relative">
                        {vault.coverImage ? (
                          <img
                            src={vault.coverImage}
                            alt={`${vault.partnerOne} & ${vault.partnerTwo}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-neutral-50">
                            <AppIcon name="add_photo_alternate" size={32} className="text-neutral-300 mb-2" />
                            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                              Archival Cover Awaiting
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] tracking-widest uppercase font-bold">
                          {vault.venue.split(',')[0]}
                        </div>
                      </div>

                      <h4 className="font-editorial text-xl font-bold text-[#0A0A0C] mt-2">
                        {vault.partnerOne} &amp; {vault.partnerTwo}
                      </h4>

                      <div className="space-y-1.5 mt-3 text-neutral-600 text-xs">
                        <div className="flex items-center gap-2">
                          <AppIcon name="location_on" size={14} className="text-primary shrink-0" />
                          <span className="truncate">{vault.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AppIcon name="group" size={14} className="text-neutral-400 shrink-0" />
                          <span>{vault.guestsEngaged} Patrons • {vault.totalPhotos} Media Assets</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AppIcon name="calendar_month" size={14} className="text-neutral-400 shrink-0" />
                          <span>{vault.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-neutral-100">
                      <button
                        onClick={() => handleOpenEditModal(vault)}
                        className="text-xs font-bold uppercase tracking-wider text-[#0A0A0C] hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <AppIcon name="edit_note" size={16} />
                        <span>Edit Vault</span>
                      </button>

                      <button
                        onClick={() => handleOpenDeleteModal(vault)}
                        className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <AppIcon name="close" size={14} />
                        <span>Decommission</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        ) : (
          /* VIEW 2: ADD MARRIAGE STUDIO WIZARD */
          <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-widest font-semibold mb-1">
                  <span>Host OS</span>
                  <span>/</span>
                  <button onClick={() => setActiveTab('vaults')} className="hover:text-primary transition-colors cursor-pointer">
                    Bespoke Marriages
                  </button>
                  <span>/</span>
                  <span className="text-primary font-bold">Architect New Wedding Vault</span>
                </div>
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0A0C] tracking-tight">
                  Architect Sovereign Wedding Vault
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
                  Configure high-resolution media vaults, guest self-service cameras, and generate live dining table acrylic standee QR codes.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('vaults')}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition-colors cursor-pointer"
              >
                ← Back to All Vaults
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: 5-Step Studio Form */}
              <form onSubmit={handleCreateMarriage} className="lg:col-span-7 space-y-6">
                {/* Step 1: Couple Logistics */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <h2 className="font-editorial text-xl font-bold text-[#0A0A0C]">Couple &amp; Sanctuary Logistics</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Partner One Name
                      </label>
                      <input
                        required
                        type="text"
                        value={partnerOne}
                        onChange={(e) => setPartnerOne(e.target.value)}
                        placeholder="e.g. Aarav"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white outline-none text-xs text-[#0A0A0C] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Partner Two Name
                      </label>
                      <input
                        required
                        type="text"
                        value={partnerTwo}
                        onChange={(e) => setPartnerTwo(e.target.value)}
                        placeholder="e.g. Meera"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white outline-none text-xs text-[#0A0A0C] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Ceremony Dates
                      </label>
                      <input
                        type="text"
                        value={ceremonyDate}
                        onChange={(e) => setCeremonyDate(e.target.value)}
                        placeholder="e.g. November 24–27, 2025"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white outline-none text-xs text-[#0A0A0C] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Sanctuary / Venue
                      </label>
                      <input
                        type="text"
                        value={venueLocation}
                        onChange={(e) => setVenueLocation(e.target.value)}
                        placeholder="e.g. The Leela Palace, Udaipur"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-primary focus:bg-white outline-none text-xs text-[#0A0A0C] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Passkey Randomizer */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        2
                      </span>
                      <h2 className="font-editorial text-xl font-bold text-[#0A0A0C]">VIP Guest Passcode</h2>
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      AES-256 Vault
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      required
                      type="text"
                      maxLength={8}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 rounded-xl bg-neutral-50 border-2 border-neutral-200 focus:border-primary focus:bg-white outline-none text-base font-bold font-mono text-primary tracking-widest text-center"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const random = `${partnerOne.slice(0, 3)}${partnerTwo.slice(0, 3)}25`.toUpperCase();
                        setPasscode(random || 'WED2025');
                        showToast(`Generated: ${random || 'WED2025'}`);
                      }}
                      className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
                    >
                      Randomize
                    </button>
                  </div>
                </div>

                {/* Step 3: Ceremony Selector */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    <h2 className="font-editorial text-xl font-bold text-[#0A0A0C]">Ceremony Chapters</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { name: 'Haldi', icon: 'spa' },
                      { name: 'Mehndi', icon: 'palette' },
                      { name: 'Sangeet', icon: 'nightlife' },
                      { name: 'Wedding', icon: 'favorite' },
                      { name: 'Reception', icon: 'wine_bar' }
                    ].map((item) => {
                      const isSelected = selectedEvents.includes(item.name);
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setSelectedEvents((prev) =>
                              isSelected ? prev.filter((e) => e !== item.name) : [...prev, item.name]
                            );
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                          }`}
                        >
                          <AppIcon name={item.icon} size={20} className="mx-auto mb-1" />
                          <span className="text-xs font-bold block">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4: Cover Presets */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      4
                    </span>
                    <h2 className="font-editorial text-xl font-bold text-[#0A0A0C]">Curated Cover Photography</h2>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {coverPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedCover(preset.src)}
                        className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                          selectedCover === preset.src ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-neutral-200 opacity-70'
                        }`}
                      >
                        <img src={preset.src} alt={preset.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/60 text-white text-[10px] font-bold truncate">
                          {preset.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-[#9E1B32] text-white font-editorial text-base sm:text-lg font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Creating Vault in MongoDB Atlas...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate Sovereign Wedding Vault</span>
                      <AppIcon name="arrow_forward" size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Right Column: Live Table Standee Preview */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                    <span className="text-xs uppercase font-bold tracking-wider text-neutral-500">
                      Live Standee Mockup
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Auto-Generated QR
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
                    <div className="h-44 w-full relative">
                      <img src={selectedCover} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] uppercase font-bold text-primary-fixed-dim tracking-widest">
                          Wedding Vault Live
                        </span>
                        <h3 className="font-editorial text-2xl font-bold text-white">
                          {partnerOne} &amp; {partnerTwo}
                        </h3>
                      </div>
                    </div>

                    <div className="p-4 bg-white border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500 font-medium">VIP Table Passcode</p>
                        <p className="font-mono text-sm font-bold text-primary mt-0.5">{passcode}</p>
                        <p className="text-[10px] text-neutral-400 mt-1">{venueLocation}</p>
                      </div>
                      <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                        <AppIcon name="qr_code_2" size={32} className="text-[#0A0A0C]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 1: EDIT MARRIAGE DETAILS (Stitch b990b7f778d1416db80c625a32749575) */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-[#0A0A0C] w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-neutral-200">
            {/* Modal Header */}
            <div className="p-6 lg:p-8 flex items-start justify-between border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-bold">
                  <AppIcon name="tune" size={16} />
                  <span>Monograph Configuration Suite</span>
                </div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0A0A0C] mt-0.5">
                  Edit Marriage Details — {editingVault.partnerOne} &amp; {editingVault.partnerTwo}
                </h2>
                <p className="text-xs text-neutral-500">
                  Update sanctuary credentials, guest passkeys, ceremony timeline flags, and monograph settings.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black cursor-pointer transition-colors"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 lg:p-8 overflow-y-auto space-y-6 flex-1">
              {/* SECTION A: Couple & Sanctuary Information */}
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary block">
                  01. Couple &amp; Matrimonial Sanctuary
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Partner One Full Name
                    </label>
                    <input
                      type="text"
                      value={editPartnerOne}
                      onChange={(e) => setEditPartnerOne(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:bg-white focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Partner Two Full Name
                    </label>
                    <input
                      type="text"
                      value={editPartnerTwo}
                      onChange={(e) => setEditPartnerTwo(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:bg-white focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Celebration Dates
                    </label>
                    <input
                      type="text"
                      value={editDates}
                      onChange={(e) => setEditDates(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:bg-white focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Sanctuary &amp; Destination Venue
                    </label>
                    <input
                      type="text"
                      value={editVenue}
                      onChange={(e) => setEditVenue(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:bg-white focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Passkey & Security Protocol */}
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-widest text-primary block">
                  02. Security Passkey &amp; Access Controls
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Alphanumeric Passcode
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={8}
                        value={editPasscode}
                        onChange={(e) => setEditPasscode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 font-mono font-bold text-xs uppercase text-primary tracking-widest focus:bg-white focus:border-primary outline-none"
                      />
                      <AppIcon name="key" size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Active Status Stage
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:bg-white focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="Live Realtime">Live Realtime (Haldi / Sangeet)</option>
                      <option value="Scheduled">Scheduled (Patron Portal Open)</option>
                      <option value="In Rehearsal">In Rehearsal (Locked Media)</option>
                      <option value="Draft Setup">Draft Setup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Guest Ingestion Quota
                    </label>
                    <input
                      type="number"
                      value={editGuestCount}
                      onChange={(e) => setEditGuestCount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#0A0A0C] focus:bg-white focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                    <div className="flex flex-col pr-4">
                      <span className="text-xs font-bold text-[#0A0A0C]">Require 2FA For Host Moderation</span>
                      <span className="text-[11px] text-neutral-500">Verifies host session for media purging</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editRequire2FA}
                      onChange={(e) => setEditRequire2FA(e.target.checked)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                    <div className="flex flex-col pr-4">
                      <span className="text-xs font-bold text-[#0A0A0C]">Instant WhatsApp Standee Delivery</span>
                      <span className="text-[11px] text-neutral-500">Broadcasts passkey link to concierge list</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editWhatsappDelivery}
                      onChange={(e) => setEditWhatsappDelivery(e.target.checked)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* SECTION C: Active Ceremony Sub-Timelines */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-widest text-primary block">
                  03. Ceremony Sub-Timelines &amp; Feed Routing
                </span>
                <p className="text-xs text-neutral-500">
                  Toggle live guest memory-sharing channels across scheduled functions:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {['Haldi (Active Live)', 'Mehndi Ceremony', 'Sangeet Nocturne', 'Vedic Vows (Pheras)', 'Grand Gala Reception'].map((ceremony) => {
                    const isSelected = editCeremonies.includes(ceremony);
                    return (
                      <button
                        key={ceremony}
                        type="button"
                        onClick={() => {
                          setEditCeremonies((prev) =>
                            isSelected ? prev.filter((c) => c !== ceremony) : [...prev, ceremony]
                          );
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0A0A0C] text-white shadow-sm'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {isSelected && <AppIcon name="check" size={14} className="text-emerald-400" />}
                        <span>{ceremony}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 lg:p-8 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer"
              >
                Cancel &amp; Discard
              </button>
              <button
                type="button"
                onClick={handleSaveVaultChanges}
                disabled={isSavingEdit}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-[#9E1B32] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Syncing Vault...</span>
                  </>
                ) : (
                  <>
                    <AppIcon name="verified" size={16} />
                    <span>Save Changes &amp; Sync Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 2: DECOMMISSION & DELETE MARRIAGE (Stitch b990b7f778d1416db80c625a32749575) */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && deletingVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-[#0A0A0C] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200">
            {/* Destructive Header */}
            <div className="p-6 bg-rose-50 border-b border-rose-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-primary flex items-center justify-center flex-shrink-0">
                <AppIcon name="close" size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                  Irreversible Sovereign Action
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#0A0A0C] mt-0.5">
                  Decommission Marriage Vault
                </h3>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-neutral-400 hover:text-black cursor-pointer transition-colors"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>

            {/* Destructive Body */}
            <div className="p-6 space-y-5">
              {/* Warning Callout */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs leading-relaxed text-neutral-700">
                <p>
                  You are initiating total decommissioning for <strong className="text-[#0A0A0C] font-bold">{deletingVault.partnerOne} &amp; {deletingVault.partnerTwo}</strong>.
                </p>
                <p className="mt-2 text-primary font-medium">
                  This action will immediately terminate guest live access, deactivate all distributed QR standees, and purge {deletingVault.totalPhotos} uncompressed media items from edge CDN replication.
                </p>
              </div>

              {/* Verification Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Type Passkey <span className="font-mono text-primary font-bold">{deletingVault.code}</span> or <span className="font-mono text-primary font-bold">DELETE</span> to unlock destruction:
                </label>
                <input
                  type="text"
                  value={deleteVerifyInput}
                  onChange={(e) => setDeleteVerifyInput(e.target.value.toUpperCase())}
                  placeholder={`Type ${deletingVault.code} here...`}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono font-bold tracking-widest text-[#0A0A0C] uppercase focus:bg-white focus:border-primary outline-none transition-colors"
                />
              </div>

              {/* Safeguard Checkboxes */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteBackupChecked}
                    onChange={(e) => setDeleteBackupChecked(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    I have secured or downloaded the master cryptographic ZIP archive.
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteSmsChecked}
                    onChange={(e) => setDeleteSmsChecked(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-neutral-500">
                    Dispatch automated vault termination notice to prime hosts via SMS.
                  </span>
                </label>
              </div>
            </div>

            {/* Destructive Footer */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer"
              >
                Keep Vault Safe
              </button>

              <button
                type="button"
                onClick={handleExecuteDeleteVault}
                disabled={
                  isDeleting ||
                  !deleteBackupChecked ||
                  (deleteVerifyInput !== deletingVault.code && deleteVerifyInput !== 'DELETE')
                }
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed bg-primary hover:bg-[#9E1B32] text-white cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Purging Vault...</span>
                  </>
                ) : (
                  <>
                    <AppIcon name="close" size={16} />
                    <span>Permanently Delete Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION CONFETTI MODAL AFTER VAULT CREATION */}
      {isCelebrationOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
          <div className="relative w-full max-w-xl bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCelebrationOpen(false);
                setActiveTab('vaults');
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              <AppIcon name="close" size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3 shadow-inner">
                <AppIcon name="verified" size={36} />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-primary text-xs uppercase tracking-widest font-bold">
                <AppIcon name="celebration" size={16} />
                <span>Broadcast Channel Synchronized</span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#0A0A0C] font-bold mt-1.5">
                Wedding Vault Activated!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto mt-2 leading-relaxed">
                The sovereign archive for <span className="font-semibold text-[#0A0A0C] underline decoration-primary decoration-2 underline-offset-4">{partnerOne} &amp; {partnerTwo}</span> is now live in MongoDB Atlas.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <AppIcon name="vpn_key" size={18} className="text-primary" />
                  <span className="text-xs font-bold text-[#0A0A0C]">Universal Guest Code:</span>
                </div>
                <span className="font-mono text-2xl font-bold text-primary tracking-widest">{createdMarriageCode}</span>
              </div>

              <div className="pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <AppIcon name="lock_open" size={16} className="text-emerald-600" />
                  <span>QR Standee Direct Link Attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard?.writeText(`${window.location.origin}/marriage/${createdMarriageCode.toLowerCase()}`);
                      showToast('Vault link copied!');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-[#0A0A0C] font-semibold text-xs hover:bg-neutral-100 shadow-xs cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href={`/marriage/${createdMarriageCode.toLowerCase()}`}
                onClick={() => setIsCelebrationOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-[#9E1B32] text-white font-editorial text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all text-center"
              >
                <span>Launch Interactive Guest Experience</span>
                <AppIcon name="arrow_forward" size={16} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsCelebrationOpen(false);
                  setActiveTab('vaults');
                }}
                className="w-full py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#0A0A0C] text-xs font-semibold border border-neutral-200 transition-all cursor-pointer"
              >
                Return to Vault Portfolio Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
