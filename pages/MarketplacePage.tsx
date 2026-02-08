
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';

interface MarketplacePageProps {
  onNavigateToLicense: () => void;
  onSelectProduct: (product: Product) => void;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigateToLicense, onSelectProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Room', 'Level', 'Prop', 'Full Pack'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filter === 'All' || p.category === filter;
      return matchesSearch && matchesFilter;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [searchQuery, filter, sortBy]);

  const activeSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label;

  return (
    <div className="min-h-screen bg-transparent pt-6 md:pt-10 pb-20 px-4">
      <ScrollReveal className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-16 text-center">
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-4 md:mb-6">
            The <span className="text-[#8a7db3]">Asset</span> Shop
          </h1>
          <p className="text-sm md:text-xl text-gray-500 font-bold max-w-2xl mx-auto uppercase tracking-tighter px-4">
            High-quality stylized 3D environments for your next masterpiece.
          </p>
        </div>

        {/* Optimized Filter Bar */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] p-3 md:p-6 mb-8 md:mb-12 shadow-2xl border-4 border-white flex flex-col lg:flex-row gap-3 md:gap-6 items-center relative z-50">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-[320px] shrink-0">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-2xl md:rounded-[2rem] px-10 md:px-12 py-3 md:py-4 font-black outline-none transition-all shadow-inner text-[#8a7db3] placeholder-[#8a7db3]/40 text-sm md:text-lg"
            />
            <svg className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#8a7db3]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Categories Filter - Fixed horizontal scroll */}
          <div className="w-full overflow-hidden flex-grow px-1">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`whitespace-nowrap px-4 md:px-6 py-2.5 md:py-3.5 rounded-full font-black text-[10px] md:text-xs transition-all uppercase tracking-widest flex-shrink-0 border-2 ${
                    filter === cat 
                      ? 'bg-[#8a7db3] text-white border-[#8a7db3] shadow-md scale-105' 
                      : 'bg-white text-gray-400 border-gray-100 hover:text-[#8a7db3] hover:border-[#8a7db3]/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Sort Dropdown */}
          <div className="w-full lg:w-[240px] shrink-0 relative" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`w-full flex items-center justify-between bg-white border-2 rounded-xl md:rounded-[1.5rem] px-5 md:px-6 py-3 md:py-4 font-black text-[10px] md:text-xs uppercase tracking-widest outline-none transition-all cursor-pointer text-[#8a7db3] shadow-sm ${
                isSortOpen ? 'border-[#8a7db3] ring-4 ring-[#8a7db3]/10' : 'border-gray-100 hover:border-[#8a7db3]/40'
              }`}
            >
              <span className="truncate mr-2">{activeSortLabel}</span>
              <svg 
                className={`w-3 h-3 md:w-4 md:h-4 shrink-0 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full right-0 left-0 lg:left-auto lg:w-64 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-[1.8rem] shadow-[0_20px_50px_rgba(138,125,179,0.3)] border-2 border-white overflow-hidden transition-all duration-300 transform origin-top z-[100] ${
              isSortOpen 
                ? 'opacity-100 scale-100 translate-y-0 visible' 
                : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
            }`}>
              <div className="p-1.5 md:p-2 space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[1.2rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${
                      sortBy === option.value 
                        ? 'bg-[#8a7db3] text-white' 
                        : 'text-gray-500 hover:bg-[#8a7db3]/10 hover:text-[#8a7db3]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 50}>
                <ProductCard 
                  product={product} 
                  onOpen={onSelectProduct}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 md:py-32 bg-white/30 rounded-[3rem] md:rounded-[4rem] border-4 border-dashed border-gray-200 mx-2">
            <div className="text-6xl md:text-8xl mb-6 text-gray-300">🔍</div>
            <h3 className="text-xl md:text-3xl font-black text-gray-400 uppercase tracking-tighter px-4">No assets found!</h3>
            <button 
              onClick={() => {setSearchQuery(''); setFilter('All');}}
              className="mt-6 text-[#8a7db3] font-black underline underline-offset-8 uppercase tracking-widest hover:text-pink-500 transition-colors text-xs md:text-base"
            >
              Clear all filters
            </button>
          </div>
        )}
      </ScrollReveal>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MarketplacePage;
