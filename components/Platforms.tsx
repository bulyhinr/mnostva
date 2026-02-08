
import React from 'react';
import ScrollReveal from './ScrollReveal';

const PLATFORMS = [
  {
    name: 'Unity Asset Store',
    url: 'https://assetstore.unity.com/publishers/53480',
    color: '#222c37',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M22.01 12.02c0 .28-.05.54-.15.78l-1.93-.72a.5.5 0 0 0-.64.29.5.5 0 0 0 .29.64l1.93.72a3.02 3.02 0 0 1-2.02 2.02l-.72-1.93a.5.5 0 0 0-.64-.29.5.5 0 0 0-.29.64l.72 1.93c-.24.1-.5.15-.78.15s-.54-.05-.78-.15l.72-1.93a.5.5 0 0 0-.29-.64.5.5 0 0 0-.64.29l-.72 1.93a3.02 3.02 0 0 1-2.02-2.02l1.93-.72a.5.5 0 0 0 .29-.64.5.5 0 0 0-.64-.29l-1.93.72c.1-.24.15-.5.15-.78s-.05-.54-.15-.78l1.93.72a.5.5 0 0 0 .64-.29.5.5 0 0 0-.29-.64l-1.93-.72a3.02 3.02 0 0 1 2.02-2.02l.72 1.93a.5.5 0 0 0 .64.29.5.5 0 0 0 .29-.64l-.72-1.93c.24-.1.5-.15.78-.15s.54.05.78.15l-.72 1.93a.5.5 0 0 0 .29.64.5.5 0 0 0 .64-.29l.72-1.93a3.02 3.02 0 0 1 2.02 2.02l-1.93.72a.5.5 0 0 0-.29.64.5.5 0 0 0 .64.29l1.93-.72c-.1.24-.15.5-.15.78zM12 2.02c5.51 0 10 4.49 10 10s-4.49 10-10 10-10-4.49-10-10 4.49-10 10-10z"/>
      </svg>
    )
  },
  {
    name: 'Fab Marketplace',
    url: 'https://www.fab.com/sellers/Mnostva%20Art',
    color: '#00ccff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2zM12 15.63l-4.5 2.04 4.5-11.04 4.5 11.04-4.5-2.04z"/>
      </svg>
    )
  },
  {
    name: 'CGTrader',
    url: 'https://www.cgtrader.com/designers/mnostva',
    color: '#3498db',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm8 14.12l-8 4-8-4V7.88l8-4 8 4v8.24zM12 15l-4-2v-4l4 2 4-2v4l-4 2z"/>
      </svg>
    )
  },
  {
    name: 'ArtStation',
    url: 'https://www.artstation.com/mnostva/store?tab=digital_product',
    color: '#13aff0',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M1.77 19.3L5 20.4l8.3-14.4L11.6 3.4l-9.8 15.9zm13.3-13.1l-1.3 2.1 6.8 11.8 1.7-1.1-7.2-12.8zm-2.4 8.7l-4.2 7.2h12.8l-1.5-2.6H11.5l-1.5-2.6h2.7l-1.4-2.4-1.4 2.4h2.7z"/>
      </svg>
    )
  }
];

const Platforms: React.FC = () => {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <ScrollReveal className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
          Also available on <span className="text-[#8a7db3]">these platforms</span>
        </h2>
        <p className="text-gray-500 font-medium max-w-xl mx-auto">
          We collaborate with the world's leading 3D marketplaces to bring our stylized worlds to every creator.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLATFORMS.map((platform, idx) => (
          <ScrollReveal key={platform.name} delay={idx * 100}>
            <a 
              href={platform.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border-b-8 border-black/10 hover:border-black/5 hover:translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
            >
              {/* Background accent */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{ backgroundColor: platform.color }}
              ></div>
              
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-6"
                style={{ backgroundColor: platform.color + '20', color: platform.color }}
              >
                {platform.icon}
              </div>
              
              <h4 className="text-xl font-black text-gray-800 mb-2">{platform.name}</h4>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#8a7db3] transition-colors">
                Visit Store →
              </span>

              {/* Decorative "collab" tag */}
              <div className="absolute top-4 right-4 rotate-12">
                <span className="bg-[#a2c367] text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  VERIFIED
                </span>
              </div>
            </a>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default Platforms;
