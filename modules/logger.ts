export class Logger implements Pick<Console, "debug"> {
  private ns = "[xevt]";

  debug(...data: any[]): void {
    console.debug(this.ns, ...data);
  }
}

