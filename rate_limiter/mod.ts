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
  private timeframe: number

  /**
   * @param timeframe - Reset time/duration
   */
  constructor(timeframe: number) {
    this.resetTime = this.calculateNextResetTime(timeframe);
    this.timeframe = timeframe
    this.queueReset()
  }

  /**
   * Create the next reset time given the `timeframe`
   * 
   * @param timeframe Essentially, current time + timeframe
   * 
   * @returns The new reset time 
   */
  private calculateNextResetTime(timeframe: number): Date {
    const d = new Date();
    d.setMilliseconds(d.getMilliseconds() + timeframe);
    return d;
  }

  /**
   * Increase the number of hits given the ip
   * 
   * @param key - The IP of the request
   * 
   * @returns The current amount of requests recieved for `key` (`hits`) and
   * the reset time
   */
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

  /**
   * Start an interval to reset the hits and reset time based on the timeframr
   */
  private queueReset() {
    setInterval(() => {
      this.hits = {}
      this.resetTime = this.calculateNextResetTime(this.timeframe)
    }, this.timeframe)
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
        response.status_code = 429
        response.body = "Too many requests, please try again later."
        return true
      }
    }
  }

  return rateLimit;
}
