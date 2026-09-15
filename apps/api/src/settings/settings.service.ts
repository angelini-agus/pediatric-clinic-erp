import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import type { UpdateSettingsDto } from './dto/update-settings.dto.js';
import type { ClinicSettings } from '@pediatric-erp/db';

const SINGLETON_ID = 'singleton';

/**
 * SettingsService — manages the ClinicSettings singleton record.
 *
 * Design: Only one row ever exists (id = 'singleton'). Reads return
 * null if not yet configured. Writes use upsert to guarantee idempotency.
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the current clinic settings, or null if never configured.
   */
  async getSettings(): Promise<ClinicSettings | null> {
    return this.prisma.client.clinicSettings.findUnique({
      where: { id: SINGLETON_ID },
    });
  }

  /**
   * Creates or updates the clinic settings singleton.
   * All fields default to empty string if not yet set.
   */
  async upsertSettings(dto: UpdateSettingsDto): Promise<ClinicSettings> {
    const defaults = {
      fullName: '',
      licenseNumber: '',
      specialty: '',
      clinicName: '',
    };

    return this.prisma.client.clinicSettings.upsert({
      where: { id: SINGLETON_ID },
      update: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        ...(dto.specialty !== undefined && { specialty: dto.specialty }),
        ...(dto.clinicName !== undefined && { clinicName: dto.clinicName }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
      create: {
        id: SINGLETON_ID,
        ...defaults,
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        ...(dto.specialty !== undefined && { specialty: dto.specialty }),
        ...(dto.clinicName !== undefined && { clinicName: dto.clinicName }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
    });
  }
}
