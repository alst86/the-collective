import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from './firebase'; 
import { ref, onValue, set } from 'firebase/database';

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const isMaster = searchParams.has('master');
  // Isolated Sandbox for V2
  const roomID = searchParams.get('room') || 'v2-stage';

  return isMaster ? <ControlView roomID={roomID} /> : <AudienceView roomID={roomID} />;
}

// ==========================================
// ANIMATION OVERLAY COMPONENT (Shared by Both Views)
// ==========================================
function RevealOverlay({ phase, word, theme }) {
  if (phase === 'PHASE_1') return null;

  // Pseudo-random float vectors based on the word length so it doesn't jitter on re-renders
  const letters = useMemo(() => {
    const chars = (word || 'UNKNOWN').split('');
    return chars.map((char, i) => {
      const angle = (i * 137.5) * (Math.PI / 180);
      const radius = 80 + ((i * 25) % 100);
      return { 
        char, 
        id: i,
        dx: Math.cos(angle) * radius, 
        dy: Math.sin(angle) * radius 
      };
    });
  }, [word]);

  const isThemeActive = phase === 'SPIRAL';
  const isFloating = phase === 'LETTERS';
  const isConverging = phase === 'CONVERGE';
  const isLocked = phase === 'LOCKED';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black overflow-hidden pointer-events-none transition-opacity duration-1000">
      
      {/* THEME ANIMATIONS (0.0s - 5.0s) */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isThemeActive ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 1. CLASSIC SPIRAL */}
        {theme === 'CLASSIC_SPIRAL' && (
          <div className="absolute inset-0 flex items-center justify-center animate-[continuousSpiralFlow_4s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="w-[150vw] h-[150vw] opacity-40">
              <path d="M 50 50 m 0 -2 a 2 2 0 0 1 4 0 a 4 4 0 0 1 -8 0 a 6 6 0 0 1 12 0 a 8 8 0 0 1 -16 0 a 10 10 0 0 1 20 0 a 12 12 0 0 1 -24 0 a 14 14 0 0 1 28 0 a 16 16 0 0 1 -32 0 a 18 18 0 0 1 36 0 a 20 20 0 0 1 -40 0 a 22 22 0 0 1 44 0 a 24 24 0 0 1 -48 0 a 26 26 0 0 1 52 0" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* 2. RIPPLE WAVE */}
        {theme === 'RIPPLE_WAVE' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[80vw] h-[80vw] border-[1px] border-white/20 rounded-full animate-[rippleExpand_4s_linear_infinite]" style={{ animationDelay: '0s' }}></div>
            <div className="absolute w-[80vw] h-[80vw] border-[1.5px] border-white/40 rounded-full animate-[rippleExpand_4s_linear_infinite]" style={{ animationDelay: '1.3s' }}></div>
            <div className="absolute w-[80vw] h-[80vw] border-[2px] border-white/60 rounded-full animate-[rippleExpand_4s_linear_infinite]" style={{ animationDelay: '2.6s' }}></div>
          </div>
        )}

        {/* 3. APERTURE VORTEX */}
        {theme === 'APERTURE_VORTEX' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[90vw] h-[90vw] opacity-50 animate-[continuousSpiralFlow_15s_linear_infinite]">
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="white" strokeWidth="0.5" className="animate-[continuousSpiralFlow_8s_linear_infinite_reverse]" />
              <polygon points="50,15 80,35 80,65 50,85 20,65 20,35" fill="none" stroke="white" strokeWidth="1" className="animate-[continuousSpiralFlow_6s_linear_infinite]" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="2 4" />
            </svg>
          </div>
        )}

        {/* 4. CONSTELLATION */}
        {theme === 'CONSTELLATION' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-60">
             <svg viewBox="0 0 100 100" className="w-[120vw] h-[120vw] animate-[rippleExpand_20s_linear_infinite_alternate]">
                <line x1="20" y1="20" x2="80" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <line x1="80" y1="40" x2="30" y2="80" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                <line x1="30" y1="80" x2="70" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                <line x1="20" y1="20" x2="30" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <circle cx="20" cy="20" r="1.5" fill="white" className="animate-pulse" />
                <circle cx="80" cy="40" r="2" fill="white" className="animate-ping" />
                <circle cx="30" cy="80" r="1" fill="white" className="animate-pulse" />
                <circle cx="70" cy="90" r="1.5" fill="white" className="animate-ping" />
             </svg>
          </div>
        )}

        {/* CENTRAL AL LOGO BADGE */}
        <div className="relative w-28 h-28 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.8)] flex items-center justify-center">
          <span className="text-black font-black text-4xl tracking-tighter" style={{ fontFamily: 'Times New Roman, serif' }}>AL</span>
        </div>
      </div>

      {/* LETTERS FLOATING & CONVERGING (5.0s - 13.5s) */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${(isFloating || isConverging || isLocked) ? 'opacity-100' : 'opacity-0'}`}>
        
        {isLocked && (
          <div className="absolute top-16 left-0 w-full text-center px-6 animate-[fadeIn_2s_ease-in-out]">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] leading-relaxed">
              YOU ARE CURRENTLY FOCUSING ON <br/><span className="text-white text-xs">{word}</span><br/> DO NOT BREAK CONCENTRATION
            </p>
          </div>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
          {letters.map((l) => {
            let transformStyle = '';
            let opacityStyle = 0;
            
            if (isFloating) {
              transformStyle = `translate(${l.dx}px, ${l.dy}px) scale(0.8) rotate(${l.dx * 0.5}deg)`;
              opacityStyle = 0.4;
            } else if (isConverging || isLocked) {
              transformStyle = `translate(0px, 0px) scale(1) rotate(0deg)`;
              opacityStyle = 1;
            }

            return (
              <span 
                key={l.id} 
                className="absolute text-5xl font-black tracking-widest text-white transition-all duration-[3500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ 
                  transform: transformStyle, 
                  opacity: opacityStyle,
                  filter: isFloating ? 'blur(2px)' : 'blur(0px)',
                  textShadow: (isConverging || isLocked) ? '0 0 30px rgba(255,255,255,0.4)' : 'none'
                }}
              >
                {l.char}
              </span>
            );
          })}
          
          {/* Word structural row purely for center sizing reference (invisible) */}
          <div className="opacity-0 text-5xl font-black tracking-widest flex">
            {letters.map(l => <span key={'ref'+l.id}>{l.char}</span>)}
          </div>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// AUDIENCE VIEW
// ==========================================
function AudienceView({ roomID }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  
  // LIGHT CONTROLS
  const [isFlashing, setIsFlashing] = useState(false); 
  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // V2 STAGE PHASING
  const [stagePhase, setStagePhase] = useState('PHASE_1'); 
  const [fbText, setFbText] = useState('');
  const [injectConfig, setInjectConfig] = useState(null);
  const [revealTheme, setRevealTheme] = useState('CLASSIC_SPIRAL');
  
  const [thumbLocked, setThumbLocked] = useState(false);
  const thumbHoldTimerRef = useRef(null);
  
  const [cycleIndex, setCycleIndex] = useState(0);
  const cyclePrompts = [
    "BREATHE IN UNISON...",
    "A LOVED ONE IS BEING HELD IN MIND",
    "FEEL THEIR PRESENCE IN THE ROOM",
    "EVERY HEARTBEAT TELLS A STORY"
  ];

  // IDLE TIMER / WAKELOCK
  const idleTimerRef = useRef(null);
  const secretClickCount = useRef(0);
  const secretLastClickTime = useRef(0);

  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {}
    };
    if (cameraReady) requestWakeLock();
    const handleVisibilityChange = () => { if (wakeLock !== null && document.visibilityState === 'visible' && cameraReady) requestWakeLock(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (wakeLock !== null) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cameraReady]);

  const startCamera = async () => {
    try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{}); } catch(e){}
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      trackRef.current = stream.getVideoTracks()[0];
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Camera denied. Screen flash active instead.');
    } finally {
      setCameraReady(true); 
    }
  };

  const applyTorch = async (active) => {
    if (!trackRef.current) return;
    try { await trackRef.current.applyConstraints({ advanced: [{ torch: active }] }); } catch (err) {}
  };

  // 1. LISTEN TO FIREBASE COMMANDS
  useEffect(() => {
    const commandRef = ref(db, `${roomID}/audienceCommand`);
    const unsubCommand = onValue(commandRef, (snapshot) => {
      clearTimeout(idleTimerRef.current);
      const command = snapshot.val();
      if (command) {
        handleCommand(String(command));
      }
    });

    const textRef = ref(db, `${roomID}/buttonText`);
    const unsubText = onValue(textRef, (snapshot) => {
      setFbText(snapshot.val()?.trim() || '');
    });

    const themeRef = ref(db, `${roomID}/revealStyle`);
    const unsubTheme = onValue(themeRef, (snapshot) => {
      setRevealTheme(snapshot.val() || 'CLASSIC_SPIRAL');
    });
    
    return () => {
      unsubCommand();
      unsubText();
      unsubTheme();
      clearTimeout(timerRef.current);
    };
  }, [roomID]);

  // CYCLING PROMPTS
  useEffect(() => {
    if (stagePhase === 'PHASE_1' && cameraReady) {
      const interval = setInterval(() => {
        setCycleIndex(prev => (prev + 1) % cyclePrompts.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [stagePhase, cameraReady]);

  const handleCommand = (safeCommand) => {
    clearTimeout(timerRef.current);
    const parts = safeCommand.split('|');
    const baseCmd = parts[0];
    
    // LIGHTS
    if (baseCmd === 'ON') { applyTorch(true); setIsFlashing(true); } 
    else if (baseCmd === 'OFF') { applyTorch(false); setIsFlashing(false); } 
    else if (baseCmd === 'BLINK') {
      const pattern = [100, 150, 100, 650]; 
      let step = 0;
      const playHeartbeat = () => {
        const isOn = (step === 0 || step === 2); 
        applyTorch(isOn);
        setIsFlashing(isOn);
        if (step === 0 && navigator.vibrate) navigator.vibrate([100, 150, 100]); 
        step = (step + 1) % pattern.length;
        timerRef.current = setTimeout(playHeartbeat, pattern[step]);
      };
      playHeartbeat();
    } 
    else if (baseCmd === 'STROBE') {
      const playStrobe = () => {
        const isOn = Math.random() > 0.5; 
        applyTorch(isOn);
        setIsFlashing(isOn);
        timerRef.current = setTimeout(playStrobe, Math.floor(Math.random() * 90) + 60);
      };
      playStrobe();
    } 
    // PHASE CONTROL
    else if (baseCmd === 'PHASE_1') {
      setStagePhase('PHASE_1');
      applyTorch(false); setIsFlashing(false);
    }
    else if (baseCmd === 'PHASE_2') {
      // Cinematic Reveal Sequence Triggered!
      applyTorch(false); setIsFlashing(false);
      setStagePhase('SPIRAL');
      setTimeout(() => setStagePhase('LETTERS'), 5000);
      setTimeout(() => setStagePhase('CONVERGE'), 10000);
      setTimeout(() => setStagePhase('LOCKED'), 13500);
    }
    // REDIRECT
    else if (baseCmd === 'REDIRECT') {
      const url = parts.slice(2).join('|').trim(); 
      if (url) {
        let finalUrl = url.startsWith('http') || url.includes('://') ? url : `https://${url}`;
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
          window.location.replace("https://andrewleemagic.com/feedback");
        }, 30 * 1000);
        window.location.replace(finalUrl);
      }
    }
  };

  const handleSecretClick = () => {
    const now = Date.now();
    if (now - secretLastClickTime.current < 500) secretClickCount.current += 1;
    else secretClickCount.current = 1;
    secretLastClickTime.current = now;
    if (secretClickCount.current === 5) {
      secretClickCount.current = 0;
      window.location.href = window.location.pathname + window.location.search + (window.location.search ? '&' : '?') + 'master=true';
    }
  };

  const handleThumbStart = () => {
    if (thumbLocked || stagePhase !== 'PHASE_1') return;
    thumbHoldTimerRef.current = setTimeout(() => {
      setThumbLocked(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 1000);
  };
  const handleThumbEnd = () => clearTimeout(thumbHoldTimerRef.current);

  return (
    <div className={`min-h-[100dvh] relative flex flex-col items-center justify-center transition-colors duration-200 overflow-hidden ${isFlashing ? 'bg-[#ff1a1a] text-white' : 'bg-[#0a0a0a] text-white'}`}>
      
      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {/* GLOBAL KEYFRAMES */}
      <style>{`
        @keyframes continuousSpiralFlow { 0% { transform: rotate(0deg) scale(1); } 100% { transform: rotate(360deg) scale(1.5); } }
        @keyframes rippleExpand { 0% { transform: scale(0.2); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes inwardRing { 0% { transform: scale(3); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: scale(0.1); opacity: 0; } }
      `}</style>

      {/* ================================== */}
      {/* BOOTLOADER SCREEN                  */}
      {/* ================================== */}
      {!cameraReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-[200]" onClick={startCamera}>
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
             <div className="w-[120vw] h-[120vw] bg-red-600/20 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute w-[60vw] h-[60vw] bg-red-600/40 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <span className="text-[10px] text-zinc-400 font-bold tracking-[0.4em] uppercase mb-4 opacity-70">[ TOUCH THE HEART ]</span>
            <h1 className="text-4xl font-black tracking-widest uppercase mb-16 text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">BEGIN<br/>EXPERIMENT</h1>
          </div>
          <div className="absolute bottom-10 w-full text-center opacity-40">
             <p className="text-[8px] font-bold tracking-[0.3em] uppercase">Please allow camera access when prompted</p>
          </div>
          
          {/* Hidden Master Gateway (Bottom Right) */}
          <div onPointerDown={(e) => { e.stopPropagation(); handleSecretClick(); }} className="absolute bottom-0 right-0 w-32 h-32 z-[300] bg-white/0 touch-none" />
        </div>
      )}

      {/* ================================== */}
      {/* PHASE 1: EMOTIONAL CONTAINER       */}
      {/* ================================== */}
      {cameraReady && stagePhase === 'PHASE_1' && (
        <div className="absolute inset-0 flex flex-col items-center justify-between py-16 z-10">
          
          {/* Top Cycling Atmosphere */}
          <div className="h-12 flex items-center justify-center px-6 w-full relative">
            {cyclePrompts.map((prompt, idx) => (
              <span key={idx} className={`absolute text-center text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase transition-opacity duration-1000 ${cycleIndex === idx ? 'opacity-100' : 'opacity-0'}`}>
                {prompt}
              </span>
            ))}
          </div>

          {/* Central Heartbeat Hub */}
          <div className="relative flex items-center justify-center w-64 h-64">
             {/* Inward capturing rings */}
             <div className="absolute inset-0 border border-red-500/20 rounded-full animate-[inwardRing_4s_linear_infinite]"></div>
             <div className="absolute inset-0 border border-red-500/30 rounded-full animate-[inwardRing_4s_linear_infinite]" style={{ animationDelay: '1.3s' }}></div>
             
             {/* Dynamic ECG Line that spikes with the strobe/flash */}
             <div className="absolute w-[150%] h-px bg-red-900/30 flex items-center justify-center opacity-50">
               <svg viewBox="0 0 100 20" className={`w-full h-8 transition-transform duration-75 ${isFlashing ? 'scale-y-150 text-red-500' : 'scale-y-100 text-red-900/50'}`}>
                 <polyline points="0,10 40,10 45,5 50,15 55,2 60,18 65,10 100,10" fill="none" stroke="currentColor" strokeWidth="0.5" />
               </svg>
             </div>

             {/* Thumb Target */}
             <button 
                onPointerDown={handleThumbStart} 
                onPointerUp={handleThumbEnd} 
                onPointerLeave={handleThumbEnd}
                className={`relative z-20 w-16 h-16 rounded-full transition-all duration-700 ${thumbLocked ? 'bg-red-600 scale-125 shadow-[0_0_50px_rgba(220,38,38,0.8)]' : 'bg-red-900/40 border border-red-800/50 scale-100'}`}
             ></button>
          </div>

          {/* Bottom Instructions */}
          <div className="flex flex-col items-center space-y-3">
             <div className="h-6">
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-opacity duration-1000 ${thumbLocked ? 'text-red-500 opacity-100' : 'opacity-0'}`}>
                  ♥ PRESENCE FELT — NOW RAISE YOUR PHONE
                </span>
             </div>
             <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">
                HOLD UP YOUR PHONE
             </h1>
             <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em]">
                LET THEIR MEMORY FILL THE ROOM
             </p>
          </div>
        </div>
      )}

      {/* ================================== */}
      {/* PHASE 2: CINEMATIC REVEAL          */}
      {/* ================================== */}
      <RevealOverlay phase={stagePhase} word={fbText} theme={revealTheme} />

    </div>
  );
}


// ==========================================
// SHOW CONTROL VIEW (Your Master Deck)
// ==========================================
function ControlView({ roomID }) {
  const [isReady, setIsReady] = useState(false);
  
  // UI STATES
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localMode, setLocalMode] = useState('OFF');
  const [audienceMode, setAudienceMode] = useState('OFF');
  const [redirectUrl, setRedirectUrl] = useState('https://instagram.com/andrewleemagic');
  const [redirectStatus, setRedirectStatus] = useState('HOLD TO REDIRECT');
  
  // V2 STAGE PHASING
  const [masterPhase, setMasterPhase] = useState('PHASE_1'); 
  const masterPhaseRef = useRef('PHASE_1'); // For event listeners
  const [revealTheme, setRevealTheme] = useState(() => localStorage.getItem(`magicTheme_${roomID}`) || 'CLASSIC_SPIRAL');
  
  // INJECT API STATES WITH LOCAL MEMORY
  const [injectUrl, setInjectUrl] = useState(() => localStorage.getItem('magicInjectUrl') || '');
  const [injectKey, setInjectKey] = useState(() => localStorage.getItem('magicInjectKey') || 'peek');
  const [peekedWord, setPeekedWord] = useState('');
  const lastInjectRef = useRef('');

  // GESTURE REFS
  const overlaySwipeRef = useRef({ startX: null, startY: null, swiped: false });
  const redirectPressTimer = useRef(null);
  const isRedirectPressing = useRef(false);

  const localTimerRef = useRef(null);
  const localPressTimer = useRef(null);
  const localStepRef = useRef(0);
  const isLocalPressing = useRef(false);
  const audiencePressTimer = useRef(null);
  const isAudiencePressing = useRef(false);

  // LOAD & SYNC THEME
  useEffect(() => {
    localStorage.setItem(`magicTheme_${roomID}`, revealTheme);
    set(ref(db, `${roomID}/revealStyle`), revealTheme).catch(()=>{});
  }, [revealTheme, roomID]);

  // MASTER DECK AUTO-POLLING LOGIC (Decentralized API Listener)
  useEffect(() => {
    let timer;
    const executeMasterPoll = async () => {
      if (!injectUrl) return;
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
          // Save silently to Firebase (Audience ignores it until Phase 2 is triggered)
          set(ref(db, `${roomID}/buttonText`), word).catch(()=>{}); 
        }
      } catch (e) {}
    };

    if (injectUrl) {
      executeMasterPoll();
      timer = setInterval(executeMasterPoll, 2000); 
    }
    return () => clearInterval(timer);
  }, [injectUrl, injectKey, roomID]);

  // INITIALIZE CAMERA & KEYBOARD
  useEffect(() => {
    setIsReady(true);
    
    const handleKeyDown = (e) => {
      if (e.repeat || (e.target.tagName === 'INPUT')) return; 
      const k = e.key.toLowerCase();
      
      const p = masterPhaseRef.current;

      // GLOBAL OVERRIDES
      if (k === 'g') {
         if (p === 'PHASE_1') triggerPhase2Reveal();
         return;
      }
      if (k === 'i' || k === 'I') {
         executeSynchronizedRedirect();
         return;
      }

      // ONLY ALLOW LIGHT CUES IF IN PHASE 1
      if (p === 'PHASE_1') {
        if (k === 'arrowup' || k === 'pageup') handleLocalDown(); 
        else if (k === 'arrowright') startLocalHeartbeat(); 
        else if (k === 'arrowdown' || k === 'pagedown') handleAudienceDown(); 
        else if (k === 'arrowleft') startAudienceHeartbeat(); 
        else if (k === 'e') toggleLocalStrobe();
        else if (k === 's') toggleAudienceStrobe();
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const k = e.key.toLowerCase();
      if (masterPhaseRef.current === 'PHASE_1') {
        if (k === 'arrowup' || k === 'pageup') handleLocalUp();
        else if (k === 'arrowdown' || k === 'pagedown') handleAudienceUp();
        else if (k === 'arrowright') stopLocalHeartbeat(); 
        else if (k === 'arrowleft') stopAudienceHeartbeat(); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localMode, audienceMode, redirectUrl]); 

  // UPDATE REF HOOK
  useEffect(() => {
    masterPhaseRef.current = masterPhase;
  }, [masterPhase]);

  // ==========================================
  // COMMAND EXECUTION
  // ==========================================
  const fireAudienceCommand = async (cmd) => {
    let payload = `${cmd}|${Date.now()}`;
    if (cmd === 'REDIRECT') payload = `REDIRECT|${Date.now()}|${redirectUrl}`;
    try { await set(ref(db, `${roomID}/audienceCommand`), payload); } catch (err) {}
  };

  const triggerPhase1Reset = () => {
    setMasterPhase('PHASE_1');
    fireAudienceCommand('PHASE_1');
  };

  const triggerPhase2Reveal = () => {
    setMasterPhase('SPIRAL');
    fireAudienceCommand('PHASE_2');
    setTimeout(() => { if (masterPhaseRef.current !== 'PHASE_1') setMasterPhase('LETTERS') }, 5000);
    setTimeout(() => { if (masterPhaseRef.current !== 'PHASE_1') setMasterPhase('CONVERGE') }, 10000);
    setTimeout(() => { if (masterPhaseRef.current !== 'PHASE_1') setMasterPhase('LOCKED') }, 13500);
  };

  const executeSynchronizedRedirect = async () => {
    setRedirectStatus('FIRED!');
    await fireAudienceCommand('REDIRECT');
    let finalUrl = redirectUrl.trim();
    if (!finalUrl.startsWith('http') && !finalUrl.includes('://')) finalUrl = `https://${finalUrl}`;
    window.location.replace(finalUrl);
  };

  // ==========================================
  // MASTER OVERLAY GESTURES (SWIPE / HOLD)
  // ==========================================
  const handleOverlayTouchStart = (e) => {
    const p = masterPhaseRef.current;
    if (p === 'PHASE_1') return;
    
    overlaySwipeRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, swiped: false };
    
    // Begin 800ms timer for redirect
    if (isRedirectPressing.current) return;
    isRedirectPressing.current = true;
    redirectPressTimer.current = setTimeout(() => {
      if (!overlaySwipeRef.current.swiped) {
        executeSynchronizedRedirect();
      }
    }, 800);
  };

  const handleOverlayTouchMove = (e) => {
    const { startX, swiped } = overlaySwipeRef.current;
    if (startX === null || swiped) return;
    
    const dx = e.touches[0].clientX - startX;
    
    // If finger moves more than 15px, cancel the redirect hold to prevent misfires
    if (Math.abs(dx) > 15 || Math.abs(e.touches[0].clientY - overlaySwipeRef.current.startY) > 15) {
      clearTimeout(redirectPressTimer.current);
      isRedirectPressing.current = false;
    }

    // Only allow swipe reset during the initial animation frames, lock it down once CONVERGE starts
    const p = masterPhaseRef.current;
    if ((p === 'SPIRAL' || p === 'LETTERS') && dx >= 120) {
      overlaySwipeRef.current.swiped = true;
      if (navigator.vibrate) navigator.vibrate(45);
      triggerPhase1Reset();
    }
  };

  const handleOverlayTouchEnd = () => {
    overlaySwipeRef.current = { startX: null, startY: null, swiped: false };
    if (isRedirectPressing.current) {
      clearTimeout(redirectPressTimer.current);
      isRedirectPressing.current = false;
    }
  };

  // ==========================================
  // LIGHT CUE LOGIC
  // ==========================================
  const turnLocalOn = () => { clearTimeout(localTimerRef.current); setLocalMode('ON'); };
  const turnLocalOff = () => { clearTimeout(localTimerRef.current); setLocalMode('OFF'); };
  const toggleLocalTorch = () => { if (localMode === 'OFF') turnLocalOn(); else turnLocalOff(); };
  
  const startLocalHeartbeat = () => {
    clearTimeout(localTimerRef.current);
    setLocalMode('BLINK');
    localStepRef.current = 0;
    const pattern = [100, 150, 100, 650]; 
    const playLocalHeartbeat = () => {
      localStepRef.current = (localStepRef.current + 1) % pattern.length;
      localTimerRef.current = setTimeout(playLocalHeartbeat, pattern[localStepRef.current]);
    };
    playLocalHeartbeat();
  };
  const stopLocalHeartbeat = () => turnLocalOff();
  const startLocalStrobe = () => {
    clearTimeout(localTimerRef.current);
    setLocalMode('STROBE');
    const playLocalStrobe = () => localTimerRef.current = setTimeout(playLocalStrobe, Math.floor(Math.random() * 90) + 60);
    playLocalStrobe();
  };
  const toggleLocalStrobe = () => localMode === 'STROBE' ? turnLocalOff() : startLocalStrobe();
  const handleLocalDown = () => { if (isLocalPressing.current) return; isLocalPressing.current = true; localPressTimer.current = setTimeout(() => { localPressTimer.current = null; startLocalHeartbeat(); }, 400); };
  const handleLocalUp = () => { if (!isLocalPressing.current) return; isLocalPressing.current = false; if (localPressTimer.current) { clearTimeout(localPressTimer.current); localPressTimer.current = null; toggleLocalTorch(); } else stopLocalHeartbeat(); };

  const turnAudienceOn = () => { setAudienceMode('ON'); fireAudienceCommand('ON'); };
  const turnAudienceOff = () => { setAudienceMode('OFF'); fireAudienceCommand('OFF'); };
  const toggleAudienceTorch = () => { if (audienceMode === 'OFF') turnAudienceOn(); else turnAudienceOff(); };
  const startAudienceHeartbeat = () => { setAudienceMode('BLINK'); fireAudienceCommand('BLINK'); };
  const stopAudienceHeartbeat = () => turnAudienceOff();
  const startAudienceStrobe = () => { setAudienceMode('STROBE'); fireAudienceCommand('STROBE'); };
  const toggleAudienceStrobe = () => audienceMode === 'STROBE' ? turnAudienceOff() : startAudienceStrobe();
  const handleAudienceDown = () => { if (isAudiencePressing.current) return; isAudiencePressing.current = true; audiencePressTimer.current = setTimeout(() => { audiencePressTimer.current = null; startAudienceHeartbeat(); }, 400); };
  const handleAudienceUp = () => { if (!isAudiencePressing.current) return; isAudiencePressing.current = false; if (audiencePressTimer.current) { clearTimeout(audiencePressTimer.current); audiencePressTimer.current = null; toggleAudienceTorch(); } else stopAudienceHeartbeat(); };

  // ==========================================
  // RENDER MASTER DECK
  // ==========================================
  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing V2 Deck...</div>;

  return (
    <div className="h-[100dvh] w-full flex flex-col touch-none select-none overflow-hidden bg-[#0a0a0a] text-white relative font-sans">
      
      {/* V2 SYNCED MASTER REVEAL OVERLAY */}
      {masterPhase !== 'PHASE_1' && (
        <div 
          onTouchStart={handleOverlayTouchStart}
          onTouchMove={handleOverlayTouchMove}
          onTouchEnd={handleOverlayTouchEnd}
          onTouchCancel={handleOverlayTouchEnd}
          className="absolute inset-0 z-[100] bg-black"
        >
          <RevealOverlay phase={masterPhase} word={peekedWord} theme={revealTheme} />
          
          {/* Subtle Invisible Tap-To-Exit (Top Left) in case of gesture failure */}
          <div 
             onClick={(e) => { e.stopPropagation(); triggerPhase1Reset(); }} 
             className="absolute top-0 left-0 w-24 h-24 z-[150] bg-transparent"
          ></div>
        </div>
      )}

      {/* ================================== */}
      {/* V2 MASTER DECK                     */}
      {/* ================================== */}
      <div className="w-full h-14 flex items-center justify-between px-4 shrink-0 z-40 border-b border-zinc-900">
        
        <button 
          onPointerDown={() => { isRedirectPressing.current = true; setRedirectStatus('HOLDING...'); redirectPressTimer.current = setTimeout(executeSynchronizedRedirect, 800); }}
          onPointerUp={() => { isRedirectPressing.current = false; clearTimeout(redirectPressTimer.current); setRedirectStatus('HOLD TO REDIRECT'); }}
          onPointerLeave={() => { isRedirectPressing.current = false; clearTimeout(redirectPressTimer.current); setRedirectStatus('HOLD TO REDIRECT'); }}
          className={`px-3 py-1.5 rounded-full border text-[9px] font-bold tracking-widest transition-colors ${
            redirectStatus === 'FIRED!' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : redirectStatus === 'HOLDING...' ? 'bg-zinc-700 border-zinc-500 text-white' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}
        >
          🚀 {redirectStatus}
        </button>

        <div className="flex-1 flex justify-center px-2">
          <span className="text-[10px] font-mono text-red-500 font-bold tracking-[0.2em] uppercase truncate max-w-[150px]">
            {peekedWord ? `[ LIVE: ${peekedWord} ]` : '[ AWAITING API ]'}
          </span>
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
        <div className="absolute top-16 left-4 right-4 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl z-50 flex flex-col space-y-4">
          <div className="flex flex-col w-full">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Custom Redirect URL</label>
            <input type="text" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500" placeholder="https://..." />
          </div>

          <div className="flex space-x-2 items-end">
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">API Poll URL Proxy</label>
              <input type="text" value={injectUrl} onChange={(e) => setInjectUrl(e.target.value)} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-2 py-2 text-xs outline-none focus:border-zinc-500" placeholder="https://11z.co/..." />
            </div>
            <div className="w-16 flex flex-col">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Key</label>
              <input type="text" value={injectKey} onChange={(e) => setInjectKey(e.target.value)} className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-2 py-2 text-xs outline-none focus:border-zinc-500" placeholder="peek" />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Reveal Theme Animator</label>
            <select 
               value={revealTheme} 
               onChange={(e) => setRevealTheme(e.target.value)}
               className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500 uppercase tracking-widest"
            >
               <option value="CLASSIC_SPIRAL">Classic Spiral (Hypnotic Loop)</option>
               <option value="RIPPLE_WAVE">Ripple Wave (Resonance Expansion)</option>
               <option value="APERTURE_VORTEX">Aperture Vortex (Camera Iris)</option>
               <option value="CONSTELLATION">Constellation (Neural Synapses)</option>
            </select>
          </div>
        </div>
      )}

      {/* PHASE CONTROL BAR */}
      <div className="w-full bg-zinc-950 border-b border-zinc-900 flex px-4 py-3 shrink-0 z-30">
         <div className="grid grid-cols-2 gap-2 w-full">
            <button 
               onClick={triggerPhase1Reset}
               className={`py-3 rounded font-bold text-[9px] tracking-widest transition-colors border ${masterPhase === 'PHASE_1' ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
            >
               🔴 PHASE 1 (HIDE)
            </button>
            <button 
               onClick={triggerPhase2Reveal}
               className={`py-3 rounded font-bold text-[9px] tracking-widest transition-colors border ${masterPhase !== 'PHASE_1' ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
            >
               🌀 REVEAL NAME [G]
            </button>
         </div>
      </div>

      {/* CUE CONTROLS */}
      <div className="flex-1 flex flex-col justify-evenly items-center w-full min-h-0 py-2 z-10">
        
        <div className="flex flex-col items-center w-full">
          <div className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">LOCAL CUE</div>
          <div className="text-lg mb-4">
            <span className="text-zinc-400">State: </span>
            <span className={localMode === 'OFF' ? 'text-red-500 font-bold' : localMode === 'ON' ? 'text-white font-bold' : localMode === 'STROBE' ? 'text-yellow-400 font-bold animate-pulse' : 'text-red-500 font-bold animate-pulse'}>
              {localMode === 'OFF' ? 'BLACKOUT' : localMode === 'ON' ? 'ILLUMINATED' : localMode === 'STROBE' ? 'STROBING' : 'HEARTBEAT'}
            </span>
          </div>
          <button
            onPointerDown={handleLocalDown} onPointerUp={handleLocalUp} onPointerLeave={handleLocalUp} onPointerCancel={handleLocalUp}
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 ${localMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' : localMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : localMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]'}`}
          >
            <span className="font-bold tracking-widest text-xs uppercase">{localMode === 'OFF' ? 'STANDBY' : localMode === 'ON' ? 'ACTIVE' : localMode === 'STROBE' ? 'STROBING' : 'PULSING'}</span>
          </button>
        </div>

        <div className="w-full h-px bg-zinc-900 shrink-0 my-2"></div>

        <div className="flex flex-col items-center w-full">
          <div className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">MASTER CUE</div>
          <div className="text-lg mb-4">
            <span className="text-zinc-400">State: </span>
            <span className={audienceMode === 'OFF' ? 'text-red-500 font-bold' : audienceMode === 'ON' ? 'text-white font-bold' : audienceMode === 'STROBE' ? 'text-yellow-400 font-bold animate-pulse' : 'text-red-500 font-bold animate-pulse'}>
              {audienceMode === 'OFF' ? 'BLACKOUT' : audienceMode === 'ON' ? 'ILLUMINATED' : audienceMode === 'STROBE' ? 'STROBING' : 'HEARTBEAT'}
            </span>
          </div>
          <button
            onPointerDown={handleAudienceDown} onPointerUp={handleAudienceUp} onPointerLeave={handleAudienceUp} onPointerCancel={handleAudienceUp}
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 ${audienceMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' : audienceMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : audienceMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]'}`}
          >
            <span className="font-bold tracking-widest text-xs uppercase">{audienceMode === 'OFF' ? 'STANDBY' : audienceMode === 'ON' ? 'ACTIVE' : audienceMode === 'STROBE' ? 'STROBING' : 'PULSING'}</span>
          </button>
        </div>

      </div>

      <div className="w-full shrink-0 bg-zinc-950 flex flex-col items-center justify-center h-14 border-t border-zinc-900 z-20">
         <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">🟢 FLIC REMOTE LOCKED (ALWAYS ON)</span>
      </div>

    </div>
  );
}
