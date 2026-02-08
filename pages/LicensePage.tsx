
import React from 'react';
import ScrollReveal from '../components/ScrollReveal';

interface LicensePageProps {
  onBack: () => void;
}

const LicensePage: React.FC<LicensePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen pt-10 pb-20 px-4">
      <ScrollReveal className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          ← Back to Shop
        </button>

        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border-b-8 border-black/10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
            One-time Purchase <br/>
            <span className="text-pink-500">License Agreement</span>
          </h1>

          <div className="prose prose-pink max-w-none text-gray-600 font-medium space-y-8">
            <section>
              <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-tight">1. Overview</h2>
              <p>
                This License Agreement is a legal agreement between you (the "Licensee") and Mnostva Art ("Licensor") for the 3D assets, levels, and environments (the "Product") purchased through our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-tight">2. Grant of License</h2>
              <p>
                Licensor grants you a non-exclusive, worldwide, perpetual license to use the Product as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Integrate the Product into your commercial or personal software, games, and media projects.</li>
                <li>Distribute the Product as an integrated part of your project (binary form).</li>
                <li>Modify the Product to fit your project's specific aesthetic or technical requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-tight">3. Restrictions</h2>
              <p>
                You may NOT:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Sell, rent, or distribute the Product as standalone assets or in an asset library.</li>
                <li>Claim the Product as your own original creation.</li>
                <li>Use the Product in any way that facilitates the creation of a competing asset library.</li>
                <li>Sub-license the original files to third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-tight">4. Ownership</h2>
              <p>
                Mnostva Art retains all rights, title, and interest in and to the Product. This license is a right to use, not a transfer of ownership.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-tight">5. Termination</h2>
              <p>
                This license is effective until terminated. Your rights under this license will terminate automatically if you fail to comply with any terms of this agreement.
              </p>
            </section>

            <div className="mt-12 p-8 bg-pink-50 rounded-3xl border-2 border-pink-100 italic">
              "We make art so you can make magic. Follow the rules, and keep creating beautiful worlds!" — The Mnostva Art Team 🌈
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default LicensePage;
