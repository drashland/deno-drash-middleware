import { Drash } from "../deps.ts";
import { mediaTypes } from "./media_types.ts";

/**
 * The available options for the ServeStatic middleware.
 *
 * root_directory
 *     The project's root directory.
 *
 * paths
 *     The key-value object of static paths. For example,
 *
 *     {
 *       "/assets": "/path/to/project/public/assets"
 *     }
 *
 *     The key is the URI and the value is the physical path the URI maps to.
 */
export interface IOptions {
  root_directory: string;
  paths: { [key: string]: string };
}

////////////////////////////////////////////////////////////////////////////////
// FILE MAKRER - SERVE STATIC //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Serve static and/or virtual paths.
 *
 * @param options - See IOptions for more information.
 */
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

    response.headers.set("Content-Type", getMimeType(url));

    const urlAsArray = url.split("/");

    // Take off the 0th element which is an empty string
    urlAsArray.shift();

    // The file being requested is the last item in the URL array
    const file = urlAsArray.pop();

    const virtualPath = urlAsArray[0];
    const physicalPath = options.paths[virtualPath];
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

  // The file extension is the last item in the array
  if (fileExtension.length > 0) {
    fileExtension = fileExtension.pop();
  }

  // See if we can match the file extension to an extension in mime-db's
  // database
  for (let key in mediaTypes) {
    if (!mimeType) {
      const extensions = mediaTypes[key].extensions;
      if (extensions) {
        extensions.forEach((extension: string) => {
          if (fileExtension == extension) {
            mimeType = key;
          }
        });
      }
    }
  }

  // If we could not match the extension, then we serve text/plain by default
  return mimeType ?? "text/plain";
}
