import type {
  EventHandler,
  EventHandlerSignature,
  EventName,
  RegisteredHandlers,
  XCoreEmitter,
} from "./types.ts";
import type { ContextProfile } from "./context_profile.ts";

import { ContextExecutor } from "./context_executor.ts";

export abstract class CoreEmitter<T> implements XCoreEmitter<T> {
  protected handlers: RegisteredHandlers;
  protected executor: ContextExecutor<T, any>;

  constructor(map?: RegisteredHandlers, queue?: ContextProfile<any>[]) {
    this.handlers = map || new Map();
    this.executor = new ContextExecutor(this.off, queue);
  }

  eventNames(): EventName[] {
    return Array.from(this.handlers.keys()).flat();
  }

  abstract emit(event: EventName, ...args: any[]): void;

  protected onBySignature(
    name: EventName,
    signature: EventHandlerSignature<any>,
  ): void {
    if (
      signature.options.async &&
      // @ts-ignore TS7053
      ((signature.handler[Symbol.toStringTag] !== "AsyncFunction") &&
        !("then" in signature.handler))
    ) {
      throw new Error("Async handler must be a promise or thenable");
    }
    if (
      signature.options.last && !signature.options.signal
    ) {
      throw new Error("Last handler must have an abort signal");
    }

    const handlers = this.handlers.get(name);
    if (handlers) {
      handlers.push(signature);
    } else {
      this.handlers.set(name, [signature]);
    }
  }

  delayExec(callback: (...args: any[]) => void): void {
    // @ts-ignore TS2304
    if (typeof requestAnimationFrame !== "undefined") {
      // @ts-ignore TS2304
      requestAnimationFrame(callback);
    } else {
      setTimeout(callback, 0);
    }
  }

  protected offByEvent(event: EventName): void {
    this.handlers.delete(event);
  }

  protected offByHandler(event: EventName, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    const idx = handlers.findIndex((h) => h.handler === handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  abstract off(
    event: T,
    handler?: EventHandler,
  ): void;

  get removeEventListener() {
    return this.off;
  }
}
