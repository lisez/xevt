import type {
  EventHandler,
  EventHandlerSignature,
  EventName,
  ExecutingContext,
} from "./types.ts";

export class ContextProfile<T = EventName> implements ExecutingContext<T> {
  public readonly name: T;
  public readonly args: any[];
  public signatures: EventHandlerSignature<T>[];
  private hasFirst?: boolean;
  private hasLast?: boolean;

  constructor(name: T, args: any[], signatures: EventHandlerSignature<T>[]) {
    this.name = name;
    this.args = args;
    this.signatures = signatures;
  }

  get running(): boolean {
    return this.signatures.some((s) => s.ctx.running);
  }

  get useFirst(): boolean {
    this.hasFirst ??= this.hasFirst ||
      this.signatures.some((s) => !!s.options?.lead);
    return this.hasFirst;
  }

  useFirstHandlers() {
    return this.signatures.filter((s) => !!s.options?.lead).map((s) =>
      s.handler
    );
  }

  get useLast(): boolean {
    this.hasLast ??= this.hasLast ||
      this.signatures.some((s) => !!s.options?.last);
    return this.hasLast;
  }

  useLastHandlers() {
    return this.signatures.filter((s) => !!s.options?.last).map((s) =>
      s.handler
    );
  }

  removeHandlers(handlers: EventHandler[]) {
    this.signatures = this.signatures.filter((s) =>
      !handlers.includes(s.handler)
    );
  }
}
