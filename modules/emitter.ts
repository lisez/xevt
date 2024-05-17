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
        async: false,
        lead: false,
        last: false,
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
        async: false,
        lead: true,
        last: false,
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
        async: false,
        lead: false,
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
        lead: false,
        last: false,
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
        last: false,
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
        lead: false,
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
    this.executor.exec();
  }

  off(event: EventName, handler?: EventHandler): void {
    if (handler) {
      return this.offByHandler(event, handler);
    }
    return this.offByEvent(event);
  }
}
