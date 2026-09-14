import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Header,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';

import { CreatePrescriptionDto } from './dto/create-prescription.dto.js';
import { PrescriptionsService, type PrescriptionWithRelations } from './prescriptions.service.js';

/**
 * PrescriptionsController — REST endpoints for medical prescriptions & PDF generation.
 *
 * Endpoints:
 *  POST /api/v1/patients/:patientId/prescriptions  - Issue prescription & stream PDF (201)
 *  GET  /api/v1/patients/:patientId/prescriptions  - List patient's prescriptions (200)
 *  GET  /api/v1/prescriptions/:id/pdf               - Stream PDF for an existing prescription (200)
 *
 * RBAC — a prescription is a legal medical act:
 * - Class default: DOCTOR, ADMIN, SUPER_ADMIN can READ prescriptions.
 * - POST override: ONLY DOCTOR can ISSUE (sign) a prescription.
 */
@ApiTags('prescriptions')
@Controller({ version: '1' })
@Roles('DOCTOR', 'ADMIN', 'SUPER_ADMIN')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  /**
   * POST /api/v1/patients/:patientId/prescriptions
   * Issues a new medical prescription, records audit trail, and streams the generated PDF document.
   */
  @Post('patients/:patientId/prescriptions')
  @Roles('DOCTOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Issue medical prescription (PDF generation)',
    description:
      'Saves an immutable medical prescription record, logs an audit entry atomically, and streams the PDF document.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiProduces('application/pdf')
  @Header('Content-Type', 'application/pdf')
  @ApiCreatedResponse({
    description: 'Prescription PDF document stream.',
  })
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreatePrescriptionDto,
  ): Promise<StreamableFile> {
    const prescription = await this.prescriptionsService.create(patientId, dto);
    const pdfBuffer = await this.prescriptionsService.generatePdfBuffer(prescription);

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `inline; filename="prescription-${prescription.id}.pdf"`,
    });
  }

  /**
   * GET /api/v1/patients/:patientId/prescriptions
   * Returns list of prescriptions for a patient (JSON).
   */
  @Get('patients/:patientId/prescriptions')
  @ApiOperation({
    summary: "List patient's prescriptions",
    description:
      'Returns all active prescriptions issued for a patient, ordered by creation date descending.',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiOkResponse({
    description: "List of patient's prescriptions.",
  })
  findByPatientId(@Param('patientId') patientId: string): Promise<PrescriptionWithRelations[]> {
    return this.prescriptionsService.findByPatientId(patientId);
  }

  /**
   * GET /api/v1/prescriptions/:id/pdf
   * Streams the PDF document for an existing prescription.
   */
  @Get('prescriptions/:id/pdf')
  @ApiOperation({
    summary: 'Download/Stream prescription PDF',
    description: 'Streams the PDF document for an existing prescription by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription CUID ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiProduces('application/pdf')
  @Header('Content-Type', 'application/pdf')
  @ApiOkResponse({
    description: 'Prescription PDF document stream.',
  })
  async downloadPdf(@Param('id') id: string): Promise<StreamableFile> {
    const prescription = await this.prescriptionsService.findOne(id);
    const pdfBuffer = await this.prescriptionsService.generatePdfBuffer(prescription);

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `inline; filename="prescription-${prescription.id}.pdf"`,
    });
  }
}
