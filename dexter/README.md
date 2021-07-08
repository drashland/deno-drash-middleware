# Dexter

Dexter is a logging middleware inspired by
[expressjs/morgan](https://github.com/expressjs/morgan). It is configurable and
can be used throughout the request-resource-response lifecycle.

```typescript
import { Drash } from "https://deno.land/x/drash@v1.5.0/mod.ts";

// Import the Dexter middleware function
import { Dexter } from "https://deno.land/x/drash_middleware@v0.7.8/dexter/mod.ts";

// Instantiate dexter
const dexter = Dexter();

// The above will instantiate Dexter with default values:
// {
//     tag_string: "{datetime} |",
//     tag_string_fns: {
//       datetime() {
//         return new Date().toISOString().replace("T", " ").split(".")[0];
//     },
// };

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

## Configuration

If you decide to configure Dexter, make sure you specify the `enabled` flag in
the configs as it is required when customizing the configuration.

### `tag_string`

Define the display of the log messages' tag string. The tag string is a
concatenation of tokens preceding the log message. Available, predefined tags:

- `{level}`
- `{request_method}`
- `{request_url}`

```typescript
const dexter = Dexter({
  enabled: true,
  tag_string: "{level} | {request_method} {request_url} |", // Will output something similar to "INFO | GET /home | The log message."
});
```

### `tag_string_fns`

If you want more customizations with the `tag_string` config, then you can use
`tag_string_fns` to define what your tags should resolve to.

```typescript
const dexter = Dexter({
  enabled: true,
  tag_string: "{datetime} | {my_tag} |", // Will output something similar to "2020-07-12 10:32:14 | TIGERRR | The log message."
  tag_string_fns: {
    datetime() {
      return new Date().toISOString().replace("T", " ").split(".")[0];
    },
    my_tag: "TIGERRR",
  },
});
```

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
   import { Drash } from "https://deno.land/x/drash@v1.5.0/mod.ts";
   import { HomeResource } from "./home_resource.ts";
   import { Dexter } from "https://deno.land/x/drash_middleware@v0.7.8/dexter.ts";

   const dexter = Dexter({
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
   import { Drash } from "https://deno.land/x/drash@v1.5.0/mod.ts";
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

Because of how you have setup the Dexter middleware, your app will display
`[INFO] <uri> <method> | Request Received` when a request is received, and
`[INFO] Response sent.` when the response is sent back to the client
