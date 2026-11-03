import React, { useState, useEffect, useRef, useMemo } from 'react';

// ==========================================
// FIREBASE SETUP
// ==========================================
import { db } from './firebase'; 
import { ref, onValue, set } from 'firebase/database';

const DEFAULT_REDIRECT_URL = 'https://instagram.com/andrewleemagic';
const DEFAULT_FEEDBACK_URL = 'https://andrewleemagic.com/feedback';
const FEEDBACK_DELAY_MS = 30 * 1000; // 30 seconds

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

  // 1. Standard 30-second timer (if the OS opened the native Instagram app and kept this tab alive)
  const timerId = setTimeout(goToFeedback, FEEDBACK_DELAY_MS);

  // 2. Wake / Return listener: if iOS paused timers while the native Instagram app was in focus,
  // check elapsed time the moment the user returns to Safari/Chrome
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

  // 3. Fire immediate navigation to Instagram (opens native app via Universal Link or loads web profile)
  window.location.href = finalPrimaryUrl;
};

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const isMaster = searchParams.has('master');
  // Defaults to 'v2-stage' so V2 never collides with your V1 'main-stage'
  const roomID = searchParams.get('room') || 'v2-stage';

  return isMaster ? <ControlView roomID={roomID} /> : <AudienceView roomID={roomID} />;
}

// ==========================================
// AUDIENCE VIEW (Spectator's Phone - Option A)
// ==========================================
function AudienceView({ roomID }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false); 
  const [dbStatus, setDbStatus] = useState('waiting'); 
  
  const [kickerWord, setKickerWord] = useState('');
  const kickerWordRef = useRef('');
  const [revealWord, setRevealWord] = useState('');
  const [isWordRevealed, setIsWordRevealed] = useState(false);
  const [uiReady, setUiReady] = useState(false);

  // OPTION A STAGE FLOW:
  // 'PULSE' (Phase 1: Word hidden) -> 'SPIRAL' -> 'LETTERS' -> 'CONVERGE' -> 'LOCKED' -> 'PULSE' (Phase 2: Word visible)
  const [stagePhase, setStagePhase] = useState('PULSE');
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
  const IDLE_FALLBACK_URL = ""; // Deadman's switch disabled by default

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

  // Pre-generate floating decoy letter particles for Phase 2 letter cloud
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

  // Pre-generate scatter offsets for the target word convergence
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

  // Check if spectator is returning to this tab after a redirect (e.g., via Back button or bfcache)
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

  const playHeartbeatThud = (isSecondBeat = false) => {
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

      const startFreq = isSecondBeat ? 210 : 185;
      const endFreq = isSecondBeat ? 70 : 58;
      const duration = isSecondBeat ? 0.14 : 0.18;
      const peakGain = isSecondBeat ? 2.4 : 3.5;

      oscSub.frequency.setValueAtTime(startFreq, now);
      oscSub.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      oscPunch.frequency.setValueAtTime(startFreq * 1.5, now);
      oscPunch.frequency.exponentialRampToValueAtTime(endFreq * 1.2, now + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
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

  const applyTorch = async (active) => {
    if (isRedirectingRef.current && active) return;
    setIsFlashing(active); 
    if (!trackRef.current) return;
    try {
      await trackRef.current.applyConstraints({ advanced: [{ torch: active }] });
    } catch (err) {}
  };

  // PHASE 2 REVEAL SEQUENCE: SPIRAL (5s) -> LETTERS (5s) -> CONVERGE & LOCK (3.8s) -> PULSE WITH NAME REVEALED
  const runRevealSequence = (wordToReveal) => {
    clearPhaseTimeouts();
    clearTimeout(timerRef.current);
    applyTorch(false);

    const finalWord = (wordToReveal || kickerWordRef.current || 'JAMES').trim();
    setRevealWord(finalWord);
    setConvergeActive(false);

    // 1. Hypnotic Spiral + AL Badge (0.0s -> 5.0s)
    setStagePhase('SPIRAL');

    // 2. Floating Decoy Letter Cloud (5.0s -> 10.0s)
    const t1 = setTimeout(() => {
      setStagePhase('LETTERS');
    }, 5000);

    // 3. Magnetic Word Convergence (10.0s -> 11.2s)
    const t2 = setTimeout(() => {
      setStagePhase('CONVERGE');
      setTimeout(() => setConvergeActive(true), 60);
    }, 10000);

    // 4. Solid Locked Reveal Hold (11.2s -> 13.8s)
    const t3 = setTimeout(() => {
      setStagePhase('LOCKED');
    }, 11200);

    // 5. Return to Pulse View with the Name Unlocked & Displayed at Top (13.8s)
    const t4 = setTimeout(() => {
      setIsWordRevealed(true);
      setStagePhase('PULSE');
    }, 13800);

    phaseTimeoutsRef.current = [t1, t2, t3, t4];
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
      clearPhaseTimeouts();
      unsubFeedback();
      unsubCommand();
      unsubText();
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
      setIsWordRevealed(false);
      setStagePhase('PULSE');
    } else if (baseCmd === 'PHASE_REVEAL') {
      const passedWord = (parts[2] || '').trim();
      runRevealSequence(passedWord);
    } else if (baseCmd === 'ON') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      applyTorch(true);
    } else if (baseCmd === 'OFF') {
      applyTorch(false);
      if (!isInitialLoad) resetIdleTimer();
    } else if (baseCmd === 'STRIKE_LUB') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      applyTorch(true);
      playHeartbeatThud(false);
      if (navigator.vibrate) navigator.vibrate(100);
      timerRef.current = setTimeout(() => applyTorch(false), 140);
    } else if (baseCmd === 'STRIKE_DUB') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      applyTorch(true);
      playHeartbeatThud(true);
      if (navigator.vibrate) navigator.vibrate(70);
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
        applyTorch(isOn);
        if (step === 0) {
          playHeartbeatThud(false); 
          if (navigator.vibrate) navigator.vibrate([100, 150, 100]);
        } else if (step === 2) {
          playHeartbeatThud(true);  
        }
        step = (step + 1) % pattern.length;
        timerRef.current = setTimeout(playHeartbeat, duration);
      };
      playHeartbeat();
    } else if (baseCmd === 'STROBE') {
      isRedirectingRef.current = false;
      setStagePhase('PULSE');
      const playStrobe = () => {
        if (isRedirectingRef.current) return;
        const isOn = Math.random() > 0.5; 
        applyTorch(isOn);
        const randomDelay = Math.floor(Math.random() * 90) + 60;
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
      const separator = window.location.search ? '&' : '?';
      window.location.href = window.location.pathname + window.location.search + separator + 'master=true';
    }
  };

  const displayedName = kickerWord || revealWord;

  return (
    <div className={`min-h-[100dvh] relative flex flex-col items-center justify-center transition-colors duration-75 overflow-hidden select-none ${
      stagePhase === 'SPIRAL' ? 'bg-white text-black' :
      (stagePhase === 'LETTERS' || stagePhase === 'CONVERGE' || stagePhase === 'LOCKED') ? 'bg-black text-white' :
      isFlashing ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Keyframes for Phase 2 Hypnotic Spiral & Floating Letter Cloud */}
      <style>{`
        @keyframes spinHypnotic {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.15) rotate(360deg); }
        }
        @keyframes floatLetter {
          0% { transform: translate(0px, 0px); opacity: 0.15; }
          50% { transform: translate(var(--dx), var(--dy)); opacity: 0.85; }
          100% { transform: translate(calc(var(--dx) * -0.6), calc(var(--dy) * 0.6)); opacity: 0.2; }
        }
      `}</style>

      <div className="absolute top-4 left-4 z-50 opacity-20">
        <div className={`w-3 h-3 rounded-full ${dbStatus === 'live' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : dbStatus === 'error' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-500 animate-pulse'}`}></div>
      </div>

      <div 
        onPointerDown={(e) => { e.stopPropagation(); handleSecretClick(); }} 
        className="absolute top-0 left-0 w-32 h-32 z-[100] bg-black/0 touch-none" 
      />

      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {/* ==========================================
          PHASE 2A: HYPNOTIC SPIRAL + AL LOGO (5s)
         ========================================== */}
      {stagePhase === 'SPIRAL' && (
        <div className="relative flex items-center justify-center w-full min-h-[100dvh] overflow-hidden bg-white">
          <div 
            className="absolute w-[180vmax] h-[180vmax] rounded-full"
            style={{
              background: 'repeating-radial-gradient(circle, #000 0px, #000 22px, #fff 22px, #fff 44px)',
              animation: 'spinHypnotic 4s linear infinite'
            }}
          />
          <div className="relative z-10 w-44 h-44 rounded-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.35)] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-[3.5px] border-black flex items-center justify-center font-black text-black text-2xl tracking-tighter">
              AL
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          PHASE 2B: FLOATING LETTER CLOUD (5s)
         ========================================== */}
      {stagePhase === 'LETTERS' && (
        <div className="relative w-full min-h-[100dvh] bg-black overflow-hidden">
          {decoyParticles.map((p) => (
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

      {/* ==========================================
          PHASE 2C: MAGNETIC CONVERGENCE & REVEAL (3.8s)
         ========================================== */}
      {(stagePhase === 'CONVERGE' || stagePhase === 'LOCKED') && (
        <div className="relative flex items-center justify-center w-full min-h-[100dvh] bg-black px-4 overflow-hidden">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 flex-wrap">
            {targetChars.map((item, idx) => (
              <span
                key={idx}
                style={{
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

      {/* ==========================================
          PHASE 1 (PULSE FIRST) & POST-REVEAL PULSE
         ========================================== */}
      {stagePhase === 'PULSE' && (
        !cameraReady ? (
          <div 
            onClick={startCamera}
            className={`flex flex-col items-center justify-center w-full min-h-[100dvh] max-w-md px-6 z-10 cursor-pointer transition-opacity duration-700 ease-in-out ${uiReady ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="flex items-center space-x-2 mb-3 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]"></span>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                [ Tap to Connect ]
              </span>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); startCamera(); }}
              className="w-full py-6 bg-black text-white font-black rounded-xl text-2xl tracking-widest shadow-[0_12px_35px_rgba(0,0,0,0.22)] mb-6 transition-transform active:scale-95 uppercase px-4 break-words leading-tight ring-4 ring-black/5 animate-pulse"
            >
              BEGIN EXPERIMENT
            </button>

            <div className="text-center space-y-2">
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest px-4">
                Please allow camera access when prompted, to sync with the performance
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* In Option A, the thought-of name stays hidden during Phase 1 and only appears after Phase 2 Reveal */}
            <div className={`absolute top-24 left-0 right-0 w-full text-center px-6 pointer-events-none z-20 transition-opacity duration-500 ${(isWordRevealed && displayedName) ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                You are currently focusing on
              </p>
              <span className="uppercase text-4xl font-black mt-3 mb-3 block tracking-widest drop-shadow-sm">
                {displayedName}
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Do not break concentration
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full pointer-events-none">
              <div className="relative flex items-center justify-center">
                <div className="w-6 h-6 bg-red-600 rounded-full drop-shadow-md"></div>
                <div className="absolute w-24 h-24 border-2 border-red-600 rounded-full animate-ping opacity-30"></div>
                <div className="absolute w-48 h-48 border border-red-600 rounded-full opacity-10" style={{ animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                <div className="absolute w-72 h-72 border border-red-600 rounded-full opacity-5" style={{ animation: 'ping 4s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
              </div>
            </div>

            <div className="absolute bottom-16 left-0 right-0 w-full text-center px-4 pointer-events-none z-20">
              <h1 className="text-[28px] font-black uppercase tracking-[0.15em] leading-tight">
                Hold up your<br/>phone
              </h1>
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
function ControlView({ roomID }) {
  const [isReady, setIsReady] = useState(false);
  const trackRef = useRef(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localMode, setLocalMode] = useState('OFF');
  const [audienceMode, setAudienceMode] = useState('OFF');
  const [activePhase, setActivePhase] = useState('PHASE_1'); // 'PHASE_1' | 'REVEALING' | 'PHASE_2_DONE'

  // MASTER LIVE MONITOR STATES (Lets Magician watch the Spiral -> Letters -> Word formation in sync)
  const [masterMonitorPhase, setMasterMonitorPhase] = useState('NONE'); // 'NONE' | 'SPIRAL' | 'LETTERS' | 'CONVERGE' | 'LOCKED'
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
  const [lastKey, setLastKey] = useState('NONE'); 
  const hiddenInputRef = useRef(null);
  const deckContainerRef = useRef(null);

  // CHOREOGRAPHY & DOUBLE-TAP REC STATES
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

  const masterSecretClickCount = useRef(0);
  const masterSecretLastClickTime = useRef(0);

  // Decoy letter particles for Master Monitor
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

  // Target character scatter offsets for Master Monitor word convergence
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

  // SILENT API CATCH
  useEffect(() => {
    let timer;
    const executeMasterPoll = async () => {
      if (!isInjectSyncing || !injectUrl) return;
      try {
        let text = "";
        try {
          const res = await fetch(`${injectUrl}?t=${Date.now()}`);
          if (!res.ok) throw new Error();
          text = await res.text();
        } catch (e) {
          const targetUrl = encodeURIComponent(`${injectUrl}?t=${Date.now()}`);
          const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}`;
          const res2 = await fetch(proxyUrl);
          text = await res2.text();
        }

        let word = "";
        try {
          const json = JSON.parse(text);
          const keyToPoll = injectKey.trim() || 'peek';
          if (json[keyToPoll] !== undefined && json[keyToPoll] !== null) {
            word = String(json[keyToPoll]).trim();
          }
        } catch(e) {}

        if (word && word !== lastInjectRef.current) {
          lastInjectRef.current = word;
          setPeekedWord(word);
          peekedWordRef.current = word;
          set(ref(db, `${roomID}/buttonText`), word);
        }
      } catch (e) {}
    };

    if (isInjectSyncing && injectUrl) {
      executeMasterPoll();
      timer = setInterval(executeMasterPoll, 2000); 
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
      if (k === 'g' || k === 'G') { e.preventDefault(); triggerPhase2Reveal(); return; }
      if (isPlayingRef.current) { handleStopPlayback(); return; }
      if (k === 'p' || k === 'P') { e.preventDefault(); handlePlayToggle(); return; }
      
      if (k === 'ArrowUp' || k === 'PageUp' || k === 'VolumeUp') { e.preventDefault(); handleLocalDown(); }
      else if (k === 'ArrowRight') { e.preventDefault(); startLocalHeartbeat(); }
      else if (k === 'ArrowDown' || k === 'PageDown' || k === 'VolumeDown') { e.preventDefault(); handleAudienceDown(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); startAudienceHeartbeat(); }
      else if (k === 'u' || k === 'U') { e.preventDefault(); toggleLocalTorch(); }
      else if (k === 'r' || k === 'R') { e.preventDefault(); toggleLocalHeartbeat(); }
      else if (k === 'e' || k === 'E') { e.preventDefault(); toggleLocalStrobe(); }
      else if (k === 'd' || k === 'D') { e.preventDefault(); toggleAudienceTorch(); }
      else if (k === 'l' || k === 'L') { e.preventDefault(); toggleAudienceHeartbeat(); }
      else if (k === 's' || k === 'S') { e.preventDefault(); toggleAudienceStrobe(); }
    };

    const handleKeyUp = (e) => {
      const activeEl = document.activeElement;
      const isTypingInSettings = activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'text' && activeEl !== hiddenInputRef.current;
      if (isTypingInSettings) return;

      const k = e.key;
      if (k === 'ArrowUp' || k === 'PageUp' || k === 'VolumeUp') { e.preventDefault(); handleLocalUp(); }
      else if (k === 'ArrowDown' || k === 'PageDown' || k === 'VolumeDown') { e.preventDefault(); handleAudienceUp(); }
      else if (k === 'ArrowRight') { e.preventDefault(); stopLocalHeartbeat(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); stopAudienceHeartbeat(); }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      clearInterval(focusInterval);
      clearTimeout(recConfirmTimeoutRef.current);
      clearMasterPhaseTimeouts();
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [localMode, audienceMode, redirectUrl, feedbackUrl]); 

  const handleSetCustomText = () => {
    set(ref(db, `${roomID}/buttonText`), customText);
    setPeekedWord(customText);
    peekedWordRef.current = customText;
  };
  const handleClearCustomText = () => {
    setCustomText('');
    setPeekedWord('');
    peekedWordRef.current = '';
    set(ref(db, `${roomID}/buttonText`), '');
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
      payload = `PHASE_REVEAL|${Date.now()}|${wordToBroadcast}`;
    }
    
    return set(ref(db, `${roomID}/audienceCommand`), payload).catch(err => {
      alert(`🔥 FIREBASE SYNC BLOCKED: ${err.message}`);
    });
  };

  // Runs the synchronized visual reveal on the Magician's Master screen
  const runMasterMonitorSequence = (wordToReveal) => {
    clearMasterPhaseTimeouts();
    setMasterRevealWord(wordToReveal);
    setMasterConvergeActive(false);

    // 1. Hypnotic Spiral + AL Badge (0.0s -> 5.0s)
    setMasterMonitorPhase('SPIRAL');

    // 2. Floating Decoy Letter Cloud (5.0s -> 10.0s)
    const t1 = setTimeout(() => {
      setMasterMonitorPhase('LETTERS');
    }, 5000);

    // 3. Magnetic Word Convergence (10.0s -> 11.2s)
    const t2 = setTimeout(() => {
      setMasterMonitorPhase('CONVERGE');
      setTimeout(() => setMasterConvergeActive(true), 60);
    }, 10000);

    // 4. Solid Locked Reveal Hold (11.2s -> 13.8s)
    const t3 = setTimeout(() => {
      setMasterMonitorPhase('LOCKED');
    }, 11200);

    // 5. Return to Master Control Deck when reveal finishes (13.8s)
    const t4 = setTimeout(() => {
      setMasterMonitorPhase('NONE');
      setActivePhase('PHASE_2_DONE');
    }, 13800);

    masterPhaseTimeoutsRef.current = [t1, t2, t3, t4];
  };

  // OPTION A PHASE CONTROLLERS
  const resetToPhase1Pulse = () => {
    clearMasterPhaseTimeouts();
    setMasterMonitorPhase('NONE');
    setActivePhase('PHASE_1');
    setAudienceMode('OFF');
    fireAudienceCommand('PHASE_1_RESET');
  };

  const triggerPhase2Reveal = () => {
    const wordToBroadcast = (peekedWordRef.current || customText || 'JAMES').trim();
    setActivePhase('REVEALING');
    setAudienceMode('OFF');
    fireAudienceCommand('PHASE_REVEAL');
    runMasterMonitorSequence(wordToBroadcast);
  };

  // SYNCHRONIZED AUDIENCE + MASTER REDIRECT (PHASE 3)
  const executeSynchronizedRedirect = async () => {
    clearMasterPhaseTimeouts();
    setMasterMonitorPhase('NONE');
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

  const handleLocalDown = () => {
    if (isLocalPressing.current) return;
    isLocalPressing.current = true;
    localPressTimer.current = setTimeout(() => {
      localPressTimer.current = null;
      startLocalHeartbeat();
    }, 400); 
  };
  
  const handleLocalUp = () => {
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

  const handleAudienceDown = () => {
    if (isAudiencePressing.current) return;
    isAudiencePressing.current = true;
    audiencePressTimer.current = setTimeout(() => {
      audiencePressTimer.current = null;
      startAudienceHeartbeat();
    }, 400);
  };
  
  const handleAudienceUp = () => {
    if (!isAudiencePressing.current) return;
    isAudiencePressing.current = false;
    if (audiencePressTimer.current) {
      clearTimeout(audiencePressTimer.current);
      audiencePressTimer.current = null;
      toggleAudienceTorch();
    } else stopAudienceHeartbeat();
  };

  // HOLD-TO-REDIRECT SAFETY LOGIC (800MS HOLD, THEN SYNCHRONIZED FIRE)
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

  const fireInstantRedirect = () => {
    executeSynchronizedRedirect();
  };

  const armRemote = (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
    if (hiddenInputRef.current) hiddenInputRef.current.focus({ preventScroll: true });
  };

  const handleMasterSecretClick = (e) => {
    e.stopPropagation(); 
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - masterSecretLastClickTime.current;
    if (timeSinceLastClick < 500) { masterSecretClickCount.current += 1; } 
    else { masterSecretClickCount.current = 1; }
    masterSecretLastClickTime.current = currentTime;

    if (masterSecretClickCount.current === 3) {
      masterSecretClickCount.current = 0;
      executeSynchronizedRedirect();
    }
  };

  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Collective V2 Deck...</div>;

  return (
    <div 
      ref={deckContainerRef}
      tabIndex={-1}
      onClick={armRemote}
      className="h-[100dvh] w-full flex flex-col touch-none select-none overflow-hidden bg-[#0a0a0a] text-white relative font-sans outline-none"
    >
      {/* Keyframes for Master Reveal Monitor */}
      <style>{`
        @keyframes spinHypnotic {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.15) rotate(360deg); }
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

      <div 
        onPointerDown={handleMasterSecretClick}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-14 z-[100] bg-black/0 touch-none"
      />

      {/* =========================================================
          SYNCHRONIZED MASTER REVEAL MONITOR OVERLAY
          Shows the exact Spiral -> Letters -> Word formation on the Magician's phone
         ========================================================= */}
      {masterMonitorPhase !== 'NONE' && (
        <div 
          onClick={() => setMasterMonitorPhase('NONE')}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
        >
          {/* Subtle Top Pill so Magician can minimize back to deck anytime */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[95] bg-zinc-900/80 border border-zinc-700/80 px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="text-[9px] font-mono text-zinc-300 font-bold tracking-widest uppercase">
              👁️ MASTER MONITOR • TAP TO MINIMIZE
            </span>
          </div>

          {/* 2A: HYPNOTIC SPIRAL */}
          {masterMonitorPhase === 'SPIRAL' && (
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden bg-white">
              <div 
                className="absolute w-[180vmax] h-[180vmax] rounded-full"
                style={{
                  background: 'repeating-radial-gradient(circle, #000 0px, #000 22px, #fff 22px, #fff 44px)',
                  animation: 'spinHypnotic 4s linear infinite'
                }}
              />
              <div className="relative z-10 w-44 h-44 rounded-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.35)] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-[3.5px] border-black flex items-center justify-center font-black text-black text-2xl tracking-tighter">
                  AL
                </div>
              </div>
            </div>
          )}

          {/* 2B: FLOATING LETTER CLOUD */}
          {masterMonitorPhase === 'LETTERS' && (
            <div className="relative w-full h-full bg-black overflow-hidden">
              {masterDecoyParticles.map((p) => (
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

          {/* 2C: MAGNETIC WORD CONVERGENCE & LOCKED NAME */}
          {(masterMonitorPhase === 'CONVERGE' || masterMonitorPhase === 'LOCKED') && (
            <div className="relative flex items-center justify-center w-full h-full bg-black px-4 overflow-hidden">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 flex-wrap">
                {masterTargetChars.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
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
      <div className="w-full h-14 flex items-center justify-between px-4 shrink-0 z-40 border-b border-zinc-900">
        <button 
          onPointerDown={handleRedirectDown}
          onPointerUp={handleRedirectUp}
          onPointerLeave={handleRedirectUp}
          onPointerCancel={handleRedirectUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`px-3 py-1.5 rounded-full border text-[9px] font-bold tracking-widest transition-colors ${
            redirectStatus === 'FIRED!' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : redirectStatus === 'HOLDING...' ? 'bg-zinc-700 border-zinc-500 text-white' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}
        >
          🚀 {redirectStatus}
        </button>

        {/* --- LIVE KICKER BROADCAST INDICATOR --- */}
        <div className="flex-1 flex justify-center items-center">
          {peekedWord ? (
            <div className="flex items-center space-x-2 bg-green-900/20 border border-green-500/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-[9px] font-mono text-green-400 font-bold tracking-widest uppercase truncate max-w-[120px]">
                LIVE: {peekedWord}
              </span>
            </div>
          ) : (
            <span className="text-[9px] font-mono text-zinc-700 font-bold tracking-widest uppercase">
              NO KICKER
            </span>
          )}
        </div>

        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest transition-colors ${
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

          <div className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 flex flex-col space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Keyboard / Flic Triggers</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-mono">
              <div className="text-zinc-500 font-bold uppercase col-span-1 border-b border-zinc-800 pb-1">Local Cues</div>
              <div className="text-zinc-500 font-bold uppercase col-span-1 border-b border-zinc-800 pb-1">Master Cues</div>

              <div className="flex justify-between text-zinc-300"><span>Torch ON/OFF</span><span className="text-white font-bold">[U]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Torch ON/OFF</span><span className="text-white font-bold">[D]</span></div>

              <div className="flex justify-between text-zinc-300"><span>Heartbeat</span><span className="text-red-400 font-bold">[R]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Heartbeat</span><span className="text-red-400 font-bold">[L]</span></div>

              <div className="flex justify-between text-zinc-300"><span>Strobe</span><span className="text-yellow-400 font-bold">[E]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Strobe</span><span className="text-yellow-400 font-bold">[S]</span></div>

              <div className="col-span-2 h-px bg-zinc-800 my-0.5"></div>

              <div className="flex justify-between text-zinc-300"><span>Phase 2 Reveal</span><span className="text-purple-400 font-bold">[G]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Play / Stop Seq</span><span className="text-green-400 font-bold">[P]</span></div>
              <div className="flex justify-between text-zinc-300 col-span-2"><span>Phase 3 Redirect</span><span className="text-red-500 font-bold">[I]</span></div>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800 my-1"></div>
          <button 
            onClick={() => {
              window.location.href = window.location.pathname + '?room=' + roomID;
            }}
            className="w-full py-3 rounded bg-zinc-800 border border-zinc-600 text-white font-bold text-[10px] tracking-widest transition-colors flex justify-center items-center"
          >
            👁️ TEST SPECTATOR VIEW
          </button>
        </div>
      )}

      {/* --- MAIN CONTROL SCREEN --- */}
      <div className="flex-1 flex flex-col items-center w-full min-h-0 pt-3 pb-4 z-10 px-4 space-y-2.5">
        
        {/* 1. CHOREOGRAPHY CONTROLS (PINNED DIRECTLY BELOW TOP BAR) */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 flex items-center justify-between shrink-0">
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

        {/* 2. OPTION A STAGE PROGRESSION BAR (PROPORTIONAL 2-COLUMN GRID) */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={resetToPhase1Pulse}
            className={`w-full py-2.5 px-2 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-colors truncate ${
              activePhase === 'PHASE_1'
                ? 'bg-zinc-800 border-zinc-500 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            🔴 Phase 1 (Hide)
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
                ? `✓ ${peekedWord || customText || 'REVEALED'} [G]`
                : '🌀 REVEAL NAME [G]'}
          </button>
        </div>

        {/* 3. LOCAL CUE & MASTER CUE (AUDIENCE) CONTROLS (CENTERED IN REMAINING SPACE) */}
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-full grid grid-cols-2 gap-4 items-center">
            
            {/* LOCAL CUE */}
            <div className="flex flex-col items-center w-full">
              <div className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase mb-1">LOCAL CUE</div>
              <div className="text-xs mb-3">
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
                onPointerDown={handleLocalDown}
                onPointerUp={handleLocalUp}
                onPointerLeave={handleLocalUp}
                onPointerCancel={handleLocalUp}
                onContextMenu={(e) => e.preventDefault()}
                className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
                  localMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
                  localMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.2)]' :
                  localMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_25px_rgba(250,204,21,0.3)]' :
                  'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                }`}
              >
                <span className="font-bold tracking-widest text-xs uppercase">
                  {localMode === 'OFF' ? 'STANDBY' : localMode === 'ON' ? 'ACTIVE' : localMode === 'STROBE' ? 'STROBING' : 'PULSING'}
                </span>
              </button>
              <div className="mt-4 flex">
                <button 
                  onPointerDown={(e) => { e.preventDefault(); toggleLocalStrobe(); }}
                  className={`px-4 py-2 rounded-full border text-[10px] font-bold tracking-widest transition-colors ${localMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                >
                  ⚡ STROBE (e)
                </button>
              </div>
            </div>

            {/* MASTER CUE (AUDIENCE) */}
            <div className="flex flex-col items-center w-full">
              <div className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase mb-1 text-center">MASTER CUE (AUDIENCE)</div>
              <div className="text-xs mb-3">
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
                onPointerDown={handleAudienceDown}
                onPointerUp={handleAudienceUp}
                onPointerLeave={handleAudienceUp}
                onPointerCancel={handleAudienceUp}
                onContextMenu={(e) => e.preventDefault()}
                className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
                  audienceMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
                  audienceMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.2)]' :
                  audienceMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_25px_rgba(250,204,21,0.3)]' :
                  'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
                }`}
              >
                <span className="font-bold tracking-widest text-xs uppercase">
                  {audienceMode === 'OFF' ? 'STANDBY' : audienceMode === 'ON' ? 'ACTIVE' : audienceMode === 'STROBE' ? 'STROBING' : 'PULSING'}
                </span>
              </button>
              <div className="mt-4 flex">
                <button 
                  onPointerDown={(e) => { e.preventDefault(); toggleAudienceStrobe(); }}
                  className={`px-4 py-2 rounded-full border text-[10px] font-bold tracking-widest transition-colors ${audienceMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                >
                  ⚡ STROBE (s)
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
