export type EventName = string | symbol | number;

export type ConjoinEvents = [EventName, EventName, ...EventName[]];

export type EventHandler = (...args: any[]) => any;

export type ErrorHandler = (error: unknown) => void;

export type EventOptions = {
  once: boolean;
  async: boolean;
};

export type DualEventHandler =
  | { true: EventHandler; false: EventHandler | ErrorHandler }
  | { true: EventHandler }
  | { false: EventHandler | ErrorHandler };

export type DualEventHandlerSignature<T> = {
  name: T;
  handler: DualEventHandler;
  options:
    & Partial<EventOptions>
    & { dual: true };
};

export type GeneralEventHandlerSignature<T> = {
  name: T;
  handler: EventHandler;
  options?: Partial<
    EventOptions & {
      async: boolean;
      dual: boolean;
    }
  >;
};

export type EventHandlerSignature<T> =
  | GeneralEventHandlerSignature<T>
  | DualEventHandlerSignature<T>;

export type EventUnscriber = () => void;

export type EventRegister = (
  event: EventName,
  handler: EventHandler | DualEventHandler,
  options?: Partial<EventOptions>,
) => EventUnscriber;

export type ConjoinEventsRegister = (
  events: ConjoinEvents,
  handler: EventHandler | DualEventHandler,
  options?: Partial<EventOptions>,
) => EventUnscriber;

export type RegisteredHandlers = Map<
  EventName,
  EventHandlerSignature<EventName>[]
>;

export type EventRegisterName = "on";

export type ConjoinEventsRegisterName = "conjoin";

export type UnregisterHandler<T> = (
  event: T,
  handler?: EventHandler,
) => void;

export type EventUnregister<T> = Record<
  "off" | "removeEventListener",
  UnregisterHandler<T>
>;

export type XCoreEmitter<T> =
  & {
    debug: boolean;
    logger: Pick<Console, "debug">;
    eventNames(): EventName[];
    hasEvent(event: EventName): boolean;
    emit(event: EventName, ...args: any[]): void;
    error(handler: ErrorHandler): void;
  }
  & EventUnregister<T>;

export type XevtEmitter =
  & XCoreEmitter<EventName>
  & Record<
    | "addEventListener"
    | Uncapitalize<EventRegisterName>,
    EventRegister
  >;

export type XConjoinEmitter =
  & XCoreEmitter<ConjoinEvents>
  & Record<
    | "addEventListener"
    | "on"
    | Uncapitalize<ConjoinEventsRegisterName>,
    ConjoinEventsRegister
  >;

export type ExecutingContext<T> = {
  name: T;
  args: any[];
  signatures: EventHandlerSignature<T>[];
};

export type PendingConjoinEvent = {
  event: EventName;
  conjoined: EventName[];
};
