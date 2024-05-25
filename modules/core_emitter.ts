import type {
  ErrorHandler,
  EventHandler,
  EventHandlerSignature,
  EventName,
  RegisteredHandlers,
  XCoreEmitter,
} from "./types.ts";

import { Logger } from "./logger.ts";

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

  abstract emit(event: EventName, ...args: any[]): void;

  protected internalExec(
    pointer: number,
    signatures: EventHandlerSignature<any>[],
    ...args: any[]
  ): any {
    const profile = signatures[pointer];
    if (!profile) return;
    if (profile.options?.async) {
      return profile
        .handler(...args)
        .then(() => this.internalExec(pointer + 1, signatures, ...args));
    }
    profile.handler(...args);
    return this.internalExec(pointer + 1, signatures, ...args);
  }

  protected onBySignature(
    name: EventName,
    signature: EventHandlerSignature<any>,
  ): void {
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
  }

  abstract error(handler: ErrorHandler): void;

  protected offByEvent(event: EventName): void {
    this.handlers.delete(event);
  }

  protected offByHandler(event: EventName, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    const idx = handlers.findIndex((h) => h.handler === handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  abstract off(event: T, handler?: EventHandler): void;

  get removeEventListener() {
    return this.off;
  }
}
