
import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import ScrollReveal from './ScrollReveal';
import { productService } from '../services/productService';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const categories = ['All', 'Room', 'Level', 'Prop', 'Full Pack'];

  useEffect(() => {
    const fetchProducts = async () => {
      if (limit) {
        try {
          // Fetch latest products from backend for "Latest Releases"
          const backendProducts = await productService.getAllProducts({ limit, sortBy: 'newest' });
          const mappedProducts: Product[] = backendProducts.map((p: any) => ({
            id: p.id,
            name: p.title,
            price: p.price / 100,
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
            previewImageKey: p.previewImageKey
          }));
          setProducts(mappedProducts);
        } catch (error) {
          console.error("Failed to fetch latest products", error);
          // Fallback to constants if backend fails
          setProducts(PRODUCTS.slice(0, limit));
        }
      } else {
        // Use constants or fetch all for full marketplace view (assuming full fetch logic is elsewhere or simplified here)
        // For this component, if no limit (full marketplace page uses its own fetch), let's fallback to passed products or constants for now to not break "MarketplacePage" logic if it reuses this.
        // Actually MarketplacePage doesn't use this component, it has its own logic. This component is used on Home Page only mainly.
        // If used without limit, let's just use constants for safety or fetch all as well.
        setProducts(PRODUCTS);
      }
    };

    fetchProducts();
  }, [limit]);

  // Client-side filtering only applies if NOT unlimited (home page typically doesn't filter, full page does)
  // But if we fetched limited from backend, they are already "the latest". Filtering might not make sense on Home Page "Latest" section if we just want 3 newest.
  // If we want filtering on Home Page, we'd need to fetch more or filter nicely.
  // Current logic for "Latest Releases" is just show 3. Filtering only if user clicks filter buttons (which show only if !limit).

  let displayProducts = products;
  if (!limit && filter !== 'All') {
    displayProducts = products.filter(p => p.category === filter);
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
                className={`px-8 py-3 rounded-full font-black transition-all ${filter === cat
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
          {displayProducts.map((product, index) => (
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
