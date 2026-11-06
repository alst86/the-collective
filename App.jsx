import React, { useState, useEffect, useRef, useMemo } from 'react';

// ==========================================
// FIREBASE SETUP
// ==========================================
import { db } from './firebase'; 
import { ref, onValue, set } from 'firebase/database';

const DEFAULT_REDIRECT_URL = 'https://instagram.com/andrewleemagic';
const DEFAULT_FEEDBACK_URL = 'https://andrewleemagic.com/feedback';
const APP_QR_URL = 'https://app.andrewleemagic.com';
const FEEDBACK_DELAY_MS = 30 * 1000; // 30 seconds

const EMOTIONAL_TUNING_PROMPTS = [
  "BREATHE IN UNISON...",
  "A LOVED ONE IS BEING HELD IN MIND",
  "FEEL THEIR PRESENCE IN THE ROOM",
  "EVERY HEARTBEAT TELLS A STORY"
];

const REVEAL_THEMES = [
  { id: 'RIPPLE_WAVE', label: '〰️ Option 1: Ripple + Soundwave', short: 'RIPPLE' },
  { id: 'CONSTELLATION', label: '✨ Option 2: Constellation', short: 'SYNAPSE' },
  { id: 'APERTURE_VORTEX', label: '◎ Option 3: Aperture + Vortex', short: 'APERTURE' },
  { id: 'CLASSIC_SPIRAL', label: '🌀 Classic Spiral', short: 'SPIRAL' }
];

// Exact Custom AL Geometric Monogram Logo
function BrandLogoSVG({ className = "w-14 h-14" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="alCircleClip">
          <circle cx="100" cy="100" r="84" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="84" stroke="#000000" strokeWidth="17" />
      <g clipPath="url(#alCircleClip)">
        <path
          d="M 20 115 L 109 26 L 109 152 L 178 152 L 178 169 L 92 169 L 92 67 L 26 133 Z"
          fill="#000000"
        />
      </g>
    </svg>
  );
}

// ==========================================
// STAGE 1 EMBLEM ANIMATIONS (0.0s – 5.1s)
// ==========================================

// CLASSIC_SPIRAL: True Continuous Archimedean Spiral
const HypnoticSpiralSVG = React.memo(function HypnoticSpiralSVG() {
  const spiralPath = useMemo(() => {
    const pitch = 56;
    const b = pitch / (2 * Math.PI);
    const maxTurns = 22;
    const maxTheta = maxTurns * 2 * Math.PI;
    const step = 0.09;
    const pts = [];

    for (let theta = 0; theta <= maxTheta; theta += step) {
      const r = b * theta;
      const x = (r * Math.cos(theta)).toFixed(1);
      const y = (r * Math.sin(theta)).toFixed(1);
      pts.push(`${theta === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return pts.join(' ');
  }, []);

  return (
    <svg
      viewBox="-600 -600 1200 1200"
      className="absolute w-[185vmax] h-[185vmax] pointer-events-none will-change-transform"
      style={{ animation: 'continuousSpiralFlow 1.35s linear infinite' }}
    >
      <path
        d={spiralPath}
        fill="none"
        stroke="#000000"
        strokeWidth="28"
        strokeLinecap="round"
      />
    </svg>
  );
});

// OPTION 1 (STAGE 1): The "Expanded Resonance" Ripple (The Heartbeat Wave)
const ExpandedResonanceRipple = React.memo(function ExpandedResonanceRipple() {
  constwaves = [0, 0.35, 1.2, 1.55, 2.4, 2.75];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-black">
      {/* Subtle radial atmospheric glow */}
      <div 
        className="absolute w-[110vmax] h-[110vmax] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(220,38,38,0.08) 28%, rgba(0,0,0,0) 68%)',
          animation: 'sonarCoreBreathe 2.4s ease-in-out infinite'
        }}
      />

      {/* Static ultra-thin acoustic rangefinder rings */}
      <svg viewBox="-500 -500 1000 1000" className="absolute w-[115vmin] h-[115vmin] opacity-25">
        <circle cx="0" cy="0" r="160" fill="none" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="3 8" />
        <circle cx="0" cy="0" r="280" fill="none" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2 12" />
        <circle cx="0" cy="0" r="410" fill="none" stroke="#ffffff" strokeWidth="0.5" />
        <line x1="-460" y1="0" x2="-120" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="120" y1="0" x2="460" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="0" y1="-460" x2="0" y2="-120" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="0" y1="120" x2="0" y2="460" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
      </svg>

      {/* Expanding Lub-Dub Organic Sonar Shockwaves */}
      {waves.map((delay, idx) => {
        const isDub = idx % 2 === 1;
        return (
          <div
            key={idx}
            className="absolute w-40 h-40 rounded-full pointer-events-none will-change-transform"
            style={{
              border: isDub ? '1.5px solid rgba(255, 255, 255, 0.55)' : '2.5px solid rgba(255, 255, 255, 0.85)',
              boxShadow: isDub
                ? '0 0 25px rgba(255, 255, 255, 0.2), inset 0 0 18px rgba(220, 38, 38, 0.18)'
                : '0 0 40px rgba(255, 255, 255, 0.38), inset 0 0 25px rgba(255, 255, 255, 0.22)',
              animation: 'organicSonarWave 3.6s cubic-bezier(0.16, 0.84, 0.44, 1) infinite',
              animationDelay: `${delay}s`,
              opacity: 0,
            }}
          />
        );
      })}
    </div>
  );
});

// OPTION 2 (STAGE 1): The "Constellation of Thought" (Synapse Network)
const ConstellationOfThought = React.memo(function ConstellationOfThought() {
  const { nodes, edges } = useMemo(() => {
    const pts = [
      { id: 0, x: -160, y: -260, r: 3.5, delay: '0s' },
      { id: 1, x: 45, y: -310, r: 2.5, delay: '0.6s' },
      { id: 2, x: 215, y: -220, r: 4, delay: '1.1s' },
      { id: 3, x: -310, y: -110, r: 3, delay: '0.3s' },
      { id: 4, x: -135, y: -125, r: 4.5, delay: '1.5s' },
      { id: 5, x: 145, y: -120, r: 3.5, delay: '0.8s' },
      { id: 6, x: 325, y: -75, r: 2.8, delay: '1.9s' },
      { id: 7, x: -360, y: 55, r: 2.5, delay: '0.4s' },
      { id: 8, x: -195, y: 35, r: 4.2, delay: '1.2s' },
      { id: 9, x: 195, y: 45, r: 4, delay: '0.2s' },
      { id: 10, x: 355, y: 95, r: 3, delay: '1.4s' },
      { id: 11, x: -245, y: 215, r: 3.5, delay: '0.9s' },
      { id: 12, x: -95, y: 165, r: 4.5, delay: '1.7s' },
      { id: 13, x: 110, y: 175, r: 3.8, delay: '0.5s' },
      { id: 14, x: 265, y: 235, r: 3.2, delay: '1.3s' },
      { id: 15, x: -40, y: 325, r: 2.8, delay: '0.7s' },
      { id: 16, x: 135, y: 330, r: 3, delay: '1.6s' },
      { id: 17, x: -255, y: -340, r: 2.2, delay: '2.1s' },
      { id: 18, x: 295, y: -330, r: 2.4, delay: '0.4s' },
      { id: 19, x: -295, y: 345, r: 2.5, delay: '1.8s' },
    ];

    const connections = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dist = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (dist < 235) {
          connections.push({
            id: `${i}-${j}`,
            x1: pts[i].x,
            y1: pts[i].y,
            x2: pts[j].x,
            y2: pts[j].y,
            opacity: Number((1 - dist / 250).toFixed(2)) * 0.55,
            delay: `${((i + j) % 7) * 0.4}s`
          });
        }
      }
    }
    return { nodes: pts, edges: connections };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-black">
      <div 
        className="absolute w-[95vmin] h-[95vmin] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 45%, transparent 72%)'
        }}
      />

      <svg
        viewBox="-450 -450 900 900"
        className="absolute w-[115vmax] h-[115vmax] will-change-transform"
        style={{ animation: 'constellationSlowDrift 22s ease-in-out infinite alternate' }}
      >
        <defs>
          <filter id="synapseGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Radial threads linking center AL badge to inner neural ring */}
        {nodes.slice(0, 14).map((n) => (
          <line
            key={`core-${n.id}`}
            x1="0"
            y1="0"
            x2={n.x}
            y2={n.y}
            stroke="#ffffff"
            strokeWidth="0.7"
            strokeOpacity="0.16"
            strokeDasharray="4 6"
          />
        ))}

        {/* Synaptic Web Connections */}
        {edges.map((e) => (
          <line
            key={e.id}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke="#ffffff"
            strokeWidth="1.15"
            strokeOpacity={e.opacity}
            style={{
              animation: 'synapseLinePulse 3.4s ease-in-out infinite',
              animationDelay: e.delay
            }}
          />
        ))}

        {/* Breathing Neural Nodes */}
        {nodes.map((n) => (
          <g
            key={n.id}
            style={{
              animation: 'neuralNodeFloat 4.8s ease-in-out infinite alternate',
              animationDelay: n.delay
            }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r * 2.6}
              fill="rgba(255,255,255,0.14)"
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="#ffffff"
              filter="url(#synapseGlow)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
});

// OPTION 3 (STAGE 1): The "Focus Aperture" (The Expanding Mind's Eye)
const FocusApertureIris = React.memo(function FocusApertureIris({ isDilating }) {
  const tickAngles = useMemo(() => Array.from({ length: 72 }).map((_, i) => i * 5), []);
  const bladeAngles = useMemo(() => Array.from({ length: 8 }).map((_, i) => i * 45), []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-[#070708]">
      {/* Subtle optical vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, rgba(0,0,0,0.85) 68%, #000000 100%)'
        }}
      />

      <div
        className="relative flex items-center justify-center w-[110vmin] h-[110vmin] will-change-transform transition-transform duration-700 ease-in"
        style={{
          transform: isDilating ? 'scale(2.65)' : 'scale(1)',
          animation: isDilating ? 'none' : 'apertureBreathe 3.8s ease-in-out infinite'
        }}
      >
        <svg viewBox="-500 -500 1000 1000" className="w-full h-full">
          <defs>
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#27272a" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#18181b" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#09090b" stopOpacity="0.92" />
            </linearGradient>
          </defs>

          {/* Outer Precision Calibration Ring & Degree Ticks */}
          <g style={{ animation: 'continuousSpiralFlow 28s linear infinite' }}>
            <circle cx="0" cy="0" r="420" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <circle cx="0" cy="0" r="385" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" strokeDasharray="6 10" />
            {tickAngles.map((deg) => {
              const isMajor = deg % 30 === 0;
              const r1 = isMajor ? 402 : 410;
              const r2 = 420;
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={(r1 * Math.cos(rad)).toFixed(1)}
                  y1={(r1 * Math.sin(rad)).toFixed(1)}
                  x2={(r2 * Math.cos(rad)).toFixed(1)}
                  y2={(r2 * Math.sin(rad)).toFixed(1)}
                  stroke="#ffffff"
                  strokeOpacity={isMajor ? '0.6' : '0.22'}
                  strokeWidth={isMajor ? '1.8' : '0.9'}
                />
              );
            })}
          </g>

          {/* Counter-Rotating Optical Rangefinder Ring */}
          <g style={{ animation: 'continuousSpiralFlowReverse 18s linear infinite' }}>
            <circle cx="0" cy="0" r="330" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="80 40 12 40" />
            <circle cx="0" cy="0" r="295" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
          </g>

          {/* 8 Mechanical Camera Shutter Blades */}
          <g style={{ animation: 'shutterIrisTwist 3.8s ease-in-out infinite' }}>
            {bladeAngles.map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <path
                  d="M 105 -45 C 185 -120, 290 -115, 325 -15 C 260 45, 165 55, 105 -45 Z"
                  fill="url(#bladeGrad)"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1.2"
                />
              </g>
            ))}
          </g>

          {/* Inner Crisp Lens Reticle */}
          <circle cx="0" cy="0" r="142" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.75" />
          <circle cx="0" cy="0" r="154" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" strokeDasharray="4 6" />
        </svg>
      </div>
    </div>
  );
});

// ==========================================
// STAGE 2 LETTER CLOUD ANIMATIONS (5.1s – 10.0s)
// ==========================================

// OPTION 1A (STAGE 2): The "Shimmering Soundwave"
const ShimmeringSoundwaveLetters = React.memo(function ShimmeringSoundwaveLetters({ particles }) {
  const bars = useMemo(() => Array.from({ length: 44 }).map((_, i) => ({
    id: i,
    delay: `${(i * 0.07).toFixed(2)}s`,
    maxH: 25 + Math.sin((i / 44) * Math.PI) * 140
  })), []);

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden select-none pointer-events-none">
      {/* Horizontal Acoustic Forcefield Glow */}
      <div
        className="absolute inset-x-0 h-56 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.07) 35%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.07) 65%, transparent 100%)'
        }}
      />

      {/* Oscillating Multi-Harmonic Sine Waveforms */}
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-x-0 w-full h-64 opacity-45">
        <path
          d="M 0 150 Q 125 40, 250 150 T 500 150 T 750 150 T 1000 150"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          style={{ animation: 'soundwaveMorph 1.1s ease-in-out infinite alternate' }}
        />
        <path
          d="M 0 150 Q 125 240, 250 150 T 500 150 T 750 150 T 1000 150"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeOpacity="0.6"
          style={{ animation: 'soundwaveMorph 0.85s ease-in-out infinite alternate-reverse' }}
        />
        <line x1="0" y1="150" x2="1000" y2="150" stroke="#ffffff" strokeWidth="0.75" strokeOpacity="0.35" strokeDasharray="6 8" />
      </svg>

      {/* High-Frequency Vertical Equalizer Filaments */}
      <div className="absolute inset-x-0 flex items-center justify-between px-2 opacity-30">
        {bars.map((b) => (
          <div
            key={b.id}
            className="w-[1.5px] bg-white rounded-full"
            style={{
              height: `${b.maxH}px`,
              animation: 'frequencyBarPulse 0.65s ease-in-out infinite alternate',
              animationDelay: b.delay
            }}
          />
        ))}
      </div>

      {/* Shimmering Typographic Fragments & Alphanumeric Dust */}
      {particles.map((p, i) => {
        const bandTop = 28 + ((i * 13) % 44); // Concentrated within the horizontal soundwave band (28% to 72%)
        return (
          <span
            key={p.id}
            style={{
              left: p.left,
              top: `${bandTop}%`,
              fontSize: p.size,
              '--amp': `${(i % 2 === 0 ? -1 : 1) * (18 + (i % 5) * 12)}px`,
              animation: `shimmerSoundwaveChar ${0.55 + (i % 5) * 0.14}s ease-in-out infinite alternate`,
              animationDelay: `${(i % 7) * 0.08}s`,
              textShadow: '0 0 14px rgba(255,255,255,0.75)'
            }}
            className="absolute font-mono font-bold text-white select-none pointer-events-none"
          >
            {p.char}
          </span>
        );
      })}
    </div>
  );
});

// OPTION 1B / OPTION 3 (STAGE 2): The "Magnetic Vortex"
const MagneticVortexLetters = React.memo(function MagneticVortexLetters({ particles }) {
  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden select-none pointer-events-none">
      {/* Swirling Gravitational Whirlpool Rings */}
      <svg
        viewBox="-500 -500 1000 1000"
        className="absolute w-[130vmax] h-[130vmax] opacity-35 will-change-transform"
        style={{ animation: 'continuousSpiralFlow 3.2s linear infinite' }}
      >
        {[90, 155, 225, 305, 390].map((r, idx) => (
          <ellipse
            key={idx}
            cx="0"
            cy="0"
            rx={r}
            ry={Math.round(r * 0.86)}
            transform={`rotate(${idx * 36})`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2.2 - idx * 0.3}
            strokeDasharray={`${90 + idx * 30} ${55 + idx * 20}`}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Center Gravitational Singularity Glow */}
      <div
        className="absolute w-44 h-44 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 52%, transparent 75%)'
        }}
      />

      {/* Swirling Orbital Letters Pulling Inward */}
      {particles.map((p, i) => {
        const startAngle = (i * 360) / particles.length;
        const startRadius = 150 + (i % 4) * 55;
        return (
          <div
            key={p.id}
            className="absolute flex items-center justify-center will-change-transform"
            style={{
              '--start-angle': `${startAngle}deg`,
              '--start-radius': `${startRadius}px`,
              animation: `vortexOrbitInward ${2.4 + (i % 4) * 0.45}s cubic-bezier(0.35, 0, 0.65, 1) infinite`,
              animationDelay: `${(i % 6) * 0.3}s`
            }}
          >
            <span
              style={{
                fontSize: p.size,
                textShadow: '0 0 16px rgba(255,255,255,0.65)'
              }}
              className="font-sans font-extrabold text-white select-none"
            >
              {p.char}
            </span>
          </div>
        );
      })}
    </div>
  );
});

// OPTION 2B (STAGE 2): "Synaptic Convergence" (Constellation Letter Nodes)
const SynapticConvergenceLetters = React.memo(function SynapticConvergenceLetters({ particles }) {
  const synapticMesh = useMemo(() => {
    const subset = particles.slice(0, 18).map((p, idx) => {
      const angle = (idx / 18) * 2 * Math.PI;
      const ring = idx % 2 === 0 ? 150 : 275;
      return {
        ...p,
        nx: Math.round(Math.cos(angle) * ring),
        ny: Math.round(Math.sin(angle) * ring * 1.25),
      };
    });

    const lines = [];
    for (let i = 0; i < subset.length; i++) {
      const next = subset[(i + 1) % subset.length];
      const across = subset[(i + 3) % subset.length];
      lines.push({ id: `l1-${i}`, x1: subset[i].nx, y1: subset[i].ny, x2: next.nx, y2: next.ny });
      lines.push({ id: `l2-${i}`, x1: subset[i].nx, y1: subset[i].ny, x2: across.nx, y2: across.ny });
    }
    return { subset, lines };
  }, [particles]);

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden select-none pointer-events-none">
      <svg
        viewBox="-400 -500 800 1000"
        className="w-full h-full max-w-lg will-change-transform"
        style={{ animation: 'synapticMeshContract 4.2s ease-in-out infinite alternate' }}
      >
        {/* Connecting Synaptic Filaments Between Letters */}
        {synapticMesh.lines.map((l, idx) => (
          <line
            key={l.id}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#ffffff"
            strokeWidth="1.1"
            strokeOpacity="0.28"
            style={{
              animation: 'synapseLinePulse 2.2s ease-in-out infinite',
              animationDelay: `${(idx % 5) * 0.3}s`
            }}
          />
        ))}

        {/* Letter Constellation Nodes */}
        {synapticMesh.subset.map((node, i) => (
          <g
            key={node.id}
            style={{
              animation: 'neuralNodeFloat 3.2s ease-in-out infinite alternate',
              animationDelay: `${(i % 6) * 0.25}s`
            }}
          >
            <circle cx={node.nx} cy={node.ny} r="22" fill="#000000" fillOpacity="0.65" />
            <circle cx={node.nx} cy={node.ny} r="18" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
            <text
              x={node.nx}
              y={node.ny + 8}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="24"
              fontWeight="800"
              fontFamily="sans-serif"
            >
              {node.char}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
});

const formatValidUrl = (rawUrl, fallbackUrl) => {
  let clean = (rawUrl || fallbackUrl || '').trim();
  if (!clean) return fallbackUrl;
  if (!clean.startsWith('http') && !clean.includes('://')) {
    clean = `https://${clean}`;
  }
  return clean;
};

// Arms both a 30-second live tab timer AND a one-time sessionStorage return trap
const executeGuaranteedRedirect = (rawPrimaryUrl, rawFeedbackUrl, isAudience = true) => {
  const finalPrimaryUrl = formatValidUrl(rawPrimaryUrl, DEFAULT_REDIRECT_URL);
  const finalFeedbackUrl = formatValidUrl(rawFeedbackUrl, DEFAULT_FEEDBACK_URL);
  const startTime = Date.now();

  if (isAudience) {
    try {
      sessionStorage.setItem('pulseRedirectTimestamp', String(startTime));
      sessionStorage.setItem('pulseFeedbackUrl', finalFeedbackUrl);
    } catch (e) {}
  }

  let hasRedirectedToFeedback = false;

  const goToFeedback = () => {
    if (hasRedirectedToFeedback) return;
    hasRedirectedToFeedback = true;
    try {
      sessionStorage.removeItem('pulseRedirectTimestamp');
      sessionStorage.removeItem('pulseFeedbackUrl');
    } catch (e) {}
    window.location.replace(finalFeedbackUrl);
  };

  const timerId = setTimeout(goToFeedback, FEEDBACK_DELAY_MS);

  const handleBrowserWake = () => {
    if (document.visibilityState === 'visible') {
      const elapsed = Date.now() - startTime;
      if (elapsed >= FEEDBACK_DELAY_MS) {
        clearTimeout(timerId);
        goToFeedback();
      } else {
        clearTimeout(timerId);
        setTimeout(goToFeedback, FEEDBACK_DELAY_MS - elapsed);
      }
    }
  };

  document.addEventListener('visibilitychange', handleBrowserWake);
  window.addEventListener('pageshow', handleBrowserWake);
  window.addEventListener('focus', handleBrowserWake);

  window.location.href = finalPrimaryUrl;
};

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const [isMasterView, setIsMasterView] = useState(() => searchParams.has('master'));
  const [skipEntryPrompt, setSkipEntryPrompt] = useState(false);
  const roomID = searchParams.get('room') || 'v2-stage';

  return isMasterView ? (
    <ControlView 
      roomID={roomID} 
      onSwitchToHeartbeatView={() => {
        setSkipEntryPrompt(true);
        setIsMasterView(false);
      }}
    />
  ) : (
    <AudienceView 
      roomID={roomID} 
      skipEntryPrompt={skipEntryPrompt}
      onEnterMaster={() => setIsMasterView(true)}
    />
  );
}

// ==========================================
// AUDIENCE VIEW (Spectator's Phone - Option A)
// ==========================================
function AudienceView({ roomID, skipEntryPrompt = false, onEnterMaster }) {
  const [cameraReady, setCameraReady] = useState(skipEntryPrompt);
  const [isFlashing, setIsFlashing] = useState(false); 
  const [dbStatus, setDbStatus] = useState('waiting'); 
  
  const [kickerWord, setKickerWord] = useState('');
  const kickerWordRef = useRef('');
  const [revealWord, setRevealWord] = useState('');
  const [revealTheme, setRevealTheme] = useState('RIPPLE_WAVE');
  const [holdUpPromptActive, setHoldUpPromptActive] = useState(true);
  const [uiReady, setUiReady] = useState(false);

  const [promptIndex, setPromptIndex] = useState(0);
  const [promptFade, setPromptFade] = useState(true);
  const [isThumbHolding, setIsThumbHolding] = useState(false);
  const [thumbFocused, setThumbFocused] = useState(false);
  const thumbHoldTimerRef = useRef(null);

  const [stagePhase, setStagePhase] = useState('PULSE');
  const [spiralVisible, setSpiralVisible] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [apertureDilating, setApertureDilating] = useState(false);
  const [lettersVisible, setLettersVisible] = useState(false);
  const [convergeActive, setConvergeActive] = useState(false);
  const phaseTimeoutsRef = useRef([]);

  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const initialLoadRef = useRef(true); 
  const isRedirectingRef = useRef(false);
  const feedbackUrlRef = useRef(DEFAULT_FEEDBACK_URL);

  const audioCtxRef = useRef(null);
  const silentAudioRef = useRef(null);

  const idleTimerRef = useRef(null);
  const IDLE_TIMEOUT_MS = 180 * 1000; 
  const IDLE_FALLBACK_URL = ""; 

  const clearPhaseTimeouts = () => {
    phaseTimeoutsRef.current.forEach(clearTimeout);
    phaseTimeoutsRef.current = [];
  };

  const resetIdleTimer = () => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (IDLE_FALLBACK_URL) window.location.replace(IDLE_FALLBACK_URL);
    }, IDLE_TIMEOUT_MS);
  };
  
  const secretClickCount = useRef(0);
  const secretLastClickTime = useRef(0);

  useEffect(() => {
    if (skipEntryPrompt) {
      startCamera();
    }
  }, [skipEntryPrompt]);

  useEffect(() => {
    if (!cameraReady || stagePhase !== 'PULSE') return;
    const interval = setInterval(() => {
      setPromptFade(false);
      setTimeout(() => {
        setPromptIndex((prev) => (prev + 1) % EMOTIONAL_TUNING_PROMPTS.length);
        setPromptFade(true);
      }, 400);
    }, 4500);
    return () => clearInterval(interval);
  }, [cameraReady, stagePhase]);

  const decoyParticles = useMemo(() => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      char: alphabet[Math.floor(Math.random() * alphabet.length)],
      left: `${6 + Math.floor(Math.random() * 84)}%`,
      top: `${8 + Math.floor(Math.random() * 82)}%`,
      size: `${1.5 + (i % 4) * 0.9}rem`,
      opacity: 0.15 + (i % 5) * 0.16,
      dx: `${(i % 2 === 0 ? 1 : -1) * (20 + (i * 7) % 45)}px`,
      dy: `${(i % 3 === 0 ? -1 : 1) * (25 + (i * 11) % 50)}px`,
      duration: `${3.2 + (i % 4) * 0.8}s`,
    }));
  }, []);

  const targetChars = useMemo(() => {
    const clean = (revealWord || kickerWord || 'JAMES').trim().toUpperCase();
    return clean.split('').map((ch, idx) => {
      const angle = (idx * 137.5) * (Math.PI / 180);
      const radius = 90 + (idx % 3) * 45;
      return {
        ch,
        startX: Math.round(Math.cos(angle) * radius),
        startY: Math.round(Math.sin(angle) * radius * 1.4),
      };
    });
  }, [revealWord, kickerWord]);

  useEffect(() => {
    const checkPendingFeedbackRedirect = () => {
      try {
        const savedTime = Number(sessionStorage.getItem('pulseRedirectTimestamp') || 0);
        const savedUrl = sessionStorage.getItem('pulseFeedbackUrl') || DEFAULT_FEEDBACK_URL;
        if (!savedTime) return;

        const elapsed = Date.now() - savedTime;
        if (elapsed > 5 * 60 * 1000) {
          sessionStorage.removeItem('pulseRedirectTimestamp');
          sessionStorage.removeItem('pulseFeedbackUrl');
          return;
        }

        if (elapsed >= FEEDBACK_DELAY_MS) {
          sessionStorage.removeItem('pulseRedirectTimestamp');
          sessionStorage.removeItem('pulseFeedbackUrl');
          window.location.replace(savedUrl);
        } else if (elapsed >= 2000) {
          setTimeout(() => {
            sessionStorage.removeItem('pulseRedirectTimestamp');
            sessionStorage.removeItem('pulseFeedbackUrl');
            window.location.replace(savedUrl);
          }, FEEDBACK_DELAY_MS - elapsed);
        }
      } catch (e) {}
    };

    checkPendingFeedbackRedirect();
    window.addEventListener('pageshow', checkPendingFeedbackRedirect);
    return () => window.removeEventListener('pageshow', checkPendingFeedbackRedirect);
  }, []);

  const unlockAudio = () => {
    try {
      if ('audioSession' in navigator) {
        navigator.audioSession.type = 'playback';
      }

      if (!silentAudioRef.current) {
        const sampleRate = 8000;
        const numSamples = sampleRate; 
        const buffer = new ArrayBuffer(44 + numSamples);
        const view = new DataView(buffer);
        const writeStr = (offset, str) => {
          for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
        };
        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + numSamples, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); 
        view.setUint16(22, 1, true); 
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate, true);
        view.setUint16(32, 1, true);
        view.setUint16(34, 8, true); 
        writeStr(36, 'data');
        view.setUint32(40, numSamples, true);
        for (let i = 0; i < numSamples; i++) view.setUint8(44 + i, 128); 

        const blob = new Blob([buffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.loop = true;
        audio.setAttribute('playsinline', '');
        audio.setAttribute('x-webkit-airplay', 'deny');
        audio.play().catch(() => {});
        silentAudioRef.current = audio;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
      }
    } catch (e) {}
  };

  const playHeartbeatThud = (mode = false) => {
    if (isRedirectingRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      const oscSub = ctx.createOscillator();
      const oscPunch = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      oscSub.type = 'triangle';
      oscPunch.type = 'sine';

      const isStrobe = mode === 'strobe';
      const isSecondBeat = mode === true || mode === 'dub';

      const startFreq = isStrobe ? 225 : isSecondBeat ? 210 : 185;
      const endFreq = isStrobe ? 65 : isSecondBeat ? 70 : 58;
      const duration = isStrobe ? 0.11 : isSecondBeat ? 0.14 : 0.18;
      const peakGain = isStrobe ? 3.0 : isSecondBeat ? 2.4 : 3.5;

      oscSub.frequency.setValueAtTime(startFreq, now);
      oscSub.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      oscPunch.frequency.setValueAtTime(startFreq * 1.5, now);
      oscPunch.frequency.exponentialRampToValueAtTime(endFreq * 1.2, now + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isStrobe ? 380 : 340, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscSub.connect(filter);
      oscPunch.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      oscSub.start(now);
      oscPunch.start(now);
      oscSub.stop(now + duration + 0.02);
      oscPunch.stop(now + duration + 0.02);
    } catch (e) {}
  };

  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {}
    };

    if (cameraReady) requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible' && cameraReady) {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock !== null) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cameraReady]);

  const startCamera = async () => {
    unlockAudio();
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (err) {}

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      // Fallback
    } finally {
      setCameraReady(true); 
    }
  };

  const applyTorch = async (active, beatType = 'lub') => {
    if (isRedirectingRef.current && active) return;
    setIsFlashing(active); 

    if (active) {
      if (beatType === 'strobe') {
        playHeartbeatThud('strobe');
        if (navigator.vibrate) navigator.vibrate(50);
      } else if (beatType === 'dub') {
        playHeartbeatThud(true);
        if (navigator.vibrate) navigator.vibrate(70);
      } else {
        playHeartbeatThud(false);
        if (navigator.vibrate) navigator.vibrate(100);
      }
    }

    if (!trackRef.current) return;
    try {
      await trackRef.current.applyConstraints({ advanced: [{ torch: active }] });
    } catch (err) {}
  };

  const handleThumbDown = (e) => {
    e.stopPropagation();
    unlockAudio();
    setIsThumbHolding(true);
    playHeartbeatThud(false);
    if (navigator.vibrate) navigator.vibrate(60);

    clearTimeout(thumbHoldTimerRef.current);
    thumbHoldTimerRef.current = setTimeout(() => {
      setThumbFocused(true);
      playHeartbeatThud(true);
      if (navigator.vibrate) navigator.vibrate([50, 80, 90]);
    }, 900);
  };

  const handleThumbUp = () => {
    setIsThumbHolding(false);
    clearTimeout(thumbHoldTimerRef.current);
  };

  const runRevealSequence = (wordToReveal, incomingTheme) => {
    clearPhaseTimeouts();
    clearTimeout(timerRef.current);
    applyTorch(false);

    if (incomingTheme) setRevealTheme(incomingTheme);

    const finalWord = (wordToReveal || kickerWordRef.current || 'JAMES').trim();
    setRevealWord(finalWord);
    setConvergeActive(false);
    setSpiralVisible(false);
    setBadgeVisible(false);
    setApertureDilating(false);
    setLettersVisible(false);

    setStagePhase('SPIRAL');
    const t0 = setTimeout(() => setBadgeVisible(true), 60);
    const tSpiralIn = setTimeout(() => setSpiralVisible(true), 350);

    const tDilate = setTimeout(() => {
      setApertureDilating(true);
    }, 4100);

    const tSpiralOut = setTimeout(() => {
      setSpiralVisible(false);
      setBadgeVisible(false);
    }, 4300);

    const t1 = setTimeout(() => {
      setStagePhase('LETTERS');
      setTimeout(() => setLettersVisible(true), 80);
    }, 5100);

    const tLettersOut = setTimeout(() => {
      setLettersVisible(false);
    }, 9300);

    const t2 = setTimeout(() => {
      setStagePhase('CONVERGE');
      setTimeout(() => setConvergeActive(true), 60);
    }, 10000);

    const t3 = setTimeout(() => {
      setStagePhase('LOCKED');
    }, 11200);

    phaseTimeoutsRef.current = [t0, tSpiralIn, tDilate, tSpiralOut, t1, tLettersOut, t2, t3];
  };

  useEffect(() => {
    const uiTimer = setTimeout(() => setUiReady(true), 300);

    const feedbackRef = ref(db, `${roomID}/feedbackUrl`);
    const unsubFeedback = onValue(feedbackRef, (snapshot) => {
      const val = snapshot.val();
      if (val && String(val).trim() !== '') {
        feedbackUrlRef.current = String(val).trim();
      } else {
        feedbackUrlRef.current = DEFAULT_FEEDBACK_URL;
      }
    });

    const textRef = ref(db, `${roomID}/buttonText`);
    const unsubText = onValue(textRef, (snapshot) => {
      const val = snapshot.val();
      const cleaned = val && val.trim() !== '' ? val.trim() : '';
      setKickerWord(cleaned);
      kickerWordRef.current = cleaned;
    });

    const holdUpRef = ref(db, `${roomID}/promptHoldUp`);
    const unsubHoldUp = onValue(holdUpRef, (snapshot) => {
      const val = snapshot.val();
      setHoldUpPromptActive(val === null ? true : Boolean(val));
    });

    const styleRef = ref(db, `${roomID}/revealStyle`);
    const unsubStyle = onValue(styleRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setRevealTheme(String(val));
    });

    const commandRef = ref(db, `${roomID}/audienceCommand`);
    const unsubCommand = onValue(commandRef, (snapshot) => {
      setDbStatus('live');
      const command = snapshot.val();
      if (command) {
        const safeCommand = String(command);
        const baseCmd = safeCommand.split('|')[0];
        const isInitialLoad = initialLoadRef.current;
        
        if (isInitialLoad) {
          initialLoadRef.current = false;
          if (baseCmd === 'REDIRECT' || baseCmd === 'PHASE_REVEAL') return; 
        }
        handleCommand(command, isInitialLoad);
      }
    }, () => { setDbStatus('error'); });
    
    return () => {
      clearTimeout(uiTimer);
      clearTimeout(thumbHoldTimerRef.current);
      clearPhaseTimeouts();
      unsubFeedback();
      unsubCommand();
      unsubText();
      unsubHoldUp();
      unsubStyle();
      clearTimeout(timerRef.current);
      clearTimeout(idleTimerRef.current);
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [roomID]);

  const handleCommand = (command, isInitialLoad = false) => {
    clearTimeout(timerRef.current);
    clearTimeout(idleTimerRef.current);
    
    const safeCommand = String(command);
    const parts = safeCommand.split('|');
    const baseCmd = parts[0];
    
    if (baseCmd === 'PHASE_1_RESET') {
      clearPhaseTimeouts();
      applyTorch(false);
      setThumbFocused(false);
      setSpiralVisible(false);
      setBadgeVisible(false);
      setApertureDilating(false);
      setLettersVisible(false);
      setConvergeActive(false);
      setStagePhase('PULSE');
    } else if (baseCmd === 'PHASE_REVEAL') {
      const passedWord = (parts[2] || '').trim();
      const passedTheme = (parts[3] || '').trim();
      runRevealSequence(passedWord, passedTheme);
    } else if (baseCmd === 'ON') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      applyTorch(true, 'lub');
    } else if (baseCmd === 'OFF') {
      applyTorch(false);
      if (!isInitialLoad) resetIdleTimer();
    } else if (baseCmd === 'STRIKE_LUB') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      applyTorch(true, 'lub');
      timerRef.current = setTimeout(() => applyTorch(false), 140);
    } else if (baseCmd === 'STRIKE_DUB') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      applyTorch(true, 'dub');
      timerRef.current = setTimeout(() => applyTorch(false), 110);
    } else if (baseCmd === 'BLINK') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      const pattern = [100, 150, 100, 650]; 
      let step = 0;
      const playHeartbeat = () => {
        if (isRedirectingRef.current) return;
        const duration = pattern[step];
        const isOn = (step === 0 || step === 2); 
        const beatType = step === 2 ? 'dub' : 'lub';
        applyTorch(isOn, beatType);
        step = (step + 1) % pattern.length;
        timerRef.current = setTimeout(playHeartbeat, duration);
      };
      playHeartbeat();
    } else if (baseCmd === 'STROBE') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      let strobeOn = true;
      const playStrobe = () => {
        if (isRedirectingRef.current) return;
        applyTorch(strobeOn, 'strobe');
        const randomDelay = strobeOn
          ? Math.floor(Math.random() * 45) + 55
          : Math.floor(Math.random() * 65) + 60;
        strobeOn = !strobeOn;
        timerRef.current = setTimeout(playStrobe, randomDelay);
      };
      playStrobe();
    } else if (baseCmd === 'REDIRECT') {
      isRedirectingRef.current = true;
      clearPhaseTimeouts();
      clearTimeout(timerRef.current);
      setIsFlashing(false);

      if (trackRef.current) {
        try {
          trackRef.current.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
          trackRef.current.stop();
        } catch (e) {}
      }
      if (silentAudioRef.current) {
        try { silentAudioRef.current.pause(); } catch (e) {}
      }
      if (navigator.vibrate) navigator.vibrate(0);

      const rawUrl = (parts[2] || '').trim();
      const passedFeedbackUrl = (parts[3] || '').trim();

      executeGuaranteedRedirect(
        rawUrl || DEFAULT_REDIRECT_URL,
        passedFeedbackUrl || feedbackUrlRef.current,
        true
      );
    }
  };

  const handleSecretClick = () => {
    const currentTime = new Date().getTime();
    if (currentTime - secretLastClickTime.current < 500) secretClickCount.current += 1;
    else secretClickCount.current = 1;
    secretLastClickTime.current = currentTime;

    if (secretClickCount.current === 5) {
      secretClickCount.current = 0;
      if (onEnterMaster) {
        onEnterMaster();
      } else {
        const separator = window.location.search ? '&' : '?';
        window.location.href = window.location.pathname + window.location.search + separator + 'master=true';
      }
    }
  };

  const isClassicSpiral = revealTheme === 'CLASSIC_SPIRAL';

  return (
    <div className={`min-h-[100dvh] relative flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden select-none ${
      stagePhase === 'SPIRAL' ? (isClassicSpiral ? 'bg-white text-black' : 'bg-black text-white') :
      (stagePhase === 'LETTERS' || stagePhase === 'CONVERGE' || stagePhase === 'LOCKED') ? 'bg-black text-white' :
      !cameraReady ? 'bg-[#f4f4f2] text-black' :
      isFlashing ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <style>{`
        @keyframes continuousSpiralFlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes continuousSpiralFlowReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes organicSonarWave {
          0% { transform: scale(0.85); opacity: 0.95; }
          70% { opacity: 0.35; }
          100% { transform: scale(6.2); opacity: 0; }
        }
        @keyframes sonarCoreBreathe {
          0%, 100% { transform: scale(0.92); opacity: 0.65; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes constellationSlowDrift {
          0% { transform: rotate(-4deg) scale(0.96); }
          100% { transform: rotate(4deg) scale(1.06); }
        }
        @keyframes synapseLinePulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.72; }
        }
        @keyframes neuralNodeFloat {
          0% { transform: translate(-8px, -6px); }
          100% { transform: translate(8px, 6px); }
        }
        @keyframes apertureBreathe {
          0%, 100% { transform: scale(0.92); }
          50% { transform: scale(1.08); }
        }
        @keyframes shutterIrisTwist {
          0%, 100% { transform: rotate(-8deg) scale(0.95); }
          50% { transform: rotate(10deg) scale(1.06); }
        }
        @keyframes soundwaveMorph {
          0% { transform: scaleY(0.35); }
          100% { transform: scaleY(1.35); }
        }
        @keyframes frequencyBarPulse {
          0% { transform: scaleY(0.2); opacity: 0.25; }
          100% { transform: scaleY(1.15); opacity: 0.85; }
        }
        @keyframes shimmerSoundwaveChar {
          0% { transform: translateY(calc(var(--amp) * -1)) scale(0.85); opacity: 0.18; filter: blur(1px); }
          50% { opacity: 0.95; filter: blur(0px); }
          100% { transform: translateY(var(--amp)) scale(1.12); opacity: 0.3; filter: blur(0.5px); }
        }
        @keyframes vortexOrbitInward {
          0% {
            transform: rotate(var(--start-angle)) translateX(var(--start-radius)) rotate(calc(var(--start-angle) * -1)) scale(1.15);
            opacity: 0;
          }
          20% { opacity: 0.85; }
          80% { opacity: 0.75; }
          100% {
            transform: rotate(calc(var(--start-angle) + 540deg)) translateX(12px) rotate(calc((var(--start-angle) + 540deg) * -1)) scale(0.35);
            opacity: 0;
          }
        }
        @keyframes synapticMeshContract {
          0% { transform: scale(1.04) rotate(-2deg); }
          100% { transform: scale(0.86) rotate(2deg); }
        }
        @keyframes floatLetter {
          0% { transform: translate(0px, 0px); opacity: 0.15; }
          50% { transform: translate(var(--dx), var(--dy)); opacity: 0.85; }
          100% { transform: translate(calc(var(--dx) * -0.6), calc(var(--dy) * 0.6)); opacity: 0.2; }
        }
        @keyframes artisticHeartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.06); }
          28% { transform: scale(0.99); }
          42% { transform: scale(1.035); }
          70% { transform: scale(1); }
        }
        @keyframes subtleAura {
          0%, 100% { transform: scale(0.95); opacity: 0.18; }
          50% { transform: scale(1.12); opacity: 0.04; }
        }
        @keyframes inwardThoughtWave {
          0% { transform: scale(3.6); opacity: 0; }
          25% { opacity: 0.28; }
          85% { opacity: 0.12; }
          100% { transform: scale(0.15); opacity: 0; }
        }
      `}</style>

      <div className="absolute top-4 left-4 z-50 opacity-20">
        <div className={`w-3 h-3 rounded-full ${dbStatus === 'live' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : dbStatus === 'error' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-500 animate-pulse'}`}></div>
      </div>

      <div 
        onPointerDown={(e) => { e.stopPropagation(); handleSecretClick(); }} 
        className="absolute bottom-0 right-0 w-32 h-32 z-[100] bg-black/0 touch-none" 
      />

      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {/* STAGE 1 OF REVEAL: THEMED EMBLEM + CENTER AL LOGO */}
      {stagePhase === 'SPIRAL' && (
        <div className={`relative flex items-center justify-center w-full min-h-[100dvh] overflow-hidden ${isClassicSpiral ? 'bg-white' : 'bg-black'}`}>
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${spiralVisible ? 'opacity-100' : 'opacity-0'}`}>
            {revealTheme === 'RIPPLE_WAVE' && <ExpandedResonanceRipple />}
            {revealTheme === 'CONSTELLATION' && <ConstellationOfThought />}
            {revealTheme === 'APERTURE_VORTEX' && <FocusApertureIris isDilating={apertureDilating} />}
            {revealTheme === 'CLASSIC_SPIRAL' && <HypnoticSpiralSVG />}
          </div>

          <div className={`relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-white ${
            isClassicSpiral
              ? 'shadow-[0_10px_45px_rgba(0,0,0,0.22)]'
              : 'shadow-[0_0_60px_rgba(255,255,255,0.45)]'
          } flex items-center justify-center transition-all duration-700 ease-in-out ${badgeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <BrandLogoSVG className="w-14 h-14" />
          </div>
        </div>
      )}

      {/* STAGE 2 OF REVEAL: THEMED LETTER CLOUD */}
      {stagePhase === 'LETTERS' && (
        <div className={`relative w-full min-h-[100dvh] bg-black overflow-hidden transition-opacity duration-700 ease-in-out ${lettersVisible ? 'opacity-100' : 'opacity-0'}`}>
          {revealTheme === 'RIPPLE_WAVE' && <ShimmeringSoundwaveLetters particles={decoyParticles} />}
          {revealTheme === 'APERTURE_VORTEX' && <MagneticVortexLetters particles={decoyParticles} />}
          {revealTheme === 'CONSTELLATION' && <SynapticConvergenceLetters particles={decoyParticles} />}
          {revealTheme === 'CLASSIC_SPIRAL' && decoyParticles.map((p) => (
            <span
              key={p.id}
              style={{
                left: p.left,
                top: p.top,
                fontSize: p.size,
                opacity: p.opacity,
                '--dx': p.dx,
                '--dy': p.dy,
                animation: `floatLetter ${p.duration} ease-in-out infinite alternate`,
              }}
              className="absolute font-sans font-bold text-white select-none pointer-events-none"
            >
              {p.char}
            </span>
          ))}
        </div>
      )}

      {(stagePhase === 'CONVERGE' || stagePhase === 'LOCKED') && (
        <div className="relative flex items-center justify-center w-full min-h-[100dvh] bg-black px-4 overflow-hidden">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 flex-wrap">
            {targetChars.map((item, idx) => (
              <span
                key={idx}
                style={{
                  opacity: convergeActive || stagePhase === 'LOCKED' ? 1 : 0,
                  transform: convergeActive || stagePhase === 'LOCKED'
                    ? 'translate(0px, 0px) scale(1)'
                    : `translate(${item.startX}px, ${item.startY}px) scale(0.85)`,
                  transition: 'transform 1.15s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease',
                }}
                className="text-white font-black text-5xl sm:text-6xl uppercase tracking-widest inline-block"
              >
                {item.ch}
              </span>
            ))}
          </div>
        </div>
      )}

      {stagePhase === 'PULSE' && (
        !cameraReady ? (
          <div 
            onClick={startCamera}
            className={`relative flex flex-col items-center justify-between w-full min-h-[100dvh] py-12 px-6 z-10 cursor-pointer transition-opacity duration-700 ease-in-out overflow-hidden ${uiReady ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="flex items-center space-x-2.5 pt-2 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d91b1b] shadow-[0_0_8px_#d91b1b] animate-pulse"></span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.38em] text-zinc-500">
                Touch the Heart
              </span>
            </div>

            <div className="relative flex items-center justify-center w-full my-auto">
              <div 
                className="absolute w-[92vw] max-w-[420px] aspect-square rounded-full bg-red-600/10 blur-2xl pointer-events-none"
                style={{ animation: 'subtleAura 3.6s ease-in-out infinite' }}
              />
              <div 
                className="absolute w-[78vw] max-w-[350px] aspect-square rounded-full border border-red-600/15 pointer-events-none"
                style={{ animation: 'subtleAura 2.2s ease-in-out infinite' }}
              />

              <div 
                className="relative flex items-center justify-center w-[88vw] max-w-[390px] aspect-square transition-transform active:scale-95"
                style={{ animation: 'artisticHeartbeat 2.2s infinite ease-in-out' }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-full h-full text-[#d91b1b] fill-current drop-shadow-[0_22px_45px_rgba(217,27,27,0.32)]"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pb-5 px-8 text-center pointer-events-none">
                  <span className="text-[9px] font-medium uppercase tracking-[0.42em] text-white/75 mb-2">
                    Begin
                  </span>
                  <span className="text-base sm:text-lg font-extrabold uppercase tracking-[0.32em] text-white drop-shadow-sm">
                    Experiment
                  </span>
                  <div className="w-6 h-[1px] bg-white/40 mt-3.5" />
                </div>
              </div>
            </div>

            <div className="w-full max-w-xs text-center pb-2">
              <p className="text-zinc-400 text-[9.5px] font-medium uppercase tracking-[0.26em] leading-relaxed">
                Please allow camera access when prompted to join the experience
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute top-16 left-0 right-0 w-full px-8 text-center pointer-events-none z-20 flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-red-600/80">
                  Collective Resonance
                </span>
              </div>
              <p 
                className={`text-xs sm:text-sm font-bold uppercase tracking-[0.24em] leading-relaxed max-w-xs transition-opacity duration-500 ${
                  promptFade ? 'opacity-90' : 'opacity-0'
                } ${isFlashing ? 'text-zinc-200' : 'text-zinc-600'}`}
              >
                {EMOTIONAL_TUNING_PROMPTS[promptIndex]}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
              <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <svg 
                  viewBox="0 0 400 100" 
                  className={`w-full max-w-md h-24 transition-all duration-150 ${
                    isFlashing || isThumbHolding 
                      ? 'opacity-65 scale-y-125' 
                      : 'opacity-20 scale-y-100'
                  }`}
                >
                  <polyline
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,50 130,50 148,50 158,36 168,62 180,14 194,86 206,40 218,50 270,50 400,50"
                  />
                </svg>
              </div>

              <div 
                onPointerDown={handleThumbDown}
                onPointerUp={handleThumbUp}
                onPointerLeave={handleThumbUp}
                onPointerCancel={handleThumbUp}
                onContextMenu={(e) => e.preventDefault()}
                className="relative flex items-center justify-center w-56 h-56 cursor-pointer touch-none z-10"
              >
                <div 
                  className="absolute w-24 h-24 border border-red-600/40 rounded-full pointer-events-none"
                  style={{ animation: `inwardThoughtWave ${isThumbHolding ? '1.6s' : '3.6s'} cubic-bezier(0.2, 0.8, 0.4, 1) infinite` }}
                />
                <div 
                  className="absolute w-24 h-24 border border-red-600/30 rounded-full pointer-events-none"
                  style={{ animation: `inwardThoughtWave ${isThumbHolding ? '1.6s' : '3.6s'} cubic-bezier(0.2, 0.8, 0.4, 1) infinite 1.2s` }}
                />
                <div 
                  className="absolute w-24 h-24 border border-red-600/25 rounded-full pointer-events-none"
                  style={{ animation: `inwardThoughtWave ${isThumbHolding ? '1.6s' : '3.6s'} cubic-bezier(0.2, 0.8, 0.4, 1) infinite 2.4s` }}
                />

                {isThumbHolding && (
                  <div className="absolute w-32 h-32 rounded-full bg-red-600/20 animate-ping pointer-events-none" />
                )}

                <div 
                  className={`rounded-full bg-red-600 transition-all duration-200 shadow-[0_0_25px_rgba(220,38,38,0.65)] ${
                    isThumbHolding ? 'w-11 h-11 scale-110' : thumbFocused ? 'w-8 h-8' : 'w-7 h-7'
                  }`}
                />
              </div>

              <div className="mt-2 text-center pointer-events-none z-20 px-6">
                {thumbFocused ? (
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-red-600">
                    ♥ Presence Felt
                  </p>
                ) : isThumbHolding ? (
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-red-500">
                    ♥ Feeling the Pulse...
                  </p>
                ) : (
                  <p className="text-[9.5px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400">
                    Hold Thumb on Pulse to Focus
                  </p>
                )}
              </div>
            </div>

            <div className="absolute bottom-14 left-0 right-0 w-full text-center px-6 pointer-events-none z-20 space-y-2.5">
              <div
                className={`transition-all duration-1000 ease-in-out ${
                  holdUpPromptActive
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                <h1 className="text-[26px] sm:text-[28px] font-black uppercase tracking-[0.15em] leading-tight">
                  Hold up your<br/>phone
                </h1>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.28em] ${isFlashing ? 'text-zinc-300' : 'text-zinc-400'}`}>
                Let their memory fill the room
              </p>
            </div>
          </>
        )
      )}
    </div>
  );
}

// ==========================================
// SHOW CONTROL VIEW (Your Master Deck - Option A)
// ==========================================
function ControlView({ roomID, onSwitchToHeartbeatView }) {
  const [isReady, setIsReady] = useState(false);
  const trackRef = useRef(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [localMode, setLocalMode] = useState('OFF');
  const [audienceMode, setAudienceMode] = useState('OFF');
  const [activePhase, setActivePhase] = useState('PHASE_1');

  // LIVE REVEAL THEME SELECTOR STATE
  const [revealTheme, setRevealTheme] = useState(() => localStorage.getItem('magicRevealStyle') || 'RIPPLE_WAVE');
  const revealThemeRef = useRef(revealTheme);

  // PALM-LOCK DOUBLE-TAP STATES (Starts LOCKED by default)
  const [isCuesTouchLocked, setIsCuesTouchLocked] = useState(true);
  const isCuesTouchLockedRef = useRef(true);
  const [cueLockConfirmArmed, setCueLockConfirmArmed] = useState(false);
  const cueLockConfirmTimeoutRef = useRef(null);

  const [masterMonitorPhase, setMasterMonitorPhase] = useState('NONE');
  const masterMonitorPhaseRef = useRef('NONE');
  const [masterSpiralVisible, setMasterSpiralVisible] = useState(false);
  const [masterBadgeVisible, setMasterBadgeVisible] = useState(false);
  const [masterApertureDilating, setMasterApertureDilating] = useState(false);
  const [masterLettersVisible, setMasterLettersVisible] = useState(false);
  const [masterConvergeActive, setMasterConvergeActive] = useState(false);
  const [masterRevealWord, setMasterRevealWord] = useState('');
  const masterPhaseTimeoutsRef = useRef([]);

  const [redirectUrl, setRedirectUrl] = useState(() => localStorage.getItem('magicRedirectUrl') || '');
  const [feedbackUrl, setFeedbackUrl] = useState(() => localStorage.getItem('magicFeedbackUrl') || DEFAULT_FEEDBACK_URL);
  const [redirectStatus, setRedirectStatus] = useState('HOLD TO REDIRECT');
  const [customText, setCustomText] = useState('');
  
  const [injectUrl, setInjectUrl] = useState(() => localStorage.getItem('magicInjectUrl') || '');
  const [injectKey, setInjectKey] = useState(() => localStorage.getItem('magicInjectKey') || 'peek');
  const [isInjectSyncing, setIsInjectSyncing] = useState(() => {
    const saved = localStorage.getItem('magicInjectSyncing');
    return saved !== null ? JSON.parse(saved) : true; 
  });
  const [peekedWord, setPeekedWord] = useState('');
  const peekedWordRef = useRef('');
  const lastInjectRef = useRef('');
  const isBaselineCaptureRef = useRef(true);
  const [holdUpPromptSent, setHoldUpPromptSent] = useState(false);

  const [lastKey, setLastKey] = useState('NONE'); 
  const hiddenInputRef = useRef(null);
  const deckContainerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [recConfirmArmed, setRecConfirmArmed] = useState(false);
  const recConfirmTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [recordedSequence, setRecordedSequence] = useState([]);
  const recordedSequenceRef = useRef([]);
  const recordingStartRef = useRef(0);
  const playbackTimeoutsRef = useRef([]);

  const localTimerRef = useRef(null);
  const localPressTimer = useRef(null);
  const localStepRef = useRef(0);
  const isLocalPressing = useRef(false);
  
  const audiencePressTimer = useRef(null);
  const isAudiencePressing = useRef(false);

  const redirectPressTimer = useRef(null);
  const isRedirectPressing = useRef(false);

  const overlayExitClickCount = useRef(0);
  const overlayExitLastClickTime = useRef(0);

  const overlaySwipeRef = useRef({
    startX: null,
    startY: null,
    startTime: 0,
    swiped: false,
    multiTouch: false
  });

  const updateMasterMonitorPhase = (nextPhase) => {
    masterMonitorPhaseRef.current = nextPhase;
    setMasterMonitorPhase(nextPhase);
  };

  const masterDecoyParticles = useMemo(() => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      char: alphabet[Math.floor(Math.random() * alphabet.length)],
      left: `${6 + Math.floor(Math.random() * 84)}%`,
      top: `${8 + Math.floor(Math.random() * 82)}%`,
      size: `${1.5 + (i % 4) * 0.9}rem`,
      opacity: 0.15 + (i % 5) * 0.16,
      dx: `${(i % 2 === 0 ? 1 : -1) * (20 + (i * 7) % 45)}px`,
      dy: `${(i % 3 === 0 ? -1 : 1) * (25 + (i * 11) % 50)}px`,
      duration: `${3.2 + (i % 4) * 0.8}s`,
    }));
  }, []);

  const masterTargetChars = useMemo(() => {
    const clean = (masterRevealWord || peekedWord || customText || 'JAMES').trim().toUpperCase();
    return clean.split('').map((ch, idx) => {
      const angle = (idx * 137.5) * (Math.PI / 180);
      const radius = 90 + (idx % 3) * 45;
      return {
        ch,
        startX: Math.round(Math.cos(angle) * radius),
        startY: Math.round(Math.sin(angle) * radius * 1.4),
      };
    });
  }, [masterRevealWord, peekedWord, customText]);

  const clearMasterPhaseTimeouts = () => {
    masterPhaseTimeoutsRef.current.forEach(clearTimeout);
    masterPhaseTimeoutsRef.current = [];
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`magicSequence_${roomID}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecordedSequence(parsed);
        recordedSequenceRef.current = parsed;
      }
    } catch (e) {}
  }, [roomID]);

  // Sync Reveal Style to LocalStorage & Firebase
  useEffect(() => {
    revealThemeRef.current = revealTheme;
    localStorage.setItem('magicRevealStyle', revealTheme);
    set(ref(db, `${roomID}/revealStyle`), revealTheme).catch(() => {});
  }, [revealTheme, roomID]);

  useEffect(() => {
    const textRef = ref(db, `${roomID}/buttonText`);
    const unsubText = onValue(textRef, (snapshot) => {
      const val = snapshot.val();
      const cleaned = val && String(val).trim() !== '' ? String(val).trim() : '';
      if (cleaned) {
        setPeekedWord(cleaned);
        peekedWordRef.current = cleaned;
      }
    });

    const holdUpRef = ref(db, `${roomID}/promptHoldUp`);
    const unsubHoldUp = onValue(holdUpRef, (snapshot) => {
      setHoldUpPromptSent(Boolean(snapshot.val()));
    });

    return () => {
      unsubText();
      unsubHoldUp();
    };
  }, [roomID]);

  useEffect(() => {
    if (!isRecording) {
      localStorage.setItem(`magicSequence_${roomID}`, JSON.stringify(recordedSequence));
    }
  }, [recordedSequence, isRecording, roomID]);

  useEffect(() => {
    localStorage.setItem('magicInjectUrl', injectUrl);
    localStorage.setItem('magicInjectKey', injectKey);
    localStorage.setItem('magicInjectSyncing', JSON.stringify(isInjectSyncing));
    localStorage.setItem('magicRedirectUrl', redirectUrl);
    localStorage.setItem('magicFeedbackUrl', feedbackUrl);

    const activeFeedback = (feedbackUrl && feedbackUrl.trim() !== '') ? feedbackUrl.trim() : DEFAULT_FEEDBACK_URL;
    set(ref(db, `${roomID}/feedbackUrl`), activeFeedback).catch(() => {});
  }, [injectUrl, injectKey, isInjectSyncing, redirectUrl, feedbackUrl, roomID]);

  useEffect(() => {
    let timer;
    const executeMasterPoll = async () => {
      if (!isInjectSyncing || !injectUrl || !injectUrl.trim()) return;
      try {
        const cleanEndpoint = injectUrl.trim();
        const sep = cleanEndpoint.includes('?') ? '&' : '?';
        const urlWithBust = `${cleanEndpoint}${sep}_t=${Date.now()}`;

        let text = "";
        try {
          const res = await fetch(urlWithBust, { cache: 'no-store' });
          if (!res.ok) throw new Error();
          text = await res.text();
        } catch (e) {
          const targetUrl = encodeURIComponent(urlWithBust);
          const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}&_t=${Date.now()}`;
          const res2 = await fetch(proxyUrl, { cache: 'no-store' });
          text = await res2.text();
        }

        let word = "";
        try {
          const json = JSON.parse(text);
          const keyToPoll = injectKey.trim() || 'peek';
          if (json && json[keyToPoll] !== undefined && json[keyToPoll] !== null) {
            word = String(json[keyToPoll]).trim();
          } else if (json && json.data && json.data[keyToPoll] !== undefined) {
            word = String(json.data[keyToPoll]).trim();
          } else if (typeof json === 'string') {
            word = json.trim();
          }
        } catch (e) {
          const rawText = (text || '').trim();
          if (rawText && !rawText.startsWith('<') && rawText.length < 60) {
            word = rawText;
          }
        }

        if (word) {
          if (isBaselineCaptureRef.current) {
            isBaselineCaptureRef.current = false;
            lastInjectRef.current = word;
            setPeekedWord(word);
            peekedWordRef.current = word;
          } else if (word !== lastInjectRef.current) {
            lastInjectRef.current = word;
            setPeekedWord(word);
            peekedWordRef.current = word;
            set(ref(db, `${roomID}/buttonText`), word);
            set(ref(db, `${roomID}/promptHoldUp`), true);
          }
        } else if (isBaselineCaptureRef.current) {
          isBaselineCaptureRef.current = false;
        }
      } catch (e) {}
    };

    if (isInjectSyncing && injectUrl) {
      executeMasterPoll();
      timer = setInterval(executeMasterPoll, 1500); 
    }
    return () => clearInterval(timer);
  }, [isInjectSyncing, injectUrl, injectKey, roomID]);

  // PERMANENT FLIC / BLUETOOTH KEYBOARD LOCK
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => { trackRef.current = stream.getVideoTracks()[0]; setIsReady(true); })
      .catch(() => { setIsReady(true); });

    const keepRemoteLocked = () => {
      const activeEl = document.activeElement;
      const isTypingInSettings = activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'text' && activeEl !== hiddenInputRef.current;
      if (!isTypingInSettings) {
        if (hiddenInputRef.current) {
          hiddenInputRef.current.focus({ preventScroll: true });
        }
      }
    };

    const focusInterval = setInterval(keepRemoteLocked, 600);

    const handleKeyDown = (e) => {
      if (e.repeat) return; 
      const activeEl = document.activeElement;
      const isTypingInSettings = activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'text' && activeEl !== hiddenInputRef.current;
      if (isTypingInSettings) return;
      
      const k = e.key;
      setLastKey(k);

      if (k === 'i' || k === 'I') { e.preventDefault(); fireInstantRedirect(); return; }
      if (k === 'r' || k === 'R') { e.preventDefault(); triggerPhase2Reveal(); return; }
      if (k === 'q' || k === 'Q') { e.preventDefault(); setShowQrModal((prev) => !prev); return; }
      if (isPlayingRef.current) { handleStopPlayback(); return; }
      if (k === 'p' || k === 'P') { e.preventDefault(); handlePlayToggle(); return; }
      
      if (k === 'u' || k === 'U') { e.preventDefault(); toggleLocalTorch(); }
      else if (k === 'b' || k === 'B') { e.preventDefault(); startLocalHeartbeat(); }
      else if (k === 's' || k === 'S') { e.preventDefault(); startLocalStrobe(); }
      else if (k === 'd' || k === 'D') { e.preventDefault(); toggleAudienceTorch(); }
      else if (k === 't' || k === 'T') { e.preventDefault(); startAudienceHeartbeat(); }
      else if (k === 'e' || k === 'E') { e.preventDefault(); startAudienceStrobe(); }
    };

    const handleKeyUp = (e) => {
      const activeEl = document.activeElement;
      const isTypingInSettings = activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'text' && activeEl !== hiddenInputRef.current;
      if (isTypingInSettings) return;

      const k = e.key;
      if (k === 'b' || k === 'B') { e.preventDefault(); stopLocalHeartbeat(); }
      else if (k === 't' || k === 'T') { e.preventDefault(); stopAudienceHeartbeat(); }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      clearInterval(focusInterval);
      clearTimeout(recConfirmTimeoutRef.current);
      clearTimeout(cueLockConfirmTimeoutRef.current);
      clearMasterPhaseTimeouts();
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [localMode, audienceMode, redirectUrl, feedbackUrl]); 

  const handleCueLockButtonTap = () => {
    if (!cueLockConfirmArmed) {
      setCueLockConfirmArmed(true);
      clearTimeout(cueLockConfirmTimeoutRef.current);
      cueLockConfirmTimeoutRef.current = setTimeout(() => {
        setCueLockConfirmArmed(false);
      }, 1500);
      return;
    }

    clearTimeout(cueLockConfirmTimeoutRef.current);
    setCueLockConfirmArmed(false);
    const nextLockedState = !isCuesTouchLockedRef.current;
    isCuesTouchLockedRef.current = nextLockedState;
    setIsCuesTouchLocked(nextLockedState);
  };

  const handleSetCustomText = () => {
    set(ref(db, `${roomID}/buttonText`), customText);
    set(ref(db, `${roomID}/promptHoldUp`), Boolean(customText && customText.trim() !== ''));
    setPeekedWord(customText);
    peekedWordRef.current = customText;
    lastInjectRef.current = customText;
  };
  const handleClearCustomText = () => {
    setCustomText('');
    setPeekedWord('');
    peekedWordRef.current = '';
    lastInjectRef.current = '';
    set(ref(db, `${roomID}/buttonText`), '');
    set(ref(db, `${roomID}/promptHoldUp`), false);
  };

  const recordCue = (target, cmd) => {
    if (isRecordingRef.current) {
      const offset = Date.now() - recordingStartRef.current;
      const newCue = { target, cmd, offset };
      setRecordedSequence(prev => [...prev, newCue]);
      recordedSequenceRef.current.push(newCue);
    }
  };

  const getTargetRedirectUrl = () => {
    return formatValidUrl(redirectUrl, DEFAULT_REDIRECT_URL);
  };

  const getTargetFeedbackUrl = () => {
    return formatValidUrl(feedbackUrl, DEFAULT_FEEDBACK_URL);
  };

  const fireAudienceCommand = (cmd, isPlayback = false) => {
    if (!isPlayback) recordCue('AUDIENCE', cmd);
    if (isPlayback && (cmd === 'ON' || cmd === 'OFF' || cmd === 'BLINK' || cmd === 'STROBE')) {
      setAudienceMode(cmd);
    }
    
    let payload = `${cmd}|${Date.now()}`;
    if (cmd === 'REDIRECT') {
      payload = `REDIRECT|${Date.now()}|${getTargetRedirectUrl()}|${getTargetFeedbackUrl()}`;
    } else if (cmd === 'PHASE_REVEAL') {
      const wordToBroadcast = peekedWordRef.current || customText || 'JAMES';
      payload = `PHASE_REVEAL|${Date.now()}|${wordToBroadcast}|${revealThemeRef.current}`;
    }
    
    return set(ref(db, `${roomID}/audienceCommand`), payload).catch(err => {
      alert(`🔥 FIREBASE SYNC BLOCKED: ${err.message}`);
    });
  };

  const runMasterMonitorSequence = (wordToReveal) => {
    clearMasterPhaseTimeouts();
    setMasterRevealWord(wordToReveal);
    setMasterConvergeActive(false);
    setMasterSpiralVisible(false);
    setMasterBadgeVisible(false);
    setMasterApertureDilating(false);
    setMasterLettersVisible(false);

    updateMasterMonitorPhase('SPIRAL');
    const t0 = setTimeout(() => setMasterBadgeVisible(true), 60);
    const tSpiralIn = setTimeout(() => setMasterSpiralVisible(true), 350);

    const tDilate = setTimeout(() => {
      setMasterApertureDilating(true);
    }, 4100);

    const tSpiralOut = setTimeout(() => {
      setMasterSpiralVisible(false);
      setMasterBadgeVisible(false);
    }, 4300);

    const t1 = setTimeout(() => {
      updateMasterMonitorPhase('LETTERS');
      setTimeout(() => setMasterLettersVisible(true), 80);
    }, 5100);

    const tLettersOut = setTimeout(() => {
      setMasterLettersVisible(false);
    }, 9300);

    const t2 = setTimeout(() => {
      updateMasterMonitorPhase('CONVERGE');
      setTimeout(() => setMasterConvergeActive(true), 60);
    }, 10000);

    const t3 = setTimeout(() => {
      updateMasterMonitorPhase('LOCKED');
      setActivePhase('PHASE_2_DONE');
    }, 11200);

    masterPhaseTimeoutsRef.current = [t0, tSpiralIn, tDilate, tSpiralOut, t1, tLettersOut, t2, t3];
  };

  const resetToPhase1Pulse = () => {
    clearMasterPhaseTimeouts();
    setMasterSpiralVisible(false);
    setMasterBadgeVisible(false);
    setMasterApertureDilating(false);
    setMasterLettersVisible(false);
    setMasterConvergeActive(false);
    updateMasterMonitorPhase('NONE');
    setActivePhase('PHASE_1');
    setAudienceMode('OFF');
    isBaselineCaptureRef.current = true;
    set(ref(db, `${roomID}/promptHoldUp`), true);
    fireAudienceCommand('PHASE_1_RESET');
  };

  const triggerPhase2Reveal = () => {
    const wordToBroadcast = (peekedWordRef.current || customText || 'JAMES').trim();
    setActivePhase('REVEALING');
    setAudienceMode('OFF');
    fireAudienceCommand('PHASE_REVEAL');
    runMasterMonitorSequence(wordToBroadcast);
  };

  const executeSynchronizedRedirect = async () => {
    clearMasterPhaseTimeouts();
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearTimeout(localTimerRef.current);
    applyLocalTorch(false);
    setAudienceMode('OFF');

    const finalUrl = getTargetRedirectUrl();
    const targetFeedback = getTargetFeedbackUrl();
    setRedirectStatus('FIRED!');

    try {
      await Promise.race([
        fireAudienceCommand('REDIRECT'),
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (e) {}

    executeGuaranteedRedirect(finalUrl, targetFeedback, false);
  };

  const handleRecordButtonTap = () => {
    if (isRecordingRef.current) {
      setIsRecording(false);
      isRecordingRef.current = false;
      setRecConfirmArmed(false);
      clearTimeout(recConfirmTimeoutRef.current);
      return;
    }

    if (!recConfirmArmed) {
      setRecConfirmArmed(true);
      clearTimeout(recConfirmTimeoutRef.current);
      recConfirmTimeoutRef.current = setTimeout(() => {
        setRecConfirmArmed(false);
      }, 1500);
      return;
    }

    clearTimeout(recConfirmTimeoutRef.current);
    setRecConfirmArmed(false);
    if (isPlayingRef.current) handleStopPlayback();
    setRecordedSequence([]); 
    recordedSequenceRef.current = [];
    recordingStartRef.current = Date.now();
    setIsRecording(true);
    isRecordingRef.current = true;
  };

  const handlePlayToggle = () => {
    if (isPlayingRef.current) handleStopPlayback();
    else {
      if (isRecordingRef.current) {
        setIsRecording(false);
        isRecordingRef.current = false;
      }
      if (recordedSequenceRef.current.length === 0) return;
      
      setIsPlaying(true);
      isPlayingRef.current = true;
      playbackTimeoutsRef.current.forEach(clearTimeout);
      playbackTimeoutsRef.current = [];

      let maxOffset = 0;
      recordedSequenceRef.current.forEach(({ target, cmd, offset }) => {
        const actualTarget = target || 'AUDIENCE';
        if (offset > maxOffset) maxOffset = offset;
        
        const tid = setTimeout(() => {
          if (actualTarget === 'AUDIENCE') fireAudienceCommand(cmd, true);
          else if (actualTarget === 'LOCAL') {
            if (cmd === 'ON') turnLocalOn(true);
            else if (cmd === 'OFF') turnLocalOff(true);
            else if (cmd === 'BLINK') startLocalHeartbeat(true);
            else if (cmd === 'STROBE') startLocalStrobe(true);
          }
        }, offset);
        
        playbackTimeoutsRef.current.push(tid);
      });

      const endTid = setTimeout(() => {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }, maxOffset + 500);
      playbackTimeoutsRef.current.push(endTid);
    }
  };

  const handleStopPlayback = () => {
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setIsPlaying(false);
    isPlayingRef.current = false;
    setAudienceMode('OFF');
    set(ref(db, `${roomID}/audienceCommand`), `OFF|${Date.now()}`);
    turnLocalOff(true); 
  };

  const applyLocalTorch = (active) => {
    if (trackRef.current) {
      trackRef.current.applyConstraints({ advanced: [{ torch: active }] }).catch(() => {});
    }
  };

  const turnLocalOn = (isPlayback = false) => {
    if (!isPlayback) recordCue('LOCAL', 'ON');
    clearTimeout(localTimerRef.current);
    setLocalMode('ON');
    applyLocalTorch(true);
  };

  const turnLocalOff = (isPlayback = false) => {
    if (!isPlayback) recordCue('LOCAL', 'OFF');
    clearTimeout(localTimerRef.current);
    setLocalMode('OFF');
    applyLocalTorch(false);
  };

  const toggleLocalTorch = () => localMode === 'OFF' ? turnLocalOn() : turnLocalOff();
  
  const startLocalHeartbeat = (isPlayback = false) => {
    if (!isPlayback) recordCue('LOCAL', 'BLINK');
    clearTimeout(localTimerRef.current);
    setLocalMode('BLINK');
    localStepRef.current = 0;
    const pattern = [100, 150, 100, 650]; 
    const playLocalHeartbeat = () => {
      const isOn = (localStepRef.current === 0 || localStepRef.current === 2);
      applyLocalTorch(isOn);
      localStepRef.current = (localStepRef.current + 1) % pattern.length;
      localTimerRef.current = setTimeout(playLocalHeartbeat, pattern[localStepRef.current]);
    };
    playLocalHeartbeat();
  };
  const stopLocalHeartbeat = () => turnLocalOff();
  const toggleLocalHeartbeat = () => localMode === 'BLINK' ? stopLocalHeartbeat() : startLocalHeartbeat();

  const startLocalStrobe = (isPlayback = false) => {
    if (!isPlayback) recordCue('LOCAL', 'STROBE');
    clearTimeout(localTimerRef.current);
    setLocalMode('STROBE');
    const playLocalStrobe = () => {
      const isOn = Math.random() > 0.5;
      applyLocalTorch(isOn);
      const delay = Math.floor(Math.random() * 90) + 60;
      localTimerRef.current = setTimeout(playLocalStrobe, delay);
    };
    playLocalStrobe();
  };
  const toggleLocalStrobe = () => localMode === 'STROBE' ? turnLocalOff() : startLocalStrobe();

  const handleLocalDown = (fromRemote = false) => {
    if (!fromRemote && isCuesTouchLockedRef.current) return;
    if (isLocalPressing.current) return;
    isLocalPressing.current = true;
    localPressTimer.current = setTimeout(() => {
      localPressTimer.current = null;
      startLocalHeartbeat();
    }, 400); 
  };
  
  const handleLocalUp = (fromRemote = false) => {
    if (!fromRemote && isCuesTouchLockedRef.current) return;
    if (!isLocalPressing.current) return;
    isLocalPressing.current = false;
    if (localPressTimer.current) {
      clearTimeout(localPressTimer.current);
      localPressTimer.current = null;
      toggleLocalTorch();
    } else stopLocalHeartbeat();
  };

  const turnAudienceOn = () => { setAudienceMode('ON'); fireAudienceCommand('ON'); };
  const turnAudienceOff = () => { setAudienceMode('OFF'); fireAudienceCommand('OFF'); };
  const toggleAudienceTorch = () => audienceMode === 'OFF' ? turnAudienceOn() : turnAudienceOff();
  
  const startAudienceHeartbeat = () => { setAudienceMode('BLINK'); fireAudienceCommand('BLINK'); };
  const stopAudienceHeartbeat = () => turnAudienceOff();
  const toggleAudienceHeartbeat = () => audienceMode === 'BLINK' ? stopAudienceHeartbeat() : startAudienceHeartbeat();

  const startAudienceStrobe = () => { setAudienceMode('STROBE'); fireAudienceCommand('STROBE'); };
  const toggleAudienceStrobe = () => audienceMode === 'STROBE' ? turnAudienceOff() : startAudienceStrobe();

  const handleAudienceDown = (fromRemote = false) => {
    if (!fromRemote && isCuesTouchLockedRef.current) return;
    if (isAudiencePressing.current) return;
    isAudiencePressing.current = true;
    audiencePressTimer.current = setTimeout(() => {
      audiencePressTimer.current = null;
      startAudienceHeartbeat();
    }, 400);
  };
  
  const handleAudienceUp = (fromRemote = false) => {
    if (!fromRemote && isCuesTouchLockedRef.current) return;
    if (!isAudiencePressing.current) return;
    isAudiencePressing.current = false;
    if (audiencePressTimer.current) {
      clearTimeout(audiencePressTimer.current);
      audiencePressTimer.current = null;
      toggleAudienceTorch();
    } else stopAudienceHeartbeat();
  };

  const handleRedirectDown = () => {
    if (isRedirectPressing.current) return;
    isRedirectPressing.current = true;
    setRedirectStatus('HOLDING...');
    
    redirectPressTimer.current = setTimeout(() => {
      redirectPressTimer.current = null;
      executeSynchronizedRedirect();
    }, 800); 
  };
  
  const handleRedirectUp = () => {
    if (!isRedirectPressing.current) return;
    isRedirectPressing.current = false;
    if (redirectPressTimer.current) {
      clearTimeout(redirectPressTimer.current);
      redirectPressTimer.current = null;
      setRedirectStatus('HOLD TO REDIRECT');
    }
  };

  const handleOverlayTouchStart = (clientX, clientY, touchCount = 1) => {
    const phase = masterMonitorPhaseRef.current;

    if (touchCount > 1) {
      overlaySwipeRef.current = { startX: null, startY: null, startTime: 0, swiped: false, multiTouch: true };
      return;
    }

    if (phase === 'SPIRAL' || phase === 'LETTERS') {
      if (clientX <= 110) {
        overlaySwipeRef.current = {
          startX: clientX,
          startY: clientY,
          startTime: Date.now(),
          swiped: false,
          multiTouch: false
        };
      } else {
        overlaySwipeRef.current = { startX: null, startY: null, startTime: 0, swiped: false, multiTouch: false };
      }
    } else if (phase === 'CONVERGE' || phase === 'LOCKED') {
      overlaySwipeRef.current = { startX: null, startY: null, startTime: 0, swiped: false, multiTouch: false };
      handleRedirectDown();
    }
  };

  const handleOverlayTouchMove = (clientX, clientY, touchCount = 1) => {
    const phase = masterMonitorPhaseRef.current;
    if (phase !== 'SPIRAL' && phase !== 'LETTERS') return;

    if (touchCount > 1) {
      overlaySwipeRef.current.multiTouch = true;
      return;
    }

    const { startX, startY, startTime, swiped, multiTouch } = overlaySwipeRef.current;
    if (startX === null || swiped || multiTouch) return;

    const dx = clientX - startX;
    const dy = clientY - startY;
    const elapsed = Date.now() - startTime;

    if (elapsed > 600 || Math.abs(dy) > 50) {
      overlaySwipeRef.current.startX = null;
      return;
    }

    if (dx >= 185) {
      overlaySwipeRef.current.swiped = true;
      if (navigator.vibrate) navigator.vibrate(45);
      resetToPhase1Pulse();
    }
  };

  const handleOverlayTouchEnd = () => {
    overlaySwipeRef.current = { startX: null, startY: null, startTime: 0, swiped: false, multiTouch: false };
    handleRedirectUp();
  };

  const fireInstantRedirect = () => {
    executeSynchronizedRedirect();
  };

  const armRemote = (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
    if (hiddenInputRef.current) hiddenInputRef.current.focus({ preventScroll: true });
  };

  const handleOverlaySecretExit = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - overlayExitLastClickTime.current < 500) {
      overlayExitClickCount.current += 1;
    } else {
      overlayExitClickCount.current = 1;
    }
    overlayExitLastClickTime.current = now;

    if (overlayExitClickCount.current === 5) {
      overlayExitClickCount.current = 0;
      handleRedirectUp();
      clearMasterPhaseTimeouts();
      updateMasterMonitorPhase('NONE');
    }
  };

  const isClassicSpiral = revealTheme === 'CLASSIC_SPIRAL';

  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Collective V2 Deck...</div>;

  return (
    <div 
      ref={deckContainerRef}
      tabIndex={-1}
      onClick={armRemote}
      className="h-[100dvh] w-full flex flex-col touch-none select-none overflow-hidden bg-[#0a0a0a] text-white relative font-sans outline-none"
    >
      <style>{`
        @keyframes continuousSpiralFlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes continuousSpiralFlowReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes organicSonarWave {
          0% { transform: scale(0.85); opacity: 0.95; }
          70% { opacity: 0.35; }
          100% { transform: scale(6.2); opacity: 0; }
        }
        @keyframes sonarCoreBreathe {
          0%, 100% { transform: scale(0.92); opacity: 0.65; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes constellationSlowDrift {
          0% { transform: rotate(-4deg) scale(0.96); }
          100% { transform: rotate(4deg) scale(1.06); }
        }
        @keyframes synapseLinePulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.72; }
        }
        @keyframes neuralNodeFloat {
          0% { transform: translate(-8px, -6px); }
          100% { transform: translate(8px, 6px); }
        }
        @keyframes apertureBreathe {
          0%, 100% { transform: scale(0.92); }
          50% { transform: scale(1.08); }
        }
        @keyframes shutterIrisTwist {
          0%, 100% { transform: rotate(-8deg) scale(0.95); }
          50% { transform: rotate(10deg) scale(1.06); }
        }
        @keyframes soundwaveMorph {
          0% { transform: scaleY(0.35); }
          100% { transform: scaleY(1.35); }
        }
        @keyframes frequencyBarPulse {
          0% { transform: scaleY(0.2); opacity: 0.25; }
          100% { transform: scaleY(1.15); opacity: 0.85; }
        }
        @keyframes shimmerSoundwaveChar {
          0% { transform: translateY(calc(var(--amp) * -1)) scale(0.85); opacity: 0.18; filter: blur(1px); }
          50% { opacity: 0.95; filter: blur(0px); }
          100% { transform: translateY(var(--amp)) scale(1.12); opacity: 0.3; filter: blur(0.5px); }
        }
        @keyframes vortexOrbitInward {
          0% {
            transform: rotate(var(--start-angle)) translateX(var(--start-radius)) rotate(calc(var(--start-angle) * -1)) scale(1.15);
            opacity: 0;
          }
          20% { opacity: 0.85; }
          80% { opacity: 0.75; }
          100% {
            transform: rotate(calc(var(--start-angle) + 540deg)) translateX(12px) rotate(calc((var(--start-angle) + 540deg) * -1)) scale(0.35);
            opacity: 0;
          }
        }
        @keyframes synapticMeshContract {
          0% { transform: scale(1.04) rotate(-2deg); }
          100% { transform: scale(0.86) rotate(2deg); }
        }
        @keyframes floatLetter {
          0% { transform: translate(0px, 0px); opacity: 0.15; }
          50% { transform: translate(var(--dx), var(--dy)); opacity: 0.85; }
          100% { transform: translate(calc(var(--dx) * -0.6), calc(var(--dy) * 0.6)); opacity: 0.2; }
        }
      `}</style>

      <input 
        ref={hiddenInputRef}
        type="text"
        readOnly
        inputMode="none" 
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="absolute opacity-0 w-px h-px pointer-events-none -z-10"
      />

      {showQrModal && (
        <div 
          onPointerDown={() => setShowQrModal(false)}
          className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center p-5 cursor-pointer select-none touch-none"
        >
          <div 
            onPointerDown={(e) => {
              e.stopPropagation();
              setShowQrModal(false);
              if (onSwitchToHeartbeatView) {
                onSwitchToHeartbeatView();
              }
            }}
            className="bg-white p-7 rounded-3xl shadow-[0_0_70px_rgba(255,255,255,0.2)] flex flex-col items-center max-w-sm w-full text-black cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-zinc-500 mb-5">
              Scan to Join Experience
            </span>
            <div className="bg-white p-3 border-2 border-zinc-200 rounded-2xl mb-5 flex items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(APP_QR_URL)}`} 
                alt="App QR Code"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain pointer-events-none"
              />
            </div>
            <span className="text-sm font-mono font-bold text-zinc-800 tracking-wider mb-2">
              {APP_QR_URL.replace('https://', '')}
            </span>
            <span className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-red-600 animate-pulse mt-2 text-center whitespace-nowrap">
              TAP QR CODE TO OPEN HEARTBEAT VIEW
            </span>
          </div>
        </div>
      )}

      {masterMonitorPhase !== 'NONE' && (
        <div 
          onTouchStart={(e) => {
            const count = e.touches ? e.touches.length : 1;
            const t = e.touches && e.touches[0];
            if (t) handleOverlayTouchStart(t.clientX, t.clientY, count);
          }}
          onTouchMove={(e) => {
            const count = e.touches ? e.touches.length : 1;
            const t = e.touches && e.touches[0];
            if (t) handleOverlayTouchMove(t.clientX, t.clientY, count);
          }}
          onTouchEnd={handleOverlayTouchEnd}
          onTouchCancel={handleOverlayTouchEnd}
          onMouseDown={(e) => handleOverlayTouchStart(e.clientX, e.clientY, 1)}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleOverlayTouchMove(e.clientX, e.clientY, 1);
          }}
          onMouseUp={handleOverlayTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
          className={`fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden select-none touch-none transition-colors duration-500 ${
            masterMonitorPhase === 'SPIRAL' && isClassicSpiral ? 'bg-white' : 'bg-black'
          }`}
        >
          <div 
            onPointerDown={handleOverlaySecretExit}
            className="absolute bottom-0 right-0 w-32 h-32 z-[95] bg-black/0 touch-none"
          />

          {masterMonitorPhase === 'SPIRAL' && (
            <div className={`relative flex items-center justify-center w-full h-full overflow-hidden pointer-events-none ${isClassicSpiral ? 'bg-white' : 'bg-black'}`}>
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${masterSpiralVisible ? 'opacity-100' : 'opacity-0'}`}>
                {revealTheme === 'RIPPLE_WAVE' && <ExpandedResonanceRipple />}
                {revealTheme === 'CONSTELLATION' && <ConstellationOfThought />}
                {revealTheme === 'APERTURE_VORTEX' && <FocusApertureIris isDilating={masterApertureDilating} />}
                {revealTheme === 'CLASSIC_SPIRAL' && <HypnoticSpiralSVG />}
              </div>
              <div className={`relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-white ${
                isClassicSpiral
                  ? 'shadow-[0_10px_45px_rgba(0,0,0,0.22)]'
                  : 'shadow-[0_0_60px_rgba(255,255,255,0.45)]'
              } flex items-center justify-center transition-all duration-700 ease-in-out ${masterBadgeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <BrandLogoSVG className="w-14 h-14" />
              </div>
            </div>
          )}

          {masterMonitorPhase === 'LETTERS' && (
            <div className={`relative w-full h-full bg-black overflow-hidden pointer-events-none transition-opacity duration-700 ease-in-out ${masterLettersVisible ? 'opacity-100' : 'opacity-0'}`}>
              {revealTheme === 'RIPPLE_WAVE' && <ShimmeringSoundwaveLetters particles={masterDecoyParticles} />}
              {revealTheme === 'APERTURE_VORTEX' && <MagneticVortexLetters particles={masterDecoyParticles} />}
              {revealTheme === 'CONSTELLATION' && <SynapticConvergenceLetters particles={masterDecoyParticles} />}
              {revealTheme === 'CLASSIC_SPIRAL' && masterDecoyParticles.map((p) => (
                <span
                  key={p.id}
                  style={{
                    left: p.left,
                    top: p.top,
                    fontSize: p.size,
                    opacity: p.opacity,
                    '--dx': p.dx,
                    '--dy': p.dy,
                    animation: `floatLetter ${p.duration} ease-in-out infinite alternate`,
                  }}
                  className="absolute font-sans font-bold text-white select-none pointer-events-none"
                >
                  {p.char}
                </span>
              ))}
            </div>
          )}

          {(masterMonitorPhase === 'CONVERGE' || masterMonitorPhase === 'LOCKED') && (
            <div className="relative flex items-center justify-center w-full h-full bg-black px-4 overflow-hidden pointer-events-none">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 flex-wrap">
                {masterTargetChars.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      opacity: masterConvergeActive || masterMonitorPhase === 'LOCKED' ? 1 : 0,
                      transform: masterConvergeActive || masterMonitorPhase === 'LOCKED'
                        ? 'translate(0px, 0px) scale(1)'
                        : `translate(${item.startX}px, ${item.startY}px) scale(0.85)`,
                      transition: 'transform 1.15s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease',
                    }}
                    className="text-white font-black text-5xl sm:text-6xl uppercase tracking-widest inline-block"
                  >
                    {item.ch}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TOP BAR --- */}
      <div className="w-full h-14 flex items-center justify-between px-4 gap-2 shrink-0 z-40 border-b border-zinc-900">
        <button 
          onPointerDown={handleRedirectDown}
          onPointerUp={handleRedirectUp}
          onPointerLeave={handleRedirectUp}
          onPointerCancel={handleRedirectUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`px-3.5 py-2 rounded-full border text-[9px] font-bold tracking-widest whitespace-nowrap shrink-0 transition-colors ${
            redirectStatus === 'FIRED!' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : redirectStatus === 'HOLDING...' ? 'bg-zinc-700 border-zinc-500 text-white' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}
        >
          🚀 {redirectStatus}
        </button>

        <button 
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            setShowQrModal(true);
          }}
          className="px-4 py-2 rounded-full border text-[9px] font-extrabold tracking-widest whitespace-nowrap shrink-0 bg-zinc-900 border-zinc-700 text-white active:scale-95 active:bg-zinc-700 transition-all cursor-pointer"
        >
          🔳 SHOW QR
        </button>

        <button 
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsSettingsOpen((prev) => !prev);
          }}
          className={`px-3.5 py-2 rounded-full border text-[9px] font-bold tracking-widest whitespace-nowrap shrink-0 transition-colors ${
            isSettingsOpen ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
          }`}
        >
          ⚙️ SETTINGS
        </button>
      </div>

      {isSettingsOpen && (
        <div className="absolute top-16 left-4 right-4 max-h-[82dvh] overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl z-50 flex flex-col space-y-4">
          <div className="flex flex-col w-full">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Custom Redirect URL (Instant)</label>
            <input 
              type="text" 
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500 transition-colors"
              placeholder="https://instagram.com/andrewleemagic"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Feedback / Review Page URL (After 30s)</label>
            <input 
              type="text" 
              value={feedbackUrl}
              onChange={(e) => setFeedbackUrl(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500 transition-colors"
              placeholder="https://andrewleemagic.com/feedback"
            />
          </div>

          <div className="flex space-x-3 items-end">
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Audience Reveal Name</label>
              <input 
                type="text" 
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500 transition-colors"
                placeholder="Leave empty for default..."
              />
            </div>
            <div className="flex space-x-1 w-24">
              <button onClick={handleClearCustomText} className="flex-1 h-10 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 font-bold text-[9px] tracking-widest transition-colors">CLR</button>
              <button onClick={handleSetCustomText} className="flex-1 h-10 rounded bg-zinc-800 border border-zinc-600 text-white font-bold text-[9px] tracking-widest transition-colors">SET</button>
            </div>
          </div>

          <div className="flex space-x-2 items-end">
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">API Poll URL (Proxy)</label>
              <input type="text" value={injectUrl} onChange={(e) => setInjectUrl(e.target.value)} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-2 py-2 text-xs outline-none focus:border-zinc-500 transition-colors" placeholder="https://..." />
            </div>
            <div className="w-16 flex flex-col">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Key</label>
              <input type="text" value={injectKey} onChange={(e) => setInjectKey(e.target.value)} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-2 py-2 text-xs outline-none focus:border-zinc-500 transition-colors" placeholder="peek" />
            </div>
            <button 
              onClick={() => setIsInjectSyncing(!isInjectSyncing)}
              className={`w-20 h-10 rounded font-bold text-[9px] tracking-widest transition-colors border ${isInjectSyncing ? 'bg-green-600 border-green-500 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
            >
              {isInjectSyncing ? 'SYNCING' : 'AUTO-SYNC'}
            </button>
          </div>

          {/* REVEAL THEME SWITCHER (2x2 Tactile Grid) */}
          <div className="flex flex-col w-full">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">
              Phase 2 Reveal Theme ({REVEAL_THEMES.find(t => t.id === revealTheme)?.short || 'RIPPLE'})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REVEAL_THEMES.map((themeItem) => {
                const isSelected = revealTheme === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    type="button"
                    onClick={() => setRevealTheme(themeItem.id)}
                    className={`py-2.5 px-3 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all text-left truncate ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                        : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {themeItem.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 flex flex-col space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Keyboard / Flic Triggers</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono">
              <div className="text-zinc-500 font-bold uppercase col-span-1 border-b border-zinc-800 pb-1">Local Cues</div>
              <div className="text-zinc-500 font-bold uppercase col-span-1 border-b border-zinc-800 pb-1">Master Cues</div>

              <div className="flex justify-between text-zinc-300"><span>Torch ON/OFF</span><span className="text-white font-bold">[U]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Torch ON/OFF</span><span className="text-white font-bold">[D]</span></div>

              <div className="flex justify-between text-zinc-300"><span>Heartbeat</span><span className="text-red-400 font-bold">[B]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Heartbeat</span><span className="text-red-400 font-bold">[T]</span></div>

              <div className="flex justify-between text-zinc-300"><span>Strobe</span><span className="text-yellow-400 font-bold">[S]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Strobe</span><span className="text-yellow-400 font-bold">[E]</span></div>

              <div className="col-span-2 h-px bg-zinc-800 my-0.5"></div>

              <div className="flex justify-between text-zinc-300"><span>Phase 2 Reveal</span><span className="text-purple-400 font-bold">[R]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Play / Stop Seq</span><span className="text-green-400 font-bold">[P]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Toggle QR Code</span><span className="text-zinc-200 font-bold">[Q]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Phase 3 Redirect</span><span className="text-red-500 font-bold">[I]</span></div>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800 my-1"></div>
          <button 
            onClick={() => {
              if (onSwitchToHeartbeatView) onSwitchToHeartbeatView();
            }}
            className="w-full py-3 rounded bg-zinc-800 border border-zinc-600 text-white font-bold text-[10px] tracking-widest transition-colors flex justify-center items-center"
          >
            👁️ TEST SPECTATOR VIEW
          </button>
        </div>
      )}

      {/* --- MAIN CONTROL SCREEN --- */}
      <div className="flex-1 flex flex-col items-center w-full min-h-0 pt-2.5 pb-3 z-10 px-4 space-y-2">
        
        {/* 1. CHOREOGRAPHY CONTROLS */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between shrink-0">
          <div className="flex flex-col pr-2">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase whitespace-nowrap">Choreography ({roomID})</span>
            <span className="text-xs font-mono text-zinc-300 mt-0.5">{recordedSequence.length} Cues Saved</span>
          </div>
          
          <div className="flex space-x-2 shrink-0">
            <button 
              onClick={handleRecordButtonTap}
              className={`px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors border whitespace-nowrap ${
                isRecording 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse'
                  : recConfirmArmed
                    ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              {isRecording ? '■ STOP' : recConfirmArmed ? '⚠️ TAP 2X' : '● REC'}
            </button>

            <button 
              onClick={handlePlayToggle}
              disabled={recordedSequence.length === 0 || isRecording}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors border whitespace-nowrap ${
                isPlaying
                  ? 'bg-green-600 border-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]'
                  : recordedSequence.length === 0 || isRecording
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-700 opacity-50'
                    : 'bg-zinc-800 border-zinc-700 text-white'
              }`}
            >
              {isPlaying ? '■ STOP' : '▶ PLAY'}
            </button>
          </div>
        </div>

        {/* 2. OPTION A STAGE PROGRESSION BAR */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={resetToPhase1Pulse}
            className={`w-full py-2.5 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-colors truncate ${
              activePhase === 'PHASE_1'
                ? 'bg-zinc-800 border-zinc-500 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            🔴 Phase 1 (Pulse)
          </button>

          <button
            onClick={triggerPhase2Reveal}
            className={`w-full py-2.5 px-2 rounded-lg text-[10px] font-black tracking-wider uppercase border transition-colors truncate ${
              activePhase === 'REVEALING'
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse'
                : activePhase === 'PHASE_2_DONE'
                  ? 'bg-green-900/40 border-green-500 text-green-300'
                  : 'bg-purple-950/60 border-purple-500/70 text-purple-200'
            }`}
          >
            {activePhase === 'REVEALING'
              ? '🌀 REVEALING...'
              : activePhase === 'PHASE_2_DONE'
                ? `✓ ${peekedWord || customText || 'LOCKED'} [R]`
                : `🌀 REVEAL (${REVEAL_THEMES.find(t => t.id === revealTheme)?.short || 'RIPPLE'}) [R]`}
          </button>
        </div>

        {/* 3. FULL-WIDTH LIVE API PEEK + 2X-TAP PALM LOCK TOGGLE SWITCH */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 bg-black/60 border border-zinc-800/90 px-3 py-2 rounded-lg">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              holdUpPromptSent
                ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]'
                : peekedWord
                  ? 'bg-amber-500'
                  : 'bg-zinc-700'
            }`} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500 truncate">
                {holdUpPromptSent ? 'Live API Peek • Hold-Up Active' : 'Live API Peek • Waiting New Poll'}
              </span>
              <span className={`text-sm font-mono font-black tracking-widest uppercase truncate ${
                holdUpPromptSent ? 'text-green-400' : peekedWord ? 'text-zinc-300' : 'text-zinc-600'
              }`}>
                {peekedWord || 'WAITING FOR PEEK...'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              handleCueLockButtonTap();
            }}
            className={`px-3 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors border whitespace-nowrap shrink-0 ${
              cueLockConfirmArmed
                ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
                : isCuesTouchLocked
                  ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_12px_rgba(220,38,38,0.25)]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            {cueLockConfirmArmed
              ? '⚠️ TAP 2X'
              : isCuesTouchLocked
                ? '🔒 PALM LOCKED'
                : '🔓 UNLOCKED'}
          </button>
        </div>

        {/* 4. LOCAL CUE & MASTER CUE (AUDIENCE) CONTROLS */}
        <div className="flex-1 w-full flex items-center justify-center">
          <div className={`w-full grid grid-cols-2 gap-4 items-center transition-opacity duration-200 ${
            isCuesTouchLocked ? 'opacity-45' : 'opacity-100'
          }`}>
            
            {/* LOCAL CUE */}
            <div className="flex flex-col items-center w-full">
              <div className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase mb-1">LOCAL CUE</div>
              <div className="text-xs mb-2.5">
                <span className="text-zinc-400">State: </span>
                <span className={
                  localMode === 'OFF' ? 'text-red-500 font-bold' : 
                  localMode === 'ON' ? 'text-white font-bold' : 
                  localMode === 'STROBE' ? 'text-yellow-400 font-bold animate-pulse' : 
                  'text-red-500 font-bold animate-pulse'
                }>
                  {localMode === 'OFF' ? 'BLACKOUT' : localMode === 'ON' ? 'ILLUMINATED' : localMode === 'STROBE' ? 'STROBING' : 'HEARTBEAT'}
                </span>
              </div>
              <button
                onPointerDown={() => handleLocalDown(false)}
                onPointerUp={() => handleLocalUp(false)}
                onPointerLeave={() => handleLocalUp(false)}
                onPointerCancel={() => handleLocalUp(false)}
                onContextMenu={(e) => e.preventDefault()}
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
                  localMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
                  localMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.2)]' :
                  localMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_25px_rgba(250,204,21,0.3)]' :
                  'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                }`}
              >
                <span className="font-bold tracking-widest text-xs uppercase">
                  {isCuesTouchLocked ? '🔒 LOCKED' : localMode === 'OFF' ? 'STANDBY' : localMode === 'ON' ? 'ACTIVE' : localMode === 'STROBE' ? 'STROBING' : 'PULSING'}
                </span>
              </button>
              <div className="mt-3 flex">
                <button 
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (isCuesTouchLockedRef.current) return;
                    toggleLocalStrobe();
                  }}
                  className={`px-4 py-2 rounded-full border text-[10px] font-bold tracking-widest transition-colors ${localMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                >
                  ⚡ STROBE (s)
                </button>
              </div>
            </div>

            {/* MASTER CUE (AUDIENCE) */}
            <div className="flex flex-col items-center w-full">
              <div className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase mb-1 text-center">MASTER CUE (AUDIENCE)</div>
              <div className="text-xs mb-2.5">
                <span className="text-zinc-400">State: </span>
                <span className={
                  audienceMode === 'OFF' ? 'text-red-500 font-bold' : 
                  audienceMode === 'ON' ? 'text-white font-bold' : 
                  audienceMode === 'STROBE' ? 'text-yellow-400 font-bold animate-pulse' : 
                  'text-red-500 font-bold animate-pulse'
                }>
                  {audienceMode === 'OFF' ? 'BLACKOUT' : audienceMode === 'ON' ? 'ILLUMINATED' : audienceMode === 'STROBE' ? 'STROBING' : 'HEARTBEAT'}
                </span>
              </div>
              <button
                onPointerDown={() => handleAudienceDown(false)}
                onPointerUp={() => handleAudienceUp(false)}
                onPointerLeave={() => handleAudienceUp(false)}
                onPointerCancel={() => handleAudienceUp(false)}
                onContextMenu={(e) => e.preventDefault()}
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
                  audienceMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
                  audienceMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.2)]' :
                  audienceMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_25px_rgba(250,204,21,0.3)]' :
                  'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                }`}
              >
                <span className="font-bold tracking-widest text-xs uppercase">
                  {isCuesTouchLocked ? '🔒 LOCKED' : audienceMode === 'OFF' ? 'STANDBY' : audienceMode === 'ON' ? 'ACTIVE' : audienceMode === 'STROBE' ? 'STROBING' : 'PULSING'}
                </span>
              </button>
              <div className="mt-3 flex">
                <button 
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (isCuesTouchLockedRef.current) return;
                    toggleAudienceStrobe();
                  }}
                  className={`px-4 py-2 rounded-full border text-[10px] font-bold tracking-widest transition-colors ${audienceMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                >
                  ⚡ STROBE (e)
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* --- STATUS FOOTER --- */}
      <div className="w-full shrink-0 bg-zinc-950 border-t border-zinc-800 flex flex-col items-center px-4 pt-3 pb-8 z-20 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-green-500">
          🟢 FLIC REMOTE LOCKED (ALWAYS ON)
        </div>
        <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest flex items-center space-x-2">
          <span>Last Flic Key: [{lastKey}]</span>
          <span>•</span>
          <span className={
            isRecording ? 'text-red-500 font-bold animate-pulse' : 
            isPlaying ? 'text-green-400 font-bold animate-pulse' : 
            'text-zinc-600'
          }>
            {isRecording ? '● REC ACTIVE' : isPlaying ? '▶ SEQ PLAYING' : `${recordedSequence.length} Cues`}
          </span>
        </div>
      </div>

    </div>
  );
}
