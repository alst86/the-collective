import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// FIREBASE SETUP
// ==========================================
import { db } from './firebase'; 
import { ref, onValue, set } from 'firebase/database';

export default function App() {
  // If the URL contains "?master", load the secret control deck.
  // Otherwise, default to the Audience view.
  const isMaster = window.location.search.includes('master');

  return isMaster ? <ControlView /> : <AudienceView />;
}

// ==========================================
// AUDIENCE VIEW (Spectator's Phone)
// ==========================================
function AudienceView() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  
  // Controls the screen color for the visual strobe effect
  const [isFlashing, setIsFlashing] = useState(false); 

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
      
      setIsConnected(true);
    } catch (err) {
      setError('Camera access denied. Please ensure you are on HTTPS.');
    }
  };

  const applyTorch = async (active) => {
    // Triggers the visual screen flash fallback
    setIsFlashing(active); 
    
    if (!trackRef.current) return;
    
    try {
      // Force constraints without checking capabilities first (better Android compatibility)
      await trackRef.current.applyConstraints({
        advanced: [{ torch: active }]
      });
    } catch (err) {
      // Normal for iOS or devices without physical torches; the screen flash will handle it
      console.log("Torch constraint not applied", err);
    }
  };

  useEffect(() => {
    if (!isConnected) return;

    // --- FIREBASE LISTENER ---
    const commandRef = ref(db, 'audienceCommand');
    const unsubscribe = onValue(commandRef, (snapshot) => {
      const command = snapshot.val();
      if (command) handleCommand(command);
    });
    
    return () => {
      unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, [isConnected]);

  const handleCommand = (command) => {
    clearTimeout(timerRef.current);
    
    if (command === 'ON') {
      applyTorch(true);
    } else if (command === 'OFF') {
      applyTorch(false);
    } else if (command === 'BLINK') {
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
    } else if (command.startsWith('REDIRECT_')) {
      const url = command.split('REDIRECT_')[1];
      window.location.href = url;
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center p-6 transition-colors duration-75 ${isFlashing ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      {/* 
        CRITICAL FIX: Video cannot be "hidden" or display:none, otherwise the browser 
        pauses the camera stream and disables the flashlight. We make it 1x1 pixel and transparent instead. 
      */}
      <video ref={videoRef} autoPlay playsInline muted className="absolute opacity-0 w-1 h-1 pointer-events-none" />

      {!isConnected ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <button 
            onClick={startCamera}
            className="w-full py-5 bg-black text-white font-bold rounded-lg text-xl tracking-wide shadow-lg"
          >
            Enter Experience
          </button>
          {error && <p className="text-red-500 mt-4 font-bold text-center">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="text-[150px] leading-none mb-8 animate-pulse drop-shadow-xl">❤️</div>
          <h1 className="text-4xl font-black uppercase tracking-widest leading-tight">
            Hold your<br/>phone up
          </h1>
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
  
  // UI States
  const [localActive, setLocalActive] = useState(false);
  const [audienceActive, setAudienceActive] = useState(false);
  
  // Custom URL State
  const [redirectUrl, setRedirectUrl] = useState('https://instagram.com/andrewleemagic');
  const [redirectStatus, setRedirectStatus] = useState('HOLD TO REDIRECT');

  // Timers and Refs
  const localTimerRef = useRef(null);
  const localPressTimer = useRef(null);
  const localStepRef = useRef(0);
  
  const audiencePressTimer = useRef(null);
  const redirectPressTimer = useRef(null);

  useEffect(() => {
    // Request admin camera so your local flashlight works
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        trackRef.current = stream.getVideoTracks()[0];
        setIsReady(true);
      })
      .catch(err => {
        console.error("Admin camera denied", err);
        setIsReady(true);
      });

    // BLUETOOTH REMOTE KEY MAPPING
    const handleKeyDown = (e) => {
      if (e.repeat) return; 
      
      if (e.key === 'ArrowUp') toggleLocalTorch(); // Tap
      else if (e.key === 'ArrowRight') startLocalHeartbeat(); // Hold
      
      else if (e.key === 'ArrowDown') toggleAudienceTorch(); // Tap
      else if (e.key === 'ArrowLeft') startAudienceHeartbeat(); // Hold
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowRight') stopLocalHeartbeat(); // Release
      else if (e.key === 'ArrowLeft') stopAudienceHeartbeat(); // Release
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const applyLocalTorch = (active) => {
    if (trackRef.current) {
      trackRef.current.applyConstraints({ advanced: [{ torch: active }] }).catch(e => console.log(e));
    }
  };

  const fireAudienceCommand = (command) => {
    set(ref(db, 'audienceCommand'), command);
  };

  // --- 1. LOCAL DEVICE ZONE (Top Zone / Up & Right Arrows) ---
  const toggleLocalTorch = () => {
    setLocalActive(prev => {
      const next = !prev;
      applyLocalTorch(next);
      return next;
    });
  };

  const startLocalHeartbeat = () => {
    setLocalActive(true);
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
    clearTimeout(localTimerRef.current);
    applyLocalTorch(false);
    setLocalActive(false);
  };

  // Touch screen support for Local Zone
  const handleLocalDown = () => {
    localPressTimer.current = setTimeout(() => {
      localPressTimer.current = null;
      startLocalHeartbeat();
    }, 400); // 400ms distinguishes a deliberate hold from a tap
  };

  const handleLocalUp = () => {
    if (localPressTimer.current) {
      clearTimeout(localPressTimer.current);
      localPressTimer.current = null;
      toggleLocalTorch();
    } else {
      stopLocalHeartbeat();
    }
  };

  // --- 2. AUDIENCE SYNC ZONE (Bottom Zone / Down & Left Arrows) ---
  const toggleAudienceTorch = () => {
    setAudienceActive(prev => {
      const next = !prev;
      fireAudienceCommand(next ? 'ON' : 'OFF');
      return next;
    });
  };

  const startAudienceHeartbeat = () => {
    setAudienceActive(true);
    fireAudienceCommand('BLINK');
  };

  const stopAudienceHeartbeat = () => {
    setAudienceActive(false);
    fireAudienceCommand('OFF');
  };

  // Touch screen support for Audience Zone
  const handleAudienceDown = () => {
    audiencePressTimer.current = setTimeout(() => {
      audiencePressTimer.current = null;
      startAudienceHeartbeat();
    }, 400);
  };

  const handleAudienceUp = () => {
    if (audiencePressTimer.current) {
      clearTimeout(audiencePressTimer.current);
      audiencePressTimer.current = null;
      toggleAudienceTorch();
    } else {
      stopAudienceHeartbeat();
    }
  };

  // --- 3. REDIRECT ZONE (Top Right Corner) ---
  const handleRedirectDown = () => {
    setRedirectStatus('HOLDING...');
    redirectPressTimer.current = setTimeout(() => {
      redirectPressTimer.current = null;
      fireAudienceCommand(`REDIRECT_${redirectUrl}`);
      
      setRedirectStatus('FIRED!');
      setTimeout(() => setRedirectStatus('HOLD TO REDIRECT'), 2000); 
    }, 800); 
  };

  const handleRedirectUp = () => {
    if (redirectPressTimer.current) {
      clearTimeout(redirectPressTimer.current);
      setRedirectStatus('HOLD TO REDIRECT');
    }
  };

  if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Master Deck...</div>;

  return (
    <div className="h-screen w-full flex flex-col touch-none select-none overflow-hidden bg-black text-white relative">
      
      {/* Top Utility Bar (URL Input + Redirect Button) */}
      <div className="absolute top-0 left-0 w-full h-24 bg-zinc-900 border-b border-zinc-700 flex items-center px-4 z-20 space-x-3">
        <div className="flex-1 flex flex-col justify-center">
          <label className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-1">Custom Redirect URL</label>
          <input 
            type="url" 
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            className="w-full bg-black border border-zinc-700 text-white rounded px-3 py-3 text-sm outline-none focus:border-white transition-colors"
            placeholder="https://..."
          />
        </div>
        <div 
          onPointerDown={handleRedirectDown}
          onPointerUp={handleRedirectUp}
          onPointerLeave={handleRedirectUp}
          onPointerCancel={handleRedirectUp}
          className={`w-28 h-16 rounded flex flex-col items-center justify-center font-bold text-[10px] tracking-wide transition-colors border text-center px-1 ${
            redirectStatus === 'FIRED!' ? 'bg-red-600 border-red-500 text-white' 
            : redirectStatus === 'HOLDING...' ? 'bg-yellow-600 border-yellow-500 text-white' 
            : 'bg-zinc-800 border-zinc-600 text-zinc-300'
          }`}
        >
          {redirectStatus}
        </div>
      </div>

      {/* ZONE 1: Local Device */}
      <div 
        onPointerDown={handleLocalDown}
        onPointerUp={handleLocalUp}
        onPointerLeave={handleLocalUp} 
        onPointerCancel={handleLocalUp}
        className={`flex-1 flex flex-col items-center justify-end pb-12 border-b border-zinc-900 transition-colors pt-24 ${localActive ? 'bg-zinc-800' : 'bg-black'}`}
      >
        <h2 className="text-white text-4xl font-bold tracking-widest mb-4">MY PHONE</h2>
        <div className="flex flex-col space-y-2 text-zinc-500 font-mono text-xs uppercase tracking-widest text-center">
          <span>Tap (↑) = ON/OFF</span>
          <span>Hold (→) = HEARTBEAT</span>
        </div>
      </div>

      {/* ZONE 2: Audience Sync */}
      <div 
        onPointerDown={handleAudienceDown}
        onPointerUp={handleAudienceUp}
        onPointerLeave={handleAudienceUp}
        onPointerCancel={handleAudienceUp}
        className={`flex-1 flex flex-col items-center justify-start pt-12 transition-colors ${audienceActive ? 'bg-zinc-800' : 'bg-black'}`}
      >
        <h2 className="text-white text-4xl font-bold tracking-widest mb-4">AUDIENCE SYNC</h2>
        <div className="flex flex-col space-y-2 text-zinc-500 font-mono text-xs uppercase tracking-widest text-center">
          <span>Tap (↓) = ON/OFF</span>
          <span>Hold (←) = HEARTBEAT</span>
        </div>
      </div>

    </div>
  );
}
