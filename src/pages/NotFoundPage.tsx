import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

  .p404-root {
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    position: relative;
    overflow: hidden;
  }

  /* subtle background dots */
  .p404-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.55;
    pointer-events: none;
  }

  /* ── soft gradient blobs ── */
  .p404-blob1 {
    position: absolute;
    top: -80px;
    right: -80px;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .p404-blob2 {
    position: absolute;
    bottom: -60px;
    left: -60px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── main card ── */
  .p404-card {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 480px;
    width: 100%;
  }

  /* ── illustration ── */
  .p404-illustration {
    width: clamp(200px, 60vw, 320px);
    height: auto;
    margin-bottom: 2rem;
    animation: p404Float 5s ease-in-out infinite;
  }

  @keyframes p404Float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }

  /* compass needle spin */
  .p404-needle {
    transform-origin: 50% 50%;
    animation: p404Spin 6s ease-in-out infinite;
  }
  @keyframes p404Spin {
    0%   { transform: rotate(0deg); }
    20%  { transform: rotate(40deg); }
    45%  { transform: rotate(-30deg); }
    70%  { transform: rotate(60deg); }
    90%  { transform: rotate(-15deg); }
    100% { transform: rotate(0deg); }
  }

  /* plane path */
  .p404-plane {
    animation: p404Plane 8s linear infinite;
  }
  @keyframes p404Plane {
    0%   { transform: translate(0px, 0px); }
    50%  { transform: translate(12px, -6px); }
    100% { transform: translate(0px, 0px); }
  }

  /* ── 404 number ── */
  .p404-number {
    font-family: 'Playfair Display', serif;
    font-size: clamp(5rem, 18vw, 7.5rem);
    font-weight: 700;
    color: #111827;
    line-height: 1;
    letter-spacing: -3px;
    margin-bottom: 0.25rem;
    position: relative;
  }
  .p404-number span {
    color: #f59e0b;
  }

  /* ── label ── */
  .p404-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: #fef3c7;
    color: #92400e;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 0.3rem 0.9rem;
    border-radius: 100px;
    margin-bottom: 1.25rem;
  }

  /* ── heading ── */
  .p404-heading {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.4rem, 5vw, 2rem);
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.75rem;
    line-height: 1.25;
  }

  /* ── subtext ── */
  .p404-sub {
    font-size: clamp(0.85rem, 2.8vw, 0.97rem);
    color: #6b7280;
    line-height: 1.7;
    max-width: 360px;
    margin-bottom: 2rem;
  }

  /* ── divider ── */
  .p404-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #d1d5db;
    font-size: 0.75rem;
    margin-bottom: 2rem;
    width: 100%;
    max-width: 320px;
  }
  .p404-divider::before,
  .p404-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  /* ── CTA button ── */
  .p404-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #111827;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.8rem 2rem;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
    letter-spacing: 0.2px;
  }
  .p404-btn:hover {
    background: #1f2937;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.18);
  }
  .p404-btn:active {
    transform: translateY(0);
  }
  .p404-btn svg {
    transition: transform 0.2s ease;
  }
  .p404-btn:hover svg {
    transform: translateX(-2px);
  }

  /* ── secondary link ── */
  .p404-link {
    margin-top: 1rem;
    font-size: 0.82rem;
    color: #9ca3af;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.15s ease;
    border-bottom: 1px dashed #d1d5db;
    padding-bottom: 1px;
  }
  .p404-link:hover {
    color: #f59e0b;
    border-bottom-color: #f59e0b;
  }

  /* ── fun tags at bottom ── */
  .p404-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 2.5rem;
  }
  .p404-tag {
    font-size: 0.72rem;
    color: #9ca3af;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 0.2rem 0.65rem;
    border-radius: 100px;
    transition: border-color 0.15s ease, color 0.15s ease;
  }
  .p404-tag:hover {
    border-color: #f59e0b;
    color: #92400e;
  }

  /* ── responsive ── */
  @media (min-width: 640px) {
    .p404-card { max-width: 520px; }
  }
  @media (min-width: 1024px) {
    .p404-root {
      flex-direction: row;
      justify-content: center;
      gap: 5rem;
      padding: 4rem 3rem;
    }
    .p404-card {
      text-align: left;
      align-items: flex-start;
    }
    .p404-divider { display: none; }
    .p404-illustration {
      width: 380px;
      order: 2;
      margin-bottom: 0;
    }
    .p404-tags { justify-content: flex-start; }
  }
`;

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [dot, setDot] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDot(p => (p + 1) % 3), 600);
    return () => clearInterval(t);
  }, []);

  const dots = ['', '.', '..', '...'];

  return (
    <>
      <style>{css}</style>
      <div className="p404-root">
        <div className="p404-blob1" />
        <div className="p404-blob2" />

        {/* ── Illustration ── */}
        <svg
          className="p404-illustration"
          viewBox="0 0 320 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground shadow */}
          <ellipse cx="160" cy="268" rx="90" ry="8" fill="#f3f4f6" />

          {/* Suitcase body */}
          <rect x="98" y="170" width="84" height="66" rx="10" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
          {/* suitcase stripe */}
          <rect x="98" y="196" width="84" height="14" fill="#fef3c7" />
          {/* suitcase handle */}
          <path d="M126 170 L126 160 Q140 152 154 160 L154 170" stroke="#d1d5db" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* suitcase clasp */}
          <rect x="136" y="200" width="8" height="8" rx="2" fill="#f59e0b" />
          {/* suitcase wheels */}
          <circle cx="112" cy="236" r="5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5" />
          <circle cx="168" cy="236" r="5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5" />
          {/* tag on suitcase */}
          <rect x="158" y="175" width="18" height="13" rx="2" fill="#fde68a" stroke="#f59e0b" strokeWidth="1" />
          <line x1="158" y1="180" x2="155" y2="183" stroke="#f59e0b" strokeWidth="1" />

          {/* Compass */}
          <circle cx="160" cy="108" r="52" fill="white" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx="160" cy="108" r="44" fill="#f9fafb" stroke="#f3f4f6" strokeWidth="1" />
          {/* compass rose lines */}
          <line x1="160" y1="68" x2="160" y2="148" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="120" y1="108" x2="200" y2="108" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="132" y1="80" x2="188" y2="136" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="132" y1="136" x2="188" y2="80" stroke="#f3f4f6" strokeWidth="1" />
          {/* N S E W */}
          <text x="157" y="79" fontSize="8" fill="#9ca3af" fontFamily="Inter,sans-serif" fontWeight="600">N</text>
          <text x="157" y="146" fontSize="8" fill="#9ca3af" fontFamily="Inter,sans-serif" fontWeight="600">S</text>
          <text x="193" y="111" fontSize="8" fill="#9ca3af" fontFamily="Inter,sans-serif" fontWeight="600">E</text>
          <text x="122" y="111" fontSize="8" fill="#9ca3af" fontFamily="Inter,sans-serif" fontWeight="600">W</text>
          {/* Needle */}
          <g className="p404-needle" style={{ transformOrigin: '160px 108px' }}>
            <polygon points="160,76 155,108 160,114 165,108" fill="#f59e0b" />
            <polygon points="160,140 155,108 160,114 165,108" fill="#9ca3af" />
          </g>
          <circle cx="160" cy="108" r="5" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
          <circle cx="160" cy="108" r="2" fill="#111827" />

          {/* Paper plane */}
          <g className="p404-plane" style={{ transformOrigin: '260px 55px' }}>
            <path d="M240 68 L278 48 L268 72 L258 65 Z" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
            <path d="M258 65 L260 78 L268 72" fill="#d1d5db" />
            {/* trail dots */}
            <circle cx="235" cy="71" r="1.5" fill="#fde68a" opacity="0.8" />
            <circle cx="228" cy="74" r="1" fill="#fde68a" opacity="0.5" />
            <circle cx="222" cy="76" r="0.8" fill="#fde68a" opacity="0.3" />
          </g>

          {/* Pin / location marker */}
          <circle cx="68" cy="68" r="14" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <path d="M68 50 C61 50 55 56 55 63 C55 73 68 82 68 82 C68 82 81 73 81 63 C81 56 75 50 68 50 Z" fill="#f59e0b" opacity="0.25" />
          <circle cx="68" cy="62" r="5" fill="#f59e0b" />
          {/* ? mark inside pin */}
          <text x="64" y="72" fontSize="13" fill="#92400e" fontFamily="Playfair Display,serif" fontWeight="700">?</text>
        </svg>

        {/* ── Text card ── */}
        <div className="p404-card">
          <div className="p404-badge">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4.5" stroke="#92400e" strokeWidth="1" />
              <line x1="5" y1="3" x2="5" y2="5.5" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
              <circle cx="5" cy="7" r="0.6" fill="#92400e" />
            </svg>
            Error 404
          </div>

          <div className="p404-number">
            4<span>0</span>4
          </div>

          <h1 className="p404-heading">
            You seem a bit<br />lost, traveller.
          </h1>

          <p className="p404-sub">
            The page you're looking for has wandered off the map{dots[dot]}
            <br />
            Perhaps it took an unexpected detour.
          </p>

          <button className="p404-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </button>

          <span className="p404-link" onClick={() => window.history.back()}>
            ← go back to where you were
          </span>

          <div className="p404-tags">
            {['✈️ Flights', '🏔️ Mountains', '🏖️ Beaches', '🗺️ Explore', '🧳 Pack & Go'].map(t => (
              <span key={t} className="p404-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
