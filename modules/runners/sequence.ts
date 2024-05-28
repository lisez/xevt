import type { GeneralEventHandlerSignature } from "modules/types.ts";

import { SingleRunner } from "modules/runners/single.ts";
import { RelayRunner } from "modules/runners/relay.ts";

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
  ): ReturnType<N["handler"]> | Promise<ReturnType<N["handler"]>> | void {
    const profile = this.handlers[index];
    if (!profile) return;

    const result = new SingleRunner<N>(profile).exec(args) as any;
    return new RelayRunner().exec(
      result,
      () => this.exec(args, index + 1),
      profile.options,
    ) as any;
  }
}
