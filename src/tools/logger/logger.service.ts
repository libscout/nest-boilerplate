import { Injectable, type LoggerService as NestLoggerService } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private readonly pino: PinoLogger) {}

  // ── pino-style methods ───────────────────────────────────────────

  trace(msg: string, ...args: unknown[]): void {
    this.pino.trace(args.length ? args : msg, args.length ? msg : undefined);
  }

  debug(msg: string, ...args: unknown[]): void {
    this.pino.debug(args.length ? args : msg, args.length ? msg : undefined);
  }

  info(msg: string, ...args: unknown[]): void {
    this.pino.info(args.length ? args : msg, args.length ? msg : undefined);
  }

  warn(msg: string, ...args: unknown[]): void {
    this.pino.warn(args.length ? args : msg, args.length ? msg : undefined);
  }

  error(msg: string, ...args: unknown[]): void {
    this.pino.error(args.length ? args : msg, args.length ? msg : undefined);
  }

  fatal(msg: string, ...args: unknown[]): void {
    this.pino.fatal(args.length ? args : msg, args.length ? msg : undefined);
  }

  // ── NestJS LoggerService compatibility ──────────────────────────

  log(message: string, ...optionalParams: unknown[]): void {
    this.info(message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    this.trace(message, ...optionalParams);
  }
}
