import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  COMPARISON_ROWS,
  KEY_POINTS,
  EULA_SECTIONS,
  ComparisonRow,
} from './legalData';

export const LegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'license' | 'eula' | 'policies'>('license');
  const [openEulaSection, setOpenEulaSection] = useState<number | null>(null);
  const [openPolicySection, setOpenPolicySection] = useState<string | null>('privacy');
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadEula = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/mnostva_art_eula.txt';
    link.download = 'mnostva_art_eula.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const renderStatusBadge = (status: ComparisonRow['personalStatus'], text: string) => {
    if (status === 'yes') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600 font-black text-xs">
          <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
          {text}
        </span>
      );
    }
    if (status === 'no') {
      return (
        <span className="inline-flex items-center gap-1 text-rose-500 font-black text-xs">
          <span className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-[10px]">✕</span>
          {text}
        </span>
      );
    }
    if (status === 'custom') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-600 font-black text-xs">
          <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">!</span>
          {text}
        </span>
      );
    }
    return <span className="text-gray-700 font-bold text-xs">{text}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-sm font-black text-[#8a7db3] hover:text-pink-500 transition-colors uppercase tracking-widest"
        >
          <span>←</span> Back to Gallery
        </button>

        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8a7db3]/10 text-[#8a7db3] text-xs font-black uppercase tracking-widest mb-4">
            Official Legal Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            Legal & Licensing
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-xl mx-auto">
            Everything you need to know about our licenses, commercial rights, EULA terms, and privacy protections.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 p-1.5 bg-white/80 backdrop-blur-md rounded-[2rem] border-2 border-gray-100 shadow-sm max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('license')}
            className={`flex-1 py-3 px-4 rounded-full font-black text-xs md:text-sm tracking-wide transition-all ${
              activeTab === 'license'
                ? 'bg-[#8a7db3] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🎮 Quick Comparison
          </button>
          <button
            onClick={() => setActiveTab('eula')}
            className={`flex-1 py-3 px-4 rounded-full font-black text-xs md:text-sm tracking-wide transition-all ${
              activeTab === 'eula'
                ? 'bg-[#8a7db3] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            📜 Full EULA Agreement
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`flex-1 py-3 px-4 rounded-full font-black text-xs md:text-sm tracking-wide transition-all ${
              activeTab === 'policies'
                ? 'bg-[#8a7db3] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            🛡️ Privacy & Policies
          </button>
        </div>

        {/* TAB 1: LICENSE COMPARISON AT A GLANCE */}
        {activeTab === 'license' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Intro Notice */}
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    🎮 License Comparison at a Glance
                  </h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">
                    Solo developers, studios, and agencies: understand your rights in seconds.
                  </p>
                </div>
                <button
                  onClick={handleDownloadEula}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isDownloading ? 'Downloading...' : 'Download EULA (.txt)'}
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-wider w-1/3">
                        Permissions & Rules
                      </th>
                      <th className="py-4 px-4 text-xs font-black text-blue-600 uppercase tracking-wider w-1/3 bg-blue-50/40 rounded-t-2xl">
                        Personal / Indie License
                      </th>
                      <th className="py-4 px-4 text-xs font-black text-purple-600 uppercase tracking-wider w-1/3 bg-purple-50/40 rounded-t-2xl">
                        Studio / Company License
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {COMPARISON_ROWS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-xs font-bold text-gray-800">
                          {row.permission}
                        </td>
                        <td className="py-3.5 px-4 bg-blue-50/20">
                          {renderStatusBadge(row.personalStatus, row.personal)}
                        </td>
                        <td className="py-3.5 px-4 bg-purple-50/20">
                          {renderStatusBadge(row.studioStatus, row.studio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Points Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {KEY_POINTS.map((card) => {
                const borderClass =
                  card.color === 'blue'
                    ? 'border-blue-200 bg-blue-50/30'
                    : card.color === 'purple'
                    ? 'border-purple-200 bg-purple-50/30'
                    : 'border-pink-200 bg-pink-50/30';
                const badgeClass =
                  card.color === 'blue'
                    ? 'bg-blue-100 text-blue-700'
                    : card.color === 'purple'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-pink-100 text-pink-700';

                return (
                  <div
                    key={card.id}
                    className={`rounded-[2rem] border-2 p-6 shadow-sm flex flex-col justify-between ${borderClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badgeClass}`}>
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="font-black text-gray-900 text-lg mb-4">{card.title}</h3>
                      <ul className="space-y-2.5 text-xs text-gray-600 font-medium leading-relaxed">
                        {card.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#8a7db3] font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom License Callout */}
            <div className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-[2.5rem] border-2 border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Need a Custom License?</h3>
                <p className="text-xs text-gray-600 font-medium max-w-xl leading-relaxed">
                  If you are planning mass physical manufacturing (toys, board games, 3D printing for sale), enterprise-wide custom terms, or AI dataset licensing, contact us at: <strong className="text-gray-900">support@mnostva.art</strong>.
                </p>
              </div>
              <a
                href="mailto:support@mnostva.art?subject=Custom%20License%20Inquiry"
                className="px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-full font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all shadow-md"
              >
                Contact: support@mnostva.art
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: FULL EULA AGREEMENT */}
        {activeTab === 'eula' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Document Header Box */}
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    End User License Agreement (EULA)
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-bold mt-2">
                    <span>Effective Date: September 1, 2026</span>
                    <span>•</span>
                    <span>Last Updated: September 1, 2026</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadEula}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {isDownloading ? 'Downloading...' : 'Download EULA (.txt)'}
                  </button>
                </div>
              </div>

              <div className="pt-6 text-sm text-gray-600 font-medium leading-relaxed space-y-4">
                <p>
                  This End User License Agreement (“<strong>Agreement</strong>” or “<strong>EULA</strong>”) is a legally binding contract between <strong>Mnostva Art Studio</strong> (“<strong>Mnostva Art</strong>,” “<strong>Licensor</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”) and the person or legal entity purchasing, downloading, accessing, or using any digital asset made available by Mnostva Art (“<strong>Licensee</strong>,” “<strong>you</strong>,” or “<strong>your</strong>”).
                </p>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-semibold">
                  By purchasing, downloading, accessing, installing, copying, or using any Asset, you confirm that you have read, understand, and agree to be bound by this Agreement. If you do not agree to these terms, you must not purchase, download, access, install, or use any Asset.
                </div>
              </div>
            </div>

            {/* Expand / Collapse Actions */}
            <div className="flex justify-end gap-3 px-2">
              <button
                onClick={() => setOpenEulaSection(openEulaSection !== null ? null : 1)}
                className="text-xs font-black text-[#8a7db3] hover:text-pink-500 uppercase tracking-widest transition-colors"
              >
                {openEulaSection !== null ? 'Collapse Opened' : 'Quick View First Section'}
              </button>
            </div>

            {/* EULA Sections Accordion */}
            <div className="space-y-4">
              {EULA_SECTIONS.map((sec) => {
                const isOpen = openEulaSection === sec.number;
                return (
                  <div
                    key={sec.id}
                    id={`section-${sec.number}`}
                    className={`bg-white rounded-[2rem] border-2 shadow-sm transition-all overflow-hidden ${
                      isOpen ? 'border-[#8a7db3] shadow-md' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setOpenEulaSection(isOpen ? null : sec.number)}
                      className="w-full px-8 py-6 flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs text-gray-600">
                          {sec.number}
                        </span>
                        <span className={`text-lg font-black transition-colors ${isOpen ? 'text-[#8a7db3]' : 'text-gray-900'}`}>
                          {sec.title}
                        </span>
                      </div>
                      <span className={`text-2xl font-black transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#8a7db3]' : 'text-gray-400'}`}>
                        +
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-8 pb-8 pt-2 border-t border-gray-50 text-sm text-gray-600 font-medium leading-relaxed space-y-4 animate-fadeIn">
                        {sec.content.intro && <p>{sec.content.intro}</p>}

                        {sec.content.bullets && (
                          <ul className="list-disc pl-5 space-y-2">
                            {sec.content.bullets.map((b, idx) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {sec.content.subsections && (
                          <div className="space-y-4 mt-2">
                            {sec.content.subsections.map((sub, idx) => (
                              <div key={idx} className="p-4 bg-gray-50/60 rounded-2xl border border-gray-100">
                                {sub.subtitle && (
                                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider mb-2">
                                    {sub.subtitle}
                                  </h4>
                                )}
                                <p className="text-xs text-gray-700 leading-relaxed">{sub.text}</p>
                                {sub.bullets && (
                                  <ul className="list-disc pl-5 space-y-1.5 mt-2 text-xs text-gray-600">
                                    {sub.bullets.map((sb, sidx) => (
                                      <li key={sidx}>{sb}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PRIVACY & GENERAL POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Privacy Policy */}
            <div className={`bg-white rounded-[2rem] border-2 shadow-sm transition-all overflow-hidden ${openPolicySection === 'privacy' ? 'border-[#8a7db3] shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
              <button
                onClick={() => setOpenPolicySection(openPolicySection === 'privacy' ? null : 'privacy')}
                className="w-full px-8 py-6 flex justify-between items-center text-left"
              >
                <span className={`text-xl font-black transition-colors ${openPolicySection === 'privacy' ? 'text-[#8a7db3]' : 'text-gray-900'}`}>
                  Privacy & Data Protection (GDPR / CCPA)
                </span>
                <span className={`text-2xl font-black transition-transform duration-300 ${openPolicySection === 'privacy' ? 'rotate-45 text-[#8a7db3]' : 'text-gray-400'}`}>
                  +
                </span>
              </button>
              {openPolicySection === 'privacy' && (
                <div className="px-8 pb-8 pt-2 border-t border-gray-50 space-y-6 text-gray-600 font-medium leading-relaxed text-sm animate-fadeIn">
                  <div>
                    <h4 className="font-black text-gray-900 text-base mb-1">Data Collection</h4>
                    <p>We collect only the minimum necessary data to provide our marketplace services: account details (email address, username, optional company name), transaction logs, and secure download records. We do not sell or monetize personal data.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-base mb-1">Payment Security</h4>
                    <p>Payments are processed exclusively through certified secure payment providers (PayPal / Stripe). Mnostva Art never stores your complete credit card or financial account numbers on our servers.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-base mb-1">EU & Global Consumer Rights</h4>
                    <p>Under the European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you retain the right to access, export, rectify, or request permanent erasure of your account and personal records. Submit all privacy requests to <a href="mailto:support@mnostva.art" className="text-pink-500 font-bold hover:underline">support@mnostva.art</a>.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cookie Policy */}
            <div className={`bg-white rounded-[2rem] border-2 shadow-sm transition-all overflow-hidden ${openPolicySection === 'cookies' ? 'border-[#8a7db3] shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
              <button
                onClick={() => setOpenPolicySection(openPolicySection === 'cookies' ? null : 'cookies')}
                className="w-full px-8 py-6 flex justify-between items-center text-left"
              >
                <span className={`text-xl font-black transition-colors ${openPolicySection === 'cookies' ? 'text-[#8a7db3]' : 'text-gray-900'}`}>
                  Cookie Policy
                </span>
                <span className={`text-2xl font-black transition-transform duration-300 ${openPolicySection === 'cookies' ? 'rotate-45 text-[#8a7db3]' : 'text-gray-400'}`}>
                  +
                </span>
              </button>
              {openPolicySection === 'cookies' && (
                <div className="px-8 pb-8 pt-2 border-t border-gray-50 space-y-6 text-gray-600 font-medium leading-relaxed text-sm animate-fadeIn">
                  <p>We use essential cookies and local storage tokens to ensure secure login authentication, cart persistence across sessions, and smooth checkout flow.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Essential Authentication:</strong> Required to keep you securely signed in to your account dashboard and library.</li>
                    <li><strong>Cart & Session Storage:</strong> Preserves items added to your cart until checkout is completed.</li>
                    <li><strong>Preference Settings:</strong> Remembers your view preferences and display modes.</li>
                  </ul>
                  <p className="text-xs text-gray-400">You can manage cookie permissions in your web browser preferences.</p>
                </div>
              )}
            </div>

            {/* Refund & Cancellation Policy */}
            <div className={`bg-white rounded-[2rem] border-2 shadow-sm transition-all overflow-hidden ${openPolicySection === 'refund' ? 'border-[#8a7db3] shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
              <button
                onClick={() => setOpenPolicySection(openPolicySection === 'refund' ? null : 'refund')}
                className="w-full px-8 py-6 flex justify-between items-center text-left"
              >
                <span className={`text-xl font-black transition-colors ${openPolicySection === 'refund' ? 'text-[#8a7db3]' : 'text-gray-900'}`}>
                  Refund & Cancellation Policy (EU Directive & Statutory Terms)
                </span>
                <span className={`text-2xl font-black transition-transform duration-300 ${openPolicySection === 'refund' ? 'rotate-45 text-[#8a7db3]' : 'text-gray-400'}`}>
                  +
                </span>
              </button>
              {openPolicySection === 'refund' && (
                <div className="px-8 pb-8 pt-2 border-t border-gray-50 space-y-6 text-gray-600 font-medium leading-relaxed text-sm animate-fadeIn">
                  <p className="font-bold text-gray-900">
                    Digital Product Delivery & Statutory Withdrawal:
                  </p>
                  <p>
                    In accordance with applicable statutory digital consumer protection laws (including EU Directive 2011/83/EU on Consumer Rights), the statutory 14-day right of withdrawal ceases once the digital content supply has begun with your prior express consent.
                  </p>
                  <p className="font-bold text-gray-900">Exceptions where refunds are granted:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>The purchased 3D file has a demonstrable, irreparable technical defect that renders it fundamentally inconsistent with its description, and our support team cannot rectify the issue within a reasonable timeframe.</li>
                    <li>The asset was purchased by error and has not been downloaded from our servers.</li>
                  </ul>
                  <p className="text-xs text-pink-500 font-bold uppercase tracking-wider border-t border-pink-100 pt-4">
                    Refund requests must be submitted to support@mnostva.art within 30 days of purchase.
                  </p>
                </div>
              )}
            </div>

            {/* Intellectual Property & DMCA */}
            <div className={`bg-white rounded-[2rem] border-2 shadow-sm transition-all overflow-hidden ${openPolicySection === 'ip' ? 'border-[#8a7db3] shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
              <button
                onClick={() => setOpenPolicySection(openPolicySection === 'ip' ? null : 'ip')}
                className="w-full px-8 py-6 flex justify-between items-center text-left"
              >
                <span className={`text-xl font-black transition-colors ${openPolicySection === 'ip' ? 'text-[#8a7db3]' : 'text-gray-900'}`}>
                  Intellectual Property & DMCA Copyright Notice
                </span>
                <span className={`text-2xl font-black transition-transform duration-300 ${openPolicySection === 'ip' ? 'rotate-45 text-[#8a7db3]' : 'text-gray-400'}`}>
                  +
                </span>
              </button>
              {openPolicySection === 'ip' && (
                <div className="px-8 pb-8 pt-2 border-t border-gray-50 space-y-6 text-gray-600 font-medium leading-relaxed text-sm animate-fadeIn">
                  <p>
                    All original 3D models, textures, shaders, rigs, animations, and visual assets are the exclusive intellectual property of <strong>Mnostva Art Studio</strong>.
                  </p>
                  <div>
                    <h4 className="font-black text-gray-900 text-base mb-1">Licensed, Not Sold</h4>
                    <p>
                      Purchasing a license conveys non-exclusive rights of use in accordance with the EULA. It does not transfer copyright or underlying intellectual property.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-base mb-1">DMCA & Copyright Infringement Claims</h4>
                    <p>
                      If you believe in good faith that any content hosted on Mnostva Art infringes your intellectual property, please submit an official DMCA notice with complete identification of the copyrighted work to <a href="mailto:support@mnostva.art" className="text-pink-500 font-bold hover:underline">support@mnostva.art</a>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center mt-16 text-xs font-bold text-gray-400">
          Last updated: September 1, 2026. Mnostva Art Studio • support@mnostva.art
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
