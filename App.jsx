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

// True Continuous Archimedean Spiral (Seamless 360-Degree Infinite Loop)
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
  const [uiReady, setUiReady] = useState(false);

  const [promptIndex, setPromptIndex] = useState(0);
  const [promptFade, setPromptFade] = useState(true);
  const [isThumbHolding, setIsThumbHolding] = useState(false);
  const [thumbFocused, setThumbFocused] = useState(false);
  const thumbHoldTimerRef = useRef(null);

  const [stagePhase, setStagePhase] = useState('PULSE');
  const [spiralVisible, setSpiralVisible] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);
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

  const runRevealSequence = (wordToReveal) => {
    clearPhaseTimeouts();
    clearTimeout(timerRef.current);
    applyTorch(false);

    const finalWord = (wordToReveal || kickerWordRef.current || 'JAMES').trim();
    setRevealWord(finalWord);
    setConvergeActive(false);
    setSpiralVisible(false);
    setBadgeVisible(false);
    setLettersVisible(false);

    setStagePhase('SPIRAL');
    const t0 = setTimeout(() => setBadgeVisible(true), 60);
    const tSpiralIn = setTimeout(() => setSpiralVisible(true), 350);

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

    phaseTimeoutsRef.current = [t0, tSpiralIn, tSpiralOut, t1, tLettersOut, t2, t3];
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
      clearTimeout(thumbHoldTimerRef.current);
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
      setThumbFocused(false);
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
      if (onEnterMaster) {
        onEnterMaster();
      } else {
        const separator = window.location.search ? '&' : '?';
        window.location.href = window.location.pathname + window.location.search + separator + 'master=true';
      }
    }
  };

  return (
    <div className={`min-h-[100dvh] relative flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden select-none ${
      stagePhase === 'SPIRAL' ? 'bg-white text-black' :
      (stagePhase === 'LETTERS' || stagePhase === 'CONVERGE' || stagePhase === 'LOCKED') ? 'bg-black text-white' :
      !cameraReady ? 'bg-[#f4f4f2] text-black' :
      isFlashing ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <style>{`
        @keyframes continuousSpiralFlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

      {/* 5-Tap Bottom-Right Secret Gateway to Master Control */}
      <div 
        onPointerDown={(e) => { e.stopPropagation(); handleSecretClick(); }} 
        className="absolute bottom-0 right-0 w-32 h-32 z-[100] bg-black/0 touch-none" 
      />

      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {stagePhase === 'SPIRAL' && (
        <div className="relative flex items-center justify-center w-full min-h-[100dvh] overflow-hidden bg-white">
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${spiralVisible ? 'opacity-100' : 'opacity-0'}`}>
            <HypnoticSpiralSVG />
          </div>

          <div className={`relative z-10 w-44 h-44 rounded-full bg-white shadow-[0_10px_45px_rgba(0,0,0,0.22)] flex items-center justify-center transition-all duration-700 ease-in-out ${badgeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <BrandLogoSVG className="w-14 h-14" />
          </div>
        </div>
      )}

      {stagePhase === 'LETTERS' && (
        <div className={`relative w-full min-h-[100dvh] bg-black overflow-hidden transition-opacity duration-700 ease-in-out ${lettersVisible ? 'opacity-100' : 'opacity-0'}`}>
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
                [ Touch the Heart ]
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
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-red-600 animate-pulse">
                    ♥ Presence Felt — Now Raise Your Phone
                  </p>
                ) : isThumbHolding ? (
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-red-500">
                    ♥ Feeling the Pulse...
                  </p>
                ) : (
                  <p className="text-[9.5px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400">
                    [ Hold Thumb on Pulse to Focus ]
                  </p>
                )}
              </div>
            </div>

            <div className="absolute bottom-14 left-0 right-0 w-full text-center px-6 pointer-events-none z-20 space-y-2.5">
              <h1 className="text-[26px] sm:text-[28px] font-black uppercase tracking-[0.15em] leading-tight">
                Hold up your<br/>phone
              </h1>
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

  // PALM-LOCK DOUBLE-TAP STATES (Prevents accidental touches when phone is face-down in volunteer's palm)
  const [isCuesTouchLocked, setIsCuesTouchLocked] = useState(false);
  const isCuesTouchLockedRef = useRef(false);
  const [cueLockConfirmArmed, setCueLockConfirmArmed] = useState(false);
  const cueLockConfirmTimeoutRef = useRef(null);

  const [masterMonitorPhase, setMasterMonitorPhase] = useState('NONE');
  const [masterSpiralVisible, setMasterSpiralVisible] = useState(false);
  const [masterBadgeVisible, setMasterBadgeVisible] = useState(false);
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

  // Listen to Firebase buttonText so Master Deck always shows the current live word
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
    return () => unsubText();
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

  // ROBUST CACHE-BUSTED API POLLING
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
          // If API returns raw plain text instead of JSON
          const rawText = (text || '').trim();
          if (rawText && !rawText.startsWith('<') && rawText.length < 60) {
            word = rawText;
          }
        }

        if (word) {
          setPeekedWord(word);
          peekedWordRef.current = word;
          if (word !== lastInjectRef.current) {
            lastInjectRef.current = word;
            set(ref(db, `${roomID}/buttonText`), word);
          }
        }
      } catch (e) {}
    };

    if (isInjectSyncing && injectUrl) {
      executeMasterPoll();
      timer = setInterval(executeMasterPoll, 1500); 
    }
    return () => clearInterval(timer);
  }, [isInjectSyncing, injectUrl, injectKey, roomID]);

  // PERMANENT FLIC / BLUETOOTH KEYBOARD LOCK (Works even when touch buttons are Palm-Locked!)
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
      if (k === 'q' || k === 'Q') { e.preventDefault(); setShowQrModal((prev) => !prev); return; }
      if (isPlayingRef.current) { handleStopPlayback(); return; }
      if (k === 'p' || k === 'P') { e.preventDefault(); handlePlayToggle(); return; }
      
      if (k === 'ArrowUp' || k === 'PageUp' || k === 'VolumeUp') { e.preventDefault(); handleLocalDown(true); }
      else if (k === 'ArrowRight') { e.preventDefault(); startLocalHeartbeat(); }
      else if (k === 'ArrowDown' || k === 'PageDown' || k === 'VolumeDown') { e.preventDefault(); handleAudienceDown(true); }
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
      if (k === 'ArrowUp' || k === 'PageUp' || k === 'VolumeUp') { e.preventDefault(); handleLocalUp(true); }
      else if (k === 'ArrowDown' || k === 'PageDown' || k === 'VolumeDown') { e.preventDefault(); handleAudienceUp(true); }
      else if (k === 'ArrowRight') { e.preventDefault(); stopLocalHeartbeat(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); stopAudienceHeartbeat(); }
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

  // 2X-TAP PALM LOCK TOGGLE HANDLER (Just like the REC button)
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

  const runMasterMonitorSequence = (wordToReveal) => {
    clearMasterPhaseTimeouts();
    setMasterRevealWord(wordToReveal);
    setMasterConvergeActive(false);
    setMasterSpiralVisible(false);
    setMasterBadgeVisible(false);
    setMasterLettersVisible(false);

    setMasterMonitorPhase('SPIRAL');
    const t0 = setTimeout(() => setMasterBadgeVisible(true), 60);
    const tSpiralIn = setTimeout(() => setMasterSpiralVisible(true), 350);

    const tSpiralOut = setTimeout(() => {
      setMasterSpiralVisible(false);
      setMasterBadgeVisible(false);
    }, 4300);

    const t1 = setTimeout(() => {
      setMasterMonitorPhase('LETTERS');
      setTimeout(() => setMasterLettersVisible(true), 80);
    }, 5100);

    const tLettersOut = setTimeout(() => {
      setMasterLettersVisible(false);
    }, 9300);

    const t2 = setTimeout(() => {
      setMasterMonitorPhase('CONVERGE');
      setTimeout(() => setMasterConvergeActive(true), 60);
    }, 10000);

    const t3 = setTimeout(() => {
      setMasterMonitorPhase('LOCKED');
      setActivePhase('PHASE_2_DONE');
    }, 11200);

    masterPhaseTimeoutsRef.current = [t0, tSpiralIn, tSpiralOut, t1, tLettersOut, t2, t3];
  };

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
      setMasterMonitorPhase('NONE');
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
      <style>{`
        @keyframes continuousSpiralFlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

      {/* =========================================================
          QR CODE FULLSCREEN OVERLAY ON MASTER PHONE
         ========================================================= */}
      {showQrModal && (
        <div 
          onPointerDown={() => setShowQrModal(false)}
          className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-6 cursor-pointer select-none touch-none"
        >
          <div 
            onPointerDown={(e) => {
              e.stopPropagation();
              setShowQrModal(false);
              if (onSwitchToHeartbeatView) {
                onSwitchToHeartbeatView();
              }
            }}
            className="bg-white p-7 rounded-3xl shadow-[0_0_60px_rgba(255,255,255,0.18)] flex flex-col items-center max-w-xs w-full text-black cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-zinc-500 mb-4">
              Scan to Join Experience
            </span>
            <div className="bg-white p-2 border-2 border-zinc-200 rounded-2xl mb-4 flex items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(APP_QR_URL)}`} 
                alt="App QR Code"
                className="w-56 h-56 object-contain pointer-events-none"
              />
            </div>
            <span className="text-xs font-mono font-bold text-zinc-800 tracking-wider mb-2">
              {APP_QR_URL.replace('https://', '')}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-600 animate-pulse mt-2 text-center">
              [ Tap QR Code to Open Heartbeat View ]
            </span>
          </div>

          <span className="mt-6 text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
            Tap outside card to return to Master Deck
          </span>
        </div>
      )}

      {/* =========================================================
          SYNCHRONIZED MASTER REVEAL OVERLAY (Smooth Fade In/Out)
         ========================================================= */}
      {masterMonitorPhase !== 'NONE' && (
        <div 
          onPointerDown={handleRedirectDown}
          onPointerUp={handleRedirectUp}
          onPointerLeave={handleRedirectUp}
          onPointerCancel={handleRedirectUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden select-none touch-none transition-colors duration-500 ${
            masterMonitorPhase === 'SPIRAL' ? 'bg-white' : 'bg-black'
          }`}
        >
          <div 
            onPointerDown={handleOverlaySecretExit}
            className="absolute bottom-0 right-0 w-32 h-32 z-[95] bg-black/0 touch-none"
          />

          {masterMonitorPhase === 'SPIRAL' && (
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden bg-white pointer-events-none">
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${masterSpiralVisible ? 'opacity-100' : 'opacity-0'}`}>
                <HypnoticSpiralSVG />
              </div>
              <div className={`relative z-10 w-44 h-44 rounded-full bg-white shadow-[0_10px_45px_rgba(0,0,0,0.22)] flex items-center justify-center transition-all duration-700 ease-in-out ${masterBadgeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <BrandLogoSVG className="w-14 h-14" />
              </div>
            </div>
          )}

          {masterMonitorPhase === 'LETTERS' && (
            <div className={`relative w-full h-full bg-black overflow-hidden pointer-events-none transition-opacity duration-700 ease-in-out ${masterLettersVisible ? 'opacity-100' : 'opacity-0'}`}>
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

      {/* --- TOP BAR (UNCROWDED: REDIRECT, QR, SETTINGS) --- */}
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
                ? `✓ ${peekedWord || customText || 'LOCKED'} [G]`
                : '🌀 REVEAL NAME [G]'}
          </button>
        </div>

        {/* 3. FULL-WIDTH LIVE API PEEK DISPLAY + 2X-TAP PALM LOCK SWITCH */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shrink-0">
          {/* Live API Peek Readout */}
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 bg-black/60 border border-zinc-800/90 px-3 py-2 rounded-lg">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              peekedWord ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-zinc-700'
            }`} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Live API Peek
              </span>
              <span className={`text-sm font-mono font-black tracking-widest uppercase truncate ${
                peekedWord ? 'text-green-400' : 'text-zinc-600'
              }`}>
                {peekedWord || 'WAITING FOR PEEK...'}
              </span>
            </div>
          </div>

          {/* 2x-Tap Palm Lock Toggle Switch (Just like REC button) */}
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
                : '🔓 LOCK CUES'}
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
                  ⚡ STROBE (e)
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
