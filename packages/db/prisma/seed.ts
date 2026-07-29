import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data for idempotency
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Test Doctor
  const doctor = await prisma.user.create({
    data: {
      email: 'ricardo.silva@pediatric-erp.com',
      password: '$2b$10$EpRvmqqWtZe.7e/g694eM.W8D4m64g0p/vT6r062f7k5.7c94m00C', // hashed placeholder
      fullName: 'Dr. Ricardo Silva',
      role: UserRole.DOCTOR,
      specialty: 'Pediatra',
      medicalLicense: 'Mat. 48102',
      phone: '+54 9 11 3456-7890',
    },
  });
  console.log(`✅ Created doctor: ${doctor.fullName} (${doctor.medicalLicense})`);

  // 2. Pediatric Patients with Guardians
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

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

  console.log('✅ Created 6 pediatric patients with guardians');

  // Helper to set appointment time today
  const createTodayDate = (hours: number, minutes: number) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // 3. Appointments for TODAY
  const appointmentsData = [
    {
      dateTime: createTodayDate(9, 0),
      type: 'Control de Rutina',
      notes: 'Paciente con crecimiento y desarrollo dentro de percentiles normales.',
      status: AppointmentStatus.COMPLETED,
      patientId: patient1.id,
      doctorId: doctor.id,
    },
    {
      dateTime: createTodayDate(9, 30),
      type: 'Consulta de Control',
      notes: 'Revisión esquema de vacunación 18 meses.',
      status: AppointmentStatus.IN_PROGRESS,
      patientId: patient2.id,
      doctorId: doctor.id,
    },
    {
      dateTime: createTodayDate(10, 0),
      type: 'Vacunación SAP',
      notes: 'Refuerzo vacuna ingreso escolar.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient3.id,
      doctorId: doctor.id,
    },
    {
      dateTime: createTodayDate(10, 30),
      type: 'Control 9 Meses',
      notes: 'Evaluación pauta madurativa y alimentación complementaria.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient4.id,
      doctorId: doctor.id,
    },
    {
      dateTime: createTodayDate(11, 0),
      type: 'Cuadro Febril',
      notes: 'Cancelado por el tutor por mejoría del cuadro.',
      status: AppointmentStatus.CANCELED,
      patientId: patient5.id,
      doctorId: doctor.id,
    },
    {
      dateTime: createTodayDate(11, 30),
      type: 'Control de Crecimiento',
      notes: 'Control periódico de peso y talla.',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient6.id,
      doctorId: doctor.id,
    },
  ];

  for (const appt of appointmentsData) {
    await prisma.appointment.create({ data: appt });
  }

  console.log('✅ Created 6 appointments for TODAY');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
