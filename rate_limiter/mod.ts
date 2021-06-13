import { Drash } from "../deps.ts";

export interface Configs {
  /* How long (in milliseconds) an IP is allocated the `maxRequest`s */
  timeframe: number;
  /* Number of requests an IP is allowed within the `timeframe` */
  maxRequests: number;
}

class MemoryStore {
  private hits: Record<string, number> = {};
  private resetTime: Date;

  constructor(timeframe: number) {
    this.resetTime = this.calculateNextResetTime(timeframe);
  }

  private calculateNextResetTime(timeframe: number): Date {
    const d = new Date();
    d.setMilliseconds(d.getMilliseconds() + timeframe);
    return d;
  }

  public increment(key: string): {
    current: number;
    resetTime: Date;
  } {
    if (this.hits[key]) {
      this.hits[key]++;
    } else {
      this.hits[key] = 1;
    }
    return {
      current: this.hits[key],
      resetTime: this.resetTime,
    };
  }
}

/**
 * A middleware to help secure you applications, inspired by https://github.com/nfriedly/express-rate-limit.
 *
 * @param configs - See Configs
 */
export function RateLimit(
  configs: Configs,
): (request: Drash.Http.Request, response?: Drash.Http.Response) => void {
  const { timeframe, maxRequests } = configs;
  const memoryStore = new MemoryStore(timeframe);

  function rateLimit(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ) {
    if (response) {
      const originalRequest = Reflect.get(request, "original_request");
      const key = originalRequest.conn.remoteAddr;
      const { current, resetTime } = memoryStore.increment(key);
      const requestsRemaining = Math.max(maxRequests - current, 0);

      response.headers.set("X-RateLimit-Limit", maxRequests.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        requestsRemaining.toString(),
      );
      response.headers.set("Date", new Date().toUTCString());
      response.headers.set(
        "X-RateLimit-Reset",
        Math.ceil(resetTime.getTime() / 1000).toString(),
      );

      if (maxRequests && current > maxRequests) {
        response.headers.set(
          "Retry-After",
          Math.ceil(timeframe / 1000).toString(),
        );
      }
    }
  }

  return rateLimit;
}
