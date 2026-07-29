import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';

import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';

describe('HealthController', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return status ok with memory health indicators', async () => {
      const controller = app.get(HealthController);
      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.details).toBeDefined();
      expect(result.details['memory_heap']).toBeDefined();
      expect(result.details['memory_heap']!.status).toBe('up');
      expect(result.details['memory_rss']).toBeDefined();
      expect(result.details['memory_rss']!.status).toBe('up');
    });

    it('should include info property in the health check result', async () => {
      const controller = app.get(HealthController);
      const result = await controller.check();

      expect(result.info).toBeDefined();
      expect(result.info!['memory_heap']).toEqual({ status: 'up' });
      expect(result.info!['memory_rss']).toEqual({ status: 'up' });
    });

    it('should include empty error property when healthy', async () => {
      const controller = app.get(HealthController);
      const result = await controller.check();

      expect(result.error).toEqual({});
    });
  });
});
