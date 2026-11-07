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

// Curated 2 Neon-Blue Holographic Themes
const REVEAL_THEMES = [
  { id: 'RIPPLE_WAVE', label: '〰️ Option 1: Resonance Ripple', short: 'RIPPLE' },
  { id: 'APERTURE_VORTEX', label: '◎ Option 2: Focus Aperture', short: 'APERTURE' }
];

// Exact Custom AL Geometric Monogram Logo (Supports Dark & Light Modes)
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
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
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
// REDIRECT LOGIC
// ==========================================
const formatValidUrl = (rawUrl, fallbackUrl) => {
  let clean = (rawUrl || fallbackUrl || '').trim();
  if (!clean) return fallbackUrl;
  if (!clean.startsWith('http') && !clean.includes('://')) {
    clean = `https://${clean}`;
  }
  return clean;
};

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

// ==========================================
// MAIN APP COMPONENT (CLEAN ROUTING: ?master OR 5-TAP)
// ==========================================
export default function App() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
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
// AUDIENCE VIEW (Spectator's Phone)
// ==========================================
function AudienceView({ roomID, skipEntryPrompt = false, onEnterMaster }) {
  const [cameraReady, setCameraReady] = useState(skipEntryPrompt);
  const [isFlashing, setIsFlashing] = useState(false); 
  const [dbStatus, setDbStatus] = useState('waiting'); 
  
  const [kickerWord, setKickerWord] = useState('');
  const kickerWordRef = useRef('');
  const [revealWord, setRevealWord] = useState('');
  const [revealTheme, setRevealTheme] = useState('RIPPLE_WAVE');
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const sfxEnabledRef = useRef(true);
  const [holdUpPromptActive, setHoldUpPromptActive] = useState(true);
  const [uiReady, setUiReady] = useState(false);

  const [promptIndex, setPromptIndex] = useState(0);
  const [promptFade, setPromptFade] = useState(true);
  const [isThumbHolding, setIsThumbHolding] = useState(false);
  const [thumbFocused, setThumbFocused] = useState(false);
  const thumbHoldTimerRef = useRef(null);

  const [stagePhase, setStagePhase] = useState('PULSE');
  const [emblemVisible, setEmblemVisible] = useState(false);
  const [shutterStage, setShutterStage] = useState('CLOSED_WHITE');
  const [stormVisible, setStormVisible] = useState(false);
  const [waveSubStage, setWaveSubStage] = useState('RIBBON_BEAM');
  const [vortexFlare, setVortexFlare] = useState(false);
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
  const activeNodesRef = useRef([]);

  const idleTimerRef = useRef(null);
  const IDLE_TIMEOUT_MS = 180 * 1000; 
  const IDLE_FALLBACK_URL = ""; 

  const clearPhaseTimeouts = () => {
    phaseTimeoutsRef.current.forEach(clearTimeout);
    phaseTimeoutsRef.current = [];
  };

  const stopActiveSynthNodes = () => {
    activeNodesRef.current.forEach((item) => {
      try {
        if (item.timerId) clearTimeout(item.timerId);
        if (item.gain && audioCtxRef.current) {
          const now = audioCtxRef.current.currentTime;
          item.gain.gain.cancelScheduledValues(now);
          item.gain.gain.setValueAtTime(Math.max(item.gain.gain.value || 0.0001, 0.0001), now);
          item.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        }
        if (item.osc) {
          setTimeout(() => {
            try { item.osc.stop(); } catch (e) {}
          }, 75);
        }
      } catch (e) {}
    });
    activeNodesRef.current = [];
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
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume().catch(() => {});
      }
    } catch (e) {}
  };

  // =========================================================
  // TRON: LEGACY × HEARTBEAT PROCEDURAL WEB AUDIO SYNTHESIZER
  // =========================================================

  // Helper: Single Cyber-Heartbeat Thump (Bridges Phase 1 pulse into The Grid)
  const triggerCyberHeartbeat = (ctx, startTime, intensity = 1.0) => {
    try {
      // Lub (Primary ventricular thud + Tron sub-Tail)
      const oscLub = ctx.createOscillator();
      const gainLub = ctx.createGain();
      const filterLub = ctx.createBiquadFilter();

      oscLub.type = 'triangle';
      oscLub.frequency.setValueAtTime(145, startTime);
      oscLub.frequency.exponentialRampToValueAtTime(42, startTime + 0.16);

      filterLub.type = 'lowpass';
      filterLub.frequency.setValueAtTime(260, startTime);
      filterLub.Q.setValueAtTime(3.0, startTime);

      gainLub.gain.setValueAtTime(0.0001, startTime);
      gainLub.gain.linearRampToValueAtTime(0.95 * intensity, startTime + 0.012);
      gainLub.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.19);

      oscLub.connect(filterLub);
      filterLub.connect(gainLub);
      gainLub.connect(ctx.destination);
      oscLub.start(startTime);
      oscLub.stop(startTime + 0.21);

      // Dub (Secondary harmonic cyber-echo 180ms later)
      const dubTime = startTime + 0.18;
      const oscDub = ctx.createOscillator();
      const gainDub = ctx.createGain();
      const filterDub = ctx.createBiquadFilter();

      oscDub.type = 'sine';
      oscDub.frequency.setValueAtTime(175, dubTime);
      oscDub.frequency.exponentialRampToValueAtTime(52, dubTime + 0.14);

      filterDub.type = 'lowpass';
      filterDub.frequency.setValueAtTime(320, dubTime);

      gainDub.gain.setValueAtTime(0.0001, dubTime);
      gainDub.gain.linearRampToValueAtTime(0.65 * intensity, dubTime + 0.01);
      gainDub.gain.exponentialRampToValueAtTime(0.0001, dubTime + 0.16);

      oscDub.connect(filterDub);
      filterDub.connect(gainDub);
      gainDub.connect(ctx.destination);
      oscDub.start(dubTime);
      oscDub.stop(dubTime + 0.18);

      activeNodesRef.current.push({ osc: oscLub, gain: gainLub }, { osc: oscDub, gain: gainDub });
    } catch (e) {}
  };

  // STAGE 1 (0.0s - 4.4s): TRON CS-80 SUB-BASS DRONE + DIGITAL HEARTBEAT + ARPEGGIATED GRID
  const playRevealSubDrone = () => {
    if (!sfxEnabledRef.current || isRedirectingRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;

      // 1. Detuned Analog CS-80 Style Sub-Bass Pad (A1 = 55Hz, detuned saw + sub triangle)
      const oscSaw1 = ctx.createOscillator();
      const oscSaw2 = ctx.createOscillator();
      const oscSub = ctx.createOscillator();
      const filterPad = ctx.createBiquadFilter();
      const gainPad = ctx.createGain();

      oscSaw1.type = 'sawtooth';
      oscSaw1.frequency.setValueAtTime(55.0, now);
      oscSaw1.frequency.linearRampToValueAtTime(55.2, now + 4.3);

      oscSaw2.type = 'sawtooth';
      oscSaw2.frequency.setValueAtTime(55.45, now); // Rich analog chorus detune
      oscSaw2.frequency.linearRampToValueAtTime(110.0, now + 4.3); // Octave bloom at aperture open

      oscSub.type = 'triangle';
      oscSub.frequency.setValueAtTime(110.0, now);

      filterPad.type = 'lowpass';
      filterPad.frequency.setValueAtTime(130, now);
      filterPad.frequency.linearRampToValueAtTime(240, now + 1.9);
      filterPad.frequency.exponentialRampToValueAtTime(680, now + 3.4); // Opens as iris/horizon opens
      filterPad.Q.setValueAtTime(4.2, now);

      gainPad.gain.setValueAtTime(0.0001, now);
      gainPad.gain.linearRampToValueAtTime(0.32, now + 0.45);
      gainPad.gain.setValueAtTime(0.36, now + 3.6);
      gainPad.gain.exponentialRampToValueAtTime(0.0001, now + 4.35);

      oscSaw1.connect(filterPad);
      oscSaw2.connect(filterPad);
      oscSub.connect(filterPad);
      filterPad.connect(gainPad);
      gainPad.connect(ctx.destination);

      oscSaw1.start(now);
      oscSaw2.start(now);
      oscSub.start(now);
      oscSaw1.stop(now + 4.4);
      oscSaw2.stop(now + 4.4);
      oscSub.stop(now + 4.4);

      activeNodesRef.current.push(
        { osc: oscSaw1, gain: gainPad },
        { osc: oscSaw2, gain: gainPad },
        { osc: oscSub, gain: gainPad }
      );

      // 2. Four Steady Cyber-Heartbeats (Tying Phase 1 Pulse into the Hologram)
      [0.12, 1.15, 2.15, 3.15].forEach((offset, idx) => {
        triggerCyberHeartbeat(ctx, now + offset, 0.75 + idx * 0.08);
      });

      // 3. Tron Arpeggiated Cyber-Grid Sequence (A Minor Add9: A3-B3-C4-E4-A4-E4-C4-B3)
      const arpNotes = [220.0, 246.94, 261.63, 329.63, 440.0, 329.63, 261.63, 246.94];
      const stepDur = 0.135;
      for (let i = 0; i < 30; i++) {
        const noteTime = now + 0.25 + i * stepDur;
        if (noteTime > now + 4.25) break;
        const oscArp = ctx.createOscillator();
        const filterArp = ctx.createBiquadFilter();
        const gainArp = ctx.createGain();

        oscArp.type = 'sawtooth';
        oscArp.frequency.setValueAtTime(arpNotes[i % arpNotes.length], noteTime);

        filterArp.type = 'bandpass';
        // Filter gradually opens as Stage 1 progresses
        const progress = i / 30;
        filterArp.frequency.setValueAtTime(450 + progress * 1400, noteTime);
        filterArp.Q.setValueAtTime(3.5, noteTime);

        const peak = 0.04 + progress * 0.12;
        gainArp.gain.setValueAtTime(0.0001, noteTime);
        gainArp.gain.linearRampToValueAtTime(peak, noteTime + 0.012);
        gainArp.gain.exponentialRampToValueAtTime(0.0001, noteTime + stepDur * 0.85);

        oscArp.connect(filterArp);
        filterArp.connect(gainArp);
        gainArp.connect(ctx.destination);

        oscArp.start(noteTime);
        oscArp.stop(noteTime + stepDur);
        activeNodesRef.current.push({ osc: oscArp, gain: gainArp });
      }
    } catch (e) {}
  };

  // Cyber-Optic Laser Sweep when Iris snaps open / Horizon flares at 3.1s
  const playApertureCyberSweep = () => {
    if (!sfxEnabledRef.current || isRedirectingRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;

      const oscSweep = ctx.createOscillator();
      const filterSweep = ctx.createBiquadFilter();
      const gainSweep = ctx.createGain();

      oscSweep.type = 'sawtooth';
      oscSweep.frequency.setValueAtTime(165, now);
      oscSweep.frequency.exponentialRampToValueAtTime(660, now + 0.55);

      filterSweep.type = 'bandpass';
      filterSweep.frequency.setValueAtTime(300, now);
      filterSweep.frequency.exponentialRampToValueAtTime(2200, now + 0.55);
      filterSweep.Q.setValueAtTime(5.0, now);

      gainSweep.gain.setValueAtTime(0.0001, now);
      gainSweep.gain.linearRampToValueAtTime(0.28, now + 0.08);
      gainSweep.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      oscSweep.connect(filterSweep);
      filterSweep.connect(gainSweep);
      gainSweep.connect(ctx.destination);

      oscSweep.start(now);
      oscSweep.stop(now + 0.7);
      activeNodesRef.current.push({ osc: oscSweep, gain: gainSweep });
    } catch (e) {}
  };

  // STAGE 2 (4.4s - 9.0s): ACCELERATING HEARTBEAT + DAFT PUNK POLY-SYNTH RISER & DATA STREAM
  const playRevealTensionRiser = () => {
    if (!sfxEnabledRef.current || isRedirectingRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;
      const duration = 4.55;

      // 1. Dual Detuned Tron Poly-Synth Riser (Octave & Fifth Harmonic Climb)
      const oscLow = ctx.createOscillator();
      const oscDetune = ctx.createOscillator();
      const oscFifth = ctx.createOscillator();
      const filterRiser = ctx.createBiquadFilter();
      const gainRiser = ctx.createGain();

      oscLow.type = 'sawtooth';
      oscLow.frequency.setValueAtTime(110, now);
      oscLow.frequency.exponentialRampToValueAtTime(440, now + duration);

      oscDetune.type = 'sawtooth';
      oscDetune.frequency.setValueAtTime(110.8, now);
      oscDetune.frequency.exponentialRampToValueAtTime(443.2, now + duration);

      oscFifth.type = 'triangle';
      oscFifth.frequency.setValueAtTime(164.81, now);
      oscFifth.frequency.exponentialRampToValueAtTime(659.25, now + duration);

      filterRiser.type = 'lowpass';
      filterRiser.frequency.setValueAtTime(220, now);
      filterRiser.frequency.exponentialRampToValueAtTime(3800, now + duration);
      filterRiser.Q.setValueAtTime(4.5, now);

      gainRiser.gain.setValueAtTime(0.0001, now);
      gainRiser.gain.linearRampToValueAtTime(0.24, now + 0.5);
      gainRiser.gain.exponentialRampToValueAtTime(0.55, now + duration - 0.12);
      gainRiser.gain.linearRampToValueAtTime(0.0001, now + duration);

      oscLow.connect(filterRiser);
      oscDetune.connect(filterRiser);
      oscFifth.connect(filterRiser);
      filterRiser.connect(gainRiser);
      gainRiser.connect(ctx.destination);

      oscLow.start(now);
      oscDetune.start(now);
      oscFifth.start(now);
      oscLow.stop(now + duration + 0.05);
      oscDetune.stop(now + duration + 0.05);
      oscFifth.stop(now + duration + 0.05);

      activeNodesRef.current.push(
        { osc: oscLow, gain: gainRiser },
        { osc: oscDetune, gain: gainRiser },
        { osc: oscFifth, gain: gainRiser }
      );

      // 2. Accelerating Heartbeat Pulse (Ties emotional memory rush to the spinning vortex)
      const beatOffsets = [0.05, 0.85, 1.55, 2.15, 2.65, 3.08, 3.44, 3.74, 3.99, 4.20, 4.38];
      beatOffsets.forEach((offset, idx) => {
        const progress = idx / beatOffsets.length;
        triggerCyberHeartbeat(ctx, now + offset, 0.7 + progress * 0.5);
      });

      // 3. High-Speed Holographic Data-Stream Arpeggiator
      const crystalNotes = [440, 523.25, 659.25, 783.99, 880, 1046.5, 1318.5, 1567.98];
      const totalArpSteps = 44;
      const arpStep = duration / totalArpSteps;
      for (let i = 0; i < totalArpSteps; i++) {
        const t = now + i * arpStep;
        const progress = i / totalArpSteps;
        const oscBlip = ctx.createOscillator();
        const gainBlip = ctx.createGain();

        oscBlip.type = 'sine';
        const baseFreq = crystalNotes[i % crystalNotes.length] * (1 + progress * 0.5);
        oscBlip.frequency.setValueAtTime(baseFreq, t);

        const blipPeak = 0.03 + Math.pow(progress, 1.6) * 0.16;
        gainBlip.gain.setValueAtTime(0.0001, t);
        gainBlip.gain.linearRampToValueAtTime(blipPeak, t + 0.008);
        gainBlip.gain.exponentialRampToValueAtTime(0.0001, t + arpStep * 0.85);

        oscBlip.connect(gainBlip);
        gainBlip.connect(ctx.destination);

        oscBlip.start(t);
        oscBlip.stop(t + arpStep);
        activeNodesRef.current.push({ osc: oscBlip, gain: gainBlip });
      }
    } catch (e) {}
  };

  // 9.0s: Vacuum Sub Power-Down before the 600ms dramatic silence
  const playVacuumPowerDown = () => {
    if (!sfxEnabledRef.current || isRedirectingRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;

      const oscDown = ctx.createOscillator();
      const gainDown = ctx.createGain();

      oscDown.type = 'sine';
      oscDown.frequency.setValueAtTime(380, now);
      oscDown.frequency.exponentialRampToValueAtTime(34, now + 0.22);

      gainDown.gain.setValueAtTime(0.35, now);
      gainDown.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      oscDown.connect(gainDown);
      gainDown.connect(ctx.destination);
      oscDown.start(now);
      oscDown.stop(now + 0.25);
    } catch (e) {}
  };

  // STAGE 3 (9.6s): SINGULARITY IMPACT — TRON LEGACY BRASS CHORD + SUB-DROP + CRYSTAL LOCK
  const playRevealConvergenceImpact = () => {
    if (!sfxEnabledRef.current || isRedirectingRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const now = ctx.currentTime;

      // 1. Seismic Sub-Drop (150Hz -> 28Hz)
      const oscSub = ctx.createOscillator();
      const gainSub = ctx.createGain();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(150, now);
      oscSub.frequency.exponentialRampToValueAtTime(28, now + 0.75);

      gainSub.gain.setValueAtTime(0.0001, now);
      gainSub.gain.linearRampToValueAtTime(1.85, now + 0.018);
      gainSub.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

      oscSub.connect(gainSub);
      gainSub.connect(ctx.destination);
      oscSub.start(now);
      oscSub.stop(now + 1.2);

      // 2. Daft Punk / Tron: Legacy Detuned CS-80 Synth Brass Chord (A2 - E3 - A3 - B3 - C4 - E4 - A4)
      const brassFilter = ctx.createBiquadFilter();
      const brassGain = ctx.createGain();

      brassFilter.type = 'lowpass';
      brassFilter.frequency.setValueAtTime(180, now);
      brassFilter.frequency.exponentialRampToValueAtTime(2600, now + 0.08); // Brass bite on impact
      brassFilter.frequency.exponentialRampToValueAtTime(580, now + 1.4);   // Warm cinematic sustain
      brassFilter.frequency.exponentialRampToValueAtTime(220, now + 3.2);
      brassFilter.Q.setValueAtTime(2.4, now);

      brassGain.gain.setValueAtTime(0.0001, now);
      brassGain.gain.linearRampToValueAtTime(0.42, now + 0.035);
      brassGain.gain.setValueAtTime(0.36, now + 0.9);
      brassGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.3);

      brassFilter.connect(brassGain);
      brassGain.connect(ctx.destination);

      const chordVoicing = [
        { freq: 110.0, type: 'sawtooth' },   // A2
        { freq: 110.45, type: 'sawtooth' },  // A2 detuned
        { freq: 164.81, type: 'sawtooth' },  // E3 (5th)
        { freq: 220.0, type: 'sawtooth' },   // A3
        { freq: 246.94, type: 'triangle' },  // B3 (Emotional 9th)
        { freq: 329.63, type: 'sawtooth' },  // E4
        { freq: 440.0, type: 'triangle' },   // A4
      ];

      chordVoicing.forEach(({ freq, type }) => {
        const osc = ctx.createOscillator();
        const voiceGain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        voiceGain.gain.setValueAtTime(0.18, now);
        osc.connect(voiceGain);
        voiceGain.connect(brassFilter);
        osc.start(now);
        osc.stop(now + 3.4);
      });

      // 3. Holographic Glass Data-Lock Ping (High Crystalline E6 + A6)
      [1318.51, 1760.0].forEach((freq, idx) => {
        const oscPing = ctx.createOscillator();
        const gainPing = ctx.createGain();
        oscPing.type = 'sine';
        oscPing.frequency.setValueAtTime(freq, now);

        gainPing.gain.setValueAtTime(0.0001, now);
        gainPing.gain.linearRampToValueAtTime(idx === 0 ? 0.28 : 0.2, now + 0.01);
        gainPing.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        oscPing.connect(gainPing);
        gainPing.connect(ctx.destination);
        oscPing.start(now);
        oscPing.stop(now + 2.3);
      });

      // 4. Final Echo Heartbeat 1.1s after the name locks (The memory lives on)
      triggerCyberHeartbeat(ctx, now + 1.15, 0.55);

      if (navigator.vibrate) navigator.vibrate([50, 60, 140]);
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
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      trackRef.current = stream.getVideoTracks()[0];
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
    stopActiveSynthNodes();
    clearTimeout(timerRef.current);
    applyTorch(false);

    if (incomingTheme) setRevealTheme(incomingTheme);

    const finalWord = (wordToReveal || kickerWordRef.current || 'JAMES').trim();
    setRevealWord(finalWord);
    setConvergeActive(false);
    setEmblemVisible(false);
    setShutterStage('CLOSED_WHITE');
    setStormVisible(false);
    setWaveSubStage('RIBBON_BEAM');
    setVortexFlare(false);

    setStagePhase('STAGE_1');
    playRevealSubDrone();
    const tEmblemIn = setTimeout(() => setEmblemVisible(true), 80);

    const tMidStage1 = setTimeout(() => {
      setShutterStage('IRIS_DARK');
    }, 1900);

    const tOpenStage1 = setTimeout(() => {
      setShutterStage('OPEN_VORTEX');
      playApertureCyberSweep();
    }, 3100);

    const tEmblemOut = setTimeout(() => {
      setEmblemVisible(false);
    }, 4200);

    const tStormIn = setTimeout(() => {
      setStagePhase('STAGE_2');
      playRevealTensionRiser();
      setTimeout(() => setStormVisible(true), 60);
    }, 4400);

    const tSpikeBurst = setTimeout(() => {
      setWaveSubStage('SPIKE_BURST');
    }, 5400);

    const tClimaxFlare = setTimeout(() => {
      setWaveSubStage('LETTER_COMPRESS');
      setVortexFlare(true);
    }, 7400);

    const tStormOut = setTimeout(() => {
      setStormVisible(false);
      stopActiveSynthNodes();
      playVacuumPowerDown();
    }, 9000);

    const tConverge = setTimeout(() => {
      setStagePhase('CONVERGE');
      playRevealConvergenceImpact();
      setTimeout(() => setConvergeActive(true), 60);
    }, 9600);

    const tLocked = setTimeout(() => {
      setStagePhase('LOCKED');
    }, 10900);

    phaseTimeoutsRef.current = [
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

  useEffect(() => {
    const uiTimer = setTimeout(() => setUiReady(true), 300);

    const feedbackRef = ref(db, `${roomID}/feedbackUrl`);
    const unsubFeedback = onValue(feedbackRef, (snapshot) => {
      const val = snapshot.val();
      if (val && String(val).trim() !== '') feedbackUrlRef.current = String(val).trim();
      else feedbackUrlRef.current = DEFAULT_FEEDBACK_URL;
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

    const themeRef = ref(db, `${roomID}/revealStyle`);
    const unsubTheme = onValue(themeRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setRevealTheme(String(val));
    });

    const sfxRef = ref(db, `${roomID}/sfxEnabled`);
    const unsubSfx = onValue(sfxRef, (snapshot) => {
      const val = snapshot.val();
      const enabled = val === null ? true : Boolean(val);
      setSfxEnabled(enabled);
      sfxEnabledRef.current = enabled;
    });

    const commandRef = ref(db, `${roomID}/audienceCommand`);
    const unsubCommand = onValue(commandRef, (snapshot) => {
      setDbStatus('live');
      const command = snapshot.val();
      if (command) {
        const safeCommand = String(command);
        const parts = safeCommand.split('|');
        const timestamp = Number(parts[1] || 0);
        
        // Discard stale commands older than 4 seconds
        if (Date.now() - timestamp > 4000) return;

        const isInitialLoad = initialLoadRef.current;
        if (isInitialLoad) {
          initialLoadRef.current = false;
          if (parts[0] === 'REDIRECT' || parts[0] === 'PHASE_REVEAL') return; 
        }
        handleCommand(command, isInitialLoad);
      }
    }, () => { setDbStatus('error'); });
    
    return () => {
      clearTimeout(uiTimer);
      clearTimeout(thumbHoldTimerRef.current);
      clearPhaseTimeouts();
      stopActiveSynthNodes();
      unsubFeedback();
      unsubCommand();
      unsubText();
      unsubHoldUp();
      unsubTheme();
      unsubSfx();
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
      stopActiveSynthNodes();
      applyTorch(false);
      setThumbFocused(false);
      setEmblemVisible(false);
      setShutterStage('CLOSED_WHITE');
      setStormVisible(false);
      setWaveSubStage('RIBBON_BEAM');
      setVortexFlare(false);
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
      stopActiveSynthNodes();
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

  // 5-Tap Secret Zone in Bottom Right
  const handleSecretClick = () => {
    const currentTime = new Date().getTime();
    if (currentTime - secretLastClickTime.current < 500) {
      secretClickCount.current += 1;
    } else {
      secretClickCount.current = 1;
    }
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

  const revealFontSizeClass = targetChars.length > 10
    ? 'text-3xl sm:text-4xl tracking-[0.16em]'
    : targetChars.length > 7
      ? 'text-4xl sm:text-5xl tracking-[0.2em]'
      : 'text-5xl sm:text-6xl tracking-[0.24em]';

  const mappedRippleSubStage = shutterStage === 'CLOSED_WHITE'
    ? 'RIPPLE_PURE'
    : shutterStage === 'IRIS_DARK'
      ? 'RIPPLE_LETTERS'
      : 'RIPPLE_HORIZON';

  return (
    <div className={`min-h-[100dvh] relative flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden select-none ${
      stagePhase !== 'PULSE' ? 'bg-black text-white' :
      !cameraReady ? 'bg-[#f4f4f2] text-black' :
      isFlashing ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
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

      {/* Secret Tap Area Restored */}
      <div 
        onPointerDown={(e) => { e.stopPropagation(); handleSecretClick(); }} 
        className="absolute bottom-0 right-0 w-32 h-32 z-[100] bg-black/0 touch-none" 
      />

      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {stagePhase === 'STAGE_1' && (
        <div className={`relative flex items-center justify-center w-full min-h-[100dvh] overflow-hidden bg-black select-none pointer-events-none transition-opacity duration-500 ease-in-out ${emblemVisible ? 'opacity-100' : 'opacity-0'}`}>
          {revealTheme === 'APERTURE_VORTEX' ? (
            <FocusApertureIrisStage1 shutterStage={shutterStage} />
          ) : (
            <ExpandedResonanceRippleStage1 subStage={mappedRippleSubStage} />
          )}
        </div>
      )}

      {stagePhase === 'STAGE_2' && (
        <div className={`relative w-full min-h-[100dvh] bg-black overflow-hidden transition-opacity duration-700 ease-in-out ${stormVisible ? 'opacity-100' : 'opacity-0'}`}>
          {revealTheme === 'APERTURE_VORTEX' ? (
            <MagneticVortexStage2 coreFlareActive={vortexFlare} />
          ) : (
            <ExpandedResonanceSoundwaveStage2 waveStage={waveSubStage} />
          )}
        </div>
      )}

      {(stagePhase === 'CONVERGE' || stagePhase === 'LOCKED') && (
        <div className="relative flex items-center justify-center w-full min-h-[100dvh] bg-black px-4 overflow-hidden pointer-events-none">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 whitespace-nowrap">
            {targetChars.map((item, idx) => (
              <span
                key={idx}
                style={{
                  opacity: convergeActive || stagePhase === 'LOCKED' ? 1 : 0,
                  transform: convergeActive || stagePhase === 'LOCKED'
                    ? 'translate(0px, 0px) scale(1)'
                    : `translate(${item.startX}px, ${item.startY}px) scale(0.82)`,
                  transition: 'transform 1.15s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease',
                  textShadow: '0 0 18px rgba(255,255,255,0.95), 0 0 38px rgba(0,240,255,0.85), 0 0 65px rgba(0,180,255,0.55)'
                }}
                className={`text-white font-black uppercase inline-block ${revealFontSizeClass}`}
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

  const [revealTheme, setRevealTheme] = useState(() => localStorage.getItem('magicRevealStyle') || 'RIPPLE_WAVE');
  const revealThemeRef = useRef(revealTheme);
  const [sfxEnabled, setSfxEnabled] = useState(() => {
    const saved = localStorage.getItem('magicSfxEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isCuesTouchLocked, setIsCuesTouchLocked] = useState(true);
  const isCuesTouchLockedRef = useRef(true);
  const [cueLockConfirmArmed, setCueLockConfirmArmed] = useState(false);
  const cueLockConfirmTimeoutRef = useRef(null);

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
