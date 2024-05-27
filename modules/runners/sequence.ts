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
   * @param pointer The current handler index.
   * @param args The arguments to pass to the handlers.
   */
  exec(
    pointer: number = 0,
    ...args: Parameters<N["handler"]>
  ): void | Promise<void> {
    const profile = this.handlers[pointer];
    if (!profile) return;

    const result = new SingleRunner<N>(profile).exec(
      ...args,
    );

    /**
     * Wait for the handler to finish before moving to the next handler.
     */
    if (profile.options?.async) {
      return Promise.resolve(result).then(() =>
        this.exec(pointer + 1, ...args)
      );
    }
    return this.exec(pointer + 1, ...args);
  }
}
