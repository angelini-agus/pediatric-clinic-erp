import { Hospital, Quote, Stethoscope, UserRound, Users } from 'lucide-react';

const STATS = [
  {
    icon: Stethoscope,
    value: '[X]',
    // REEMPLAZAR [X]: años reales ejerciendo pediatría (Agus)
    label: 'Años ejerciendo pediatría',
    // Primera stat: acento coral — un toque de calidez en el número
    highlight: true,
  },
  {
    icon: Users,
    value: '[X]',
    // REEMPLAZAR [X]: pacientes en seguimiento activo, si Agus tiene el dato
    label: 'Pacientes en seguimiento activo',
    highlight: false,
  },
  {
    icon: Hospital,
    value: '[X]',
    // REEMPLAZAR [X]: años reales como Jefa del Servicio de Pediatría
    label: 'Años como Jefa de Servicio — Hospital Eva Perón',
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    // REEMPLAZAR: cita textual real de una familia (2-3 líneas) + nombre real
    quote: '[Cita textual del testimonio, 2-3 líneas]',
    name: '[Nombre del padre/madre]',
    child: '[nombre o edad del hijo]',
  },
  {
    // REEMPLAZAR: cita textual real de una familia (2-3 líneas) + nombre real
    quote: '[Cita textual del testimonio, 2-3 líneas]',
    name: '[Nombre del padre/madre]',
    child: '[nombre o edad del hijo]',
  },
  {
    // REEMPLAZAR: cita textual real de una familia (2-3 líneas) + nombre real
    quote: '[Cita textual del testimonio, 2-3 líneas]',
    name: '[Nombre del padre/madre]',
    child: '[nombre o edad del hijo]',
  },
];

/* ── Ilustración decorativa: estrella de 5 puntas en trazo fino ── */
function StarDeco(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      fill="none"
      stroke="#F7B9A8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-8 bottom-10 w-10 opacity-50 lg:w-14"
    >
      <polygon points="30,5 36,22 54,22 40,34 45,52 30,41 15,52 20,34 6,22 24,22" />
    </svg>
  );
}

export function TestimonialsSection(): React.JSX.Element {
  return (
    <section
      id="testimonios"
      className="relative overflow-hidden py-24 lg:py-32 scroll-mt-16"
      style={{ backgroundColor: '#EAF6F0' }}
      aria-label="Testimonios"
    >
      {/* Ilustración decorativa — estrella */}
      <StarDeco />

      {/* Blobs en paleta pastel */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(190,227,248,0.3)' }}
        />
        <div
          className="absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(217,211,240,0.3)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge — borde celeste bebé */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm reveal"
            style={{
              backgroundColor: '#fff',
              border: '1.5px solid #BEE3F8',
              color: '#1B2A41',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#BEE3F8' }}
              aria-hidden="true"
            />
            Testimonios
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-[#1B2A41] lg:text-5xl reveal"
            style={{ animationDelay: '90ms' }}
          >
            La palabra de las familias
          </h2>
        </div>

        {/* ── Cifras reales ── */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-3xl bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md reveal"
              style={{ border: stat.highlight ? '1.5px solid #F7B9A8' : '1.5px solid #BEE3F8', animationDelay: `${200 + i * 90}ms` }}
            >
              <stat.icon
                className="mx-auto h-7 w-7"
                strokeWidth={2}
                style={{ color: stat.highlight ? '#F7B9A8' : '#BEE3F8' }}
                aria-hidden="true"
              />
              <p
                className="mt-4 font-display text-5xl font-extrabold tracking-tight"
                style={{ color: stat.highlight ? '#F7B9A8' : '#1B2A41' }}
              >
                {stat.value}
              </p>
              <p className="mt-2.5 text-sm font-medium leading-snug text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonios ── */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <article
              key={index}
              className="flex flex-col rounded-3xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md reveal"
              style={{ border: '1.5px solid #D9D3F0', animationDelay: `${260 + index * 90}ms` }}
            >
              <Quote className="h-8 w-8" style={{ color: 'rgba(217,211,240,0.7)' }} aria-hidden="true" />
              <p className="mt-4 flex-1 text-[15px] italic leading-relaxed text-gray-600">
                "{testimonial.quote}"
              </p>
              <footer
                className="mt-6 flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid #EAF6F0' }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(190,227,248,0.3)', color: '#1B2A41' }}
                >
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-[#1B2A41]">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">mamá/papá de {testimonial.child}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}