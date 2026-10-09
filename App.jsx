import React, { useState, useEffect, useRef } from 'react';

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
Join as Spectator
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
setIsFlashing(active);
}
} catch (err) {
console.error("Torch error:", err);
setIsFlashing(active);
}
};

useEffect(() => {
if (!isConnected) return;
window.testSyncCommand = handleCommand;
return () => clearTimeout(timerRef.current);
}, [isConnected]);

const handleCommand = (command) => {
clearTimeout(timerRef.current);

if (command.startsWith('REDIRECT_')) {
const url = command.replace('REDIRECT_', '');
window.location.href = url;
return;
}

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

function ControlView() {
const trackRef = useRef(null);
const localTimerRef = useRef(null);
const [localActive, setLocalActive] = useState(false);
const [audienceActive, setAudienceActive] = useState(false);
const [socialActive, setSocialActive] = useState(false);
const [isReady, setIsReady] = useState(false);

const localPressTimer = useRef(null);
const audiencePressTimer = useRef(null);
const socialPressTimer = useRef(null);

useEffect(() => {
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
.then(stream => {
trackRef.current = stream.getVideoTracks()[0];
setIsReady(true);
})
.catch(err => console.error("Admin camera denied", err));

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
console.log("Firebase Broadcast:", command);
if (window.testSyncCommand) window.testSyncCommand(command);
};

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
}, 300); 
};

const handleLocalUp = () => {
if (localPressTimer.current) {
clearTimeout(localPressTimer.current);
setLocalActive(prev => {
const next = !prev;
applyLocalTorch(next);
return next;
});
} else {
clearTimeout(localTimerRef.current);
applyLocalTorch(false);
setLocalActive(false);
}
};

const handleSocialDown = () => {
socialPressTimer.current = setTimeout(() => {
socialPressTimer.current = null;
setSocialActive(true);
fireAudienceCommand('REDIRECT_https://instagram.com/andrewleemagic');
}, 500);
};

const handleSocialUp = () => {
if (socialPressTimer.current) {
clearTimeout(socialPressTimer.current);
}
setSocialActive(false);
};

const handleAudienceDown = () => {
audiencePressTimer.current = setTimeout(() => {
audiencePressTimer.current = null;
fireAudienceCommand('BLINK');
}, 300);
};

const handleAudienceUp = () => {
if (audiencePressTimer.current) {
clearTimeout(audiencePressTimer.current);
setAudienceActive(prev => {
const next = !prev;
fireAudienceCommand(next ? 'ON' : 'OFF');
return next;
});
} else {
fireAudienceCommand('OFF');
setAudienceActive(false);
}
};

if (!isReady) return <div className="bg-black text-white h-screen flex justify-center items-center">Initializing Hardware...</div>;

return (
<div className="h-screen w-full flex flex-col touch-none select-none overflow-hidden">
<div 
onPointerDown={handleLocalDown}
onPointerUp={handleLocalUp}
onPointerLeave={handleLocalUp} 
className={`flex-1 flex flex-col items-center justify-center border-b-2 border-zinc-900 transition-colors ${localActive ? 'bg-zinc-800' : 'bg-black'}`}
>
<span className="text-zinc-600 font-mono text-sm uppercase tracking-widest mb-2">Top Zone / Up Arrow</span>
<h2 className="text-white text-3xl font-bold">MY PHONE</h2>
</div>

<div 
onPointerDown={handleSocialDown}
onPointerUp={handleSocialUp}
onPointerLeave={handleSocialUp} 
className={`flex-1 flex flex-col items-center justify-center border-b-2 border-black transition-colors ${socialActive ? 'bg-indigo-900' : 'bg-zinc-900'}`}
>
<span className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-2">Middle Zone (Hold 500ms)</span>
<h2 className="text-white text-2xl font-bold">SOCIAL REDIRECT</h2>
</div>

<div 
onPointerDown={handleAudienceDown}
onPointerUp={handleAudienceUp}
onPointerLeave={handleAudienceUp}
className={`flex-1 flex flex-col items-center justify-center transition-colors ${audienceActive ? 'bg-zinc-800' : 'bg-black'}`}
>
<h2 className="text-white text-3xl font-bold">AUDIENCE SYNC</h2>
<span className="text-zinc-600 font-mono text-sm uppercase tracking-widest mt-2">Bottom Zone / Down Arrow</span>
</div>
</div>
);
}
