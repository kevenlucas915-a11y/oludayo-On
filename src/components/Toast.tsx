import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { activeToast } = useApp();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 animate-bounce">
      <div
        className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border ${
          activeToast.type === 'success'
            ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
            : activeToast.type === 'error'
            ? 'bg-red-900 text-white border-red-700 shadow-red-950/20'
            : 'bg-[#2C1810] text-[#FAF8F5] border-[#E6D5AC]/40 shadow-black/20'
        }`}
      >
        {activeToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {activeToast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
        {activeToast.type === 'info' && <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />}
        <span>{activeToast.message}</span>
      </div>
    </div>
  );
};
