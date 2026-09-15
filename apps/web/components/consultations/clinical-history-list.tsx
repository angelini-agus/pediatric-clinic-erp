import { ClipboardList, Search } from 'lucide-react';
import Link from 'next/link';

import type { GlobalMedicalRecordResponse } from '@/lib/api';

type ClinicalHistoryListProps = {
  records: GlobalMedicalRecordResponse[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
};

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildUrl(targetPage: number, targetQuery: string): string {
  const params = new URLSearchParams();
  params.set('tab', 'historial');
  if (targetQuery.trim().length > 0) params.set('q', targetQuery.trim());
  if (targetPage > 1) params.set('page', String(targetPage));
  return `/consultations?${params.toString()}`;
}

/**
 * ClinicalHistoryList — Server Component.
 *
 * Historial clínico global: todas las evoluciones de todos los pacientes,
 * paginadas y con búsqueda por paciente/DNI. Cada tarjeta lleva a la ficha.
 */
export function ClinicalHistoryList({
  records,
  total,
  page,
  pageSize,
  query,
}: ClinicalHistoryListProps): React.JSX.Element {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, total);

  return (
    <div className="space-y-5">
      {/* Search */}
      <form action="/consultations" method="get" role="search" className="relative max-w-md">
        <input type="hidden" name="tab" value="historial" />
        <label htmlFor="history-search" className="sr-only">
          Buscar por paciente o DNI
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="history-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Buscar por paciente o DNI..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm backdrop-blur-md transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </form>

      {/* Result count */}
      {total > 0 && (
        <p className="text-xs text-slate-500">
          Mostrando{' '}
          <strong className="font-semibold text-slate-700">
            {pageStart}–{pageEnd}
          </strong>{' '}
          de <strong className="font-semibold text-slate-700">{total}</strong>{' '}
          {total === 1 ? 'evolución' : 'evoluciones'}
          {query.trim().length > 0 && (
            <>
              {' '}
              para <strong className="font-semibold text-slate-700">“{query}”</strong>
            </>
          )}
        </p>
      )}

      {/* List */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/40 py-16 text-slate-400 backdrop-blur-sm">
          <ClipboardList className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-500">
            {query.trim().length > 0
              ? 'No se encontraron evoluciones para esa búsqueda'
              : 'Todavía no hay evoluciones registradas'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {records.map((record) => (
            <li key={record.id}>
              <Link
                href={`/patients/${record.patient.id}`}
                className="block rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-4 shadow-sm backdrop-blur-xl transition hover:border-brand/30 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">
                    {record.patient.firstName} {record.patient.lastName}
                    {record.patient.documentNumber !== null &&
                      record.patient.documentNumber !== undefined && (
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          {record.patient.documentType} {record.patient.documentNumber}
                        </span>
                      )}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(record.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-500">Diagnóstico: </span>
                  {record.diagnosis}
                </p>
                {record.treatment !== null && record.treatment !== undefined && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    <span className="font-semibold">Tratamiento: </span>
                    {record.treatment}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">{record.doctor.fullName}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Paginación">
          <Link
            href={buildUrl(page - 1, query)}
            aria-disabled={page <= 1}
            className={
              page <= 1
                ? 'pointer-events-none rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-300'
                : 'rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50'
            }
          >
            Anterior
          </Link>
          <span className="text-xs font-semibold text-slate-500">
            {page} / {totalPages}
          </span>
          <Link
            href={buildUrl(page + 1, query)}
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages
                ? 'pointer-events-none rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-300'
                : 'rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50'
            }
          >
            Siguiente
          </Link>
        </nav>
      )}
    </div>
  );
}
