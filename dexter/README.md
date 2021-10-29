# Dexter

Dexter is a logging middleware inspired by
[expressjs/morgan](https://github.com/expressjs/morgan). It is configurable and
can be used throughout the request-resource-response lifecycle.

```typescript
import { Drash } from "https://deno.land/x/drash@v2.0.0/mod.ts";

// Import the Dexter middleware function
import { Dexter } from "https://deno.land/x/drash_middleware@v0.7.9/dexter/mod.ts";

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

If you want to see how fast your responses are taking, then use this config.
This config will output something similar to `Response sent. [2 ms]`.

```typescript
const dexter = Dexter({
  enabled: true,
  response_time: true, // or false
});
```

## Tutorials

### Reusing Dexter in resource classes (or other parts of your codebase)

You can reuse Dexter in your codebase by accessing its `logger`. For example, if
you want to use Dexter in one of your resources, then do the following:

1. Create your `app.ts` file.

   ```typescript
   // File: app.ts
   import { Drash } from "https://deno.land/x/drash@v2.0.0/mod.ts";
   import { HomeResource } from "./home_resource.ts";
   import { Dexter } from "https://deno.land/x/drash_middleware@v0.7.9/dexter.ts";

   const dexter = Dexter({
     enabled: true,
     level: "debug",
     tag_string: "{request_method} {request_url} |",
   });

   // Export dexter after calling it with your configurations
   export { dexter };

   const server = new Drash.Http.Server({
     resources: [
       HomeResource,
     ],
     middleware: {
       before_request: [
         dexter,
       ],
       after_request: [
         dexter,
       ],
     },
   });

   server.run({
     hostname: "localhost",
     port: 1447,
   });

   console.log(`Server running at ${server.hostname}:${server.port}`);
   ```

2. Create your `home_resource` file.

   ```typescript
   import { Drash } from "https://deno.land/x/drash@v2.0.0/mod.ts";
   import { dexter } from "./app.ts";

   export class HomeResource extends Drash.Http.Resource {
     static paths = ["/"];

     public GET() {
       // Access Dexter's logger from it's prototype and log some messages
       dexter.logger.debug("This is a log message.");
       dexter.logger.error("This is a log message.");
       dexter.logger.fatal("This is a log message.");
       dexter.logger.info("This is a log message.");
       dexter.logger.trace("This is a log message.");
       dexter.logger.warn("This is a log message.");

       this.response.body = "GET request received!";

       return this.response;
     }
   }
   ```
