
import React, { useState } from 'react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import ScrollReveal from './ScrollReveal';

interface MarketplaceProps {
  title?: string;
  limit?: number;
  onSeeAll?: () => void;
  onNavigateToLicense?: () => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ 
  title = "The Marketplace", 
  limit, 
  onSeeAll,
  onNavigateToLicense
}) => {
  const [filter, setFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const categories = ['All', 'Room', 'Level', 'Prop', 'Full Pack'];

  let filteredProducts = filter === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === filter);

  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }

  return (
    <section id="marketplace" className="py-20 px-4 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {title.split(' ').slice(0, -1).join(' ')} <span className="text-pink-500">{title.split(' ').pop()}</span>
          </h2>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto">
            Instant downloads of professional stylized 3D assets. Game-ready, optimized, and full of character.
          </p>
        </div>

        {!limit && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded-full font-black transition-all ${
                  filter === cat 
                    ? 'bg-[#8a7db3] text-white shadow-xl scale-110' 
                    : 'bg-white text-gray-600 hover:bg-pink-50 border-2 border-transparent hover:border-pink-100 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 100}>
              <ProductCard 
                product={product} 
                onOpen={(p) => setSelectedProduct(p)}
              />
            </ScrollReveal>
          ))}
        </div>

        {onSeeAll && (
          <div className="mt-16 text-center">
            <button 
              onClick={onSeeAll}
              className="bg-white text-[#8a7db3] border-4 border-[#8a7db3] px-12 py-4 rounded-full font-black text-xl hover:bg-[#8a7db3] hover:text-white transition-all shadow-xl hover:translate-y-[-4px]"
            >
              See All Assets →
            </button>
          </div>
        )}
      </ScrollReveal>

      {/* Detailed View Modal */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onNavigateToLicense={onNavigateToLicense}
      />
    </section>
  );
};

export default Marketplace;
