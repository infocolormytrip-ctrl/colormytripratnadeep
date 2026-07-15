import React from 'react';
import { useData } from '../context/DataContext';
import { ShieldCheck, HeartHandshake, Compass, Star, Quote, Linkedin, Instagram, Globe, Facebook } from 'lucide-react';


import RatnadepImg from '../assets/Images/ratnadeep.png';
import PoulamiImg from '../assets/Images/poulami.png';
import About_img from '../assets/Images/about_img.png'


export default function About() {
  const { reviews } = useData();

  const metrics = [
    { label: 'Happy Soulful Travelers', value: '4,500+' },
    { label: 'Curated Custom Itineraries', value: '1,200+' },
    { label: 'Professional Local Guides', value: '50+' },
    { label: 'Stellar Ratings (Google/FB)', value: '4.9/5' },
  ];

  const corePillars = [
    {
      title: 'Personalized Travel Planning',
      desc: 'Every itinerary is designed around your preferences—not pre-made templates. From honeymoon trips to family vacations, every journey is uniquely yours.',
      icon: Compass,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Safety & Reliability',
      desc: 'We partner with verified hotels, experienced drivers, trusted local guides, and reliable transport providers to ensure every journey is smooth and secure.',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Transparent Pricing',
      desc: "No hidden charges. No misleading promises. We provide clear quotations with complete itinerary details so you know exactly what you're paying for.",
      icon: HeartHandshake,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
  ];

  const teamMembers = [
    {
      name: 'Poulami Sengupta',
      role: 'Founder & Owner',
      image: PoulamiImg,
      bio: 'Poulami Sengupta is the visionary behind ColorMyTrip, dedicated to crafting memorable travel experiences through personalized planning, comfort, and affordability. A professional actor and accomplished theatre performer, she brings creativity, passion, and a keen eye for storytelling to every journey. Her commitment to exceptional customer service and thoughtfully curated travel experiences continues to inspire and drive the brand forward.',
      socials: [
        { icon: Instagram, href: 'https://www.instagram.com/poulami.sengupta.948/', label: 'Instagram' },
        { icon: Facebook, href: 'https://www.facebook.com/poulami.sengupta.948/', label: 'Facebook' }
      ]
    },
    {
      name: 'Ratnadeep Mukherjee',
      role: 'Co-founder & Travel Expert',
      image: RatnadepImg,
      bio: 'Ratnadeep Mukherjee is a creative designer and travel expert, blending design excellence with extensive travel knowledge. His expertise in destination planning, itinerary curation, and customer experience helps travelers explore the world with confidence, comfort, and authentic local experiences.',
      socials: [
        { icon: Linkedin, href: 'https://www.linkedin.com/in/ratnadeep-mukherjee-301404a8/', label: 'LinkedIn' },
        { icon: Instagram, href: 'https://www.instagram.com/ratnadeep_mukherjee/', label: 'Instagram' },
        { icon: Facebook, href: 'https://www.facebook.com/ratnadeep.mukherjee1/', label: 'Facebook' }
      ]
    }
  ];

  return (
    <div className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Intro Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">

          {/* Text block */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold tracking-wider uppercase">
              <span>Who We Are</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight leading-tight">
              A Travel Company That Believes Every <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Journey Should Tell a Story</span>.
            </h2>

            <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed">
              At ColorMyTrip, we believe travel is more than reaching a destination—it's about creating unforgettable experiences, meaningful connections, and lifelong memories.
            </p>
            <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed">
              Founded with the vision of promoting responsible, personalized, and affordable tourism, we specialize in carefully crafted travel experiences that match every traveler's dream. Whether you're planning a romantic honeymoon, a family vacation, an adventurous mountain escape, a spiritual retreat, or a corporate group tour, we design journeys that feel personal rather than commercial. Today, ColorMyTrip proudly serves travelers across India, Bhutan, Nepal, Bali, Thailand, Dubai, Vietnam, Singapore, and many more exciting destinations, helping thousands of guests travel with confidence and peace of mind.
            </p>

            {/* Metrics list */}
            {/* <div className="grid grid-cols-2 gap-4 pt-4">
               {metrics.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xl sm:text-2xl font-black text-indigo-650 leading-none mb-1">{m.value}</p>
                  <p className="text-xs text-slate-500 font-semibold">{m.label}</p>
                </div>
              ))}
            </div> */}
          </div>

          {/* Visual block */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-lg border border-slate-150">
              <img
                src={About_img}
                alt="ColorMyTrip travel guides team"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/20" />
            </div>

            {/* Overlapping small visual card */}
            <div className="absolute -bottom-20 -left-6 bg-white p-5 rounded-2xl border border-slate-150 shadow-xl max-w-xs hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-normal mb-2">
                "Experience thoughtfully curated journeys with handpicked local homestays, where authenticity, comfort, and meaningful connections replace crowded tourist destinations."
              </p>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">— Team ColorMyTrip</p>
            </div>
          </div>

        </div>

        {/* Core Pillars */}
        <div className="bg-black/10 rounded-3xl p-8 md:p-12 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight">
              Our Core Travel Philosophy
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Every package is designed and coordinated according to three rules of soulfulness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corePillars.map((p, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${p.color}`}>
                  <p.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-2">{p.title}</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Block */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Real Customer Feedback</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight">
              What other soulful travelers say
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Read honest reviews from individuals, couples, and trek groups who travelled with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-150 relative flex flex-col justify-between h-full">
                <Quote className="w-10 h-10 text-indigo-100/70 absolute top-4 right-4" />

                <div className="space-y-4 mb-6">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic relative z-10">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{rev.name}</span>
                  <span className="text-[10px] select-none font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                    {rev.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
              <span>Meet Our Team</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight">
              People behind ColorMyTrip
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Travel experts combining personalization, comfort, and cost-conscious planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="group relative bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-3xl pointer-events-none bg-linear-to-br from-indigo-50/40 via-transparent to-sky-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900">{member.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{member.role}</p>
                    <p className="text-sm leading-relaxed text-slate-600">{member.bio}</p>
                    <div className="flex items-center gap-2 pt-1">
                      {member.socials.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.label}
                          className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <social.icon className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
