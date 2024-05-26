import type {
  ErrorHandler,
  EventHandler,
  EventHandlerSignature,
  EventName,
  EventUnscriber,
  RegisteredHandlers,
  XCoreEmitter,
} from "modules/types.ts";

import { Logger } from "modules/logger.ts";

export abstract class CoreEmitter<T> implements XCoreEmitter<T> {
  protected handlers: RegisteredHandlers;
  abstract debug: boolean;

  logger = new Logger();

  constructor(handlers?: RegisteredHandlers) {
    this.handlers = handlers || new Map();
  }

  eventNames(): EventName[] {
    return Array.from(this.handlers.keys()).flat();
  }

  hasEvent(event: EventName): boolean {
    return !!this.handlers.has(event);
  }

  abstract emit(event: EventName, ...args: any[]): void;

  protected onBySignature(
    name: EventName,
    signature: EventHandlerSignature<any>,
  ): EventUnscriber {
    if (
      signature.options?.async &&
      // @ts-ignore TS7053
      signature.handler[Symbol.toStringTag] !== "AsyncFunction" &&
      !("then" in signature.handler)
    ) {
      throw new Error("Async handler must be a promise or thenable");
    }

    if (this.debug) this.logger.debug("on", name, signature);

    const handlers = this.handlers.get(name);
    if (handlers) {
      handlers.push(signature);
    } else {
      this.handlers.set(name, [signature]);
    }

    return () => this.offByHandler(name, signature.handler);
  }

  abstract error(handler: ErrorHandler): void;

  protected offByEvent(event: EventName): void {
    this.handlers.delete(event);
  }

  protected offByHandler(event: EventName, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (!handlers?.length) return;
    const idx = handlers.findIndex((h) => h.handler === handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  abstract off(event: T, handler?: EventHandler): void;

  get removeEventListener() {
    return this.off;
  }
}
