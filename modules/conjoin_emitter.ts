import type {
  ConjoinEvents,
  EventHandler,
  EventHandlerSignature,
  EventName,
  EventOptions,
  PendingConjoinEvent,
  XConjoinEmitter,
} from "./types.ts";

import { CoreEmitter } from "./core_emitter.ts";
import { ContextProfile } from "./context_profile.ts";

export class ConjoinEmitter extends CoreEmitter<ConjoinEvents>
  implements XConjoinEmitter {
  private nameIndex: Map<EventName, number> = new Map();
  private conjoinedNames: Map<EventName, ConjoinEvents> = new Map();
  private indexCounter = 0;
  private waitingQueue: PendingConjoinEvent[] = [];
  private idleQueue: PendingConjoinEvent[] = [];

  private internalConjoinOn(
    signature: EventHandlerSignature<ConjoinEvents>,
  ) {
    if (signature.name.length < 2) {
      throw new RangeError("Conjoin events must have at least two events");
    }

    for (const e of signature.name) {
      if (!this.nameIndex.has(e)) {
        this.nameIndex.set(e, this.indexCounter++);
      }
    }

    const name = this.getConjoinedEventName(signature.name);
    if (!this.conjoinedNames.has(name)) {
      this.conjoinedNames.set(name, signature.name);
      this.idleQueue.push({ event: name, conjoined: signature.name.slice() });
    }

    this.onBySignature(name, signature);
  }

  private getConjoinedEventName(
    events: EventName[] | ConjoinEvents,
  ): EventName {
    const keys = ([] as EventName[]).concat(events);
    keys.sort();
    return keys.join(".");
  }

  conjoin(
    events: ConjoinEvents,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: events,
      handler,
      options: {
        once: options?.once || false,
        signal: options?.signal || null,
        async: false,
        lead: false,
        last: false,
      },
      ctx: { running: false },
    };
    this.internalConjoinOn(signature);
  }

  get on() {
    return this.conjoin;
  }

  get addEventListener() {
    return this.conjoin;
  }

  conjoinFirst(
    events: ConjoinEvents,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: events,
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
    this.internalConjoinOn(signature);
  }

  conjoinLast(
    events: ConjoinEvents,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: events,
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
    this.internalConjoinOn(signature);
  }

  conjoinAsync(
    events: ConjoinEvents,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: events,
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
    this.internalConjoinOn(signature);
  }

  conjoinFirstAsync(
    events: ConjoinEvents,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: events,
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
    this.internalConjoinOn(signature);
  }

  conjoinLastAsync(
    events: ConjoinEvents,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    const signature = {
      name: events,
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
    this.internalConjoinOn(signature);
  }

  private scan(event: EventName, queue: PendingConjoinEvent[]) {
    const fulfill: EventName[] = [];
    const idle: PendingConjoinEvent[] = [];

    for (const pending of queue) {
      const found = pending.conjoined.indexOf(event);
      if (found === -1) {
        idle.push(pending);
      } else {
        pending.conjoined.splice(found, 1);
        if (pending.conjoined.length === 0) {
          fulfill.push(pending.event);
        } else {
          idle.push(pending);
        }
      }
    }

    return { fulfill, idle };
  }

  emit(event: EventName): void {
    if (!this.nameIndex.has(event)) return;

    let nextWaiting: EventName[] = [];
    let nextIdle: PendingConjoinEvent[] = [];

    for (const queue of [this.waitingQueue, this.idleQueue]) {
      const { fulfill, idle } = this.scan(event, queue);
      for (const f of fulfill) {
        const handlers = this.handlers.get(f) || [];
        const profile = new ContextProfile(f, [], handlers);
        this.executor.emit(profile);
        this.delayExec(() => this.executor.exec());
      }

      nextWaiting = nextWaiting.concat(fulfill);
      nextIdle = nextIdle.concat(idle);
    }

    this.idleQueue = nextIdle;
    this.waitingQueue = nextWaiting.map((e) => ({
      event: e,
      conjoined: this.conjoinedNames.get(e)?.slice() || [],
    }));
  }

  off(
    event: ConjoinEvents,
    handler?: EventHandler,
  ): void {
    const key = this.getConjoinedEventName(event);
    if (handler) {
      return this.offByHandler(key, handler);
    }
    return this.offByEvent(key);
  }
}
