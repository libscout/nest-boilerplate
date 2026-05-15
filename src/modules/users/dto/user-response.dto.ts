import { Expose } from 'class-transformer';
import type { User } from '../entities';

/**
 * Public-facing user representation.
 * Only properties decorated with @Expose() are serialized.
 */
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
