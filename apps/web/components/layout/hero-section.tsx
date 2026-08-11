import Image from 'next/image';
import Link from 'next/link';

export function HeroSection(): React.JSX.Element {
  return (
    <section className="hero-section" aria-label="Bienvenida a PediCare">
      {/* Decorative blobs */}
      <div className="hero-section__blob hero-section__blob--1" aria-hidden="true" />
      <div className="hero-section__blob hero-section__blob--2" aria-hidden="true" />

      <div className="hero-section__grid">
        {/* ── LEFT COLUMN: copy & CTAs ── */}
        <div className="hero-section__copy">
          {/* Eyebrow badge */}
          <div className="hero-section__eyebrow" aria-label="Clínica pediátrica de confianza">
            <span className="hero-section__eyebrow-dot" aria-hidden="true" />
            Especialistas en salud infantil
          </div>

          <h1 className="hero-section__heading">
            Cuidado pediátrico de{' '}
            <span className="hero-section__heading-accent">excelencia</span>{' '}
            para lo más importante de tu vida
          </h1>

          <p className="hero-section__body">
            Brindamos atención médica integral y personalizada para niños y adolescentes.
            Nuestro equipo de profesionales combina experiencia clínica con el calor humano
            que cada familia merece.
          </p>

          {/* Trust badges */}
          <ul className="hero-section__trust" aria-label="Ventajas del servicio">
            {[
              { icon: '🩺', text: 'Pediatras certificados' },
              { icon: '📅', text: 'Turnos online' },
              { icon: '💬', text: 'Atención personalizada' },
            ].map((item) => (
              <li key={item.text} className="hero-section__trust-item">
                <span aria-hidden="true">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="hero-section__ctas">
            <Link
              href="/turnos"
              className="hero-section__btn-primary"
              id="hero-cta-patients"
              aria-label="Portal de pacientes — sacar turno"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Portal de Pacientes · Sacar Turno
            </Link>

            <Link
              href="#servicios"
              className="hero-section__btn-secondary"
              id="hero-cta-more"
              aria-label="Conocer más sobre la clínica"
            >
              Conocer más
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── RIGHT COLUMN: image ── */}
        <div className="hero-section__image-col">
          {/* Organic blob shape behind image */}
          <div className="hero-section__image-blob" aria-hidden="true" />

          {/* Floating decorative card */}
          <div className="hero-section__float-card hero-section__float-card--top" aria-hidden="true">
            <span className="hero-section__float-card-icon">⭐</span>
            <div>
              <div className="hero-section__float-card-title">+2.000 familias</div>
              <div className="hero-section__float-card-sub">nos eligen cada año</div>
            </div>
          </div>

          {/* Floating decorative card 2 */}
          <div className="hero-section__float-card hero-section__float-card--bottom" aria-hidden="true">
            <span className="hero-section__float-card-icon">✓</span>
            <div>
              <div className="hero-section__float-card-title">Atención de excelencia</div>
              <div className="hero-section__float-card-sub">Turnos en 24 hs</div>
            </div>
          </div>

          {/* Doctor photo */}
          <div className="hero-section__image-wrapper">
            <Image
              src="/hero-doctor.jpg"
              alt="Doctora pediátrica de PediCare con bata blanca, sonriendo"
              width={440}
              height={580}
              className="hero-section__image"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
