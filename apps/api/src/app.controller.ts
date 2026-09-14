import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service.js';
import { Public } from './common/decorators/public.decorator.js';

@ApiTags('app')
@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint — basic API information' })
  getInfo(): ReturnType<AppService['getInfo']> {
    return this.appService.getInfo();
  }
}
