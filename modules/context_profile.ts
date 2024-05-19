import type {
  EventHandler,
  EventHandlerSignature,
  EventName,
  ExecutingContext,
} from "./types.ts";

export type ContextProfileOptions = {
  start: number;
};

export class ContextProfile<T = EventName> implements ExecutingContext<T> {
  private hasFirst?: boolean;
  private hasLast?: boolean;

  constructor(
    public readonly name: T,
    public readonly args: any[],
    public signatures: EventHandlerSignature<T>[],
    public options?: Partial<ContextProfileOptions>,
  ) {
    this.name = name;
    this.args = args;
    this.signatures = signatures;
    this.options = options;
  }

  get running(): boolean {
    return !!this.signatures.length &&
      this.signatures.some((s) => s.ctx.running);
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
