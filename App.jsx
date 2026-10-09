import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// FIREBASE SETUP
// ==========================================
import { db } from './firebase'; 
import { ref, onValue, set } from 'firebase/database';

export default function App() {
  const [view, setView] = useState(null); 

  if (!view) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-widest text-center">THE COLLECTIVE</h1>
        <button 
          onClick={() => setView('audience')}
          className="w-full max-w-sm py-4 bg-white text-black font-bold rounded-lg text-lg"
        >
          Join The Collective Experience
        </button>
        <button 
          onClick={() => setView('control')}
          className="w-full max-w-sm py-4 bg-zinc-900 text-zinc-400 font-bold rounded-lg border border-zinc-800"
        >
          Show Control
        </button>
      </div>
    );
  }

  return view === 'audience' ? <AudienceView /> : <ControlView />;
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
      // We must still request the camera behind the scenes to access the physical flashlight
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
    // If no flashlight hardware (like on iOS Safari), this ensures the screen still strobes
    setIsFlashing(active); 
    
    if (!trackRef.current) return;
    
    try {
      const capabilities = trackRef.current.getCapabilities();
      if (capabilities.torch) {
        await trackRef.current.applyConstraints({
          advanced: [{ torch: active }]
        });
      }
    } catch (err) {
      console.log("Torch constraint failed", err);
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
      // The Heartbeat Rhythm (100ms ON, 150ms OFF, 100ms ON, 650ms OFF)
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
    // Reverses colors rapidly to simulate a strobe if the physical flashlight fails
    <div className={`min-h-screen relative flex flex-col items-center justify-center p-6 transition-colors duration-75 ${isFlashing ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      {/* Hidden video element required to keep the camera track alive */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

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
  
  // Custom URL State with your default
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
        setIsReady(true); // Allow UI to load even if Master Deck denies camera
      });

    // BLUETOOTH REMOTE KEY MAPPING
    const handleKeyDown = (e) => {
      if (e.repeat) return; // Prevent repeated triggers if a key is held down natively
      
      if (e.key === 'ArrowUp') toggleLocalTorch(); // Tap Up Arrow
      else if (e.key === 'ArrowRight') startLocalHeartbeat(); // Hold Right Arrow
      
      else if (e.key === 'ArrowDown') toggleAudienceTorch(); // Tap Down Arrow
      else if (e.key === 'ArrowLeft') startAudienceHeartbeat(); // Hold Left Arrow
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowRight') stopLocalHeartbeat(); // Release Right Arrow
      else if (e.key === 'ArrowLeft') stopAudienceHeartbeat(); // Release Left Arrow
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const applyLocalTorch = (active) => {
    if (trackRef.current && trackRef.current.getCapabilities && trackRef.current.getCapabilities().torch) {
      trackRef.current.applyConstraints({ advanced: [{ torch: active }] }).catch(e => console.error(e));
    }
  };

  const fireAudienceCommand = (command) => {
    set(ref(db, 'audienceCommand'), command);
    console.log("Firebase Broadcast:", command);
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
    }, 300); 
  };

  const handleLocalUp = () => {
    if (localPressTimer.current) {
      clearTimeout(localPressTimer.current);
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
    }, 300);
  };

  const handleAudienceUp = () => {
    if (audiencePressTimer.current) {
      clearTimeout(audiencePressTimer.current);
      toggleAudienceTorch();
    } else {
      stopAudienceHeartbeat();
    }
  };

  // --- 3. REDIRECT ZONE (Top Right Corner) ---
  const handleRedirectDown = () => {
    setRedirectStatus('HOLD
