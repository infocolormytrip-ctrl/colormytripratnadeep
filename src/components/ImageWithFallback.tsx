import React, { useMemo, useState } from 'react';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  loading?: 'eager' | 'lazy';
};

// Tiny inline SVG placeholder so we always show something (no broken-image icons)
const PLACEHOLDER_DATA_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef2ff"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <rect x="80" y="80" width="1040" height="640" rx="28" fill="#ffffff" fill-opacity="0.55" stroke="#cbd5e1"/>
  <path d="M160 620 L360 450 L520 560 L690 390 L1010 620" fill="none" stroke="#6366f1" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="360" cy="450" r="26" fill="#6366f1"/>
  <circle cx="690" cy="390" r="26" fill="#6366f1"/>
  <text x="600" y="700" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="38" fill="#94a3b8" font-weight="700">Image unavailable</text>
</svg>`);

export default function ImageWithFallback({
  src,
  alt,
  className,
  referrerPolicy,
  loading,
}: Props) {
  const [errored, setErrored] = useState(false);

  const finalSrc = useMemo(() => {
    if (!src) return PLACEHOLDER_DATA_URI;
    if (errored) return PLACEHOLDER_DATA_URI;
    return src;
  }, [src, errored]);

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy={referrerPolicy}
      onError={() => setErrored(true)}
    />
  );
}

