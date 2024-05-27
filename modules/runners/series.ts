import type {
  EventHandlerSignature,
  EventName,
  RegisteredHandlers,
} from "modules/types.ts";

import { SequenceRunner } from "modules/runners/sequence.ts";

/**
 * Run handlers each in series.
 */
export class SeriesRunner {
  /**
   * Create a new instance of the SeriesRunner.
   * @param handlers The handlers with series name to run.
   */
  constructor(private handlers: RegisteredHandlers) {
    this.handlers = handlers;
  }

  /**
   * Remove a handler.
   * @param key The event name.
   * @param profile The handler profile.
   */
  private remove(key: EventName, profile: EventHandlerSignature<any>): void {
    const handlers = this.handlers.get(key);
    if (!handlers) return;
    const idx = handlers.findIndex((h) => h.handler === profile.handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  /**
   * Execute the handlers in series.
   * @param series The series of event names.
   * @param idx The current event index.
   */
  exec(series: EventName[], idx = 0): void | Promise<void> {
    const key = series[idx];
    if (!key) return;

    const handlers = this.handlers.get(key)?.slice() || [];
    for (const p of handlers.filter((p) => !!p.options?.once)) {
      this.remove(key, p);
    }
    if (!handlers.length) return;

    const result = new SequenceRunner(handlers).exec(0);
    if (result) {
      return result.then(() => this.exec(series, idx + 1));
    }
    return this.exec(series, idx + 1);
  }
}
