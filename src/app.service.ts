import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/tools/context';

@Injectable()
export class AppService {
  constructor(private readonly context: ContextService) {}

  getHello(): Record<string, unknown> {
    return {
      message: 'Hello World!',
      requestId: this.context.requestId(),
      userId: this.context.userId() ?? null,
    };
  }
}
