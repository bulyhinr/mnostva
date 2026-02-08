
import React, { useState, useEffect } from 'react';

const MascotContact: React.FC = () => {
  const [showBubble, setShowBubble] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Используем относительный путь к вашему локальному файлу маскота
  const mascotImageUrl = "./girl_mnostva.png";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsTriggered(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isTriggered && !isDismissed) {
      const timer = setTimeout(() => setShowBubble(true), 1200);
      const interval = setInterval(() => {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 2000);
      }, 8000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isTriggered, isDismissed]);

  const handleContactClick = () => {
    const section = document.getElementById('benefits');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем срабатывание клика по контакту
    setIsDismissed(true);
  };

  return (
    <div 
      className={`fixed bottom-0 right-4 md:right-10 z-[100] flex flex-col items-center pointer-events-none select-none transition-all duration-1000 ease-out transform ${
        isTriggered && !isDismissed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 scale-90'
      }`}
    >
      {/* Contact Bubble */}
      <div 
        onClick={handleContactClick}
        className={`mb-[-25px] transition-all duration-700 transform pointer-events-auto cursor-pointer group relative ${
          showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'
        }`}
      >
        <div className="relative">
          {/* Close Button - Appears on hover */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow-lg border-2 border-pink-100 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:scale-110 active:scale-90 transition-all z-20 opacity-0 group-hover:opacity-100"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="bg-white px-6 py-4 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(138,125,179,0.4)] border-4 border-pink-100 group-hover:border-[#8a7db3]/20 transition-all group-hover:scale-105 active:scale-95">
            <p className="text-[#8a7db3] font-black text-sm md:text-base uppercase tracking-tight flex items-center gap-2">
              Contact us <span className="animate-bounce">👋</span>
            </p>
          </div>
          <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white rounded-full border-b-2 border-r-2 border-pink-100"></div>
        </div>
      </div>

      {/* Mascot Image */}
      <div 
        onClick={handleContactClick}
        className={`relative pointer-events-auto cursor-pointer w-52 h-52 md:w-80 md:h-80 transition-all duration-500 transform ${
          isWaving ? 'rotate-2 scale-105' : 'rotate-0 scale-100'
        } hover:-translate-y-3 hover:scale-105 active:scale-90`}
      >
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/10 blur-xl rounded-full"></div>

        <div className="relative w-full h-full">
          <img 
            src={mascotImageUrl}
            alt="Mnostva Art Mascot" 
            className="w-full h-full object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  );
};

export default MascotContact;
