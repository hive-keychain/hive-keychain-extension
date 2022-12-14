export class KeychainError extends Error {
  messageParams?: any[];
  constructor(message: string, params?: any[]) {
    super(message);
    this.name = 'KeychainError';
    this.messageParams = params;
  }
}
