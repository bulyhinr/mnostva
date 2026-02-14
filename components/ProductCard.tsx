import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import ImageWithFallback from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
}

const StoreIcons = {
  unity: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M22.01 12.02c0 .28-.05.54-.15.78l-1.93-.72a.5.5 0 0 0-.64.29.5.5 0 0 0 .29.64l1.93.72a3.02 3.02 0 0 1-2.02 2.02l-.72-1.93a.5.5 0 0 0-.64-.29.5.5 0 0 0-.29.64l.72 1.93c-.24.1-.5.15-.78.15s-.54-.05-.78-.15l.72-1.93a.5.5 0 0 0-.29-.64.5.5 0 0 0-.64.29l-.72 1.93a3.02 3.02 0 0 1-2.02-2.02l1.93-.72a.5.5 0 0 0 .29-.64.5.5 0 0 0-.64-.29l-1.93.72c.1-.24.15-.5.15-.78s-.05-.54-.15-.78l1.93.72a.5.5 0 0 0 .64-.29.5.5 0 0 0-.29-.64l-1.93-.72a3.02 3.02 0 0 1 2.02-2.02l.72 1.93a.5.5 0 0 0 .64.29.5.5 0 0 0 .29-.64l-.72-1.93c.24-.1.5-.15.78-.15s.54.05.78.15l-.72 1.93a.5.5 0 0 0 .29.64.5.5 0 0 0 .64-.29l.72-1.93a3.02 3.02 0 0 1 2.02 2.02l-1.93.72a.5.5 0 0 0-.29.64.5.5 0 0 0 .64.29l1.93-.72c-.1.24-.15.5-.15.78zM12 2.02c5.51 0 10 4.49 10 10s-4.49 10-10 10-10-4.49-10-10 4.49-10 10-10z" />
    </svg>
  ),
  fab: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2zM12 15.63l-4.5 2.04 4.5-11.04 4.5 11.04-4.5-2.04z" />
    </svg>
  ),
  cgtrader: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm8 14.12l-8 4-8-4V7.88l8-4 8 4v8.24zM12 15l-4-2v-4l4 2 4-2v4l-4 2z" />
    </svg>
  ),
  artstation: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M1.77 19.3L5 20.4l8.3-14.4L11.6 3.4l-9.8 15.9zm13.3-13.1l-1.3 2.1 6.8 11.8 1.7-1.1-7.2-12.8zm-2.4 8.7l-4.2 7.2h12.8l-1.5-2.6H11.5l-1.5-2.6h2.7l-1.4-2.4-1.4 2.4h2.7z" />
    </svg>
  )
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpen }) => {
  const { addToCart, cart } = useCart();
  const [isSparkling, setIsSparkling] = useState(false);
  const isInCart = cart.some(item => item.id === product.id);

  const imageUrl = product.previewImageKey
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${product.previewImageKey}`
    : product.imageUrl;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCart) return;

    setIsSparkling(true);
    addToCart(product);

    setTimeout(() => setIsSparkling(false), 800);
  };

  return (
    <div className="relative group p-[5px] rounded-[2.8rem] transition-all duration-500 hover:scale-[1.03] active:scale-[1.05] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8a7db3] via-pink-400 to-[#a2c367] animate-gradient-slow opacity-30 group-hover:opacity-100 rounded-[2.8rem] transition-all duration-700 blur-[3px] group-hover:blur-[1px] group-hover:animate-border-pulse"></div>

      <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.6rem] overflow-hidden flex flex-col h-full border border-white/40 shadow-xl group-hover:bg-white/95 transition-colors duration-500">
        <div
          className="relative h-64 overflow-hidden cursor-pointer"
          onClick={() => onOpen(product)}
        >
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-active:scale-125"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
            <div className="bg-white/90 text-[#8a7db3] p-4 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl scale-75 group-hover:scale-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </div>

          {/* Category Tag */}
          <div className="absolute top-4 left-4 bg-[#8a7db3] text-white px-4 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-widest">
            {product.category}
          </div>

          {/* External Links Icons Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {Object.entries(product.externalLinks).map(([key, url]) => {
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all text-gray-800"
                  title={`View on ${key}`}
                >
                  {StoreIcons[key as keyof typeof StoreIcons]}
                </a>
              );
            })}
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 transform group-hover:translate-y-[-4px] transition-transform duration-300">
            {product.discount && product.discount.isActive ? (
              <>
                <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider animate-pulse">
                  -{product.discount.percentage}% SALE
                </div>
                <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-2xl font-bold shadow-lg">
                  <span className="text-pink-200 line-through text-xs opacity-80">${product.price.toFixed(2)}</span>
                  <span className="text-lg">${(product.price * (1 - product.discount.percentage / 100)).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="bg-pink-500 text-white px-4 py-2 rounded-2xl font-bold shadow-lg">
                ${product.price.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3
            className="text-2xl font-black text-gray-800 mb-2 group-hover:text-[#8a7db3] transition-colors cursor-pointer active:scale-95 origin-left inline-block uppercase tracking-tight"
            onClick={() => onOpen(product)}
          >
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 font-medium">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map(tag => (
              <span key={tag} className="bg-purple-50 text-[#8a7db3] px-3 py-1 rounded-full text-[10px] font-black border border-purple-100/50 uppercase tracking-tighter">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-auto space-y-3 relative">
            {isSparkling && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-0 flex items-center justify-center pointer-events-none z-20">
                <div className="animate-sparkle-burst text-2xl">✨</div>
                <div className="animate-sparkle-burst-delayed text-xl absolute -left-4">🌟</div>
                <div className="animate-sparkle-burst-delayed text-xl absolute -right-4">⭐</div>
                <div className="animate-float-up text-xs font-black text-pink-500 absolute -top-4">+1</div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`block w-full text-center py-4 rounded-2xl font-black shadow-lg transition-all uppercase tracking-widest text-sm border-b-4 transform-gpu ${isInCart
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default scale-95 opacity-80 shadow-none'
                : 'bg-gradient-to-r from-[#8a7db3] to-pink-500 text-white border-pink-700/30 hover:shadow-pink-200 hover:brightness-110 active:translate-y-[2px] active:border-b-2 active:mb-[2px] active:scale-95'
                } ${isSparkling ? 'animate-wiggle scale-105' : ''}`}
            >
              {isInCart ? 'In Basket 🛒' : 'Add to Basket 🧺'}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen(product);
              }}
              className="w-full bg-white/50 text-[#8a7db3] border border-purple-100 hover:bg-purple-50 py-2 rounded-xl text-[10px] font-black transition-all active:bg-purple-100 uppercase tracking-widest"
            >
              Technical Info
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes border-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.01); }
        }
        .animate-border-pulse {
          animation: border-pulse 2s ease-in-out infinite;
        }
        @keyframes sparkle-burst {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          50% { transform: scale(1.5) translateY(-20px); opacity: 1; }
          100% { transform: scale(0) translateY(-40px); opacity: 0; }
        }
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-sparkle-burst {
          animation: sparkle-burst 0.6s ease-out forwards;
        }
        .animate-sparkle-burst-delayed {
          animation: sparkle-burst 0.7s ease-out 0.1s forwards;
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
        .animate-wiggle {
          animation: wiggle 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
