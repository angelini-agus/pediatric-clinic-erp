// TODO (Agus): reemplazar por la URL real del ERP (sistema de turnos)
export const ENV_URL_ERP = 'http://localhost:3000';

// TODO (Agus): reemplazar [NUMERO] por el número real de WhatsApp (formato internacional, sin +)
export const WHATSAPP_LINK = 'https://wa.me/[NUMERO]';

export const CLINIC_INFO = {
  doctor: 'Dra. Martinangelio',
  title: 'Pediatra',
  location: 'Pueblo Esther, Santa Fe',
  // TODO (Agus): reemplazar [DIRECCIÓN] por la dirección real del consultorio
  address: '[DIRECCIÓN]',
  // TODO (Agus): reemplazar [HORARIOS] por los horarios reales de atención
  hours: '[HORARIOS]',
} as const;