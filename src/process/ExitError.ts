export class ExitError extends Error {
  constructor(error: unknown, public readonly exitCode = 1) {
    super(`${error}`);
  }
}
