import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MatchesModule } from './matches/matches.module';
import { RefereesModule } from './referees/referees.module';

@Module({
  imports: [PrismaModule, AuthModule, MatchesModule, RefereesModule],
  controllers: [AppController],
})
export class AppModule {}
