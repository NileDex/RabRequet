
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FloatingHearts from './components/FloatingHearts';
import { AppState, Position, ValentineMessage } from './types';
import { generateRomanticMessage } from './geminiService';

declare var confetti: any;

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>(AppState.ASking);
  const [noPos, setNoPos] = useState<Position>({ x: 0, y: 0 });
  const [noScale, setNoScale] = useState(1);
  const [yesScale, setYesScale] = useState(1);
  const [message, setMessage] = useState<ValentineMessage | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const funnyNoPhrases = [
    "No", "Are you sure?", "Really?", "Think again!", "Last chance!", 
    "Surely not?", "You're breaking my heart!", "Please?", "I'll be sad!", 
    "Wait, look over there! (still no)", "I'll give you a cookie!", "Pretty please?"
  ];

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleYes = async () => {
    setStatus(AppState.GENERATING_RESPONSE);
    triggerConfetti();
    try {
      const msg = await generateRomanticMessage();
      setMessage(msg);
    } catch (e) {
      console.error(e);
    }
    setStatus(AppState.ACCEPTED);
  };

  const moveNoButton = useCallback(() => {
    if (status !== AppState.ASking) return;
    
    setNoCount(prev => prev + 1);
    
    // Make the Yes button bigger and No button smaller each time she tries to click No
    setYesScale(prev => Math.min(prev + 0.15, 3));
    setNoScale(prev => Math.max(prev - 0.05, 0.3));

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const padding = 60;
    
    // Random position within container bounds
    const newX = Math.random() * (rect.width - 150) - (rect.width / 2) + 75;
    const newY = Math.random() * (rect.height - 100) - (rect.height / 2) + 50;

    setNoPos({ x: newX, y: newY });
  }, [status]);

  const downloadResponse = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#fff5f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 15;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Text Settings
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9d174d';

    // Title
    ctx.font = 'bold 60px serif';
    ctx.fillText('OFFICIAL RESPONSE', canvas.width / 2, 150);

    // Heart
    ctx.font = '100px serif';
    ctx.fillText('❤️', canvas.width / 2, 280);

    // Content
    ctx.font = 'italic 45px serif';
    ctx.fillText('She Said YES!', canvas.width / 2, 400);

    ctx.font = '30px serif';
    ctx.fillText('I am officially your Valentine.', canvas.width / 2, 500);

    if (message) {
      ctx.font = 'italic 25px serif';
      const lines = message.reason.match(/.{1,40}(\s|$)/g) || [];
      lines.forEach((line, i) => {
        ctx.fillText(line.trim(), canvas.width / 2, 600 + (i * 40));
      });

      ctx.font = '22px serif';
      const poemLines = message.poem.split('\n');
      poemLines.forEach((line, i) => {
        ctx.fillText(line.trim(), canvas.width / 2, 750 + (i * 35));
      });
    }

    ctx.font = '20px serif';
    ctx.fillText(`Signed on: ${new Date().toLocaleDateString()}`, canvas.width / 2, 920);

    // Download
    const link = document.createElement('a');
    link.download = 'Our-Valentine-Certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-100 to-red-50">
      <FloatingHearts />
      
      <div 
        ref={containerRef}
        className="z-10 bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-pink-200 max-w-lg w-full text-center transform transition-all hover:scale-[1.01]"
      >
        {status === AppState.ASking && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative inline-block mb-4">
              <img 
                src="https://picsum.photos/seed/valentine-cat/300/200" 
                alt="Cute gesture" 
                className="rounded-2xl border-4 border-pink-100 shadow-lg mx-auto"
              />
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce">💝</div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-pink-700 leading-tight">
              Will you be my <br/>
              <span className="text-red-500 text-5xl md:text-6xl font-accent">Valentine?</span>
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative min-h-[120px]">
              <button
                onClick={handleYes}
                style={{ transform: `scale(${yesScale})` }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all active:scale-95 z-20"
              >
                YES!
              </button>

              <button
                ref={noButtonRef}
                onMouseEnter={!isMobile ? moveNoButton : undefined}
                onTouchStart={isMobile ? moveNoButton : undefined}
                onClick={moveNoButton}
                style={{ 
                  transform: `translate(${noPos.x}px, ${noPos.y}px) scale(${noScale})`,
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-10 rounded-full shadow transition-all whitespace-nowrap"
              >
                {funnyNoPhrases[Math.min(noCount, funnyNoPhrases.length - 1)]}
              </button>
            </div>
          </div>
        )}

        {status === AppState.GENERATING_RESPONSE && (
          <div className="space-y-6 py-10 animate-pulse">
            <div className="text-6xl">💖</div>
            <h2 className="text-2xl font-bold text-pink-600">Preparing something special...</h2>
          </div>
        )}

        {status === AppState.ACCEPTED && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
            <div className="text-8xl animate-bounce mb-4">🥰</div>
            <h1 className="text-5xl md:text-6xl font-accent text-red-500">Yay! Best day ever!</h1>
            
            {message && (
              <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 text-left space-y-4 shadow-inner">
                <p className="text-pink-800 font-semibold italic text-lg">"{message.reason}"</p>
                <div className="h-px bg-pink-200 w-full"></div>
                <p className="text-pink-600 font-handwritten text-xl whitespace-pre-line leading-relaxed">
                  {message.poem}
                </p>
              </div>
            )}

            <div className="pt-4 space-y-4">
              <p className="text-pink-700 text-sm">Download our certificate to seal the deal!</p>
              <button
                onClick={downloadResponse}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download My Response
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="text-pink-400 hover:text-pink-600 text-xs transition-colors"
              >
                Ask me again?
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-4 text-pink-300 text-xs pointer-events-none">
        Made with ❤️ for someone special
      </footer>
    </div>
  );
};

export default App;
