import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchOfficialRole, Prisma, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchFiltersDto } from './dto/match-filters.dto';
import { MatchAssignmentDto } from './dto/set-match-assignments.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

const matchInclude = {
  assignments: {
    include: {
      referee: { select: { id: true, email: true } },
    },
    orderBy: { role: 'asc' as const },
  },
};

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: MatchFiltersDto, user: AuthenticatedUser) {
    if (
      filters.from &&
      filters.to &&
      new Date(filters.from).getTime() > new Date(filters.to).getTime()
    ) {
      throw new BadRequestException(
        'The start date must be earlier than the end date.',
      );
    }

    const where: Prisma.MatchWhereInput = {};
    if (user.role === Role.REFEREE) {
      where.assignments = { some: { refereeId: user.id } };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) {
        where.date.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.date.lte = new Date(filters.to);
      }
    }
    if (filters.team) {
      where.OR = [
        { homeTeam: { contains: filters.team, mode: 'insensitive' } },
        { awayTeam: { contains: filters.team, mode: 'insensitive' } },
      ];
    }
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.match.findMany({
        where,
        include: matchInclude,
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.match.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getById(id: number, user: AuthenticatedUser) {
    const where: Prisma.MatchWhereInput = { id };
    if (user.role === Role.REFEREE) {
      where.assignments = { some: { refereeId: user.id } };
    }

    const match = await this.prisma.match.findFirst({
      where,
      include: matchInclude,
    });
    if (!match) {
      throw new NotFoundException('Match not found.');
    }
    return match;
  }

  create(dto: CreateMatchDto) {
    return this.prisma.match.create({
      data: {
        ...dto,
        date: new Date(dto.date),
      },
      include: matchInclude,
    });
  }

  async update(id: number, dto: UpdateMatchDto) {
    await this.ensureMatchExists(id);
    const { date, ...data } = dto;
    return this.prisma.match.update({
      where: { id },
      data: {
        ...data,
        ...(date ? { date: new Date(date) } : {}),
      },
      include: matchInclude,
    });
  }

  async setAssignments(id: number, assignments: MatchAssignmentDto[]) {
    await this.ensureMatchExists(id);
    this.ensureNoDuplicateAssignments(assignments);

    const refereeIds = assignments.map(({ refereeId }) => refereeId);
    const referees = await this.prisma.user.findMany({
      where: { id: { in: refereeIds }, role: Role.REFEREE },
      select: { id: true },
    });
    if (referees.length !== refereeIds.length) {
      throw new BadRequestException(
        'Every assigned official must have a referee account.',
      );
    }

    try {
      return await this.prisma.$transaction(async (transaction) => {
        await transaction.matchAssignment.deleteMany({
          where: { matchId: id },
        });
        if (assignments.length) {
          await transaction.matchAssignment.createMany({
            data: assignments.map((assignment) => ({
              matchId: id,
              ...assignment,
            })),
          });
        }
        return transaction.match.findUniqueOrThrow({
          where: { id },
          include: matchInclude,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Each referee and each role must be unique within a match.',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.ensureMatchExists(id);
    await this.prisma.match.delete({ where: { id } });
  }

  private async ensureMatchExists(id: number): Promise<void> {
    const match = await this.prisma.match.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!match) {
      throw new NotFoundException('Match not found.');
    }
  }

  private ensureNoDuplicateAssignments(
    assignments: MatchAssignmentDto[],
  ): void {
    const refereeIds = assignments.map(({ refereeId }) => refereeId);
    const roles = assignments.map(({ role }) => role);
    if (
      new Set(refereeIds).size !== refereeIds.length ||
      new Set(roles).size !== roles.length
    ) {
      throw new BadRequestException(
        'A referee and an official role may each appear only once in a match.',
      );
    }
    if (
      assignments.some(
        ({ role }) => !Object.values(MatchOfficialRole).includes(role),
      )
    ) {
      throw new BadRequestException('Unknown match official role.');
    }
  }
}
