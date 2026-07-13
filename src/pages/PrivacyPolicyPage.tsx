import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';

export default function PrivacyPolicyPage() {
  const { legalSettings } = useData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content = (legalSettings as any)?.privacyPolicy || 'Privacy Policy is currently being updated.';

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 text-slate-700 leading-relaxed space-y-6">
          {content.split('\n').map((line: string, i: number) => (
            line.trim() ? <p key={i}>{line}</p> : <br key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
