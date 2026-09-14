import { MessageCircle } from 'lucide-react';

import { WHATSAPP_LINK } from '../config';

/* ── Botón flotante de WhatsApp — fijo en la esquina inferior derecha,
   visible en todas las secciones. Coral con ícono blanco y sombra sutil. ── */

export function WhatsAppFloat(): React.JSX.Element {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95"
      style={{
        backgroundColor: '#E96B3A',
        boxShadow: '0 12px 32px -8px rgba(233,107,58,0.55)',
      }}
    >
      <MessageCircle className="h-7 w-7 text-white" aria-hidden="true" />
    </a>
  );
}
