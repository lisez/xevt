import type {
  ErrorHandler,
  EventHandler,
  EventName,
  EventOptions,
  XevtEmitter,
} from "./types.ts";

import { CoreEmitter } from "modules/core_emitter.ts";
import { SequenceRunner } from "modules/runners/sequence.ts";

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

  onAsync(
    event: EventName,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || false,
        async: true,
      },
    };
    return this.onBySignature(event, signature);
  }

  error(handler: ErrorHandler) {
    this.on("error", handler);
  }

  emit(event: EventName, ...args: any[]): any {
    if (this.debug) this.logger.debug("emit", event, args);

    const handlers = this.handlers.get(event)?.slice() || [];
    handlers
      .filter((e) => e.options?.once)
      .forEach((e) => {
        this.offByHandler(event, e.handler);
      });

    try {
      if (this.prevEvents) {
        this.prevEvents = this.prevEvents.then(() =>
          new SequenceRunner(handlers).exec(0, ...args)
        );
      } else {
        this.prevEvents = new SequenceRunner(handlers).exec(0, ...args);
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
