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
  
  const secretPressTimer = useRef(null); 

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
      clearTimeout(secretPressTimer.current);
    };
  }, []);

  const handleCommand = (command) => {
    clearTimeout(timerRef.current);
    
    const safeCommand = String(command);
    const parts = safeCommand.split('|');
    const baseCmd = parts[0];
    
    if (baseCmd === 'ON') {
      applyTorch(true);
      setIsFlashing(false); 
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
    } else if (baseCmd === 'REDIRECT') {
      const url = parts.slice(2).join('|'); 
      if (url) {
        let finalUrl = url;
        if (!url.startsWith('http') && !url.includes('://')) {
          finalUrl = `https://${url}`;
        }
        
        window.location.assign(finalUrl);
      }
    }
  };

  // --- SECRET GATEWAY LOGIC ---
  const handleSecretDown = () => {
    secretPressTimer.current = setTimeout(() => {
      window.location.href = window.location.pathname + '?master';
    }, 2500); 
  };

  const handleSecretUp = () => {
    if (secretPressTimer.current) {
      clearTimeout(secretPressTimer.current);
      secretPressTimer.current = null;
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center transition-colors duration-75 overflow-hidden ${isFlashing ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      <div className="absolute top-4 left-4 z-
