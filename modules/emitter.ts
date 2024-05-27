import type {
  DualEventHandler,
  DualEventHandlerSignature,
  ErrorHandler,
  EventHandler,
  EventName,
  EventOptions,
  GeneralEventHandlerSignature,
  XevtEmitter,
} from "modules/types.ts";

import { CoreEmitter } from "modules/core_emitter.ts";
import { StepRunner } from "modules/runners/step.ts";
import * as helpers from "modules/helpers.ts";

export const EmitDone = Symbol("emit_done");

export class Emitter extends CoreEmitter<EventName> implements XevtEmitter {
  private prevEvents?: Promise<void> | void;
  debug = false;

  on(
    event: EventName,
    handler: EventHandler | DualEventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || event === EmitDone,
        dual: helpers.isDualHandler(handler),
      },
    } as DualEventHandlerSignature<any> | GeneralEventHandlerSignature<any>;
    return this.onBySignature(event, signature);
  }

  get addEventListener() {
    return this.on;
  }

  error(handler: ErrorHandler) {
    this.on("error", handler);
  }

  emit(event: EventName, ...args: any[]): any {
    if (this.debug) this.logger.debug("emit", event, args);

    try {
      if (this.prevEvents instanceof Promise) {
        this.prevEvents = this.prevEvents.then(() =>
          this.prevEvents = new StepRunner(this.handlers).exec(event, args)
        );
      } else {
        this.prevEvents = new StepRunner(this.handlers).exec(event, args);
      }
      return this.prevEvents;
    } catch (err) {
      this.emit("error", err);
    } finally {
      if (event !== EmitDone) this.emit(EmitDone);
    }
  }

  off(event: EventName, handler?: EventHandler): void {
    if (handler) {
      return this.offByHandler(event, handler);
    }
    return this.offByEvent(event);
  }
}
