import type {
  EventHandler,
  EventHandlerSignature,
  EventName,
} from "./types.ts";

export class Executor<T = EventName> {
  private counter = 0;

  constructor(
    public readonly name: T,
    private signatures: EventHandlerSignature<any>[],
    private readonly args: any[] = [],
  ) {
    this.name = name;
    this.signatures = signatures;
    this.args = args;
  }

  get done() {
    return this.counter >= this.signatures.length;
  }

  get value() {
    return this.signatures[this.counter];
  }

  get thenable() {
    return "then" in this.value.handler &&
      typeof this.value.handler === "function";
  }

  get running() {
    return this.value.ctx.running;
  }

  private exec(profile: EventHandlerSignature<any>) {
    profile.ctx.running = true;
    profile.handler(...this.args);
    profile.ctx.running = false;
    this.counter++;
    return { value: profile, done: false as const };
  }

  private async execAsync(profile: EventHandlerSignature<any>) {
    profile.ctx.running = true;
    await (profile.handler(...this.args) as unknown as Promise<void>);
    profile.ctx.running = false;
    this.counter++;
    return { value: profile, done: false as const };
  }

  suspend() {
    this.counter++;
    if (this.running) this.value.options.signal?.abort();
  }

  block(handlers: EventHandler[]) {
    this.signatures = this.signatures.filter((s, i) =>
      !handlers.includes(s.handler, i + 1)
    );
  }

  next():
    | IteratorResult<EventHandlerSignature<any>, void>
    | Promise<IteratorResult<EventHandlerSignature<any>, void>> {
    if (this.done) {
      return this.return();
    }

    if (this.running) {
      return { value: this.value, done: false as const };
    }

    const profile = this.value;
    if (profile.options.async && this.thenable) {
      return this.execAsync(profile);
    }
    return this.exec(profile);
  }

  return(): IteratorResult<EventHandlerSignature<any>, void> {
    return { value: undefined, done: true };
  }
}
