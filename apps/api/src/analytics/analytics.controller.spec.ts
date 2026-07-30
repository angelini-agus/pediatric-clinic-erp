import { Test, type TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockPrismaService = {
    client: {
      appointment: {
        findFirst: vi.fn(),
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
    it('should return operational metrics for the 4 dashboard cards', async () => {
      const mockNextAppt = {
        id: 'appt-1',
        dateTime: new Date('2026-07-30T10:30:00.000Z'),
        type: 'Control de Rutina',
        patient: {
          id: 'pat-1',
          firstName: 'Valentina',
          lastName: 'Pérez',
          dateOfBirth: new Date('2023-01-15T00:00:00.000Z'),
        },
      };

      mockPrismaService.client.appointment.findFirst.mockResolvedValue(mockNextAppt);
      mockPrismaService.client.appointment.count
        .mockResolvedValueOnce(12) // funnelTotal
        .mockResolvedValueOnce(5)  // funnelCompleted
        .mockResolvedValueOnce(4)  // funnelWaiting
        .mockResolvedValueOnce(1)  // unsignedRecords
        .mockResolvedValueOnce(2); // canceledToday

      const result = await controller.getDashboardMetrics();

      expect(result).toEqual({
        nextAppointment: {
          id: 'appt-1',
          dateTime: mockNextAppt.dateTime,
          time: expect.any(String),
          type: 'Control de Rutina',
          patient: {
            id: 'pat-1',
            firstName: 'Valentina',
            lastName: 'Pérez',
            fullName: 'Valentina Pérez',
            age: expect.any(String),
          },
        },
        appointmentFunnel: {
          total: 12,
          completed: 5,
          waiting: 4,
        },
        unsignedRecords: 1,
        canceledToday: 2,
      });

      expect(mockPrismaService.client.appointment.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.client.appointment.count).toHaveBeenCalledTimes(5);
    });

    it('should handle null nextAppointment when no upcoming appointments exist today', async () => {
      mockPrismaService.client.appointment.findFirst.mockResolvedValue(null);
      mockPrismaService.client.appointment.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await controller.getDashboardMetrics();

      expect(result.nextAppointment).toBeNull();
      expect(result.appointmentFunnel).toEqual({ total: 0, completed: 0, waiting: 0 });
      expect(result.unsignedRecords).toBe(0);
      expect(result.canceledToday).toBe(0);
    });
  });
});
