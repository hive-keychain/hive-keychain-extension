export class KeychainError extends Error {
  messageParams?: any[];
  trace?: any;
  constructor(message: string, params?: any[], stacktrace?: any) {
    super(message);
    this.name = 'KeychainError';
    this.messageParams = params;
    this.trace = stacktrace;
  }
}
