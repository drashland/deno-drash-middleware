# Drash `server.static_paths` Migration Guide

1. Remove the following from your `const server = new Drash.Http.Server({ ... })` block:

    * `directory`
    * `static_paths`

2. Import `ServeStatic` into your application where you are creating your server.

    ```typescript
    import { ServeStatic } from "https://deno.land/x/drash_middleware@v0.6.2/mod.ts";
    ```

3. Configure ServeStatic.

    ```typescript
    const serveStatic = Static({
      root_directory: Deno.realPathSync("."),
      static_paths: {
        "/assets": "/public/assets", // files in /public/assets will be accessible via example.com/assets
        "/some-other-uri": "/some-other-physical-path", // files in /some-other-physical-path will be accessible via example.com/some-other-uri
      }
    });
    ```

4. Add `ServeStatic` to your server's middleware configs.

    ```typescript
    const server = new Drash.Http.Server({
      ...
      middleware: {
        before_request: [
          serveStatic
        ]
      }
      ...
    });
    ```

5. You are all set!
