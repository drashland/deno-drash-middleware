# Dexter

Dexter is a logging middleware inspired by
[expressjs/morgan](https://github.com/expressjs/morgan). It is configurable and
can be used throughout the request-resource-response lifecycle.

```typescript
import { Drash } from "https://deno.land/x/drash@v1.5.0/mod.ts";

// Import the Dexter middleware function
import { Dexter } from "https://deno.land/x/drash_middleware@v0.7.8/dexter/mod.ts";

// Instantiate dexter
const dexter = Dexter(); // By default, will display the date and time of the request

// Create your server and plug in dexter to the middleware config
const server = new Drash.Http.Server({
  resources: [
    HomeResource,
  ],
  middleware: {
    before_request: [
      dexter,
    ],
    after_request: [
      dexter, // Only use if `response_time` is set for Dexter configs
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

### `datetime`

Will display the date and time of when the request was handled. Example logging
output would be: `[INFO] 2021-07-08 19:59:50 | Request received`

Note that this option is enabled by default. Set `datetime` to `false` when
calling `Dexter` to disable this

### `url`

Will display the requested url. Example logging output would be:
`[INFO] /users | Request received`

### method

Will display the HTTP verb (method) of the request. Example logging output would
be: `[INFO] GET | Request received`

### `response_time`

Will append a value at the end of the logging, showing how long the request
took. Example logging output would be:
`[INFO] <datetime> | Response sent [5 ms]`
