import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PediERP — Sistema de Gestión para Clínicas Pediátricas',
    template: '%s | PediERP',
  },
  description:
    'Sistema ERP médico pediátrico para el mercado argentino. Gestión de turnos, historias clínicas y más. Cumple con Ley 26.529.',
  keywords: ['ERP médico', 'clínica pediátrica', 'gestión médica', 'Argentina', 'Ley 26529'],
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
