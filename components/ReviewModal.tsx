import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reviewsService } from '../services/reviewsService';

interface ReviewModalProps {
    productId: string;
    productName: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ productId, productName, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError('Please write a comment');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Not authenticated');

            await reviewsService.create(productId, rating, comment, token);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors font-bold text-gray-500"
                >
                    ✕
                </button>

                <h3 className="text-2xl font-black text-gray-900 mb-2">Rate & Review</h3>
                <p className="text-gray-500 font-bold text-sm mb-6">
                    How do you like <span className="text-[#8a7db3]">{productName}</span>?
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                            {rating === 5 ? 'Amazing! 🤩' :
                                rating === 4 ? 'Good! 🙂' :
                                    rating === 3 ? 'Okay 😐' :
                                        rating === 2 ? 'Meh 😕' : 'Bad 😞'}
                        </p>
                    </div>

                    <div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this asset..."
                            className="w-full h-32 bg-gray-50 border-4 border-transparent focus:border-[#8a7db3] rounded-[1.5rem] p-4 font-bold text-gray-700 outline-none resize-none transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-[#8a7db3] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0 shadow-lg border-b-4 border-purple-800/20"
                        >
                            {isLoading ? 'Sending...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
