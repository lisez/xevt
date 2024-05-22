import type {
  EventHandler,
  EventHandlerSignature,
  EventName,
} from "./types.ts";

export type ExecutorOptions = {
  disableDetach: boolean;
  start: number;
};

export class ExecutingCancelled extends Error {}

export class Executor<T = EventName> {
  private counter = 0;
  pendingQueue: Executor<T>[] = [];

  constructor(
    public readonly name: T,
    public readonly signatures: EventHandlerSignature<any>[],
    public readonly args: any[] = [],
    private options: Partial<ExecutorOptions> = {},
  ) {
    this.name = name;
    this.signatures = signatures;
    this.args = args;
    this.options = options;
    this.counter = options.start || 0;
  }

  get pointer() {
    return this.counter;
  }

  get done(): boolean {
    return this.counter >= this.signatures.length && !this.running;
  }

  get value() {
    return this.signatures[this.counter];
  }

  get thenable() {
    // @ts-ignore TS7053
    return this.value.handler[Symbol.toStringTag] === "AsyncFunction" ||
      ("then" in this.value.handler &&
        typeof this.value.handler === "function");
  }

  get running() {
    return !!this.value?.ctx?.running;
  }

  private exec(profile: EventHandlerSignature<any>) {
    this.counter++;
    profile.ctx.running = true;
    profile.handler(...this.args);
    profile.ctx.running = false;
    if (this.done) return this.return();
    return { value: profile, done: false as const };
  }

  private makeAsyncExec(profile: EventHandlerSignature<any>) {
    profile.ctx.running = true;

    return new Promise((res, rej) => {
      profile.ctx.cancel = () => {
        rej(new ExecutingCancelled());
      };
      profile.handler(...this.args).then(res).catch(rej);
    }).catch((err) => {
      if (err instanceof ExecutingCancelled) return;
      throw err;
    }).finally(() => {
      profile.ctx.running = false;
    });
  }

  private async execAsync(profile: EventHandlerSignature<any>) {
    this.counter++;
    await this.makeAsyncExec(profile);
    if (this.done) return this.return();
    return { value: profile, done: false as const };
  }

  private execDetached(profile: EventHandlerSignature<any>) {
    this.counter++;
    this.detachProfile(profile);
    if (this.done) return this.return();
    return { value: profile, done: false as const };
  }

  private detachProfile(profile: EventHandlerSignature<any>) {
    const index = this.signatures.indexOf(profile);
    if (index > -1) {
      this.signatures.splice(index, 1);
    }
    this.pendingQueue.push(
      new Executor(profile.name, [profile], this.args, { disableDetach: true }),
    );
  }

  suspend() {
    if (this.running) {
      this.value.options?.signal?.abort() || this.value.ctx.cancel?.();
    }
  }

  block(handlers: EventHandler[], keepCurrent = true) {
    for (const h of handlers) {
      let index = this.signatures.findIndex((s) => s.handler === h);
      while (index > -1) {
        if (index < this.counter) {
          if (this.signatures[index].ctx.running) {
            this.signatures[index].options?.signal?.abort() ||
              this.signatures[index].ctx.cancel?.();
          }
        } else if (index !== this.counter || !keepCurrent) {
          this.signatures.splice(index, 1);
        }

        index = this.signatures.findIndex((s, i) =>
          s.handler === h && i > index
        );
      }
    }
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
    if (profile.options?.async && this.thenable) {
      return !this.options.disableDetach && profile.options.detach
        ? this.execDetached(profile)
        : this.execAsync(profile);
    }
    return this.exec(profile);
  }

  return(): IteratorResult<EventHandlerSignature<any>, void> {
    return { value: undefined, done: true };
  }
}
