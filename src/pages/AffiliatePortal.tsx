import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  BarChart2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Wallet,
  Percent,
  Award,
  Tag,
  RefreshCw,
  User,
  Shield,
  FileText,
  Search,
  Lock,
  ArrowRight,
  Sparkles,
  Palette,
  Inbox,
  Globe,
  BookOpen,
  Megaphone,
  Video,
  X,
  Database,
  LogOut,
  Download
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function AffiliatePortal() {
  const {
    adminUser,
    role,
    affiliateProfile,
    affiliateId,
    logout,
    loginWithGoogle,
    enquiries,
    promoCodes,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isFirebaseActive
  } = useData();

  const affiliateIdValue = affiliateProfile?.id || affiliateId;
  const filteredEnquiries = enquiries.filter(
    (enq) => enq.affiliateId === affiliateIdValue && enq.promoCode
  );

  const isAffiliateSession = role === 'affiliate' && !!adminUser;
  const [activeTab, setActiveTab] = useState<'bookings' | 'summary'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAffiliateLogin = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
  };

  // Dashboard 10 Metric Calculations
  const totalBookings = filteredEnquiries.length;

  const pendingEnquiries = filteredEnquiries.filter(e =>
    ['Enquired', 'Under Processing', 'Under Follow-up'].includes(e.bookingStatus || e.status)
  ).length;

  const confirmedBookings = filteredEnquiries.filter(e =>
    ['Onboarded', 'Completed'].includes(e.bookingStatus || e.status)
  ).length;

  const cancelledBookings = filteredEnquiries.filter(e =>
    (e.bookingStatus || e.status) === 'Cancelled'
  ).length;

  const estimatedRevenue = filteredEnquiries.reduce((sum, e) =>
    sum + (e.estimatedBookingAmount || e.bookingAmount || 0), 0
  );

  const finalRevenue = filteredEnquiries.reduce((sum, e) =>
    sum + (e.finalNegotiatedAmount || 0), 0
  );

  // Dynamic paid commission calculation
  const totalPaidCommission = filteredEnquiries
    .filter(e => e.commissionStatus === 'Processed')
    .reduce((sum, e) => {
      if (e.calculatedCommission != null) return sum + e.calculatedCommission;
      const finalAmt = e.finalNegotiatedAmount || 0;
      const val = e.commissionValue || 0;
      if (e.commissionType === 'Percentage') {
        return sum + Math.round(finalAmt * (val / 100));
      }
      return sum + Math.round(val);
    }, 0);

  // Dynamic pending commission calculation
  const pendingCommission = filteredEnquiries
    .filter(e => e.commissionStatus !== 'Processed' && ['Onboarded', 'Completed', 'Generated', 'Processing', 'Pending Confirmation'].includes(e.commissionStatus || ''))
    .reduce((sum, e) => {
      if (e.calculatedCommission != null) return sum + e.calculatedCommission;
      const finalAmt = e.finalNegotiatedAmount || 0;
      const val = e.commissionValue || 0;
      if (e.commissionType === 'Percentage') {
        return sum + Math.round(finalAmt * (val / 100));
      }
      return sum + Math.round(val);
    }, 0);

  const conversionRate = totalBookings > 0
    ? Math.round((confirmedBookings / totalBookings) * 100)
    : 0;

  const activePromoCount = promoCodes.filter(p => !p.deleted && p.active !== false).length;

  // Filter bookings list based on search query
  const searchableBookings = filteredEnquiries.filter((enq) => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      (enq.id || '').toLowerCase().includes(term) ||
      (enq.name || '').toLowerCase().includes(term) ||
      (enq.destination || '').toLowerCase().includes(term) ||
      (enq.promoCode || '').toLowerCase().includes(term) ||
      (enq.bookingStatus || enq.status || '').toLowerCase().includes(term)
    );
  });

  const downloadCSV = () => {
    const headers = [
      'Booking ID',
      'Customer Name',
      'Destination',
      'Travel Date',
      'Promo Code',
      'Booking Status',
      'Estimated Amount',
      'Final Amount',
      'Commission',
      'Commission Status',
      'Last Updated'
    ];

    const rows = searchableBookings.map((enq) => {
      const bookingStatus = enq.bookingStatus || enq.status || 'Enquired';
      let commissionVal = 'Pending Confirmation';
      const isOnboardedOrLater = ['Onboarded', 'Completed', 'Cancelled'].includes(bookingStatus);
      if (isOnboardedOrLater) {
        if (enq.calculatedCommission != null) commissionVal = String(enq.calculatedCommission);
        else {
          const finalAmt = enq.finalNegotiatedAmount || 0;
          const val = enq.commissionValue || 0;
          commissionVal = String(enq.commissionType === 'Percentage' ? Math.round(finalAmt * (val / 100)) : val);
        }
      }
      return [
        enq.id,
        enq.name,
        enq.destination,
        enq.travelDate || '',
        enq.promoCode || '',
        bookingStatus,
        enq.estimatedBookingAmount || enq.bookingAmount || 0,
        enq.finalNegotiatedAmount || '',
        commissionVal,
        enq.commissionStatus || '',
        enq.updatedAt || enq.createdAt
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `commissions_report_${affiliateIdValue}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <div className="w-full h-full bg-slate-950 flex flex-col flex-1">
        
        {/* Mobile Header (viewport < 768px when logged in) */}
        {isAffiliateSession && (
          <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-650 rounded-lg">
                <Percent className="w-4.5 h-4.5 text-white" />
              </div>
              <h2 className="text-sm font-sans font-black tracking-tight">CMT Affiliate Portal</h2>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={() => markAllNotificationsAsRead('affiliate', affiliateIdValue)}
              />
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5 text-rose-450" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Header when NOT logged in */}
        {!isAffiliateSession && (
          <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-650 rounded-lg">
                <Lock className="w-4.5 h-4.5 text-white" />
              </div>
              <h2 className="text-sm font-sans font-black tracking-tight">Affiliate Access</h2>
            </div>
          </div>
        )}

        {/* Header Desk */}
        <div className="hidden md:flex bg-slate-900 text-white p-4 md:px-6 md:py-4 items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-650 rounded-xl shadow-inner">
              <Percent className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-sans font-black tracking-tight flex items-center gap-2">
                <span>ColorMyTrip Affiliate Desk</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-slate-350">
                  {role === 'affiliate' ? 'Approved Affiliate' : 'Guest Account'}
                </span>
              </h2>
              <p className="text-slate-400 text-xs">
                Track promo campaigns, commission payouts, and customer bookings in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAffiliateSession && (
              <NotificationBell
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={() => markAllNotificationsAsRead('affiliate', affiliateIdValue)}
              />
            )}
            {!isAffiliateSession ? (
              <button
                onClick={handleAffiliateLogin}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all cursor-pointer border border-indigo-500"
              >
                Sign In with Google
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {!isAffiliateSession ? (
          <div className="grow flex flex-col justify-center items-center p-8 text-center bg-slate-950">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 shadow-xl">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Affiliate Portal Access</h3>
            <p className="text-slate-400 mb-8 max-w-sm text-sm font-medium">
              Authenticate with your registered Gmail account to open the affiliate tracking desk, review promotional stats and redeem payouts.
            </p>
            <div className="space-y-4 w-full max-w-xs">
              <button
                onClick={handleAffiliateLogin}
                className="w-full py-3 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-900/40 hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-indigo-500"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        ) : (
          <div className="grow flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Sidebar menu categories */}
            <div className="hidden md:flex md:w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 shrink-0 md:flex-col overflow-x-auto md:overflow-x-visible">
              
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-indigo-650 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Inbox className="w-5 h-5 shrink-0" />
                <span>My Bookings</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-350'
                }`}>
                  {totalBookings}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-indigo-650 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart2 className="w-5 h-5 shrink-0" />
                <span>Dashboard Summary</span>
              </button>

              <div className="hidden md:block border-t border-slate-800 my-4 pt-4" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-rose-455 hover:bg-slate-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 mt-auto transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 shrink-0" />
                <span>Log Out</span>
              </button>

            </div>

            {/* Display Body Content Panel */}
            <div className="grow overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100 space-y-6 pb-24 md:pb-6">

            
            {activeTab === 'summary' ? (
              <div className="space-y-8">
                
                {/* Header Welcome Box */}
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 font-mono">Affiliate Portal</p>
                  <h1 className="text-xl md:text-2xl font-black text-white mt-1">Welcome to your affiliate dashboard</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Track the enquiries linked to your promo code, monitor booking stages, and stay updated on commissions.
                  </p>
                </div>

                {/* Grid of 8 Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Card 1: Total Bookings */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
                      <div className="p-1.5 bg-slate-950 text-indigo-400 rounded-lg border border-slate-800">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{totalBookings}</div>
                      <p className="text-[9px] text-slate-500 mt-0.5">All enquiries linked</p>
                    </div>
                  </div>

                  {/* Card 2: Pending Enquiries */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Enq</span>
                      <div className="p-1.5 bg-slate-950 text-amber-400 rounded-lg border border-slate-800">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{pendingEnquiries}</div>
                      <p className="text-[9px] text-slate-500 mt-0.5">Awaiting onboard status</p>
                    </div>
                  </div>

                  {/* Card 3: Confirmed Bookings */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed</span>
                      <div className="p-1.5 bg-slate-950 text-emerald-450 rounded-lg border border-slate-800">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{confirmedBookings}</div>
                      <p className="text-[9px] text-slate-500 mt-0.5">Onboarded / Completed</p>
                    </div>
                  </div>

                  {/* Card 4: Cancelled Bookings */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cancelled</span>
                      <div className="p-1.5 bg-slate-950 text-rose-455 rounded-lg border border-slate-800">
                        <XCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{cancelledBookings}</div>
                      <p className="text-[9px] text-slate-500 mt-0.5">Cancelled bookings</p>
                    </div>
                  </div>

                  {/* Card 5: Paid Commission */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Comm.</span>
                      <div className="p-1.5 bg-slate-950 text-emerald-450 rounded-lg border border-slate-800">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-emerald-450">₹{totalPaidCommission.toLocaleString()}</div>
                      <p className="text-[9px] text-slate-500 mt-0.5">Transferred to your bank</p>
                    </div>
                  </div>

                  {/* Card 6: Pending Commission */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Comm.</span>
                      <div className="p-1.5 bg-slate-950 text-orange-400 rounded-lg border border-slate-800">
                        <RefreshCw className="w-4 h-4 anim-spin" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-orange-400">₹{pendingCommission.toLocaleString()}</div>
                      <p className="text-[9px] text-slate-500 mt-0.5">Processed next batch</p>
                    </div>
                  </div>

                  {/* Card 7: Conversion Rate */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion</span>
                      <div className="p-1.5 bg-slate-950 text-fuchsia-400 rounded-lg border border-slate-800">
                        <Percent className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{conversionRate}%</div>
                      <p className="text-[9px] text-slate-500 mt-0.5">Confirmed / Total ratio</p>
                    </div>
                  </div>

                  {/* Card 8: Comm. Type & Rate */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Rate</span>
                      <div className="p-1.5 bg-slate-950 text-sky-400 rounded-lg border border-slate-800">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-white leading-tight">
                        {affiliateProfile?.commissionType === 'Fixed Amount' ? `₹${affiliateProfile?.defaultCommissionValue}` : `${affiliateProfile?.defaultCommissionValue ?? 10}%`}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">({affiliateProfile?.commissionType || 'Percentage'})</p>
                    </div>
                  </div>
                </div>

                {/* GRAPH SECTION - 2 FUNCTIONAL SVG CHARTS */}
                <div className="grid gap-6 lg:grid-cols-2">
                  
                  {/* Chart 1: Commission Timeline */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-450" /> Cumulative Commissions Trend
                    </h3>
                    
                    <div className="w-full flex items-center justify-center bg-slate-950 rounded-xl p-4 border border-slate-850 h-56">
                      {(() => {
                        const trendData = [...filteredEnquiries]
                          .filter(e => ['Onboarded', 'Completed'].includes(e.bookingStatus || e.status))
                          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                          .map(e => {
                            const finalAmt = e.finalNegotiatedAmount || 0;
                            const val = e.commissionValue || 0;
                            return e.calculatedCommission ?? (e.commissionType === 'Percentage' ? Math.round(finalAmt * (val / 100)) : val);
                          });

                        if (trendData.length === 0) {
                          return (
                            <div className="text-center text-xs text-slate-500">
                              <BarChart2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                              No commission data logged yet.
                            </div>
                          );
                        }

                        // Calculate accumulated sums
                        let sum = 0;
                        const plotPoints = trendData.map(val => {
                          sum += val;
                          return sum;
                        });

                        const maxVal = Math.max(...plotPoints, 1000);
                        const pointsCount = plotPoints.length;
                        
                        // Construct SVG path points
                        const width = 450;
                        const height = 140;
                        const paddingLeft = 45;
                        const paddingTop = 10;
                        const paddingBottom = 20;
                        const graphHeight = height - paddingTop - paddingBottom;
                        const graphWidth = width - paddingLeft - 10;

                        const coordinates = plotPoints.map((p, i) => {
                          const x = paddingLeft + (pointsCount > 1 ? (i / (pointsCount - 1)) * graphWidth : graphWidth / 2);
                          const y = paddingTop + graphHeight - (p / maxVal) * graphHeight;
                          return { x, y };
                        });

                        const linePath = coordinates.length > 1
                          ? `M ${coordinates.map(c => `${c.x} ${c.y}`).join(' L ')}`
                          : `M ${paddingLeft} ${paddingTop + graphHeight} L ${paddingLeft + graphWidth} ${paddingTop + graphHeight}`;

                        const areaPath = coordinates.length > 1
                          ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${paddingTop + graphHeight} L ${coordinates[0].x} ${paddingTop + graphHeight} Z`
                          : '';

                        return (
                          <svg className="w-full h-full text-xs font-mono" viewBox={`0 0 ${width} ${height}`}>
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4338ca" stopOpacity="0.4"/>
                                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0"/>
                              </linearGradient>
                            </defs>
                            
                            {/* Y Axis Grid Lines */}
                            {[0, 0.5, 1].map((ratio, idx) => {
                              const y = paddingTop + graphHeight * (1 - ratio);
                              return (
                                <g key={idx}>
                                  <line x1={paddingLeft} y1={y} x2={width - 10} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                                  <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="#64748b" className="text-[10px]">
                                    ₹{Math.round(maxVal * ratio)}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Line & Area */}
                            {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
                            <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Dots at points */}
                            {coordinates.map((c, i) => (
                              <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="#818cf8" stroke="#0f172a" strokeWidth="1.5" />
                            ))}

                            {/* Label */}
                            <text x={paddingLeft} y={height - 2} fill="#64748b" className="text-[9px]">Timeline</text>
                            <text x={width - 10} y={height - 2} textAnchor="end" fill="#818cf8" className="text-[10px] font-bold">
                              Total: ₹{sum.toLocaleString()}
                            </text>
                          </svg>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Chart 2: Booking Status Bar Distribution */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-indigo-400" /> Booking Stage Distribution
                    </h3>
                    
                    <div className="w-full bg-slate-950 rounded-xl p-5 border border-slate-850 h-56 flex flex-col justify-center space-y-4">
                      {totalBookings === 0 ? (
                        <div className="text-center text-xs text-slate-500">No active bookings recorded yet.</div>
                      ) : (
                        [
                          { name: 'Confirmed (Onboarded/Completed)', count: confirmedBookings, color: 'bg-emerald-500', barColor: '#10b981' },
                          { name: 'Under Processing / Inquiries', count: pendingEnquiries, color: 'bg-amber-500', barColor: '#f59e0b' },
                          { name: 'Cancelled Bookings', count: cancelledBookings, color: 'bg-rose-500', barColor: '#ef4444' }
                        ].map((item, idx) => {
                          const percentage = Math.round((item.count / totalBookings) * 100) || 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-405 flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                  {item.name}
                                </span>
                                <span className="text-white font-bold">{item.count} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: item.barColor }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Profile and Platform Summary */}
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                      <User className="w-4 h-4 text-indigo-400" /> Account Profile Details
                    </h2>
                    <div className="mt-4 space-y-3 text-xs text-slate-350">
                      <div className="flex justify-between border-b border-slate-800/60 pb-2">
                        <span>Signed in as</span>
                        <span className="font-semibold text-white">{adminUser?.displayName || adminUser?.email || 'Affiliate User'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-2">
                        <span>System Role</span>
                        <span className="font-semibold text-indigo-400 uppercase text-[10px] px-2 py-0.5 bg-slate-950 rounded-md border border-slate-800">{role}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-2">
                        <span>Affiliate Name</span>
                        <span className="font-semibold text-white">{affiliateProfile?.fullName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-2">
                        <span>Linked Email</span>
                        <span className="font-mono text-white">{affiliateProfile?.email || adminUser?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span>Contact Phone</span>
                        <span className="font-mono text-white">{affiliateProfile?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col justify-between">
                    <div>
                      <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Shield className="w-4 h-4 text-emerald-450" /> Platform Authorization
                      </h2>
                      <ul className="mt-4 list-disc pl-5 text-xs text-slate-350 space-y-2">
                        <li>Track real-time bookings & enquiries tied to your promo codes</li>
                        <li>Monitor commission status changes transparently</li>
                        <li>Receive browser notifications for updates</li>
                      </ul>
                    </div>
                    <div className="mt-6 text-[10px] text-slate-500 font-medium italic">
                      Last synced: {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* My Bookings Tab */
              <div className="space-y-4">
                
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">Linked Booking Enquiries</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">List of bookings tagged with your coupon codes</p>
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={downloadCSV}
                      disabled={searchableBookings.length === 0}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow transition-all shrink-0 uppercase tracking-wide border border-indigo-600/20 active:scale-[0.98]"
                      title="Export commissions to CSV"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                    <div className="relative w-full sm:w-60">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500 placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop: Bookings table */}
                <div className="hidden md:block overflow-x-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
                  <table className="min-w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Booking ID</th>
                        <th className="px-4 py-3">Customer Name</th>
                        <th className="px-4 py-3">Package / Destination</th>
                        <th className="px-4 py-3">Travel Date</th>
                        <th className="px-4 py-3 font-mono">Promo Code</th>
                        <th className="px-4 py-3">Booking Status</th>
                        <th className="px-4 py-3 text-right">Estimated Amount</th>
                        <th className="px-4 py-3 text-right">Final Amount</th>
                        <th className="px-4 py-3 text-right">Commission</th>
                        <th className="px-4 py-3 text-center">Commission Status</th>
                        <th className="px-4 py-3">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {searchableBookings.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-4 py-8 text-center text-slate-500 font-medium">
                            No bookings found matching your search.
                          </td>
                        </tr>
                      ) : (
                        searchableBookings.map((enq) => {
                          const displayPromo = enq.promoCode || '-';
                          const bookingStatus = enq.bookingStatus || enq.status || 'Enquired';
                          const displayEstimated = enq.estimatedBookingAmount != null ? `₹${enq.estimatedBookingAmount.toLocaleString()}` : (enq.bookingAmount != null ? `₹${enq.bookingAmount.toLocaleString()}` : '-');
                          const displayFinal = enq.finalNegotiatedAmount != null ? `₹${enq.finalNegotiatedAmount.toLocaleString()}` : '-';
                          const isOnboardedOrLater = ['Onboarded', 'Completed', 'Cancelled'].includes(bookingStatus);
                          let displayCommission = 'Pending Confirmation';
                          if (isOnboardedOrLater) {
                            if (enq.calculatedCommission != null) displayCommission = `₹${enq.calculatedCommission.toLocaleString()}`;
                            else {
                              const finalAmt = enq.finalNegotiatedAmount || 0;
                              const val = enq.commissionValue || 0;
                              displayCommission = enq.commissionType === 'Percentage' ? `₹${Math.round(finalAmt * (val / 100)).toLocaleString()}` : `₹${Math.round(val).toLocaleString()}`;
                            }
                          }
                          const displayCommStatus = enq.commissionStatus || '-';
                          const displayLastUpdated = enq.updatedAt ? new Date(enq.updatedAt).toLocaleString() : new Date(enq.createdAt).toLocaleString();
                          return (
                            <tr key={enq.id} className="hover:bg-slate-850/40 border-b border-slate-800 transition-colors font-medium">
                              <td className="px-4 py-3.5 font-mono font-bold text-indigo-400 text-[10px]">{enq.id.slice(0,8)}...</td>
                              <td className="px-4 py-3.5 font-bold text-white">{enq.name}</td>
                              <td className="px-4 py-3.5 max-w-[150px] truncate" title={enq.destination}>{enq.destination}</td>
                              <td className="px-4 py-3.5 font-mono text-slate-400">{enq.travelDate || '—'}</td>
                              <td className="px-4 py-3.5 font-mono font-bold text-slate-350">{displayPromo}</td>
                              <td className="px-4 py-3.5">
                                <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border ${
                                  bookingStatus === 'Onboarded' || bookingStatus === 'Completed' ? 'bg-emerald-950 text-emerald-450 border-emerald-900'
                                  : bookingStatus === 'Cancelled' ? 'bg-rose-955 text-rose-450 border-rose-900'
                                  : 'bg-slate-950 text-slate-400 border-slate-800'
                                }`}>{bookingStatus}</span>
                              </td>
                              <td className="px-4 py-3.5 text-right font-bold text-slate-300">{displayEstimated}</td>
                              <td className="px-4 py-3.5 text-right font-bold text-slate-300">{displayFinal}</td>
                              <td className={`px-4 py-3.5 text-right font-bold ${displayCommission === 'Pending Confirmation' ? 'text-slate-500 italic' : 'text-emerald-450'}`}>{displayCommission}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  displayCommStatus === 'Generated' ? 'bg-blue-955 text-blue-400 border-blue-900'
                                  : displayCommStatus === 'Processed' ? 'bg-emerald-955 text-emerald-450 border-emerald-900'
                                  : 'bg-slate-950 text-slate-400 border-slate-800'
                                }`}>{displayCommStatus}</span>
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 text-[10px]">{displayLastUpdated}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: Bookings card list */}
                <div className="block md:hidden space-y-3">
                  {searchableBookings.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
                      No bookings linked to your code yet.
                    </div>
                  ) : searchableBookings.map((enq) => {
                    const bookingStatus = enq.bookingStatus || enq.status || 'Enquired';
                    const displayFinal = enq.finalNegotiatedAmount != null ? `₹${enq.finalNegotiatedAmount.toLocaleString()}` : '-';
                    const isOnboardedOrLater = ['Onboarded', 'Completed', 'Cancelled'].includes(bookingStatus);
                    let displayCommission = 'Pending';
                    if (isOnboardedOrLater) {
                      if (enq.calculatedCommission != null) displayCommission = `₹${enq.calculatedCommission.toLocaleString()}`;
                      else {
                        const finalAmt = enq.finalNegotiatedAmount || 0;
                        const val = enq.commissionValue || 0;
                        displayCommission = enq.commissionType === 'Percentage' ? `₹${Math.round(finalAmt * (val / 100)).toLocaleString()}` : `₹${Math.round(val).toLocaleString()}`;
                      }
                    }
                    const displayCommStatus = enq.commissionStatus || 'Pending Confirmation';
                    const statusColor = bookingStatus === 'Onboarded' || bookingStatus === 'Completed'
                      ? 'bg-emerald-950/60 text-emerald-450 border-emerald-900/50'
                      : bookingStatus === 'Cancelled' ? 'bg-rose-955/60 text-rose-455 border-rose-900/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800';
                    const commStatusColor = displayCommStatus === 'Processed' ? 'bg-emerald-950/60 text-emerald-450 border-emerald-900/50'
                      : displayCommStatus === 'Generated' ? 'bg-blue-955/60 text-blue-400 border-blue-900/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800';
                    return (
                      <div key={enq.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-white text-sm leading-snug">{enq.name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]" title={enq.destination}>{enq.destination}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border shrink-0 ${statusColor}`}>{bookingStatus}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs border-t border-slate-800/50 pt-3">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-mono block">Travel Date</span>
                            <span className="font-bold text-indigo-400">{enq.travelDate || '—'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block">Promo Code</span>
                            <span className="font-mono font-bold text-slate-300">{enq.promoCode || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-mono block">Final Amount</span>
                            <span className="font-bold text-white">{displayFinal}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block">Commission</span>
                            <span className={`font-extrabold ${displayCommission === 'Pending' ? 'text-slate-500 italic' : 'text-emerald-450'}`}>{displayCommission}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-800/50 pt-2 text-[10px]">
                          <span className="text-slate-500 font-mono">Updated: {enq.updatedAt ? new Date(enq.updatedAt).toLocaleDateString() : new Date(enq.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded-lg font-bold border ${commStatusColor}`}>{displayCommStatus}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Bottom Tab Bar */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around z-45 shrink-0">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-colors ${activeTab === 'bookings' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <Inbox className="w-5 h-5" />
                <span className="text-[10px] font-bold">Bookings</span>
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-colors ${activeTab === 'summary' ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                <BarChart2 className="w-5 h-5" />
                <span className="text-[10px] font-bold">Analytics</span>
              </button>
            </div>

          </div>
        </div>
        )}
      </div>
    </div>
  );
}
