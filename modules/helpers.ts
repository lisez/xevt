import type {
  ConjoinEvents,
  DualEventHandlerSignature,
  EventHandlerSignature,
  EventName,
} from "modules/types.ts";

export function isConjoinEvents(
  event: EventName | EventName[] | ConjoinEvents,
): event is ConjoinEvents {
  return Array.isArray(event) && event.length > 1;
}

export function isDualHandler(
  handler: EventHandlerSignature<any>,
): handler is DualEventHandlerSignature<any> {
  return !!handler.options && "dual" in handler.options;
}
