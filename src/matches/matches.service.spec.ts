import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MatchOfficialRole, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchesService } from './matches.service';

describe('MatchesService', () => {
  const prismaMock = {
    match: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };
  const prisma = prismaMock as unknown as PrismaService;
  const service = new MatchesService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('limits referee match details to matches they are assigned to', async () => {
    prismaMock.match.findFirst.mockResolvedValue(null);

    await expect(
      service.getById(44, {
        id: 7,
        email: 'ref@example.com',
        role: Role.REFEREE,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaMock.match.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 44, assignments: { some: { refereeId: 7 } } },
      }),
    );
  });

  it('rejects an assignment list that repeats a role', async () => {
    prismaMock.match.findUnique.mockResolvedValue({ id: 1 });
    const assignment = {
      refereeId: 2,
      role: MatchOfficialRole.REFEREE,
    };

    await expect(
      service.setAssignments(1, [
        assignment,
        { refereeId: 3, role: MatchOfficialRole.REFEREE },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });
});
