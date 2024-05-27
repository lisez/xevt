import type { EventHandlerSignature } from "modules/types.ts";

/**
 * The result of a single runner.
 */
export type SingleRunnerResult<T extends (...args: any[]) => any> = ReturnType<
  T
>;

/**
 * Run a handler.
 */
export class SingleRunner<
  T extends EventHandlerSignature<any> = EventHandlerSignature<any>,
> {
  /**
   * Create a new instance of the SingleRunner.
   * @param profile The handler profile.
   */
  constructor(private profile: T) {
    this.profile = profile;
  }

  /**
   * Execute the handler.
   * @param args The arguments to pass to the handler.
   */
  exec(
    ...args: Parameters<T["handler"]>
  ): SingleRunnerResult<T["handler"]> {
    return this.profile.handler(...args);
  }
}
