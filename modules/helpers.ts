import type {
  ConjoinEvents,
  DualEventHandler,
  DualEventHandlerSignature,
  EventHandler,
  EventHandlerSignature,
  EventName,
} from "modules/types.ts";

export function isConjoinEvents(
  event: EventName | EventName[] | ConjoinEvents,
): event is ConjoinEvents {
  return Array.isArray(event) && event.length > 1;
}

export function isDualSignature(
  signature: EventHandlerSignature<any>,
): signature is DualEventHandlerSignature<any> {
  return !!signature.options?.dual;
}

export function isDualHandler(
  handler: EventHandler | DualEventHandler,
): handler is DualEventHandler {
  return typeof handler === "object" && (
    "true" in handler || "false" in handler
  );
}
