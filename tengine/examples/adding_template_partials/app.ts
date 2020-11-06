import { Drash } from "https://deno.land/x/drash@v1.2.5/mod.ts";

import UserResource from "./user_resource.ts";

const server = new Drash.Http.Server({
  resources: [
    UserResource
  ],
  response_output: "text/html",
  template_engine: true,
  views_path: "./views",
});

server.run({
  hostname: "localhost",
  port: 1447
});
