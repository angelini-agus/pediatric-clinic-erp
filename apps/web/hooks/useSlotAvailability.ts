'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { CLIENT_API_URL } from '@/lib/api';

type UseSlotAvailabilityResult = {
  /** Set of HH:MM strings occupied by non-CANCELED appointments. */
  bookedTimes: Set<string>;
  /** True while a fetch for the current doctor/date is in flight. */
  isChecking: boolean;
};

/**
 * Reads the upcoming-appointments feed and returns the set of HH:MM
 * time slots already taken by the selected doctor on the selected date.
 * CANCELED appointments are intentionally excluded — they free the slot.
 *
 * Re-fetches whenever `doctorId` or `date` changes. When either is empty
 * the hook short-circuits to an empty set (no network call).
 *
 * Designed to be consumed by `DateTimePicker` to mark occupied slots as
 * disabled in the time-select dropdown.
 */
export function useSlotAvailability(
  doctorId: string | undefined,
  date: Date | undefined,
): UseSlotAvailabilityResult {
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!doctorId || !date) {
      setBookedTimes(new Set());
      return;
    }

    let cancelled = false;
    const selectedDateStr = format(date, 'yyyy-MM-dd');

    const checkAvailability = async (): Promise<void> => {
      setIsChecking(true);
      try {
        const res = await fetch(`${CLIENT_API_URL}/appointments/upcoming`, {
          cache: 'no-store',
        });
        if (!res.ok) return;

        const json: unknown = await res.json();
        if (!Array.isArray(json)) return;

        const taken = new Set<string>();
        for (const appt of json as {
          doctorId: string;
          dateTime: string;
          status: string;
        }[]) {
          if (appt.doctorId !== doctorId) continue;
          if (appt.status === 'CANCELED') continue;

          const apptDate = new Date(appt.dateTime);
          if (format(apptDate, 'yyyy-MM-dd') !== selectedDateStr) continue;

          const hh = String(apptDate.getHours()).padStart(2, '0');
          const mm = String(apptDate.getMinutes()).padStart(2, '0');
          taken.add(`${hh}:${mm}`);
        }

        if (!cancelled) setBookedTimes(taken);
      } catch {
        // Network failure → leave bookedTimes unchanged (all slots open).
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    void checkAvailability();
    return (): void => {
      cancelled = true;
    };
  }, [doctorId, date]);

  return { bookedTimes, isChecking };
}
