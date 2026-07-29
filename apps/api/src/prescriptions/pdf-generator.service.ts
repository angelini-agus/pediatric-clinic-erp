import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { Prisma } from '@pediatric-erp/db';

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
 * PdfGeneratorService — Generates elegant, professional medical prescription PDFs.
 * Uses native PDFKit for high-performance buffer generation.
 */
@Injectable()
export class PdfGeneratorService {
  /**
   * Generates a PDF buffer for a given prescription.
   * @param prescription - Prescription object with full patient and doctor details
   * @returns Promise resolving to the PDF Buffer
   */
  async generatePrescriptionPdf(
    prescription: PrescriptionWithRelations,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      const { patient, doctor } = prescription;

      // ── Colors ─────────────────────────────────────────────────────────────
      const primaryColor = '#4F46E5'; // Indigo brand
      const textColor = '#1E293B'; // Slate 800
      const mutedColor = '#64748B'; // Slate 500
      const lightBg = '#F8FAFC'; // Slate 50

      // ── Header: Clinic Branding ───────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('iPediERP', 50, 50);

      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text('Clínica Pediátrica & Especialidades Infanto-Juveniles', 50, 75)
        .text('Av. Corrientes 1234, CABA · Tel: +54 11 4567-8900', 50, 88);

      // Header right date & ID
      const dateStr = new Date(prescription.createdAt).toLocaleDateString(
        'es-AR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
      );

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
        .moveTo(50, 110)
        .lineTo(545, 110)
        .strokeColor('#E2E8F0')
        .lineWidth(1)
        .stroke();

      // ── Title: RECETA MÉDICA ───────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RECETA MÉDICA', 50, 125, { align: 'center' });

      // ── Patient Info Box ───────────────────────────────────────────────────
      doc.rect(50, 155, 495, 65).fillAndStroke(lightBg, '#E2E8F0');

      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('PACIENTE:', 65, 167)
        .text('DNI / DOC:', 65, 184)
        .text('OBRA SOCIAL:', 65, 201);

      doc
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text(`${patient.firstName} ${patient.lastName}`, 145, 167)
        .font('Helvetica')
        .text(`${patient.documentType} ${patient.documentNumber}`, 145, 184)
        .text(
          patient.healthInsurance
            ? `${patient.healthInsurance} ${patient.healthInsurancePlan ?? ''} (N° ${patient.healthInsuranceNumber ?? 'N/D'})`
            : 'Particular',
          145,
          201,
        );

      // Age calculation
      const now = new Date();
      const birth = new Date(patient.dateOfBirth);
      const months =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());
      const ageStr = months < 24 ? `${months} meses` : `${Math.floor(months / 12)} años`;

      doc
        .fillColor(mutedColor)
        .font('Helvetica-Bold')
        .text('EDAD:', 380, 167)
        .fillColor(textColor)
        .font('Helvetica')
        .text(ageStr, 420, 167);

      // ── Prescription RP Section ───────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Rp /', 50, 245);

      // Medication & Dosage Box
      doc.rect(50, 275, 495, 200).fillAndStroke('#FFFFFF', '#CBD5E1');

      doc
        .fillColor(textColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('MEDICAMENTO:', 70, 295)
        .fontSize(12)
        .font('Helvetica')
        .text(prescription.medication, 180, 295);

      doc
        .fillColor(textColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DOSIS:', 70, 325)
        .fontSize(12)
        .font('Helvetica')
        .text(prescription.dosage, 180, 325);

      doc
        .fillColor(textColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('INSTRUCCIONES / POSOLOGÍA:', 70, 360);

      doc
        .fillColor('#334155')
        .fontSize(10)
        .font('Helvetica')
        .text(prescription.instructions, 70, 380, {
          width: 455,
          align: 'left',
          lineGap: 4,
        });

      // ── Doctor Signature Block ─────────────────────────────────────────────
      const sigY = 550;

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
        .text(`Dr. ${doctor.fullName}`, 350, sigY + 10, { align: 'center', width: 170 })
        .fontSize(9)
        .font('Helvetica')
        .fillColor(mutedColor)
        .text(doctor.specialty ?? 'Pediatra', 350, sigY + 25, { align: 'center', width: 170 })
        .text(doctor.medicalLicense ?? 'Mat. 48102', 350, sigY + 38, { align: 'center', width: 170 });

      // Footer disclaimer (Ley 26.529)
      doc
        .fillColor('#94A3B8')
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Documento oficial emitido por iPediERP. Válido conforme a la reglamentación de Receta Electrónica. Ley 26.529.',
          50,
          750,
          { align: 'center', width: 495 },
        );

      doc.end();
    });
  }
}
