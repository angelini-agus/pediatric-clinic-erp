/**
 * lib/patient-utils.ts
 *
 * Utilidades de dominio para formateo y presentación de datos de pacientes.
 * Centraliza funciones que antes vivían duplicadas en `patients-grid`,
 * `patient-profile-card`, `todays-booking-card` y `appointments/page.tsx`.
 *
 * Convenciones:
 *  - Funciones puras, sin estado ni efectos.
 *  - Idioma: español rioplatense (es-AR).
 *  - Tolerantes a inputs `undefined` donde aplique (devuelven string vacío).
 */

/**
 * Returns the patient initials (uppercase) used in avatar circles.
 *
 * @example
 *   getInitials('Sofía', 'González') // "SG"
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0);
  const last = lastName.charAt(0);
  return `${first}${last}`.toUpperCase();
}

/**
 * Returns a human-readable age string from a date of birth.
 * Uses pediatric-friendly formatting: months for <2y, years otherwise.
 *
 * @example
 *   formatAge(new Date('2024-01-01')) // "18 meses"
 *   formatAge(new Date('2020-01-01')) // "5 años"
 */
export function formatAge(dateOfBirth: Date): string {
  const now = new Date();
  const months =
    (now.getFullYear() - dateOfBirth.getFullYear()) * 12 +
    (now.getMonth() - dateOfBirth.getMonth());

  if (months < 24) {
    return `${String(months)} meses`;
  }

  const years = Math.floor(months / 12);
  return `${String(years)} años`;
}

/**
 * Maps an enum-style relationship code to a localized Spanish label.
 * Falls back to the raw value if the code is unknown.
 *
 * @example
 *   formatGuardianRelationship('MOTHER')     // "Madre"
 *   formatGuardianRelationship('GRANDMOTHER') // "Abuela"
 */
export function formatGuardianRelationship(rel: string): string {
  const RELATIONSHIP_LABELS: Record<string, string> = {
    MOTHER: 'Madre',
    FATHER: 'Padre',
    GRANDMOTHER: 'Abuela',
    GRANDFATHER: 'Abuelo',
    GUARDIAN: 'Tutor Legal',
    OTHER: 'Otro',
  };
  return RELATIONSHIP_LABELS[rel] ?? rel;
}

/**
 * Composes the canonical display string for a guardian:
 *   "Sofía González (Madre)"
 *
 * Capitalizes the first letter of the relationship label for natural prose.
 */
export function formatGuardianDisplay(fullName: string, relationshipCode: string): string {
  const label = formatGuardianRelationship(relationshipCode);
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  return `${fullName} (${capitalized})`;
}

/**
 * Returns a localized Spanish label for biological sex codes.
 */
export function formatBiologicalSex(sex: string): string {
  if (sex === 'FEMALE') return 'Femenino';
  if (sex === 'MALE') return 'Masculino';
  return sex;
}

/**
 * Formats a Date to a Spanish localized string.
 *
 * @example
 *   formatDate(new Date('2024-01-01')) // "01 de enero de 2024"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
