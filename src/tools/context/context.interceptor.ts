import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { ContextService } from './context.service';
import type { RequestContext } from './context.model';
import type { Request, Response } from 'express';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private readonly contextService: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const ctx: RequestContext = {
      requestID: (req.headers['x-request-id'] as string) ?? randomUUID(),
      userID: req.headers['x-user-id'] as string | undefined,
    };

    res.setHeader('x-request-id', ctx.requestID);

    return new Observable<unknown>((subscriber) => {
      this.contextService.run(ctx, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
