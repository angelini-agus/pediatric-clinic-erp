import { UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

import { PatientsGrid } from '@/components/patients/patients-grid';
import { getPatients } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

// ── Disable caching for live data ──────────────────────────────────────────────
export const dynamic = 'force-dynamic';

/**
 * Tamaño de página efectivo para la paginación client-side de `PatientsGrid`.
 * Coincide con el breakpoint `lg:grid-cols-3` (3 columnas × 4 filas).
 */
const PATIENTS_PAGE_SIZE = 12;

type PatientsPageProps = {
  searchParams?: {
    q?: string;
    page?: string;
  };
};

/**
 * PatientsPage — Server Component.
 * Route: /patients?q=foo&page=2
 *
 * Lee `q` (búsqueda) y `page` (paginación) desde `searchParams` y los
 * propaga al fetcher (`getPatients`) para que el query string llegue al
 * backend a través del proxy layer (`/api/proxy/v1/patients?q=...&page=...`).
 * El backend pagina y filtra server-side y devuelve `{ data, total }`:
 *  - `data` → `PatientsGrid` para renderizar la página actual.
 *  - `total` → contador del header y cálculo de páginas del paginador.
 */
export default async function PatientsPage({
  searchParams,
}: PatientsPageProps): Promise<React.JSX.Element> {
  const rawPage = Number.parseInt(searchParams?.page ?? '1', 10);
  const initialPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const initialQuery = searchParams?.q?.trim() ?? '';

  const patientsResult = await getPatients(getAuthToken(), {
    ...(initialQuery ? { q: initialQuery } : {}),
    page: initialPage,
    pageSize: PATIENTS_PAGE_SIZE,
  });

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="h-5 w-5 text-brand" />
            Pacientes Pediátricos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Listado completo de pacientes registrados y sus tutores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm">
            <span>
              {patientsResult.total}{' '}
              {patientsResult.total === 1 ? 'Paciente' : 'Pacientes Registrados'}
            </span>
          </div>
          <Link
            href="/patients/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Nuevo Paciente
          </Link>
        </div>
      </div>

      {/* Grid with Server-side Search + Pagination */}
      <PatientsGrid
        initialPatients={patientsResult.data}
        totalCount={patientsResult.total}
        initialQuery={initialQuery}
        initialPage={initialPage}
        pageSize={PATIENTS_PAGE_SIZE}
      />
    </div>
  );
}
