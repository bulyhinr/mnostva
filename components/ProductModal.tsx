
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToLicense?: () => void;
}

const StoreIcons = {
  unity: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M22.01 12.02c0 .28-.05.54-.15.78l-1.93-.72a.5.5 0 0 0-.64.29.5.5 0 0 0 .29.64l1.93.72a3.02 3.02 0 0 1-2.02 2.02l-.72-1.93a.5.5 0 0 0-.64-.29.5.5 0 0 0-.29.64l.72 1.93c-.24.1-.5.15-.78.15s-.54-.05-.78-.15l.72-1.93a.5.5 0 0 0-.29-.64.5.5 0 0 0-.64.29l-.72 1.93a3.02 3.02 0 0 1-2.02-2.02l1.93-.72a.5.5 0 0 0 .29-.64.5.5 0 0 0-.64-.29l-1.93.72c.1-.24.15-.5.15-.78s-.05-.54-.15-.78l1.93.72a.5.5 0 0 0 .64-.29.5.5 0 0 0-.29-.64l-1.93-.72a3.02 3.02 0 0 1 2.02-2.02l.72 1.93a.5.5 0 0 0 .64.29.5.5 0 0 0 .29-.64l-.72-1.93c.24-.1.5-.15.78-.15s.54.05.78.15l-.72 1.93a.5.5 0 0 0 .29.64.5.5 0 0 0 .64-.29l.72-1.93a3.02 3.02 0 0 1 2.02 2.02l-1.93.72a.5.5 0 0 0-.29.64.5.5 0 0 0 .64.29l1.93-.72c-.1.24-.15.5-.15.78zM12 2.02c5.51 0 10 4.49 10 10s-4.49 10-10 10-10-4.49-10-10 4.49-10 10-10z"/>
    </svg>
  ),
  fab: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2zM12 15.63l-4.5 2.04 4.5-11.04 4.5 11.04-4.5-2.04z"/>
    </svg>
  ),
  cgtrader: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm8 14.12l-8 4-8-4V7.88l8-4 8 4v8.24zM12 15l-4-2v-4l4 2 4-2v4l-4 2z"/>
    </svg>
  ),
  artstation: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M1.77 19.3L5 20.4l8.3-14.4L11.6 3.4l-9.8 15.9zm13.3-13.1l-1.3 2.1 6.8 11.8 1.7-1.1-7.2-12.8zm-2.4 8.7l-4.2 7.2h12.8l-1.5-2.6H11.5l-1.5-2.6h2.7l-1.4-2.4-1.4 2.4h2.7z"/>
    </svg>
  )
};

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onNavigateToLicense }) => {
  const { addToCart, cart } = useCart();
  const [isSparkling, setIsSparkling] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      setQuantity(1);
    }
  }, [product]);

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
    product.imageUrl,
    `https://picsum.photos/seed/variant1${product.id}/1200/1200`,
    `https://picsum.photos/seed/variant2${product.id}/1200/1200`,
    `https://picsum.photos/seed/variant3${product.id}/1200/1200`,
  ];

  const handleLicenseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToLicense) {
      onNavigateToLicense();
      onClose();
    }
  };

  const hasExternalLinks = Object.values(product.externalLinks).some(link => !!link);

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
                <img 
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
                    className={`aspect-square rounded-2xl overflow-hidden bg-gray-100 border-4 transition-all cursor-pointer group hover:scale-105 active:scale-95 ${
                      activeImage === imgUrl ? 'border-[#8a7db3] shadow-lg shadow-[#8a7db3]/20' : 'border-white hover:border-pink-200'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      className={`w-full h-full object-cover transition-all duration-500 ${activeImage === imgUrl ? 'scale-110' : 'grayscale-[40%] group-hover:grayscale-0'}`} 
                    />
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
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-black text-pink-500">${product.price.toFixed(2)}</span>
                  <span className="text-gray-400 font-bold line-through text-lg opacity-50">${(product.price * 1.5).toFixed(2)}</span>
                </div>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {product.description}
                </p>
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
                  className={`w-full inline-flex items-center justify-center py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all uppercase tracking-tight transform-gpu border-b-8 ${
                    isInCart 
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
                         if (!url) return null;
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
