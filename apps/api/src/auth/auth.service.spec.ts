import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service.js';

import { AuthService } from './auth.service.js';

import type { Login } from '@pediatric-erp/schemas';

type LoginPayload = Login;

const PLAIN_PASSWORD = 'admin123';
const hashedPassword = bcrypt.hashSync(PLAIN_PASSWORD, 10);

const mockUser = {
  id: 'usr_1',
  email: 'admin@admin.com',
  password: hashedPassword,
  fullName: 'Administrador',
  role: 'SUPER_ADMIN',
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { client: { user: { findFirst: ReturnType<typeof vi.fn> } } };
  let jwt: { signAsync: ReturnType<typeof vi.fn> };

  const credentials: LoginPayload = {
    email: 'admin@admin.com',
    password: PLAIN_PASSWORD,
  };

  beforeEach(async () => {
    prisma = {
      client: {
        user: {
          findFirst: vi.fn(),
        },
      },
    };
    jwt = {
      signAsync: vi.fn().mockResolvedValue('signed.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an access token and a safe user payload on valid credentials', async () => {
    prisma.client.user.findFirst.mockResolvedValue(mockUser);

    const result = await service.login(credentials);

    expect(prisma.client.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'admin@admin.com', deletedAt: null },
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
      role: 'SUPER_ADMIN',
    });
    expect(result).toEqual({
      accessToken: 'signed.jwt.token',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
      },
    });
  });

  it('should throw UnauthorizedException when the user does not exist', async () => {
    prisma.client.user.findFirst.mockResolvedValue(null);

    await expect(service.login(credentials)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when the password is incorrect', async () => {
    prisma.client.user.findFirst.mockResolvedValue(mockUser);

    await expect(
      service.login({ ...credentials, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
