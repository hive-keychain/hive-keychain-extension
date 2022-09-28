export class RPCError {
  name: string;
  message: string;
  jse_info: {
    stack: any[];
  };
  constructor(
    message: string,
    jse_info: {
      stack: any[];
    },
  ) {
    this.name = 'RPCError';
    this.message = message;
    this.jse_info = jse_info;
  }
}
