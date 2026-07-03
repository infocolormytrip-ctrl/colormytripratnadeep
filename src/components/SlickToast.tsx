import React from 'react';
import { ToastItem } from '../context/DataContext';
import { CheckCircle2, XCircle, Info, AlertTriangle, Copy, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 w-full max-w-[340px] sm:max-w-sm pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onClose: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const { type, message, subMessage, duration = 4000, action } = toast;

  // Type specific configurations
  const config = (() => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
          borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
          progressBg: 'from-emerald-500 to-teal-400',
          glow: 'shadow-emerald-950/20'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
          borderColor: 'border-rose-500/20 hover:border-rose-500/40',
          progressBg: 'from-rose-500 to-red-400',
          glow: 'shadow-rose-950/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          borderColor: 'border-amber-500/20 hover:border-amber-500/40',
          progressBg: 'from-amber-500 to-orange-400',
          glow: 'shadow-amber-950/20'
        };
      case 'copy':
        return {
          icon: <Copy className="w-5 h-5 text-indigo-400 flex-shrink-0" />,
          borderColor: 'border-indigo-500/20 hover:border-indigo-500/40',
          progressBg: 'from-indigo-500 to-violet-400',
          glow: 'shadow-indigo-950/20'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />,
          borderColor: 'border-slate-800 hover:border-slate-700',
          progressBg: 'from-sky-500 to-blue-400',
          glow: 'shadow-slate-950/20'
        };
    }
  })();

  return (
    <div
      className={`animate-slide-left pointer-events-auto relative overflow-hidden rounded-2xl bg-slate-950/95 backdrop-blur-md border ${config.borderColor} p-4 shadow-xl flex gap-3 transition-all duration-300 hover:translate-y-[-2px] ${config.glow}`}
      role="alert"
    >
      {/* Icon */}
      <div className="mt-0.5">{config.icon}</div>

      {/* Content */}
      <div className="flex-grow min-w-0 pr-4">
        <h4 className="text-[13px] font-bold text-white leading-tight tracking-tight">
          {message}
        </h4>
        {subMessage && (
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed break-words font-medium">
            {subMessage}
          </p>
        )}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className="mt-2 text-[10px] font-black uppercase tracking-wider bg-indigo-650 hover:bg-indigo-700 active:scale-95 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Manual Close Button */}
      <button
        onClick={onClose}
        className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800/50 rounded-lg self-start cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Bottom timer progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r ${config.progressBg} animate-toast-progress`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};
