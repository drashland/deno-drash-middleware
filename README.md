<p align="center">
  <img height="200" src="https://raw.githubusercontent.com/drashland/deno-drash-middleware/master/logo.svg" alt="Drash logo">
  <h1 align="center">Drash Middleware</h1>
</p>
<p align="center">A middleware library for <a href="https://github.com/drashland/deno-drash">Drash</a></p>
<p align="center">
  <a href="https://github.com/drashland/deno-drash-middleware/releases">
    <img src="https://img.shields.io/github/release/drashland/deno-drash-middleware.svg?color=bright_green&label=latest">
  </a>
  <a href="https://github.com/drashland/deno-drash-middleware/actions">
    <img src="https://img.shields.io/github/workflow/status/drashland/deno-drash-middleware/master?label=ci">
  </a>
  <a href="https://discord.gg/SgejNXq">
    <img src="https://img.shields.io/badge/chat-on%20discord-blue">
  </a>
  <a href="https://twitter.com/drash_land">
    <img src="https://img.shields.io/twitter/url?label=%40drash_land&style=social&url=https%3A%2F%2Ftwitter.com%2Fdrash_land">
  </a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Mirrors](#mirrors)
- [Contributing](#contributing)
- [License](#license)

## Overview

This repository contains Drash-approved middleware modules that you can use in your Drash application. Be aware that some modules may use third-party dependencies whilst some will not. You are still able to [**create your own**](https://drash.land/drash/#/tutorials/middleware/introduction) middleware within Drash, but this project supplies already developed middleware that can be plugged straight into your application. Here is the current list of middleware modules:

* [CSRF](./csrf) - Projection middleware. Inspired by [expressjs/csurf](http://expressjs.com/en/resources/middleware/csurf.html).
* [Cors](./cors) - Enables the use of [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
* [Dexter](./dexter) - A logging middleware inspired by [expressjs/morgan](https://github.com/expressjs/morgan).
* [Paladin](./paladin) - Secure your Drash applications by setting various HTTP headers. Inspired by [helmet](https://github.com/helmetjs/helmet).
* [ServeTypeScript](./serve_typescript) - Write front-end TypeScript and serve it as compiled JavaScript.
* [Tengine](./tengine) - Enable templating and use the template engine of your choice.

Each middleware directory in this repository has a `README.md` file that shows you how to use the middleware.

## Mirrors

* https://nest.land/package/drash-middleware

## Contributing

Contributors are welcomed!

Please read through our [contributing guidelines](./.github/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

## License

By contributing your code, you agree to license your contribution under the [MIT License](./LICENSE).
