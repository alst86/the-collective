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
    if (!isConnected) return;

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
      
      {/* Invisible video element keeps camera stream alive for the physical flashlight */}
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
  
  // Explicit Modes: 'OFF', 'ON', 'BLINK'
  const [localMode, setLocalMode] = useState('OFF');
  const [audienceMode, setAudienceMode] = useState('OFF');
  
  const [redirectUrl, setRedirectUrl] = useState('https://instagram.com/andrewleemagic');
  const [redirectStatus, setRedirectStatus] = useState('HOLD TO REDIRECT');

  const localTimerRef = useRef(null);
  const localStepRef = useRef(0);
  
  const redirectPressTimer = useRef(null);

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

    const handleKeyDown = (e) => {
      if (e.repeat) return; 
      
      if (e.key === 'ArrowUp') toggleLocalTorch(); 
      else if (e.key === 'ArrowRight') startLocalHeartbeat(); 
      
      else if (e.key === 'ArrowDown') toggleAudienceTorch(); 
      else if (e.key === 'ArrowLeft') startAudienceHeartbeat(); 
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowRight') stopLocalHeartbeat(); 
      else if (e.key === 'ArrowLeft') stopAudienceHeartbeat(); 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localMode, audienceMode]);

  const applyLocalTorch = (active) => {
    if (trackRef.current) {
      trackRef.current.applyConstraints({ advanced: [{ torch: active }] }).catch(e => console.log(e));
    }
  };

  const fireAudienceCommand = (command) => {
    set(ref(db, 'audienceCommand'), command);
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

  // --- 3. REDIRECT LOGIC ---
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
      
      {/* Top Utility Bar */}
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-6 border-b border-zinc-900">
        <h2 className="text-white text-3xl font-bold tracking-widest mb-4">MY PHONE</h2>
        
        {/* Toggle Buttons */}
        <div className="flex w-full space-x-3 mb-3">
          <button 
            onClick={turnLocalOn} 
            className={`flex-1 py-5 font-bold rounded-lg text-xl tracking-wider transition-colors ${localMode === 'ON' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-zinc-900 text-zinc-500'}`}
          >
            ON
          </button>
          <button 
            onClick={turnLocalOff} 
            className={`flex-1 py-5 font-bold rounded-lg text-xl tracking-wider transition-colors ${localMode === 'OFF' ? 'bg-zinc-700 text-white shadow-lg' : 'bg-zinc-900 text-zinc-500'}`}
          >
            OFF
          </button>
        </div>

        {/* Heartbeat Hold Button */}
        <button 
          onPointerDown={startLocalHeartbeat}
          onPointerUp={stopLocalHeartbeat}
          onPointerLeave={stopLocalHeartbeat}
          onPointerCancel={stopLocalHeartbeat}
          className={`w-full py-5 font-bold rounded-lg text-xl tracking-wider transition-colors ${localMode === 'BLINK' ? 'bg-red-600 text-white shadow-lg shadow-red-500/50' : 'bg-zinc-900 text-zinc-500'}`}
        >
          HOLD: HEARTBEAT
        </button>
        
        <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest mt-4">
          Remote: Tap (↑) Toggle | Hold (→) Strobe
        </span>
      </div>

      {/* ZONE 2: Audience Sync */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        <h2 className="text-white text-3xl font-bold tracking-widest mb-4">AUDIENCE SYNC</h2>
        
        {/* Toggle Buttons */}
        <div className="flex w-full space-x-3 mb-3">
          <button 
            onClick={turnAudienceOn} 
            className={`flex-1 py-5 font-bold rounded-lg text-xl tracking-wider transition-colors ${audienceMode === 'ON' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-zinc-900 text-zinc-500'}`}
          >
            ON
          </button>
          <button 
            onClick={turnAudienceOff} 
            className={`flex-1 py-5 font-bold rounded-lg text-xl tracking-wider transition-colors ${audienceMode === 'OFF' ? 'bg-zinc-700 text-white shadow-lg' : 'bg-zinc-900 text-zinc-500'}`}
          >
            OFF
          </button>
        </div>

        {/* Heartbeat Hold Button */}
        <button 
          onPointerDown={startAudienceHeartbeat}
          onPointerUp={stopAudienceHeartbeat}
          onPointerLeave={stopAudienceHeartbeat}
          onPointerCancel={stopAudienceHeartbeat}
          className={`w-full py-5 font-bold rounded-lg text-xl tracking-wider transition-colors ${audienceMode === 'BLINK' ? 'bg-red-600 text-white shadow-lg shadow-red-500/50' : 'bg-zinc-900 text-zinc-500'}`}
        >
          HOLD: HEARTBEAT
        </button>

        <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest mt-4">
          Remote: Tap (↓) Toggle | Hold (←) Strobe
        </span>
      </div>

    </div>
  );
}
