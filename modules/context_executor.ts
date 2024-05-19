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

  emit(ctx: T, asap = false) {
    if (ctx.useLast) this.useLast(ctx);
    if (asap) {
      this.queue.push(ctx);
    } else {
      this.queue.unshift(ctx);
    }
  }

  private useLast(ctx: T) {
    for (const p of this.queue) {
      if (p.name === ctx.name) {
        const targetHandlers = p.useLastHandlers();
        p.removeHandlers(targetHandlers);
      }
    }

    if (this.current && ctx.name === this.current.name) {
      const targetHandlers = ctx.useLastHandlers();
      this.current.block(targetHandlers);
      const shouldSuspend = this.current.value && targetHandlers.includes(
        this.current.value.handler as any,
      );
      if (shouldSuspend) this.current?.suspend();
    }
  }

  private useFirst(ctx: T) {
    for (const p of this.queue) {
      if (p.name === ctx.name) {
        const targetHandlers = p.useFirstHandlers();
        p.removeHandlers(targetHandlers);
      }
    }

    if (this.current && ctx.name === this.current.name) {
      const targetHandlers = ctx.useFirstHandlers();
      this.current.block(targetHandlers);
    }
  }

  private launchExecutor(ctx: T, executor: Executor<N>) {
    this.current = executor;

    if (executor.value.options?.once) {
      this.unregister(ctx.name, executor.value.handler);
    }

    if (executor.value.options?.lead) {
      this.useFirst(ctx);
    }

    executor.next();
  }

  private launchPendingExecutor(ctx: T, queue: Executor<N>[]) {
    const pending: Executor<N>[] = [];
    let executor = queue.pop();
    while (executor) {
      this.launchExecutor(ctx, executor);
      if (!executor.done) {
        pending.push(executor);
      }
      executor = queue.pop();
    }
    return pending;
  }

  private toNextBatch(pending: [T, Executor<N>[]][]) {
    for (const [ctx, executors] of pending) {
      for (const exec of executors) {
        const profile = new ContextProfile(
          ctx.name,
          ctx.args,
          exec.signatures,
          { start: exec.pointer },
        ) as T;
        this.emit(profile, true);
      }
    }
  }

  exec() {
    const pendingQueue: [T, Executor<N>[]][] = [];
    let ctx = this.queue.pop();
    while (ctx) {
      const executor = new Executor(ctx.name, ctx.signatures, ctx.args, {
        start: ctx.options?.start || 0,
      });

      while (!executor.done) {
        this.launchExecutor(ctx, executor);
      }

      const executingQueue = executor.pendingQueue.length
        ? pendingQueue.concat([[
          ctx,
          executor.pendingQueue,
        ]])
        : pendingQueue;

      for (const pending of executingQueue) {
        const still = this.launchPendingExecutor(pending[0], pending[1]);
        if (still.length) {
          pendingQueue.push([pending[0], still]);
        }
      }

      ctx = this.queue.pop();
    }

    this.toNextBatch(pendingQueue);
  }
}
