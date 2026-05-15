import React, { useState, useEffect } from 'react';

interface LicensePageProps {
  onBack: () => void;
}

const sections = [
  {
    id: 'standard-license',
    title: '1. Standard License (One-Time Purchase)',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p>Our Standard License is a one-time purchase that grants you perpetual rights to use the assets. We offer two tiers based on your annual revenue:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
            <h4 className="font-black text-blue-600 uppercase tracking-widest text-xs mb-3">Personal Tier</h4>
            <p className="text-[11px] mb-3">For individuals or small teams with <strong>annual gross revenue less than $100,000 USD</strong> in the last 12 months.</p>
            <ul className="list-disc pl-4 space-y-1 text-[10px]">
              <li>Personal projects</li>
              <li>Small commercial games</li>
              <li>Indie software development</li>
            </ul>
          </div>
          <div className="bg-purple-50/50 p-6 rounded-2xl border-2 border-purple-100 shadow-sm">
            <h4 className="font-black text-purple-600 uppercase tracking-widest text-xs mb-3">Professional Tier</h4>
            <p className="text-[11px] mb-3">For companies or entities with <strong>annual gross revenue over $100,000 USD</strong> in the last 12 months.</p>
            <ul className="list-disc pl-4 space-y-1 text-[10px]">
              <li>Large studio projects</li>
              <li>Enterprise applications</li>
              <li>Corporate marketing assets</li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          <p className="font-bold text-gray-800">Under both tiers, you receive:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Perpetual, worldwide rights to use the purchased asset packs</li>
            <li>Permission to use the assets in an unlimited number of projects</li>
            <li>The right to modify the Product to fit your project's requirements</li>
            <li>Permission to distribute the Product integrated in binary form (as part of a game/app)</li>
          </ul>
        </div>

        <div className="pt-4">
          <p className="font-bold text-pink-500 uppercase tracking-wide text-xs">Restrictions:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Sell, rent, or distribute the Product as standalone files</li>
            <li>Claim the Product as your own original creation</li>
            <li>Sub-license the original raw files to third parties</li>
          </ul>
        </div>
        <p className="mt-4 text-xs text-gray-400 italic border-t border-gray-100 pt-4">By purchasing and/or downloading these assets, you agree to the terms of the Standard License Agreement corresponding to your revenue tier.</p>
      </div>
    )
  },
  {
    id: 'free-policy',
    title: '2. Free Asset Usage Policy',
    content: (
      <div className="space-y-4 text-gray-600 font-medium leading-relaxed text-sm">
        <p>This license applies to all assets provided in the Free category. By downloading free assets, you receive:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>A perpetual, worldwide, non-exclusive license to use the assets</li>
          <li>The right to create an unlimited number of Final Products</li>
          <li>Permission to include the assets in both personal and commercial projects</li>
        </ul>
        <p className="mt-3 font-bold text-pink-500 uppercase tracking-wide text-xs">However, the following is strictly prohibited:</p>
        <ul className="list-disc pl-5 space-y-2 text-gray-500">
          <li>Redistributing the assets "as-is" (even for free) on any platform</li>
          <li>Modifying and distributing derivative works outside of an integrated Final Product</li>
          <li>Using the assets in on-demand or do-it-yourself online building services</li>
        </ul>
        <p className="mt-2 text-xs text-gray-400 italic border-t border-gray-100 pt-4">By downloading these assets, you agree to the terms of our Free Asset Usage Policy.</p>
      </div>
    )
  }
];

export const LicensePage: React.FC<LicensePageProps> = ({ onBack }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm font-black text-[#8a7db3] hover:text-pink-500 transition-colors uppercase tracking-widest"
        >
          <span>←</span> Back to Shop
        </button>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">License Agreements</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">How you can use our 3D Magic</p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div 
                key={section.id} 
                className={`bg-white rounded-[2rem] border-2 shadow-sm transition-all overflow-hidden ${isOpen ? 'border-[#8a7db3] shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left"
                >
                  <span className={`text-xl font-black transition-colors ${isOpen ? 'text-[#8a7db3]' : 'text-gray-900'}`}>
                    {section.title}
                  </span>
                  <span className={`text-2xl font-black transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#8a7db3]' : 'text-gray-400'}`}>
                    +
                  </span>
                </button>
                
                {isOpen && (
                  <div className="px-8 pb-8 pt-2 border-t border-gray-50 animate-fadeIn">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-8 bg-pink-50 rounded-3xl border-2 border-pink-100 text-center text-gray-600 font-medium italic shadow-sm">
          "We make art so you can make magic. Follow the rules, and keep creating beautiful worlds!" — The Mnostva Art Team 🌈
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
