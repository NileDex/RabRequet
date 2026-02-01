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
  
  const cardRef = useRef<HTMLDivElement>(null);

  const funnyNoPhrases = [
    "No", "Are you sure?", "Really?", "Think again!", "Last chance!", 
    "Surely not?", "You're breaking my heart!", "Please?", "I'll be sad!", 
    "Wait, look over there!", "I'll give you a cookie!", "Pretty please?",
    "You can't catch me!", "Still trying?", "Maybe click Yes instead?",
    "Nice try!", "Almost had it!", "Keep trying...", "Nope!", "Not today!",
    "Too fast!", "Try again!", "Missed me!"
  ];

  const triggerConfetti = (isSuccess: boolean = true) => {
    const duration = isSuccess ? 5 * 1000 : 500;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: isSuccess ? 30 : 20, 
      spread: isSuccess ? 360 : 180, 
      ticks: 60, 
      zIndex: 9999,
      colors: ['#ff0000', '#ff69b4', '#ffffff'] 
    };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    if (isSuccess) {
      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else {
      confetti({
        ...defaults,
        particleCount: 10,
        origin: { x: Math.random(), y: Math.random() }
      });
    }
  };

  const handleYes = async () => {
    setStatus(AppState.GENERATING_RESPONSE);
    triggerConfetti(true);
    try {
      const msg = await generateRomanticMessage();
      setMessage(msg);
    } catch (e) {
      console.error("Gemini failed, using backup:", e);
    }
    setStatus(AppState.ACCEPTED);
  };

  const moveNoButton = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (status !== AppState.ASking || !cardRef.current) return;
    
    // Prevent mobile scrolling/behavior
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }

    setNoCount(prev => prev + 1);
    setYesScale(prev => Math.min(prev + 0.25, 6)); // Make Yes button grow faster
    setNoScale(prev => Math.max(prev - 0.05, 0.6));

    const rect = cardRef.current.getBoundingClientRect();
    const btnWidth = 120 * noScale;
    const btnHeight = 45 * noScale;
    const padding = 20;

    // Calculate random position strictly inside the card boundaries
    const maxX = rect.width - btnWidth - padding;
    const maxY = rect.height - btnHeight - padding;

    const newX = Math.max(padding, Math.random() * maxX);
    const newY = Math.max(padding, Math.random() * maxY);

    setNoPos({ x: newX, y: newY });
    
    if (Math.random() > 0.8) triggerConfetti(false);
  }, [status, noScale]);

  const downloadResponse = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fff5f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 20;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#9d174d';
    
    ctx.font = 'bold 65px serif';
    ctx.fillText('VALENTINE DECREE', canvas.width / 2, 160);
    
    ctx.font = '120px serif';
    ctx.fillText('💝', canvas.width / 2, 300);
    
    ctx.font = 'italic 55px serif';
    ctx.fillText('She Said YES!', canvas.width / 2, 420);

    ctx.font = '32px sans-serif';
    ctx.fillText('It is official and irrevocable.', canvas.width / 2, 520);

    if (message) {
      ctx.font = 'italic 28px serif';
      // Added explicit type to 'lines' to prevent TypeScript from inferring 'never[]' when match returns null
      const lines: string[] = message.reason.match(/.{1,45}(\s|$)/g) || [];
      lines.forEach((line, i) => {
        ctx.fillText(line.trim(), canvas.width / 2, 620 + (i * 45));
      });

      ctx.font = '24px serif';
      const poemLines = message.poem.split('\n');
      poemLines.forEach((line, i) => {
        ctx.fillText(line.trim(), canvas.width / 2, 780 + (i * 40));
      });
    }

    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Signed & Sealed: ${new Date().toLocaleDateString()}`, canvas.width / 2, 930);

    const link = document.createElement('a');
    link.download = 'My-Valentine-Response.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-200 via-pink-100 to-red-100 select-none">
      <FloatingHearts />
      
      <div 
        ref={cardRef}
        className="z-10 bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border-8 border-white max-w-lg w-full text-center transition-all duration-700 relative overflow-hidden min-h-[500px] flex flex-col justify-center"
      >
        {status === AppState.ASking && (
          <div className="space-y-10 animate-in fade-in zoom-in duration-1000 relative z-10">
            <div className="relative inline-block mb-2">
              <img 
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpueW9uaTh6eXdzem04bWJzZnV1bWF4MmJ4enJidjZndHp2enp4ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif" 
                alt="Cute Cat" 
                className="rounded-3xl border-4 border-pink-100 shadow-2xl mx-auto w-44 h-44 object-cover"
              />
              <div className="absolute -top-6 -left-6 text-6xl animate-bounce drop-shadow-lg">✨</div>
              <div className="absolute -bottom-6 -right-6 text-6xl animate-pulse drop-shadow-lg">🧸</div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-handwritten font-bold text-pink-700 leading-tight">
                Do you want to be my
              </h1>
              <span className="text-red-500 text-5xl md:text-7xl font-accent block animate-pulse">Valentine?</span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10 relative h-24 mt-12">
              <button
                onClick={handleYes}
                style={{ 
                  transform: `scale(${yesScale})`, 
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-black py-5 px-14 rounded-full shadow-[0_10px_30px_rgba(239,68,68,0.4)] transition-all active:scale-95 z-20 text-2xl"
              >
                YES
              </button>

              <button
                onMouseEnter={moveNoButton}
                onTouchStart={moveNoButton}
                onClick={moveNoButton}
                style={noPos ? {
                  position: 'absolute',
                  left: `${noPos.x}px`,
                  top: `${noPos.y}px`,
                  transform: `scale(${noScale})`,
                  zIndex: 30
                } : {
                  transform: `scale(${noScale})`
                }}
                className="runaway-transition bg-pink-50 hover:bg-white text-pink-400 font-bold py-3 px-8 rounded-full shadow-lg whitespace-nowrap border-2 border-pink-100 min-w-[100px] text-lg touch-none"
              >
                {funnyNoPhrases[noCount % funnyNoPhrases.length]}
              </button>
            </div>
          </div>
        )}

        {status === AppState.GENERATING_RESPONSE && (
          <div className="space-y-8 py-24 animate-in fade-in duration-500 relative z-10">
            <div className="text-9xl animate-spin-slow">💌</div>
            <h2 className="text-3xl font-handwritten font-bold text-pink-600">Whispering to the stars...</h2>
          </div>
        )}

        {status === AppState.ACCEPTED && (
          <div className="space-y-10 animate-in slide-in-from-bottom duration-1000 relative z-10">
            <div className="text-9xl animate-bounce mb-6 drop-shadow-xl">💖</div>
            <h1 className="text-7xl md:text-8xl font-accent text-red-500">Yay!</h1>
            <p className="text-2xl font-handwritten text-pink-700 italic">I knew it! Best decision ever! 🥰</p>
            
            {message && (
              <div className="bg-white/60 backdrop-blur p-8 rounded-[2rem] border-2 border-pink-100 text-left space-y-5 shadow-xl transform rotate-1 transition-transform hover:rotate-0">
                <p className="text-pink-800 font-bold italic text-xl text-center">"{message.reason}"</p>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-200 to-transparent w-full"></div>
                <p className="text-pink-600 font-handwritten text-2xl whitespace-pre-line leading-relaxed text-center font-bold">
                  {message.poem}
                </p>
              </div>
            )}

            <div className="pt-6 space-y-6">
              <button
                onClick={downloadResponse}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black py-5 px-8 rounded-3xl shadow-2xl transform transition-all active:scale-95 flex items-center justify-center gap-3 text-xl group"
              >
                <span className="group-hover:animate-bounce">🎁</span>
                Download My Response
              </button>
              
              <p className="text-pink-400 text-sm italic">Save this and send it back to me! ✨</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-10 left-10 text-5xl opacity-20 pointer-events-none floating">🎈</div>
      <div className="fixed top-20 right-20 text-5xl opacity-20 pointer-events-none floating" style={{animationDelay: '1s'}}>🎀</div>
      <div className="fixed bottom-20 left-20 text-5xl opacity-20 pointer-events-none floating" style={{animationDelay: '1.5s'}}>🍭</div>
      <div className="fixed bottom-10 right-10 text-5xl opacity-20 pointer-events-none floating" style={{animationDelay: '0.5s'}}>🍒</div>
      
      <footer className="fixed bottom-6 w-full text-center text-pink-300 text-xs font-bold tracking-[0.2em] uppercase pointer-events-none drop-shadow-sm">
        Best Valentine Ever
      </footer>
    </div>
  );
};

export default App;