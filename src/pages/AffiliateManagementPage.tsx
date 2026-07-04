import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Affiliate, AffiliateStatus, CommissionType } from '../types/affiliate';
import { validateAffiliateForm, AffiliateFormErrors, AffiliateFormValues } from '../lib/affiliateValidation';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  BarChart2,
  Database,
  Inbox,
  Globe,
  BookOpen,
  Megaphone,
  Video,
  Sparkles,
  Palette,
  X,
  Lock
} from 'lucide-react';
import AffiliateStatsModal from '../components/AffiliateStatsModal';
import NotificationBell from '../components/NotificationBell';

const PAGE_SIZE = 8;

const initialForm = (): AffiliateFormValues => ({
  fullName: '',
  email: '',
  phone: '',
  status: 'Active',
  commissionType: 'Percentage',
  defaultCommissionValue: 10,
  address: '',
  profileImage: '',
  bankDetails: '',
});

export default function AffiliateManagementPage() {
  const navigate = useNavigate();
  const { 
    showToast,
    isAdminLoggedIn, 
    role, 
    affiliateProfile, 
    adminUser, 
    createAffiliate, 
    updateAffiliate, 
    deleteAffiliate, 
    toggleAffiliateStatus, 
    affiliates,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isFirebaseActive,
    logout,
    loginWithGoogle,
    enquiries,
    packages,
    blogs,
    offers,
    videoTestimonials,
    promoCodes
  } = useData() as any;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AffiliateStatus>('All');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AffiliateFormValues>(initialForm());
  const [errors, setErrors] = useState<AffiliateFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [statsAffiliate, setStatsAffiliate] = useState<Affiliate | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (affiliates || []).filter((item: Affiliate) => {
      const matchesQuery = !term || [item.fullName, item.email, item.phone].some((value) => (value || '').toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [affiliates, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm());
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (affiliate: Affiliate) => {
    setEditingId(affiliate.id);
    setForm({
      fullName: affiliate.fullName || '',
      email: affiliate.email || '',
      phone: affiliate.phone || '',
      status: affiliate.status || 'Active',
      commissionType: affiliate.commissionType || 'Percentage',
      defaultCommissionValue: affiliate.defaultCommissionValue ?? 10,
      address: affiliate.address || '',
      profileImage: affiliate.profileImage || '',
      bankDetails: affiliate.bankDetails || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateAffiliateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setBusy(true);
    try {
      if (editingId) {
        await updateAffiliate(editingId, form);
      } else {
        await createAffiliate(form);
      }
      setShowModal(false);
      setForm(initialForm());
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  };

  const handleStatusToggle = async (affiliate: Affiliate) => {
    await toggleAffiliateStatus(affiliate.id, affiliate.status === 'Active' ? 'Disabled' : 'Active');
  };

  const handleDelete = async (affiliate: Affiliate) => {
    if (!window.confirm(`Are you sure you want to permanently delete affiliate "${affiliate.fullName}"? This action cannot be undone.`)) return;
    try {
      await deleteAffiliate(affiliate.id);
      showToast('success', 'Affiliate Deleted', `Affiliate "${affiliate.fullName}" has been permanently deleted.`);
    } catch (err) {
      showToast('error', 'Delete Failed', 'Failed to delete affiliate.');
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <div className="grow flex flex-col justify-center items-center p-8 text-center bg-slate-950">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 shadow-xl">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Administrative Sign In Required</h3>
          <p className="text-slate-400 mb-8 max-w-sm text-sm font-medium">
            Access is restricted to authorized representatives. Please authenticate with your admin Google account.
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-48 py-3 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-900/40 hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-indigo-500"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <div className="w-full h-full bg-slate-950 flex flex-col flex-1">
        
        {/* Mobile sticky header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-650 rounded-lg">
              <Database className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-sans font-black tracking-tight">Affiliate Manager</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications.filter((n: any) => n.userUid === 'admin' || !n.affiliateId)}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={() => markAllNotificationsAsRead('admin')}
            />
            <button
              onClick={() => navigate('/admin')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Back to Admin"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Header Desk */}
        <div className="hidden md:flex bg-slate-900 text-white p-4 md:px-6 md:py-4 items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-650 rounded-xl shadow-inner">
              <Database className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-sans font-black tracking-tight flex items-center gap-2">
                <span>ColorMyTrip Admin Desk</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-slate-300">
                  {isFirebaseActive ? 'Firebase Active' : 'Sandbox (Demo)'}
                </span>
              </h2>
              <p className="text-slate-400 text-xs">
                Manage travel packages, delete outdated blogs, and review user inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications.filter((n: any) => n.userUid === 'admin' || !n.affiliateId)}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={() => markAllNotificationsAsRead('admin')}
            />
            <button
              onClick={() => navigate('/')}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Back to website"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grow flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Sidebar menu categories */}
          <div className="hidden md:flex md:w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 shrink-0 md:flex-col overflow-x-auto md:overflow-x-visible">
            
            <button
              onClick={() => navigate('/admin?tab=enquiries')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Inbox className="w-5 h-5 shrink-0" />
              <span>Enquiries</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-350 rounded-full font-bold">
                {enquiries?.length || 0}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin?tab=packages')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Globe className="w-5 h-5 shrink-0" />
              <span>Packages Manager</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-355 rounded-full font-bold">
                {packages?.length || 0}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin?tab=blogs')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>Blog Articles</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-355 rounded-full font-bold">
                {blogs?.length || 0}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin?tab=offers')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Megaphone className="w-5 h-5 shrink-0" />
              <span>Offer Marquee</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-355 rounded-full font-bold">
                {offers?.length || 0}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin?tab=videos')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Video className="w-5 h-5 shrink-0" />
              <span>Video Testimonials</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-355 rounded-full font-bold">
                {videoTestimonials?.length || 0}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin?tab=promoCodes')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Promo Codes</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-355 rounded-full font-bold">
                {promoCodes?.length || 0}
              </span>
            </button>

            <button
              onClick={() => {}}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer bg-indigo-650 text-white shadow-md shadow-indigo-900/50"
            >
              <Globe className="w-5 h-5 shrink-0" />
              <span>Affiliate Management</span>
            </button>

            <button
              onClick={() => navigate('/admin?tab=website')}
              className="w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <Palette className="w-5 h-5 shrink-0" />
              <span>Website Settings</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-350 rounded-full font-bold">
                CMS
              </span>
            </button>

            <div className="hidden md:block border-t border-slate-800 my-4 pt-4" />
            
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 text-rose-450 hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 mt-auto transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 shrink-0" />
              <span>Log Out Admin</span>
            </button>

          </div>

          {/* Display Body Content Panel */}
          <div className="grow overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100 space-y-6 pb-24 md:pb-6">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400 font-mono">Admin Control</p>
                  <h1 className="text-xl md:text-2xl font-black text-white mt-1">Affiliate Management</h1>
                  <p className="text-xs text-slate-400 mt-1">Create, edit, disable, activate, and review registered affiliate partners.</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all">
                  <Plus className="h-4 w-4" /> Create Affiliate
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email or phone..." className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500 placeholder-slate-500" />
                </div>
                <div className="flex items-center gap-2">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500">
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-center">Bookings</th>
                      <th className="px-3 py-3 text-right">Commission</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {paged.map((affiliate: Affiliate) => (
                      <tr key={affiliate.id} className="hover:bg-slate-850/40 border-b border-slate-800/80 transition-colors">
                        <td className="px-3 py-3.5 font-bold text-white">{affiliate.fullName}</td>
                        <td className="px-3 py-3.5 font-mono text-slate-400">{affiliate.email}</td>
                        <td className="px-3 py-3.5">
                          <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${affiliate.status === 'Active' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900' : 'bg-amber-955 text-amber-450 border border-amber-900'}`}>
                            {affiliate.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold">{affiliate.totalBookings || 0}</td>
                        <td className="px-3 py-3.5 text-right font-bold text-emerald-450">₹{(affiliate.totalCommission || 0).toLocaleString()}</td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setStatsAffiliate(affiliate)} className="rounded-lg border border-slate-800 p-1.5 bg-slate-950 text-indigo-400 hover:bg-slate-800" title="View Stats"><BarChart2 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => openEdit(affiliate)} className="rounded-lg border border-slate-800 p-1.5 bg-slate-950 text-slate-350 hover:bg-slate-800" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleStatusToggle(affiliate)} className="rounded-lg border border-slate-800 p-1.5 bg-slate-950 text-slate-350 hover:bg-slate-800" title={affiliate.status === 'Active' ? 'Disable' : 'Activate'}>{affiliate.status === 'Active' ? <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}</button>
                            <button onClick={() => handleDelete(affiliate)} className="rounded-lg border border-slate-800 p-1.5 bg-slate-950 text-rose-455 hover:bg-slate-800" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-slate-500 font-medium">No affiliate partners registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile affiliate cards */}
              <div className="block md:hidden space-y-3">
                {paged.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 border border-slate-800 rounded-2xl">
                    No affiliates registered yet.
                  </div>
                ) : paged.map((affiliate: Affiliate) => (
                  <div key={affiliate.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{affiliate.fullName}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{affiliate.email}</p>
                        {affiliate.phone && <p className="text-[10px] text-slate-500 font-mono">{affiliate.phone}</p>}
                      </div>
                      <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                        affiliate.status === 'Active' ? 'bg-emerald-950 text-emerald-450 border-emerald-900' : 'bg-amber-955/60 text-amber-450 border-amber-900/50'
                      }`}>{affiliate.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-slate-800/50 pt-3">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono block">Total Bookings</span>
                        <span className="font-extrabold text-white text-sm">{affiliate.totalBookings || 0}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase font-mono block">Commission Earned</span>
                        <span className="font-extrabold text-emerald-450 text-sm">₹{(affiliate.totalCommission || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800/50 justify-end">
                      <button onClick={() => setStatsAffiliate(affiliate)} className="p-2 bg-indigo-955/40 text-indigo-400 border border-indigo-900/40 rounded-xl hover:bg-indigo-900/60 cursor-pointer transition-colors" title="Stats"><BarChart2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => openEdit(affiliate)} className="p-2 bg-slate-950 text-slate-350 border border-slate-800 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleStatusToggle(affiliate)} className="p-2 bg-slate-950 text-slate-350 border border-slate-800 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors" title={affiliate.status === 'Active' ? 'Disable' : 'Activate'}>{affiliate.status === 'Active' ? <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}</button>
                      <button onClick={() => handleDelete(affiliate)} className="p-2 bg-rose-955/30 text-rose-455 border border-rose-900/40 rounded-xl hover:bg-rose-900/60 cursor-pointer transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                <p className="text-[11px] text-slate-400">Showing {paged.length} of {filtered.length} affiliates</p>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 disabled:opacity-50">Previous</button>
                  <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 disabled:opacity-50">Next</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around z-45 shrink-0">
          <button onClick={() => navigate('/admin?tab=enquiries')} className="flex flex-col items-center gap-1 p-2 text-slate-400 cursor-pointer">
            <Inbox className="w-5 h-5" />
            <span className="text-[10px] font-bold">Enquiries</span>
          </button>
          <button onClick={() => navigate('/admin?tab=packages')} className="flex flex-col items-center gap-1 p-2 text-slate-400 cursor-pointer">
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-bold">Packages</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-indigo-400 cursor-pointer">
            <Database className="w-5 h-5" />
            <span className="text-[10px] font-bold">Affiliates</span>
          </button>
          <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1 p-2 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
            <span className="text-[10px] font-bold">Back</span>
          </button>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl sm:rounded-2xl rounded-t-3xl bg-slate-900 border-x border-t sm:border border-slate-800 p-6 shadow-2xl animate-slide-up sm:animate-fade-in text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400 font-mono">{editingId ? 'Edit Affiliate' : 'Create Affiliate'}</p>
                <h2 className="text-lg font-black text-white mt-1">{editingId ? 'Update affiliate details' : 'Add a new affiliate'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-slate-800 bg-slate-950 text-slate-400 px-3 py-1.5 text-xs hover:text-white transition-colors cursor-pointer">Close</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-350">Full name</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500" />
                {errors.fullName && <p className="mt-1 text-[10px] text-rose-500 font-medium">{errors.fullName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-350">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500" />
                {errors.email && <p className="mt-1 text-[10px] text-rose-500 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-350">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500" />
                {errors.phone && <p className="mt-1 text-[10px] text-rose-500 font-medium">{errors.phone}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-350">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AffiliateStatus })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500">
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-350">Commission Type</label>
                <select value={form.commissionType} onChange={(e) => setForm({ ...form, commissionType: e.target.value as CommissionType })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500">
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-350">Default Commission Value</label>
                <input type="number" value={form.defaultCommissionValue ?? ''} onChange={(e) => setForm({ ...form, defaultCommissionValue: Number(e.target.value) })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500" />
                {errors.defaultCommissionValue && <p className="mt-1 text-[10px] text-rose-500 font-medium">{errors.defaultCommissionValue}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-350">Address</label>
                <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-350">Bank Details</label>
                <textarea value={form.bankDetails || ''} onChange={(e) => setForm({ ...form, bankDetails: e.target.value })} className="min-h-20 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-800 bg-slate-950 text-slate-400 px-4 py-2 hover:text-white transition-colors cursor-pointer font-bold">Cancel</button>
                <button type="submit" disabled={busy} className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow-md hover:bg-indigo-705 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer">{busy ? 'Saving...' : editingId ? 'Save Changes' : 'Create Affiliate'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Affiliate Stats Modal */}
      <AffiliateStatsModal
        affiliate={statsAffiliate}
        onClose={() => setStatsAffiliate(null)}
      />
    </div>
  );
}
