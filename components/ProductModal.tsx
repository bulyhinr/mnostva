
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import ImageWithFallback from './ImageWithFallback';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToLicense?: () => void;
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

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onNavigateToLicense }) => {
  const { addToCart, cart } = useCart();
  const [isSparkling, setIsSparkling] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const getStorageUrl = (key?: string) => {
    if (!key) return '';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? 'http://localhost:3001/api' : (import.meta.env.VITE_API_URL || '');
    if (key.startsWith('public/')) {
      return `${baseUrl}/storage/${key}`;
    }
    return `${baseUrl}/storage/public/${key}`;
  };

  const getSketchfabEmbedUrl = (input?: string) => {
    if (!input) return null;
    const match = input.match(/([a-fA-F0-9]{32})/);
    const id = match ? match[1] : input.trim();
    if (!id || id.length < 5) return null;
    return `https://sketchfab.com/models/${id}/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=1`;
  };

  const getYoutubeEmbedUrl = (url?: string) => {
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
  };

  const sketchfabEmbedUrl = getSketchfabEmbedUrl(product?.externalLinks?.sketchfab);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(product?.externalLinks?.youtube);
  const modelViewerUrl = product?.previewModelKey ? getStorageUrl(product.previewModelKey) : null;
  const mainImageUrl = product?.previewImageKey ? getStorageUrl(product.previewImageKey) : product?.imageUrl;

  useEffect(() => {
    if (product) {
      setActiveImage(sketchfabEmbedUrl || youtubeEmbedUrl || modelViewerUrl || mainImageUrl || '');
      setQuantity(1);
    }
  }, [product, sketchfabEmbedUrl, youtubeEmbedUrl, modelViewerUrl, mainImageUrl]);

  if (!product) return null;

  const isInCart = cart.some(item => item.id === product.id);

  const handleAddToCart = () => {
    if (isInCart) return;

    setIsSparkling(true);
    addToCart(product, quantity);

    setTimeout(() => {
      setIsSparkling(false);
      onClose();
    }, 800);
  };

  const galleryImages = [
    sketchfabEmbedUrl,
    youtubeEmbedUrl,
    modelViewerUrl,
    mainImageUrl,
    ...(Array.isArray(product.galleryImages) ? product.galleryImages : []).map(key => getStorageUrl(key))
  ].filter(Boolean) as string[];
 
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

  const handleLicenseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToLicense) {
      onNavigateToLicense();
      onClose();
    }
  };

  const hasExternalLinks = Object.entries(product.externalLinks || {}).some(([key, url]) => !!url && key !== 'youtube');

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
        <div
          className="bg-white rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in slide-in-from-bottom-8 duration-500 border-b-8 border-black/10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-[#8a7db3] hover:text-white rounded-full transition-all duration-300 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-3/5 p-8 lg:p-12">
              <div
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video lg:aspect-square mb-8 group bg-gray-50 cursor-zoom-in border-4 border-white"
                onClick={() => setIsLightboxOpen(true)}
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
                ) : activeImage === youtubeEmbedUrl ? (
                  <div className="w-full h-full relative group bg-black">
                    <iframe
                      title="YouTube Video"
                      src={youtubeEmbedUrl!}
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
                      style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
                    >
                      {/* @ts-ignore */}
                    </model-viewer>
                  </div>
                ) : (
                  <>
                    <ImageWithFallback
                      key={activeImage}
                      src={activeImage}
                      alt={product.name}
                      className="w-full h-full object-cover animate-in fade-in zoom-in duration-700 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px]">
                      <div className="bg-white/95 p-6 rounded-full shadow-2xl text-[#8a7db3] scale-75 group-hover:scale-100 transition-all duration-500">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-[#8a7db3] px-5 py-2 rounded-full text-xs font-black text-white shadow-xl uppercase tracking-widest">
                    {product.category}
                  </span>
                  {product.technicalSpecs?.animated && (
                    <span className="bg-[#a2c367] text-white px-5 py-2 rounded-full text-xs font-black shadow-xl uppercase tracking-widest">
                      ANIMATED
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`aspect-square rounded-2xl overflow-hidden bg-gray-100 border-4 transition-all cursor-pointer group hover:scale-105 active:scale-95 flex items-center justify-center ${activeImage === imgUrl ? 'border-[#8a7db3] shadow-lg shadow-[#8a7db3]/20' : 'border-white hover:border-pink-200'
                      }`}
                  >
                    {imgUrl === sketchfabEmbedUrl ? (
                      <div className={`w-full h-full flex items-center justify-center bg-sky-50 transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`}>
                        <span className="flex items-center justify-center text-sky-500" title="Sketchfab 3D View">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </span>
                      </div>
                    ) : imgUrl === youtubeEmbedUrl ? (
                      <div className={`w-full h-full flex items-center justify-center bg-red-50 transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`}>
                        <span className="flex items-center justify-center text-red-500" title="YouTube Video">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                        </span>
                      </div>
                    ) : imgUrl === modelViewerUrl ? (
                      <div className={`w-full h-full flex items-center justify-center bg-purple-50 transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`}>
                        <span className="text-xl" title="WebGL 3D View">🧊</span>
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
                {product.packContent && (
                  <div className="bg-pink-50/50 p-6 rounded-[2rem] border-2 border-pink-100 shadow-inner">
                    <h4 className="text-sm font-black text-pink-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      📦 Pack Content
                    </h4>
                    <ul className="space-y-2">
                      {product.packContent.map((item, idx) => (
                        <li key={idx} className="text-gray-700 font-medium text-sm flex gap-2">
                          <span className="text-pink-300">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.compatibility && (
                  <div className="bg-[#8a7db3]/5 p-6 rounded-[2rem] border-2 border-[#8a7db3]/10 shadow-inner">
                    <h4 className="text-sm font-black text-[#8a7db3] uppercase tracking-widest mb-4 flex items-center gap-2">
                      🎮 Compatibility
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.compatibility.map((engine, idx) => (
                        <span key={idx} className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-gray-500 border border-gray-100 shadow-sm uppercase tracking-tighter">
                          {engine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-2/5 p-8 lg:p-12 bg-gray-50/50 lg:border-l border-gray-100 flex flex-col">
              <div className="mb-8">
                <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h2>
                {product.updatedAt && (
                  <div className="text-[10px] text-[#8a7db3] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 bg-purple-50/50 w-fit px-3 py-1 rounded-full border border-purple-100/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                    </span>
                    Last Update: {new Date(product.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                )}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-black text-pink-500">
                    {product.price === 0 ? 'Free Pack' : `$${product.price.toFixed(2)}`}
                  </span>
                  {product.price > 0 && (
                    <span className="text-gray-400 font-bold line-through text-lg opacity-50">${(product.price * 1.5).toFixed(2)}</span>
                  )}
                </div>
                <div 
                  className="text-gray-600 leading-relaxed font-medium rich-content"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              <div className="space-y-8 flex-grow">
                {product.features && (
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Key Features</h4>
                    <ul className="space-y-2">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 font-bold text-sm">
                          <span className="text-[#a2c367] text-xl leading-none">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.technicalSpecs && (
                  <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Technical Specs</h4>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Poly Count</span>
                        <span className="font-black text-gray-800">{product.technicalSpecs.polyCount}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Textures</span>
                        <span className="font-black text-gray-800">{product.technicalSpecs.textures}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Rigged</span>
                        <span className="font-black text-gray-800">{product.technicalSpecs.rigged ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 font-black uppercase mb-1">Animated</span>
                        <span className="font-black text-gray-800">{product.technicalSpecs.animated ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interaction Bar */}
              <div className="mt-8 flex items-center justify-between gap-2 p-4 md:p-5 bg-white rounded-3xl border-2 border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden xs:inline">Qty</span>
                  <div className="flex items-center bg-gray-100 rounded-full px-1 py-0.5 sm:px-2 sm:py-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-black text-gray-600 hover:text-[#8a7db3] transition-colors"
                    >–</button>
                    <span className="w-6 sm:w-8 text-center font-black text-gray-800 text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-black text-gray-600 hover:text-[#8a7db3] transition-colors"
                    >+</button>
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-gray-100"></div>

                <button
                  onClick={handleLicenseClick}
                  className="text-[10px] sm:text-xs font-black text-[#8a7db3] uppercase tracking-widest hover:underline flex items-center gap-1.5 sm:gap-2 group/license whitespace-nowrap"
                >
                  <svg className="w-4 h-4 transition-transform group-hover/license:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  License
                </button>
              </div>

              {/* Purchase Buttons Section */}
              <div className="mt-8 space-y-4 relative">
                {isSparkling && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full h-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="animate-sparkle-burst text-5xl">✨</div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`w-full inline-flex items-center justify-center py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all uppercase tracking-tight transform-gpu border-b-8 ${isInCart
                    ? 'bg-gray-100 text-gray-400 cursor-default border-gray-300'
                    : 'bg-[#8a7db3] text-white hover:translate-y-[-4px] active:translate-y-0 hover:shadow-[#8a7db3]/40 border-purple-800/30'
                    } ${isSparkling ? 'animate-wiggle scale-105 brightness-110' : ''}`}
                >
                  {isInCart ? 'In Your Basket 🧺' : 'Add to Basket 🛒'}
                </button>

                {/* External Marketplaces Buttons */}
                {hasExternalLinks && (
                  <div className="space-y-2 mt-6">
                    <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Or buy on external platforms</p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(product.externalLinks).map(([key, url]) => {
                        if (!url || key === 'youtube') return null;
                        const label = key.charAt(0).toUpperCase() + key.slice(1);
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50 py-3 rounded-2xl transition-all text-gray-600 hover:text-pink-600 shadow-sm group/store"
                          >
                            <span className="scale-75 group-hover/store:rotate-12 transition-transform">
                              {StoreIcons[key as keyof typeof StoreIcons]}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-center text-[10px] text-gray-400 mt-4 font-black uppercase tracking-[0.2em] opacity-60">Professional 3D Asset Pack</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500 cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-all p-4 hover:bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            <img
              src={activeImage}
              alt="Full resolution view"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(138,125,179,0.3)] animate-in slide-in-from-bottom-12 duration-700"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-2xl px-10 py-4 rounded-full text-white/90 font-black text-xs uppercase tracking-[0.4em] border border-white/20 shadow-2xl animate-in fade-in duration-1000">
              HD PREVIEW: {product.name}
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
      `}</style>
    </>
  );
};

export default ProductModal;
