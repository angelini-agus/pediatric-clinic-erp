'use client';

import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendar — styled react-day-picker wrapper.
 * Matches the brand color system (brand-500 = #6366f1).
 * Glassmorphism container is applied by the parent PopoverContent.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps): React.JSX.Element {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn('p-3 select-none', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex items-center justify-center pt-1 relative',
        caption_label: 'text-sm font-semibold text-slate-800 capitalize',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          'absolute left-1 inline-flex items-center justify-center',
          'h-7 w-7 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm',
          'text-slate-500 hover:text-slate-800 hover:bg-white/90 transition-all',
        ),
        button_next: cn(
          'absolute right-1 inline-flex items-center justify-center',
          'h-7 w-7 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm',
          'text-slate-500 hover:text-slate-800 hover:bg-white/90 transition-all',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-slate-400 rounded-md w-9 font-normal text-[0.8rem] text-center',
        week: 'flex w-full mt-1',
        day: cn('relative p-0 text-center text-sm', 'focus-within:relative focus-within:z-20'),
        day_button: cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-medium',
          'h-9 w-9 transition-all',
          'hover:bg-brand/10 hover:text-brand',
          'focus:outline-none focus:ring-2 focus:ring-brand/30',
          'disabled:pointer-events-none disabled:opacity-30',
        ),
        selected:
          '[&>button]:bg-brand [&>button]:text-white [&>button]:hover:bg-brand-600 [&>button]:hover:text-white [&>button]:font-semibold',
        today: '[&>button]:text-brand [&>button]:font-semibold',
        outside:
          '[&>button]:text-slate-300 [&>button]:aria-selected:bg-brand/50 [&>button]:aria-selected:text-slate-500',
        disabled: '[&>button]:text-slate-300',
        range_middle: '[&>button]:aria-selected:bg-brand/10 [&>button]:aria-selected:text-brand',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
