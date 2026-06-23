import React, { useState } from 'react';
import { TravelPackage, Enquiry } from '../types';
import { useData } from '../context/DataContext';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Users, 
  Mail, 
  User, 
  Phone, 
  MessageSquare,
  Sparkles,
  PartyPopper
} from 'lucide-react';

interface PackageDetailsProps {
  pkg: TravelPackage;
  onBack: () => void;
}

export default function PackageDetails({ pkg, onBack }: PackageDetailsProps) {
  const { addEnquiry } = useData();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'inclusions'>('itinerary');
  
  // Enquiry form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [message, setMessage] = useState('');
  
  // Submission flags
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !travelDate) {
      setErrorMsg('Please compile all required fields (Name, Email, Phone, Travel Date).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await addEnquiry({
        name,
        email,
        phone,
        travelDate,
        destination: pkg.title,
        travelers: Number(travelers),
        message: message || `Enquiry for ${pkg.title} (${pkg.duration})`,
        packageId: pkg.id,
      });

      setSuccess(true);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setTravelDate('');
      setTravelers(2);
      setMessage('');
    } catch (err) {
      setErrorMsg('Failed to submit enquiry. Please verify your connection.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 bg-slate-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to all travel packages</span>
        </button>

        {/* Primary Container Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Package Itinerary, Description, details (7 cols on Desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Package Hero Image Card */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Float Category tags */}
                <div className="absolute top-4 left-4 flex gap-1">
                  <span className="px-3 py-1 bg-white/95 text-xs text-indigo-600 font-black tracking-wide uppercase rounded-xl shadow-md border border-indigo-100/30">
                    {pkg.category === 'trekking' ? '🏔️ High Altitude Trekking' : pkg.category === 'domestic' ? '🇮🇳 Indian Domestic' : '✈️ World Tour'}
                  </span>
                </div>
              </div>

              {/* Main Info Box */}
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mb-3">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>{pkg.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{pkg.duration}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight leading-tight mb-4">
                  {pkg.title}
                </h1>

                <p className="text-slate-600 font-normal leading-relaxed text-sm sm:text-base">
                  {pkg.description}
                </p>
              </div>
            </div>

            {/* Itinerary / Inclusions / Exclusions Interactive Tab Layout */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md">
              
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 mb-6">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`pb-4 px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
                    activeTab === 'itinerary'
                      ? 'border-indigo-600 text-indigo-600 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Day-by-Day Itinerary
                </button>
                <button
                  onClick={() => setActiveTab('inclusions')}
                  className={`pb-4 px-4 font-bold text-xs sm:text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
                    activeTab === 'inclusions'
                      ? 'border-indigo-600 text-indigo-600 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Inclusions & Exclusions
                </button>
              </div>

              {/* Day-by-Day Itinerary List */}
              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  {pkg.itinerary && pkg.itinerary.length > 0 ? (
                    pkg.itinerary.map((day, index) => {
                      const [dayLabel, ...descParts] = day.split(':');
                      const descText = descParts.join(':').trim();
                      return (
                        <div key={index} className="flex gap-4 relative">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs border border-indigo-100/80 shadow-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            {index < pkg.itinerary.length - 1 && (
                              <div className="w-[2px] bg-indigo-100 h-full my-1" />
                            )}
                          </div>
                          
                          {/* Timeline text content */}
                          <div className="pt-1.5 pb-2">
                            <h4 className="font-bold text-slate-900 text-[15px] mb-1">
                              {dayLabel || `Day ${index + 1}`}
                            </h4>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                              {descText || day}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 text-xs italic">Detailed itinerary is being prepared. Feel free to enquire or message our desk!</p>
                  )}
                </div>
              )}

              {/* Inclusions & Exclusions columns */}
              {activeTab === 'inclusions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Inclusions Column */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-[15px] text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 inline-block">
                      ✓ What is Included
                    </h4>
                    <ul className="space-y-2.5">
                      {pkg.inclusions.map((inc, i) => (
                        <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-normal">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exclusions Column */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-[15px] text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                      ✗ What is Excluded
                    </h4>
                    <ul className="space-y-2.5">
                      {pkg.exclusions.map((exc, i) => (
                        <li key={i} className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-normal">
                          <XCircle className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Column 2: Booking Form & Pricing Highlights Card (5 cols on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            
            {/* Quick Price/Budget Block */}
            <div className="bg-indigo-50/40 rounded-2xl p-6 border border-indigo-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Calculated Package Cost</span>
                <span className="text-3xl font-black text-slate-900">
                  ₹{pkg.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-bold ml-1">/per person</span>
              </div>
              <div className="text-right bg-white/80 px-3 py-2 rounded-xl border border-indigo-100 text-slate-600 font-bold text-xs">
                {pkg.duration}
              </div>
            </div>

            {/* Enquiry Entry Form */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-indigo-600" />
              
              {success ? (
                /* Post-Submission Success State */
                <div className="text-center py-8 space-y-5">
                  <div className="w-16 h-16 bg-indigo-100/80 border border-indigo-200 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-sm animate-bounce">
                    <PartyPopper className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-sans text-slate-900">Enquiry successfully dropped!</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                      Thank you! Your enquiry has been securely dropped to our registered mail desk:
                      <span className="block font-semibold text-indigo-650 mt-1 font-mono text-[13px]">Info.colormytrip@gmail.com</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-bold bg-indigo-50 py-1.5 px-3 rounded-lg border border-indigo-100 inline-block mt-2">
                      Our Lead Organizer will phone or email you within 2-4 hours.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSuccess(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                /* Booking Enquiry Inputs Form */
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                      <span>Ready to go? Customize & Enquire</span>
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      No payment required now. Drop an enquiry to customize your flights, hotels, or route plans!
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-100 text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleEnquirySubmit} className="space-y-4">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-[13px] border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-slate-800 transition-all focus:outline-none font-medium"
                        />
                        <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Email Address *</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-[13px] border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-slate-800 transition-all focus:outline-none font-medium"
                        />
                        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">WhatsApp / Phone Number *</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="Your contact number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-[13px] border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-slate-800 transition-all focus:outline-none font-medium"
                        />
                        <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Meta rows (Date, Travelers) - 2 cols layout */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Travel Date *</label>
                        <div className="relative">
                          <input
                             type="date"
                             required
                             value={travelDate}
                             onChange={(e) => setTravelDate(e.target.value)}
                             className="w-full pl-3 pr-2 py-2.5 bg-slate-50 text-[13px] border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-slate-800 transition-all focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Travelers</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={travelers}
                            onChange={(e) => setTravelers(Number(e.target.value))}
                            className="w-full pl-3 pr-2 py-2.5 bg-slate-50 text-[13px] border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-slate-800 transition-all focus:outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes / Message */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Special Customizations / Message</label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          placeholder="Any requests? (e.g. child seat, vegetarian only, flight add-on, stay upgrades)"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-[13px] border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-slate-800 transition-all focus:outline-none font-medium"
                        />
                        <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {submitting ? 'Dropping Enquiry...' : 'Instant Enquiry Drop'}
                    </button>
                    
                    <p className="text-center text-[10px] text-slate-400 font-medium">
                      🔒 Enquiries are logged securely using SSL and synchronized to our support desk immediately.
                    </p>
                  </form>
                </div>
              )}

            </div>

            {/* Quick Contact Panel */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700">Need immediate help?</p>
              <p>Email: <span className="font-semibold text-slate-800">Info.colormytrip@gmail.com</span></p>
              <p>Operational hours: 24/7 dedicated lead coordinators on support.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
