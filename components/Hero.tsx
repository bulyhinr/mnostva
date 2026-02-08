
import React from 'react';
import ScrollReveal from './ScrollReveal';
import ModelViewer from './ModelViewer';

interface HeroProps {
  onExplore: () => void;
  onWorkWithUs: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore, onWorkWithUs }) => {
  return (
    <section id="home" className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <ScrollReveal className="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-pink-100 text-pink-600 font-semibold text-sm animate-pulse">
            ✨ Specialist in Cartoon Environments
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Dreamy <span className="text-purple-600">3D Worlds</span> for Your Projects
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl">
            Mnostva Art creates vibrant, stylized 3D cartoon rooms and levels that bring stories to life. Interact with our work.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button 
              onClick={onExplore}
              className="bg-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-bold kidcore-shadow hover:translate-y-[-4px] transition-all"
            >
              Explore Assets
            </button>
            <button 
              onClick={onWorkWithUs}
              className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-2xl text-xl font-bold hover:bg-purple-50 transition-all"
            >
              Work With Us
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full h-[450px] lg:h-[650px]">
          <div className="relative z-10 w-full h-full">
            <ModelViewer />
            
            <div className="absolute bottom-10 right-0 lg:-right-10 bg-white/50 backdrop-blur-md text-purple-600 px-4 py-2 rounded-2xl border border-white/40 shadow-sm pointer-events-none animate-float hidden sm:block">
              <span className="text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Drag to rotate
              </span>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-purple-200/20 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default Hero;
