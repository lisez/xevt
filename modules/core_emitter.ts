import type {
  EventHandler,
  EventHandlerSignature,
  EventName,
  RegisteredHandlers,
  XCoreEmitter,
} from "./types.ts";
import type { ContextProfile } from "./context_profile.ts";

import { ContextExecutor } from "./context_executor.ts";
import * as helpers from "./helpers.ts";

export type CoreEmitterOptions = {
  manuallyFlush: boolean;
  sharedQueue: ContextProfile<any>[];
};

export abstract class CoreEmitter<T> implements XCoreEmitter<T> {
  protected handlers: RegisteredHandlers;
  protected executor: ContextExecutor<T, any>;

  constructor(
    handlers?: RegisteredHandlers,
    executor?: ContextExecutor<T, any>,
    protected options?: Partial<CoreEmitterOptions>,
  ) {
    this.options = options || { manuallyFlush: false };
    this.handlers = handlers || new Map();
    this.executor = executor ||
      new ContextExecutor(this.options?.sharedQueue || []);

    this.executor.unregister ??= this.off.bind(this);
  }

  delay: number = 4;

  eventNames(): EventName[] {
    return Array.from(this.handlers.keys()).flat();
  }

  abstract emit(event: EventName, ...args: any[]): void;

  protected onBySignature(
    name: EventName,
    signature: Omit<EventHandlerSignature<any>, "ctx">,
  ): void {
    if (
      signature.options?.async &&
      // @ts-ignore TS7053
      ((signature.handler[Symbol.toStringTag] !== "AsyncFunction") &&
        !("then" in signature.handler))
    ) {
      throw new Error("Async handler must be a promise or thenable");
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
    if (this.delay === 0 && typeof requestAnimationFrame == "function") {
      // @ts-ignore TS2304
      requestAnimationFrame(callback);
    } else {
      const timer = setTimeout(() => callback(), this.delay);
      if (timer) helpers.prexitClear(timer);
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

  abstract flush(): void;
}
