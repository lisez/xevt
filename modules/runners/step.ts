import type {
  DualEventHandlerSignature,
  EventHandlerSignature,
  EventName,
  GeneralEventHandlerSignature,
  RegisteredHandlers,
} from "modules/types.ts";

import { DualRunner } from "modules/runners/dual.ts";
import { SingleRunner } from "modules/runners/single.ts";
import { SequenceRunner } from "modules/runners/sequence.ts";
import * as helpers from "modules/helpers.ts";

/**
 * Run handlers step by step.
 */
export class StepRunner {
  /**
   * Create a new instance of the StepRunner.
   * @param handlers The all handlers.
   */
  constructor(private handlers: RegisteredHandlers) {
    this.handlers = handlers;
  }

  /**
   * Remove a handler.
   * @param key The event name.
   * @param profile The handler profile.
   */
  private remove(key: EventName, profile: EventHandlerSignature<any>): void {
    const handlers = this.handlers.get(key);
    if (!handlers) return;
    const idx = handlers.findIndex((h) => h.handler === profile.handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  /**
   * Execute the handlers step by step by index.
   */
  private execByIndex(
    handlers: GeneralEventHandlerSignature<any>[] = [],
    duals: DualEventHandlerSignature<any>[] = [],
    args: any[] = [],
    idx = 0,
  ): void | Promise<void> {
    const handler = handlers[idx];
    if (!handler) return;

    const result = new SingleRunner(handler).exec(...args);

    const next = (result: any) => {
      const dualResult = new DualRunner(duals).exec(!!result);
      if (dualResult instanceof Promise) {
        return dualResult.then(() =>
          this.execByIndex(handlers, duals, args, idx + 1)
        );
      }
    };

    if (handler.options?.async) {
      return Promise.resolve(result).then(() => next(result));
    }
    return next(result);
  }

  /**
   * Execute the handlers in sequence.
   */
  private execInSequence(
    step: EventName,
    handlers: GeneralEventHandlerSignature<any>[],
    args: any[],
  ) {
    for (const p of handlers.filter((e) => !!e.options?.once)) {
      this.remove(step, p);
    }
    return new SequenceRunner(handlers as GeneralEventHandlerSignature<any>[])
      .exec(0, ...args);
  }

  /**
   * Execute the handlers step by step.
   */
  private execByStep(
    step: EventName,
    handlers: EventHandlerSignature<any>[],
    args: any[],
  ) {
    const categories = handlers.reduce((y, x) => {
      if (x.options?.once) {
        y.once.push(x);
      }
      if (helpers.isDualHandler(x)) {
        y.duals.push(x);
      } else {
        y.handlers.push(x);
      }
      return y;
    }, {
      handlers: [] as GeneralEventHandlerSignature<any>[],
      duals: [] as DualEventHandlerSignature<any>[],
      once: [] as EventHandlerSignature<any>[],
    });
    if (!categories.handlers.length) return;

    for (const p of categories.once) {
      this.remove(step, p);
    }

    return this.execByIndex(categories.handlers, categories.duals, args, 0);
  }

  /**
   * Execute the handlers by step.
   * @param step The event name.
   * @param args The arguments to pass to the handlers.
   */
  exec(step: EventName, ...args: any[]): void | Promise<void> {
    const handlers = this.handlers.get(step)?.slice() || [];
    if (!handlers.length) return;

    const hasDual = handlers.some(helpers.isDualHandler);
    if (!hasDual) {
      return this.execInSequence(
        step,
        handlers as GeneralEventHandlerSignature<any>[],
        args,
      );
    }
    return this.execByStep(
      step,
      handlers as EventHandlerSignature<any>[],
      args,
    );
  }
}
