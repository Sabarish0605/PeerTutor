import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Reusable Confirmation Modal
 * Replaces native browser window.confirm() dialogs.
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
    loading = false,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
            btnBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30',
            icon: Trash2,
        },
        warning: {
            iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
            btnBg: 'bg-amber-600 hover:bg-amber-500 text-black font-bold shadow-amber-900/30',
            icon: AlertTriangle,
        },
        primary: {
            iconBg: 'bg-[#00C2CB]/10 border-[#00C2CB]/20 text-[#00C2CB]',
            btnBg: 'bg-[#00C2CB] hover:bg-[#00d6e0] text-[#0f0f0f] font-bold shadow-cyan-900/30',
            icon: AlertTriangle,
        },
    };

    const currentVariant = variantStyles[confirmVariant] || variantStyles.danger;
    const IconComponent = currentVariant.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full max-w-md bg-[#161616] border border-[#282828] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-[#777] hover:text-[#f1f1f1] p-1.5 rounded-lg hover:bg-[#222] transition cursor-pointer disabled:opacity-50"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border flex-shrink-0 ${currentVariant.iconBg}`}>
                        <IconComponent size={24} />
                    </div>

                    <div className="flex-1 pr-6">
                        <h3 className="text-lg font-bold text-[#f1f1f1] m-0 mb-1.5">
                            {title}
                        </h3>
                        <p className="text-sm text-[#999999] leading-relaxed m-0">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#222222]">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-[#888888] hover:text-[#f1f1f1] bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] transition cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2 ${currentVariant.btnBg}`}
                    >
                        {loading && (
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
