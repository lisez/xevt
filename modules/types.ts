export type EventName = string | symbol | number;

export type ConjoinEvents = [EventName, EventName, ...EventName[]];

export type EventHandler = (...args: any[]) => any;

export type ErrorHandler = (error: unknown) => void;

export type EventOptions = {
  once: boolean;
};

export type EventHandlerSignature<T> = {
  name: T;
  handler: EventHandler;
  options?: Partial<
    EventOptions & {
      async: boolean;
    }
  >;
};

export type EventRegister = (
  event: EventName,
  handler: EventHandler,
  options?: Partial<EventOptions>,
) => void;

export type ConjoinEventsRegister = (
  events: ConjoinEvents,
  handler: EventHandler,
  options?: Partial<EventOptions>,
) => void;

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
    emit(event: EventName, ...args: any[]): void;
    error(handler: ErrorHandler): void;
  }
  & EventUnregister<T>;

export type XevtEmitter =
  & XCoreEmitter<EventName>
  & Record<
    | "addEventListener"
    | Uncapitalize<EventRegisterName>
    | Uncapitalize<`${EventRegisterName}Async`>,
    EventRegister
  >;

export type XConjoinEmitter =
  & XCoreEmitter<ConjoinEvents>
  & Record<
    | "addEventListener"
    | "on"
    | Uncapitalize<ConjoinEventsRegisterName>
    | Uncapitalize<`${ConjoinEventsRegisterName}Async`>,
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
