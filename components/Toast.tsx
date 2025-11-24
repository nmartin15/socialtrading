'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-900/90 border-green-500',
      icon: '✓',
      iconBg: 'bg-green-500',
    },
    error: {
      bg: 'bg-red-900/90 border-red-500',
      icon: '✕',
      iconBg: 'bg-red-500',
    },
    info: {
      bg: 'bg-blue-900/90 border-blue-500',
      icon: 'ℹ',
      iconBg: 'bg-blue-500',
    },
  };

  const style = styles[type];

  return (
    <div className={`fixed top-4 right-4 z-[100] ${style.bg} border rounded-lg shadow-lg backdrop-blur-sm p-4 max-w-md animate-in slide-in-from-top-2 fade-in duration-300`}>
      <div className="flex items-start gap-3">
        <div className={`${style.iconBg} w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
          {style.icon}
        </div>
        <p className="text-white flex-1 pr-4">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

