import { TestEnv } from '@test/nest';
import { UsersModule } from '../users.module';
import { UserRegistrationService } from './user-registration.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities';
import type { Repository } from 'typeorm';

describe('UserRegistrationService', () => {
  let env: TestEnv;
  let service: UserRegistrationService;
  let repo: Repository<User>;

  beforeAll(async () => {
    env = await TestEnv.create({ imports: [UsersModule] });
    service = env.nest.get(UserRegistrationService);
    repo = env.nest.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await env.cleanup();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  describe('register', () => {
    const dto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'securePassword123',
    };

    it('creates a new user', async () => {
      const user = await service.register(dto);

      expect(user.id).toBeDefined();
      expect(user.email).toBe('new@example.com');
      expect(user.name).toBe('New User');
      expect(user.isEmailVerified).toBe(false);

      // Verify it's persisted
      const found = await repo.findOneBy({ id: user.id });
      expect(found).not.toBeNull();
    });

    it('throws ConflictException for duplicate email', async () => {
      await service.register(dto);

      await expect(service.register(dto)).rejects.toThrow();
    });
  });

  describe('verifyEmail', () => {
    it('marks the user email as verified', async () => {
      const user = await repo.save(
        repo.create({
          email: 'verify@example.com',
          name: 'Verify',
          passwordHash: 'hash',
          isEmailVerified: false,
        }),
      );

      await service.verifyEmail(user.id);

      const updated = await repo.findOneBy({ id: user.id });
      expect(updated!.isEmailVerified).toBe(true);
    });
  });
});
