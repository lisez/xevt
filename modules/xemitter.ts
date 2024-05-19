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
import { ContextExecutor } from "modules/context_executor.ts";

export type XeventName = EventName | ConjoinEvents;

export class Xemitter extends CoreEmitter<XeventName>
  implements XevtEmitter, XConjoinEmitter {
  private emitter: Emitter;
  private conjoinEmitter: ConjoinEmitter;

  constructor(map?: RegisteredHandlers, queue: ContextProfile<any>[] = []) {
    const options = { manuallyFlush: true };
    const executor = new ContextExecutor<any>(queue);
    super(map, executor, options);

    this.emitter = new Emitter(this.handlers, executor, options);
    this.conjoinEmitter = new ConjoinEmitter(
      this.handlers,
      executor,
      options,
    );

    this.executor.unregister = this.off.bind(this);
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
    return this.emitter.lead.bind(this.emitter);
  }

  get last() {
    return this.emitter.last.bind(this.emitter);
  }

  get leadAsync() {
    return this.emitter.leadAsync.bind(this.emitter);
  }

  get lastAsync() {
    return this.emitter.lastAsync.bind(this.emitter);
  }

  get onAsync() {
    return this.emitter.onAsync.bind(this.emitter);
  }

  get conjoin() {
    return this.conjoinEmitter.conjoin.bind(this.conjoinEmitter);
  }

  get conjoinFirst() {
    return this.conjoinEmitter.conjoinFirst.bind(this.conjoinEmitter);
  }

  get conjoinLast() {
    return this.conjoinEmitter.conjoinLast.bind(this.conjoinEmitter);
  }

  get conjoinAsync() {
    return this.conjoinEmitter.conjoinAsync.bind(this.conjoinEmitter);
  }

  get conjoinFirstAsync() {
    return this.conjoinEmitter.conjoinFirstAsync.bind(this.conjoinEmitter);
  }

  get conjoinLastAsync() {
    return this.conjoinEmitter.conjoinLastAsync.bind(this.conjoinEmitter);
  }

  emit(event: EventName, ...args: any[]): void {
    this.emitter.emit(event, ...args);
    this.flush();
    this.conjoinEmitter.emit(event);
    this.flush();
  }

  flush(): void {
    this.delayExec(() => this.executor.exec());
  }

  off(event: XeventName, handler?: EventHandler): void {
    if (isConjoinEvents(event)) {
      this.conjoinEmitter.off(event, handler);
    } else {
      this.emitter.off(event, handler);
    }
  }
}
