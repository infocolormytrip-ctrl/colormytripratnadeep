import React from 'react';
import { Home, Car, Utensils, ShieldCheck, Compass, HelpCircle } from 'lucide-react';

interface InclusionsRowProps {
  inclusions: string[];
}

export default function InclusionsRow({ inclusions }: InclusionsRowProps) {
  const detectInclusions = () => {
    const matched: { icon: React.ReactNode; label: string; key: string }[] = [];
    const lowerInclusions = inclusions.map(item => item.toLowerCase()).join(' ');

    // 1. Accommodation
    if (lowerInclusions.includes('homestay') || lowerInclusions.includes('villa') || lowerInclusions.includes('stay') || lowerInclusions.includes('hotel') || lowerInclusions.includes('accommodation') || lowerInclusions.includes('resort')) {
      matched.push({
        icon: <Home className="w-3.5 h-3.5" />,
        label: 'Stay Included',
        key: 'stay'
      });
    }

    // 2. Transport
    if (lowerInclusions.includes('vehicle') || lowerInclusions.includes('cab') || lowerInclusions.includes('car') || lowerInclusions.includes('transit') || lowerInclusions.includes('transfer') || lowerInclusions.includes('bolero') || lowerInclusions.includes('sumo') || lowerInclusions.includes('sedan')) {
      matched.push({
        icon: <Car className="w-3.5 h-3.5" />,
        label: 'Driver & Cab Included',
        key: 'cab'
      });
    }

    // 3. Food
    if (lowerInclusions.includes('meal') || lowerInclusions.includes('breakfast') || lowerInclusions.includes('dinner') || lowerInclusions.includes('lunch') || lowerInclusions.includes('food')) {
      matched.push({
        icon: <Utensils className="w-3.5 h-3.5" />,
        label: 'Meals Included',
        key: 'meals'
      });
    }

    // 4. Guides
    if (lowerInclusions.includes('guide') || lowerInclusions.includes('briefing') || lowerInclusions.includes('leader') || lowerInclusions.includes('staff')) {
      matched.push({
        icon: <Compass className="w-3.5 h-3.5" />,
        label: 'Local Tour Guide',
        key: 'guide'
      });
    }

    // 5. Permits & Entry
    if (lowerInclusions.includes('permit') || lowerInclusions.includes('entry') || lowerInclusions.includes('pass') || lowerInclusions.includes('permit')) {
      matched.push({
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        label: 'SDF Tax & Permits',
        key: 'permits'
      });
    }

    // Fallback if none matched
    if (matched.length === 0) {
      matched.push({
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        label: 'Inclusions Included',
        key: 'all-inclusive'
      });
    }

    return matched.slice(0, 4); // return up to 4 icons to keep it compact
  };

  const services = detectInclusions();

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3">
      {services.map((svc) => (
        <div
          key={svc.key}
          className="group relative flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50/50 text-indigo-700 border border-indigo-100/30 rounded-md text-[10px] font-bold"
          title={svc.label}
        >
          {svc.icon}
          <span className="text-[9px] font-medium hidden sm:inline text-indigo-700/80">{svc.label.split(' ')[0]}</span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 bg-slate-900 text-white text-[9px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap">
            {svc.label}
          </div>
        </div>
      ))}
    </div>
  );
}
