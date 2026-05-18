import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripeCheckoutFormProps {
    amount: number;
    onSuccess: () => void;
    onBack: () => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ amount, onSuccess, onBack }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is not strictly needed for 'never' redirect if we handle it here,
                // but usually required. We can point to a success page or handle inline.
                // For this implementation, we will try to handle it without full redirect if possible,
                // or just redirect to the current page with a query param.
                return_url: window.location.origin + '/checkout',
            },
            redirect: 'if_required', // Important: try to avoid redirect if not 3DS
        });

        if (error) {
            setErrorMessage(error.message || 'An unknown error occurred');
            setIsProcessing(false);
        } else {
            // Payment confirmed!
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-6">
                {/* Stripe Elements container */}
                <div className="bg-gray-50 border-4 border-transparent focus-within:border-[#8a7db3] focus-within:bg-white rounded-[1.5rem] p-6 transition-all shadow-inner min-h-[300px]">
                    <PaymentElement options={{
                        layout: "tabs",
                        paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
                    }} />
                </div>
            </div>

            {errorMessage && (
                <div className="mb-6 text-red-500 font-bold text-center bg-red-50 p-4 rounded-xl border-2 border-red-100 animate-pulse">
                    ⚠️ {errorMessage}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isProcessing}
                    className="flex-1 bg-gray-100 text-gray-600 py-6 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-sm order-2 sm:order-1 disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="flex-[2] bg-[#8a7db3] text-white py-6 rounded-[1.5rem] font-black text-xl shadow-xl hover:translate-y-[-4px] transition-all uppercase tracking-widest border-b-8 border-purple-800/30 order-1 sm:order-2 disabled:opacity-70 disabled:hover:translate-y-0 relative overflow-hidden"
                >
                    {isProcessing ? (
                        <span className="animate-pulse">Processing... 🪄</span>
                    ) : (
                        `Pay $${amount.toFixed(2)}`
                    )}
                </button>
            </div>
            <p className="mt-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] opacity-80 flex items-center justify-center gap-2">
                <span>🔒</span> SECURE ENCRYPTED CHECKOUT
            </p>
        </form>
    );
};

export default StripeCheckoutForm;
