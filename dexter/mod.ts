import { ConsoleLogger, LoggerConfigs } from "./deps.ts";
import { Drash } from "../deps.ts";

/**
 * See
 * https://doc.deno.land/https/deno.land/x/drash/src/interfaces/logger_configs.ts
 * for information on `Drash.Interfaces.LoggerConfigs`.
 *
 * response_time?: boolean
 *
 *     Are response times enabled?
 */
interface IDexterConfigs {
  response_time?: boolean;
  url?: boolean,
  datetime?: boolean,
  method?: boolean
}

/**
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See IDexterConfigs
 * 
 * @example
 * ```ts
 * const dexter = Dexter()
 * const dexter = Dexter({
 *  response_time: true,
 * 
 * })
 * ```
 */
export function Dexter(
  configs?: IDexterConfigs,
) {
  if (!configs) {
    configs = {}
  }
  configs = {
    datetime: configs.datetime || true,
    url: configs.url || false,
    method: configs.method || false,
    response_time: configs.response_time || false
  }

  let timeStart: number;
  let timeEnd: number;

  /**
   * The middleware function that's called by Drash.
   *
   * @param request - The request object.
   * @param response - (optional) The response object.
   */
  function dexter(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ): void {
    const loggerConfigs: LoggerConfigs = {
      tag_string: "",
      tag_string_fns: {}
    }
    // If a user has defined specific strings we allow, ensure they are set before we had it off to unilogger to process into a log statement
    if (configs?.datetime !== false) {
      loggerConfigs.tag_string += "{datetime} |"
      loggerConfigs.tag_string_fns!.datetime = () => new Date().toISOString().replace("T", " ").split(".")[0]
    }
    if (configs?.method) {
      loggerConfigs.tag_string += " {request_method} |"
      loggerConfigs.tag_string_fns!.request_method = () => request.method.toUpperCase()
    }
    if (configs!.url) {
      loggerConfigs.tag_string += " {request_url} |"
      loggerConfigs.tag_string_fns!.request_url = () => request.url
    }

    // Initiate unilogger
    const logger = new ConsoleLogger(loggerConfigs)

    if (!response) {
      timeStart = new Date().getTime();
      logger.info(`Request received.`);
    }

    // If there is a response, then we know this is occurring after the request
    if (response && configs?.response_time) {
      timeEnd = new Date().getTime();
      logger.info("Response sent [" + getTime(timeEnd, timeStart) + "]");
    }
  }

  return dexter;
}

/**
 * Get the time it takes for the middleware to execute the
 * request-resource-response lifecycle in ms.
 *
 * @param end - The time at the point the response was sent.
 * @param start - The time at the point the request was received.
 *
 * @returns The time in ms as a string.
 */
function getTime(end: number, start: number): string {
  return `${end - start} ms`;
}
