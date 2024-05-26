import type {
  ConjoinEvents,
  ErrorHandler,
  EventHandler,
  EventHandlerSignature,
  EventName,
  EventOptions,
  PendingConjoinEvent,
  XConjoinEmitter,
} from "modules/types.ts";

import { CoreEmitter } from "modules/core_emitter.ts";
import { Emitter } from "modules/emitter.ts";
import { SequenceRunner } from "modules/runners/sequence.ts";

export class ConjoinEmitter extends CoreEmitter<ConjoinEvents>
  implements XConjoinEmitter {
  private nameIndex: Map<EventName, number> = new Map();
  private conjoinedNames: Map<EventName, ConjoinEvents> = new Map();
  private indexCounter = 0;
  private waitingQueue: PendingConjoinEvent[] = [];
  private idleQueue: PendingConjoinEvent[] = [];
  private errorEmitter = new Emitter();
  private prevEvents?: Promise<any>;
  debug = false;

  hasEvent(event: EventName): boolean {
    return this.nameIndex.has(event);
  }

  private internalConjoinOn(signature: EventHandlerSignature<ConjoinEvents>) {
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

    return this.onBySignature(name, signature);
  }

  getConjoinedEventName(events: EventName[] | ConjoinEvents): EventName {
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
      },
    };
    return this.internalConjoinOn(signature);
  }

  get on() {
    return this.conjoin;
  }

  get addEventListener() {
    return this.conjoin;
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
        async: true,
      },
    };
    return this.internalConjoinOn(signature);
  }

  error(handler: ErrorHandler) {
    this.errorEmitter.on("error", handler);
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

  private exec(pointer: number, events: EventName[]): any {
    const event = events[pointer];
    if (!event) return;

    const handlers = this.handlers.get(event)?.slice() || [];
    for (const e of handlers.filter((e) => e.options?.once)) {
      this.offByHandler(event, e.handler);
    }

    try {
      if (handlers.length) {
        const result = new SequenceRunner(handlers).exec(0);
        if (result) {
          return result.then(() => this.exec(pointer + 1, events));
        }
        return this.exec(pointer + 1, events);
      }
    } catch (e) {
      this.errorEmitter.emit("error", e);
    }
  }

  emit(event: EventName): any {
    if (this.debug) this.logger.debug("emit", event);
    if (!this.hasEvent(event)) return;

    let executing: EventName[] = [];
    let nextIdle: PendingConjoinEvent[] = [];

    for (const queue of [this.waitingQueue, this.idleQueue]) {
      const { fulfill, idle } = this.scan(event, queue);
      executing = executing.concat(fulfill);
      nextIdle = nextIdle.concat(idle);
    }

    this.idleQueue = nextIdle;
    this.waitingQueue = executing.map((e) => ({
      event: e,
      conjoined: this.conjoinedNames.get(e)?.slice() || [],
    }));

    if (executing.length) {
      if (this.debug) this.logger.debug("conjoined", executing);
      if (this.prevEvents) {
        this.prevEvents = this.prevEvents.then(() => this.exec(0, executing));
      } else {
        this.prevEvents = this.exec(0, executing);
      }
    }
    return this.prevEvents;
  }

  off(event: ConjoinEvents, handler?: EventHandler): void {
    const key = this.getConjoinedEventName(event);
    if (handler) {
      return this.offByHandler(key, handler);
    }
    return this.offByEvent(key);
  }
}
