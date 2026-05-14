./rules



# Logging

The application uses structured logging.

In local development, logs are printed in a pretty, human-readable format to make debugging easier.

In cloud and production environments, logs are printed as plain JSON. This makes them easy to collect, search, and process by log systems such as CloudWatch, Loki, OpenSearch, Datadog, or Kubernetes log collectors.

Each log entry contains the service name, request context, optional user context, and the actual log message body.

```ts
interface LogEntry {
  timestamp: string; // ISO
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string; // service name

  requestID?: string;
  userID?: string;

  body: unknown[];

  err?: {
    message: string;
    stack?: string;
  };
}
```
