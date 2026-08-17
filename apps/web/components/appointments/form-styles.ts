/**
 * Shared styling tokens for the appointment form sub-components.
 *
 * Centralizing these constants keeps the visual language consistent
 * (border, focus ring, label) without spreading the same `cn(...)`
 * strings across every sub-component.
 */

import { cn } from '@/lib/utils';

export const labelClass =
  'text-xs font-semibold text-slate-600 uppercase tracking-wider';

export const triggerClass = (hasError: boolean): string =>
  cn(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80',
    'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
    hasError ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
  );

export const errorClass = 'text-xs text-rose-500';
