'use client';

import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  Search,
  Shield,
  User,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { PatientResponse } from '@/lib/api';

import {
  formatAge,
  formatBiologicalSex,
  formatGuardianRelationship,
  getInitials,
} from '@/lib/patient-utils';

// ── Props ─────────────────────────────────────────────────────────────────────

type PatientsGridProps = {
  /**
   * Items of the CURRENT page, already filtered + paginated server-side.
   */
  initialPatients: PatientResponse[];
  /**
   * Total number of items matching the current filters (across all pages).
   * Drives the paginator page count and the "Mostrando X–Y de Z" label.
   */
  totalCount: number;
  /**
   * Current search query, forwarded from the `?q=` URL param
   * (driven by the global header search or the local input).
   */
  initialQuery?: string;
  /**
   * 1-indexed page number forwarded from `?page=` URL param.
   */
  initialPage?: number;
  /**
   * Items per page. Must match the `pageSize` passed to the fetcher.
   */
  pageSize?: number;
};

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * PatientsGrid — server-driven search + pagination view.
 *
 * The backend filters (`q`) and paginates (`page`/`pageSize`) so this
 * component renders whatever the server returned for the current URL and
 * only navigates (`router.replace`) — no client-side slicing or
 * filtering over a full dataset.
 */
export function PatientsGrid({
  initialPatients,
  totalCount,
  initialQuery = '',
  initialPage = 1,
  pageSize = 12,
}: PatientsGridProps): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState(initialQuery);

  // Keep the input in sync when the URL query changes (e.g. header search).
  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  // Debounced navigation: typing in the search box updates the URL
  // (resetting to page 1), letting the server re-render the page.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      router.replace(buildPatientsUrl(search, 1));
    }, 300);
    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [router, search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, initialPage), totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalCount);

  /**
   * Navega a una página específica sincronizando la URL (sin inflar history).
   * Usamos `router.replace` para que el back del navegador no quede atascado
   * en cada click de paginación. La query se re-utiliza tal cual está en el
   * input (el server filtra + pagina).
   */
  const goToPage = (page: number): void => {
    const targetPage = Math.min(Math.max(1, page), totalPages);
    router.replace(buildPatientsUrl(search, targetPage));
  };

  /**
   * Construye la URL `/patients` con `q` y `page` del estado actual.
   */
  const buildPatientsUrl = (query: string, page: number): string => {
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set('q', trimmed);
    }
    if (page > 1) {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return `/patients${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="Buscar por nombre, DNI o tutor..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all shadow-sm"
        />
      </div>

      {/* Result count + pagination info */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <span>
            Mostrando{' '}
            <strong className="font-semibold text-slate-700">
              {pageStart + 1}–{pageEnd}
            </strong>{' '}
            de{' '}
            <strong className="font-semibold text-slate-700">
              {totalCount}
            </strong>{' '}
            {totalCount === 1 ? 'paciente' : 'pacientes'}
          </span>
          {totalPages > 1 && (
            <span>
              Página <strong className="font-semibold text-slate-700">{safePage}</strong>{' '}
              de <strong className="font-semibold text-slate-700">{totalPages}</strong>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {initialPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
          <UserX className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-500">
            No se encontraron pacientes
          </p>
          <p className="text-xs text-slate-400">
            {search
              ? 'Intenta con otro término de búsqueda.'
              : 'No hay pacientes registrados en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialPatients.map((patient) => {
            const age = formatAge(patient.dateOfBirth);
            const initials = getInitials(patient.firstName, patient.lastName);
            const guardianRel = formatGuardianRelationship(
              patient.guardianRelationship,
            );

            return (
              <div
                key={patient.id}
                className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  {/* Header: Avatar + Name + Blood type */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand transition-colors">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {age} · {formatBiologicalSex(patient.biologicalSex)}
                        </p>
                      </div>
                    </div>
                    {patient.bloodGroup && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                        <Droplets className="h-3 w-3" />
                        {patient.bloodGroup}
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        DNI:{' '}
                        <strong className="font-semibold text-slate-700">
                          {patient.documentNumber}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span
                        className="truncate"
                        title={`Tutor: ${patient.guardianFullName} (${guardianRel})`}
                      >
                        Tutor: {patient.guardianFullName} ({guardianRel})
                      </span>
                    </div>
                    {patient.healthInsurance && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span
                          className="truncate"
                          title={`${patient.healthInsurance}${patient.healthInsurancePlan ? ` (${patient.healthInsurancePlan})` : ''}`}
                        >
                          {patient.healthInsurance}{' '}
                          {patient.healthInsurancePlan
                            ? `(${patient.healthInsurancePlan})`
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Button */}
                <Link
                  href={`/patients/${patient.id}`}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-brand hover:text-white text-brand text-xs font-semibold transition-all duration-150 shadow-xs"
                >
                  <span>Ver Historia Clínica</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Paginación de pacientes"
          className="flex items-center justify-center gap-2 pt-2"
        >
          <button
            type="button"
            onClick={() => {
              goToPage(safePage - 1);
            }}
            disabled={safePage <= 1}
            aria-label="Página anterior"
            className="inline-flex items-center gap-1 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/70"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </button>

          {/* Page number buttons (compact: first, current-1, current, current+1, last) */}
          <div className="flex items-center gap-1">
            {buildPageWindow(safePage, totalPages).map((page, idx) =>
              page === '…' ? (
                <span
                  key={`ellipsis-${String(idx)}`}
                  className="px-2 text-xs text-slate-400 select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => {
                    goToPage(page);
                  }}
                  aria-current={page === safePage ? 'page' : undefined}
                  aria-label={`Ir a la página ${String(page)}`}
                  className={`min-w-[2.25rem] h-9 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                    page === safePage
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              goToPage(safePage + 1);
            }}
            disabled={safePage >= totalPages}
            aria-label="Página siguiente"
            className="inline-flex items-center gap-1 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/70"
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a compact list of page numbers with `…` ellipses for the
 * pagination window. Always includes the first and last page.
 *
 * Example output for currentPage=5, totalPages=20:
 *   [1, '…', 4, 5, 6, '…', 20]
 */
function buildPageWindow(
  currentPage: number,
  totalPages: number,
): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const window: (number | '…')[] = [1];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) {
    window.push('…');
  }
  for (let p = left; p <= right; p += 1) {
    window.push(p);
  }
  if (right < totalPages - 1) {
    window.push('…');
  }
  window.push(totalPages);

  return window;
}
