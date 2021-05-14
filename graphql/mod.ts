import { Drash } from "../deps.ts";
import {
  ExecutionResult,
  graphql,
  GraphQLSchema,
  renderPlaygroundPage,
} from "./deps.ts";

type GraphiQLValue = boolean | string;

interface GraphQLOptions {
  schema: GraphQLSchema;
  graphiql: GraphiQLValue;
  rootValue: Record<string, () => string>;
}

function getPlaygroundEndpoint(graphiql: GraphiQLValue): string | undefined {
  const playgroundEndpoint = graphiql === true
    ? "/graphql"
    : typeof graphiql === "string"
    ? graphiql
    : undefined;
  return playgroundEndpoint;
}

function requestIsForPlayground(
  graphiql: GraphiQLValue,
  request: Drash.Http.Request,
): false | string {
  const playgroundEndpoint = getPlaygroundEndpoint(graphiql);
  if (
    playgroundEndpoint && request.method === "GET" &&
    (request.headers.get("Accept")?.includes("text/html") ||
      request.headers.get("Accept")?.includes("*/*"))
  ) {
    return playgroundEndpoint;
  }
  return false;
}

function handleRequestForPlayground(
  playgroundEndpoint: string,
  response: Drash.Http.Response,
): Drash.Http.Response {
  response.headers.set("Content-Type", "text/html");
  response.body = renderPlaygroundPage({ endpoint: playgroundEndpoint });
  return response;
}

async function executeRequest(
  options: GraphQLOptions,
  request: Drash.Http.Request,
  response: Drash.Http.Response,
): Promise<Drash.Http.Response> {
  const body = request.parsed_body.data as Record<string, unknown>;
  const query = Object.keys(body)[0]; // Because drash by default will parse body as application www form url encoded, so the `body` looks like `{ "{ hello }": undefined }`, which is not the correct format
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
    const playgroundEndpoint = requestIsForPlayground(
      options.graphiql,
      request,
    );
    if (playgroundEndpoint) {
      return handleRequestForPlayground(playgroundEndpoint, response);
    }

    if (!["PUT", "POST", "PATCH"].includes(request.method)) {
      response.status_code = 405;
      response.body = "Method Not Allowed";
      return response;
    }

    return await executeRequest(options, request, response);
  };
}

//await graphql(schema, "{ hello }", root)
//curl -X POST localhost:1337/graphql -d '{ hello }'
