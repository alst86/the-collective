import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// FIREBASE SETUP
// ==========================================
import { db } from './firebase'; 
import { ref, onValue, set } from 'firebase/database';

const DEFAULT_REDIRECT_URL = 'https://instagram.com/andrewleemagic';
const DEFAULT_REVIEW_URL = 'https://g.page/r/YOUR_REVIEW_LINK';
const REVIEW_REDIRECT_DELAY_MS = 30 * 1000; // 30 seconds

// Helper: Launches Instagram App instantly, then redirects the browser tab to the Review/Feedback URL after 30s
const triggerAppAndBrowserRedirect = (primaryUrl, reviewUrl) => {
  const cleanPrimary = (primaryUrl || DEFAULT_REDIRECT_URL).trim();
  const cleanReview = (reviewUrl || DEFAULT_REVIEW_URL).trim();

  let igAppScheme = null;
  if (cleanPrimary.startsWith('instagram://')) {
    igAppScheme = cleanPrimary;
  } else if (cleanPrimary.toLowerCase().includes('instagram.com/')) {
    const match = cleanPrimary.match(/instagram\.com\/([^/?#]+)/i);
    if (match && match[1]) {
      igAppScheme = `instagram://user?username=${match[1]}`;
    }
  }

  let formattedReview = cleanReview;
  if (formattedReview && !formattedReview.startsWith('http') && !formattedReview.includes('://')) {
    formattedReview = `https://${formattedReview}`;
  }

  let formattedPrimary = cleanPrimary;
  if (!formattedPrimary.startsWith('http') && !formattedPrimary.includes('://')) {
    formattedPrimary = `https://${formattedPrimary}`;
  }

  if (igAppScheme) {
    // 1. INSTANT: Pop open the native Instagram App immediately
    window.location.href = igAppScheme;

    // 2. AFTER 30 SECONDS: Redirect the underlying browser tab to the Review / Feedback URL
    const targetTabUrl = (formattedReview && !formattedReview.includes('YOUR_REVIEW_LINK'))
      ? formattedReview
      : formattedPrimary;

    const startTime = Date.now();
    let hasRedirectedTab = false;

    const redirectBrowserTab = () => {
      if (hasRedirectedTab) return;
      hasRedirectedTab = true;
      window.location.replace(targetTabUrl);
    };

    const tabTimer = setTimeout(redirectBrowserTab, REVIEW_REDIRECT_DELAY_MS);

    // iOS Safari safeguard: if iOS paused background timers while Instagram was open,
    // check elapsed time as soon as the browser tab wakes back up
    const handleWakeCheck = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - startTime;
        if (elapsed >= REVIEW_REDIRECT_DELAY_MS) {
          clearTimeout(tabTimer);
          redirectBrowserTab();
        } else {
          clearTimeout(tabTimer);
          setTimeout(redirectBrowserTab, REVIEW_REDIRECT_DELAY_MS - elapsed);
        }
      }
    };

    document.addEventListener('visibilitychange', handleWakeCheck);
    window.addEventListener('focus', handleWakeCheck);
  } else {
    window.location.replace(formattedPrimary);
  }
};

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const isMaster = searchParams.has('master');
  const roomID = searchParams.get('room') || 'main-stage';

  return isMaster ? <ControlView roomID={roomID} /> : <AudienceView roomID={roomID} />;
}

// ==========================================
// AUDIENCE VIEW (Spectator's Phone)
// ==========================================
function AudienceView({ roomID }) {
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [isFlashing, setIsFlashing] = useState(false); 
  const [dbStatus, setDbStatus] = useState('waiting'); 
  
  const [fbText, setFbText] = useState('');
  const [pollText, setPollText] = useState('');
  const [injectConfig, setInjectConfig] = useState(null);

  const [uiReady, setUiReady] = useState(false);
  const bootDoneRef = useRef(false);

  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const initialLoadRef = useRef(true); 

  const idleTimerRef = useRef(null);
  const IDLE_TIMEOUT_MS = 40 * 1000; 
  const IDLE_FALLBACK_URL = "https://www.google.com"; 

  const resetIdleTimer = () => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      window.location.replace(IDLE_FALLBACK_URL);
    }, IDLE_TIMEOUT_MS);
  };
  
  const secretClickCount = useRef(0);
  const secretLastClickTime = useRef(0);

  // WAKE LOCK API
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
      setError('Camera denied. Screen flash active instead.');
    } finally {
      setCameraReady(true); 
    }
  };

  const applyTorch = async (active) => {
    setIsFlashing(active); 
    if (!trackRef.current) return;
    try {
      await trackRef.current.applyConstraints({ advanced: [{ torch: active }] });
    } catch (err) {}
  };

  // 1. LISTEN TO FIREBASE COMMANDS & CONFIG
  useEffect(() => {
    const uiTimer = setTimeout(() => setUiReady(true), 1500);

    const commandRef = ref(db, `${roomID}/audienceCommand`);
    const unsubCommand = onValue(commandRef, (snapshot) => {
      setDbStatus('live');
      resetIdleTimer(); 

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
    }, () => { setDbStatus('error'); });

    const textRef = ref(db, `${roomID}/buttonText`);
    const unsubText = onValue(textRef, (snapshot) => {
      const val = snapshot.val();
      setFbText(val && val.trim() !== '' ? val : '');
    });

    const configRef = ref(db, `${roomID}/injectConfig`);
    const unsubConfig = onValue(configRef, (snapshot) => {
      setInjectConfig(snapshot.val());
    });
    
    return () => {
      clearTimeout(uiTimer);
      unsubCommand();
      unsubText();
      unsubConfig();
      clearTimeout(timerRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, [roomID]);

  // 2. AUDIENCE-SIDE AUTONOMOUS POLLING
  useEffect(() => {
    let timer;
    const executePoll = async () => {
      if (!injectConfig || !injectConfig.active || !injectConfig.url) {
        setPollText('');
        if (!bootDoneRef.current) { bootDoneRef.current = true; setUiReady(true); }
        return;
      }

      try {
        let text = "";
        try {
          const res = await fetch(`${injectConfig.url}?t=${Date.now()}`);
          if (!res.ok) throw new Error("CORS Blocked");
          text = await res.text();
        } catch (e) {
          const targetUrl = encodeURIComponent(`${injectConfig.url}?t=${Date.now()}`);
          const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}`;
          const res2 = await fetch(proxyUrl);
          text = await res2.text();
        }

        let word = "";
        try {
          const json = JSON.parse(text);
          const keyToPoll = injectConfig.key?.trim() || 'peek';
          if (json[keyToPoll] !== undefined && json[keyToPoll] !== null) {
            word = String(json[keyToPoll]).trim();
          }
        } catch(e) {} 

        if (word) setPollText(word);
      } catch (e) {
      } finally {
        if (!bootDoneRef.current) { 
          bootDoneRef.current = true; 
          setUiReady(true); 
        }
      }
    };

    executePoll();
    if (injectConfig?.active && injectConfig?.url) {
      timer = setInterval(executePoll, 2000); 
    }
    return () => clearInterval(timer);
  }, [injectConfig]);

  const handleCommand = (command) => {
    clearTimeout(timerRef.current);
    resetIdleTimer(); 
    
    const safeCommand = String(command);
    const parts = safeCommand.split('|');
    const baseCmd = parts[0];
    
    if (baseCmd === 'ON') applyTorch(true);
    else if (baseCmd === 'OFF') applyTorch(false);
    else if (baseCmd === 'BLINK') {
      const pattern = [100, 150, 100, 650]; 
      let step = 0;
      const playHeartbeat = () => {
        const duration = pattern[step];
        const isOn = (step === 0 || step === 2); 
        applyTorch(isOn);
        if (step === 0 && navigator.vibrate) navigator.vibrate([100, 150, 100]); 
        step = (step + 1) % pattern.length;
        timerRef.current = setTimeout(playHeartbeat, duration);
      };
      playHeartbeat();
    } else if (baseCmd === 'STROBE') {
      const playStrobe = () => {
        const isOn = Math.random() > 0.5; 
        applyTorch(isOn);
        const randomDelay = Math.floor(Math.random() * 90) + 60;
        timerRef.current = setTimeout(playStrobe, randomDelay);
      };
      playStrobe();
    } else if (baseCmd === 'REDIRECT') {
      applyTorch(false);
      if (navigator.vibrate) navigator.vibrate(0);
      const primaryUrl = parts[2] || DEFAULT_REDIRECT_URL;
      const reviewUrl = parts[3] || DEFAULT_REVIEW_URL;
      triggerAppAndBrowserRedirect(primaryUrl, reviewUrl);
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

  const finalBtnText = pollText || fbText || 'ENTER EXPERIENCE';

  return (
    <div className={`min-h-[100dvh] relative flex flex-col items-center justify-center transition-colors duration-75 overflow-hidden ${isFlashing ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      <div className="absolute top-4 left-4 z-50">
        <div className={`w-3 h-3 rounded-full ${dbStatus === 'live' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : dbStatus === 'error' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-500 animate-pulse'}`}></div>
      </div>

      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {!cameraReady ? (
        <>
          <div onPointerDown={handleSecretClick} className="absolute top-0 left-0 w-32 h-32 z-[100] bg-white/0 touch-none" />

          <div className={`flex flex-col items-center w-full max-w-md px-6 z-10 transition-opacity duration-700 ease-in-out ${uiReady ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={startCamera}
              className="w-full py-6 bg-black text-white font-black rounded-xl text-2xl tracking-widest shadow-2xl mb-6 transition-transform active:scale-95 uppercase px-4 break-words leading-tight"
            >
              {finalBtnText}
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
            <h1 className="text-3xl font-black uppercase tracking-widest mix-blend-difference text-white">
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
function ControlView({ roomID }) {
  const [isReady, setIsReady] = useState(false);
  const trackRef = useRef(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localMode, setLocalMode] = useState('OFF');
  const [audienceMode, setAudienceMode] = useState('OFF');
  const [redirectUrl, setRedirectUrl] = useState(() => localStorage.getItem('magicRedirectUrl') || 'https://instagram.com/andrewleemagic');
  const [reviewUrl, setReviewUrl] = useState(() => localStorage.getItem('magicReviewUrl') || '');
  const [redirectStatus, setRedirectStatus] = useState('HOLD TO REDIRECT');
  const [customText, setCustomText] = useState('');
  
  const [injectUrl, setInjectUrl] = useState(() => localStorage.getItem('magicInjectUrl') || '');
  const [injectKey, setInjectKey] = useState(() => localStorage.getItem('magicInjectKey') || 'peek');
  const [isInjectSyncing, setIsInjectSyncing] = useState(() => {
    const saved = localStorage.getItem('magicInjectSyncing');
    return saved !== null ? JSON.parse(saved) : true; 
  });
  const [peekedWord, setPeekedWord] = useState('');
  const lastInjectRef = useRef('');
  const [lastKey, setLastKey] = useState('NONE'); 
  const hiddenInputRef = useRef(null);
  const deckContainerRef = useRef(null);

  // RHYTHMIC CUEPAD STATES
  const [displayBpm, setDisplayBpm] = useState(72);
  const [activeBpm, setActiveBpm] = useState(72);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const metronomeTimerRef = useRef(null);
  const tapTimesRef = useRef([]);

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
    localStorage.setItem('magicReviewUrl', reviewUrl);
  }, [injectUrl, injectKey, isInjectSyncing, redirectUrl, reviewUrl]);

  useEffect(() => {
    if (isMetronomeActive) {
      const intervalMs = (60 / activeBpm) * 1000;
      let beat = 0;
      const runMetronome = () => {
        fireAudienceCommand(beat % 2 === 0 ? 'STRIKE_LUB' : 'STRIKE_DUB', false);
        beat++;
        metronomeTimerRef.current = setTimeout(runMetronome, intervalMs);
      };
      runMetronome();
    } else {
      clearTimeout(metronomeTimerRef.current);
    }
    return () => clearTimeout(metronomeTimerRef.current);
  }, [isMetronomeActive, activeBpm]);

  const handleTapTempo = () => {
    const now = Date.now();
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 4) tapTimesRef.current.shift();
    if (tapTimesRef.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 200) {
        setDisplayBpm(calculatedBpm);
        setActiveBpm(calculatedBpm);
      }
    }
  };

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
        if (activeEl && activeEl.tagName === 'INPUT' && activeEl.type === 'range') {
          activeEl.blur();
        }
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
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [localMode, audienceMode, redirectUrl, reviewUrl]); 

  const handleSetCustomText = () => {
    set(ref(db, `${roomID}/buttonText`), customText);
    setPeekedWord(customText);
  };
  const handleClearCustomText = () => {
    setCustomText('');
    setPeekedWord('');
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
    return (redirectUrl && redirectUrl.trim() !== '') ? redirectUrl.trim() : DEFAULT_REDIRECT_URL;
  };

  const getTargetReviewUrl = () => {
    return (reviewUrl && reviewUrl.trim() !== '') ? reviewUrl.trim() : DEFAULT_REVIEW_URL;
  };

  const fireAudienceCommand = (cmd, isPlayback = false) => {
    if (!isPlayback) recordCue('AUDIENCE', cmd);
    if (isPlayback && (cmd === 'ON' || cmd === 'OFF' || cmd === 'BLINK' || cmd === 'STROBE')) {
      setAudienceMode(cmd);
    }
    
    let payload = `${cmd}|${Date.now()}`;
    if (cmd === 'REDIRECT') {
      payload = `REDIRECT|${Date.now()}|${getTargetRedirectUrl()}|${getTargetReviewUrl()}`;
    }
    
    return set(ref(db, `${roomID}/audienceCommand`), payload).catch(err => {
      alert(`🔥 FIREBASE SYNC BLOCKED: ${err.message}`);
    });
  };

  // SYNCHRONIZED AUDIENCE + MASTER REDIRECT
  const executeSynchronizedRedirect = async () => {
    clearTimeout(metronomeTimerRef.current);
    setIsMetronomeActive(false);
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearTimeout(localTimerRef.current);
    applyLocalTorch(false);

    const primaryTarget = getTargetRedirectUrl();
    const reviewTarget = getTargetReviewUrl();
    setRedirectStatus('FIRED!');

    try {
      await Promise.race([
        fireAudienceCommand('REDIRECT'),
        new Promise((resolve) => setTimeout(resolve, 600))
      ]);
    } catch (e) {}

    triggerAppAndBrowserRedirect(primaryTarget, reviewTarget);
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
    setIsMetronomeActive(false);
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
      triggerAppAndBrowserRedirect(getTargetRedirectUrl(), getTargetReviewUrl());
    }
  };

  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Master Deck...</div>;

  return (
    <div 
      ref={deckContainerRef}
      tabIndex={-1}
      onClick={armRemote}
      className="h-[100dvh] w-full flex flex-col touch-none select-none overflow-hidden bg-[#0a0a0a] text-white relative font-sans outline-none"
    >
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
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Primary App Redirect URL (Instagram)</label>
            <input 
              type="text" 
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500 transition-colors"
              placeholder="https://instagram.com/andrewleemagic"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Browser Review Page URL (Safari Tab Redirect)</label>
            <input 
              type="text" 
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              className="w-full bg-black border border-zinc-800 text-zinc-300 rounded px-3 py-2 text-xs outline-none focus:border-zinc-500 transition-colors"
              placeholder="https://g.page/r/..."
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

              <div className="flex justify-between text-zinc-400"><span>Tap/Hold</span><span>[↑ / Vol+]</span></div>
              <div className="flex justify-between text-zinc-400"><span>Tap/Hold</span><span>[↓ / Vol-]</span></div>

              <div className="col-span-2 h-px bg-zinc-800 my-0.5"></div>

              <div className="flex justify-between text-zinc-300"><span>Play / Stop Seq</span><span className="text-green-400 font-bold">[P]</span></div>
              <div className="flex justify-between text-zinc-300"><span>Instant Redirect</span><span className="text-red-500 font-bold">[I]</span></div>
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
      <div className="flex-1 flex flex-col justify-evenly items-center w-full min-h-0 py-2 z-10 px-4">
        
        {/* 1. CHOREOGRAPHY CONTROLS */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Choreography ({roomID})</span>
            <span className="text-xs font-mono text-zinc-300 mt-0.5">{recordedSequence.length} Cues Saved</span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleRecordButtonTap}
              className={`px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors border ${
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
              className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors border ${
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

        {/* 2. RHYTHMIC CUEPAD / TEMPO CONTROLS */}
        <div className="w-full h-[132px] bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase truncate mr-2">Rhythmic Cuepad (Live Tempo)</span>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs font-mono font-bold text-red-500 whitespace-nowrap">{displayBpm} BPM</span>
              <button 
                onClick={handleTapTempo}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-[9px] font-bold tracking-widest rounded border border-zinc-700 text-white uppercase whitespace-nowrap"
              >
                Tap Tempo
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input 
              type="range" 
              min="40" 
              max="160" 
              value={displayBpm} 
              onChange={(e) => setDisplayBpm(Number(e.target.value))}
              onMouseUp={(e) => { setActiveBpm(displayBpm); e.target.blur(); }}
              onTouchEnd={(e) => { setActiveBpm(displayBpm); e.target.blur(); }}
              className="flex-1 accent-red-600 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <button 
              onClick={() => setIsMetronomeActive(!isMetronomeActive)}
              className={`px-3 py-1.5 rounded text-[9px] font-bold tracking-widest uppercase border transition-colors whitespace-nowrap ${
                isMetronomeActive 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              {isMetronomeActive ? '■ STOP PULSE' : '▶ AUTO PULSE'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => fireAudienceCommand('STRIKE_LUB')}
              className="py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-300 active:scale-95 transition-transform"
            >
              💥 LUB (Thud)
            </button>
            <button 
              onClick={() => fireAudienceCommand('STRIKE_DUB')}
              className="py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-300 active:scale-95 transition-transform"
            >
              💥 DUB (Snap)
            </button>
          </div>
        </div>

        {/* 3. LOCAL CUE & MASTER CUE (AUDIENCE) CONTROLS */}
        <div className="w-full grid grid-cols-2 gap-3 items-center pt-1">
          
          {/* LOCAL CUE */}
          <div className="flex flex-col items-center w-full">
            <div className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase mb-0.5">LOCAL CUE</div>
            <div className="text-xs mb-2">
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
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
                localMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
                localMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.2)]' :
                localMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_25px_rgba(250,204,21,0.3)]' :
                'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
              }`}
            >
              <span className="font-bold tracking-widest text-[10px] uppercase">
                {localMode === 'OFF' ? 'STANDBY' : localMode === 'ON' ? 'ACTIVE' : localMode === 'STROBE' ? 'STROBING' : 'PULSING'}
              </span>
            </button>
            <div className="mt-2.5 flex">
              <button 
                onPointerDown={(e) => { e.preventDefault(); toggleLocalStrobe(); }}
                className={`px-3.5 py-1.5 rounded-full border text-[9px] font-bold tracking-widest transition-colors ${localMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                ⚡ STROBE (e)
              </button>
            </div>
          </div>

          {/* MASTER CUE (AUDIENCE) */}
          <div className="flex flex-col items-center w-full">
            <div className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase mb-0.5 text-center">MASTER CUE (AUDIENCE)</div>
            <div className="text-xs mb-2">
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
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-200 outline-none select-none ${
                audienceMode === 'OFF' ? 'border-zinc-800 text-zinc-600 bg-black' :
                audienceMode === 'ON' ? 'border-white text-white bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.2)]' :
                audienceMode === 'STROBE' ? 'border-yellow-400 text-yellow-400 bg-yellow-900/20 shadow-[0_0_25px_rgba(250,204,21,0.3)]' :
                'border-red-600 text-red-500 bg-red-900/20 shadow-[0_0_25px_rgba(220,38,38,0.3)]'
              }`}
            >
              <span className="font-bold tracking-widest text-[10px] uppercase">
                {audienceMode === 'OFF' ? 'STANDBY' : audienceMode === 'ON' ? 'ACTIVE' : audienceMode === 'STROBE' ? 'STROBING' : 'PULSING'}
              </span>
            </button>
            <div className="mt-2.5 flex">
              <button 
                onPointerDown={(e) => { e.preventDefault(); toggleAudienceStrobe(); }}
                className={`px-3.5 py-1.5 rounded-full border text-[9px] font-bold tracking-widest transition-colors ${audienceMode === 'STROBE' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                ⚡ STROBE (s)
              </button>
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