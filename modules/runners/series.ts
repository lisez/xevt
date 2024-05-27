import type { EventName, RegisteredHandlers } from "modules/types.ts";

import { StepRunner } from "modules/runners/step.ts";

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
   * Execute the handlers in series.
   * @param series The series of event names.
   * @param idx The current event index.
   */
  exec(series: EventName[], idx = 0): void | Promise<void> {
    const key = series[idx];
    if (!key) return;

    const step = new StepRunner(this.handlers).exec(key);
    if (step instanceof Promise) {
      return Promise.resolve(step).then(() => this.exec(series, idx + 1));
    }
    return this.exec(series, idx + 1);
  }
}
