import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LicensePageProps {
  onBack?: () => void;
}

const sections = [
  {
    id: 'standard-license',
    title: '1. Commercial 3D Asset Licenses',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p>
          All Mnostva Art 3D assets are a <strong>one-time purchase</strong> with <strong>perpetual, royalty-free rights</strong>. You never pay ongoing percentages or revenue shares. We offer two distinct tiers based on team size and seat count:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-blue-600 uppercase tracking-widest text-xs">
                Personal License
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                Single-Seat
              </span>
            </div>
            <p className="text-[11px] mb-3 text-gray-700">
              For solo indie developers, freelance artists, and individual creators. Strictly <strong>one (1) natural person</strong> may access raw 3D files.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Unlimited commercial games, apps & animations</li>
              <li>Keep 100% of your earnings (Zero revenue cap, zero royalties)</li>
              <li>Local device installation & personal backups</li>
              <li>Delivering compiled game/video deliverables to clients</li>
            </ul>
          </div>

          <div className="bg-purple-50/50 p-6 rounded-2xl border-2 border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-purple-600 uppercase tracking-widest text-xs">
                Studio / Company License
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                Multi-Seat
              </span>
            </div>
            <p className="text-[11px] mb-3 text-gray-700">
              For studios, companies, and teams of <strong>two (2) or more collaborators</strong>.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Unlimited seats across your entire studio/company</li>
              <li>Secure internal cloud, Git, SVN, or Perforce hosting</li>
              <li>Multi-artist & multi-programmer collaboration</li>
              <li>Unlimited commercial studio projects & client deliverables</li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          <p className="font-bold text-gray-900">Permitted Under Both Licenses:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs">
            <li>Commercial video games published to Steam, App Store, Google Play, consoles, or web</li>
            <li>Modify meshes, retopologize, edit textures, adjust rigs, and create custom shaders</li>
            <li>Render 2D imagery, cinematics, YouTube videos, and promotional trailers</li>
            <li>Use across an unlimited number of discrete commercial projects</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="font-bold text-pink-500 uppercase tracking-wide text-xs mb-2">
            Strictly Prohibited (All Tiers):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
            <li>Selling, sharing, or redistributing standalone 3D files (e.g. on marketplaces, torrents, Discord)</li>
            <li>Distributing assets in extractable formats (files must be cooked/compiled into engine binaries)</li>
            <li>Using assets as training data, fine-tuning, or benchmarks for Generative AI or ML models</li>
            <li>Commercial 3D printing, toy manufacturing, or physical merchandise without a separate Custom License</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'free-policy',
    title: '2. Free Asset Usage Policy',
    content: (
      <div className="space-y-4 text-gray-600 font-medium leading-relaxed text-sm">
        <p>
          All assets in our <strong>Free</strong> category are provided under the Personal License terms, allowing creators of all backgrounds to build wonderful worlds:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs">
          <li>A perpetual, worldwide, non-exclusive license to use the assets</li>
          <li>Permission to incorporate into both commercial and non-commercial compiled products</li>
          <li>Unlimited projects, games, and animations</li>
        </ul>

        <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 mt-3 text-xs text-pink-900">
          <strong>Important Clarification:</strong> Free assets cannot be re-hosted, shared, or redistributed standalone (even for free). They are subject to the same strict AI training and commercial 3D printing prohibitions as paid assets.
        </div>
      </div>
    ),
  },
  {
    id: 'custom-license',
    title: '3. Custom & Extended Licensing',
    content: (
      <div className="space-y-4 text-gray-600 font-medium leading-relaxed text-sm">
        <p>
          Need rights beyond the standard digital gaming scope? We provide bespoke enterprise agreements for:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs">
          <li>Mass physical toy manufacturing, board game figures, or 3D-printed products for retail sale</li>
          <li>Enterprise-wide indemnity coverage and custom procurement terms</li>
          <li>AI model training datasets or synthetic data generation licensing</li>
          <li>Open UGC toolkits, modding sandbox integration, or building software</li>
        </ul>
        <div className="pt-2">
          <a
            href="mailto:support@mnostva.art?subject=Custom%20License%20Inquiry"
            className="inline-flex items-center gap-2 text-pink-500 font-black hover:underline text-xs"
          >
            <span>✉ Contact our licensing team at support@mnostva.art →</span>
          </a>
        </div>
      </div>
    ),
  },
];

export const LicensePage: React.FC<LicensePageProps> = ({ onBack }) => {
  const [openSection, setOpenSection] = useState<string | null>('standard-license');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-8 flex items-center gap-2 text-sm font-black text-[#8a7db3] hover:text-pink-500 transition-colors uppercase tracking-widest"
        >
          <span>←</span> Back to Shop
        </button>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8a7db3]/10 text-[#8a7db3] text-xs font-black uppercase tracking-widest mb-4">
            Creator Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            License Agreements
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            How you can use our 3D magic in your games and commercial projects
          </p>
        </div>

        {/* Quick EULA banner linking to /legal */}
        <div className="mb-10 p-6 bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8a7db3]/10 text-[#8a7db3] flex items-center justify-center text-2xl font-black">
              ⚖️
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Looking for the formal End User License Agreement?
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Read our complete 20-section contract and download the full EULA in our Legal Center.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/legal')}
            className="px-6 py-3 bg-[#8a7db3] hover:bg-[#786aa3] text-white rounded-full font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-sm hover:shadow-md"
          >
            Go to Legal Center →
          </button>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div
                key={section.id}
                className={`bg-white rounded-[2rem] border-2 shadow-sm transition-all overflow-hidden ${
                  isOpen ? 'border-[#8a7db3] shadow-md' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left"
                >
                  <span
                    className={`text-xl font-black transition-colors ${
                      isOpen ? 'text-[#8a7db3]' : 'text-gray-900'
                    }`}
                  >
                    {section.title}
                  </span>
                  <span
                    className={`text-2xl font-black transition-transform duration-300 ${
                      isOpen ? 'rotate-45 text-[#8a7db3]' : 'text-gray-400'
                    }`}
                  >
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

        {/* Friendly Studio Quote */}
        <div className="mt-12 p-8 bg-pink-50 rounded-3xl border-2 border-pink-100 text-center text-gray-600 font-medium italic shadow-sm">
          "We make art so you can make magic. Follow the rules, and keep creating beautiful worlds!" — The Mnostva Art Team 🌈
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
