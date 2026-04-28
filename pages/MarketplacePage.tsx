
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import { productService } from '../services/productService';

interface MarketplacePageProps {
  onNavigateToLicense: () => void;
  onSelectProduct: (product: Product) => void;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigateToLicense, onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [advancedFilters, setAdvancedFilters] = useState({
    rigged: false,
    animated: false,
    polyCount: '',
    textures: ''
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filter, sortBy, advancedFilters]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = { limit, page, sortBy };
        
        if (filter !== 'All') params.category = filter;
        if (searchQuery) params.search = searchQuery;
        if (advancedFilters.rigged) params.rigged = 'true';
        if (advancedFilters.animated) params.animated = 'true';
        if (advancedFilters.polyCount) params.polyCount = advancedFilters.polyCount;
        if (advancedFilters.textures) params.textures = advancedFilters.textures;

        const response: any = await productService.getAllProducts(params);

        // Map backend products to frontend Product type
        const mappedProducts: Product[] = (response.data || []).map((p: any) => ({
          id: p.id,
          name: p.title,
          price: p.price / 100, // Convert cents to dollars
          category: p.category,
          imageUrl: p.previewImageKey ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${p.previewImageKey}` : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
          description: p.description,
          tags: [p.category || 'Asset', '3D Model'],
          features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? (p.features as string).split(',').filter(Boolean) : []),
          packContent: Array.isArray(p.packContent) ? p.packContent : (typeof p.packContent === 'string' ? (p.packContent as string).split(',').filter(Boolean) : []),
          compatibility: Array.isArray(p.compatibility) ? p.compatibility : (typeof p.compatibility === 'string' ? (p.compatibility as string).split(',').filter(Boolean) : []),
          technicalSpecs: p.technicalSpecs || {},
          externalLinks: p.externalLinks || {},
          discount: p.discount,
          galleryImages: p.galleryImages || [],
          previewImageKey: p.previewImageKey,
          updatedAt: p.updatedAt
        }));

        setProducts(mappedProducts);
        setTotalPages(Math.ceil((response.total || 0) / limit));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a slight debounce for search query
    const debounceTimeout = setTimeout(() => {
        fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [page, limit, filter, searchQuery, sortBy, advancedFilters]);

  const categories = ['All', 'Room', 'Level', 'Prop', 'Full Pack', 'Weapons'];

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
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <aside className="bg-white/90 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] p-3 md:p-6 mb-8 md:mb-12 shadow-2xl border-4 border-white flex flex-col lg:flex-row gap-3 md:gap-6 items-center relative z-50">

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

          {/* Custom Category Dropdown */}
          <div className="w-full lg:w-[240px] shrink-0 relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full flex items-center justify-between bg-white border-2 rounded-xl md:rounded-[1.5rem] px-5 md:px-6 py-3 md:py-4 font-black text-[10px] md:text-xs uppercase tracking-widest outline-none transition-all cursor-pointer shadow-sm ${isFilterOpen ? 'border-[#8a7db3] ring-4 ring-[#8a7db3]/10 text-[#8a7db3]' : 'border-gray-100 hover:border-[#8a7db3]/40 text-gray-600'
                }`}
            >
              <span className="truncate mr-2 font-bold text-[#8a7db3]">
                {filter === 'All' ? 'All Categories' : filter}
              </span>
              <svg
                className={`w-3 h-3 md:w-4 md:h-4 shrink-0 transition-transform duration-300 ${isFilterOpen ? 'rotate-180 text-[#8a7db3]' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 right-0 lg:w-64 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-[1.8rem] shadow-[0_20px_50px_rgba(138,125,179,0.3)] border-2 border-white overflow-hidden transition-all duration-300 transform origin-top z-[100] ${isFilterOpen
              ? 'opacity-100 scale-100 translate-y-0 visible'
              : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
              }`}>
              <div className="p-1.5 md:p-2 space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilter(cat);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[1.2rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${filter === cat
                      ? 'bg-[#8a7db3] text-white'
                      : 'text-gray-500 hover:bg-[#8a7db3]/10 hover:text-[#8a7db3]'
                      }`}
                  >
                    {cat === 'All' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          {/* <button
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className={`whitespace-nowrap px-4 py-2.5 md:py-3.5 rounded-full font-black text-[10px] md:text-xs transition-all uppercase tracking-widest border-2 flex items-center gap-2 ${isAdvancedFiltersOpen ? 'bg-pink-100 text-pink-600 border-pink-200 shadow-inner' : 'bg-white text-gray-400 border-gray-100 hover:text-pink-500 hover:border-pink-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Filters
          </button> */}

          {/* Custom Sort Dropdown */}
          <div className="w-full lg:w-[240px] shrink-0 relative" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`w-full flex items-center justify-between bg-white border-2 rounded-xl md:rounded-[1.5rem] px-5 md:px-6 py-3 md:py-4 font-black text-[10px] md:text-xs uppercase tracking-widest outline-none transition-all cursor-pointer text-[#8a7db3] shadow-sm ${isSortOpen ? 'border-[#8a7db3] ring-4 ring-[#8a7db3]/10' : 'border-gray-100 hover:border-[#8a7db3]/40'
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
            <div className={`absolute top-full right-0 left-0 lg:left-auto lg:w-64 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-[1.8rem] shadow-[0_20px_50px_rgba(138,125,179,0.3)] border-2 border-white overflow-hidden transition-all duration-300 transform origin-top z-[100] ${isSortOpen
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
                    className={`w-full text-left px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[1.2rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${sortBy === option.value
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
        </aside>

        {/* {isAdvancedFiltersOpen && (
          <ScrollReveal className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-6 mb-8 md:mb-12 shadow-md border-4 border-white max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              <div>
                <label className="block text-[10px] pb-2 font-black text-gray-400 uppercase tracking-widest">Poly Count</label>
                <select
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold text-sm text-[#8a7db3] outline-none transition-all cursor-pointer"
                  value={advancedFilters.polyCount}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, polyCount: e.target.value }))}
                >
                  <option value="">Any</option>
                  <option value="Low-poly">Low-poly</option>
                  <option value="Mid-poly">Mid-poly</option>
                  <option value="High-poly">High-poly</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] pb-2 font-black text-gray-400 uppercase tracking-widest">Textures</label>
                <select
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8a7db3] rounded-xl px-4 py-3 font-bold text-sm text-[#8a7db3] outline-none transition-all cursor-pointer"
                  value={advancedFilters.textures}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, textures: e.target.value }))}
                >
                  <option value="">Any</option>
                  <option value="Untextured">Untextured</option>
                  <option value="PBR">PBR</option>
                  <option value="Hand-painted">Hand-painted</option>
                </select>
              </div>
              <div className="flex items-center gap-3 lg:mt-6">
                <input
                  type="checkbox"
                  id="riggedToggle"
                  className="w-5 h-5 accent-[#8a7db3] cursor-pointer"
                  checked={advancedFilters.rigged}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, rigged: e.target.checked }))}
                />
                <label htmlFor="riggedToggle" className="text-xs font-black text-gray-700 uppercase tracking-widest cursor-pointer select-none">Rigged</label>
              </div>
              <div className="flex items-center gap-3 lg:mt-6">
                <input
                  type="checkbox"
                  id="animatedToggle"
                  className="w-5 h-5 accent-[#8a7db3] cursor-pointer"
                  checked={advancedFilters.animated}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, animated: e.target.checked }))}
                />
                <label htmlFor="animatedToggle" className="text-xs font-black text-gray-700 uppercase tracking-widest cursor-pointer select-none">Animated</label>
              </div>
            </div>
          </ScrollReveal>
        )} */}

        {products.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 50}>
                <ProductCard
                  product={product}
                  onOpen={onSelectProduct}
                />
              </ScrollReveal>
            ))}
          </section>
        ) : !loading && (
          <div className="text-center py-20 md:py-32 bg-white/30 rounded-[3rem] md:rounded-[4rem] border-4 border-dashed border-gray-200 mx-2">
            <div className="text-6xl md:text-8xl mb-6 text-gray-300">🔍</div>
            <h3 className="text-xl md:text-3xl font-black text-gray-400 uppercase tracking-tighter px-4">No assets found!</h3>
            <button
              onClick={() => { setSearchQuery(''); setFilter('All'); }}
              className="mt-6 text-[#8a7db3] font-black underline underline-offset-8 uppercase tracking-widest hover:text-pink-500 transition-colors text-xs md:text-base"
            >
              Clear all filters
            </button>
          </div>
        )
        }

        {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 font-black text-sm uppercase tracking-widest bg-white border-2 border-gray-100 rounded-full hover:border-[#8a7db3]/40 hover:text-[#8a7db3] disabled:opacity-50 transition-all shadow-sm"
                >
                  ← Prev
                </button>
                <div className="font-bold text-gray-500 text-sm">
                  Page {page} of {totalPages}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 font-black text-sm uppercase tracking-widest bg-white border-2 border-gray-100 rounded-full hover:border-[#8a7db3]/40 hover:text-[#8a7db3] disabled:opacity-50 transition-all shadow-sm"
                >
                  Next →
                </button>
            </div>
        )}
      </ScrollReveal >

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div >
  );
};

export default MarketplacePage;
