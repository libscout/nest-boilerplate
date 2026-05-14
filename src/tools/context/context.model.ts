/**
 * Per-request context carried through the entire request lifecycle
 * via AsyncLocalStorage.
 */
export interface RequestContext {
  /** Unique identifier for this request. */
  requestID: string;

  /** Authenticated user ID. Populated by auth guard/middleware. */
  userID?: string;
}
