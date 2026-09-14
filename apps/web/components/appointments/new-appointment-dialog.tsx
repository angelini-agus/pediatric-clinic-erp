'use client';

import { CalendarPlus, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';

// El formulario arrastra react-day-picker + date-fns + radix (~decenas de kB).
// Se carga on-demand recién cuando el usuario abre el diálogo, para no
// engordar el JS inicial de la ruta /appointments.
const NewAppointmentForm = dynamic(
  () => import('./new-appointment-form').then((mod) => mod.NewAppointmentForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-10 text-sm text-slate-400">
        Cargando formulario…
      </div>
    ),
  },
);

// ── Component ─────────────────────────────────────────────────────────────────

export function NewAppointmentDialog(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const open = (): void => {
    setIsOpen(true);
  };
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return (): void => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, close]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return (): void => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        id="btn-new-appointment"
        data-testid="btn-new-appointment"
        onClick={open}
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-600 active:scale-[0.98]"
      >
        <CalendarPlus className="h-4 w-4" />
        Nuevo Turno
      </button>

      {/* Backdrop + Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="na-dialog-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl shadow-card-shell border border-slate-200/60 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 id="na-dialog-title" className="text-base font-bold text-slate-900">
                  Nuevo Turno
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Agendá un turno médico pediátrico</p>
              </div>
              <button
                type="button"
                id="btn-close-new-appointment"
                onClick={close}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="px-6 py-5 overflow-y-auto no-scrollbar">
              <NewAppointmentForm onSuccess={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
