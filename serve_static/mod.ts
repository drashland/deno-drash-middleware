import { Drash } from "../deps.ts";
import { mimeDb } from "./mime_db.ts";

interface IOptions {
  root_directory: string;
  static_paths: {[key: string]: string};
}

export function ServeStatic(
  options: IOptions,
) {

  /**
   * The middleware function that's called by Drash.
   *
   * @param request - The request object.
   *
   * @returns A Drash response object.
   */
  async function serveStatic(
    request: Drash.Http.Request,
  ): Promise<Drash.Http.Response> {
    const response = new Drash.Http.Response(request);

    const url = request.url_path;

    response.headers.set("Content-Type", getMimeType(url) || "text/plain");

    const urlAsArray = url.split("/");
    // Take off the 0th element which is an empty string
    urlAsArray.shift();

    // The file being requested is the last item in the URL array
    const file = urlAsArray.pop();

    const virtualPath = urlAsArray[0];
    const physicalPath = options.static_paths[virtualPath];
    const filepath = `${options.root_directory}/${physicalPath}/${file}`;

    response.body = await Deno.readFile(filepath);

    return response;
  }

  return serveStatic;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MAKRER - FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Get a MIME type for a file based on its extension.
 *
 * @param file - The filename in question. This can be a filename, file URL,
 * or file path.
 *
 * @returns The MIME type or null if the file's extension cannot be matched
 * with any extension in the MIME database.
 * .
 */
function getMimeType(file: string): null | string {
  let mimeType = null;

  let fileExtension: string | string[] | undefined = file.split(".");

  if (fileExtension.length > 0) {
    fileExtension = fileExtension.pop();
  }

  for (let key in mimeDb) {
    if (!mimeType) {
      const extensions = mimeDb[key].extensions;
      if (extensions) {
        extensions.forEach((extension: string) => {
          if (fileExtension == extension) {
            mimeType = key;
          }
        });
      }
    }
  }

  return mimeType;
}
