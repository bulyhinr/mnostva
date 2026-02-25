import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isProcessing = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isProcessing ? onCancel : undefined}
            ></div>

            {/* Modal */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full relative z-10 border-4 border-white animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">
                    {title}
                </h3>

                <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all border-b-4 border-pink-700/20 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
