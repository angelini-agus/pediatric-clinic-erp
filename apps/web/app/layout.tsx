import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';

import type { Metadata } from 'next';

import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
  weight: 'variable',
  axes: ['opsz'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});
export const metadata: Metadata = {
  title: {
    default: 'Miradas — Consultorios de Pediatría Integral',
    template: '%s | Miradas',
  },
  description:
    'Portal del paciente y sistema de gestión de Miradas — Consultorios de Pediatría Integral. Turnos, historias clínicas y recetas. Cumple con Ley 26.529.',
  keywords: [
    'Miradas',
    'pediatría integral',
    'ERP médico',
    'gestión médica',
    'Argentina',
    'Ley 26529',
  ],
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'),
  robots: {
    index: false, // ERP interno — no indexar
    follow: false,
  },
};

type RootLayoutProps = {
  readonly children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`min-h-screen antialiased ${bricolage.variable} ${jakarta.variable} font-sans`}
        style={{ '--font-roundo': 'system-ui, sans-serif' } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
