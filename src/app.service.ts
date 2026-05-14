import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/tools/context';
import { LoggerService } from '@src/tools/logger';

@Injectable()
export class AppService {
  constructor(
    private readonly context: ContextService,
    private readonly logger: LoggerService,
  ) {}

  getHello(): Record<string, unknown> {
    this.logger.info('Handling getHello');

    return {
      message: 'Hello World!',
      requestID: this.context.requestID(),
      userID: this.context.userID() ?? null,
    };
  }
}
