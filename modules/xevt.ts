import type {
  ConjoinEvents,
  ErrorHandler,
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
import { EmitDone, Emitter } from "./emitter.ts";

export type XeventName = EventName | ConjoinEvents;

export class Xevt extends CoreEmitter<XeventName>
  implements XevtEmitter, XConjoinEmitter {
  private emitter: Emitter;
  private conjoinEmitter: ConjoinEmitter;

  constructor(map?: RegisteredHandlers) {
    super(map);

    this.emitter = new Emitter(this.handlers);
    this.conjoinEmitter = new ConjoinEmitter(this.handlers);
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

  get onAsync() {
    return this.emitter.onAsync.bind(this.emitter);
  }

  get conjoin() {
    return this.conjoinEmitter.conjoin.bind(this.conjoinEmitter);
  }

  get conjoinAsync() {
    return this.conjoinEmitter.conjoinAsync.bind(this.conjoinEmitter);
  }

  error(handler: ErrorHandler) {
    this.emitter.error(handler);
    this.conjoinEmitter.error(handler);
  }

  emit(event: EventName, ...args: any[]): void {
    this.emitter.on(EmitDone, () => {
      this.conjoinEmitter.emit(event);
    });
    this.emitter.emit(event, ...args);
  }

  off(event: XeventName, handler?: EventHandler): void {
    if (isConjoinEvents(event)) {
      this.conjoinEmitter.off(event, handler);
    } else {
      this.emitter.off(event, handler);
    }
  }
}
