import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

/** Minimal doctor shape for client-side selects. */
export type DoctorListItem = {
  id: string;
  fullName: string;
  specialty: string | null;
  medicalLicense: string | null;
};

/**
 * DoctorsService — read-only queries for user/doctor lookup.
 * Only returns users with role DOCTOR and deletedAt: null.
 */
@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all active doctors (role = DOCTOR, deletedAt = null).
   * Ordered by fullName ascending for predictable UI ordering.
   */
  async findAll(): Promise<DoctorListItem[]> {
    return this.prisma.client.user.findMany({
      where: { role: 'DOCTOR', deletedAt: null },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        medicalLicense: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }
}
