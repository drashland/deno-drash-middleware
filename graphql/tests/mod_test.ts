import { Rhum } from "../../test_deps.ts";
import { GraphQL } from "../mod.ts";
import { buildSchema } from "./deps.ts";
import { Drash } from "../../deps.ts";

//
// DATA
//
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);
const root = {
  hello: () => {
    return "Hello world!";
  },
};
const graphQL = GraphQL({ schema, graphiql: true, rootValue: root });
@Drash.Http.Middleware({
  before_request: [graphQL],
})
class GraphQLResource extends Drash.Http.Resource {
  static paths = ["/graphql"];

  // Used purely as an endpoint for the frontend playground
  public GET() {
    return this.response;
  }

  // Used purely as an endpoint to make a query from the client
  public POST() {
    return this.response;
  }
}
const server = new Drash.Http.Server({
  resources: [GraphQLResource],
});
async function serverAction(action: "run" | "close") {
  if (action === "run") {
    await server.run({
      hostname: "localhost",
      port: 1337,
    });
  }
  if (action === "close") {
    server.close();
  }
}

//
// TESTS
//
Rhum.testPlan("Graphql - mod_test.ts", () => {
  Rhum.testSuite("GraphQL", () => {
    Rhum.testCase(
      "Can respond with a playground when used as middleware",
      async () => {
        await serverAction("run");
        const res = await fetch("http://localhost:1337/graphql");
        await serverAction("close");
        const text = await res.text();
        Rhum.asserts.assertEquals(
          text.indexOf("<title>GraphQL Playground</title>") > -1,
          true,
        );
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(res.headers.get("Content-Type"), "text/html");
        Rhum.asserts.assertEquals(true, false); // TODO THIS WHOLE TEST CASE NEEDS OT BE ADDRESSED. the drash server when respondinng with the playground, has a bunch of errors in the console
      },
    );
    Rhum.testCase(
      "Will make a query on a request when used as middleware",
      async () => {
        await serverAction("run");
        const res = await fetch("http://localhost:1337/graphql", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "{ hello }",
        });
        await serverAction("close");
        const json = JSON.parse(await res.json());
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(
          res.headers.get("Content-Type"),
          "application/json",
        );
        Rhum.asserts.assertEquals(json, { data: { hello: "Hello world!" } });
      },
    );
  });
});

Rhum.run();
