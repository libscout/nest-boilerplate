import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { User } from '../entities';
import { LoggerService } from '@src/tools/logger';
import { UserLookupService } from './user-lookup.service';
import { PasswordHasher } from '../internal/password-hasher';

@Injectable()
export class UserPasswordResetService {
  private readonly TOKEN_TTL_MS = 60 * 60 * 1000;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userLookup: UserLookupService,
    private readonly logger: LoggerService,
  ) {}

  async requestReset(email: string): Promise<string> {
    this.logger.info('Requesting password reset', { email });

    const user = await this.userLookup.byEmail(email);
    if (!user) {
      this.logger.debug('Password reset requested for unknown email', {
        email,
      });
      return 'stub-token';
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.TOKEN_TTL_MS);

    await this.userRepo.update(user.id, {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    });

    this.logger.info('Password reset token generated', { userId: user.id });

    return token;
  }

  async confirmReset(token: string, newPassword: string): Promise<void> {
    this.logger.info('Confirming password reset');

    const user = await this.userRepo.findOne({
      where: { passwordResetToken: token },
      select: {
        id: true,
        passwordResetToken: true,
        passwordResetExpiresAt: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Reset token has expired');
    }

    const newHash = await PasswordHasher.hash(newPassword);

    await this.userRepo.update(user.id, {
      passwordHash: newHash,
      passwordResetToken: null as unknown as string,
      passwordResetExpiresAt: null as unknown as Date,
    });

    this.logger.info('Password reset completed', { userId: user.id });
  }
}
