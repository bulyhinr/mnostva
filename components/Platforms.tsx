
import React from 'react';
import ScrollReveal from './ScrollReveal';

const PLATFORMS = [
  {
    name: 'Unity Asset Store',
    url: 'https://assetstore.unity.com/publishers/53480',
    color: '#222c37',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M12 1.5L2 7.23v10.54L12 23.5l10-5.73V7.23L12 1.5zm0 2.29l8.03 4.6L12 13.01 3.97 8.39 12 3.79zM3.97 10.7l7.03 4.02v8.13l-7.03-4.04V10.7zM13 22.85v-8.13l7.03-4.02v8.11L13 22.85z" />
      </svg>
    )
  },
  {
    name: 'Fab Marketplace',
    url: 'https://www.fab.com/sellers/Mnostva%20Art',
    color: '#00ccff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm7.33 14.57L12 20.57l-7.33-4V7.43L12 3.43l7.33 4v9.14zM10.5 8h4v2h-4v2h3v2h-3v4H9V8h1.5z" />
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
