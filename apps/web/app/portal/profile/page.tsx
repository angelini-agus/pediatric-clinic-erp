import { User } from 'lucide-react';

import { getPortalMe } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { decodeAuthPayload } from '@/lib/jwt';

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mi perfil',
  description: 'Datos de la cuenta y del paciente en el portal de Miradas.',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default async function PortalProfilePage(): Promise<React.JSX.Element> {
  const token = getAuthToken();
  const user = decodeAuthPayload();
  const { patient } = await getPortalMe(token);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Mi perfil</h1>
        <p className="text-sm text-slate-500">Los datos de tu cuenta y de la ficha del paciente.</p>
      </header>

      <section className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-card-shell backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Mi cuenta</h2>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium text-slate-800">{user?.fullName ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{user?.email ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-card-shell backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Ficha del paciente</h2>
        </div>

        {patient === null ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Tu cuenta todavía no está vinculada a una ficha de paciente. Entrá a{' '}
            <strong>Mis turnos</strong> para completar la ficha (si es la primera vez) o para
            pedirnos que la vinculemos (si ya te atendiste en el consultorio).
          </p>
        ) : (
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Paciente</dt>
              <dd className="font-medium text-slate-800">
                {patient.firstName} {patient.lastName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Fecha de nacimiento</dt>
              <dd className="font-medium text-slate-800">{formatDate(patient.dateOfBirth)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Tutor/a responsable</dt>
              <dd className="font-medium text-slate-800">{patient.guardianFullName}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
