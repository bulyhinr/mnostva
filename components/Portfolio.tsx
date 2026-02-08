
import React from 'react';
import ScrollReveal from './ScrollReveal';

const GalleryItem = ({ index }: { index: number }) => (
  <div className="relative group overflow-hidden rounded-[2.5rem] bg-gray-200 aspect-video lg:aspect-square">
    <img 
      src={`https://picsum.photos/seed/mnostva${index}/800/800`} 
      alt="Gallery art" 
      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
      <span className="text-pink-400 font-bold mb-1">Stylized Render</span>
      <h4 className="text-xl font-bold text-white">Project Concept #{index + 100}</h4>
    </div>
  </div>
);

const Portfolio: React.FC = () => {
  return (
    <section id="portfolio" className="py-20 px-4 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">The <span className="text-purple-600">Dream Gallery</span></h2>
            <p className="text-gray-600">A curated look at our bespoke environments and lighting studies. Each pixel crafted with love and a splash of color.</p>
          </div>
          <button className="text-pink-600 font-bold flex items-center gap-2 group">
            View All Work
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 lg:row-span-2">
             <GalleryItem index={1} />
          </div>
          <GalleryItem index={2} />
          <GalleryItem index={3} />
          <GalleryItem index={4} />
          <GalleryItem index={5} />
        </div>
      </ScrollReveal>
    </section>
  );
};

export default Portfolio;
