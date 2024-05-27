import type { GeneralEventHandlerSignature } from "modules/types.ts";

import { SingleRunner } from "modules/runners/single.ts";

/**
 * Run handlers in sequence.
 */
export class SequenceRunner<
  N extends GeneralEventHandlerSignature<any> = GeneralEventHandlerSignature<
    any
  >,
> {
  /**
   * Create a new instance of the SequenceRunner.
   * @param handlers The handlers to run.
   */
  constructor(private handlers: N[]) {
    this.handlers = handlers;
  }

  /**
   * Execute the handlers in sequence.
   * @param args The arguments to pass to the handlers.
   * @param index The current handler index.
   */
  exec(
    args: Parameters<N["handler"]>,
    index: number = 0,
  ): void | Promise<void> {
    const profile = this.handlers[index];
    if (!profile) return;

    const result = new SingleRunner<N>(profile).exec(args) as any;

    /**
     * Wait for the handler to finish before moving to the next handler.
     */
    if (profile.options?.async || result instanceof Promise) {
      return Promise.resolve(result).then(() => this.exec(args, index + 1));
    }
    return this.exec(args, index + 1);
  }
}
