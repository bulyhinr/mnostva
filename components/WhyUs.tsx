
import React, { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { reviewsService } from '../services/reviewsService';

const BENEFITS = [
  {
    title: 'Consistent Art Style',
    description: 'Build larger worlds with assets designed to work together seamlessly.',
    icon: '🎨',
    color: 'from-pink-400 to-rose-400',
    size: 'lg:col-span-2'
  },
  {
    title: 'Multiple Formats',
    description: 'Available in Blender, FBX, GLB, OBJ, Unreal Engine, Unity, and more.',
    icon: '⚡️',
    color: 'from-blue-400 to-indigo-400',
    size: 'lg:col-span-1'
  },
  {
    title: 'Modular & Customizable',
    description: 'Mix, match, and adapt environments, props, and rooms to fit your project.',
    icon: '🧩',
    color: 'from-amber-400 to-orange-400',
    size: 'lg:col-span-1'
  },
  {
    title: 'Interactive Environments',
    description: 'Explore growing collections of interactive rooms, buildings, furniture, doors, windows, and props.',
    icon: '🚪',
    color: 'from-emerald-400 to-teal-400',
    size: 'lg:col-span-2'
  }
];

const STATS = [
  { label: 'Packs', value: '65+', sub: 'Growing Asset Library' },
  { label: 'Experience', value: '5+ Years', sub: 'Creating Stylized Assets' },
  { label: 'Formats', value: '7+', sub: 'Blender • UE • Unity • FBX • GLB' },
  { label: 'Customers', value: 'Global', sub: 'Trusted by Developers & Creators' }
];

const ASSET_VIDEOS = [
  'https://cdn.pixabay.com/video/2021/04/12/70860-537446549_tiny.mp4',
  'https://cdn.pixabay.com/video/2023/10/21/185934-876859591_tiny.mp4',
  'https://cdn.pixabay.com/video/2020/05/25/40141-424831613_tiny.mp4',
  'https://cdn.pixabay.com/video/2022/10/11/134446-759858369_tiny.mp4',
];

const MOCK_REVIEWS = [
  { id: '1', rating: 5, comment: 'Absolutely amazing asset pack! Fits perfectly with my game style.', user: { name: 'Alex' }, product: { title: 'Cosy Bedroom' } },
  { id: '2', rating: 5, comment: 'Optimization is top tier. High quality textures!', user: { name: 'Sarah' }, product: { title: 'Modular Level Pack' } },
  { id: '3', rating: 4, comment: 'Great lighting setups. Saved me hours of work.', user: { name: 'John' }, product: { title: 'Cyberpunk Prop Pack' } },
];

const WhyUs: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    reviewsService.getLatestReviews(10)
      .then(setReviews)
      .catch(console.error);
  }, []);

  return (
    <section id="benefits" className="py-24 px-4 max-w-7xl mx-auto relative">
      {/* Decorative Floating Elements */}
      <div className="absolute top-10 left-10 text-4xl animate-float opacity-20 select-none pointer-events-none">✨</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-float opacity-20 select-none pointer-events-none" style={{ animationDelay: '1s' }}>☁️</div>
      <div className="absolute top-1/2 left-0 text-4xl animate-float opacity-20 select-none pointer-events-none" style={{ animationDelay: '2s' }}>🌟</div>

      <ScrollReveal className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
          The Secret Sauce of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8a7db3] to-pink-500">Mnostva Art</span>
        </h2>
        <p className="text-xl text-gray-500 font-medium max-w-3xl mx-auto">
          We bridge the gap between high-end technical optimization and whimsical artistic soul.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {/* Main Bento Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {BENEFITS.map((benefit, idx) => (
            <div
              key={idx}
              className={`group relative p-8 rounded-[3rem] overflow-hidden border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/60 backdrop-blur-sm ${benefit.size}`}
            >
              <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${benefit.color} opacity-10 group-hover:opacity-20 transition-opacity rounded-full blur-3xl`}></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm border border-gray-100 group-hover:rotate-12 transition-transform">
                  {benefit.icon}
                </div>
                <h4 className="text-2xl font-black text-gray-800 mb-3 uppercase tracking-tight">{benefit.title}</h4>
                <p className="text-gray-600 font-medium leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Big Video/Showcase Card */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="relative group flex-grow h-full min-h-[400px]">
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-[#8a7db3] rounded-[3.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative h-full bg-white rounded-[3rem] p-4 border-2 border-white shadow-2xl flex flex-col">
              <div className="flex-grow rounded-[2rem] overflow-hidden relative">
                <img
                  src="/technical_showcase.jpg"
                  alt="Technical Showcase"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                  <span className="text-white/80 font-black text-xs uppercase tracking-[0.3em] mb-2">Technical Showcase</span>
                  <h5 className="text-white text-xl font-bold">Stylized Fluidity</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <ScrollReveal className="bg-gray-900 rounded-[3rem] p-10 md:p-16 border-b-8 border-black/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]"></div>
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {STATS.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-pink-400 font-black text-4xl md:text-5xl mb-2 group-hover:scale-110 transition-transform block">
                {stat.value}
              </div>
              <div className="text-white font-black uppercase tracking-widest text-xs mb-1">
                {stat.label}
              </div>
              <div className="text-gray-500 font-bold text-[10px] uppercase">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Reviews Section */}
      <div className="mt-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-3xl font-black text-gray-900 uppercase">What Our Buyers Say</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Real feedback from game developers</p>
          </div>
          <div className="hidden md:flex gap-2">
            <span className="w-12 h-1 bg-[#8a7db3]/20 rounded-full"></span>
            <span className="w-4 h-1 bg-[#8a7db3] rounded-full"></span>
            <span className="w-12 h-1 bg-[#8a7db3]/20 rounded-full"></span>
          </div>
        </div>

        <div className="relative overflow-hidden group py-4">
          <div className="flex gap-8 animate-carousel-move hover:pause-animation">
            {[...(reviews.length > 0 ? reviews : MOCK_REVIEWS), ...(reviews.length > 0 ? reviews : MOCK_REVIEWS)].map((review, idx) => (
              <div
                key={idx}
                className="min-w-[320px] md:min-w-[400px] bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border-4 border-white hover:border-purple-100 transition-all hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 text-[#8a7db3] rounded-2xl flex items-center justify-center font-black text-lg border border-purple-200">
                        {review.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-black text-gray-800 text-sm uppercase tracking-wider">{review.user?.name || 'Anonymous'}</div>
                        <div className="flex text-yellow-400 text-xs mt-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star}>{star <= review.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-4xl opacity-20 text-[#8a7db3] font-serif">“</span>
                  </div>
                  <p className="text-gray-600 font-medium text-base leading-relaxed italic mb-6">
                    {review.comment}
                  </p>
                </div>
                {review.product && (
                  <div className="mt-auto pt-4 border-t border-purple-100/30 flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset:</span>
                    <span className="text-[11px] font-black text-[#8a7db3] uppercase tracking-wider bg-purple-50/50 px-3 py-1 rounded-lg truncate max-w-[220px]">
                      {review.product.title || review.product.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes carousel-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-carousel-move {
          animation: carousel-move 50s linear infinite;
        }
        .pause-animation {
          animation-play-state: paused;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default WhyUs;
