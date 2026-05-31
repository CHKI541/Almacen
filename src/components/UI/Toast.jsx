import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Colores y estilos según tipo
  let bgClass = 'bg-white border-emerald-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800';
  let iconColor = 'text-emerald-500';
  let progressColor = 'bg-emerald-500';
  let Icon = CheckCircle2;

  if (type === 'error') {
    bgClass = 'bg-white border-rose-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800';
    iconColor = 'text-rose-500';
    progressColor = 'bg-rose-500';
    Icon = AlertCircle;
  } else if (type === 'info') {
    bgClass = 'bg-white border-indigo-100 text-slate-800 dark:bg-slate-900 dark:border-slate-800';
    iconColor = 'text-indigo-500';
    progressColor = 'bg-indigo-500';
    Icon = Info;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-slideIn">
      <div className="flex items-center gap-3 p-4">
        {/* Icono de estado */}
        <div className={iconColor}>
          <Icon size={20} className="stroke-[2.5]" />
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
            {type === 'success' && 'Éxito'}
            {type === 'error' && 'Error'}
            {type === 'info' && 'Información'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{message}</p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={14} />
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
        <div 
          style={{ animationDuration: `${duration}ms` }} 
          className={`h-full ${progressColor} animate-shrink`}
        />
      </div>
    </div>
  );
}
