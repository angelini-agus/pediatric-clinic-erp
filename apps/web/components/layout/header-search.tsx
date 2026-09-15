'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type HeaderSearchProps = {
  /**
   * Optional debounce delay (ms) before pushing the search term to the URL.
   * Defaults to 300 ms — corto para UX snappy pero suficiente para evitar
   * una entrada en history por cada keystroke.
   */
  debounceMs?: number;
  /**
   * Tailwind classes for the wrapper. Allows parent to control visibility
   * (e.g. `hidden sm:flex` in the desktop header).
   */
  className?: string;
};

const SEARCH_PATH = '/patients';

/**
 * HeaderSearch — Client Component que activa el input de búsqueda global.
 *
 * Flujo:
 *  1. Estado local `query` refleja el input.
 *  2. `useEffect` con debounce llama a `router.replace(/patients?q=…)` cuando
 *     cambia `query` (después del debounce). Usamos `replace` (no `push`)
 *     para no inflar el history con cada keystroke.
 *  3. La página `/patients` lee `searchParams.q` y pre-popula el filtro
 *     local de `PatientsGrid` (filtrado client-side, instantáneo).
 *  4. Submit (Enter) hace un push inmediato para que el usuario pueda
 *     volver atrás a la búsqueda anterior.
 *
 * SSR-safe: arranca con `query=''`, así el primer render del server y el
 * cliente coinciden (no hay mismatch de hydration).
 */
export function HeaderSearch({
  debounceMs = 300,
  className,
}: HeaderSearchProps): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True once the user has actually typed/cleared the input. Without this
  // guard the debounced effect would fire `router.replace('/patients')` on
  // MOUNT (empty query), hijacking every dashboard page to /patients ~300ms
  // after load — breaking navigation anywhere in the app.
  const hasTypedRef = useRef(false);

  // Debounced URL update — se dispara cuando el usuario cambia `query`.
  useEffect(() => {
    if (query !== '') {
      hasTypedRef.current = true;
    }

    // Never navigate away on mount: query is '' and nobody typed yet.
    if (!hasTypedRef.current) return;

    const trimmed = query.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const target = trimmed ? `${SEARCH_PATH}?q=${encodeURIComponent(trimmed)}` : SEARCH_PATH;
      router.replace(target);
    }, debounceMs);

    return (): void => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [query, debounceMs, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const trimmed = query.trim();
    const target = trimmed ? `${SEARCH_PATH}?q=${encodeURIComponent(trimmed)}` : SEARCH_PATH;
    router.push(target);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 w-52 shadow-sm',
        className,
      )}
    >
      <label htmlFor="global-search" className="sr-only">
        Buscar paciente
      </label>
      <Search className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
      <input
        id="global-search"
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder="Buscar paciente..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        className="w-full min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
    </form>
  );
}
