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
  private hasLast?: boolean;
  id = Math.random();
  id2 = +Date.now();

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
    for (const h of handlers) {
      let index = this.signatures.findIndex((s) => s.handler === h);
      while (index > -1) {
        if (this.signatures[index].ctx.running) {
          this.signatures[index].options?.signal?.abort() ||
            this.signatures[index].ctx.cancel?.();
        }

        this.signatures.splice(index, 1);
        index = this.signatures.findIndex((s) => s.handler === h);
      }
    }
  }
}
