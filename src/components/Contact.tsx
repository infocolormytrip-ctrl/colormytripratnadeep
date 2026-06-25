import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Mail, Phone, MapPin, CheckCircle2, Clock, ShieldCheck, Sparkles, Send } from 'lucide-react';

export default function Contact() {
  const { addEnquiry, contactSettings, footerSettings } = useData();
  const emailAddress = (contactSettings as any)?.email_address || (footerSettings as any)?.email_address;
  const phoneNumber = (contactSettings as any)?.phone_number || (footerSettings as any)?.phone_number;



  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGeneralEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !destination || !travelDate) {
      setErrorMsg('Please compile all required fields (Name, Email, Phone, Destination, Travel Date).');
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
        destination,
        travelers: Number(travelers),
        message: message || `General customized enquiry for can trip planning.`,
      });

      setSuccess(true);
      // Reset form variables
      setName('');
      setEmail('');
      setPhone('');
      setDestination('');
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
    <div className="py-12 bg-slate-50/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight mb-4">
            Get in Touch with Our <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Travel Directors</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Have questions about permits, dynamic pricing, or custom high-altitude itineraries? We are here to guide you with complete architectural honesty.
          </p>
        </div>

        {/* 2 Column Layout - Contact Card Panel vs Form Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

          {/* Column 1: Info Panel (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white flex flex-col justify-between shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl -z-1" />

            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-indigo-300 uppercase font-black">ColorMyTrip Secretariat</span>
                <h3 className="text-2xl font-black font-sans mt-1">Travel with Soul</h3>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                Contact our head office coordinators. We will gladly help configure custom treks (Sandakphu, Kedarkantha) or cultural family routes in Kashmir or Bhutan.
              </p>

              {/* Direct Info Fields */}
              <div className="space-y-5 pt-4">

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Registered Email</p>
                    <a
                      href={`mailto:${emailAddress || 'Info.colormytrip@gmail.com'}`}
                      className="text-base font-bold text-white hover:underline block leading-tight mt-1 font-mono"
                    >
                      {emailAddress || 'Info.colormytrip@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Call or WhatsApp Hotline</p>
                    <a
                      href={`tel:${phoneNumber || '+919832012345'}`}
                      className="text-base font-bold text-white hover:underline block leading-tight mt-1 font-mono"
                    >
                      {phoneNumber || '+91 98320 12345'}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Headquarters Address</p>
                    <p className="text-sm font-semibold text-white/95 leading-normal mt-1">
                      {(footerSettings as any)?.headquarters_address ??
                        "Sevoke Road, Near PC Mittal Bus Stand, Siliguri, West Bengal, Pin 734001, India"}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Guarantees with border */}
            <div className="border-t border-white/10 mt-8 pt-6 space-y-3">
              <div className="flex items-center gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold text-indigo-200">Licensed by Government tourism rules</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold text-indigo-200">24/7 dedicated lead on-tour support</span>
              </div>
            </div>

          </div>

          {/* Column 2: Form Panel (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl relative flex flex-col justify-center">

            {success ? (
              /* Submission Successful status */
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-sans text-slate-900">Enquiry Submitted!</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    Your customized enquiry was successfully logged. An email notification has been dropped to our desk at:
                    <span className="block font-bold text-indigo-600 mt-1 font-mono">{emailAddress || 'info.colormytrip@gmail.com'}</span>

                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    We will review the parameters and get back to you along with the custom itinerary drafts via phone/WhatsApp.

                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-3 bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  Write Another Request
                </button>
              </div>
            ) : (
              /* Input Form Fields */
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold font-sans text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span>Submit customized trip request</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Plan an custom tour. Fill out the particulars, and our trip architects will mail a customized itinerary.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 rounded-lg text-red-600 border border-red-100 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleGeneralEnquiry} className="space-y-4">

                  {/* Row 1 - Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-[13.5px] font-medium text-slate-800 transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-[13.5px] font-medium text-slate-800 transition-all focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2 - WhatsApp & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">WhatsApp / Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-[13.5px] font-medium text-slate-800 transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Destination *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kashmir Winter / Ladakh / Bhutan"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-[13.5px] font-medium text-slate-800 transition-all focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3 - Travel Date & Travelers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Approx. Date of Travel *</label>
                      <input
                        type="date"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-[13.5px] text-slate-800 transition-all focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Number of Travelers</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={travelers}
                        onChange={(e) => setTravelers(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-[13.5px] font-medium text-slate-800 transition-all focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Tell us about your dream trip / specific requests</label>
                    <textarea
                      rows={4}
                      placeholder="e.g., We are a family of four. Prefer mid-range hotels, sightseeings at a comfortable pace. Also need homestay experience in Gangtok."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white rounded-xl text-[13.5px] font-medium text-slate-800 transition-all focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending Request...' : 'Send Custom Enquiry'}</span>
                  </button>

                  <p className="text-center text-[10px] text-slate-400">
                    By submitting this form, you acknowledge that our representatives at ColorMyTrip will phone or message you with detailed itineraries.
                  </p>

                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
