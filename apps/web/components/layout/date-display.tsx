'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type DateDisplayProps = {
  /**
   * IETF BCP 47 locale tag. Defaults to `'es-AR'`.
   */
  locale?: string;
  /**
   * Tailwind classes applied to the `<time>` element.
   */
  className?: string;
};

/**
 * DateDisplay — Client Component que muestra la fecha actual **en el cliente**.
 *
 * ¿Por qué Client Component?
 * Renderizar `new Date()` durante el SSR produciría una fecha calculada
 * en el server (que se hidrata en el cliente) y, dependiendo de la zona
 * horaria del usuario y del momento del request, podría no coincidir con
 * lo que el cliente espera ver, disparando el clásico error de hidratación:
 *
 *   "Hydration failed because the initial UI does not match what was
 *    rendered on the server."
 *
 * Estrategia: el server emite un `<time>` vacío (`<time suppressHydrationWarning>`);
 * tras el primer render del cliente, `useEffect` calcula la fecha real.
 * El usuario nunca ve un "flash" porque el efecto corre en el mismo tick
 * que el commit.
 */
export function DateDisplay({
  locale = 'es-AR',
  className,
}: DateDisplayProps): React.JSX.Element {
  const [dateText, setDateText] = useState<string>('');

  useEffect(() => {
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
    const capitalized =
      formatted.charAt(0).toUpperCase() + formatted.slice(1);
    setDateText(capitalized);
  }, [locale]);

  // `suppressHydrationWarning` aquí es seguro: el contenido del <time>
  // se rellena client-side y sabemos que difiere del server (vacío).
  return (
    <time
      dateTime={new Date().toISOString()}
      suppressHydrationWarning
      className={cn(className)}
    >
      {dateText || '\u00A0'}
    </time>
  );
}
