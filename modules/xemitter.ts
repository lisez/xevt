import type {
  ConjoinEvents,
  EventHandler,
  EventName,
  EventOptions,
  RegisteredHandlers,
  XConjoinEmitter,
  XevtEmitter,
} from "./types.ts";

import { CoreEmitter } from "./core_emitter.ts";
import { isConjoinEvents } from "./helpers.ts";
import { ConjoinEmitter } from "./conjoin_emitter.ts";
import { Emitter } from "./emitter.ts";
import { ContextProfile } from "./context_profile.ts";

export type XeventName = EventName | ConjoinEvents;

export class Xemitter extends CoreEmitter<XeventName>
  implements XevtEmitter, XConjoinEmitter {
  private emitter: Emitter;
  private conjoinEmitter: ConjoinEmitter;

  constructor(map?: RegisteredHandlers, queue: ContextProfile<any>[] = []) {
    super(map, queue);

    this.emitter = new Emitter(this.handlers, queue);
    this.conjoinEmitter = new ConjoinEmitter(this.handlers, queue);
  }

  on(
    event: XeventName,
    handler: EventHandler,
    options?: Partial<EventOptions>,
  ) {
    if (isConjoinEvents(event)) {
      this.conjoinEmitter.on(event, handler, options);
    } else {
      this.emitter.on(event, handler, options);
    }
  }

  get addEventListener() {
    return this.on;
  }

  get lead() {
    return this.emitter.lead;
  }

  get last() {
    return this.emitter.last;
  }

  get leadAsync() {
    return this.emitter.leadAsync;
  }

  get lastAsync() {
    return this.emitter.lastAsync;
  }

  get onAsync() {
    return this.emitter.onAsync;
  }

  get conjoin() {
    return this.removeEventListener;
  }

  get conjoinFirst() {
    return this.conjoinEmitter.conjoinFirst;
  }

  get conjoinLast() {
    return this.conjoinEmitter.conjoinLast;
  }

  get conjoinAsync() {
    return this.conjoinEmitter.conjoinAsync;
  }

  get conjoinFirstAsync() {
    return this.conjoinEmitter.conjoinFirstAsync;
  }

  get conjoinLastAsync() {
    return this.conjoinEmitter.conjoinLastAsync;
  }

  emit(event: EventName, ...args: any[]): void {
    this.emitter.emit(event, ...args);
    this.delayExec(() => this.executor.exec());
    this.delayExec(() => this.conjoinEmitter.emit(event));
    this.delayExec(() => this.executor.exec());
  }

  flush(): void {
    // INFO: use custom emit order in xemitter.
  }

  off(event: XeventName, handler?: EventHandler): void {
    if (isConjoinEvents(event)) {
      this.conjoinEmitter.off(event, handler);
    } else {
      this.emitter.off(event, handler);
    }
  }
}
