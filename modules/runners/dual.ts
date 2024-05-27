import type {
  DualEventHandlerSignature,
  EventHandlerSignature,
  GeneralEventHandlerSignature,
} from "modules/types.ts";

import { SingleRunner } from "modules/runners/single.ts";

/**
 * Run a dual event handler.
 */
export class DualRunner<N = any> {
  /**
   * Create a new instance of the DualRunner.
   * @param profile The dual handler profile.
   */
  constructor(
    private profile: DualEventHandlerSignature<N>,
  ) {
    this.profile = profile;
  }

  /**
   * Execute the dual handler that corresponds to the result.
   * @param result The result of the handler.
   */
  private dualExec(result: any) {
    if (!!result && "true" in this.profile.handler) {
      return new SingleRunner({
        ...this.profile,
        handler: this.profile.handler.true,
      }).exec(result);
    }
    if (!result && "false" in this.profile.handler) {
      return new SingleRunner({
        ...this.profile,
        handler: this.profile.handler.false,
      }).exec(result);
    }
    return;
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
