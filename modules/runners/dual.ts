import type {
  DualEventHandlerSignature,
  GeneralEventHandlerSignature,
} from "modules/types.ts";

import { SequenceRunner } from "modules/runners/sequence.ts";

/**
 * Run a dual event handler.
 */
export class DualRunner<N = any> {
  /**
   * Create a new instance of the DualRunner.
   * @param handlers The dual handler profile.
   */
  constructor(
    private handlers: DualEventHandlerSignature<N>[],
  ) {
    this.handlers = handlers;
  }

  /**
   * Conditionally filter the handlers.
   * @param condition The condition to filter the handlers.
   * @returns The filtered handlers.
   */
  private filterHandlers(
    condition: boolean,
  ): GeneralEventHandlerSignature<N>[] {
    const handlers: GeneralEventHandlerSignature<N>[] = [];
    for (const p of this.handlers) {
      // @ts-ignore TS2538
      if (typeof p.handler[condition] === "function") {
        // @ts-ignore TS2538
        handlers.push({ ...p, handler: p.handler[condition] });
      }
    }
    return handlers;
  }

  /**
   * Execute the dual handler that corresponds to the result.
   * @param result The result of the handler.
   */
  private dualExec(result: any) {
    const handlers = this.filterHandlers(!!result);
    if (!handlers.length) return;
    return new SequenceRunner(handlers).exec([result]);
  }

  /**
   * Execute the dual handler.
   * @param args The arguments to pass to the dual handler.
   */
  exec(result: any) {
    if (result instanceof Promise) {
      return Promise.resolve(result).then((res) => this.dualExec(res));
    }
    return this.dualExec(result);
  }
}
