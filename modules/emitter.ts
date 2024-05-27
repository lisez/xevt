import type {
  ErrorHandler,
  EventHandler,
  EventName,
  EventOptions,
  XevtEmitter,
} from "modules/types.ts";

import { CoreEmitter } from "modules/core_emitter.ts";
import { StepRunner } from "modules/runners/step.ts";

export const EmitDone = Symbol("emit_done");

export class Emitter extends CoreEmitter<EventName> implements XevtEmitter {
  private prevEvents?: Promise<void> | void;
  debug = false;

  on(event: EventName, handler: EventHandler, options?: Partial<EventOptions>) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || event === EmitDone,
      },
    };
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

    const next = () => {
      this.prevEvents = new StepRunner(this.handlers).exec(event, args);
      return this.prevEvents;
    };

    try {
      if (this.prevEvents instanceof Promise) {
        return Promise.resolve(this.prevEvents).then(next);
      }
      return next();
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
