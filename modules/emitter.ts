import type {
  EventHandler,
  EventName,
  EventOptions,
  XevtEmitter,
} from "./types.ts";

import { CoreEmitter } from "./core_emitter.ts";
import { ContextProfile } from "./context_profile.ts";

export class Emitter extends CoreEmitter<EventName> implements XevtEmitter {
  on(event: EventName, handler: EventHandler, options?: Partial<EventOptions>) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || false,
        signal: options?.signal || new AbortController(),
      },
      ctx: { running: false },
    };
    this.onBySignature(event, signature);
  }

  get addEventListener() {
    return this.on;
  }

  lead(
    event: EventName,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || false,
        signal: options?.signal || null,
        lead: true,
      },
      ctx: { running: false },
    };
    this.onBySignature(event, signature);
  }

  last(
    event: EventName,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || false,
        signal: options?.signal || null,
        last: true,
      },
      ctx: { running: false },
    };
    this.onBySignature(event, signature);
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
        signal: options?.signal || null,
        async: true,
      },
      ctx: { running: false },
    };
    this.onBySignature(event, signature);
  }

  leadAsync(
    event: EventName,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || false,
        signal: options?.signal || null,
        async: true,
        lead: true,
      },
      ctx: { running: false },
    };
    this.onBySignature(event, signature);
  }

  lastAsync(
    event: EventName,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: event,
      handler,
      options: {
        once: options?.once || false,
        signal: options?.signal || null,
        async: true,
        last: true,
      },
      ctx: { running: false },
    };
    this.onBySignature(event, signature);
  }

  emit(event: EventName, ...args: any[]): void {
    const handlers = this.handlers.get(event) || [];
    const profile = new ContextProfile(event, args, handlers);
    this.executor.emit(profile);
    this.delayExec(() => this.flush());
  }

  flush(): void {
    this.executor.exec();
  }

  off(event: EventName, handler?: EventHandler): void {
    if (handler) {
      return this.offByHandler(event, handler);
    }
    return this.offByEvent(event);
  }
}
