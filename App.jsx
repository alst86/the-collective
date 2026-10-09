import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// FIREBASE SETUP
// ==========================================
import { db } from './firebase'; 
import { ref, onValue, set } from 'firebase/database';

export default function App() {
  const isMaster = window.location.search.includes('master');
  return isMaster ? <ControlView /> : <AudienceView />;
}

// ==========================================
// AUDIENCE VIEW (Spectator's Phone)
// ==========================================
function AudienceView() {
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [isFlashing, setIsFlashing] = useState(false); 
  const [dbStatus, setDbStatus] = useState('waiting'); 

  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera denied. Screen flash active instead.');
    } finally {
      setCameraReady(true); 
    }
  };

  const applyTorch = async (active) => {
    setIsFlashing(active); 
    if (!trackRef.current) return;
    
    try {
      await trackRef.current.applyConstraints({
        advanced: [{ torch: active }]
      });
    } catch (err) {
      console.log("Torch constraint not applied", err);
    }
  };

  useEffect(() => {
    const commandRef = ref(db, 'audienceCommand');
    const unsubscribe = onValue(commandRef, (snapshot) => {
      setDbStatus('live');
      const command = snapshot.val();
      if (command) handleCommand(command);
    }, (err) => {
      setDbStatus('error');
      console.error("Firebase Connection Error:", err);
    });
    
    return () => {
      unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, []);

  const handleCommand = (command) => {
    clearTimeout(timerRef.current);
    
    const safeCommand = String(command);
    const parts = safeCommand.split('|');
    const baseCmd = parts[0];
    
    if (baseCmd === 'ON') {
      applyTorch(true);
    } else if (baseCmd === 'OFF') {
      applyTorch(false);
    } else if (baseCmd === 'BLINK') {
      const pattern = [100, 150, 100, 650]; 
      let step = 0;

      const playHeartbeat = () => {
        const duration = pattern[step];
        const isOn = (step === 0 || step === 2); 
        
        applyTorch(isOn);
        
        step = (step + 1) % pattern.length;
        timerRef.current = setTimeout(playHeartbeat, duration);
      };
      playHeartbeat();
    } else if (baseCmd === 'REDIRECT') {
      const url = parts.slice(2).join('|'); 
      if (url) {
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        window.location.href = finalUrl;
      }
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center p-6 transition-colors duration-75 ${isFlashing ? 'bg-white text-black' : 'bg-black text-white'}`}>
      
      <div className="absolute top-4 left-4 z-50">
        <div className={`w-3 h-3 rounded-full ${dbStatus === 'live' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : dbStatus === 'error' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-500 animate-pulse'}`}></div>
      </div>

      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {!cameraReady ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <button 
            onClick={startCamera}
            className="w-full py-5 bg-white text-black font-bold rounded-lg text-xl tracking-wide shadow-lg mb-4"
          >
            Enter Experience
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="text-[150px] leading-none mb-8 animate-pulse drop-shadow-xl">❤️</div>
          <h1 className="text-4xl font-black uppercase tracking-widest leading-tight">
            Hold your<br/>phone up
          </h1>
          {error && <p className="text-zinc-600 mt-8 text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SHOW CONTROL VIEW (Your Master Deck)
// ==========================================
function ControlView() {
  const [isReady, setIsReady] = useState(false);
  const trackRef = useRef(null);
  
  const [localMode, setLocalMode] = useState('OFF');
  const [audienceMode, setAudienceMode] = useState('OFF');
  
  const [redirectUrl, setRedirectUrl] = useState('https://instagram.com/andrewleemagic');
  const [redirectStatus, setRedirectStatus] = useState('HOLD TO REDIRECT');

  const [lastKey, setLastKey] = useState('NONE'); 
  
  // HIDDEN KEYBOARD TRAP
  const hiddenInputRef = useRef(null);
  const [isRemoteArmed, setIsRemoteArmed] = useState(false);

  const localTimerRef = useRef(null);
  const localPressTimer = useRef(null);
  const localStepRef = useRef(0);
  const isLocalPressing = useRef(false);
  
  const audiencePressTimer = useRef(null);
  const isAudiencePressing = useRef(false);

  const redirectPressTimer = useRef(null);
  const isRedirectPressing = useRef(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        trackRef.current = stream.getVideoTracks()[0];
        setIsReady(true);
      })
      .catch(err => {
        console.error("Admin camera denied", err);
        setIsReady(true);
      });

    // Auto-arm the Flic remote when the page loads
    const armTimer = setTimeout(() => {
      if (hiddenInputRef.current) hiddenInputRef.current.focus();
    }, 1000);

    const handleKeyDown = (e) => {
      if (e.repeat) return; 
      
      // Ignore keystrokes if you are typing in the URL box
      if (e.target.type === 'url') return;
      
      const k = e.key;
      setLastKey(k);
      
      if (k === 'ArrowUp' || k === 'PageUp' || k === 'VolumeUp') handleLocalDown(); 
      else if (k === 'ArrowRight') startLocalHeartbeat(); 
      else if (k === 'ArrowDown' || k === 'PageDown' || k === 'VolumeDown') handleAudienceDown(); 
      else if (k === 'ArrowLeft') startAudienceHeartbeat(); 

      // FLIC BUTTON DISCRETE COMMANDS (Toggles instantly upon receiving the single Flic letter)
      else if (k === 'u' || k === 'U') toggleLocalTorch();
      else if (k === 'r' || k === 'R') toggleLocalHeartbeat();
      else if (k === 'd' || k === 'D') toggleAudienceTorch();
      else if (k === 'l' || k === 'L') toggleAudienceHeartbeat();
    };

    const handleKeyUp = (e) => {
      if (e.target.type === 'url') return;
      const k = e.key;
      
      if (k === 'ArrowUp' || k === 'PageUp' || k === 'VolumeUp') handleLocalUp();
      else if (k === 'ArrowDown' || k === 'PageDown' || k === 'VolumeDown') handleAudienceUp();
      else if (k === 'ArrowRight') stopLocalHeartbeat(); 
      else if (k === 'ArrowLeft') stopAudienceHeartbeat(); 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearTimeout(armTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localMode, audienceMode]);

  const applyLocalTorch = (active) => {
    if (trackRef.current) {
      trackRef.current.applyConstraints({ advanced: [{ torch: active }] }).catch(e => console.log(e));
    }
  };

  const fireAudienceCommand = (cmd) => {
    let payload = `${cmd}|${Date.now()}`;
    if (cmd === 'REDIRECT') {
      payload = `REDIRECT|${Date.now()}|${redirectUrl}`;
    }
    
    set(ref(db, 'audienceCommand'), payload).catch(err => {
        alert(`🔥 FIREBASE SYNC BLOCKED: ${err.message}`);
    });
  };

  const armRemote = (e) => {
    // Prevent stealing focus if you are actively typing a new redirect URL or pressing buttons
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    if (hiddenInputRef.current) hiddenInputRef.current.focus();
  };

  // --- 1. LOCAL DEVICE LOGIC ---
  const turnLocalOn = () => {
    clearTimeout(localTimerRef.current);
    setLocalMode('ON');
    applyLocalTorch(true);
  };

  const turnLocalOff = () => {
    clearTimeout(localTimerRef.current);
    setLocalMode('OFF');
    applyLocalTorch(false);
  };

  const toggleLocalTorch = () => {
    if (localMode === 'OFF') turnLocalOn();
    else turnLocalOff();
  };

  const startLocalHeartbeat = () => {
    clearTimeout(localTimerRef.current);
    setLocalMode('BLINK');
    localStepRef.current = 0;
    
    const pattern = [100, 150, 100, 650]; 
    const playLocalHeartbeat = () => {
      const duration = pattern[localStepRef.current];
      const isOn = (localStepRef.current === 0 || localStepRef.current === 2);
      
      applyLocalTorch(isOn);
      
      localStepRef.current = (localStepRef.current + 1) % pattern.length;
      localTimerRef.current = setTimeout(playLocalHeartbeat, duration);
    };
    playLocalHeartbeat();
  };

  const stopLocalHeartbeat = () => {
    turnLocalOff();
  };

  const toggleLocalHeartbeat = () => {
    if (localMode === 'BLINK') stopLocalHeartbeat();
    else startLocalHeartbeat();
  };

  const handleLocalDown = () => {
    if (hiddenInputRef.current) hiddenInputRef.current.focus(); // Keep remote armed
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
    } else {
      stopLocalHeartbeat();
    }
  };

  // --- 2. AUDIENCE SYNC LOGIC ---
  const turnAudienceOn = () => {
    setAudienceMode('ON');
    fireAudienceCommand('ON');
  };

  const turnAudienceOff = () => {
    setAudienceMode('OFF');
    fireAudienceCommand('OFF');
  };

  const toggleAudienceTorch = () => {
    if (audienceMode === 'OFF') turnAudienceOn();
    else turnAudienceOff();
  };

  const startAudienceHeartbeat = () => {
    setAudienceMode('BLINK');
    fireAudienceCommand('BLINK');
  };

  const stopAudienceHeartbeat = () => {
    turnAudienceOff();
  };

  const toggleAudienceHeartbeat = () => {
    if (audienceMode === 'BLINK') stopAudienceHeartbeat();
    else startAudienceHeartbeat();
  };

  const handleAudienceDown = () => {
    if (hiddenInputRef.current) hiddenInputRef.current.focus(); // Keep remote armed
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
    } else {
      stopAudienceHeartbeat();
    }
  };

  // --- 3. REDIRECT LOGIC ---
  const handleRedirectDown = () => {
    if (hiddenInputRef.current) hiddenInputRef.current.focus(); // Keep remote armed
    if (isRedirectPressing.current) return;
    isRedirectPressing.current = true;

    setRedirectStatus('HOLDING...');
    redirectPressTimer.current = setTimeout(() => {
      redirectPressTimer.current = null;
      fireAudienceCommand('REDIRECT');
      
      setRedirectStatus('FIRED!');
      setTimeout(() => setRedirectStatus('HOLD TO REDIRECT'), 2000); 
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

  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Master Deck...</div>;

  return (
    <div 
      onClick={armRemote}
      className="h-screen w-full flex flex-col touch-none select-none overflow-hidden bg-[#0a0a0a] text-white relative font-sans"
    >
      {/* THE HIDDEN KEYBOARD TRAP */}
      <input 
        ref={hiddenInputRef}
        type="text"
        inputMode="none" 
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onFocus={() => setIsRemoteArmed(true)}
        onBlur={() => setIsRemoteArmed(false)}
        className="absolute opacity-0 w-px h-px pointer-events-none -z-10"
      />

      {/* Top Utility Bar */}
      <div className="absolute top-0 left-0 w-full h-20 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 z-20 space-x-3">
        <div className="flex-1 flex flex-col justify-center">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Custom Redirect URL</label>
          <input 
            type="url" 
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500 transition-colors"
            placeholder="https://..."
          />
        </div>
        <button 
          onPointerDown={handleRedirectDown}
          onPointerUp={handleRedirectUp}
          onPointerLeave={handleRedirectUp}
          onPointerCancel={handleRedirectUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-24 h-12 rounded flex flex-col items-center justify-center font-bold text-[9px] tracking-widest transition-colors border text-center px-1 ${
            redirectStatus === 'FIRED!' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : redirectStatus === 'HOLDING...' ? 'bg-zinc-700 border-zinc-500 text-white' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}
        >
          {redirectStatus}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-evenly items-center pt-20 pb-4">
        
        {/* ZONE 1: Local Device (MY PHONE) */}
        <div className="flex flex-col items-center w-full">
          <div className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">LOCAL CUE</div>
          <div className="text-lg mb-4">
            <span className="text-zinc-400">State: </span>
            <span className={localMode === 'OFF' ? 'text-red-500 font-bold' : localMode === 'ON' ? 'text-white font-bold' : 'text-red-500 font-bold animate-pulse'}>
              {localMode === 'OFF' ? 'BLACKOUT' : localMode === 'ON' ? 'ILLUMINATED' : 'HEARTBEAT'}
            </span>
          </div>

          <button
            onPointerDown={handleLocalDown}
            onPointerUp={handleLocalUp}
            onPointerLeave={handleLocalUp}
            onPointerCancel={handleLocalUp}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
              localMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
              localMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)]' :
              'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]'
            }`}
          >
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-bold tracking-widest text-xs uppercase">
              {localMode === 'OFF' ? 'STANDBY' : localMode === 'ON' ? 'ACTIVE' : 'PULSING'}
            </span>
          </button>
        </div>

        <div className="w-full h-px bg-zinc-900 my-2"></div>

        {/* ZONE 2: Audience Sync */}
        <div className="flex flex-col items-center w-full relative">
          <div className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">MASTER CUE</div>
          <div className="text-lg mb-4">
            <span className="text-zinc-400">State: </span>
            <span className={audienceMode === 'OFF' ? 'text-red-500 font-bold' : audienceMode === 'ON' ? 'text-white font-bold' : 'text-red-500 font-bold animate-pulse'}>
              {audienceMode === 'OFF' ? 'BLACKOUT' : audienceMode === 'ON' ? 'ILLUMINATED' : 'HEARTBEAT'}
            </span>
          </div>

          <button
            onPointerDown={handleAudienceDown}
            onPointerUp={handleAudienceUp}
            onPointerLeave={handleAudienceUp}
            onPointerCancel={handleAudienceUp}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
              audienceMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
              audienceMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)]' :
              'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]'
            }`}
          >
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-bold tracking-widest text-xs uppercase">
              {audienceMode === 'OFF' ? 'STANDBY' : audienceMode === 'ON' ? 'ACTIVE' : 'PULSING'}
            </span>
          </button>
          
          {/* THE BLUETOOTH SNIFFER & STATUS */}
          <div className="absolute -bottom-10 flex flex-col items-center space-y-1">
            <div className={`text-[10px] font-bold uppercase tracking-widest ${isRemoteArmed ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
              {isRemoteArmed ? '🟢 REMOTE ARMED' : '🔴 TAP SCREEN TO ARM REMOTE'}
            </div>
            <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              Last Flic Key: [{lastKey}]
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
