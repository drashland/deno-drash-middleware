import { Drash } from "https://deno.land/x/drash@v1.2.5/mod.ts";

export default class UserResource extends Drash.Http.Resource {

  static paths = ["/user"];

  public GET() {
    this.response.body = this.response.render(
      "/user.html",
      {
        user: {
          name: "Captain America",
        },
      },
    );
    return this.response;
  }
}
