import type { EventName, PendingConjoinEvent } from "modules/types.ts";

export class ConjoinQueue {
  constructor(private queue: PendingConjoinEvent[] = []) {
    this.queue = queue;
  }

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
}

