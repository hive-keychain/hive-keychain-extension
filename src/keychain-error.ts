export class KeychainError extends Error {
  messageParams?: any[];
  trace?: any;
  constructor(message: string, messageParams?: any[], stacktrace?: any) {
    super(message);
    this.name = 'KeychainError';
    this.messageParams = messageParams;
    this.trace = stacktrace;
  }
}
