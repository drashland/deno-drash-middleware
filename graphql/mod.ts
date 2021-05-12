import { Drash } from "../deps.ts";
import {
  ExecutionResult,
  graphql,
  GraphQLSchema,
  renderPlaygroundPage,
} from "./deps.ts";

interface GraphQLOptions {
  schema: GraphQLSchema;
  graphiql: boolean | string;
  rootValue: Record<string, () => string>;
}

/**
 * Taken from https://github.com/deno-libs/gql/blob/master/http.ts but heavily modified to suit drash's needs,
 * and to utilise as much of graphql's own code instead
 */
export function GraphQL(
  options: GraphQLOptions,
): (
  request: Drash.Http.Request,
  response: Drash.Http.Response,
) => Promise<Drash.Http.Response> {
  return async (request: Drash.Http.Request, response: Drash.Http.Response) => {
    const playgroundEndpoint = options.graphiql === true
      ? "/graphql"
      : typeof options.graphiql === "string"
      ? options.graphiql
      : false;
    if (
      options.graphiql && request.method === "GET" &&
      (request.headers.get("Accept")?.includes("text/html") ||
        request.headers.get("Accept")?.includes("*/*"))
    ) {
      response.headers.set("Content-Type", "text/html");
      response.body = renderPlaygroundPage({ endpoint: playgroundEndpoint });
      return response;
    }

    if (!["PUT", "POST", "PATCH"].includes(request.method)) {
      response.status_code = 405;
      response.body = "Method Not Allowed";
      return response;
    }

    const body = request.parsed_body.data as Record<string, unknown>;
    const query = Object.keys(body)[0]; // Because drahs by default will parse body as application ww form url encoded, so the `body` looks like `{ "{ hello }": undefined }`, which is not the correct format and would need addressing ats ome point as drash should allow the body to be a string too
    const result = await graphql(
      options.schema,
      query,
      options.rootValue,
    ) as ExecutionResult;
    if ("errors" in result) {
      response.status_code = 400;
      response.body = "Malformed request body";
      return response;
    }
    response.headers.set("Content-Type", "application/json");
    response.status_code = 200;
    response.body = JSON.stringify(result);
    return response;
  };
}

//await graphql(schema, "{ hello }", root)
//curl -X POST localhost:1337/graphql -d '{ hello }'
