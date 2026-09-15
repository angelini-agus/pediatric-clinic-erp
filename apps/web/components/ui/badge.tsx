import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand text-white shadow hover:bg-brand/90',
        secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
        destructive: 'border-transparent bg-red-500 text-white shadow hover:bg-red-600',
        outline: 'text-slate-950 border-slate-200',
        // Variantes de estado de turnos (Tailwind tokens)
        requested: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
        scheduled: 'border-sky-200 bg-sky-50 text-status-scheduled hover:bg-sky-100',
        canceled: 'border-red-200 bg-red-50 text-status-canceled hover:bg-red-100',
        inProgress: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
        completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = {} & React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
