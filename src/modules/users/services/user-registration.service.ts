import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { LoggerService } from '@src/tools/logger';
import type { CreateUserDto } from '../dto';
import { UserLookupService } from './user-lookup.service';
import { PasswordHasher } from '../internal/password-hasher';

@Injectable()
export class UserRegistrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userLookup: UserLookupService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Registers a new user.
   * Throws if the email is already taken.
   */
  async register(dto: CreateUserDto): Promise<User> {
    this.logger.info('Registering new user', { email: dto.email });

    const exists = await this.userLookup.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException(
        `User with email "${dto.email}" already exists`,
      );
    }

    const passwordHash = await PasswordHasher.hash(dto.password);

    const user = this.userRepo.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      isEmailVerified: false,
    });

    const saved = await this.userRepo.save(user);

    this.logger.info('User registered successfully', { userId: saved.id });

    return saved;
  }

  /**
   * Marks a user's email as verified.
   */
  async verifyEmail(userId: string): Promise<void> {
    this.logger.info('Verifying user email', { userId });

    await this.userRepo.update(userId, { isEmailVerified: true });
  }
}
