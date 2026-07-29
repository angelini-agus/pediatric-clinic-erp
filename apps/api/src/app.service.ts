import { Injectable } from '@nestjs/common';

type ApiInfo = {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly docs: string;
  readonly health: string;
};

@Injectable()
export class AppService {
  getInfo(): ApiInfo {
    return {
      name: 'Pediatric Clinic ERP — API',
      version: 'v1',
      description: 'Pediatric medical ERP RESTful API. Compliant with Law 26.529 (Argentina).',
      docs: '/api/docs',
      health: '/api/v1/health',
    };
  }
}

