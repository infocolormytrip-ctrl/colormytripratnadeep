import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import PackageDetails from '../components/PackageDetails';

export default function PackageRoute() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { packages } = useData();

  const pkg = packages.find((p) => p.id === packageId) || null;

  // Packages load async (Firebase/local). Avoid showing not-found flash.
  // While packages are empty, show nothing (or a skeleton) instead.
  if (!pkg && packages.length === 0) {
    return <div className="py-12 min-h-[50vh]" />;
  }

  if (!pkg) {
    return (
      <div className="py-12 bg-slate-50/45 min-h-[50vh]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">Package not found</h1>
            <p className="text-slate-500 text-sm mt-2">The link you shared may be invalid or the package was removed.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <PackageDetails
      pkg={pkg}
      onBack={() => {
        navigate('/');
      }}
    />
  );
}

