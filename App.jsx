import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// FIREBASE SETUP
// When you are ready for the live GoDaddy/Vercel version, 
// uncomment the two lines below to connect your database!
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
setError('Camera access denied or unavailable.');
}
};

const applyTorch = async (active) => {
if (!trackRef.current) return;
try {
const capabilities = trackRef.current.getCapabilities();
if (capabilities.torch) {
await trackRef.current.applyConstraints({
advanced: [{ torch: active }]
});
} else {
setIsFlashing(active); // iOS Safari Fallback
}
} catch (err) {
setIsFlashing(active);
}
};

useEffect(() => {
if (!isConnected) return;

// --- FIREBASE LISTENER ---
// Uncomment this block when using real Firebase
/*
const commandRef = ref(db, 'audienceCommand');
const unsubscribe = onValue(commandRef, (snapshot) => {
const command = snapshot.val();
if (command) handleCommand(command);
});
return () => {
unsubscribe();
clearTimeout(timerRef.current);
};
*/

// Test hook for local development without Firebase
window.testSyncCommand = handleCommand;
return () => clearTimeout(timerRef.current);
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
// Redirect to Instagram Socials
const url = command.split('REDIRECT_')[1];
window.location.href = url;
}
};

return (
<div className={`min-h-screen relative overflow-hidden transition-colors duration-75 ${isFlashing ? 'bg-white' : 'bg-black'}`}>
<video 
ref={videoRef}
autoPlay 
playsInline 
muted 
className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isConnected && !isFlashing ? 'opacity-100' : 'opacity-0'}`}
/>

{!isConnected ? (
<div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 bg-black">
<p className="text-zinc-400 text-center mb-4 text-sm">
Note: Please tap 'Allow' on the following system prompt.
</p>
<button 
onClick={startCamera}
className="w-full max-w-md py-5 bg-white text-black font-bold rounded-lg text-xl tracking-wide shadow-lg"
>
Join The Collective Experience
</button>
{error && <p className="text-red-500 mt-4">{error}</p>}
</div>
) : (
<div className="absolute top-8 w-full flex justify-center z-10">
<div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
<p className="text-white text-xs font-mono tracking-widest uppercase">Connected</p>
</div>
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

// UI State purely for visual feedback on your screen
const [localActive, setLocalActive] = useState(false);
const [audienceActive, setAudienceActive] = useState(false);
const [socialActive, setSocialActive] = useState(false);

// Timers
const localTimerRef = useRef(null);
const localPressTimer = useRef(null);
const audiencePressTimer = useRef(null);
const socialPressTimer = useRef(null);

useEffect(() => {
// Request admin camera so your local flashlight works
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
.then(stream => {
trackRef.current = stream.getVideoTracks()[0];
setIsReady(true);
})
.catch(err => console.error("Admin camera denied", err));

// Bluetooth Remote Key Mapping
const handleKeyDown = (e) => {
if (e.repeat) return; 
if (e.key === 'ArrowUp' || e.key === 'PageUp') handleLocalDown();
else if (e.key === 'ArrowDown' || e.key === 'PageDown') handleAudienceDown();
};

const handleKeyUp = (e) => {
if (e.key === 'ArrowUp' || e.key === 'PageUp') handleLocalUp();
else if (e.key === 'ArrowDown' || e.key === 'PageDown') handleAudienceUp();
};

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

return () => {
window.removeEventListener('keydown', handleKeyDown);
window.removeEventListener('keyup', handleKeyUp);
};
}, []);

const applyLocalTorch = (active) => {
if (trackRef.current && trackRef.current.getCapabilities().torch) {
trackRef.current.applyConstraints({ advanced: [{ torch: active }] }).catch(e => console.error(e));
}
};

const fireAudienceCommand = (command) => {
// --- FIREBASE SENDER ---
// Uncomment this line to push commands to the live database
// set(ref(db, 'audienceCommand'), command);

console.log("Firebase Broadcast:", command);
if (window.testSyncCommand) window.testSyncCommand(command);
};

// --- 1. LOCAL DEVICE ZONE (Top) ---
const handleLocalDown = () => {
localPressTimer.current = setTimeout(() => {
localPressTimer.current = null;

const pattern = [100, 150, 100, 650]; 
let step = 0;

const playLocalHeartbeat = () => {
const duration = pattern[step];
const isOn = (step === 0 || step === 2);
applyLocalTorch(isOn);
step = (step + 1) % pattern.length;
localTimerRef.current = setTimeout(playLocalHeartbeat, duration);
};
playLocalHeartbeat();
setLocalActive(true);
}, 300); 
};

const handleLocalUp = () => {
if (localPressTimer.current) {
// It was a quick tap
clearTimeout(localPressTimer.current);
setLocalActive(prev => {
const next = !prev;
applyLocalTorch(next);
return next;
});
} else {
// It was released from a long hold
clearTimeout(localTimerRef.current);
applyLocalTorch(false);
setLocalActive(false);
}
};

// --- 2. SOCIAL CONNECT ZONE (Middle) ---
const handleSocialDown = () => {
socialPressTimer.current = setTimeout(() => {
socialPressTimer.current = null;
setSocialActive(true);
// Fires the redirect to your Instagram profile
fireAudienceCommand('REDIRECT_https://instagram.com/andrewleemagic');
}, 500); // Requires a deliberate 500ms hold to prevent accidents
};

const handleSocialUp = () => {
if (socialPressTimer.current) {
clearTimeout(socialPressTimer.current);
}
setTimeout(() => setSocialActive(false), 300); // Visual reset
};

// --- 3. AUDIENCE SYNC ZONE (Bottom) ---
const handleAudienceDown = () => {
audiencePressTimer.current = setTimeout(() => {
audiencePressTimer.current = null;
setAudienceActive(true);
fireAudienceCommand('BLINK'); // Starts audience heartbeat
}, 300);
};

const handleAudienceUp = () => {
if (audiencePressTimer.current) {
// Quick tap
clearTimeout(audiencePressTimer.current);
setAudienceActive(prev => {
const next = !prev;
fireAudienceCommand(next ? 'ON' : 'OFF');
return next;
});
} else {
// Released from hold
fireAudienceCommand('OFF');
setAudienceActive(false);
}
};

if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center font-mono">Initializing Hardware...</div>;

return (
<div className="h-screen w-full flex flex-col touch-none select-none overflow-hidden text-center">

{/* ZONE 1: Local Device */}
<div 
onPointerDown={handleLocalDown}
onPointerUp={handleLocalUp}
onPointerLeave={handleLocalUp} 
className={`flex-1 flex flex-col items-center justify-center border-b border-zinc-900 transition-colors ${localActive ? 'bg-zinc-800' : 'bg-black'}`}
>
<span className="text-zinc-600 font-mono text-sm uppercase tracking-widest mb-1">Top Zone / Up Arrow</span>
<h2 className="text-white text-3xl font-bold">MY PHONE</h2>
</div>

{/* ZONE 2: Instagram Redirect */}
<div 
onPointerDown={handleSocialDown}
onPointerUp={handleSocialUp}
onPointerLeave={handleSocialUp}
className={`flex-none h-32 flex flex-col items-center justify-center border-b border-zinc-900 transition-colors ${socialActive ? 'bg-zinc-700' : 'bg-zinc-900'}`}
>
<h2 className="text-white text-xl font-bold tracking-widest">SOCIAL CONNECT</h2>
<span className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">Hold 500ms to Redirect</span>
</div>

{/* ZONE 3: Audience Sync */}
<div 
onPointerDown={handleAudienceDown}
onPointerUp={handleAudienceUp}
onPointerLeave={handleAudienceUp}
className={`flex-1 flex flex-col items-center justify-center transition-colors ${audienceActive ? 'bg-zinc-800' : 'bg-black'}`}
>
<h2 className="text-white text-3xl font-bold">AUDIENCE SYNC</h2>
<span className="text-zinc-600 font-mono text-sm uppercase tracking-widest mt-1">Bottom Zone / Down Arrow</span>
</div>

</div>
);
}
