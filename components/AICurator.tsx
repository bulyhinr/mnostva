
import React, { useState } from 'react';
import { getCreativeRecommendation } from '../services/geminiService';
import { Recommendation } from '../types';
import ScrollReveal from './ScrollReveal';

const AICurator: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  const handleSuggest = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const recommendation = await getCreativeRecommendation(input);
      setResult(recommendation);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="curator" className="py-20 px-4 bg-purple-900 text-white relative overflow-hidden rounded-[4rem] mx-4 mb-20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
      
      <ScrollReveal className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Can't Find Your Style?</h2>
        <p className="text-purple-200 mb-10 text-lg">
          Let our AI Creative Curator help you brainstorm a unique stylized environment for your next project.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., A cozy underwater kitchen for a mermaid..."
            className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:border-pink-400 transition-all"
          />
          <button
            onClick={handleSuggest}
            disabled={loading}
            className="bg-white text-purple-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-pink-50 transition-all disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Generate Idea'}
          </button>
        </div>

        {result && (
          <div className="glass-card text-left p-8 rounded-3xl border-white/10 animate-in fade-in zoom-in duration-500">
            <h3 className="text-3xl font-bold mb-4 text-pink-300">{result.title}</h3>
            <p className="text-lg text-gray-100 mb-6">{result.description}</p>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-bold text-sm uppercase tracking-wider text-purple-300">Suggested Palette:</span>
              <div className="flex gap-2">
                {result.suggestedColors.map((color, idx) => (
                  <div 
                    key={idx} 
                    className="w-8 h-8 rounded-full border border-white/20 shadow-lg"
                    style={{ backgroundColor: color }}
                    title={color}
                  ></div>
                ))}
              </div>
              <div className="ml-auto">
                <span className="bg-pink-500/30 text-pink-200 px-4 py-1 rounded-full text-sm font-bold border border-pink-500/50">
                  {result.theme}
                </span>
              </div>
            </div>
          </div>
        )}
      </ScrollReveal>
    </section>
  );
};

export default AICurator;
