import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus(): string {
    return 'Ref Assign API is running...';
  }
}
