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
      
      <div className="absolute top
