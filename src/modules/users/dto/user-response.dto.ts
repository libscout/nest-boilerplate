import type { User } from '../entities/user.entity';

/**
 * Public-facing user representation.
 * Omits sensitive fields like passwordHash.
 */
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: string;
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
