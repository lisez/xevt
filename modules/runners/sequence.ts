import type { EventHandlerSignature } from "modules/types.ts";

/**
 * Run handlers in sequence.
 */
export class SequenceRunner {
  /**
   * Create a new instance of the SequenceRunner.
   * @param handlers The handlers to run.
   */
  constructor(private handlers: EventHandlerSignature<any>[]) {
    this.handlers = handlers;
  }

  /**
   * Wait for the handler to finish before moving to the next handler.
   * @param pointer The current handler index.
   * @param profile The handler profile.
   * @param args The arguments to pass to the handlers.
   */
  private asyncExec(
    pointer: number,
    profile: EventHandlerSignature<any>,
    ...args: any[]
  ): Promise<void> {
    return Promise.resolve(profile.handler(...args)).then(() =>
      this.exec(pointer + 1, ...args)
    );
  }

  /**
   * Execute the handlers in sequence.
   * @param pointer The current handler index.
   * @param args The arguments to pass to the handlers.
   */
  exec(pointer: number = 0, ...args: any[]): void | Promise<void> {
    const profile = this.handlers[pointer];
    if (!profile) return;
    if (profile.options?.async) {
      return this.asyncExec(pointer, profile, ...args);
    }
    profile.handler(...args);
    return this.exec(pointer + 1, ...args);
  }
}
