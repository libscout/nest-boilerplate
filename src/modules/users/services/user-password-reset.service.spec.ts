import { TestEnv } from '@test/nest';
import { UsersModule } from '../users.module';
import { UserPasswordResetService } from './user-password-reset.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities';
import type { Repository } from 'typeorm';

describe('UserPasswordResetService', () => {
  let env: TestEnv;
  let service: UserPasswordResetService;
  let repo: Repository<User>;

  beforeAll(async () => {
    env = await TestEnv.create({ imports: [UsersModule] });
    service = env.nest.get(UserPasswordResetService);
    repo = env.nest.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await env.cleanup();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  describe('requestReset', () => {
    it('generates a token for an existing user', async () => {
      const user = await repo.save(
        repo.create({
          email: 'reset@example.com',
          name: 'Reset',
          passwordHash: 'old-hash',
        }),
      );

      const token = await service.requestReset('reset@example.com');
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);

      // Token should be stored
      const updated = await repo.findOne({
        where: { id: user.id },
        select: {
          id: true,
          passwordResetToken: true,
          passwordResetExpiresAt: true,
        },
      });
      expect(updated!.passwordResetToken).toBe(token);
      expect(updated!.passwordResetExpiresAt).toBeInstanceOf(Date);
    });

    it('returns a stub token for unknown email without error', async () => {
      const token = await service.requestReset('nobody@example.com');
      expect(token).toBe('stub-token');
    });
  });

  describe('confirmReset', () => {
    it('resets the password with a valid token', async () => {
      const user = await repo.save(
        repo.create({
          email: 'confirm@example.com',
          name: 'Confirm',
          passwordHash: 'old-hash',
        }),
      );

      const token = await service.requestReset('confirm@example.com');

      await service.confirmReset(token, 'newSecurePassword');

      const updated = await repo.findOne({
        where: { id: user.id },
        select: {
          id: true,
          passwordHash: true,
          passwordResetToken: true,
          passwordResetExpiresAt: true,
        },
      });

      expect(updated!.passwordHash).not.toBe('old-hash');
      expect(updated!.passwordResetToken).toBeNull();
      expect(updated!.passwordResetExpiresAt).toBeNull();
    });

    it('throws for an invalid token', async () => {
      await expect(
        service.confirmReset('invalid-token', 'newpass'),
      ).rejects.toThrow();
    });
  });
});
