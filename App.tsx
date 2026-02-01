import React, { useState, useEffect, useCallback, useRef } from 'react';
import FloatingHearts from './components/FloatingHearts';
import { AppState, Position, ValentineMessage } from './types';
import { generateRomanticMessage } from './geminiService';

declare var confetti: any;

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>(AppState.ASking);
  const [noPos, setNoPos] = useState<Position | null>(null);
  const [noScale, setNoScale] = useState(1);
  const [yesScale, setYesScale] = useState(1);
  const [message, setMessage] = useState<ValentineMessage | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const funnyNoPhrases = [
    "No", "Are you sure?", "Really?", "Think again!", "Last chance!", 
    "Surely not?", "You're breaking my heart!", "Please?", "I'll be sad!", 
    "Wait, look over there!", "I'll give you a cookie!", "Pretty please?",
    "You can't catch me!", "Still trying?", "Maybe click Yes instead?"
  ];

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

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
      console.error("Failed to generate sweet message:", e);
    }
    setStatus(AppState.ACCEPTED);
  };

  const moveNoButton = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (status !== AppState.ASking) return;
    
    // Prevent default to stop actual clicks or scrolling on mobile
    if (e) e.preventDefault();

    setNoCount(prev => prev + 1);
    
    // Make the Yes button bigger and No button slightly smaller/harder
    setYesScale(prev => Math.min(prev + 0.2, 5));
    setNoScale(prev => Math.max(prev - 0.05, 0.4));

    // Calculate random position in the whole viewport
    const btnWidth = 120;
    const btnHeight = 60;
    const x = Math.max(20, Math.random() * (window.innerWidth - btnWidth - 20));
    const y = Math.max(20, Math.random() * (window.innerHeight - btnHeight - 20));

    setNoPos({ x, y });
  }, [status]);

  const downloadResponse = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fff5f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 15;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#9d174d';
    ctx.font = 'bold 60px serif';
    ctx.fillText('OFFICIAL RESPONSE', canvas.width / 2, 150);
    ctx.font = '100px serif';
    ctx.fillText('❤️', canvas.width / 2, 280);
    ctx.font = 'italic 50px serif';
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
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width / 2, 920);

    const link = document.createElement('a');
    link.download = 'My-Valentine-Response.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-100 to-red-50">
      <FloatingHearts />
      
      <div 
        ref={containerRef}
        className="z-10 bg-white/90 backdrop-blur-lg p-10 md:p-14 rounded-3xl shadow-2xl border-4 border-white max-w-lg w-full text-center transition-all duration-500"
      >
        {status === AppState.ASking && (
          <div className="space-y-10 animate-in fade-in zoom-in duration-1000">
            <div className="relative inline-block mb-2 scale-110">
              <img 
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpueW9uaTh6eXdzem04bWJzZnV1bWF4MmJ4enJidjZndHp2enp4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif" 
                alt="Cute Cat" 
                className="rounded-2xl border-4 border-pink-200 shadow-xl mx-auto w-48 h-48 object-cover"
              />
              <div className="absolute -top-6 -left-6 text-5xl animate-pulse">🧸</div>
              <div className="absolute -bottom-6 -right-6 text-5xl animate-bounce">💌</div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-pink-700 leading-tight">
              Do you want to be my <br/>
              <span className="text-red-500 text-6xl md:text-7xl font-accent block mt-4">Valentine?</span>
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative h-32">
              <button
                onClick={handleYes}
                style={{ transform: `scale(${yesScale})`, transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                className="bg-red-500 hover:bg-red-600 text-white font-black py-5 px-14 rounded-full shadow-2xl transition-all active:scale-90 z-20 text-xl"
              >
                YES
              </button>

              <button
                onMouseEnter={!isMobile ? moveNoButton : undefined}
                onTouchStart={isMobile ? moveNoButton : undefined}
                onClick={moveNoButton}
                style={noPos ? {
                  position: 'fixed',
                  left: `${noPos.x}px`,
                  top: `${noPos.y}px`,
                  transform: `scale(${noScale})`,
                  zIndex: 100,
                  transition: 'all 0.15s ease-out'
                } : {
                  transform: `scale(${noScale})`,
                  transition: 'all 0.3s ease-out'
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-400 font-bold py-4 px-10 rounded-full shadow-md whitespace-nowrap border-2 border-gray-200"
              >
                {funnyNoPhrases[Math.min(noCount, funnyNoPhrases.length - 1)]}
              </button>
            </div>
          </div>
        )}

        {status === AppState.GENERATING_RESPONSE && (
          <div className="space-y-8 py-20">
            <div className="text-8xl animate-spin">🍭</div>
            <h2 className="text-3xl font-handwritten font-bold text-pink-600">Making it official...</h2>
          </div>
        )}

        {status === AppState.ACCEPTED && (
          <div className="space-y-10 animate-in slide-in-from-bottom duration-1000">
            <div className="text-9xl animate-bounce mb-6">💖</div>
            <h1 className="text-6xl md:text-8xl font-accent text-red-500">Yay!</h1>
            <p className="text-2xl font-handwritten text-pink-700">I knew you'd say yes! 🥰</p>
            
            {message && (
              <div className="bg-white p-8 rounded-3xl border-2 border-pink-100 text-left space-y-5 shadow-lg transform -rotate-1">
                <p className="text-pink-800 font-bold italic text-xl">"{message.reason}"</p>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-200 to-transparent w-full"></div>
                <p className="text-pink-600 font-handwritten text-2xl whitespace-pre-line leading-relaxed text-center">
                  {message.poem}
                </p>
              </div>
            )}

            <div className="pt-6 space-y-6">
              <button
                onClick={downloadResponse}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black py-5 px-8 rounded-2xl shadow-2xl transform transition-all active:scale-95 flex items-center justify-center gap-3 text-xl group"
              >
                <span className="group-hover:animate-bounce">💾</span>
                Download Response
              </button>
              
              <p className="text-pink-400 text-sm italic">Save this and send it back to me! 💌</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-10 left-10 text-4xl opacity-30 select-none">🎈</div>
      <div className="fixed top-20 right-20 text-4xl opacity-30 select-none">🎀</div>
      <div className="fixed bottom-20 left-1/4 text-4xl opacity-30 select-none">🥂</div>
      
      <footer className="fixed bottom-6 w-full text-center text-pink-200 text-xs font-semibold tracking-widest uppercase pointer-events-none">
        Forever & Always
      </footer>
    </div>
  );
};

export default App;