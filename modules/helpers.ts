import type { ConjoinEvents, EventName } from "./types.ts";

export function isConjoinEvents(
  event: EventName | EventName[] | ConjoinEvents,
): event is ConjoinEvents {
  return Array.isArray(event) && event.length > 1;
}

const timers: number[] = [];

export function prexitClear(timer?: number) {
  if (timer) timers.push(timer);

  const clear = () => {
    for (const t of timers) clearTimeout(t);
  };
  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("beforeunload", clear);
    globalThis.addEventListener("unload", clear);
  }
}
