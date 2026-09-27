import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
