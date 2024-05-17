import type { EventName, UnregisterHandler } from "./types.ts";

import { Executor } from "./executor.ts";
import { ContextProfile } from "./context_profile.ts";

export class ContextExecutor<
  N = EventName,
  T extends ContextProfile<N> = ContextProfile<N>,
> {
  private queue: T[];
  private unregister: UnregisterHandler<N>;
  private current: Executor<N> | null = null;

  constructor(
    unregister: UnregisterHandler<N>,
    queue?: T[],
  ) {
    this.unregister = unregister;
    this.queue = queue || [];
  }

  emit(ctx: T) {
    if (ctx.useLast) this.useLast(ctx);
    this.queue.unshift(ctx);
  }

  private useLast(ctx: T) {
    this.block(ctx);

    if (this.current && ctx.name === this.current.name) {
      const targetHandlers = ctx.useLastHandlers();
      this.current.block(targetHandlers);
      const shouldSuspend = targetHandlers.includes(
        this.current.value.handler as any,
      );
      if (shouldSuspend) this.current?.suspend();
    }
  }

  private useFirst(ctx: T) {
    this.block(ctx);

    if (this.current && ctx.name === this.current.name) {
      const targetHandlers = ctx.useFirstHandlers();
      this.current.block(targetHandlers);
    }
  }

  private block(ctx: T) {
    this.queue = this.queue.map((p) => {
      if (p.name === ctx.name) {
        const targetHandlers = p.useFirstHandlers();
        p.removeHandlers(targetHandlers);
      }
      return p;
    });
  }

  private *getContext() {
    while (this.queue.length) {
      const ctx = this.queue.pop() || null;
      yield ctx;
    }
  }

  exec() {
    for (const ctx of this.getContext()) {
      if (!ctx) break;

      const executor = new Executor(ctx.name, ctx.signatures, ctx.args);
      this.current = executor;

      while (!executor.done) {
        if (executor.value.options.once) {
          this.unregister(ctx.name, executor.value.handler);
        }

        if (executor.value.options.lead) {
          this.useFirst(ctx);
        }

        executor.next();
      }
    }
  }
}
