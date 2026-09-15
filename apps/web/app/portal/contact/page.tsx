import { MapPin, MessageCircle, Stethoscope } from 'lucide-react';

import { getPortalClinic } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ubicación y contacto del consultorio de la Dra. Martinangelio.',
};

const WHATSAPP_LINK =
  'https://wa.me/5493413464378?text=' + encodeURIComponent('Hola, quiero hacer una consulta.');

export default async function PortalContactPage(): Promise<React.JSX.Element> {
  const token = getAuthToken();
  const clinic = await getPortalClinic(token);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Contacto y ubicación</h1>
        <p className="text-sm text-slate-500">Datos del consultorio para pacientes registrados.</p>
      </header>

      {/* Address — the exact address is only published behind login */}
      <section className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-card-shell backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <MapPin className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Dónde atendemos</h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {clinic?.address !== null &&
          clinic?.address !== undefined &&
          clinic.address.length > 0 ? (
            clinic.address
          ) : (
            <span className="text-slate-500">
              La dirección exacta se está configurando. Mientras tanto, escribinos por WhatsApp y te
              la pasamos.
            </span>
          )}
        </p>
      </section>

      {/* Professional */}
      <section className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-card-shell backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Stethoscope className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Quién te atiende</h2>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Profesional</dt>
            <dd className="font-medium text-slate-800">
              {clinic?.professionalName ?? 'Dra. Patricia Martinangelio'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Especialidad</dt>
            <dd className="font-medium text-slate-800">{clinic?.specialty ?? 'Pediatría'}</dd>
          </div>
          {clinic?.licenseNumber !== null && clinic?.licenseNumber !== undefined && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Matrícula</dt>
              <dd className="font-medium text-slate-800">{clinic.licenseNumber}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* WhatsApp */}
      <section className="rounded-[2rem] border border-white/60 bg-white/70 p-6 text-center shadow-card-shell backdrop-blur-xl sm:p-8">
        <p className="text-sm text-slate-600">
          ¿Dudas sobre turnos o la historia clínica de tu hijo/a?
        </p>
        <a
          href={WHATSAPP_LINK}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
        >
          <MessageCircle className="h-4 w-4" />
          Escribir por WhatsApp
        </a>
      </section>
    </div>
  );
}
