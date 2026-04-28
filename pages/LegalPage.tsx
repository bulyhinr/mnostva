import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const sections = [
  {
    id: 'licenses',
    title: 'Type of Licenses',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p>We offer two types of licenses:</p>
        
        <div>
          <h4 className="font-black text-gray-900 text-base mb-2 uppercase tracking-wide">1. One-Time Purchase License</h4>
          <p className="mb-2">This license applies to all paid asset packs. As the name suggests, it is granted upon the one-time purchase of individual assets. Under this license, you receive:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Perpetual rights to use the purchased asset packs</li>
            <li>Permission to use the assets in commercial projects</li>
            <li>The right to include the assets in an unlimited number of your projects</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400 italic">By purchasing and/or downloading these assets, you agree to the terms of our One-Time Purchase License Agreement.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-2 uppercase tracking-wide">2. Free Asset Usage Policy</h4>
          <p className="mb-2">This license applies to all assets in the Free category. By downloading free assets, you receive:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A perpetual, worldwide, non-exclusive license to use the assets</li>
            <li>The right to create an unlimited number of Final Products</li>
            <li>Permission to include the assets in both personal and commercial projects</li>
          </ul>
          <p className="mt-3 font-bold text-pink-500 uppercase tracking-wide text-xs">However, the following is strictly prohibited:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1 text-gray-500">
            <li>Redistributing the assets "as-is" (even for free)</li>
            <li>Modifying and distributing derivative works outside of a Final Product</li>
            <li>Using the assets in on-demand or do-it-yourself services</li>
          </ul>
          <p className="mt-2 text-xs text-gray-400 italic">By downloading these assets, you agree to the terms of our Free Asset Usage Policy.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">If you have any questions about our licenses or need additional information, please contact our support team at <a href="mailto:support@mnostva.art" className="text-pink-500 hover:underline">support@mnostva.art</a>.</p>
        </div>
      </div>
    )
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Who we are</h4>
          <p>Our website address is: <a href="https://mnostva.art" className="text-pink-500 hover:underline font-bold">https://mnostva.art</a>.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Comments</h4>
          <p>When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.</p>
          <p className="mt-2">An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Cookies</h4>
          <p>If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</p>
          <p className="mt-2">When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Data Collection & E-commerce</h4>
          <p>We collect information about you during the checkout process on our store. This includes your name, email address, payment details, and browsing history. We use this to fulfill orders, prevent fraud, and comply with tax laws.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Account Deletion</h4>
          <p>In accordance with the General Data Protection Regulation (GDPR), you have the right to request the deletion of your account and all associated personal data.</p>
          <p className="mt-2">Please send your account deletion request to <a href="mailto:support@mnostva.art" className="text-pink-500 font-bold hover:underline">support@mnostva.art</a>. We process requests within 7 business days.</p>
        </div>
      </div>
    )
  },
  {
    id: 'tos',
    title: 'Terms of Service',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">Overview</h4>
          <p>This website is operated by Mnostva Art. Throughout the site, the terms "we", "us" and "our" refer to Mnostva Art. By visiting our site and/or purchasing from us, you engage in our "Service" and agree to be bound by the following terms and conditions.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">1. Account and Registration</h4>
          <p>You must be at least 13 years old to create an account. You are responsible for all activities that occur under your account credentials and for keeping them confidential.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">2. Prohibited Activities</h4>
          <p>You are prohibited from using the site or its content for any unlawful purpose, to infringe upon intellectual property rights, to distribute malware, or to scrape site data.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">3. Modifications to Service</h4>
          <p>Prices for our products are subject to change without notice. We reserve the right to modify or discontinue the Service at any time without liability.</p>
        </div>

        <div>
          <h4 className="font-black text-gray-900 text-base mb-1">4. Governing Law</h4>
          <p>These Terms of Service shall be governed by and construed in accordance with local consumer protection guidelines.</p>
        </div>
      </div>
    )
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    content: (
      <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-sm">
        <p className="font-bold text-gray-900">We stand behind our products and it is important to us that you are satisfied with them. However, because our products are digital goods delivered online, we do not normally issue refunds.</p>
        
        <p>If you change your mind about your purchase and have not downloaded our product, we will gladly refund your money upon your request.</p>

        <p>Refund requests made after you have downloaded our product are handled on a case-by-case basis and issued at our sole discretion. When evaluating a solution, we check whether the available assets, animations, and file formats match the product description in the store.</p>

        <p className="text-pink-500 font-black text-xs uppercase tracking-wider">Refund requests must be submitted within thirty (30) days of the original purchase.</p>
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
