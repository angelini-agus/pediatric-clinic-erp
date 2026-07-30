import { Test, type TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockPrismaService = {
    client: {
      patient: {
        count: vi.fn(),
      },
      appointment: {
        count: vi.fn(),
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getDashboardMetrics', () => {
    it('should return real-time metrics using concurrent count queries', async () => {
      mockPrismaService.client.patient.count.mockResolvedValue(42);
      mockPrismaService.client.appointment.count
        .mockResolvedValueOnce(5) // today's appointments
        .mockResolvedValueOnce(18); // monthly completed appointments

      const result = await controller.getDashboardMetrics();

      expect(result).toEqual({
        totalPatients: 42,
        todayAppointments: 5,
        monthlyCompletedAppointments: 18,
      });

      expect(mockPrismaService.client.patient.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(mockPrismaService.client.appointment.count).toHaveBeenCalledTimes(2);
    });
  });
});
