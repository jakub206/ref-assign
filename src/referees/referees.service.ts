import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefereesService {
  constructor(private readonly prisma: PrismaService) {}

  list(search?: string) {
    return this.prisma.user.findMany({
      where: {
        role: Role.REFEREE,
        ...(search
          ? { email: { contains: search.trim(), mode: 'insensitive' } }
          : {}),
      },
      select: {
        id: true,
        email: true,
        _count: { select: { assignments: true } },
      },
      orderBy: { email: 'asc' },
    });
  }
}
