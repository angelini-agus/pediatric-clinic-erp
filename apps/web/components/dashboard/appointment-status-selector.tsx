'use client';

import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge, type badgeVariants } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CLIENT_API_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

import type { AppointmentStatus } from '@pediatric-erp/schemas';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

// ── Mappings ──────────────────────────────────────────────────────────────────

const STATUS_TO_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  REQUESTED: 'requested',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

const STATUS_OPTIONS: readonly {
  value: AppointmentStatus;
  label: string;
  dotColor: string;
}[] = [
  { value: 'REQUESTED', label: 'Solicitado', dotColor: 'bg-violet-500' },
  { value: 'SCHEDULED', label: 'Programado', dotColor: 'bg-sky-500' },
  { value: 'IN_PROGRESS', label: 'En Curso', dotColor: 'bg-amber-500' },
  { value: 'COMPLETED', label: 'Completado', dotColor: 'bg-emerald-500' },
  { value: 'CANCELED', label: 'Cancelado', dotColor: 'bg-red-500' },
];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  REQUESTED: 'Solicitado',
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Curso',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};

// ── Props ─────────────────────────────────────────────────────────────────────

type AppointmentStatusSelectorProps = {
  appointmentId: string;
  currentStatus: AppointmentStatus;
};

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * AppointmentStatusSelector — dropdown a11y-compliant powered by Radix.
 *
 * Accesibilidad:
 *  - Radix gestiona focus-trap, navegación con flechas ↑/↓, Escape para
 *    cerrar, click-outside, type-ahead, y ARIA roles (`menu`/`menuitem`)
 *    automáticamente. Reemplaza el `useState` + `useRef` + `useEffect`
 *    manual que era inaccesible por teclado.
 *  - El trigger lleva `aria-label` descriptivo para usuarios de screen
 *    reader que escuchan solo el badge.
 *
 * UX:
 *  - Optimistic UI: al seleccionar un estado, el badge se actualiza
 *    inmediatamente. Si el PATCH falla, se revierte al estado previo.
 *  - `router.refresh()` reconcilia el server-state con el cliente tras
 *    una mutación exitosa.
 */
export function AppointmentStatusSelector({
  appointmentId,
  currentStatus,
}: AppointmentStatusSelectorProps): React.JSX.Element {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  // Keep local state in sync with the prop when it changes upstream
  // (e.g., after router.refresh() refetches).
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (newStatus: AppointmentStatus): Promise<void> => {
    if (newStatus === selectedStatus || isUpdating) return;

    const previousStatus = selectedStatus;
    setSelectedStatus(newStatus); // Optimistic
    setIsUpdating(true);

    try {
      const res = await fetch(`${CLIENT_API_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        console.error(`[status-selector] PATCH failed: ${String(res.status)}`);
        setSelectedStatus(previousStatus); // Revert
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('[status-selector] Network error:', error);
      setSelectedStatus(previousStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const triggerLabel = `Estado del turno: ${STATUS_LABELS[selectedStatus]}. Cambiar.`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isUpdating} aria-label={triggerLabel}>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
            isUpdating && 'opacity-50 cursor-wait',
          )}
        >
          <Badge
            variant={STATUS_TO_VARIANT[selectedStatus]}
            className="cursor-pointer hover:shadow-xs flex items-center gap-1 py-1 px-3 text-xs"
          >
            <span>{STATUS_LABELS[selectedStatus]}</span>
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin text-current" /> : null}
          </Badge>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={6} className="w-44">
        <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = opt.value === selectedStatus;
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => {
                void handleStatusChange(opt.value);
              }}
              disabled={isUpdating}
              className={cn(
                'flex items-center justify-between gap-2',
                isSelected && 'bg-slate-100/80 font-semibold',
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', opt.dotColor)} />
                <span>{opt.label}</span>
              </span>
              {isSelected && <Check className="h-3.5 w-3.5 text-brand" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
