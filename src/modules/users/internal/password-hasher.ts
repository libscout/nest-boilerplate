import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify<
  string,
  string,
  number,
  Buffer
>(scrypt as unknown as (...args: unknown[]) => void);

/**
 * Internal password hashing utility.
 *
 * Must NOT be imported from outside this module.
 * Only services within the `users` module may use it.
 */
export class PasswordHasher {
  private static readonly KEY_LEN = 64;
  private static readonly SEPARATOR = ':';

  /**
   * Hashes a plaintext password. Returns a string like `salt:hash`.
   */
  static async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(
      password,
      salt,
      PasswordHasher.KEY_LEN,
    );
    return `${salt}${PasswordHasher.SEPARATOR}${derivedKey.toString('hex')}`;
  }

  /**
   * Verifies a plaintext password against a stored hash.
   */
  static async verify(
    plaintext: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, hash] = storedHash.split(PasswordHasher.SEPARATOR);

    if (!salt || !hash) {
      return false;
    }

    const derivedKey = await scryptAsync(
      plaintext,
      salt,
      PasswordHasher.KEY_LEN,
    );

    return timingSafeEqual(derivedKey, Buffer.from(hash, 'hex'));
  }
}
