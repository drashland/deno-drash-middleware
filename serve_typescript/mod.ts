import type { Drash } from "../deps.ts";

interface IFile {
  source: string;
  target: string;
}

interface IOptions {
  files: IFile[];
  compilerOptions?: Deno.CompilerOptions;
}

export function ServeTypeScript(options: IOptions) {
  if (options.files.length <= 0) {
    throw new Error(
      "ServeTypeScript requires an array of files to compile.",
    );
  }

  /**
   * A variable to store all compiled file data. The key in the map is the
   * filepath and the value is the contents. For example:
   *
   *     ["/ts/my_file.ts", "console.log('hello')"]
   */
  const compiledFiles = new Map<string, string>();

  /**
   * The method to execute during compile time.
   */
  async function compile(): Promise<void> {
    for (const index in options.files) {
      const file = options.files[index];

      try {
        const { diagnostics, files } = await Deno.emit(
          file.source,
          {
            compilerOptions: options.compilerOptions ?? {},
          },
        );
        const fileKey = Object.keys(files).find((filename) => {
          return filename.includes(".ts.js.map") === false;
        }) as string;
        const outputString = files[fileKey];

        const formattedDiagnostics = Deno.formatDiagnostics(diagnostics);
        if (formattedDiagnostics !== "") {
          throw new Error(formattedDiagnostics);
        }

        // Store the compiled out in the
        // `compiledFiles` variable so that we can check it later for files
        // when clients make requests.
        compiledFiles.set(
          file.target,
          outputString.replace(/\/\/\# sourceMapping.+/, ""), // contents
        );
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }

  /**
   * The method to execute during runtime.
   *
   * @param request - The request object.
   * @param response - The response object.
   */
  function run(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): void {
    if (!request.url.includes(".ts")) {
      return;
    }

    response.headers.set("Content-Type", "text/javascript");

    const filepath = request.url.split("?")[0];
    const contents = compiledFiles.get(filepath);

    if (contents) {
      response.body = contents;
    }
  }

  return {
    compile,
    run,
  };
}
