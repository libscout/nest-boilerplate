import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from './users.controller';
import { UserLookupService, UserRegistrationService, UserPasswordResetService } from '../services';
import { ContextService } from '@src/tools/context';

describe('UsersController', () => {
  let app: INestApplication;

  const mockContext = {
    userID: jest.fn().mockReturnValue(undefined),
    requestID: jest.fn().mockReturnValue('req-1'),
  };

  const mockLookup = {
    byId: jest.fn(),
    byEmail: jest.fn(),
    list: jest.fn(),
    existsByEmail: jest.fn(),
  };

  const mockRegistration = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
  };

  const mockPasswordReset = {
    requestReset: jest.fn(),
    confirmReset: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UserLookupService, useValue: mockLookup },
        { provide: UserRegistrationService, useValue: mockRegistration },
        { provide: UserPasswordResetService, useValue: mockPasswordReset },
        { provide: ContextService, useValue: mockContext },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    it('returns 201 with the created user', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        isEmailVerified: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockRegistration.register.mockResolvedValue(user);

      const res = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test',
          password: 'password123',
        })
        .expect(201);

      expect(res.body.id).toBe('user-1');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.createdAt).toBe('2025-01-01T00:00:00.000Z');
    });

    it('returns 400 for invalid input', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'not-an-email', name: '' })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('returns paginated users with defaults', async () => {
      mockLookup.list.mockResolvedValue({
        data: [
          {
            id: 'user-1',
            email: 'a@a.com',
            name: 'A',
            isEmailVerified: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const res = await request(app.getHttpServer()).get('/users').expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('passes pagination params to service', async () => {
      mockLookup.list.mockResolvedValue({
        data: [],
        meta: {
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

      await request(app.getHttpServer()).get('/users?page=2&limit=5').expect(200);

      expect(mockLookup.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 5 }));
    });

    it('transforms string query params to numbers', async () => {
      mockLookup.list.mockResolvedValue({
        data: [],
        meta: {
          page: 3,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

      await request(app.getHttpServer()).get('/users?page=3&limit=10').expect(200);

      const calledWith = mockLookup.list.mock.calls[0][0];
      expect(typeof calledWith.page).toBe('number');
      expect(typeof calledWith.limit).toBe('number');
    });

    it('returns 400 for invalid page (non-number)', async () => {
      await request(app.getHttpServer()).get('/users?page=abc').expect(400);
    });

    it('returns 400 for page less than 1', async () => {
      await request(app.getHttpServer()).get('/users?page=0').expect(400);
    });

    it('returns 400 for limit over 100', async () => {
      await request(app.getHttpServer()).get('/users?limit=200').expect(400);
    });
  });

  describe('GET /users/:id', () => {
    it('returns a user by id', async () => {
      mockLookup.byId.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        isEmailVerified: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const res = await request(app.getHttpServer()).get('/users/user-1').expect(200);

      expect(res.body.id).toBe('user-1');
      expect(res.body.isEmailVerified).toBe(true);
    });
  });

  describe('POST /users/password-reset/request', () => {
    it('returns 202 with a message', async () => {
      mockPasswordReset.requestReset.mockResolvedValue('token');

      await request(app.getHttpServer())
        .post('/users/password-reset/request')
        .send({ email: 'test@example.com' })
        .expect(202);
    });
  });

  describe('POST /users/password-reset/confirm', () => {
    it('returns 204 on success', async () => {
      mockPasswordReset.confirmReset.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/users/password-reset/confirm')
        .send({ token: 'token', newPassword: 'newPassword123' })
        .expect(204);
    });
  });
});
