import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RefereesService } from './referees.service';

@ApiTags('Referees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('referees')
export class RefereesController {
  constructor(private readonly refereesService: RefereesService) {}

  @Get()
  @ApiOkResponse({
    description: 'Lists referees available for match assignments.',
  })
  @ApiForbiddenResponse({
    description: 'Access is restricted to administrators.',
  })
  list(@Query('search') search?: string) {
    return this.refereesService.list(search);
  }
}
