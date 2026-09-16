import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * ⚠️ DESTRUCTIVE DEV-ONLY SEED.
 *
 * This script wipes appointments, patients, users, medical records and
 * prescriptions before inserting demo data. It must NEVER run against
 * production: `assertSafeToRun()` aborts unless the environment is
 * explicitly disposable.
 *
 * Credentials (all seed accounts share SEED_PASSWORD):
 *  - Staff admin ........ admin@admin.com             (SUPER_ADMIN)
 *  - Doctor ............. ricardo.silva@pediatric-erp.com (DOCTOR)
 *  - Patient portal ..... sofia.gonzalez@example.com  (PATIENT, linked to Mateo González)
 *
 * The `admin123` fallback exists only for local development — the repository
 * is public, so never use the default outside a local database.
 */
const DEFAULT_PASSWORD = process.env['SEED_PASSWORD'] ?? 'admin123';
const BCRYPT_ROUNDS = 10;

function assertSafeToRun(): void {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const explicitlyAllowed = process.env['ALLOW_DESTRUCTIVE_SEED'] === 'true';

  if (isProduction && !explicitlyAllowed) {
    throw new Error(
      'Refusing to run the destructive seed with NODE_ENV=production. ' +
        'Set ALLOW_DESTRUCTIVE_SEED=true only if this database is disposable.',
    );
  }

  if (!process.env['SEED_PASSWORD']) {
    console.warn(
      '⚠️  SEED_PASSWORD not set — using the public dev default "admin123". ' +
        'Never use this password outside a local database.',
    );
  }
}

/**
 * Timestamp helper for building a coherent week around "today":
 * negative offsets are past days, positive offsets are upcoming days.
 */
function dayAt(offsetDays: number, hours: number, minutes: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function main(): Promise<void> {
  assertSafeToRun();
  console.log('🌱 Seeding database...');

  // ── Clean existing data for idempotency (child tables first) ──────────────
  await prisma.prescription.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  // Password is hashed ONCE and reused for every seed user (DRY).
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  // ── 0. Clinic settings (singleton) ────────────────────────────────────────
  // Powers the portal contact page and the prescription PDF header.
  await prisma.clinicSettings.upsert({
    where: { id: 'singleton' },
    update: {
      fullName: 'Dr. Ricardo Silva',
      licenseNumber: 'Mat. 48102',
      specialty: 'Pediatra',
      clinicName: 'Miradas — Consultorios de Pediatría Integral',
      address: 'Pueblo Esther, Santa Fe',
    },
    create: {
      id: 'singleton',
      fullName: 'Dr. Ricardo Silva',
      licenseNumber: 'Mat. 48102',
      specialty: 'Pediatra',
      clinicName: 'Miradas — Consultorios de Pediatría Integral',
      address: 'Pueblo Esther, Santa Fe',
    },
  });
  console.log('✅ Clinic settings ready');

  // ── 1. Default Admin (owner) — credentials: admin@admin.com ──────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      password: hashedPassword,
      fullName: 'Administrador',
      role: UserRole.SUPER_ADMIN,
      specialty: null,
      medicalLicense: null,
      phone: null,
    },
  });
  console.log(`✅ Created admin: ${admin.email} (${admin.role})`);

  // ── 2. Test Doctor ────────────────────────────────────────────────────────
  const doctor = await prisma.user.create({
    data: {
      email: 'ricardo.silva@pediatric-erp.com',
      password: hashedPassword,
      fullName: 'Dr. Ricardo Silva',
      role: UserRole.DOCTOR,
      specialty: 'Pediatra',
      medicalLicense: 'Mat. 48102',
      phone: '+54 9 11 3456-7890',
    },
  });
  console.log(`✅ Created doctor: ${doctor.fullName} (${doctor.medicalLicense ?? 'N/D'})`);

  // ── 3. Patient portal account (role PATIENT) ──────────────────────────────
  // Same email as the guardian of Mateo González so the link is self-evident.
  const portalUser = await prisma.user.create({
    data: {
      email: 'sofia.gonzalez@example.com',
      password: hashedPassword,
      fullName: 'Sofía González',
      role: UserRole.PATIENT,
      specialty: null,
      medicalLicense: null,
      phone: '+54 9 11 4567-8901',
    },
  });
  console.log(`✅ Created patient portal account: ${portalUser.email} (${portalUser.role})`);

  // ── 4. Pediatric Patients with guardians ─────────────────────────────────
  const now = new Date();

  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'Mateo',
      lastName: 'González',
      documentType: 'DNI',
      documentNumber: '54123456',
      dateOfBirth: new Date(now.getFullYear() - 3, now.getMonth(), 10),
      biologicalSex: 'MALE',
      bloodGroup: 'O+',
      healthInsurance: 'OSDE',
      healthInsurancePlan: '210',
      healthInsuranceNumber: '12345678901',
      guardianFullName: 'Sofía González',
      guardianPhone: '+54 9 11 4567-8901',
      guardianEmail: 'sofia.gonzalez@example.com',
      guardianRelationship: 'MOTHER',
      birthWeightGrams: 3400,
      gestationalWeeks: 39,
      apgarScore: '9/10',
      // Portal account linked (the family sees this record in /portal).
      userId: portalUser.id,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      firstName: 'Valentina',
      lastName: 'Pérez',
      documentType: 'DNI',
      documentNumber: '56234567',
      dateOfBirth: new Date(now.getFullYear() - 1, now.getMonth() - 6, 15),
      biologicalSex: 'FEMALE',
      bloodGroup: 'A+',
      healthInsurance: 'Swiss Medical',
      healthInsurancePlan: 'SMG20',
      healthInsuranceNumber: '98765432100',
      guardianFullName: 'Carlos Pérez',
      guardianPhone: '+54 9 11 5678-9012',
      guardianEmail: 'carlos.perez@example.com',
      guardianRelationship: 'FATHER',
      birthWeightGrams: 3100,
      gestationalWeeks: 38,
      apgarScore: '8/10',
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      firstName: 'Benjamín',
      lastName: 'Rodríguez',
      documentType: 'DNI',
      documentNumber: '52345678',
      dateOfBirth: new Date(now.getFullYear() - 5, now.getMonth() - 2, 20),
      biologicalSex: 'MALE',
      bloodGroup: 'B+',
      healthInsurance: 'Galeno',
      healthInsurancePlan: 'Oro',
      healthInsuranceNumber: '45678901234',
      guardianFullName: 'Ana Rodríguez',
      guardianPhone: '+54 9 11 6789-0123',
      guardianEmail: 'ana.rodriguez@example.com',
      guardianRelationship: 'MOTHER',
      birthWeightGrams: 3600,
      gestationalWeeks: 40,
      apgarScore: '9/10',
    },
  });

  const patient4 = await prisma.patient.create({
    data: {
      firstName: 'Emma',
      lastName: 'López',
      documentType: 'DNI',
      documentNumber: '57456789',
      dateOfBirth: new Date(now.getFullYear(), now.getMonth() - 9, 25),
      biologicalSex: 'FEMALE',
      bloodGroup: 'O-',
      healthInsurance: 'Medicus',
      healthInsurancePlan: 'Celeste',
      healthInsuranceNumber: '34567890123',
      guardianFullName: 'Martín López',
      guardianPhone: '+54 9 11 7890-1234',
      guardianEmail: 'martin.lopez@example.com',
      guardianRelationship: 'FATHER',
      birthWeightGrams: 2950,
      gestationalWeeks: 37,
      apgarScore: '9/10',
    },
  });

  const patient5 = await prisma.patient.create({
    data: {
      firstName: 'Lucas',
      lastName: 'Martínez',
      documentType: 'DNI',
      documentNumber: '50567890',
      dateOfBirth: new Date(now.getFullYear() - 7, now.getMonth() - 1, 14),
      biologicalSex: 'MALE',
      bloodGroup: 'AB+',
      healthInsurance: 'Omint',
      healthInsurancePlan: 'Skill',
      healthInsuranceNumber: '56789012345',
      guardianFullName: 'Patricia Martínez',
      guardianPhone: '+54 9 11 8901-2345',
      guardianEmail: 'patricia.martinez@example.com',
      guardianRelationship: 'MOTHER',
      birthWeightGrams: 3500,
      gestationalWeeks: 39,
      apgarScore: '10/10',
    },
  });

  const patient6 = await prisma.patient.create({
    data: {
      firstName: 'Juana',
      lastName: 'Díaz',
      documentType: 'DNI',
      documentNumber: '55678901',
      dateOfBirth: new Date(now.getFullYear() - 2, now.getMonth(), 30),
      biologicalSex: 'FEMALE',
      bloodGroup: 'A-',
      healthInsurance: 'IOMA',
      healthInsurancePlan: 'General',
      healthInsuranceNumber: '67890123456',
      guardianFullName: 'Laura Díaz',
      guardianPhone: '+54 9 11 9012-3456',
      guardianEmail: 'laura.diaz@example.com',
      guardianRelationship: 'MOTHER',
      birthWeightGrams: 3250,
      gestationalWeeks: 39,
      apgarScore: '9/10',
    },
  });

  console.log('✅ Created 6 pediatric patients with guardians (Mateo linked to the portal)');

  // ── 5. Appointments — a full week around today ───────────────────────────
  const appointmentsData = [
    // Past days (already attended)
    {
      dateTime: dayAt(-2, 9, 0),
      type: 'Control de Niño Sano',
      notes: 'Control periódico de crecimiento y desarrollo.',
      status: AppointmentStatus.COMPLETED,
      patientId: patient1.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(-2, 10, 0),
      type: 'Vacunación Cuádruple',
      notes: 'Esquema de vacunación al día, sin reacciones adversas.',
      status: AppointmentStatus.COMPLETED,
      patientId: patient2.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(-1, 9, 30),
      type: 'Control de Peso y Talla',
      notes: 'Evolución de percentiles dentro de lo esperado.',
      status: AppointmentStatus.COMPLETED,
      patientId: patient3.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(-1, 11, 0),
      type: 'Revisión de Estudios',
      notes: 'Laboratorio de control sin alteraciones significativas.',
      status: AppointmentStatus.COMPLETED,
      patientId: patient5.id,
      doctorId: doctor.id,
    },

    // Today (operational worklist)
    {
      dateTime: dayAt(0, 9, 0),
      type: 'Control de Rutina',
      notes: 'Paciente con crecimiento y desarrollo dentro de percentiles normales.',
      status: AppointmentStatus.COMPLETED,
      patientId: patient1.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(0, 9, 30),
      type: 'Consulta de Control',
      notes: 'Revisión esquema de vacunación 18 meses.',
      status: AppointmentStatus.IN_PROGRESS,
      patientId: patient2.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(0, 10, 0),
      type: 'Vacunación SAP',
      notes: 'Refuerzo vacuna ingreso escolar.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient3.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(0, 10, 30),
      type: 'Control 9 Meses',
      notes: 'Evaluación pauta madurativa y alimentación complementaria.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient4.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(0, 11, 0),
      type: 'Cuadro Febril',
      notes: 'Cancelado por el tutor por mejoría del cuadro.',
      status: AppointmentStatus.CANCELED,
      patientId: patient5.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(0, 11, 30),
      type: 'Control de Crecimiento',
      notes: 'Control periódico de peso y talla.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient6.id,
      doctorId: doctor.id,
    },

    // Upcoming (confirmed by staff)
    {
      dateTime: dayAt(1, 10, 0),
      type: 'Control de Rutina',
      notes: 'Seguimiento de pauta madurativa.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient4.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(2, 9, 0),
      type: 'Vacunación 12 Meses',
      notes: 'Aplicación de refuerzo según calendario nacional.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient6.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(3, 10, 30),
      type: 'Consulta por Alergia',
      notes: 'Evaluación de cuadro alérgico estacional.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient1.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(5, 9, 30),
      type: 'Control de Niño Sano',
      notes: 'Control de rutina de los 18 meses.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient2.id,
      doctorId: doctor.id,
    },

    // Requested from the patient portal (pending staff confirmation)
    {
      dateTime: dayAt(4, 11, 0),
      type: 'Consulta por Tos Persistente',
      notes: 'Solicitado desde el portal del paciente.',
      status: AppointmentStatus.REQUESTED,
      patientId: patient1.id,
      doctorId: doctor.id,
    },
    {
      dateTime: dayAt(2, 11, 30),
      type: 'Control de Desarrollo',
      notes: 'Solicitado desde el portal del paciente.',
      status: AppointmentStatus.REQUESTED,
      patientId: patient5.id,
      doctorId: doctor.id,
    },
  ];

  for (const appt of appointmentsData) {
    await prisma.appointment.create({ data: appt });
  }

  console.log('✅ Created 16 appointments (past week, today, upcoming and 2 portal requests)');

  // ── 6. Medical records (evoluciones) ─────────────────────────────────────
  const medicalRecordsData = [
    {
      diagnosis: 'Control de niño sano — 3 años',
      notes:
        'Peso 14.1 kg (P50), talla 95 cm (P45), perímetro cefálico 49 cm. ' +
        'Desarrollo psicomotor acorde a la edad: lenguaje con frases completas, ' +
        'control de esfínteres diurno. Alimentación variada sin selectividad marcada.',
      treatment:
        'Sin indicaciones farmacológicas. Continuar con pauta de alimentación ' +
        'saludable, actividad física diaria y sueño de 11-12 horas.',
      prescription: 'Sin recetas en esta consulta.',
      patientId: patient1.id,
      doctorId: doctor.id,
      createdAt: dayAt(-60, 10, 30),
    },
    {
      diagnosis: 'Rinofaringitis aguda',
      notes:
        'Cuadro de 48 horas de evolución con rinorrea, tos y fiebre de hasta 38.2 °C. ' +
        'Buena hidratación y estado general conservado. Faringe levemente congestiva, ' +
        'sin signos de dificultad respiratoria.',
      treatment:
        'Ibuprofeno 100 mg/5 ml: 5 ml cada 8 horas si hay fiebre. ' +
        'Control en 72 horas si persiste la fiebre o aparece dificultad para respirar.',
      prescription: 'Ibuprofeno 100 mg/5 ml — 5 ml cada 8 horas por 3 días.',
      patientId: patient1.id,
      doctorId: doctor.id,
      createdAt: dayAt(-15, 9, 15),
    },
    {
      diagnosis: 'Control de rutina — 3 años',
      notes:
        'Control de rutina. Crecimiento y desarrollo dentro de percentiles normales. ' +
        'Vacunación al día según calendario nacional.',
      treatment: 'Sin indicaciones. Próximo control en 6 meses.',
      prescription: null,
      patientId: patient1.id,
      doctorId: doctor.id,
      createdAt: dayAt(0, 9, 20),
    },
    {
      diagnosis: 'Control de niño sano — 12 meses',
      notes:
        'Peso 9.4 kg (P60), talla 74 cm (P55). Pauta madurativa acorde: ' +
        'se pone de pie con apoyo, pinza fina presente. Alimentación complementaria completa.',
      treatment: 'Continuar lactancia materna a demanda. Refuerzos de vacunación según calendario.',
      prescription: null,
      patientId: patient2.id,
      doctorId: doctor.id,
      createdAt: dayAt(-45, 11, 0),
    },
    {
      diagnosis: 'Vacunación triple viral — refuerzo',
      notes:
        'Aplicación de refuerzo sin reacciones inmediatas. Observación de 30 minutos completada.',
      treatment: 'Antipirético si aparece fiebre en las próximas 48 horas.',
      prescription: 'Paracetamol 100 mg/ml — 1 ml cada 6 horas si hay fiebre.',
      patientId: patient2.id,
      doctorId: doctor.id,
      createdAt: dayAt(-10, 10, 0),
    },
    {
      diagnosis: 'Control de niño sano — 5 años',
      notes:
        'Peso 18.6 kg (P55), talla 110 cm (P50). Examen físico completo sin hallazgos. ' +
        'Agudeza visual y auditiva conservadas. Inicio de escolaridad sin dificultades.',
      treatment: 'Refuerzo de vacunas de ingreso escolar. Control en 12 meses.',
      prescription: null,
      patientId: patient3.id,
      doctorId: doctor.id,
      createdAt: dayAt(-30, 9, 45),
    },
    {
      diagnosis: 'Otitis media aguda derecha',
      notes:
        'Otalgia de 24 horas con fiebre de 38.5 °C. Membrana timpánica derecha ' +
        'congestiva con leve abombamiento. Sin supuración.',
      treatment:
        'Amoxicilina 250 mg/5 ml cada 8 horas durante 7 días. ' +
        'Analgésico según necesidad. Control en 10 días.',
      prescription: 'Amoxicilina 250 mg/5 ml — 5 ml cada 8 horas por 7 días.',
      patientId: patient3.id,
      doctorId: doctor.id,
      createdAt: dayAt(-7, 17, 30),
    },
    {
      diagnosis: 'Control de 9 meses — pauta madurativa',
      notes:
        'Peso 8.1 kg (P50), talla 70 cm (P50). Sedestación estable, gateo activo. ' +
        'Alimentación complementaria en progreso, buena aceptación.',
      treatment: 'Continuar estimulación temprana. Control en 3 meses.',
      prescription: 'Vitamina D 800 UI — 1 gota por día hasta los 12 meses.',
      patientId: patient4.id,
      doctorId: doctor.id,
      createdAt: dayAt(-20, 10, 15),
    },
    {
      diagnosis: 'Control de crecimiento y desarrollo',
      notes:
        'Peso 24.8 kg (P70), talla 122 cm (P60). Examen físico sin hallazgos. ' +
        'Desempeño escolar adecuado. Actividad física extracurricular 3 veces por semana.',
      treatment: 'Sin indicaciones. Próximo control anual.',
      prescription: null,
      patientId: patient5.id,
      doctorId: doctor.id,
      createdAt: dayAt(-12, 16, 0),
    },
    {
      diagnosis: 'Cuadro viral con exantema',
      notes:
        'Exantema maculopapular de 24 horas, asociado a fiebre baja y irritabilidad. ' +
        'Buen estado general, sin signos de alarma.',
      treatment:
        'Tratamiento sintomático con antipirético. Hidratación abundante. Control en 48 horas.',
      prescription: 'Ibuprofeno 100 mg/5 ml — 5 ml cada 8 horas si hay fiebre.',
      patientId: patient6.id,
      doctorId: doctor.id,
      createdAt: dayAt(-25, 11, 45),
    },
  ];

  for (const record of medicalRecordsData) {
    await prisma.medicalRecord.create({ data: record });
  }

  console.log('✅ Created 10 medical records (evoluciones) across 6 patients');

  // ── 7. Prescriptions (immutable legal documents) ─────────────────────────
  const prescriptionsData = [
    {
      medication: 'Ibuprofeno 100 mg/5 ml',
      dosage: '5 ml cada 8 horas',
      instructions: 'Solo si hay fiebre mayor a 38 °C. No superar 3 dosis por día.',
      patientId: patient1.id,
      doctorId: doctor.id,
    },
    {
      medication: 'Vitamina D 800 UI',
      dosage: '1 gota por día',
      instructions: 'Administrar hasta los 12 meses de edad como complemento.',
      patientId: patient2.id,
      doctorId: doctor.id,
    },
    {
      medication: 'Amoxicilina 250 mg/5 ml',
      dosage: '5 ml cada 8 horas',
      instructions: 'Durante 7 días. Completar el tratamiento aunque los síntomas mejoren.',
      patientId: patient3.id,
      doctorId: doctor.id,
    },
    {
      medication: 'Salbutamol aerosol 100 mcg',
      dosage: '2 puff cada 6 horas',
      instructions: 'Usar con aerocámara si hay sibilancias. Consultar si no mejora en 24 horas.',
      patientId: patient5.id,
      doctorId: doctor.id,
    },
  ];

  for (const prescription of prescriptionsData) {
    await prisma.prescription.create({ data: prescription });
  }

  console.log('✅ Created 4 prescriptions linked to their patients');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
