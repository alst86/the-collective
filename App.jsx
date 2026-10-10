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
  const initialLoadRef = useRef(true); 

  // ==========================================
  // IDLE AUTO-REDIRECT SETTINGS
  // ==========================================
  const idleTimerRef = useRef(null);
  const IDLE_TIMEOUT_MS = 40 * 1000; // 40 seconds of general inactivity
  const IDLE_FALLBACK_URL = "https://www.google.com"; // Fallback URL

  const resetIdleTimer = () => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      window.location.replace(IDLE_FALLBACK_URL);
    }, IDLE_TIMEOUT_MS);
  };
  
  // TRIPLE TAP SECRET GATEWAY
  const secretClickCount = useRef(0);
  const secretLastClickTime = useRef(0);

  const startCamera = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log("Fullscreen denied"));
      }
    } catch (err) {
      console.log("Fullscreen API not supported");
    }

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
      resetIdleTimer(); // Starts/Resets the auto-redirect countdown

      const command = snapshot.val();
      
      if (command) {
        const safeCommand = String(command);
        const baseCmd = safeCommand.split('|')[0];
        
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          if (baseCmd === 'REDIRECT') return; 
        }
        
        handleCommand(command);
      }
    }, (err) => {
      setDbStatus('error');
      console.error("Firebase Connection Error:", err);
    });
    
    return () => {
      unsubscribe();
      clearTimeout(timerRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, []);

  const handleCommand = (command) => {
    clearTimeout(timerRef.current);
    resetIdleTimer(); 
    
    const safeCommand = String(command);
    const parts = safeCommand.split('|');
    const baseCmd = parts[0];
    
    if (baseCmd === 'ON') {
      applyTorch(true);
      setIsFlashing(true); 
    } else if (baseCmd === 'OFF') {
      applyTorch(false);
      setIsFlashing(false); 
    } else if (baseCmd === 'BLINK') {
      const pattern = [100, 150, 100, 650]; 
      let step = 0;

      const playHeartbeat = () => {
        const duration = pattern[step];
        const isOn = (step === 0 || step === 2); 
        
        applyTorch(isOn);
        setIsFlashing(isOn); 
        
        if (step === 0 && navigator.vibrate) {
          navigator.vibrate([100, 150, 100]); 
        }
        
        step = (step + 1) % pattern.length;
        timerRef.current = setTimeout(playHeartbeat, duration);
      };
      playHeartbeat();
    } else if (baseCmd === 'STROBE') {
      // PAPARAZZI CHAOS STROBE (Locally randomized per phone)
      const playStrobe = () => {
        const isOn = Math.random() > 0.5; // Randomly snap ON or OFF
        applyTorch(isOn);
        setIsFlashing(isOn); 
        
        // Random strobe speed between 60ms and 150ms
        const randomDelay = Math.floor(Math.random() * 90) + 60;
        timerRef.current = setTimeout(playStrobe, randomDelay);
      };
      playStrobe();
    } else if (baseCmd === 'REDIRECT') {
      const url = parts.slice(2).join('|'); 
      if (url) {
        let finalUrl = url;
        if (!url.startsWith('http') && !url.includes('://')) {
          finalUrl = `https://${url}`;
        }
        
        // POST-REDIRECT DEADMAN'S SWITCH
        setTimeout(() => {
          window.location.replace("https://www.google.com");
        }, 30000);

        window.location.replace(finalUrl);
      }
    }
  };

  const handleSecretClick = () => {
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - secretLastClickTime.current;

    if (timeSinceLastClick < 500) {
      secretClickCount.current += 1;
    } else {
      secretClickCount.current = 1;
    }

    secretLastClickTime.current = currentTime;

    if (secretClickCount.current === 3) {
      secretClickCount.current = 0;
      window.location.href = window.location.pathname + '?master';
    }
  };

  return (
    <div className={`min-h-[100dvh] relative flex flex-col items-center justify-center transition-colors duration-75 overflow-hidden ${isFlashing ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      <div className="absolute top-4 left-4 z-50">
        <div className={`w-3 h-3 rounded-full ${dbStatus === 'live' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : dbStatus === 'error' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-500 animate-pulse'}`}></div>
      </div>

      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {!cameraReady ? (
        <>
          <div 
            onPointerDown={handleSecretClick}
            className="absolute bottom-16 right-0 w-40 h-40 z-[100] bg-black/0 touch-none"
          />

          <div className="flex flex-col items-center w-full max-w-md px-6 z-10">
            <button 
              onClick={startCamera}
              className="w-full py-6 bg-black text-white font-black rounded-xl text-2xl tracking-widest shadow-2xl mb-6 transition-transform active:scale-95"
            >
              ENTER EXPERIENCE
            </button>
            <div className="text-center space-y-2">
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest px-4">
                Please allow camera access when prompted
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center w-full pb-20 pointer-events-none">
            <div className="text-[45vh] leading-none animate-pulse drop-shadow-2xl select-none">
              ❤️
            </div>
          </div>

          <div className="absolute bottom-12 left-0 right-0 w-full text-center px-4 pointer-events-none">
            <h1 className="text-3xl font-black uppercase tracking-widest">
              Hold up your phone
            </h1>
            {error && <p className="text-red-500 mt-2 text-xs font-bold uppercase tracking-widest">{error}</p>}
          </div>
        </>
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
  const hiddenInputRef = useRef(null);
  const [isRemoteArmed, setIsRemoteArmed] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magicSequence');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecordedSequence(parsed);
        recordedSequenceRef.current = parsed;
      }
    } catch (e) {
      console.log('No saved sequence found');
    }
  }, []);

  useEffect(() => {
    if (!isRecording) {
      localStorage.setItem('magicSequence', JSON.stringify(recordedSequence));
    }
  }, [recordedSequence, isRecording]);

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

    const armTimer = setTimeout(() => {
      if (hiddenInputRef.current) hiddenInputRef.current.focus();
    }, 1000);

    const handleKeyDown = (e) => {
      if (e.repeat) return; 
      if (e.target.tagName === 'INPUT' && e.target !== hiddenInputRef.current) return;
      
      const k = e.key;
      setLastKey(k);

      // ULTIMATE PANIC STOP
      if (isPlayingRef.current) {
        handleStopPlayback();
        return; 
      }

      // BLUETOOTH CUES
      if (k === 'p' || k === 'P') { handlePlayToggle(); return; }
      
      // STANDARD & STROBE CUES
      if (k === 'ArrowUp' || k === 'PageUp' || k === 'VolumeUp') handleLocalDown(); 
      else if (k === 'ArrowRight') startLocalHeartbeat(); 
      else if (k === 'ArrowDown' || k === 'PageDown' || k === 'VolumeDown') handleAudienceDown(); 
      else if (k === 'ArrowLeft') startAudienceHeartbeat(); 

      else if (k === 'u' || k === 'U') toggleLocalTorch();
      else if (k === 'r' || k === 'R') toggleLocalHeartbeat();
      else if (k === 'e' || k === 'E') toggleLocalStrobe(); // LOCAL STROBE
      
      else if (k === 'd' || k === 'D') toggleAudienceTorch();
      else if (k === 'l' || k === 'L') toggleAudienceHeartbeat();
      else if (k === 's' || k === 'S') toggleAudienceStrobe(); // AUDIENCE STROBE
      
      else if (k === 'i' || k === 'I') fireInstantRedirect(); 
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' && e.target !== hiddenInputRef.current) return;
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
  }, [localMode, audienceMode, redirectUrl]); 

  // ==========================================
  // UNIVERSAL RECORDER HELPER
  // ==========================================
  const recordCue = (target, cmd) => {
    if (isRecordingRef.current) {
      const offset = Date.now() - recordingStartRef.current;
      const newCue = { target, cmd, offset };
      setRecordedSequence(prev => [...prev, newCue]);
      recordedSequenceRef.current.push(newCue);
    }
  };

  // ==========================================
  // CORE FIREBASE DISPATCHER (AUDIENCE)
  // ==========================================
  const fireAudienceCommand = (cmd, isPlayback = false) => {
    if (!isPlayback) recordCue('AUDIENCE', cmd);

    if (isPlayback) {
      if (cmd === 'ON') setAudienceMode('ON');
      else if (cmd === 'OFF') setAudienceMode('OFF');
      else if (cmd === 'BLINK') setAudienceMode('BLINK');
      else if (cmd === 'STROBE') setAudienceMode('STROBE');
    }
    
    let payload = `${cmd}|${Date.now()}`;
    if (cmd === 'REDIRECT') {
      payload = `REDIRECT|${Date.now()}|${redirectUrl}`;
    }
    
    set(ref(db, 'audienceCommand'), payload).catch(err => {
        alert(`🔥 FIREBASE SYNC BLOCKED: ${err.message}`);
    });
  };

  // ==========================================
  // CHOREOGRAPHY RECORDER & PLAYBACK CONTROLS
  // ==========================================
  const handleRecordToggle = () => {
    if (isRecordingRef.current) {
      setIsRecording(false);
      isRecordingRef.current = false;
    } else {
      if (isPlayingRef.current) handleStopPlayback();
      
      setRecordedSequence([]); 
      recordedSequenceRef.current = [];
      recordingStartRef.current = Date.now();
      
      setIsRecording(true);
      isRecordingRef.current = true;
    }
  };

  const handlePlayToggle = () => {
    if (isPlayingRef.current) {
      handleStopPlayback();
    } else {
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
          if (actualTarget === 'AUDIENCE') {
            fireAudienceCommand(cmd, true);
          } else if (actualTarget === 'LOCAL') {
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
    let payload = `OFF|${Date.now()}`;
    set(ref(db, 'audienceCommand'), payload);
    
    turnLocalOff(true); 
  };

  // ==========================================
  // STANDARD CONTROLS (LOCAL)
  // ==========================================
  const applyLocalTorch = (active) => {
    if (trackRef.current) {
      trackRef.current.applyConstraints({ advanced: [{ torch: active }] }).catch(e => console.log(e));
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

  // LOCAL CHAOS STROBE
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
    if (hiddenInputRef.current) hiddenInputRef.current.focus(); 
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

  // ==========================================
  // AUDIENCE CONTROLS
  // ==========================================
  const turnAudienceOn = () => { setAudienceMode('ON'); fireAudienceCommand('ON'); };
  const turnAudienceOff = () => { setAudienceMode('OFF'); fireAudienceCommand('OFF'); };
  const toggleAudienceTorch = () => audienceMode === 'OFF' ? turnAudienceOn() : turnAudienceOff();
  
  const startAudienceHeartbeat = () => { setAudienceMode('BLINK'); fireAudienceCommand('BLINK'); };
  const stopAudienceHeartbeat = () => turnAudienceOff();
  const toggleAudienceHeartbeat = () => audienceMode === 'BLINK' ? stopAudienceHeartbeat() : startAudienceHeartbeat();

  // AUDIENCE CHAOS STROBE
  const startAudienceStrobe = () => { setAudienceMode('STROBE'); fireAudienceCommand('STROBE'); };
  const toggleAudienceStrobe = () => audienceMode === 'STROBE' ? turnAudienceOff() : startAudienceStrobe();

  const handleAudienceDown = () => {
    if (hiddenInputRef.current) hiddenInputRef.current.focus(); 
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

  const handleRedirectDown = () => {
    if (hiddenInputRef.current) hiddenInputRef.current.focus(); 
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

  const fireInstantRedirect = () => {
    fireAudienceCommand('REDIRECT');
    setRedirectStatus('FIRED!');
    setTimeout(() => setRedirectStatus('HOLD TO REDIRECT'), 2000); 
  };

  const armRemote = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    if (hiddenInputRef.current) hiddenInputRef.current.focus();
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
      let finalUrl = redirectUrl;
      if (!finalUrl.startsWith('http') && !finalUrl.includes('://')) finalUrl = `https://${finalUrl}`;
      window.location.replace(finalUrl);
    }
  };

  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Master Deck...</div>;

  return (
    <div 
      onClick={armRemote}
      className="h-[100dvh] w-full flex flex-col touch-none select-none overflow-hidden bg-[#0a0a0a] text-white relative font-sans"
    >
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

      <div 
        onPointerDown={handleMasterSecretClick}
        className="absolute bottom-16 right-0 w-40 h-40 z-[100] bg-black/0 touch-none"
      />

      <div className="absolute top-0 left-0 w-full h-20 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 z-20 space-x-3">
        <div className="flex-1 flex flex-col justify-center">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Custom Redirect URL</label>
          <input 
            type="text" 
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

      <div className="flex-1 flex flex-col justify-center items-center pt-24 pb-28 z-10 space-y-6">
        
        {/* ================================== */}
        {/* LOCAL DECK UI                      */}
        {/* ================================== */}
        <div className="flex flex-col items-center w-full">
          <div className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">LOCAL CUE</div>
          <div className="text-lg mb-4">
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
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
              localMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
              localMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)]' :
              localMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_30px_rgba(250,204,21,0.3)]' :
              'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]'
            }`}
          >
            <span className="font-bold tracking-widest text-xs uppercase">
              {localMode === 'OFF' ? 'STANDBY' : localMode === 'ON' ? 'ACTIVE' : localMode === 'STROBE' ? 'STROBING' : 'PULSING'}
            </span>
          </button>
          
          <div className="mt-3 flex space-x-3">
            <button 
              onPointerDown={(e) => { e.preventDefault(); toggleLocalStrobe(); }}
              className={`px-4 py-2 rounded-full border text-[9px] font-bold tracking-widest transition-colors ${
                localMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              ⚡ STROBE (e)
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-zinc-900"></div>

        {/* ================================== */}
        {/* AUDIENCE DECK UI                   */}
        {/* ================================== */}
        <div className="flex flex-col items-center w-full">
          <div className="text-zinc-500 font-bold tracking-widest text-xs uppercase mb-1">MASTER CUE</div>
          <div className="text-lg mb-4">
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
            className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
              audienceMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
              audienceMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.2)]' :
              audienceMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_30px_rgba(250,204,21,0.3)]' :
              'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]'
            }`}
          >
            <span className="font-bold tracking-widest text-xs uppercase">
              {audienceMode === 'OFF' ? 'STANDBY' : audienceMode === 'ON' ? 'ACTIVE' : audienceMode === 'STROBE' ? 'STROBING' : 'PULSING'}
            </span>
          </button>
          
          <div className="mt-3 flex space-x-3">
            <button 
              onPointerDown={(e) => { e.preventDefault(); toggleAudienceStrobe(); }}
              className={`px-4 py-2 rounded-full border text-[9px] font-bold tracking-widest transition-colors ${
                audienceMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              ⚡ STROBE (s)
            </button>
          </div>

          <div className="mt-2 flex flex-col items-center space-y-1">
            <div className={`text-[10px] font-bold uppercase tracking-widest ${isRemoteArmed ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>
              {isRemoteArmed ? '🟢 REMOTE ARMED' : '🔴 TAP SCREEN TO ARM REMOTE'}
            </div>
            <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              Last Flic Key: [{lastKey}]
            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-800 flex items-center justify-between px-4 pt-3 pb-8 z-20">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Choreography</span>
          <span className="text-xs font-mono text-zinc-300">{recordedSequence.length} Cues Saved</span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleRecordToggle}
            className={`px-3 py-2 rounded text-[10px] font-bold tracking-widest uppercase transition-colors border ${
              isRecording 
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            {isRecording ? '■ STOP REC' : '● REC'}
          </button>

          <button 
            onClick={handlePlayToggle}
            disabled={recordedSequence.length === 0 || isRecording}
            className={`px-4 py-2 rounded text-[10px] font-bold tracking-widest uppercase transition-colors border ${
              isPlaying
                ? 'bg-green-600 border-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]'
                : recordedSequence.length === 0 || isRecording
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-700 opacity-50'
                  : 'bg-zinc-800 border-zinc-700 text-white'
            }`}
          >
            {isPlaying ? '■ STOP SHOW' : '▶ PLAY'}
          </button>
        </div>
      </div>

    </div>
  );
}
