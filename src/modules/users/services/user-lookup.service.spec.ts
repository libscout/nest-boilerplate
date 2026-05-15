import { TestEnv } from '@test/nest';
import { UsersModule } from '../users.module';
import { UserLookupService } from './user-lookup.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities';
import type { Repository } from 'typeorm';

describe('UserLookupService', () => {
  let env: TestEnv;
  let service: UserLookupService;
  let repo: Repository<User>;

  beforeAll(async () => {
    env = await TestEnv.create({ imports: [UsersModule] });
    service = env.nest.get(UserLookupService);
    repo = env.nest.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await env?.cleanup();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  describe('byId', () => {
    it('returns a user when found', async () => {
      const user = await repo.save(
        repo.create({
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: 'hash',
        }),
      );

      const result = await service.byId(user.id);
      expect(result.id).toBe(user.id);
      expect(result.email).toBe('test@example.com');
    });

    it('throws when user is not found', async () => {
      await expect(
        service.byId('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow();
    });
  });

  describe('byEmail', () => {
    it('returns a user by email', async () => {
      await repo.save(
        repo.create({
          email: 'findme@example.com',
          name: 'Find Me',
          passwordHash: 'hash',
        }),
      );

      const result = await service.byEmail('findme@example.com');
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Find Me');
    });

    it('returns null for unknown email', async () => {
      const result = await service.byEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('returns paginated users', async () => {
      await repo.save([
        repo.create({ email: 'a@a.com', name: 'A', passwordHash: 'h' }),
        repo.create({ email: 'b@b.com', name: 'B', passwordHash: 'h' }),
        repo.create({ email: 'c@c.com', name: 'C', passwordHash: 'h' }),
      ]);

      const result = await service.list(1, 2);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(3);
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('existsByEmail', () => {
    it('returns true when user exists', async () => {
      await repo.save(
        repo.create({
          email: 'exists@example.com',
          name: 'Exists',
          passwordHash: 'hash',
        }),
      );

      const result = await service.existsByEmail('exists@example.com');
      expect(result).toBe(true);
    });

    it('returns false when user does not exist', async () => {
      const result = await service.existsByEmail('no@example.com');
      expect(result).toBe(false);
    });
  });
});
