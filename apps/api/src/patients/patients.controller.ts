import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreatePatientDto } from './dto/create-patient.dto.js';
import { PatientsService } from './patients.service.js';

/**
 * PatientsController — endpoints REST para gestión de pacientes pediátricos.
 *
 * Base path: /api/v1/patients
 *
 * Endpoints:
 *  POST   /api/v1/patients        - Crear paciente (201)
 *  GET    /api/v1/patients        - Listar pacientes activos (200)
 *  DELETE /api/v1/patients/:id    - Soft-delete de paciente (204)
 */
@ApiTags('pacientes')
@Controller({ path: 'patients', version: '1' })
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * POST /api/v1/patients
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear paciente pediátrico',
    description:
      'Registra un nuevo paciente en el sistema. Valida datos clínicos (fecha de nacimiento, peso, semanas de gestación) vía Zod.',
  })
  @ApiCreatedResponse({
    description: 'Paciente creado exitosamente.',
    schema: { $ref: '#/components/schemas/CreatePatientDto' },
  })
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  /**
   * GET /api/v1/patients
   */
  @Get()
  @ApiOperation({
    summary: 'Listar pacientes activos',
    description:
      'Retorna todos los pacientes no eliminados (deletedAt: null), ordenados por createdAt descendente.',
  })
  @ApiOkResponse({
    description: 'Lista de pacientes activos.',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/CreatePatientDto' },
    },
  })
  findAll() {
    return this.patientsService.findAll();
  }

  /**
   * DELETE /api/v1/patients/:id
   * Soft-delete: setea deletedAt, NO elimina el registro físico.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar paciente (soft-delete)',
    description:
      'Marca el paciente como eliminado seteando deletedAt. El registro persiste en la base de datos (Ley 26.529).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID CUID del paciente',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiNoContentResponse({
    description: 'Paciente eliminado lógicamente (soft-delete).',
  })
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.patientsService.softDelete(id);
  }
}
