import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContext } from './context.model';

@Injectable()
export class ContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  /** Run `fn` inside the given context. Used internally by the interceptor. */
  run(ctx: RequestContext, fn: () => unknown): void {
    this.storage.run(ctx, fn);
  }

  /** Returns the current request ID. Throws if called outside a request context. */
  requestId(): string {
    return this.#getStore().requestId;
  }

  /** Returns the current authenticated user ID, or `undefined`. */
  userId(): string | undefined {
    return this.#getStore().userId;
  }

  // ── private ──────────────────────────────────────────────────────

  #getStore(): RequestContext {
    const ctx = this.storage.getStore();
    if (!ctx) {
      throw new Error(
        'No request context available. Ensure ContextInterceptor is applied to this route.',
      );
    }
    return ctx;
  }
}
