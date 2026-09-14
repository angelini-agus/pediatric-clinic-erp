/* ─── Banda institucional ────────────────────────────────────────────
   Banner mostaza con silueta irregular (referencia "Our Certification
   & Partners"): borde superior recto con esquinas redondeadas y borde
   inferior en rampa — la esquina inferior izquierda cae bastante más
   que la derecha. El SVG va de fondo (preserveAspectRatio="none") y el
   texto queda horizontal, sin rotar.
   Se usan dos variantes (mobile / md+) para que la rampa y las esquinas
   no se deformen al cambiar el ancho del contenedor. ── */

import { Hospital } from 'lucide-react';

const INSTITUTIONS = ['Hospital Eva Perón', '[Institución 2]', '[Institución 3]'];

/* Silueta de la banda — top recto (y=0) con esquinas r=42; el borde
   inferior cierra a y=128 en la derecha y cae a y=128+drop en la
   izquierda. `width` define el viewBox para controlar la deformación
   horizontal de las esquinas. */
type BandShapeProps = {
  width: number;
  drop: number;
  className?: string;
};

function BandShape({ width, drop, className }: BandShapeProps): React.JSX.Element {
  const r = 42;
  const xr = width - r;
  const yLeft = 128 + drop;
  const yLeftArc = 128 - r + drop;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${String(width)} 170`}
      preserveAspectRatio="none"
      className={className}
      style={{ filter: 'drop-shadow(0 18px 22px rgba(244,196,63,0.40))' }}
    >
      <path
        fill="#F4C43F"
        d={`M${String(r)} 0 H${String(xr)} A${String(r)} ${String(r)} 0 0 1 ${String(width)} ${String(r)} V${String(128 - r)} A${String(r)} ${String(r)} 0 0 1 ${String(xr)} 128 L${String(r)} ${String(yLeft)} A${String(r)} ${String(r)} 0 0 1 0 ${String(yLeftArc)} V${String(r)} A${String(r)} ${String(r)} 0 0 1 ${String(r)} 0 Z`}
      />
    </svg>
  );
}

export function InstitutionalBand(): React.JSX.Element {
  return (
    <section
      aria-label="Instituciones en las que trabaja la Dra. Martinangelio"
      className="relative overflow-hidden py-10 lg:py-12"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="relative px-8 pb-[92px] pt-20 text-center lg:px-14">
          <BandShape width={400} drop={20} className="absolute inset-0 h-full w-full md:hidden" />
          <BandShape
            width={1200}
            drop={40}
            className="absolute inset-0 hidden h-full w-full md:block"
          />

          <div className="relative z-10">
            <h3 className="heading-h3 text-[#241D15]">Presente en instituciones de referencia</h3>

            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {INSTITUTIONS.map((institution) => (
                <li
                  key={institution}
                  className="inline-flex items-center gap-2.5 font-heading text-base font-bold text-[#241D15]"
                >
                  <Hospital className="h-4 w-4 text-[#241D15]/60" aria-hidden="true" />
                  {institution}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
