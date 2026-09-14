// URL base del ERP (portal de pacientes). Se puede override por entorno con
// PUBLIC_ERP_URL en .env.local (por defecto: dev server del ERP en 3000).
// Ej: PUBLIC_ERP_URL=http://localhost:3002
export const ENV_URL_ERP = import.meta.env.PUBLIC_ERP_URL ?? 'http://localhost:3000';

// WhatsApp del consultorio (formato internacional, sin + ni separadores).
// wa.me abre directo el chat con ese número; `text` pre-carga el mensaje.
const WHATSAPP_NUMBER = '5493413464378';

function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Link de WhatsApp para consultas directas (los turnos van siempre por el portal). */
export const WHATSAPP_LINK = whatsappLink('Hola, quiero hacer una consulta.');

export const CLINIC_INFO = {
  brand: 'Miradas',
  descriptor: 'Consultorios de Pediatría Integral',
  doctor: 'Dra. Martinangelio',
  doctorFullName: 'Dra. Patricia Martinangelio',
  // Matrícula profesional de la provincia de Santa Fe
  medicalLicense: '19693',
  // Año de graduación como Médica Pediátrica (para derivar años de trayectoria).
  pediatricSince: 2014,
  title: 'Pediatra',
  location: 'Pueblo Esther, Santa Fe',
  address: 'Pueblo Esther, Santa Fe',
  addressNote: 'Registrate en el portal para acceder a la ubicación exacta.',
  // La atención no tiene horarios fijos: la disponibilidad real y actualizada
  // se consulta en el portal del paciente (agenda variable).
  hours:
    'Los horarios de atención no son fijos: consultá la disponibilidad actualizada en el portal del paciente.',
} as const;
