
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import ImageWithFallback from '../components/ImageWithFallback';

interface CheckoutPageProps {
  onSuccess: () => void;
  onBack: () => void;
  onNavigateToProfile: () => void;
  onNavigateToLogin: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onSuccess, onBack, onNavigateToProfile, onNavigateToLogin }) => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, register, addOrder } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(user ? 2 : 1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    createAccount: false,
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    if (cart.length === 0 && step !== 4) {
      onBack();
    }
  }, [cart, step, onBack]);

  const goToStep = (nextStep: 1 | 2 | 3 | 4) => {
    setDirection(nextStep > step ? 'forward' : 'backward');
    setStep(nextStep);
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && form.createAccount) {
      if (!form.password) {
        alert("Please enter a password to create an account.");
        return;
      }
      try {
        await register(form.name, form.email, form.password);
      } catch (error) {
        console.error("Registration during checkout failed:", error);
        alert("Registration failed. Please check your details or login.");
        return;
      }
    }

    goToStep(2);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);

    // Format with spaces for the input field: 0000 0000 0000 0000
    const formatted = value.replace(/(.{4})/g, '$1 ').trim();
    setForm({ ...form, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    // Add leading zero if first digit is > 1
    if (value.length === 1 && parseInt(value) > 1) {
      value = '0' + value;
    }

    // Add slash
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setForm({ ...form, expiry: formatted });
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setForm({ ...form, cvc: value });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Get token
      const token = authService.getAccessToken();

      // 2. Send order to backend
      const order = await orderService.createOrder(cart, totalPrice, token || '', user?.id);

      // 3. Update local context
      addOrder(order);
      clearCart();
      goToStep(4);

    } catch (error: any) {
      console.error('Checkout failed:', error);
      const message = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Checkout failed: ${message}`);
    }
    setIsProcessing(false);
  };

  const steps = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Review' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Success' }
  ];

  const animationClass = direction === 'forward'
    ? "animate-in fade-in slide-in-from-right-8 duration-500 ease-out"
    : "animate-in fade-in slide-in-from-left-8 duration-500 ease-out";

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 bg-gradient-to-b from-white to-[#8a7db3]/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl -z-10"></div>

      <ScrollReveal className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-[#8a7db3] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          ← Back to Shop
        </button>

        <div className="flex justify-between mb-12 relative px-4 max-w-4xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10"></div>
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all border-4 ${step >= s.num ? 'bg-[#8a7db3] text-white border-[#8a7db3] scale-110 shadow-lg' : 'bg-white text-gray-300 border-gray-100'
                }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${step >= s.num ? 'text-[#8a7db3]' : 'text-gray-300'
                }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(138,125,179,0.25)] border-b-8 border-black/10 relative transition-all duration-500 h-auto min-h-[400px]">
          {isProcessing && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center rounded-[3.5rem] animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-gray-100 border-t-[#8a7db3] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">✨</div>
              </div>
              <p className="mt-8 text-2xl font-black text-[#8a7db3] uppercase tracking-widest animate-pulse">Processing Magic...</p>
              <p className="mt-2 text-gray-600 font-bold">Please don't close this window</p>
            </div>
          )}

          <div key={step} className={`p-8 md:p-14 pb-12 h-full ${animationClass}`}>
            {step === 1 && !user && (
              <form onSubmit={handleIdentitySubmit}>
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black text-gray-900 mb-2">Who are you?</h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Customer Information</p>
                </div>
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Full Name</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-[1.5rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Email Address</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-[1.5rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                    />
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer group p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors mb-6">
                    <input
                      type="checkbox"
                      checked={form.createAccount}
                      onChange={e => setForm({ ...form, createAccount: e.target.checked })}
                      className="w-6 h-6 rounded-lg border-2 border-gray-300 text-[#8a7db3] focus:ring-purple-500 transition-all cursor-pointer"
                    />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                      Create an account to save this purchase! ✨
                    </span>
                  </label>

                  {form.createAccount && (
                    <div className="animate-in fade-in slide-in-from-top-2 mb-6">
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Password</label>
                      <input
                        required={form.createAccount}
                        type="password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        minLength={6}
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-[1.5rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#8a7db3] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] transition-all uppercase tracking-widest mt-6 border-b-8 border-purple-800/30"
                  >
                    Continue to Review →
                  </button>
                  <div className="mt-10 pt-8 border-t-2 border-gray-100 flex flex-col items-center">
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-4">Already have an account?</p>
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="w-full bg-white text-[#8a7db3] border-4 border-[#8a7db3] py-4 rounded-[1.5rem] font-black text-sm shadow-sm hover:bg-[#8a7db3] hover:text-white transition-all uppercase tracking-widest"
                    >
                      Login to your account
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-col h-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black text-gray-900 mb-2">Review Order</h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Confirm your stylized picks</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[2.5rem] border-2 border-white shadow-sm group hover:border-pink-100 transition-all relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md relative">
                        <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        {item.quantity > 1 && (
                          <div className="absolute top-1 right-1 bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white">
                            x{item.quantity}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-black text-gray-900 group-hover:text-[#8a7db3] transition-colors text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-[#8a7db3] font-black uppercase tracking-widest truncate">{item.category}</p>
                        {item.quantity > 1 && (
                          <p className="text-[9px] text-gray-400 font-bold mt-1">
                            Unit Price: ${item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {item.discount && item.discount.isActive ? (
                          <>
                            <p className="text-[10px] font-bold text-gray-400 line-through">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="font-black text-pink-500 text-sm">
                              ${((item.price * (1 - item.discount.percentage / 100)) * item.quantity).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="font-black text-pink-500 text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                        {item.quantity > 1 && (
                          <span className="text-[10px] font-black text-gray-300 block">x{item.quantity}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="max-w-md mx-auto pt-10 border-t-4 border-gray-50 w-full mt-auto">
                  <div className="flex justify-between items-center mb-10">
                    <span className="text-gray-500 uppercase tracking-[0.3em] font-black text-[11px]">Grand Total</span>
                    <span className="text-gray-900 text-5xl font-black">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4">
                    {(step !== 2 || !user) && (
                      <button
                        onClick={() => goToStep(1)}
                        className="flex-1 bg-gray-100 text-gray-600 py-6 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={() => goToStep(3)}
                      className="flex-[2] bg-pink-500 text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] active:translate-y-0 transition-all uppercase tracking-widest border-b-8 border-pink-700/30"
                    >
                      Go to Payment 💳
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handlePaymentSubmit} className="max-w-5xl mx-auto h-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
                {/* Left Side: Card Visual & Summary */}
                <div className="w-full lg:w-[45%] space-y-8 animate-in slide-in-from-left-4 duration-700">
                  <div className="bg-gradient-to-br from-[#8a7db3] to-pink-400 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-14">
                        <div className="w-14 h-10 bg-white/20 rounded-xl border border-white/30 backdrop-blur-md"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Mnostva Pay</span>
                      </div>
                      <div className="text-2xl font-mono tracking-[0.25em] mb-10 drop-shadow-lg text-white font-bold">
                        {form.cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-black uppercase opacity-60 mb-1">Card Holder</p>
                          <p className="text-sm font-black uppercase truncate max-w-[160px]">{form.name || 'Your Name'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase opacity-60 mb-1">Expires</p>
                          <p className="text-sm font-black">{form.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block bg-gray-50 p-8 rounded-[2.5rem] border-2 border-white shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total to Pay</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-gray-900">${totalPrice.toFixed(2)}</span>
                      <span className="text-pink-500 font-black text-xs uppercase animate-pulse">Ready to ship! 🚀</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Form & Actions */}
                <div className="w-full lg:w-[55%] space-y-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Card Number</label>
                      <input
                        required
                        type="text"
                        value={form.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[1.5rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Expiry</label>
                        <input
                          required
                          type="text"
                          value={form.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[1.5rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">CVC</label>
                        <input
                          required
                          type="text"
                          maxLength={3}
                          value={form.cvc}
                          onChange={handleCvcChange}
                          placeholder="123"
                          className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] focus:bg-white rounded-[1.5rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:hidden flex justify-between items-center py-6 border-t-2 border-gray-50">
                    <span className="text-gray-500 font-black uppercase text-[11px]">Total</span>
                    <span className="text-gray-900 text-4xl font-black">${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="flex-1 bg-gray-100 text-gray-600 py-6 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-sm order-2 sm:order-1"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-[#8a7db3] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] transition-all uppercase tracking-widest border-b-8 border-purple-800/30 order-1 sm:order-2"
                    >
                      Pay Now 🪄
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] opacity-80">
                    SECURE ENCRYPTED CHECKOUT
                  </p>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="text-center py-10 flex flex-col items-center animate-in zoom-in duration-700">
                <div className="w-36 h-36 bg-[#a2c367] text-white rounded-full flex items-center justify-center mx-auto text-6xl shadow-2xl animate-bounce mb-10 border-8 border-white">
                  ✓
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Magic Delivered!</h2>
                <p className="text-gray-600 font-bold text-xl mb-14 max-w-md mx-auto leading-relaxed">
                  Thank you for your purchase! Confirmation sent to <span className="text-[#8a7db3] font-black">{form.email}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg mx-auto">
                  <button onClick={onNavigateToProfile} className="flex-1 bg-[#8a7db3] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-4px] transition-all border-b-8 border-purple-800/30 text-lg">My Assets 📦</button>
                  <button onClick={onBack} className="flex-1 bg-gray-100 text-gray-700 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all border-b-8 border-gray-300/30 text-lg">Keep Shopping</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default CheckoutPage;
