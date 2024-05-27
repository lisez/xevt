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
import { SeriesRunner } from "modules/runners/series.ts";
import { ConjoinQueue } from "modules/conjoin_queue.ts";

export class ConjoinEmitter extends CoreEmitter<ConjoinEvents>
  implements XConjoinEmitter {
  private nameIndex: Map<EventName, number> = new Map();
  private conjoinedNames: Map<EventName, ConjoinEvents> = new Map();
  private indexCounter = 0;
  private waitingQueue = new ConjoinQueue();
  private idleQueue = new ConjoinQueue();
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
      this.idleQueue.enqueue({
        event: name,
        conjoined: signature.name.slice(),
      });
    }

    return this.onBySignature(name, signature);
  }

  private getConjoinedEventName(
    events: EventName[] | ConjoinEvents,
  ): EventName {
    const keys = ([] as EventName[]).concat(events).map((e) =>
      this.nameIndex.get(e)
    );
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

  error(handler: ErrorHandler) {
    this.errorEmitter.on("error", handler);
  }

  private exec(events: EventName[]): any {
    try {
      return new SeriesRunner(this.handlers).exec(events);
    } catch (e) {
      this.errorEmitter.emit("error", e);
    }
  }

  private consume(event: EventName): EventName[] {
    let executing: EventName[] = [];
    let nextIdle: PendingConjoinEvent[] = [];

    for (const queue of [this.waitingQueue, this.idleQueue]) {
      const { fulfill, idle } = queue.consume(event);
      executing = executing.concat(fulfill);
      nextIdle = nextIdle.concat(idle);
    }

    this.idleQueue = new ConjoinQueue(nextIdle);
    this.waitingQueue = new ConjoinQueue(
      executing.map((e) => ({
        event: e,
        conjoined: this.conjoinedNames.get(e)?.slice() || [],
      })),
    );

    return executing;
  }

  emit(event: EventName): any {
    if (this.debug) this.logger.debug("emit", event);
    if (!this.hasEvent(event)) return;

    const executing = this.consume(event);
    if (executing.length) {
      if (this.debug) this.logger.debug("conjoined", executing);
      if (this.prevEvents) {
        this.prevEvents = this.prevEvents.then(() => this.exec(executing));
      } else {
        this.prevEvents = this.exec(executing);
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
