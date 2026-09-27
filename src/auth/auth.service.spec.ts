import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {},
}));

type PublicUser = { id: number; email: string; role: 'REFEREE' };
type CreateUserArgs = {
  data: { email: string; password: string };
  select: { id: true; email: true; role: true };
};
type SignedPayload = {
  sub: number;
  email: string;
  role: 'REFEREE';
  timestamp: number;
};

describe('AuthService', () => {
  const createUserMock =
    jest.fn<(args: CreateUserArgs) => Promise<PublicUser>>();
  const findUserMock = jest.fn<
    (args: unknown) => Promise<{
      id: number;
      email: string;
      password: string;
      role: 'REFEREE';
    } | null>
  >();
  const prismaMock = {
    user: {
      create: createUserMock,
      findUnique: findUserMock,
    },
  };
  const prisma = prismaMock as unknown as PrismaService;
  const signMock = jest.fn<(payload: SignedPayload) => string>();
  const jwtServiceMock = { sign: signMock };
  const jwtService = jwtServiceMock as unknown as JwtService;
  const service = new AuthService(prisma, jwtService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a referee account without returning its password hash', async () => {
    const publicUser: PublicUser = {
      id: 5,
      email: 'ref@example.com',
      role: 'REFEREE',
    };
    let receivedArgs: CreateUserArgs | undefined;
    findUserMock.mockResolvedValue(null);
    createUserMock.mockImplementation((args: CreateUserArgs) => {
      receivedArgs = args;
      return Promise.resolve(publicUser);
    });

    const result = await service.registerUser({
      email: 'ref@example.com',
      password: 'SafePassword123',
    });

    expect(result).toEqual(publicUser);
    if (!receivedArgs) {
      throw new Error('Prisma create was not called');
    }
    expect(receivedArgs.data.password).not.toBe('SafePassword123');
    expect(receivedArgs.select).toEqual({ id: true, email: true, role: true });
  });

  it('returns a JWT for valid credentials', async () => {
    const password = await bcrypt.hash('SafePassword123', 4);
    findUserMock.mockResolvedValue({
      id: 5,
      email: 'ref@example.com',
      password,
      role: 'REFEREE',
    });
    let signedPayload: SignedPayload | undefined;
    signMock.mockImplementation((payload: SignedPayload) => {
      signedPayload = payload;
      return 'signed-token';
    });

    await expect(
      service.loginUser({
        email: 'ref@example.com',
        password: 'SafePassword123',
      }),
    ).resolves.toEqual({ access_token: 'signed-token' });
    if (!signedPayload) {
      throw new Error('JWT payload was not signed');
    }
    expect(signedPayload).toMatchObject({
      sub: 5,
      email: 'ref@example.com',
      role: 'REFEREE',
    });
    expect(Number.isFinite(signedPayload.timestamp)).toBe(true);
  });

  it('rejects invalid credentials', async () => {
    findUserMock.mockResolvedValue(null);

    await expect(
      service.loginUser({
        email: 'missing@example.com',
        password: 'SafePassword123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
