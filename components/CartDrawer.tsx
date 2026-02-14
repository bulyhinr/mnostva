import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import ImageWithFallback from './ImageWithFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleRemove = (id: string) => {
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      removeFromCart(id);
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };


  const handleCheckoutClick = () => {
    onClose();
    // In App.tsx we listen to hash changes, but we'll use the callback provided by Navbar
    // which effectively changes the current page state.
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-8 border-b-4 border-gray-100 flex items-center justify-between">
          <h2 className="text-3xl font-black text-gray-900">Your <span className="text-[#8a7db3]">Basket</span></h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-6 overflow-x-hidden">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🧺</div>
              <p className="text-gray-400 font-bold text-xl">Your basket is empty!</p>
              <button
                onClick={onClose}
                className="mt-6 text-[#8a7db3] font-black uppercase tracking-widest text-sm hover:underline"
              >
                Go find some magic →
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const isRemoving = removingIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex gap-4 group transition-all duration-300 ${isRemoving ? 'animate-slide-out-right opacity-0' : 'opacity-100'
                    }`}
                  style={{ maxHeight: isRemoving ? '0' : '500px', marginBottom: isRemoving ? '0' : '1.5rem', overflow: 'hidden' }}
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-sm border border-gray-50">
                    <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-gray-800 leading-tight text-sm">{item.name}</h4>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-all transform hover:scale-125 active:scale-90"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-gray-50 rounded-full px-2 py-0.5 border border-gray-100">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-[#8a7db3]"
                        >–</button>
                        <span className="w-6 text-center text-xs font-black text-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-[#8a7db3]"
                        >+</button>
                      </div>
                      <div className="flex flex-col items-end">
                        {item.discount && item.discount.isActive ? (
                          <>
                            <span className="text-gray-400 line-through text-[10px] font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            <span className="text-pink-500 font-black">${((item.price * (1 - item.discount.percentage / 100)) * item.quantity).toFixed(2)}</span>
                          </>
                        ) : (
                          <div className="text-pink-500 font-black">${(item.price * item.quantity).toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-gray-50 border-t-4 border-gray-100 space-y-6">
            <div className="flex justify-between items-center text-xl font-black">
              <span className="text-gray-400">Total</span>
              <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#8a7db3] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:translate-y-[-4px] active:translate-y-0 transition-all uppercase tracking-widest"
            >
              Checkout Now 🛒
            </button>
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
              Digital Delivery after purchase
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-out-right {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-slide-out-right {
          animation: slide-out-right 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
