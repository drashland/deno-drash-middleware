# RateLimiter

RateLimiter helps you secure your Drash applications by limiting the number of
requests a single user (IP) can request. Inspired by
[express-rate-limit](https://github.com/nfriedly/express-rate-limit). It is
configurable and can be used throughout the request-resource-response lifecycle.
This does not make your application bulletproof, but adds extra security layers.

```typescript
import { Drash } from "https://deno.land/x/drash@v1.4.4/mod.ts";

// Import the RateLimit middleware function
import { RateLimit } from "https://deno.land/x/drash_middleware@v0.7.7/rate_limit/mod.ts";

// Instantiate rateLimit
const rateLimit = RateLimit({
  timeframe: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // Limit each IP to 100 requests per `timeframe`
});

// Create your server and plug in paladin to the middleware config
const server = new Drash.Http.Server({
  resources: [
    HomeResource,
  ],
  middleware: {
    before_request: [
      rateLimit,
    ],
  },
});

server.run({
  hostname: "localhost",
  port: 1447,
});

console.log(`Server running at ${server.hostname}:${server.port}`);
```

## Configuration

You can customise how many requests a user is allowed in a given time

### `timeframe`

This is how long a user is allowed X amount of requests, before the counter
resets. This option is required, and must be in milliseconds.

```typescript
const rateLimit = RateLimit({
  timeframe: 15 * 60 * 1000, // 15 minutes
});
```

### `maxRequests`

This is how many requests a user is allowed within an X amount of time

```typescript
const rateLimit = RateLimit({
  maxRequests: 100, // limit each IP to 100 requests per `timeframe``
});
```
