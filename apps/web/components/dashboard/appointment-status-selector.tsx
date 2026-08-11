'use client';

import { ChevronDown, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

import type { AppointmentStatus } from '@pediatric-erp/schemas';
import type { VariantProps } from 'class-variance-authority';

import { Badge, type badgeVariants } from '@/components/ui/badge';
import { getClientAuthHeaders } from '@/lib/api';
import { cn } from '@/lib/utils';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

// ── Mappings ──────────────────────────────────────────────────────────────────

const STATUS_TO_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

const STATUS_OPTIONS: { value: AppointmentStatus; label: string; dotColor: string }[] = [
  { value: 'SCHEDULED', label: 'Programado', dotColor: 'bg-sky-500' },
  { value: 'IN_PROGRESS', label: 'En Curso', dotColor: 'bg-amber-500' },
  { value: 'COMPLETED', label: 'Completado', dotColor: 'bg-emerald-500' },
  { value: 'CANCELED', label: 'Cancelado', dotColor: 'bg-red-500' },
];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En Curso',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};

// ── Props ─────────────────────────────────────────────────────────────────────

type AppointmentStatusSelectorProps = {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AppointmentStatusSelector({
  appointmentId,
  currentStatus,
}: AppointmentStatusSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(currentStatus);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if prop updates
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const API_URL =
    process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    setIsOpen(false);
    if (newStatus === selectedStatus) return;

    setIsUpdating(true);
    const previousStatus = selectedStatus;
    setSelectedStatus(newStatus); // Optimistic UI update

    try {
      const res = await fetch(
        `${API_URL}/appointments/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getClientAuthHeaders(),
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) {
        console.error(`[status-selector] PATCH status failed: ${res.status}`);
        setSelectedStatus(previousStatus); // Revert optimistic update
        return;
      }

      // Refresh server components to synchronize server state
      router.refresh();
    } catch (error) {
      console.error('[status-selector] Network error updating status:', error);
      setSelectedStatus(previousStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => { setIsOpen((prev) => !prev); }}
        className={cn(
          'inline-flex items-center gap-1.5 focus:outline-none transition-all rounded-full',
          isUpdating && 'opacity-50 pointer-events-none cursor-wait',
        )}

      >
        <Badge
          variant={STATUS_TO_VARIANT[selectedStatus]}
          className="cursor-pointer hover:shadow-xs flex items-center gap-1 py-1 px-3 text-xs"
        >
          <span>{STATUS_LABELS[selectedStatus]}</span>
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin text-current" />
          ) : (
            <ChevronDown
              className={cn(
                'h-3 w-3 text-current transition-transform duration-150',
                isOpen && 'rotate-180',
              )}
            />
          )}
        </Badge>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-40 rounded-2xl bg-white/95 backdrop-blur-xl p-1.5 shadow-lg border border-slate-100 ring-1 ring-slate-900/5 animate-in fade-in-50 zoom-in-95">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1 mb-0.5">
            Cambiar Estado
          </div>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = opt.value === selectedStatus;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusChange(opt.value)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors text-left',
                  isSelected
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', opt.dotColor)} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
