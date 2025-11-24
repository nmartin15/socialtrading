'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 disabled:bg-gray-700',
      icon: '⚠️',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700',
      icon: '⚡',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700',
      icon: 'ℹ️',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 shadow-xl">
        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center mb-4`}>
            <span className="text-2xl">{style.icon}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2">{title}</h3>

          {/* Message */}
          <p className="text-gray-400 mb-6">{message}</p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2.5 px-4 ${style.button} disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors`}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

