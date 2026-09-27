import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RefereesController } from './referees.controller';
import { RefereesService } from './referees.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [RefereesController],
  providers: [RefereesService],
})
export class RefereesModule {}
