import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart, calculateDiscountedPrice } from '../context/CartContext';
import ScrollReveal from '../components/ScrollReveal';
import ImageWithFallback from '../components/ImageWithFallback';
import { reviewsService } from '../services/reviewsService';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { MAINTENANCE_MODE } from '../constants';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'shadow-intensity'?: string;
        'environment-image'?: string;
      };
    }
  }
}

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onNavigateToLicense: () => void;
}


const StoreIcons = {
  unity: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 1.5L2 7.23v10.54L12 23.5l10-5.73V7.23L12 1.5zm0 2.29l8.03 4.6L12 13.01 3.97 8.39 12 3.79zM3.97 10.7l7.03 4.02v8.13l-7.03-4.04V10.7zM13 22.85v-8.13l7.03-4.02v8.11L13 22.85z" />
    </svg>
  ),
  fab: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm7.33 14.57L12 20.57l-7.33-4V7.43L12 3.43l7.33 4v9.14zM10.5 8h4v2h-4v2h3v2h-3v4H9V8h1.5z" />
    </svg>
  ),
  cgtrader: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm8 14.12l-8 4-8-4V7.88l8-4 8 4v8.24zM12 15l-4-2v-4l4 2 4-2v4l-4 2z" />
    </svg>
  ),
  artstation: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M1.77 19.3L5 20.4l8.3-14.4L11.6 3.4l-9.8 15.9zm13.3-13.1l-1.3 2.1 6.8 11.8 1.7-1.1-7.2-12.8zm-2.4 8.7l-4.2 7.2h12.8l-1.5-2.6H11.5l-1.5-2.6h2.7l-1.4-2.4-1.4 2.4h2.7z" />
    </svg>
  ),
  superhive: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2L22 7.77v8.46L12 22l-10-5.77V7.77L12 2zM12 4.31L4 8.93v6.14l8 4.62 8-4.62V8.93l-8-4.62z"/>
    </svg>
  )
};

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onNavigateToLicense }) => {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    reviewsService.getByProduct(product.id).then(setReviews).catch(console.error);
    reviewsService.getStats(product.id).then(setStats).catch(console.error);

    if (user) {
      wishlistService.checkStatus(product.id, localStorage.getItem('accessToken') || '')
        .then(res => setIsWishlisted(res.inWishlist)).catch(console.error);
    }
  }, [product.id, user]);

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to create a wishlist!', {
        style: { borderRadius: '1rem', background: '#333', color: '#fff' }
      });
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await wishlistService.toggle(product.id, token);
      if (res.status === 'added') {
        setIsWishlisted(true);
        toast.success('Added to wishlist ❤️', {
          style: { borderRadius: '1rem', background: '#333', color: '#fff' }
        });
      } else {
        setIsWishlisted(false);
        toast.success('Removed from wishlist 💔', {
          style: { borderRadius: '1rem', background: '#333', color: '#fff' }
        });
      }
    } catch (e) {
      toast.error('Failed to update wishlist');
    }
  };

  const getStorageUrl = (key?: string) => {
    if (!key) return '';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? 'http://localhost:3001/api' : (import.meta.env.VITE_API_URL || '');
    if (key.startsWith('public/')) {
      return `${baseUrl}/storage/${key}`;
    }
    return `${baseUrl}/storage/public/${key}`;
  };

  const mainImageUrl = product.previewImageKey
    ? getStorageUrl(product.previewImageKey)
    : (product.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800');

  const modelViewerUrl = product.previewModelKey ? getStorageUrl(product.previewModelKey) : null;

  const getSketchfabEmbedUrl = (input?: string) => {
    if (!input) return null;
    const match = input.match(/([a-fA-F0-9]{32})/);
    const id = match ? match[1] : input.trim();
    if (!id || id.length < 5) return null;
    return `https://sketchfab.com/models/${id}/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=1`;
  };
  const sketchfabEmbedUrl = getSketchfabEmbedUrl(product.externalLinks?.sketchfab);
 
  const getYoutubeEmbedUrls = (youtubeInput?: string | string[]) => {
    if (!youtubeInput) return [];
    const urls = Array.isArray(youtubeInput) ? youtubeInput : [youtubeInput];
    return urls
      .map(url => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/shorts/')) {
          videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
        } else if (url.includes('embed/')) {
          videoId = url.split('embed/')[1].split('?')[0];
        }
        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
      })
      .filter(Boolean) as string[];
  };
  const youtubeEmbedUrls = getYoutubeEmbedUrls(product.externalLinks?.youtube);
  const isYoutubeEmbedUrl = (url: string) => url.startsWith('https://www.youtube.com/embed/');

  const galleryImages = [
    sketchfabEmbedUrl,
    ...youtubeEmbedUrls,
    modelViewerUrl,
    mainImageUrl,
    ...(Array.isArray(product.galleryImages) ? product.galleryImages : []).map(key => getStorageUrl(key))
  ].filter(Boolean) as string[];

  const [isSparkling, setIsSparkling] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(sketchfabEmbedUrl || youtubeEmbedUrls[0] || modelViewerUrl || mainImageUrl);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset zoom when changing images
  useEffect(() => {
    setZoomLevel(1);
  }, [activeImage]);

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => prev === 1 ? 2.5 : 1);
  };

  useEffect(() => {
    setActiveImage(sketchfabEmbedUrl || youtubeEmbedUrls[0] || modelViewerUrl || mainImageUrl);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [product, sketchfabEmbedUrl, youtubeEmbedUrls.join(','), modelViewerUrl, mainImageUrl]);

  const derivedLicense = user?.userType === 'company' && product.commercialPrice ? 'commercial' : 'standard';
  const basePrice = derivedLicense === 'commercial' && product.commercialPrice ? product.commercialPrice : product.price;
 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
 
      if (e.key === 'ArrowRight') {
        const currentIndex = galleryImages.findIndex(img => img === activeImage);
        const nextIndex = (currentIndex + 1) % galleryImages.length;
        setActiveImage(galleryImages[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = galleryImages.findIndex(img => img === activeImage);
        const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        setActiveImage(galleryImages[prevIndex]);
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
 
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeImage, galleryImages]);
 
  const isInCart = cart.some(item => item.id === product.id && (item.licenseType || 'standard') === derivedLicense);

  const handleAddToCart = () => {
    if (isInCart) return;
    if (MAINTENANCE_MODE && !user?.isAdmin) {
      toast.error('Shop is temporarily paused. Please check back later!', {
        style: { borderRadius: '1rem', background: '#333', color: '#fff' }
      });
      return;
    }
    setIsSparkling(true);
    addToCart(product, quantity, derivedLicense);
    setTimeout(() => {
      setIsSparkling(false);
    }, 800);
  };



  const hasExternalLinks = Object.entries(product.externalLinks || {}).some(([key, url]) => !!url && key !== 'youtube');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="min-h-screen pt-10 pb-20 px-4">
      <Helmet>
        <title>{product.name} | Mnostva Art</title>
        <meta name="description" content={product.description ? product.description.substring(0, 160) : ''} />
        <meta property="og:title" content={`${product.name} | Mnostva Art`} />
        <meta property="og:description" content={product.description ? product.description.substring(0, 160) : ''} />
        <meta property="og:image" content={mainImageUrl} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": galleryImages,
            "description": product.description,
            "sku": product.id,
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "USD",
              "price": product.discount && product.discount.isActive
                ? calculateDiscountedPrice(product.price, product.discount.percentage)
                : product.price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "https://schema.org/InStock"
            },
            ...(stats.count > 0 && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": stats.average,
                "reviewCount": stats.count
              }
            })
          })}
        </script>
      </Helmet>
      <ScrollReveal className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          ← Back to Shop
        </button>

        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-b-8 border-black/10">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-3/5 p-8 lg:p-12">
              <div
                className="relative rounded-t-[2.5rem] overflow-hidden shadow-xl aspect-[3/2] mb-8 group bg-gray-50"
              >
                {activeImage === sketchfabEmbedUrl ? (
                  <div className="w-full h-full relative group bg-black/5 flex items-center justify-center">
                    <iframe
                      title="Sketchfab Viewer"
                      src={sketchfabEmbedUrl}
                      className="w-full h-full border-0 absolute top-0 left-0"
                      allow="autoplay; fullscreen; vr"
                    ></iframe>
                  </div>
                ) : isYoutubeEmbedUrl(activeImage) ? (
                  <div className="w-full h-full relative group bg-black">
                    <iframe
                      title="YouTube Video"
                      src={activeImage}
                      className="w-full h-full border-0 absolute top-0 left-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : activeImage === modelViewerUrl ? (
                  <div className="w-full h-full relative group">
                    {/* @ts-ignore */}
                    <model-viewer
                      src={modelViewerUrl}
                      auto-rotate
                      camera-controls
                      shadow-intensity="1"
                      environment-image="neutral"
                      camera-orbit="0deg 75deg 85%"
                      min-camera-orbit="auto auto 1%"
                      style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
                    >
                      {/* @ts-ignore */}
                    </model-viewer>
                    <div
                      className="absolute top-4 right-4 z-10 cursor-zoom-in bg-white/95 p-3 rounded-full shadow-2xl text-[#8a7db3] hover:scale-110 transition-transform duration-300"
                      onClick={() => setIsLightboxOpen(true)}
                      title="Fullscreen View"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-full cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                      <ImageWithFallback
                        key={activeImage}
                        src={activeImage}
                        alt={product.name}
                        className="w-full h-full object-cover animate-in fade-in zoom-in duration-700 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px]">
                        <div className="bg-white/95 p-6 rounded-full shadow-2xl text-[#8a7db3] scale-75 group-hover:scale-100 transition-all duration-500">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-wrap gap-2 pointer-events-none max-w-[calc(100%-2rem)]">
                  <span className="bg-[#8a7db3] px-4 py-2 rounded-[1rem] text-[10px] md:text-xs font-black text-white shadow-xl uppercase tracking-widest max-w-full break-words text-center line-clamp-2">
                    {product.category}
                  </span>
                  {product.technicalSpecs?.animated && (
                    <span className="bg-[#a2c367] text-white px-4 py-2 rounded-[1rem] text-[10px] md:text-xs font-black shadow-xl uppercase tracking-widest shrink-0">
                      ANIMATED
                    </span>
                  )}
                  {product.isActive === false && (
                    <span className="bg-gray-800 text-white px-4 py-2 rounded-[1rem] text-[10px] md:text-xs font-black shadow-xl uppercase tracking-widest shrink-0">
                      UNLISTED / OFF
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`aspect-video rounded-2xl overflow-hidden bg-gray-100 border-2 transition-all cursor-pointer group hover:scale-105 active:scale-95 flex items-center justify-center ${activeImage === imgUrl ? 'border-[#8a7db3] shadow-lg shadow-[#8a7db3]/20' : 'border-transparent hover:border-[#8a7db3]/40'
                      }`}
                  >
                    {imgUrl === sketchfabEmbedUrl ? (
                      <div className={`w-full h-full flex items-center justify-center bg-sky-50 transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`}>
                        <span className="flex items-center justify-center text-sky-500" title="Sketchfab 3D View">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </span>
                      </div>
                    ) : isYoutubeEmbedUrl(imgUrl) ? (
                      <div className={`w-full h-full flex items-center justify-center bg-red-50 transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`}>
                        <span className="flex items-center justify-center text-red-500" title="YouTube Video">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                        </span>
                      </div>
                    ) : imgUrl === modelViewerUrl ? (
                      <div className={`w-full h-full flex items-center justify-center bg-purple-50 transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`}>
                        <span className="text-3xl" title="WebGL 3D View">🧊</span>
                      </div>
                    ) : (
                      <ImageWithFallback
                        src={imgUrl}
                        alt={`Gallery ${idx}`}
                        className={`w-full h-full object-cover transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {product.packContent && product.packContent.length > 0 && (
                  <div className="bg-pink-50/50 p-8 rounded-[2.5rem] border-2 border-pink-100 shadow-inner">
                    <h4 className="text-lg font-black text-pink-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                      <span className="text-2xl">📦</span> Pack Content
                    </h4>
                    <ul className="space-y-3">
                      {product.packContent.map((item, idx) => (
                        <li key={idx} className="text-gray-700 font-medium text-lg flex gap-3">
                          <span className="text-pink-300">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.compatibility && product.compatibility.length > 0 && (
                  <div className="bg-[#8a7db3]/5 p-8 rounded-[2.5rem] border-2 border-[#8a7db3]/10 shadow-inner">
                    <h4 className="text-lg font-black text-[#8a7db3] uppercase tracking-widest mb-6 flex items-center gap-3">
                      <span className="text-2xl">🎮</span> Compatibility
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {product.compatibility.map((engine, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-white px-4 py-2.5 md:px-5 md:py-2 rounded-[1.25rem] text-xs md:text-sm font-black text-gray-600 border-2 border-gray-50 shadow-sm uppercase tracking-tight">
                          {engine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                  <div className="bg-[#a2c367]/5 p-8 rounded-[2.5rem] border-2 border-[#a2c367]/10 shadow-inner">
                    <h4 className="text-lg font-black text-[#a2c367] uppercase tracking-widest mb-6 flex items-center gap-3">
                      <span className="text-2xl">✨</span> Key Features
                    </h4>
                    <ul className="space-y-3">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700 font-bold text-lg">
                          <span className="text-[#a2c367] text-2xl leading-none">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.technicalSpecs && (
                  (product.technicalSpecs.polyCount && String(product.technicalSpecs.polyCount).trim() !== '') ||
                  (product.technicalSpecs.textures && String(product.technicalSpecs.textures).trim() !== '') ||
                  product.technicalSpecs.rigged ||
                  product.technicalSpecs.animated
                ) && (
                  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-inner">
                    <h4 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                      <span className="text-2xl">⚙️</span> Technical Specs
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
                      {product.technicalSpecs.polyCount && (
                        <div className="break-words">
                          <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Poly Count</span>
                          <span className="font-black text-gray-800 text-base md:text-lg">{product.technicalSpecs.polyCount}</span>
                        </div>
                      )}
                      {product.technicalSpecs.textures && (
                        <div className="break-words">
                          <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Textures</span>
                          <span className="font-black text-gray-800 text-base md:text-lg">{product.technicalSpecs.textures}</span>
                        </div>
                      )}
                      {product.technicalSpecs.rigged !== undefined && (
                        <div>
                          <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Rigged</span>
                          <span className="font-black text-gray-800 text-base md:text-lg">{product.technicalSpecs.rigged ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      {product.technicalSpecs.animated !== undefined && (
                        <div>
                          <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Animated</span>
                          <span className="font-black text-gray-800 text-base md:text-lg">{product.technicalSpecs.animated ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-2/5 p-8 lg:p-12 bg-gray-50/50 lg:border-l border-gray-100 flex flex-col">
              <div className="mb-8">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight flex-grow">{product.name}</h1>
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-3 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-sm border-2 ${isWishlisted ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-300 bg-white border-gray-100 hover:text-red-300'}`}
                  >
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400 text-lg">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star}>{star <= Math.round(stats.average) ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {stats.count} Review{stats.count !== 1 ? 's' : ''}
                  </span>
                </div>
                {product.updatedAt && (
                  <div className="text-xs text-[#8a7db3] font-black uppercase tracking-widest mb-6 flex items-center gap-1.5 bg-purple-50/50 w-fit px-3 py-1.5 rounded-full border border-purple-100/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                    </span>
                    Last Update: {new Date(product.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                )}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-black text-pink-500">
                    {(product.discount && product.discount.isActive
                      ? calculateDiscountedPrice(basePrice, product.discount.percentage)
                      : basePrice) === 0
                      ? 'Free Pack'
                      : `$${(product.discount && product.discount.isActive
                        ? calculateDiscountedPrice(basePrice, product.discount.percentage)
                        : basePrice).toFixed(2)}`}</span>
                  {product.discount && product.discount.isActive && (
                    <>
                      <span className="text-gray-400 font-bold line-through text-xl opacity-50">${basePrice.toFixed(2)}</span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                        -{product.discount.percentage}%
                      </span>
                    </>
                  )}
                </div>
                <div 
                  className="text-gray-600 text-lg leading-relaxed font-medium rich-content"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>



              <div className="mt-10 space-y-8">
                <div className="flex items-center justify-between sm:justify-start sm:gap-6 p-4 sm:p-6 bg-white rounded-[2rem] border-2 border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden xs:inline">Qty</span>
                    <div className="flex items-center bg-gray-100 rounded-full p-0.5 sm:p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-lg sm:text-xl text-gray-600 hover:text-[#8a7db3] transition-colors"
                      >–</button>
                      <span className="w-8 sm:w-10 text-center font-black text-lg sm:text-xl text-gray-800">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-lg sm:text-xl text-gray-600 hover:text-[#8a7db3] transition-colors"
                      >+</button>
                    </div>
                  </div>

                  <div className="hidden sm:block h-10 w-px bg-gray-100"></div>

                  <button
                    onClick={onNavigateToLicense}
                    className="text-[10px] sm:text-xs font-black text-[#8a7db3] uppercase tracking-widest hover:underline flex items-center gap-1.5 sm:gap-2 group/link whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/link:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    License
                  </button>
                </div>

                <div className="relative space-y-4">
                  {/* License info */}
                  {product.commercialPrice && (
                    <div className="mb-6 bg-gray-50/80 p-6 rounded-3xl border-2 border-gray-100/50">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Applied License</h4>
                      <div className="bg-white rounded-2xl border-2 border-[#8a7db3] p-4 shadow-md">
                        <div className="font-black text-[#8a7db3] text-sm mb-1 uppercase tracking-widest">
                          {derivedLicense === 'commercial' ? 'Commercial' : 'Standard'}
                        </div>
                        <div className="text-[11px] text-gray-500 font-bold leading-tight">
                          {derivedLicense === 'commercial' ? 'Studio & Corporate' : 'Personal & Indie projects'}
                        </div>
                      </div>
                    </div>
                  )}

                  {isSparkling && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full h-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="animate-sparkle-burst text-5xl">✨</div>
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart || (MAINTENANCE_MODE && !user?.isAdmin) || (product.isActive === false)}
                    className={`w-full inline-flex items-center justify-center py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all uppercase tracking-tight transform-gpu border-b-8 ${isInCart || (MAINTENANCE_MODE && !user?.isAdmin) || (product.isActive === false)
                      ? 'bg-gray-100 text-gray-400 cursor-default border-gray-300 shadow-none'
                      : 'bg-[#8a7db3] text-white hover:translate-y-[-4px] active:translate-y-0 hover:shadow-[#8a7db3]/40 border-purple-800/30'
                      } ${isSparkling ? 'animate-wiggle scale-105 brightness-110' : ''}`}
                  >
                    {isInCart ? 'In Your Basket 🧺' : (MAINTENANCE_MODE && !user?.isAdmin) ? 'Shop Paused ⏸' : (product.isActive === false) ? 'Unavailable 🚫' : 'Add to Basket 🛒'}
                  </button>

                  {hasExternalLinks && (
                    <div className="pt-6 space-y-4">
                      <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest">Available on other platforms</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(product.externalLinks).map(([key, url]) => {
                          if (key === 'youtube') return null;
                          if (!url || typeof url !== 'string' || url.trim() === '') return null;
                          const label = key.charAt(0).toUpperCase() + key.slice(1);
                          const Icon = StoreIcons[key as keyof typeof StoreIcons];
                          return (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-3 bg-white border-4 border-gray-50 hover:border-[#8a7db3]/20 hover:bg-[#8a7db3]/5 py-4 rounded-[1.5rem] transition-all text-gray-600 hover:text-[#8a7db3] shadow-md group/store"
                            >
                              <span className="group-hover/store:rotate-12 transition-transform">
                                {Icon}
                              </span>
                              <span className="font-black uppercase tracking-widest text-sm">{label}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p className="text-center text-[10px] text-gray-400 mt-4 font-black uppercase tracking-[0.2em] opacity-60">
                    Professional 3D Asset Pack
                  </p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-10 pt-10 border-t border-gray-200">
                <h4 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Reviews ({stats.count})</h4>

                {reviews.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">
                              {review.user?.name?.charAt(0) || '?'}
                            </div>
                            <span className="font-bold text-sm text-gray-900">{review.user?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex text-yellow-400 text-xs">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star}>{star <= review.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <button className="text-xs font-black text-[#8a7db3] uppercase tracking-widest hover:underline mt-2">
                        View all {reviews.length} reviews
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500 cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-8 right-8 z-[210] text-white/40 hover:text-white transition-all p-4 hover:bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {galleryImages.length > 1 && (
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[210] text-white/40 hover:text-white transition-all p-3 md:p-6 hover:bg-white/10 rounded-full group outline-none focus:ring-2 focus:ring-white/50"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = galleryImages.findIndex(img => img === activeImage);
                const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                setActiveImage(galleryImages[prevIndex]);
              }}
            >
              <svg className="w-10 h-10 md:w-16 md:h-16 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {galleryImages.length > 1 && (
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[210] text-white/40 hover:text-white transition-all p-3 md:p-6 hover:bg-white/10 rounded-full group outline-none focus:ring-2 focus:ring-white/50"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = galleryImages.findIndex(img => img === activeImage);
                const nextIndex = (currentIndex + 1) % galleryImages.length;
                setActiveImage(galleryImages[nextIndex]);
              }}
            >
              <svg className="w-10 h-10 md:w-16 md:h-16 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="relative max-w-7xl w-full h-full flex items-center justify-center p-4 sm:p-12 md:p-20 transition-all duration-300">
            {activeImage === sketchfabEmbedUrl ? (
              <div
                className="w-full h-full max-h-[85vh] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(138,125,179,0.3)] bg-gray-50/50 backdrop-blur"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  title="Sketchfab Fullscreen"
                  src={sketchfabEmbedUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; vr"
                ></iframe>
              </div>
            ) : isYoutubeEmbedUrl(activeImage) ? (
              <div
                className="w-full h-full max-h-[85vh] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(138,125,179,0.3)] bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  title="YouTube Fullscreen"
                  src={activeImage}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : activeImage === modelViewerUrl ? (
              <div
                className="w-full h-full max-h-[85vh] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(138,125,179,0.3)] bg-gray-50/50 backdrop-blur"
                onClick={(e) => e.stopPropagation()}
              >
                {/* @ts-ignore */}
                <model-viewer
                  src={modelViewerUrl}
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  environment-image="neutral"
                  camera-orbit="0deg 75deg 85%"
                  min-camera-orbit="auto auto 1%"
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* @ts-ignore */}
                </model-viewer>
              </div>
            ) : (
              <img
                key={activeImage}
                src={activeImage}
                alt="Full resolution view"
                className={`max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(138,125,179,0.3)] animate-in slide-in-from-bottom-12 duration-500 transition-transform duration-300 origin-center ${zoomLevel > 1 ? 'overflow-auto cursor-zoom-out' : 'cursor-zoom-in'}`}
                style={{ transform: `scale(${zoomLevel})` }}
                onClick={toggleZoom}
                onError={handleImageError}
              />
            )}

            <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-2xl px-6 md:px-10 py-3 md:py-4 rounded-full text-white/90 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] border border-white/20 shadow-2xl animate-in fade-in duration-1000 whitespace-nowrap">
              {galleryImages.findIndex(img => img === activeImage) + 1} / {galleryImages.length} — PREVIEW
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sparkle-burst {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          50% { transform: scale(1.5) translateY(-20px); opacity: 1; }
          100% { transform: scale(0) translateY(-40px); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-sparkle-burst {
          animation: sparkle-burst 0.6s ease-out forwards;
        }
        .animate-wiggle {
          animation: wiggle 0.2s ease-in-out infinite;
        }
        @media (max-width: 380px) {
          .xs\:inline { display: inline; }
          .xs\:hidden { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
