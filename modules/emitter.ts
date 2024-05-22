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
        detach: options?.detach || false,
        signal: options?.signal || new AbortController(),
      },
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
        detach: options?.detach || false,
        signal: options?.signal || null,
        lead: true,
      },
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
        detach: options?.detach || false,
        signal: options?.signal || null,
        last: true,
      },
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
        detach: options?.detach || false,
        signal: options?.signal || null,
        async: true,
      },
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
        detach: options?.detach || false,
        signal: options?.signal || null,
        async: true,
        lead: true,
      },
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
        detach: options?.detach || false,
        signal: options?.signal || null,
        async: true,
        last: true,
      },
    };
    this.onBySignature(event, signature);
  }

  emit(event: EventName, ...args: any[]): void {
    const handlers = (this.handlers.get(event)?.slice() || []).map((p) => ({
      ...p,
      ctx: { running: false },
    }));
    const profile = new ContextProfile(event, args, handlers);
    this.executor.emit(profile);
    this.flush();
  }

  flush(): void {
    if (!this.options?.manuallyFlush) {
      this.delayExec(() => this.executor.exec());
    }
  }

  off(event: EventName, handler?: EventHandler): void {
    if (handler) {
      return this.offByHandler(event, handler);
    }
    return this.offByEvent(event);
  }
}
