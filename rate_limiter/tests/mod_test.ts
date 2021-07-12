import { Rhum } from "../../test_deps.ts";
import { RateLimit } from "../mod.ts";
import { Drash } from "../../deps.ts";

class Resource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Hello world!";
    return this.response;
  }
}

const rateLimit = RateLimit({
  timeframe: 15 * 60 * 1000,
  maxRequests: 3,
});

const server = new Drash.Http.Server({
  resources: [Resource],
  middleware: {
    before_request: [
      rateLimit,
    ],
  },
});
const runOptions = {
  hostname: "localhost",
  port: 1667,
};

Rhum.testPlan("RateLimit - mod_test.ts", () => {
  Rhum.testSuite("Not hit limit", () => {
    Rhum.testCase(
      "Header should be set correctly when you request and haven't hit the limit",
      async () => {
        await server.run(runOptions);
        let res;
        let headers;
        res = await fetch("http://localhost:1667/");
        await res.arrayBuffer();
        headers = res.headers;
        Rhum.asserts.assertEquals(res.status, 200)
        Rhum.asserts.assertEquals(await res.text(), "Hello world")
        Rhum.asserts.assertEquals(headers.get("date"), "TODO"); // how do we assert this as we don't know the actual date?
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-remaining"), "2");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-reset"), "TODO"); // how do we assert this as we don't know the actual date?
        res = await fetch("http://localhost:1667/");
        await res.arrayBuffer();
        headers = res.headers;
        await server.close();
        Rhum.asserts.assertEquals(res.status, 200)
        Rhum.asserts.assertEquals(await res.text(), "Hello world")
        Rhum.asserts.assertEquals(headers.get("date"), "TODO"); // how do we assert this as we don't know the actual date?
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-remaining"), "1");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-reset"), "TODO"); // how do we assert this as we don't know the actual date?
      },
    );
  });
  Rhum.testSuite("Has hit limit", () => {
    Rhum.testCase(
      "Header should be set correctly when you request and have hit the limit",
      async () => {
        await server.run(runOptions);
        let res;
        let headers;
        res = await fetch("http://localhost:1667/");
        await res.arrayBuffer();
        res = await fetch("http://localhost:1667/");
        await res.arrayBuffer();
        res = await fetch("http://localhost:1667/");
        await res.arrayBuffer();
        headers = res.headers;
        Rhum.asserts.assertEquals(res.status, 200)
        Rhum.asserts.assertEquals(await res.text(), "Hello world")
        Rhum.asserts.assertEquals(headers.get("date"), "TODO"); // how do we assert this as we don't know the actual date?
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-remaining"), "0");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-reset"), "TODO"); // how do we assert this as we don't know the actual date?
        Rhum.asserts.assertEquals(headers.get("x-retry-after"), undefined);
        res = await fetch("http://localhost:1667/");
        await res.arrayBuffer();
        headers = res.headers;
        await server.close();
        Rhum.asserts.assertEquals(res.status, 429)
        Rhum.asserts.assertEquals(await res.text(), "Too many requests, please try again later.")
        Rhum.asserts.assertEquals(headers.get("date"), "TODO"); // how do we assert this as we don't know the actual date?
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-remaining"), "0");
        Rhum.asserts.assertEquals(headers.get("x-ratelimit-reset"), "TODO"); // how do we assert this as we don't know the actual date?
        Rhum.asserts.assertEquals(headers.get("x-retry-after"), "TODO"); // how do we assert this as we don't know the actual date?
      },
    );
  });
});

Rhum.run();
