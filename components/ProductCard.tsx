import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ImageWithFallback from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
}

const StoreIcons = {
  unity: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 1.5L2 7.23v10.54L12 23.5l10-5.73V7.23L12 1.5zm0 2.29l8.03 4.6L12 13.01 3.97 8.39 12 3.79zM3.97 10.7l7.03 4.02v8.13l-7.03-4.04V10.7zM13 22.85v-8.13l7.03-4.02v8.11L13 22.85z" />
    </svg>
  ),
  fab: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm7.33 14.57L12 20.57l-7.33-4V7.43L12 3.43l7.33 4v9.14zM10.5 8h4v2h-4v2h3v2h-3v4H9V8h1.5z" />
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
  ),
  superhive: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2L22 7.77v8.46L12 22l-10-5.77V7.77L12 2zM12 4.31L4 8.93v6.14l8 4.62 8-4.62V8.93l-8-4.62z"/>
    </svg>
  )
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpen }) => {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const [isSparkling, setIsSparkling] = useState(false);
  
  const derivedLicense = user?.userType === 'company' && product.commercialPrice ? 'commercial' : 'standard';
  const basePrice = derivedLicense === 'commercial' && product.commercialPrice ? product.commercialPrice : product.price;

  const isInCart = cart.some(item => item.id === product.id && (item.licenseType || 'standard') === derivedLicense);

  const imageUrl = product.previewImageKey
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/storage/public/${product.previewImageKey}`
    : product.imageUrl;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCart) return;

    setIsSparkling(true);
    addToCart(product, 1, derivedLicense);

    setTimeout(() => setIsSparkling(false), 800);
  };

  return (
    <article className="relative group p-[5px] rounded-[2.8rem] transition-all duration-500 hover:scale-[1.03] active:scale-[1.05] h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8a7db3] via-pink-400 to-[#a2c367] animate-gradient-slow opacity-30 group-hover:opacity-100 rounded-[2.8rem] transition-all duration-700 blur-[3px] group-hover:blur-[1px] group-hover:animate-border-pulse"></div>

      <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.6rem] overflow-hidden flex flex-col h-full border border-white/40 shadow-xl group-hover:bg-white/95 transition-colors duration-500">
        <Link
          to={`/product/${product.id}`}
          className="relative aspect-video overflow-hidden block"
          onClick={(e) => {
            // Standard left click opens modal/handles navigation via onOpen
            if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              onOpen(product);
            }
            // Middle click and Ctrl+Click are handled naturally by the browser/Link
          }}
        >
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-bottom transition-transform duration-700 group-hover:scale-110 group-active:scale-125"
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



          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 transform group-hover:translate-y-[-4px] transition-transform duration-300">
            {product.discount && product.discount.isActive ? (
              <>
                <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-md uppercase tracking-wider animate-pulse">
                  -{product.discount.percentage}% SALE
                </div>
                <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-2xl font-bold shadow-lg">
                  <span className="text-pink-200 line-through text-xs opacity-80">${basePrice.toFixed(2)}</span>
                  <span className="text-lg">${(basePrice * (1 - product.discount.percentage / 100)).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="bg-pink-500 text-white px-4 py-2 rounded-2xl font-bold shadow-lg">
                {basePrice === 0 ? 'Free Pack' : `$${basePrice.toFixed(2)}`}
              </div>
            )}
          </div>
        </Link>

        <div className="p-6 flex flex-col flex-grow">
          <Link
            to={`/product/${product.id}`}
            className="text-2xl font-black text-gray-800 mb-2 group-hover:text-[#8a7db3] transition-colors cursor-pointer active:scale-95 origin-left inline-block uppercase tracking-tight"
            onClick={(e) => {
              if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                onOpen(product);
              }
            }}
          >
            {product.name}
          </Link>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 font-medium">
            {product.description.replace(/<[^>]*>?/gm, '')}
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

            <Link
              to={`/product/${product.id}`}
              className="block w-full text-center bg-white/50 text-[#8a7db3] border border-purple-100 hover:bg-purple-50 py-2 rounded-xl text-[10px] font-black transition-all active:bg-purple-100 uppercase tracking-widest"
              onClick={(e) => {
                if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  onOpen(product);
                }
              }}
            >
              Technical Info
            </Link>
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
    </article>
  );
};

export default ProductCard;
