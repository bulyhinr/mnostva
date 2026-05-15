import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    id: 'licenses',
    title: 'Types of Licenses',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p>We provide clear, game-ready licensing options for all our 3D assets. Our Standard License follows a 2-tier revenue-based system:</p>
        
        <div className="space-y-4">
          <div className="bg-blue-50/50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
            <h4 className="font-black text-blue-600 uppercase tracking-widest text-xs mb-3">1. Standard License - Personal</h4>
            <p className="text-[11px] mb-2 text-gray-700">Required for individuals or entities with <strong>annual gross revenue less than $100,000 USD</strong>.</p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>Perpetual rights to use the purchased assets in personal or indie projects</li>
              <li>Unlimited number of final commercial products (games, apps, videos)</li>
              <li>Right to modify assets for your project's specific needs</li>
            </ul>
          </div>

          <div className="bg-purple-50/50 p-6 rounded-2xl border-2 border-purple-100 shadow-sm">
            <h4 className="font-black text-purple-600 uppercase tracking-widest text-xs mb-3">2. Standard License - Professional</h4>
            <p className="text-[11px] mb-2 text-gray-700">Required for entities with <strong>annual gross revenue exceeding $100,000 USD</strong>.</p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>All benefits of the Personal tier for professional studio environments</li>
              <li>Enterprise-level usage rights for large-scale commercial productions</li>
              <li>Corporate-wide project integration permissions</li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-2 uppercase tracking-wide">3. Free Asset Usage Policy</h4>
          <p className="mb-2">Assets in the Free category come with a perpetual, worldwide license but are restricted to "Final Product" use only. Redistribution as standalone files is strictly prohibited.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 italic">By purchasing or downloading any asset from Mnostva Art, you agree to the specific License Agreement associated with that asset's category and your revenue tier.</p>
        </div>
      </div>
    )
  },
  {
    id: 'privacy',
    title: 'Privacy & Data Protection',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Data Collection</h4>
          <p>We collect only the necessary data to provide our services: account information (email, name), transaction history, and download logs. We do not sell your personal data to third parties.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Payment Security</h4>
          <p>Payment processing is handled securely via PayPal. Mnostva Art does not store your full credit card or financial account details on our servers.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Your Rights (GDPR/CCPA)</h4>
          <p>You have the right to access, correct, or delete your personal data. You can request a full data export or account deletion by contacting <a href="mailto:legal@mnostva.art" className="text-pink-500 font-bold hover:underline">legal@mnostva.art</a>.</p>
        </div>
      </div>
    )
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p>We use cookies to improve your experience and ensure the security of our platform.</p>
        <ul className="list-disc pl-5 space-y-3">
          <li><strong>Essential Cookies:</strong> Required for login authentication, cart persistence, and secure checkout.</li>
          <li><strong>Functional Cookies:</strong> Used to remember your preferences, such as language or display settings.</li>
          <li><strong>Analytics:</strong> Anonymized usage data to help us understand which assets are popular and how we can improve the site.</li>
        </ul>
        <p className="text-xs text-gray-400">You can manage or disable cookies in your browser settings, though some site features may become unavailable.</p>
      </div>
    )
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p>All assets, designs, 3D models, textures, and custom shaders available on Mnostva Art are the exclusive intellectual property of <strong>Mnostva Art Studio</strong> unless otherwise specified.</p>
        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Ownership</h4>
          <p>Purchasing a license grants you the right to <strong>use</strong> the assets, not <strong>ownership</strong> of the original IP. All rights not expressly granted are reserved by Mnostva Art.</p>
        </div>
        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Copyright Infringement</h4>
          <p>We take IP protection seriously. If you believe your work has been copied in a way that constitutes copyright infringement, please submit a DMCA notice to <a href="mailto:dmca@mnostva.art" className="text-pink-500 font-bold hover:underline">dmca@mnostva.art</a>.</p>
        </div>
      </div>
    )
  },
  {
    id: 'refund',
    title: 'Refund & Cancellation',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p className="font-bold text-gray-900">Digital Good Policy: Due to the nature of digital assets, all sales are final once a download has been initiated.</p>
        
        <p>Refunds are only issued if:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>The asset has not been downloaded from our servers.</li>
          <li>The asset file is technically corrupt and cannot be fixed by our team.</li>
          <li>The asset description was demonstrably misleading.</li>
        </ul>

        <p className="text-pink-500 font-black text-xs uppercase tracking-wider border-t border-pink-100 pt-4">Requests must be submitted within 30 days of purchase.</p>
      </div>
    )
  }
];

export const LegalPage: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('licenses');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-sm font-black text-[#8a7db3] hover:text-pink-500 transition-colors uppercase tracking-widest"
        >
          <span>←</span> Back to Gallery
        </button>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Legal Center</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Guidelines, Licenses & Agreements</p>
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

        <div className="text-center mt-12 text-xs font-bold text-gray-400">
          Last updated: April 2026. Mnostva Art Studio.
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
