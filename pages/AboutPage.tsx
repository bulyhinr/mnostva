
import React from 'react';
import ScrollReveal from '../components/ScrollReveal';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen pt-10 pb-20 px-4">
      <ScrollReveal className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-b-8 border-black/10">
          <div className="relative h-64 md:h-96">
            <img 
              src="https://picsum.photos/seed/mnostva_studio/1200/600" 
              className="w-full h-full object-cover" 
              alt="Mnostva Art Studio" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#8a7db3] to-transparent opacity-60"></div>
            <div className="absolute bottom-10 left-10 right-10">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2">
                About <span className="text-pink-200">Mnostva Art</span>
              </h1>
              <p className="text-white/90 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">
                Stylized 3D Pioneers • Cartoon Worlds • Kidcore DNA
              </p>
            </div>
          </div>

          <div className="p-8 md:p-16 space-y-12">
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-gray-900 border-l-8 border-pink-500 pl-6">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                Mnostva Art was born from a simple dream: to make the digital world feel as cozy and vibrant as a Sunday morning cartoon. We are a specialized collective of 3D artists, designers, and dreamers who believe that stylized environments are the heartbeat of storytelling. 
              </p>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                Based on the principles of "Kidcore" and high-fidelity stylized rendering, we've spent years perfecting our unique aesthetic—blending soft purple hues, bouncy shapes, and nostalgic vibes into professional game-ready assets.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-pink-50 p-8 rounded-[2rem] border-2 border-pink-100">
                <h3 className="text-xl font-black text-pink-600 mb-4 uppercase tracking-widest">Our Mission</h3>
                <p className="text-gray-700 font-medium">
                  To provide game developers and creators with high-quality, soulful 3D environments that reduce development time while increasing the emotional impact of their projects.
                </p>
              </div>
              <div className="bg-[#8a7db3]/5 p-8 rounded-[2rem] border-2 border-[#8a7db3]/10">
                <h3 className="text-xl font-black text-[#8a7db3] mb-4 uppercase tracking-widest">Our Vision</h3>
                <p className="text-gray-700 font-medium">
                  We envision a gaming landscape filled with color, wonder, and stylized magic, where every indie creator has access to the same level of environmental polish as AAA studios.
                </p>
              </div>
            </div>

            <section className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900">What makes us different?</h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Bespoke Aesthetic",
                    desc: "We don't do 'generic'. Every asset pack we release undergoes a rigorous art-direction phase to ensure it fits our signature dreamy look."
                  },
                  {
                    title: "Engine Optimized",
                    desc: "Beauty shouldn't be heavy. Our assets are meticulously optimized for Unity (URP/HDRP), Unreal Engine 5, and mobile platforms."
                  },
                  {
                    title: "Ready-to-Use",
                    desc: "We provide full demo scenes and lighting setups. You don't just buy a collection of meshes; you buy an atmosphere."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0 font-black text-pink-500">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-800 mb-2">{item.title}</h4>
                      <p className="text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-10 border-t-4 border-gray-50 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h4 className="text-2xl font-black text-gray-900 mb-1">Join our journey!</h4>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Follow us for weekly updates and art studies</p>
              </div>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/mnostva" target="_blank" className="p-4 bg-gray-50 rounded-2xl hover:bg-pink-100 hover:text-pink-500 transition-all font-black text-sm uppercase tracking-widest">Instagram</a>
                <a href="https://www.artstation.com/mnostva" target="_blank" className="p-4 bg-gray-50 rounded-2xl hover:bg-blue-100 hover:text-blue-500 transition-all font-black text-sm uppercase tracking-widest">ArtStation</a>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default AboutPage;
