import { HasCmd } from '@interfaces/has.interface';
import { KeychainRequestTypes } from '@interfaces/keychain.interface';

const mockCreateMessage = jest.fn<
  Promise<{
    command: string;
    msg: {
      success: boolean;
      error: unknown;
      result: unknown;
      data: Record<string, unknown>;
      message: string | null | undefined;
      publicKey: string | null | undefined;
    };
  }>,
  [
    unknown,
    unknown,
    Record<string, unknown>,
    string | null,
    string | null | undefined,
    string | null | undefined,
  ]
>(
  async (
    err: unknown,
    result: unknown,
    data: Record<string, unknown>,
    successMessage: string | null,
    failMessage?: string | null,
    publicKey?: string | null,
  ) => ({
    command: 'answer_request',
    msg: {
      success: !err,
      error: err,
      result,
      data,
      message: err ? failMessage : successMessage,
      publicKey,
    },
  }),
);

const mockEncryptNoIV = jest.fn<Promise<string>, [string, string]>(
  async () => 'encrypted-payload',
);
const mockDecryptNoIV = jest.fn<string, [string, string]>((value) => value);
const mockEncryptHiveAuthRequestData = jest.fn<
  Promise<{
    encryptedHiveAuthRequestData: string;
    keylessAuthData: {
      appName: string;
      authKey: string;
      token: string;
    };
  }>,
  [string, string, unknown]
>(async () => ({
  encryptedHiveAuthRequestData: 'encrypted-request',
  keylessAuthData: {
    appName: 'peakd.com',
    authKey: 'auth-key',
    token: 'token-1',
  },
}));
const mockGetRequiredWifType = jest.fn<string, [unknown]>(() => 'posting');
const mockLoggerError = jest.fn();
const mockStoreKeylessAuthData = jest.fn();
const mockRemoveKeylessAuthData = jest.fn();
const mockUpdateAuthenticatedKeylessAuthData = jest.fn();

jest.mock('@background/requests/operations/operations.utils', () => ({
  createMessage: (
    err: unknown,
    result: unknown,
    data: Record<string, unknown>,
    successMessage: string | null,
    failMessage?: string | null,
    publicKey?: string | null,
  ) =>
    mockCreateMessage(
      err,
      result,
      data,
      successMessage,
      failMessage,
      publicKey,
    ),
}));

jest.mock('@popup/hive/utils/encrypt.utils', () => ({
  __esModule: true,
  default: {
    encryptNoIV: (value: string, key: string) => mockEncryptNoIV(value, key),
    decryptNoIV: (value: string, key: string) => mockDecryptNoIV(value, key),
  },
}));

jest.mock('@background/utils/keyless-keychain.utils', () => ({
  KeylessKeychainUtils: {
    encryptHiveAuthRequestData: (
      username: string,
      domain: string,
      data: unknown,
    ) => mockEncryptHiveAuthRequestData(username, domain, data),
    storeKeylessAuthData: mockStoreKeylessAuthData,
    removeKeylessAuthData: mockRemoveKeylessAuthData,
    updateAuthenticatedKeylessAuthData: mockUpdateAuthenticatedKeylessAuthData,
  },
}));

jest.mock('src/utils/requests.utils', () => ({
  getRequiredWifType: (request: unknown) => mockGetRequiredWifType(request),
}));

jest.mock('src/utils/logger.utils', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    info: jest.fn(),
    error: (...args: any[]) => mockLoggerError.apply(null, args),
  },
}));

class FakeWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: ((event: unknown) => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  sentMessages: any[] = [];

  private listeners = new Map<string, Set<(event: { data: string }) => void>>();

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type: string, handler: (event: { data: string }) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(
    type: string,
    handler: (event: { data: string }) => void,
  ) {
    this.listeners.get(type)?.delete(handler);
  }

  send(payload: string) {
    this.sentMessages.push(payload === 'ping' ? payload : JSON.parse(payload));
  }

  open() {
    this.onopen?.();
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({});
  }

  dispatchMessage(message: Record<string, unknown>) {
    const event = { data: JSON.stringify(message) };
    this.onmessage?.(event);
    [...(this.listeners.get('message') ?? [])].forEach((handler) =>
      handler(event),
    );
  }
}

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const getJsonMessages = (socket: FakeWebSocket) =>
  socket.sentMessages.filter((message) => message !== 'ping');

const getPingCount = (socket: FakeWebSocket) =>
  socket.sentMessages.filter((message) => message === 'ping').length;

const createRequest = (requestId: number, username: string) =>
  ({
    type: KeychainRequestTypes.broadcast,
    username,
    request_id: requestId,
    operations: [['vote', { voter: username }]],
  }) as any;

const createRequestHandler = (request: any, tab = 1) => {
  return {
    data: {
      confirmed: false,
      isWaitingForConfirmation: false,
      request,
      request_id: request.request_id,
      tab,
    },
  } as any;
};

const createKeylessRequest = (request: any) =>
  ({
    appName: 'peakd.com',
    authKey: 'auth-key',
    request,
  }) as any;

describe('hive-auth.utils pre-correlation gate', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    FakeWebSocket.instances = [];
    Object.defineProperty(global, 'WebSocket', {
      configurable: true,
      writable: true,
      value: FakeWebSocket,
    });
    chrome.i18n.getMessage = jest.fn((key) => key);
    (chrome.runtime.sendMessage as jest.Mock).mockImplementation(() =>
      Promise.resolve(),
    );
    (chrome.tabs.sendMessage as jest.Mock).mockImplementation(() =>
      Promise.resolve(),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  const loadHiveAuthUtils = async () => {
    const module = await import('src/utils/hive-auth.utils');
    return module.default;
  };

  const connectSocket = async (HiveAuthUtils: any) => {
    const connectPromise = HiveAuthUtils.connect();
    const socket = FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    socket.open();
    await connectPromise;
    return socket;
  };

  it('serializes auth requests until the first auth_wait arrives', async () => {
    const HiveAuthUtils = await loadHiveAuthUtils();
    const socket = await connectSocket(HiveAuthUtils);

    const request1 = createRequest(1, 'alice');
    const request2 = createRequest(2, 'bob');
    const handler1 = createRequestHandler(request1);
    const handler2 = createRequestHandler(request2);

    const auth1Promise = HiveAuthUtils.authenticate(
      handler1,
      createKeylessRequest(request1),
    );
    await flushPromises();
    expect(getJsonMessages(socket)).toHaveLength(1);
    expect(getJsonMessages(socket)[0].cmd).toBe(HasCmd.AUTH_REQ);

    const auth2Promise = HiveAuthUtils.authenticate(
      handler2,
      createKeylessRequest(request2),
    );
    await flushPromises();
    expect(getJsonMessages(socket)).toHaveLength(1);

    socket.dispatchMessage({
      cmd: HasCmd.AUTH_WAIT,
      uuid: 'uuid-1',
      expire: Date.now() + 60_000,
      account: 'alice',
    });
    await expect(auth1Promise).resolves.toMatchObject({ uuid: 'uuid-1' });
    await flushPromises();

    expect(getJsonMessages(socket)).toHaveLength(2);
    expect(getJsonMessages(socket)[1]).toMatchObject({
      cmd: HasCmd.AUTH_REQ,
      account: 'bob',
    });

    socket.dispatchMessage({
      cmd: HasCmd.AUTH_WAIT,
      uuid: 'uuid-2',
      expire: Date.now() + 60_000,
      account: 'bob',
    });
    await expect(auth2Promise).resolves.toMatchObject({ uuid: 'uuid-2' });
  });

  it('releases the gate on pre-correlation timeout', async () => {
    jest.useFakeTimers();
    const HiveAuthUtils = await loadHiveAuthUtils();
    const socket = await connectSocket(HiveAuthUtils);

    const request1 = createRequest(1, 'alice');
    const request2 = createRequest(2, 'bob');
    const handler1 = createRequestHandler(request1);
    const handler2 = createRequestHandler(request2);

    const auth1Promise = HiveAuthUtils.authenticate(
      handler1,
      createKeylessRequest(request1),
    );
    await flushPromises();

    const auth2Promise = HiveAuthUtils.authenticate(
      handler2,
      createKeylessRequest(request2),
    );
    await flushPromises();
    expect(getJsonMessages(socket)).toHaveLength(1);

    jest.advanceTimersByTime(30_000);
    await expect(auth1Promise).rejects.toThrow(
      'Authentication request timed out before correlation was established',
    );
    await flushPromises();

    expect(getJsonMessages(socket)).toHaveLength(2);
    socket.dispatchMessage({
      cmd: HasCmd.AUTH_WAIT,
      uuid: 'uuid-2',
      expire: Date.now() + 60_000,
      account: 'bob',
    });
    await expect(auth2Promise).resolves.toMatchObject({ uuid: 'uuid-2' });
  });

  it('releases the gate on explicit cancellation', async () => {
    const HiveAuthUtils = await loadHiveAuthUtils();
    const socket = await connectSocket(HiveAuthUtils);

    const request1 = createRequest(1, 'alice');
    const request2 = createRequest(2, 'bob');
    const handler1 = createRequestHandler(request1);
    const handler2 = createRequestHandler(request2);

    const auth1Promise = HiveAuthUtils.authenticate(
      handler1,
      createKeylessRequest(request1),
    );
    const auth2Promise = HiveAuthUtils.authenticate(
      handler2,
      createKeylessRequest(request2),
    );
    await flushPromises();

    HiveAuthUtils.cancelPreCorrelationRequest(handler1);
    await expect(auth1Promise).rejects.toThrow('Keyless request cancelled');
    await flushPromises();

    expect(getJsonMessages(socket)).toHaveLength(2);
    socket.dispatchMessage({
      cmd: HasCmd.AUTH_WAIT,
      uuid: 'uuid-2',
      expire: Date.now() + 60_000,
      account: 'bob',
    });
    await expect(auth2Promise).resolves.toMatchObject({ uuid: 'uuid-2' });
  });

  it('fails closed on unexpected pre-correlation wait ordering', async () => {
    const HiveAuthUtils = await loadHiveAuthUtils();
    const socket = await connectSocket(HiveAuthUtils);

    const request1 = createRequest(1, 'alice');
    const request2 = createRequest(2, 'bob');
    const handler1 = createRequestHandler(request1);
    const handler2 = createRequestHandler(request2);

    const auth1Promise = HiveAuthUtils.authenticate(
      handler1,
      createKeylessRequest(request1),
    );
    const auth2Promise = HiveAuthUtils.authenticate(
      handler2,
      createKeylessRequest(request2),
    );
    await flushPromises();

    socket.dispatchMessage({
      cmd: HasCmd.SIGN_WAIT,
      uuid: 'unexpected-sign-wait',
      expire: Date.now() + 60_000,
    });

    await expect(auth1Promise).rejects.toThrow(
      'Unexpected HiveAuth message order: received sign_wait while waiting for auth_wait',
    );
    await flushPromises();

    expect(getJsonMessages(socket)).toHaveLength(2);
    socket.dispatchMessage({
      cmd: HasCmd.AUTH_WAIT,
      uuid: 'uuid-2',
      expire: Date.now() + 60_000,
      account: 'bob',
    });
    await expect(auth2Promise).resolves.toMatchObject({ uuid: 'uuid-2' });
  });

  it('releases the gate on disconnect so a later request can reconnect', async () => {
    const HiveAuthUtils = await loadHiveAuthUtils();
    const socket = await connectSocket(HiveAuthUtils);

    const request1 = createRequest(1, 'alice');
    const handler1 = createRequestHandler(request1);
    const auth1Promise = HiveAuthUtils.authenticate(
      handler1,
      createKeylessRequest(request1),
    );
    await flushPromises();

    socket.close();
    await expect(auth1Promise).rejects.toThrow(
      'HiveAuth connection closed before correlation was established',
    );

    const reconnectPromise = HiveAuthUtils.connect();
    const socket2 = FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    socket2.open();
    await reconnectPromise;

    const request2 = createRequest(2, 'bob');
    const handler2 = createRequestHandler(request2);
    const auth2Promise = HiveAuthUtils.authenticate(
      handler2,
      createKeylessRequest(request2),
    );
    await flushPromises();
    expect(getJsonMessages(socket2)).toHaveLength(1);

    socket2.dispatchMessage({
      cmd: HasCmd.AUTH_WAIT,
      uuid: 'uuid-2',
      expire: Date.now() + 60_000,
      account: 'bob',
    });
    await expect(auth2Promise).resolves.toMatchObject({ uuid: 'uuid-2' });
  });

  it('correlates auth nack handling by uuid after auth_wait', async () => {
    const HiveAuthUtils = await loadHiveAuthUtils();
    const socket = await connectSocket(HiveAuthUtils);

    const request1 = createRequest(1, 'alice');
    const request2 = createRequest(2, 'bob');
    const keylessRequest1 = {
      ...createKeylessRequest(request1),
      uuid: 'auth-1',
    } as any;
    const keylessRequest2 = {
      ...createKeylessRequest(request2),
      uuid: 'auth-2',
    } as any;

    HiveAuthUtils.listenToAuthAck(
      createRequestHandler(request1),
      'alice',
      keylessRequest1,
      1,
    );
    HiveAuthUtils.listenToAuthAck(
      createRequestHandler(request2),
      'bob',
      keylessRequest2,
      2,
    );

    socket.dispatchMessage({
      cmd: HasCmd.AUTH_NACK,
      uuid: 'auth-2',
      data: 'nope',
    });
    await flushPromises();

    expect(mockRemoveKeylessAuthData).toHaveBeenCalledTimes(1);
    expect(mockRemoveKeylessAuthData).toHaveBeenCalledWith('bob', 'auth-2');
  });

  it('keeps the post-auth sign flow on the correlated sign wait/ack path', async () => {
    const HiveAuthUtils = await loadHiveAuthUtils();
    const socket = await connectSocket(HiveAuthUtils);
    jest.useFakeTimers();

    const request = createRequest(1, 'alice');
    const requestHandler = createRequestHandler(request);
    const keylessRequest = {
      ...createKeylessRequest(request),
      uuid: 'auth-uuid',
    } as any;

    HiveAuthUtils.listenToAuthAck(requestHandler, 'alice', keylessRequest, 11);
    socket.dispatchMessage({
      cmd: HasCmd.AUTH_ACK,
      uuid: 'auth-uuid',
      data: JSON.stringify({
        expire: Date.now() + 60_000,
        token: 'token-1',
        challenge: {
          challenge: 'challenge',
          pubkey: 'STM111',
          key_type: 'posting',
        },
      }),
    });
    await flushPromises();
    jest.advanceTimersByTime(3000);
    await flushPromises();

    expect(getJsonMessages(socket)).toHaveLength(1);
    expect(getJsonMessages(socket)[0]).toMatchObject({
      cmd: HasCmd.SIGN_REQ,
      account: 'alice',
    });

    socket.dispatchMessage({
      cmd: HasCmd.SIGN_ACK,
      uuid: 'wrong-sign-uuid',
      broadcast: true,
      data: 'wrong-tx',
    });
    await flushPromises();
    expect(mockCreateMessage).not.toHaveBeenCalledWith(
      false,
      expect.objectContaining({ uuid: 'wrong-sign-uuid' }),
      request,
      expect.any(String),
      null,
      null,
    );

    socket.dispatchMessage({
      cmd: HasCmd.SIGN_WAIT,
      uuid: 'sign-uuid',
      expire: Date.now() + 60_000,
    });
    await flushPromises();

    socket.dispatchMessage({
      cmd: HasCmd.SIGN_ACK,
      uuid: 'sign-uuid',
      broadcast: true,
      data: 'tx',
    });
    await flushPromises();

    expect(mockCreateMessage).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ uuid: 'sign-uuid' }),
      request,
      expect.any(String),
      null,
      null,
    );
  });

  it('clears the ping interval across reconnects', async () => {
    jest.useFakeTimers();
    const HiveAuthUtils = await loadHiveAuthUtils();

    const connectPromise1 = HiveAuthUtils.connect();
    const socket1 = FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    socket1.open();
    await connectPromise1;

    jest.advanceTimersByTime(10_000);
    expect(getPingCount(socket1)).toBe(1);

    socket1.close();
    await flushPromises();

    const connectPromise2 = HiveAuthUtils.connect();
    const socket2 = FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    socket2.open();
    await connectPromise2;

    jest.advanceTimersByTime(10_000);
    expect(getPingCount(socket1)).toBe(1);
    expect(getPingCount(socket2)).toBe(1);
  });
});
