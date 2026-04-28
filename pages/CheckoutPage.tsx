
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { couponService } from '../services/couponService';
import ImageWithFallback from '../components/ImageWithFallback';
// Stripe imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalButtons } from "@paypal/react-paypal-js";
import StripeCheckoutForm from '../components/StripeCheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutPageProps {
  onSuccess: () => void;
  onBack: () => void;
  onNavigateToProfile: () => void;
  onNavigateToLogin: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onSuccess, onBack, onNavigateToProfile, onNavigateToLogin }) => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { user, register, addOrder } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryOrderId = queryParams.get('orderId');
  const state = location.state as { clientSecret?: string; orderId?: string; totalAmount?: number } | null;

  const orderId = state?.orderId || queryOrderId;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(state?.clientSecret ? 3 : (orderId ? 3 : (user ? 2 : 1)));
  const [isProcessing, setIsProcessing] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Stripe Session State
  const [clientSecret, setClientSecret] = useState<string>(state?.clientSecret || '');
  const [paypalOrderId, setPaypalOrderId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [stripeError, setStripeError] = useState<string>('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ discountPercentage: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [existingOrderAmount, setExistingOrderAmount] = useState<number | null>(state?.totalAmount || null);
  const [existingOrderItems, setExistingOrderItems] = useState<any[]>([]);

  const displayTotal = existingOrderAmount !== null ? existingOrderAmount : totalPrice;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    createAccount: true
  });

  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!orderId && cart.length === 0 && step !== 4) {
      onBack();
    }
  }, [cart, step, onBack, orderId]);

  // Fetch Order Details if missing (e.g. "Pay Now" flow where clientSecret is passed but items are not)
  useEffect(() => {
    if (step === 3 && orderId && existingOrderItems.length === 0) {
      const fetchOrderDetails = async () => {
        try {
          const token = authService.getAccessToken();
          if (!token) return;
          const myOrders = await orderService.getMyOrders(token);
          const order = myOrders.find(o => o.id === orderId);
          if (order) {
            setExistingOrderAmount(order.total);
            setExistingOrderItems(order.items || []);
          }
        } catch (e) {
          console.error("Failed to fetch order details", e);
        }
      };
      fetchOrderDetails();
    }
  }, [step, orderId, existingOrderItems.length]);

  // Fetch Checkout Session when entering Step 3 (Payment)
  useEffect(() => {
    if (step === 3 && !clientSecret) {
      const initPayment = async () => {
        setIsProcessing(true);
        try {
          const token = authService.getAccessToken();
          if (!token) throw new Error('Not authenticated');

          if (orderId) {
            // Recovery mode or "Pay Now" from profile
            const data = await orderService.getPaymentDetails(orderId, token);
            if (data.clientSecret) {
              setPaymentMethod('stripe');
              setClientSecret(data.clientSecret);
            } else if (data.paypalOrderId) {
              setPaymentMethod('paypal');
              setPaypalOrderId(data.paypalOrderId);
            }

            // Fetch order items to show in summary
            const myOrders = await orderService.getMyOrders(token);
            const order = myOrders.find(o => o.id === orderId);
            if (order) {
              setExistingOrderAmount(order.total);
              setExistingOrderItems(order.items || []);
            }
          } else {
            // Normal flow from cart
            const items = cart.flatMap(item =>
              Array(item.quantity).fill({ productId: item.id, licenseType: item.licenseType })
            );
            const data = await orderService.createCheckoutSession(items, token, appliedCoupon ? couponCode : undefined, paymentMethod);
            
            if (data.isFree || data.status === 'paid') {
              clearCart();
              goToStep(4);
              return;
            }

            if (paymentMethod === 'stripe') {
              setClientSecret(data.clientSecret || '');
            } else {
              setPaypalOrderId(data.paypalOrderId || '');
            }

            // Update URL to include orderId so refresh works
            navigate(`/checkout?orderId=${data.orderId}`, {
              replace: true,
              state: { ...state, orderId: data.orderId, clientSecret: data.clientSecret }
            });
          }
        } catch (err: any) {
          console.error("Failed to init payment:", err);
          setStripeError(err?.response?.data?.message || err?.message || 'Failed to initialize payment');
        } finally {
          setIsProcessing(false);
        }
      };
      initPayment();
    }
  }, [step, cart, clientSecret, paypalOrderId, orderId, existingOrderAmount, paymentMethod]);

  const goToStep = (nextStep: 1 | 2 | 3 | 4) => {
    if (nextStep < 3) {
      setClientSecret('');
      setPaypalOrderId('');
      if (cart.length > 0) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
    setDirection(nextStep > step ? 'forward' : 'backward');
    setStep(nextStep);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const result = await couponService.validateCoupon(couponCode);
      if (result.valid) {
        setAppliedCoupon({ discountPercentage: result.discountPercentage });
      }
    } catch (e: any) {
      setAppliedCoupon(null);
      setCouponError(e.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      if (!form.password) {
        alert("Please enter a password to create an account.");
        return;
      }
      try {
        await register(form.name, form.email, form.password);
      } catch (error: any) {
        console.error("Registration during checkout failed:", error);

        // Extract error message similar to LoginPage
        let errorMessage = "Registration failed. Please check your details.";
        if (error.response && error.response.data && error.response.data.message) {
          const msg = error.response.data.message;
          errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        }

        // Display error in a better way (using alert for now, but ideally a state-based UI)
        // If "Email already exists", guide user
        if (errorMessage.toLowerCase().includes('email already exists')) {
          setShowErrorModal(true);
        } else {
          alert(errorMessage);
        }
        return;
      }
    }

    goToStep(2);
  };

  const handlePaymentSuccess = async () => {
    // Payment confirmed by Stripe Element
    // Ideally webhook handles this, but we force verify for robustness
    setIsProcessing(true);
    try {
      if (orderId) {
        const token = authService.getAccessToken();
        if (token) {
          const updatedOrder = await orderService.verifyPayment(orderId, token);
          // Strict check: Only show success screen if server says "paid"
          if (updatedOrder.status === 'paid') {
            clearCart();
            goToStep(4);
          } else {
            console.warn("Payment verification failed or pending. Status:", updatedOrder.status);
            setStripeError("Payment is processing but not yet confirmed. Please check your profile shortly.");
            // Optional: You could redirect to profile or stay here
            // For now, let's keep them on the payment screen with a message
          }
        }
      }
    } catch (e: any) {
      console.error("Verification failed:", e);
      setStripeError(e?.message || "Could not verify payment. Please check your order history.");
    } finally {
      setIsProcessing(false);
    }
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

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#8a7db3',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '1.5rem',
    },
    rules: {
      '.Tab': {
        border: '2px solid #e5e7eb',
        boxShadow: 'none',
      },
      '.Tab:hover': {
        border: '2px solid #edebf5',
      },
      '.Tab--selected': {
        borderColor: '#8a7db3',
        boxShadow: 'none',
      }
    }
  };

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
          {isProcessing && step !== 3 && ( // Step 3 has its own loading/processing UI inside Elements usually or we handle differently
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
                {/* Form fields same as before... omit for brevity if unchanged, but I must replace full content */}
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
                  <div className="animate-in fade-in slide-in-from-top-2 mb-6 mt-6">
                    <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-4">Password</label>
                    <input
                      required
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Create a password (min 6 chars)"
                      minLength={6}
                      className="w-full bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-[1.5rem] px-8 py-5 font-bold outline-none transition-all text-gray-900 shadow-inner"
                    />
                  </div>

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
                  <div className="mb-6 flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. SUMMER20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="flex-grow bg-gray-50 border-2 border-gray-200 focus:border-[#8a7db3] rounded-xl px-4 py-3 text-sm font-bold outline-none uppercase transition-all"
                    />
                    {appliedCoupon ? (
                      <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="bg-red-100 text-red-500 px-4 rounded-xl font-bold uppercase text-xs hover:bg-red-200 transition-colors">Remove</button>
                    ) : (
                      <button onClick={handleApplyCoupon} disabled={isValidatingCoupon} className="bg-[#8a7db3] text-white px-6 rounded-xl font-black uppercase text-xs hover:bg-[#736696] transition-colors">{isValidatingCoupon ? 'Wait...' : 'Apply'}</button>
                    )}
                  </div>
                  {couponError && <p className="text-red-500 text-xs font-bold mb-4 ml-2">{couponError}</p>}
                  {appliedCoupon && <p className="text-pink-500 text-xs font-black mb-4 ml-2 animate-pulse">✨ {appliedCoupon.discountPercentage}% off applied!</p>}

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 uppercase tracking-[0.3em] font-black text-[11px]">Grand Total</span>
                    <div className="text-right">
                      {appliedCoupon && <span className="text-gray-400 line-through text-sm mr-2 font-bold">${totalPrice.toFixed(2)}</span>}
                      <span className="text-gray-900 text-5xl font-black">
                        {(totalPrice * (1 - (appliedCoupon?.discountPercentage || 0) / 100)) === 0 
                          ? 'Free Pack' 
                          : `$${(totalPrice * (1 - (appliedCoupon?.discountPercentage || 0) / 100)).toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {(totalPrice * (1 - (appliedCoupon?.discountPercentage || 0) / 100)) > 0 && (
                    <div className="mb-6">
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-3">Select Payment Method</p>
                      <div className="flex gap-4">
                        <button onClick={() => setPaymentMethod('stripe')} className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold border-4 transition-all ${paymentMethod === 'stripe' ? 'border-[#8a7db3] bg-purple-50 text-[#8a7db3]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          <span className="text-2xl">💳</span>
                          <span className="text-xs uppercase tracking-wider">Card</span>
                        </button>
                        <button onClick={() => setPaymentMethod('paypal')} className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold border-4 transition-all ${paymentMethod === 'paypal' ? 'border-[#003087] bg-blue-50 text-[#003087]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          <svg viewBox="0 0 32 32" className="h-8 w-8 mb-[-4px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.012 12.017c-.36-1.526-1.423-2.584-3.153-2.964-1.282-.284-3.033-.284-4.99-.284H11.75c-.504 0-.936.386-1.025.885L8.536 23.513a.625.625 0 0 0 .616.73h3.456c.504 0 .937-.385 1.026-.885l1.118-7.14c.089-.498.52-.884 1.025-.884h1.996c3.084 0 5.61-1.332 6.27-4.004.285-1.154.215-2.072-.03-2.613v-.7z" fill="currentColor"/>
                            <path d="M22.012 12.017c-.255 1.027-.614 1.838-1.22 2.45-1.018 1.026-2.578 1.542-4.524 1.542h-1.997c-.503 0-.935.385-1.024.884l-1.118 7.14a.626.626 0 0 0 .616.73h3.456c.504 0 .936-.385 1.025-.885l1.01-6.427c.088-.498.52-.884 1.024-.884h.994c2.825 0 4.966-1.12 5.576-3.328.326-1.173.28-2.483-.435-3.618-.266-.418-.61-.83-1.055-1.135-.558-.383-1.178-.65-1.328-.47z" fill="currentColor" fillOpacity="0.8"/>
                          </svg>
                          <span className="text-xs uppercase tracking-wider">PayPal</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          goToStep(1);
                        } else {
                          onBack();
                        }
                      }}
                      className="flex-1 bg-gray-100 text-gray-600 py-6 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => goToStep(3)}
                      className="flex-[2] bg-pink-500 text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] active:translate-y-0 transition-all uppercase tracking-widest border-b-8 border-pink-700/30"
                    >
                      {totalPrice === 0 ? 'Get Free Pack 🎁' : 'Go to Payment 💳'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-5xl mx-auto h-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

                {/* Left Side: Summary - Simplified for Stripe Flow */}
                <div className="w-full lg:w-[45%] space-y-8 animate-in slide-in-from-left-4 duration-700">
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-white shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total to Pay</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-gray-900">
                        {(displayTotal || 0) === 0 ? 'Free Pack' : `$${(displayTotal || 0).toFixed(2)}`}
                      </span>
                      <span className="text-pink-500 font-black text-xs uppercase animate-pulse">Ready to ship! 🚀</span>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-8 rounded-[2.5rem] border-2 border-white shadow-sm">
                    <h3 className="font-black text-[#8a7db3] mb-4">Order Summary</h3>
                    <ul className="space-y-3">
                      {cart.length > 0 ? (
                        cart.map((item, idx) => (
                          <li key={`${item.id}-${idx}`} className="flex justify-between text-sm font-bold text-gray-600">
                            <span>{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                            <span>
                              {item.discount?.isActive ? (
                                <span className="text-pink-500">${((item.price * (1 - item.discount.percentage / 100)) * item.quantity).toFixed(2)}</span>
                              ) : (
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              )}
                            </span>
                          </li>
                        ))
                      ) : existingOrderItems.length > 0 ? (
                        existingOrderItems.map((item, idx) => (
                          <li key={`${item.id}-${idx}`} className="flex justify-between text-sm font-bold text-gray-600">
                            <span>{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                            <span>${((item.price || 0) / 1).toFixed(2)}</span>
                          </li>
                        ))
                      ) : orderId ? (
                        <li className="flex justify-between text-sm font-bold text-gray-600">
                          <span className="text-[#8a7db3] uppercase tracking-wider">Pending Order Payment</span>
                          <span>${(displayTotal || 0).toFixed(2)}</span>
                        </li>
                      ) : (
                        <li className="text-gray-400 italic text-sm">No items details available</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Right Side: Stripe Elements */}
                <div className="w-full lg:w-[55%] animate-in slide-in-from-right-4 duration-700">
                  {isProcessing && !clientSecret && !paypalOrderId ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-16 h-16 border-4 border-gray-100 border-t-[#8a7db3] rounded-full animate-spin mb-4"></div>
                      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Initializing Secure Checkout...</p>
                    </div>
                  ) : stripeError ? (
                    <div className="text-center py-10">
                      <p className="text-red-500 font-bold mb-4">⚠️ {stripeError}</p>
                      <button onClick={() => goToStep(2)} className="text-[#8a7db3] font-black hover:underline">Try Again</button>
                    </div>
                  ) : (
                    paymentMethod === 'stripe' && clientSecret ? (
                      <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                        <StripeCheckoutForm
                          amount={displayTotal || 0}
                          onSuccess={handlePaymentSuccess}
                          onBack={() => {
                            if (cart.length > 0) {
                               goToStep(2);
                            } else {
                               window.history.back();
                            }
                          }}
                        />
                      </Elements>
                    ) : paymentMethod === 'paypal' && paypalOrderId ? (
                      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm">
                        <h3 className="font-black text-gray-800 text-xl mb-6 text-center">Complete with PayPal</h3>
                        <PayPalButtons 
                          style={{ layout: "vertical", shape: "pill" }}
                          createOrder={(data, actions) => {
                            return Promise.resolve(paypalOrderId);
                          }}
                          onApprove={async (data, actions) => {
                            setIsProcessing(true);
                            try {
                              const token = authService.getAccessToken();
                              if (!token) throw new Error("Not authenticated");
                              
                              // Use internal orderId, not PayPal's data.orderID
                              if (!orderId) throw new Error("Missing local order ID");
                              const updatedOrder = await orderService.capturePayPalOrder(orderId, token);
                              
                              if (updatedOrder.status === 'paid') {
                                clearCart();
                                goToStep(4);
                              } else {
                                setStripeError("Payment is processing but not yet confirmed. Please check your profile shortly.");
                              }
                            } catch (e: any) {
                              setStripeError(e?.message || "Could not verify payment. Please check your order history.");
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          onError={(err) => {
                            setStripeError("PayPal encountered an error. Please try again.");
                          }}
                          onCancel={() => {
                             // User cancelled, do nothing
                          }}
                        />
                        <button onClick={() => {
                          if (cart.length > 0) {
                            goToStep(2);
                          } else {
                            window.history.back();
                          }
                        }} className="w-full mt-6 text-gray-400 font-bold uppercase text-xs hover:text-[#8a7db3] transition-colors">← Go Back</button>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-10 flex flex-col items-center animate-in zoom-in duration-700">
                <div className="w-36 h-36 bg-[#a2c367] text-white rounded-full flex items-center justify-center mx-auto text-6xl shadow-2xl animate-bounce mb-10 border-8 border-white">
                  ✓
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Magic Delivered!</h2>
                <p className="text-gray-600 font-bold text-xl mb-14 max-w-md mx-auto leading-relaxed">
                  Thank you for your purchase! Confirmation has been sent to your email.
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

      {/* Custom Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 relative border-4 border-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                👋
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Welcome Back!</h3>
              <p className="text-gray-600 font-bold mb-8">
                It looks like <span className="text-[#8a7db3]">{form.email}</span> is already registered. Would you like to login to continue?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={onNavigateToLogin}
                  className="flex-1 bg-[#8a7db3] text-white py-4 rounded-xl font-black shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all uppercase tracking-wider text-xs border-b-4 border-purple-800/20"
                >
                  Login Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
