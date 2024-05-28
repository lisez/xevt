import type { EventHandler } from "modules/types.ts";

/** Options to RelayRunner */
export type RelayRunnerOptions = {
  /**
   * If the prev handler is a promise, it will await for it before executing the next handler.
   * @default false
   */
  async: boolean;
};

/** Handle how to run before and after handler. */
export class RelayRunner {
  /**
   * Execute the handler.
   * @param prev The result of the previous handler.
   * @param next The next handler.
   * @param options The options to run the next handler.
   */
  exec<T extends EventHandler>(
    prev: any,
    next: T,
    options?: Partial<RelayRunnerOptions>,
  ): Promise<ReturnType<T>> | ReturnType<T> {
    if (prev instanceof Promise) {
      return Promise.resolve(prev).then((res) => next(res));
    }
    return next(prev);
  }
}
