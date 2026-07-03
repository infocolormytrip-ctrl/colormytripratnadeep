import React from 'react';
import { X, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { Affiliate } from '../types/affiliate';
import { useData } from '../context/DataContext';

interface AffiliateStatsModalProps {
  affiliate: Affiliate | null;
  onClose: () => void;
}

export default function AffiliateStatsModal({ affiliate, onClose }: AffiliateStatsModalProps) {
  const { promoCodes } = useData();

  if (!affiliate) return null;

  const linkedPromos = promoCodes.filter(p => !p.deleted && (p.affiliateId === affiliate.id || p.affiliateIds?.includes(affiliate.id)));
  const totalPromoUsage = linkedPromos.reduce((sum, p) => sum + (p.totalUsed || 0), 0);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black text-slate-900">Affiliate Statistics</h2>
            <p className="text-slate-500 text-sm mt-1">{affiliate.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Bookings</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{affiliate.totalBookings}</p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Revenue</span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{affiliate.totalRevenueGenerated?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Commission</span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{affiliate.totalCommission?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-rose-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{affiliate.pendingCommission?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Linked Promo Codes
            </h3>
            
            {linkedPromos.length === 0 ? (
              <p className="text-slate-500 text-sm">No promo codes assigned to this affiliate.</p>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                {linkedPromos.map(promo => (
                  <div key={promo.id} className="p-4 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">{promo.code}</p>
                      <p className="text-xs text-slate-500">{promo.label || 'No label'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">{promo.totalUsed || 0} uses</p>
                      <p className="text-xs text-slate-400">Limit: {promo.usageLimit || '∞'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
