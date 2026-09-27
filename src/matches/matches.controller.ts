import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-user';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchFiltersDto } from './dto/match-filters.dto';
import { SetMatchAssignmentsDto } from './dto/set-match-assignments.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@ApiTags('Matches')
@ApiBearerAuth()
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list(
    @Query() filters: MatchFiltersDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.matchesService.list(filters, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.matchesService.getById(id, request.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCreatedResponse({ description: 'Match created.' })
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }

  @Put(':id/assignments')
  @UseGuards(JwtAuthGuard, AdminGuard)
  setAssignments(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetMatchAssignmentsDto,
  ) {
    return this.matchesService.setAssignments(id, dto.assignments);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Match deleted.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.matchesService.remove(id);
  }
}
