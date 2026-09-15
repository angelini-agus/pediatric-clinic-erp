import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service.js';

import { AuthService } from './auth.service.js';

import type { Login, Register, StaffCreate } from '@pediatric-erp/schemas';

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
  let prisma: {
    client: {
      user: { findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    };
  };
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
          create: vi.fn(),
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

  describe('register (patient self-registration)', () => {
    const patientInput: Register = {
      fullName: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    beforeEach(() => {
      prisma.client.user.findFirst.mockResolvedValue(null);
      prisma.client.user.create.mockImplementation((args: { data: Record<string, unknown> }) => ({
        id: 'usr_new',
        ...args.data,
      }));
    });

    it('always creates the user with role PATIENT (never staff)', async () => {
      const result = await service.register(patientInput);

      const [createArgs] = prisma.client.user.create.mock.calls as unknown as [
        { data: { email: string; password: string; fullName: string; role: string } },
      ][];
      expect(createArgs[0].data.email).toBe('ana@example.com');
      expect(createArgs[0].data.fullName).toBe('Ana Pérez');
      expect(createArgs[0].data.role).toBe('PATIENT');
      // The password must be hashed, never persisted in plaintext.
      expect(createArgs[0].data.password).not.toBe('password123');
      expect(result.user.role).toBe('PATIENT');
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: 'usr_new',
        email: 'ana@example.com',
        role: 'PATIENT',
      });
    });

    it('throws ConflictException when the email is already registered', async () => {
      prisma.client.user.findFirst.mockResolvedValue({ id: 'usr_1' });

      await expect(service.register(patientInput)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.client.user.create).not.toHaveBeenCalled();
    });
  });

  describe('createStaff (admin-only)', () => {
    const staffInput: StaffCreate = {
      fullName: 'Dr. Gregory House',
      email: 'house@clinic.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'DOCTOR',
    };

    beforeEach(() => {
      prisma.client.user.findFirst.mockResolvedValue(null);
      prisma.client.user.create.mockImplementation((args: { data: Record<string, unknown> }) => ({
        id: 'usr_staff',
        ...args.data,
      }));
    });

    it('creates the user with the requested staff role', async () => {
      const result = await service.createStaff(staffInput);

      const [createArgs] = prisma.client.user.create.mock.calls as unknown as [
        { data: { email: string; password: string; fullName: string; role: string } },
      ][];
      expect(createArgs[0].data.email).toBe('house@clinic.com');
      expect(createArgs[0].data.fullName).toBe('Dr. Gregory House');
      expect(createArgs[0].data.role).toBe('DOCTOR');
      expect(createArgs[0].data.password).not.toBe('password123');
      expect(result.user.role).toBe('DOCTOR');
      expect(result.accessToken).toBe('signed.jwt.token');
    });

    it('supports SECRETARY and ADMIN roles', async () => {
      await service.createStaff({ ...staffInput, role: 'SECRETARY' });
      await service.createStaff({ ...staffInput, role: 'ADMIN' });

      const calls = prisma.client.user.create.mock.calls as unknown as [
        { data: { role: string } },
      ][];
      expect(calls.map(([args]) => args.data.role)).toEqual(['SECRETARY', 'ADMIN']);
    });

    it('throws ConflictException when the email is already registered', async () => {
      prisma.client.user.findFirst.mockResolvedValue({ id: 'usr_1' });

      await expect(service.createStaff(staffInput)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.client.user.create).not.toHaveBeenCalled();
    });
  });
});
