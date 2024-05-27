import type { EventName, PendingConjoinEvent } from "modules/types.ts";

/**
 * A queue for conjoined events.
 */
export class ConjoinQueue {
  /**
   * Create a new instance of the ConjoinQueue.
   * @param queue The pending conjoin events.
   */
  constructor(private queue: PendingConjoinEvent[] = []) {
    this.queue = queue;
  }

  /**
   * Consume the conjoined event.
   * @param event The event name.
   * @returns The fulfilled events and idle events.
   */
  consume(event: EventName) {
    const fulfill: EventName[] = [];
    const idle: PendingConjoinEvent[] = [];

    for (const pending of this.queue) {
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

  /**
   * Enqueue a pending conjoin event.
   * @param event The pending conjoin event.
   */
  enqueue(event: PendingConjoinEvent) {
    this.queue.push(event);
  }
}

