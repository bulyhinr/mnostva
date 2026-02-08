
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [form, setForm] = useState({ 
    email: user?.email || '', 
    name: user?.name || '' 
  });

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') setStep('payment');
    else if (step === 'payment') {
      // Record order if user is logged in
      if (user) {
        const newOrder: Order = {
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          date: new Date().toISOString(),
          items: [...cart],
          total: totalPrice,
          status: 'completed'
        };
        addOrder(newOrder);
      }
      
      setStep('success');
      clearCart();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-10 pt-16">
          {step === 'details' && (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-gray-900 mb-2">Checkout</h2>
                <p className="text-gray-500 font-bold">Where should we send your assets?</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Jane Doe" 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#8a7db3] transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="jane@example.com" 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#8a7db3] transition-all font-bold"
                  />
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full bg-[#8a7db3] text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all">
                  Next Step →
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-gray-900 mb-2">Payment</h2>
                <p className="text-gray-500 font-bold">Total to pay: <span className="text-pink-500">${totalPrice.toFixed(2)}</span></p>
              </div>
              <div className="bg-[#fdf2f8] p-6 rounded-3xl border-2 border-pink-100 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-8 bg-white rounded-md border border-gray-200"></div>
                  <div className="h-2 w-32 bg-gray-200 rounded-full"></div>
                </div>
                <p className="text-xs text-pink-400 font-bold uppercase tracking-widest italic text-center">Simulated Secure Payment Provider</p>
              </div>
              <button type="submit" className="w-full bg-pink-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all">
                Confirm Purchase 💳
              </button>
              <button onClick={() => setStep('details')} className="w-full text-gray-400 font-bold hover:text-gray-600 transition-colors py-2 text-sm">
                Go back
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-[#a2c367] text-white rounded-full flex items-center justify-center mx-auto text-5xl shadow-lg animate-bounce">
                ✓
              </div>
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Yay! Success!</h2>
                <p className="text-gray-500 font-medium">
                  Thank you for your order, <span className="text-[#8a7db3] font-bold">{form.name}</span>! <br/>
                  We've sent a download link to <span className="text-pink-500 font-bold">{form.email}</span>.
                </p>
                {user && (
                  <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">
                    This order has been saved to your account library.
                  </p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Back to Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
