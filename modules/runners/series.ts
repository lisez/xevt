import type { EventName, RegisteredHandlers } from "modules/types.ts";

import { StepRunner } from "modules/runners/step.ts";
import { RelayRunner } from "modules/runners/relay.ts";

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
    return new RelayRunner().exec(
      step,
      () => this.exec(series, idx + 1),
    ) as any;
  }
}
