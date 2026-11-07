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

// Secret passcode to pair your magician phone once
const MASTER_CLAIM_CODE = 'AL2026';
const MASTER_STORAGE_KEY = 'magicMasterAuthorized_v2';

const EMOTIONAL_TUNING_PROMPTS = [
  "BREATHE IN UNISON...",
  "A LOVED ONE IS BEING HELD IN MIND",
  "FEEL THEIR PRESENCE IN THE ROOM",
  "EVERY HEARTBEAT TELLS A STORY"
];

// Curated 2 Neon-Blue Holographic Themes
const REVEAL_THEMES = [
  { id: 'RIPPLE_WAVE', label: '〰️ Option 1: Resonance Ripple', short: 'RIPPLE' },
  { id: 'APERTURE_VORTEX', label: '◎ Option 2: Focus Aperture', short: 'APERTURE' }
];

// Exact Custom AL Geometric Monogram Logo
function BrandLogoSVG({ className = "w-14 h-14", variant = "darkOnLight" }) {
  const clipId = useMemo(() => `alClip_${Math.random().toString(36).slice(2, 8)}`, []);
  const isLightOnDark = variant === "lightOnDark";
  const strokeColor = isLightOnDark ? "#e0faff" : "#020617";

  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="84" />
        </clipPath>
        <filter id={`cyanBloom_${clipId}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="84"
        stroke={strokeColor}
        strokeWidth="17"
        filter={isLightOnDark ? `url(#cyanBloom_${clipId})` : undefined}
      />
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M 20 115 L 109 26 L 109 152 L 178 152 L 178 169 L 92 169 L 92 67 L 26 133 Z"
          fill={strokeColor}
          filter={isLightOnDark ? `url(#cyanBloom_${clipId})` : undefined}
        />
      </g>
    </svg>
  );
}

// ==========================================
// OPTION 1 (STAGE 1): THE EXPANDED RESONANCE RIPPLE (0.0s - 4.4s)
// ==========================================
const ExpandedResonanceRippleStage1 = React.memo(function ExpandedResonanceRippleStage1({ subStage }) {
  const showEmergingLetters = subStage === 'RIPPLE_LETTERS' || subStage === 'RIPPLE_HORIZON';
  const showHorizonBeam = subStage === 'RIPPLE_HORIZON';

  const concentricRidges = useMemo(() => Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    delay: `${(i * 0.24).toFixed(2)}s`,
    isBright: i % 2 === 0
  })), []);

  const emergingGlyphs = useMemo(() => {
    const chars = ['A', 'R', 'E', 'S', 'O', 'N', 'M', 'K', 'L', 'T', 'V', 'H', 'C', 'I'];
    return chars.map((ch, idx) => {
      const angle = (idx / chars.length) * 2 * Math.PI + 0.3;
      const dist = 19 + (idx % 3) * 11;
      return {
        id: idx,
        ch,
        x: (Math.cos(angle) * dist).toFixed(1),
        y: (Math.sin(angle) * dist).toFixed(1),
        size: `${0.85 + (idx % 3) * 0.35}rem`,
        delay: `${(idx * 0.11).toFixed(2)}s`
      };
    });
  }, []);

  const stardust = useMemo(() => Array.from({ length: 42 }).map((_, i) => ({
    id: i,
    left: `${8 + ((i * 19) % 84)}%`,
    top: `${12 + ((i * 29) % 76)}%`,
    size: 1.5 + (i % 3) * 1.2,
    delay: `${(i % 8) * 0.2}s`
  })), []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-black select-none">
      <div
        className="absolute w-[125vmin] h-[125vmin] rounded-full pointer-events-none"
        style={{
          background: `repeating-radial-gradient(
            circle at center,
            rgba(0, 240, 255, 0.22) 0px,
            rgba(180, 248, 255, 0.38) 12px,
            rgba(4, 18, 32, 0.92) 26px,
            rgba(0, 0, 0, 0.98) 40px
          )`,
          maskImage: 'radial-gradient(circle, black 18%, rgba(0,0,0,0.75) 48%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle, black 18%, rgba(0,0,0,0.75) 48%, transparent 72%)',
          animation: 'acousticConePulse 1.8s ease-in-out infinite'
        }}
      />

      {concentricRidges.map((r) => (
        <div
          key={r.id}
          className="absolute w-28 h-28 rounded-full pointer-events-none will-change-transform"
          style={{
            border: r.isBright
              ? '3px solid rgba(190, 250, 255, 0.78)'
              : '2px solid rgba(0, 210, 255, 0.48)',
            boxShadow: r.isBright
              ? '0 0 22px rgba(0, 240, 255, 0.65), inset 0 0 18px rgba(0, 240, 255, 0.45)'
              : '0 0 14px rgba(0, 170, 255, 0.35)',
            animation: 'moldedRippleExpand 3.36s linear infinite',
            animationDelay: r.delay,
            opacity: 0
          }}
        />
      ))}

      <div className={`absolute inset-0 transition-opacity duration-700 ${showEmergingLetters ? 'opacity-100' : 'opacity-0'}`}>
        {stardust.map((s) => (
          <span
            key={s.id}
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              boxShadow: '0 0 8px #00f0ff, 0 0 15px #ffffff',
              animation: `stardustTwinkle 1.4s ease-in-out infinite alternate`,
              animationDelay: s.delay
            }}
            className="absolute rounded-full bg-cyan-100 pointer-events-none"
          />
        ))}

        {emergingGlyphs.map((g) => (
          <span
            key={g.id}
            style={{
              transform: `translate(${g.x}vmin, ${g.y}vmin)`,
              fontSize: g.size,
              textShadow: '0 0 12px rgba(0,240,255,0.9), 0 0 24px rgba(0,180,255,0.5)',
              animation: 'glyphRippleFloat 2.2s ease-in-out infinite alternate',
              animationDelay: g.delay
            }}
            className="absolute left-1/2 top-1/2 -ml-2 -mt-2 font-sans font-extrabold text-cyan-100/80 pointer-events-none"
          >
            {g.ch}
          </span>
        ))}
      </div>

      <div
        className={`absolute inset-x-0 flex items-center justify-center transition-all duration-700 ${
          showHorizonBeam ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
        }`}
      >
        <div
          className="w-full h-36 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(224,250,255,0.75) 0%, rgba(0,240,255,0.38) 38%, rgba(0,140,255,0.1) 68%, transparent 100%)'
          }}
        />
        <div className="absolute inset-x-0 h-[3px] bg-cyan-100 shadow-[0_0_25px_#00f0ff,0_0_50px_#00f0ff]" />
      </div>

      <div
        className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center transition-transform duration-500"
        style={{
          boxShadow: showHorizonBeam
            ? '0 0 45px #ffffff, 0 0 85px #00f0ff, 0 0 130px #00a8ff'
            : '0 0 28px rgba(255,255,255,0.9), 0 0 55px rgba(0,240,255,0.65)'
        }}
      >
        <BrandLogoSVG className="w-11 h-11 sm:w-12 sm:h-12" variant="darkOnLight" />
      </div>
    </div>
  );
});

// ==========================================
// OPTION 1 (STAGE 2): SEISMOGRAPH SOUNDWAVE (4.4s - 9.6s)
// ==========================================
const ExpandedResonanceSoundwaveStage2 = React.memo(function ExpandedResonanceSoundwaveStage2({ waveStage }) {
  const isSpikeBurst = waveStage === 'SPIKE_BURST';
  const isCompressing = waveStage === 'LETTER_COMPRESS';

  const spikes = useMemo(() => {
    return Array.from({ length: 96 }).map((_, i) => {
      const norm = i / 95;
      const bell = Math.sin(norm * Math.PI);
      const harmonic = 0.45 + 0.55 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.65));
      const heightPx = Math.round(14 + bell * harmonic * 250);
      return {
        id: i,
        heightPx,
        duration: `${0.32 + (i % 7) * 0.08}s`,
        delay: `${(i % 11) * 0.04}s`,
        isCore: Math.abs(norm - 0.5) < 0.16
      };
    });
  }, []);

  const sparks = useMemo(() => {
    return Array.from({ length: 76 }).map((_, i) => ({
      id: i,
      left: `${3 + ((i * 13) % 94)}%`,
      top: `${14 + ((i * 23) % 72)}%`,
      size: 1.5 + (i % 4) * 1.1,
      dx: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 8)}px`,
      dy: `${(i % 3 === 0 ? -1 : 1) * (16 + (i % 6) * 12)}px`,
      dur: `${0.9 + (i % 5) * 0.35}s`
    }));
  }, []);

  const tumblingLetters = useMemo(() => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 34 }).map((_, i) => {
      const fromTop = i % 2 === 0;
      const spreadY = (fromTop ? -1 : 1) * (12 + ((i * 17) % 34));
      const compressY = (fromTop ? -1 : 1) * (2 + (i % 5) * 1.8);
      const rot = (i % 2 === 0 ? 1 : -1) * (18 + (i * 13) % 45);
      const isHero = i % 6 === 0;
      return {
        id: i,
        char: pool[(i * 5 + 2) % pool.length],
        left: `${6 + ((i * 11) % 88)}%`,
        spreadY,
        compressY,
        rot,
        size: isHero ? '2.5rem' : `${1.05 + (i % 4) * 0.42}rem`,
        opacity: isHero ? 0.92 : 0.45 + (i % 4) * 0.14,
        blur: isHero ? '0.4px' : '0px',
        dur: `${1.2 + (i % 5) * 0.3}s`
      };
    });
  }, []);

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden select-none pointer-events-none">
      <div
        className="absolute inset-x-0 h-80 pointer-events-none transition-all duration-700"
        style={{
          background: isCompressing
            ? 'radial-gradient(ellipse 80% 24% at 50% 50%, rgba(224,250,255,0.65) 0%, rgba(0,240,255,0.32) 45%, transparent 85%)'
            : 'radial-gradient(ellipse 65% 48% at 50% 50%, rgba(224,250,255,0.45) 0%, rgba(0,240,255,0.22) 48%, transparent 85%)'
        }}
      />

      {sparks.map((s) => (
        <span
          key={s.id}
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--dx': s.dx,
            '--dy': s.dy,
            boxShadow: '0 0 8px #00f0ff, 0 0 15px #ffffff',
            animation: `floatSpark ${s.dur} ease-in-out infinite alternate`
          }}
          className="absolute rounded-full bg-white pointer-events-none"
        />
      ))}

      <svg
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        className={`absolute inset-x-0 w-full h-64 transition-opacity duration-500 ${
          waveStage === 'RIBBON_BEAM' ? 'opacity-95' : 'opacity-45'
        }`}
      >
        <defs>
          <filter id="neonBeamGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 0 150 C 180 150, 240 45, 320 150 C 400 255, 460 25, 540 150 C 620 275, 680 55, 760 150 C 840 245, 900 150, 1000 150"
          fill="none"
          stroke="#e0faff"
          strokeWidth="4"
          filter="url(#neonBeamGlow)"
          style={{ animation: 'soundwaveMorph 0.75s ease-in-out infinite alternate' }}
        />
        <path
          d="M 0 150 C 180 150, 240 245, 320 150 C 400 55, 460 275, 540 150 C 620 25, 680 245, 760 150 C 840 55, 900 150, 1000 150"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2.5"
          strokeOpacity="0.8"
          filter="url(#neonBeamGlow)"
          style={{ animation: 'soundwaveMorph 0.6s ease-in-out infinite alternate-reverse' }}
        />
      </svg>

      <div
        className={`absolute inset-x-0 flex items-center justify-between px-1 transition-all duration-500 ${
          isSpikeBurst ? 'opacity-100 scale-y-100' : isCompressing ? 'opacity-55 scale-y-[0.22]' : 'opacity-25 scale-y-[0.15]'
        }`}
      >
        {spikes.map((sp) => (
          <div
            key={sp.id}
            className="w-[1.5px] sm:w-[2px] rounded-full will-change-transform"
            style={{
              height: `${sp.heightPx}px`,
              background: sp.isCore
                ? 'linear-gradient(180deg, rgba(0,240,255,0) 0%, #00f0ff 25%, #ffffff 50%, #00f0ff 75%, rgba(0,240,255,0) 100%)'
                : 'linear-gradient(180deg, rgba(0,240,255,0) 0%, rgba(0,240,255,0.85) 30%, #e0faff 50%, rgba(0,240,255,0.85) 70%, rgba(0,240,255,0) 100%)',
              boxShadow: sp.isCore ? '0 0 16px #ffffff, 0 0 28px #00f0ff' : '0 0 8px #00f0ff',
              animation: `seismographSpike ${sp.duration} ease-in-out infinite alternate`,
              animationDelay: sp.delay
            }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 h-[3px] bg-white shadow-[0_0_18px_#ffffff,0_0_35px_#00f0ff,0_0_65px_#00f0ff]" />

      {tumblingLetters.map((item) => {
        const yOffset = isCompressing ? item.compressY : item.spreadY;
        return (
          <span
            key={item.id}
            style={{
              left: item.left,
              top: '50%',
              fontSize: item.size,
              opacity: item.opacity,
              filter: `blur(${item.blur})`,
              transform: `translateY(${yOffset}vh) rotate(${isCompressing ? item.rot * 0.25 : item.rot}deg)`,
              transition: 'transform 0.95s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease',
              textShadow: '0 0 12px rgba(255,255,255,0.95), 0 0 24px rgba(0,240,255,0.85)'
            }}
            className="absolute -mt-4 font-sans font-black text-cyan-50 select-none pointer-events-none"
          >
            {item.char}
          </span>
        );
      })}
    </div>
  );
});

// ==========================================
// OPTION 2 (STAGE 1): FOCUS APERTURE IRIS (0.0s - 4.4s)
// ==========================================
const FocusApertureIrisStage1 = React.memo(function FocusApertureIrisStage1({
  shutterStage
}) {
  const tickAngles = useMemo(() => Array.from({ length: 72 }).map((_, i) => i * 5), []);
  const bladeAngles = useMemo(() => Array.from({ length: 12 }).map((_, i) => i * 30), []);

  const isDarkCore = shutterStage === 'IRIS_DARK' || shutterStage === 'OPEN_VORTEX';
  const isOpening = shutterStage === 'OPEN_VORTEX';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-black select-none">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,240,255,0.12) 0%, rgba(0,18,36,0.88) 65%, #000000 100%)'
        }}
      />

      <div className="relative flex items-center justify-center w-[96vmin] h-[96vmin] max-w-[520px] max-h-[520px]">
        <svg viewBox="-500 -500 1000 1000" className="w-full h-full overflow-visible">
          <defs>
            <clipPath id="shutterBarrelClip">
              <circle cx="0" cy="0" r="248" />
            </clipPath>

            <linearGradient id="shutterBladeCyanMetallic" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#d8f8ff" stopOpacity="0.92" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.78" />
              <stop offset="72%" stopColor="#082f49" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.99" />
            </linearGradient>

            <linearGradient id="rimSweepCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#00f0ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>

            <filter id="bladeDropShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="-3" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.95" />
            </filter>

            <filter id="rimGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Precision HUD & Degree Ticks */}
          <g
            className="transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: isOpening ? 'scale(1.36)' : 'scale(1)',
              opacity: isOpening ? 0.75 : 1,
            }}
          >
            <circle cx="0" cy="0" r="425" fill="none" stroke="#00f0ff" strokeOpacity="0.48" strokeWidth="1.2" />

            <line x1="0" y1="-425" x2="0" y2="-362" stroke="#e0faff" strokeOpacity="0.85" strokeWidth="1.8" filter="url(#rimGlowFilter)" />
            <line x1="0" y1="362" x2="0" y2="425" stroke="#e0faff" strokeOpacity="0.85" strokeWidth="1.8" filter="url(#rimGlowFilter)" />
            <line x1="-425" y1="0" x2="-362" y2="0" stroke="#e0faff" strokeOpacity="0.85" strokeWidth="1.8" filter="url(#rimGlowFilter)" />
            <line x1="362" y1="0" x2="425" y2="0" stroke="#e0faff" strokeOpacity="0.85" strokeWidth="1.8" filter="url(#rimGlowFilter)" />

            {tickAngles.map((deg) => {
              const isCardinal = deg % 90 === 0;
              const isMajor = deg % 30 === 0;
              const r1 = isCardinal ? 292 : isMajor ? 298 : 304;
              const r2 = isCardinal ? 338 : isMajor ? 324 : 316;
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={(r1 * Math.cos(rad)).toFixed(1)}
                  y1={(r1 * Math.sin(rad)).toFixed(1)}
                  x2={(r2 * Math.cos(rad)).toFixed(1)}
                  y2={(r2 * Math.sin(rad)).toFixed(1)}
                  stroke={isCardinal ? '#ffffff' : '#00f0ff'}
                  strokeOpacity={isCardinal ? '0.95' : isMajor ? '0.7' : '0.35'}
                  strokeWidth={isCardinal ? '2.2' : isMajor ? '1.4' : '0.9'}
                />
              );
            })}
          </g>

          {/* Swirling Fibrous Vortex Tunnel Underneath Blades */}
          <g
            clipPath="url(#shutterBarrelClip)"
            className="transition-opacity duration-700"
            style={{ opacity: isOpening ? 1 : 0 }}
          >
            <g style={{ animation: 'vortexSpinClockwise 5.5s linear infinite' }}>
              {[75, 110, 145, 180, 215, 240].map((r, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="0"
                  rx={r}
                  ry={Math.round(r * 0.9)}
                  transform={`rotate(${i * 30})`}
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth={i % 2 === 0 ? "1.6" : "0.9"}
                  strokeOpacity={0.22 + (i % 3) * 0.1}
                  strokeDasharray={`${60 + i * 25} ${35 + i * 15}`}
                />
              ))}
            </g>
          </g>

          {/* Clipped 12-Blade Mechanical Iris */}
          <g clipPath="url(#shutterBarrelClip)">
            <g
              className="transition-all duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                animation: !isOpening ? 'shutterSubtlePulse 2.2s ease-in-out infinite' : 'none',
              }}
            >
              {bladeAngles.map((deg) => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <g
                    className="transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: isOpening
                        ? 'translate(145px, -105px) rotate(28deg) scale(0.92)'
                        : isDarkCore
                          ? 'translate(-8px, 6px) rotate(-4deg)'
                          : 'translate(0px, 0px) rotate(0deg)',
                    }}
                  >
                    <path
                      d="M 58 -38 C 120 -130, 225 -155, 290 -65 L 290 85 C 205 60, 115 25, 58 -38 Z"
                      fill="url(#shutterBladeCyanMetallic)"
                      stroke="#020617"
                      strokeWidth="1.5"
                      filter="url(#bladeDropShadow)"
                    />
                    <path
                      d="M 62 -36 C 122 -122, 215 -145, 275 -65"
                      fill="none"
                      stroke="#e0faff"
                      strokeOpacity="0.6"
                      strokeWidth="1.1"
                    />
                  </g>
                </g>
              ))}
            </g>
          </g>

          <circle
            cx="0"
            cy="0"
            r="250"
            fill="none"
            stroke="#00f0ff"
            strokeOpacity={isOpening ? "0.45" : "0.75"}
            strokeWidth="2"
            filter="url(#rimGlowFilter)"
          />
          <circle
            cx="0"
            cy="0"
            r="260"
            fill="none"
            stroke="#e0faff"
            strokeOpacity="0.35"
            strokeWidth="1"
          />

          <g className="transition-opacity duration-700" style={{ opacity: isOpening ? 0.75 : 0 }}>
            <circle cx="0" cy="0" r="175" fill="none" stroke="#00f0ff" strokeWidth="1.1" strokeOpacity="0.6" />
            <circle cx="0" cy="0" r="205" fill="none" stroke="#e0faff" strokeWidth="0.9" strokeOpacity="0.45" />
          </g>

          <circle
            cx="0"
            cy="0"
            r="255"
            fill="none"
            stroke="url(#rimSweepCyan)"
            strokeWidth="4.5"
            strokeDasharray="135 480"
            strokeLinecap="round"
            filter="url(#rimGlowFilter)"
            style={{
              opacity: isOpening ? 0 : 0.98,
              animation: 'rimLightOrbit 2.2s linear infinite',
              transition: 'opacity 0.5s ease'
            }}
          />
        </svg>

        {/* Center AL Emblem */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className={`rounded-full flex items-center justify-center transition-all duration-700 ease-in-out ${
              isDarkCore
                ? 'w-24 h-24 bg-black/85 border border-cyan-400/60 shadow-[0_0_35px_rgba(0,240,255,0.75)] scale-90'
                : 'w-[22.5vmin] h-[22.5vmin] max-w-[122px] max-h-[122px] bg-white shadow-[0_0_45px_rgba(0,240,255,0.85)] scale-100'
            }`}
          >
            <BrandLogoSVG
              className="w-11 h-11 sm:w-12 sm:h-12 transition-transform duration-700"
              variant={isDarkCore ? "lightOnDark" : "darkOnLight"}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// ==========================================
// OPTION 2 (STAGE 2): THE MAGNETIC VORTEX (4.4s - 9.6s)
// ==========================================
const MagneticVortexStage2 = React.memo(function MagneticVortexStage2({ coreFlareActive }) {
  const glyphPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const orbitalRings = useMemo(() => {
    const ringConfigs = [
      { radiusVmin: 15, count: 14, size: '0.78rem', speed: '6.5s', dir: 'normal' },
      { radiusVmin: 23, count: 20, size: '0.92rem', speed: '8.5s', dir: 'reverse' },
      { radiusVmin: 32, count: 26, size: '1.08rem', speed: '10.5s', dir: 'normal' },
      { radiusVmin: 42, count: 30, size: '1.22rem', speed: '13s', dir: 'reverse' },
    ];

    return ringConfigs.map((cfg, rIdx) => {
      const items = Array.from({ length: cfg.count }).map((_, i) => {
        const angleDeg = (i / cfg.count) * 360 + (rIdx * 17);
        const angleRad = (angleDeg * Math.PI) / 180;
        const char = glyphPool[(rIdx * 19 + i * 7) % glyphPool.length];
        return {
          id: `${rIdx}-${i}`,
          char,
          x: (Math.cos(angleRad) * cfg.radiusVmin).toFixed(2),
          y: (Math.sin(angleRad) * cfg.radiusVmin).toFixed(2),
          rot: angleDeg + 90,
          opacity: 0.45 + ((i % 3) * 0.22)
        };
      });
      return { ...cfg, rIdx, items };
    });
  }, []);

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden select-none pointer-events-none">
      <div
        className="absolute w-[130vmin] h-[130vmin] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: `repeating-radial-gradient(
            circle at center,
            rgba(0, 240, 255, 0.24) 0px,
            rgba(224, 250, 255, 0.35) 14px,
            rgba(4, 20, 38, 0.92) 30px,
            rgba(0, 0, 0, 0.98) 46px
          )`,
          maskImage: 'radial-gradient(circle, black 22%, rgba(0,0,0,0.75) 55%, transparent 74%)',
          WebkitMaskImage: 'radial-gradient(circle, black 22%, rgba(0,0,0,0.75) 55%, transparent 74%)',
          animation: 'acousticConePulse 2.1s ease-in-out infinite'
        }}
      />

      <div
        className={`absolute w-[95vmin] h-[95vmin] rounded-full pointer-events-none transition-all duration-700 ${
          coreFlareActive ? 'opacity-100 scale-110' : 'opacity-40 scale-75'
        }`}
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.92) 0%, rgba(165,243,252,0.68) 22%, rgba(0,240,255,0.32) 45%, transparent 72%)'
        }}
      />

      <svg
        viewBox="-500 -500 1000 1000"
        className="absolute w-[115vmin] h-[115vmin] will-change-transform"
        style={{ animation: 'vortexSpinClockwise 4.2s linear infinite' }}
      >
        <defs>
          <filter id="cyanArcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[115, 165, 220, 280, 345, 415].map((r, idx) => (
          <circle
            key={idx}
            cx="0"
            cy="0"
            r={r}
            fill="none"
            stroke={idx % 2 === 0 ? "#e0faff" : "#00f0ff"}
            strokeWidth={coreFlareActive ? "2.6" : "1.8"}
            strokeOpacity={coreFlareActive ? 0.75 : 0.42}
            strokeDasharray={`${90 + idx * 35} ${160 + idx * 25}`}
            strokeLinecap="round"
            filter="url(#cyanArcGlow)"
            transform={`rotate(${idx * 52})`}
          />
        ))}
      </svg>

      {orbitalRings.map((ring) => (
        <div
          key={ring.rIdx}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            animation: `${ring.dir === 'normal' ? 'vortexSpinClockwise' : 'vortexSpinCounter'} ${ring.speed} linear infinite`
          }}
        >
          {ring.items.map((item) => (
            <span
              key={item.id}
              style={{
                transform: `translate(${item.x}vmin, ${item.y}vmin) rotate(${item.rot}deg)`,
                fontSize: ring.size,
                opacity: item.opacity,
                textShadow: coreFlareActive
                  ? '0 0 14px #ffffff, 0 0 28px #00f0ff'
                  : '0 0 10px rgba(0,240,255,0.85)'
              }}
              className="absolute font-sans font-extrabold text-cyan-50 select-none pointer-events-none"
            >
              {item.char}
            </span>
          ))}
        </div>
      ))}

      <div
        className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-700 ${
          coreFlareActive
            ? 'w-28 h-28 bg-white shadow-[0_0_55px_#ffffff,0_0_95px_#00f0ff] scale-105'
            : 'w-22 h-22 bg-black/85 border border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.65)] scale-100'
        }`}
      >
        <BrandLogoSVG
          className="w-11 h-11 sm:w-12 sm:h-12"
          variant={coreFlareActive ? "darkOnLight" : "lightOnDark"}
        />
      </div>
    </div>
  );
});

// ==========================================
// SHOW CONTROL VIEW (Master Deck)
// ==========================================
function ControlView({ roomID, onSwitchToHeartbeatView }) {
  const [isReady, setIsReady] = useState(false);
  const trackRef = useRef(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [localMode, setLocalMode] = useState('OFF');
  const [audienceMode, setAudienceMode] = useState('OFF');
  const [activePhase, setActivePhase] = useState('PHASE_1');

  // LIVE THEME & SFX STATES
  const [revealTheme, setRevealTheme] = useState(() => localStorage.getItem('magicRevealStyle') || 'RIPPLE_WAVE');
  const revealThemeRef = useRef(revealTheme);
  const [sfxEnabled, setSfxEnabled] = useState(() => {
    const saved = localStorage.getItem('magicSfxEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // PALM-LOCK DOUBLE-TAP STATES (Starts LOCKED by default)
  const [isCuesTouchLocked, setIsCuesTouchLocked] = useState(true);
  const isCuesTouchLockedRef = useRef(true);
  const [cueLockConfirmArmed, setCueLockConfirmArmed] = useState(false);
  const cueLockConfirmTimeoutRef = useRef(null);

  // MASTER MONITOR OVERLAY STATES
  const [masterMonitorPhase, setMasterMonitorPhase] = useState('NONE');
  const masterMonitorPhaseRef = useRef('NONE');
  const [masterEmblemVisible, setMasterEmblemVisible] = useState(false);
  const [masterShutterStage, setMasterShutterStage] = useState('CLOSED_WHITE');
  const [masterStormVisible, setMasterStormVisible] = useState(false);
  const [masterWaveSubStage, setMasterWaveSubStage] = useState('RIBBON_BEAM');
  const [masterVortexFlare, setMasterVortexFlare] = useState(false);
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

  // Sync Theme & SFX to LocalStorage & Firebase
  useEffect(() => {
    revealThemeRef.current = revealTheme;
    localStorage.setItem('magicRevealStyle', revealTheme);
    set(ref(db, `${roomID}/revealStyle`), revealTheme).catch(() => {});
  }, [revealTheme, roomID]);

  useEffect(() => {
    localStorage.setItem('magicSfxEnabled', JSON.stringify(sfxEnabled));
    set(ref(db, `${roomID}/sfxEnabled`), sfxEnabled).catch(() => {});
  }, [sfxEnabled, roomID]);

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

  // Permanent Flic Focus Lock
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => { trackRef.current = stream.getVideoTracks()[0]; setIsReady(true); })
      .catch(() => { setIsReady(true); });

    const keepRemoteLocked = () => {
      const activeEl = document.activeElement;
      const isTypingInSettings = activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'text' && activeEl !== hiddenInputRef.current;
      if (!isTypingInSettings) {
        if (hiddenInputRef.current) hiddenInputRef.current.focus({ preventScroll: true });
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

  const getTargetRedirectUrl = () => formatValidUrl(redirectUrl, DEFAULT_REDIRECT_URL);
  const getTargetFeedbackUrl = () => formatValidUrl(feedbackUrl, DEFAULT_FEEDBACK_URL);

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
    setMasterEmblemVisible(false);
    setMasterShutterStage('CLOSED_WHITE');
    setMasterStormVisible(false);
    setMasterWaveSubStage('RIBBON_BEAM');
    setMasterVortexFlare(false);

    updateMasterMonitorPhase('STAGE_1');
    const tEmblemIn = setTimeout(() => setMasterEmblemVisible(true), 80);
    const tMidStage1 = setTimeout(() => setMasterShutterStage('IRIS_DARK'), 1900);
    const tOpenStage1 = setTimeout(() => setMasterShutterStage('OPEN_VORTEX'), 3100);
    const tEmblemOut = setTimeout(() => setMasterEmblemVisible(false), 4200);

    const tStormIn = setTimeout(() => {
      updateMasterMonitorPhase('STAGE_2');
      setTimeout(() => setMasterStormVisible(true), 60);
    }, 4400);

    const tSpikeBurst = setTimeout(() => {
      setMasterWaveSubStage('SPIKE_BURST');
    }, 5400);

    const tClimaxFlare = setTimeout(() => {
      setMasterWaveSubStage('LETTER_COMPRESS');
      setMasterVortexFlare(true);
    }, 7400);

    const tStormOut = setTimeout(() => {
      setMasterStormVisible(false);
    }, 9000);

    const tConverge = setTimeout(() => {
      updateMasterMonitorPhase('CONVERGE');
      setTimeout(() => setMasterConvergeActive(true), 60);
    }, 9600);

    const tLocked = setTimeout(() => {
      updateMasterMonitorPhase('LOCKED');
      setActivePhase('PHASE_2_DONE');
    }, 10900);

    masterPhaseTimeoutsRef.current = [
      tEmblemIn,
      tMidStage1,
      tOpenStage1,
      tEmblemOut,
      tStormIn,
      tSpikeBurst,
      tClimaxFlare,
      tStormOut,
      tConverge,
      tLocked
    ];
  };

  const resetToPhase1Pulse = () => {
    clearMasterPhaseTimeouts();
    setMasterEmblemVisible(false);
    setMasterShutterStage('CLOSED_WHITE');
    setMasterWaveSubStage('RIBBON_BEAM');
    setMasterVortexFlare(false);
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
      recConfirmTimeoutRef.current = setTimeout(() => setRecConfirmArmed(false), 1500);
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
    if (phase === 'STAGE_1' || phase === 'STAGE_2') {
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
    if (phase !== 'STAGE_1' && phase !== 'STAGE_2') return;
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

  const fireInstantRedirect = () => executeSynchronizedRedirect();

  const armRemote = (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
    if (hiddenInputRef.current) hiddenInputRef.current.focus({ preventScroll: true });
  };

  const handleOverlaySecretExit = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - overlayExitLastClickTime.current < 500) overlayExitClickCount.current += 1;
    else overlayExitClickCount.current = 1;
    overlayExitLastClickTime.current = now;

    if (overlayExitClickCount.current === 5) {
      overlayExitClickCount.current = 0;
      handleRedirectUp();
      clearMasterPhaseTimeouts();
      updateMasterMonitorPhase('NONE');
    }
  };

  const masterFontSizeClass = masterTargetChars.length > 10
    ? 'text-3xl sm:text-4xl tracking-[0.16em]'
    : masterTargetChars.length > 7
      ? 'text-4xl sm:text-5xl tracking-[0.2em]'
      : 'text-5xl sm:text-6xl tracking-[0.24em]';

  const mappedMasterRippleSubStage = masterShutterStage === 'CLOSED_WHITE'
    ? 'RIPPLE_PURE'
    : masterShutterStage === 'IRIS_DARK'
      ? 'RIPPLE_LETTERS'
      : 'RIPPLE_HORIZON';

  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Master Deck...</div>;

  return (
    <div 
      ref={deckContainerRef}
      tabIndex={-1}
      onClick={armRemote}
      className="h-[100dvh] w-full flex flex-col touch-none select-none overflow-hidden bg-[#0a0a0a] text-white relative font-sans outline-none"
    >
      <style>{`
        @keyframes shutterSubtlePulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.018) rotate(1.2deg); }
        }
        @keyframes rimLightOrbit {
          0% { transform: rotate(-45deg); }
          100% { transform: rotate(315deg); }
        }
        @keyframes vortexSpinClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes vortexSpinCounter {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes acousticConePulse {
          0%, 100% { transform: scale(0.96); opacity: 0.85; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes moldedRippleExpand {
          0% { transform: scale(0.75); opacity: 0; }
          15% { opacity: 0.9; }
          80% { opacity: 0.35; }
          100% { transform: scale(5.8); opacity: 0; }
        }
        @keyframes stardustTwinkle {
          0% { opacity: 0.15; transform: scale(0.7); }
          100% { opacity: 0.95; transform: scale(1.3); }
        }
        @keyframes glyphRippleFloat {
          0% { opacity: 0.2; filter: blur(1px); }
          100% { opacity: 0.85; filter: blur(0px); }
        }
        @keyframes soundwaveMorph {
          0% { transform: scaleY(0.25); }
          100% { transform: scaleY(1.35); }
        }
        @keyframes seismographSpike {
          0% { transform: scaleY(0.12); opacity: 0.35; }
          100% { transform: scaleY(1.18); opacity: 1; }
        }
        @keyframes floatSpark {
          0% { transform: translate(0px, 0px); opacity: 0.25; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0.95; }
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
              if (onSwitchToHeartbeatView) onSwitchToHeartbeatView();
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

      {/* MASTER LIVE MONITOR OVERLAY */}
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
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden select-none touch-none bg-black transition-colors duration-500"
        >
          <div 
            onPointerDown={handleOverlaySecretExit}
            className="absolute bottom-0 right-0 w-32 h-32 z-[95] bg-black/0 touch-none"
          />

          {masterMonitorPhase === 'STAGE_1' && (
            <div className={`relative flex items-center justify-center w-full h-full overflow-hidden pointer-events-none bg-black transition-opacity duration-500 ease-in-out ${masterEmblemVisible ? 'opacity-100' : 'opacity-0'}`}>
              {revealTheme === 'APERTURE_VORTEX' ? (
                <FocusApertureIrisStage1 shutterStage={masterShutterStage} />
              ) : (
                <ExpandedResonanceRippleStage1 subStage={mappedMasterRippleSubStage} />
              )}
            </div>
          )}

          {masterMonitorPhase === 'STAGE_2' && (
            <div className={`relative w-full h-full bg-black overflow-hidden pointer-events-none transition-opacity duration-700 ease-in-out ${masterStormVisible ? 'opacity-100' : 'opacity-0'}`}>
              {revealTheme === 'APERTURE_VORTEX' ? (
                <MagneticVortexStage2 coreFlareActive={masterVortexFlare} />
              ) : (
                <ExpandedResonanceSoundwaveStage2 waveStage={masterWaveSubStage} />
              )}
            </div>
          )}

          {(masterMonitorPhase === 'CONVERGE' || masterMonitorPhase === 'LOCKED') && (
            <div className="relative flex items-center justify-center w-full h-full bg-black px-4 overflow-hidden pointer-events-none">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 whitespace-nowrap">
                {masterTargetChars.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      opacity: masterConvergeActive || masterMonitorPhase === 'LOCKED' ? 1 : 0,
                      transform: masterConvergeActive || masterMonitorPhase === 'LOCKED'
                        ? 'translate(0px, 0px) scale(1)'
                        : `translate(${item.startX}px, ${item.startY}px) scale(0.82)`,
                      transition: 'transform 1.15s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease',
                      textShadow: '0 0 18px rgba(255,255,255,0.95), 0 0 38px rgba(0,240,255,0.85), 0 0 65px rgba(0,180,255,0.55)'
                    }}
                    className={`text-white font-black uppercase inline-block ${masterFontSizeClass}`}
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

          {/* DUAL THEME SELECTOR + SFX TOGGLE */}
          <div className="flex flex-col w-full space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Reveal Theme & Audio Control
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REVEAL_THEMES.map((themeItem) => {
                const isSelected = revealTheme === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    type="button"
                    onClick={() => setRevealTheme(themeItem.id)}
                    className={`py-3 px-3 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all text-left truncate ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {themeItem.label}
                  </button>
                );
              })}
            </div>

            {/* LIVE AUDIENCE SFX TOGGLE */}
            <button
              type="button"
              onClick={() => setSfxEnabled((prev) => !prev)}
              className={`w-full py-2.5 px-3 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center justify-between ${
                sfxEnabled
                  ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
            >
              <span>🔊 AUDIENCE REVEAL SFX</span>
              <span className="font-mono font-black">{sfxEnabled ? 'ENABLED' : 'MUTED'}</span>
            </button>
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

              <div className="flex justify-between text-zinc-300"><span>Phase 2 Reveal</span><span className="text-cyan-400 font-bold">[R]</span></div>
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

        {/* 2. STAGE PROGRESSION BAR */}
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
                ? 'bg-cyan-600 border-cyan-300 text-white shadow-[0_0_15px_rgba(0,240,255,0.6)] animate-pulse'
                : activePhase === 'PHASE_2_DONE'
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                  : 'bg-cyan-950/60 border-cyan-500/70 text-cyan-200'
            }`}
          >
            {activePhase === 'REVEALING'
              ? '🌀 REVEALING...'
              : activePhase === 'PHASE_2_DONE'
                ? `✓ ${peekedWord || customText || 'LOCKED'} [R]`
                : `🌀 REVEAL (${revealTheme === 'APERTURE_VORTEX' ? 'APERTURE' : 'RIPPLE'}) [R]`}
          </button>
        </div>

        {/* 3. FULL-WIDTH LIVE API PEEK + 2X-TAP PALM LOCK TOGGLE SWITCH */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 bg-black/60 border border-zinc-800/90 px-3 py-2 rounded-lg">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              holdUpPromptSent
                ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]'
                : peekedWord
                  ? 'bg-cyan-400'
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
