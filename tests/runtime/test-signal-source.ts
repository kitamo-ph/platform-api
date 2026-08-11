import type { ShutdownSignal, ShutdownSignalSource } from "../../src/runtime/shutdown.js";

export class TestSignalSource implements ShutdownSignalSource {
  public readonly handlers = new Map<ShutdownSignal, () => void>();
  public readonly onceCalls: ShutdownSignal[] = [];
  public readonly offCalls: ShutdownSignal[] = [];
  public readonly exitCodes: number[] = [];

  public once(signal: ShutdownSignal, handler: () => void): void {
    this.onceCalls.push(signal);
    this.handlers.set(signal, handler);
  }

  public off(signal: ShutdownSignal, handler: () => void): void {
    this.offCalls.push(signal);
    if (this.handlers.get(signal) === handler) this.handlers.delete(signal);
  }

  public setExitCode(code: number): void {
    this.exitCodes.push(code);
  }

  public emit(signal: ShutdownSignal): void {
    const handler = this.handlers.get(signal);
    this.handlers.delete(signal);
    handler?.();
  }
}
