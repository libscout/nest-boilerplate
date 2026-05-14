import { Global, Module, type DynamicModule } from '@nestjs/common';
import pino, { type Logger } from 'pino';
import { ConfigService } from '@src/tools/config';
import { ContextService } from '@src/tools/context';
import { LoggerService } from './logger.service';

export const PINO_LOGGER = 'PINO_LOGGER';

export interface LoggerModuleOptions {
  /** Service name included in every log line. Defaults to `'app'`. */
  service?: string;
}

@Global()
@Module({})
export class LoggerModule {
  static register(opts: LoggerModuleOptions = {}): DynamicModule {
    const service = opts.service ?? 'app';

    return {
      module: LoggerModule,
      global: true,
      providers: [
        {
          provide: PINO_LOGGER,
          inject: [ConfigService, ContextService],
          useFactory: (config: ConfigService, ctx: ContextService): Logger => {
            const isLocal = config.getEnv('IS_LOCAL_ENV') === 'true';
            const isDev = config.getEnv('NODE_ENV') !== 'production';

            return pino({
              level: process.env['LOG_LEVEL'] ?? (isLocal ? 'debug' : 'info'),
              ...((isLocal || isDev) && {
                transport: {
                  target: 'pino-pretty',
                  options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l' },
                },
              }),
              mixin() {
                const req: Record<string, unknown> = {};
                try {
                  req['requestID'] = ctx.requestID();
                } catch {
                  /* outside request context */
                }
                try {
                  const uid = ctx.userID();
                  if (uid) req['userID'] = uid;
                } catch {
                  /* outside request context */
                }
                return req;
              },
              formatters: {
                level(label) {
                  return { level: label };
                },
              },
              timestamp: pino.stdTimeFunctions.isoTime,
              base: { service },
            });
          },
        },
        {
          provide: LoggerService,
          inject: [PINO_LOGGER],
          useFactory: (logger: Logger): LoggerService =>
            new LoggerService(logger),
        },
      ],
      exports: [LoggerService],
    };
  }
}
