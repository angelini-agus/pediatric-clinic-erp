import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { Prisma } from '@pediatric-erp/db';
import { SettingsService } from '../settings/settings.service.js';

export type PrescriptionWithRelations = Prisma.PrescriptionGetPayload<{
  include: {
    patient: true;
    doctor: {
      select: {
        id: true;
        fullName: true;
        specialty: true;
        medicalLicense: true;
      };
    };
  };
}>;

/**
 * PdfGeneratorService — Generates professional medical prescription PDFs.
 * Uses native PDFKit for high-performance buffer generation.
 * Injects ClinicSettings for dynamic clinic/doctor branding.
 */
@Injectable()
export class PdfGeneratorService {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Generates a PDF buffer for a given prescription.
   * Fetches ClinicSettings from DB; falls back to prescription.doctor data if not configured.
   * @param prescription - Prescription object with full patient and doctor details
   * @returns Promise resolving to the PDF Buffer
   */
  async generatePrescriptionPdf(
    prescription: PrescriptionWithRelations,
  ): Promise<Buffer> {
    // Fetch clinic settings; fall back to safe defaults if not yet configured
    const settings = await this.settingsService.getSettings();
    const clinicName = settings?.clinicName || 'iPediERP';
    const clinicSubtitle = settings?.clinicName
      ? `${settings.clinicName} — Sistema de Gestión Pediátrica`
      : 'Clínica Pediátrica & Especialidades Infanto-Juveniles';
    const doctorFullName = settings?.fullName || prescription.doctor.fullName;
    const doctorSpecialty =
      settings?.specialty || prescription.doctor.specialty || 'Pediatra';
    const doctorLicense =
      settings?.licenseNumber || prescription.doctor.medicalLicense || 'Mat. N/D';

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      const { patient } = prescription;

      // ── Colors ─────────────────────────────────────────────────────────────
      const primaryColor = '#4F46E5';
      const textColor = '#1E293B';
      const mutedColor = '#64748B';
      const lightBg = '#F8FAFC';

      // ── Header: Clinic Branding ───────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(clinicName, 50, 50);

      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text(clinicSubtitle, 50, 75);

      // Header right: date & prescription ID
      const dateStr = new Date(prescription.createdAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`FECHA: ${dateStr}`, 400, 50, { align: 'right' })
        .font('Helvetica')
        .fillColor(mutedColor)
        .text(`Receta N°: ${prescription.id.slice(-8).toUpperCase()}`, 400, 65, {
          align: 'right',
        });

      // Divider Line
      doc
        .moveTo(50, 100)
        .lineTo(545, 100)
        .strokeColor('#E2E8F0')
        .lineWidth(1)
        .stroke();

      // ── Title ─────────────────────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RECETA MÉDICA', 50, 115, { align: 'center' });

      // ── Patient Info Box ───────────────────────────────────────────────────
      doc.rect(50, 145, 495, 65).fillAndStroke(lightBg, '#E2E8F0');

      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('PACIENTE:', 65, 157)
        .text('DNI / DOC:', 65, 174)
        .text('OBRA SOCIAL:', 65, 191);

      doc
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text(`${patient.firstName} ${patient.lastName}`, 145, 157)
        .font('Helvetica')
        .text(`${patient.documentType} ${patient.documentNumber}`, 145, 174)
        .text(
          patient.healthInsurance
            ? `${patient.healthInsurance} ${patient.healthInsurancePlan ?? ''} (N° ${patient.healthInsuranceNumber ?? 'N/D'})`
            : 'Particular',
          145,
          191,
        );

      // Age calculation
      const now = new Date();
      const birth = new Date(patient.dateOfBirth);
      const months =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());
      const ageStr =
        months < 24 ? `${months} meses` : `${Math.floor(months / 12)} años`;

      doc
        .fillColor(mutedColor)
        .font('Helvetica-Bold')
        .text('EDAD:', 380, 157)
        .fillColor(textColor)
        .font('Helvetica')
        .text(ageStr, 420, 157);

      // ── Prescription RP Section ───────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Rp /', 50, 235);

      // Medication & Dosage Box
      doc.rect(50, 265, 495, 200).fillAndStroke('#FFFFFF', '#CBD5E1');

      doc
        .fillColor(textColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('MEDICAMENTO:', 70, 285)
        .fontSize(12)
        .font('Helvetica')
        .text(prescription.medication, 180, 285);

      doc
        .fillColor(textColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DOSIS:', 70, 315)
        .fontSize(12)
        .font('Helvetica')
        .text(prescription.dosage, 180, 315);

      doc
        .fillColor(textColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('INSTRUCCIONES / POSOLOGÍA:', 70, 350);

      doc
        .fillColor('#334155')
        .fontSize(10)
        .font('Helvetica')
        .text(prescription.instructions, 70, 370, {
          width: 455,
          align: 'left',
          lineGap: 4,
        });

      // ── Doctor Signature Block ─────────────────────────────────────────────
      const sigY = 540;

      doc
        .moveTo(350, sigY)
        .lineTo(520, sigY)
        .strokeColor('#94A3B8')
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(textColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Dr. ${doctorFullName}`, 350, sigY + 10, { align: 'center', width: 170 })
        .fontSize(9)
        .font('Helvetica')
        .fillColor(mutedColor)
        .text(doctorSpecialty, 350, sigY + 25, { align: 'center', width: 170 })
        .text(doctorLicense, 350, sigY + 38, { align: 'center', width: 170 });

      // Footer disclaimer (Ley 26.529)
      doc
        .fillColor('#94A3B8')
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Documento oficial emitido por ${clinicName}. Válido conforme a la reglamentación de Receta Electrónica. Ley 26.529.`,
          50,
          750,
          { align: 'center', width: 495 },
        );

      doc.end();
    });
  }
}
