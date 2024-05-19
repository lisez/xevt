import type { ConjoinEvents, EventName } from "./types.ts";

export function isConjoinEvents(
  event: EventName | EventName[] | ConjoinEvents,
): event is ConjoinEvents {
  return Array.isArray(event) && event.length > 1;
}

