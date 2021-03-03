import { Rhum } from "../../test_deps.ts";
import { ServeStatic } from "../mod.ts";
import { Drash } from "../../deps.ts";

const serveStatic = ServeStatic({
  root_directory: await Deno.realPath("."),
  paths: {
    "/css": "/public/css",
    "/js": "/public/js",
  }
});

const html = `
<!doctype html>
  <head>
    <link rel="stylesheet" src="/css/styles.css">
  </head>
  <body>
    Hella served.
    <script src="/js/scripts.js">
  </body>
</html>
`;

class Resource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = html;
    return this.response;
  }
}

async function runServer(
  port: number,
): Promise<Drash.Http.Server> {
  const server = new Drash.Http.Server({
    resources: [Resource],
    middleware: {
      before_request: [
        serveStatic,
      ],
    },
  });
  await server.run({
    hostname: "localhost",
    port: port,
  });
  return server;
}

Rhum.testPlan("ServeStatic - mod_test.ts", () => {
  Rhum.testSuite("styles.css", () => {
    Rhum.testCase("Properly serves styles.css", async () => {
      const server = await runServer(1667);
      const res = await fetch("http://localhost:1667/");
      const output = await res.text();
      Rhum.asserts.assertEquals(output, html);
      await server.close();
    });
  });

  Rhum.testSuite("scripts.js", () => {
    Rhum.testCase("Properly serves scripts.js", async () => {
      const server = await runServer(1667);
      const res = await fetch("http://localhost:1667/");
      const output = await res.text();
      Rhum.asserts.assertEquals(output, html);
      await server.close();
    });
  });

  Rhum.testSuite("index.html", () => {
    Rhum.testCase("Properly serves index.html with styles.css and scripts.js", async () => {
      const server = await runServer(1667);
      const res = await fetch("http://localhost:1667/");
      const output = await res.text();
      Rhum.asserts.assertEquals(output, html);
      await server.close();
    });
  });
});

Rhum.run();
