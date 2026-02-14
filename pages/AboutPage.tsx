
import React from 'react';
import ScrollReveal from '../components/ScrollReveal';

import { useState, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending
    console.log('Sending freelance inquiry:', { ...formData, file });
    toast.success('Message sent! We\'ll be in touch soon. 🚀');
    setIsModalOpen(false);
    setFormData({ name: '', email: '', description: '' });
    setFile(null);
  };

  return (
    <div className="min-h-screen pt-10 pb-20 px-4">
      <Toaster position="top-right" />
      <ScrollReveal className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
          >
            ← Back to Home
          </button>
        </div>

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
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <h2 className="text-3xl font-black text-gray-900 border-l-8 border-pink-500 pl-6">Our Story</h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#8a7db3] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:translate-y-[-4px] hover:shadow-2xl transition-all flex items-center gap-3 group"
                >
                  <span>Contact Us for Freelance</span>
                  <span className="group-hover:rotate-12 transition-transform">🚀</span>
                </button>
              </div>
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

      {/* Freelance Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-300 border-4 border-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-pink-500 transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 font-bold text-[10px] uppercase tracking-widest mb-4">Let's create magic</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter leading-tight">Work With Us</h2>
              <p className="text-gray-500 font-medium mt-2 max-w-xs mx-auto text-sm">Have a vision for a stylized world? Tell us about it!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Your Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all placeholder:text-gray-300"
                  placeholder="Designer Dave"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all placeholder:text-gray-300"
                  placeholder="dave@studio.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Project Idea / Brief</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-2xl px-6 py-4 font-bold outline-none transition-all placeholder:text-gray-300 resize-none"
                  placeholder="I need a low-poly candy forest level for my mobile game..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-4">Attachments (Optional)</label>
                <div className="relative group">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-gray-50 border-4 border-dashed border-gray-200 group-hover:border-[#8a7db3] rounded-2xl px-6 py-8 text-center transition-all flex flex-col items-center justify-center gap-2">
                    <span className="bg-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm">📎</span>
                    <span className="text-xs font-bold text-gray-500 group-hover:text-[#8a7db3]">
                      {file ? file.name : 'Click to upload reference images or docs'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#8a7db3] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:translate-y-[-4px] active:translate-y-0 transition-all uppercase tracking-widest relative overflow-hidden group"
                >
                  <span className="relative z-10">Send Request 🚀</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">We usually reply within 24 hours</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutPage;
