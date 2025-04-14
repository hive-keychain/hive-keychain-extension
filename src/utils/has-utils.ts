import {
  AUTH_PAYLOAD_URI,
  AUTH_REQ,AUTH_PAYLOAD,
  AUTH_REQ_DATA,
  AUTH_WAIT,
} from '@interfaces/has.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
const APP_META = {
  name: 'myapp',
  description: 'My HAS compatible application',
  icon: undefined,
};

let ws: WebSocket;
let reconnectInterval = 1000; // Initial reconnection delay

const setupWebSocketHandlers = (
  resolve: () => void,
  reject: (error: any) => void,
) => {
  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectInterval = 1000; // Reset the reconnection delay
    resolve();
  };

  ws.onmessage = (event) => {
    console.log('Message from server:', event.data);
  };

  ws.onclose = (event) => {
    console.log('WebSocket disconnected', event);
    setTimeout(connect, reconnectInterval); // Attempt to reconnect
    reconnectInterval = Math.min(reconnectInterval * 2, 30000); // Exponential backoff, max 30 seconds
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    reject(error);
  };
};

const connect = (): Promise<void> => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket is already connected');
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    ws = new WebSocket('wss://hive-auth.arcange.eu/');
    setupWebSocketHandlers(resolve, reject);
  });
};

const authenticate = async (
  keylessRequest: KeylessRequest,
): Promise<AUTH_WAIT> => {
  // Check if the request is not yet expired
  if (keylessRequest.expire && keylessRequest.expire > Date.now()) {
    return {
      cmd: 'auth_wait',
      uuid: keylessRequest.uuid,
      expire: keylessRequest.expire,
      account: keylessRequest.request.username,
    } as AUTH_WAIT;
  }

  // Validate username
  if (!keylessRequest.request.username) {
    throw new Error('Username is required');
  }

  // Prepare authentication request data
  const auth_req_data: AUTH_REQ_DATA = {
    app: { name: keylessRequest.appName },
  };
  const auth_req_data_base64 = Buffer.from(
    JSON.stringify(auth_req_data),
  ).toString('base64');
  const auth_req_data_encrypted = await EncryptUtils.encrypt(
    auth_req_data_base64,
    keylessRequest.authKey,
  );
  const auth_req: AUTH_REQ = {
    cmd: 'auth_req',
    account: keylessRequest.request.username,
    data: auth_req_data_encrypted,
  };

  // Send the authentication request
  ws.send(JSON.stringify(auth_req));

  // Return a promise that resolves with the AUTH_WAIT message
  return new Promise<AUTH_WAIT>((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.cmd === 'auth_wait') {
        // AUTH_WAIT received
        ws.removeEventListener('message', handleMessage);
        resolve(message as AUTH_WAIT);
      } else if (message.cmd === 'auth_nack' || message.cmd === 'auth_err') {
        // Authentication failed or error
        ws.removeEventListener('message', handleMessage);
        reject(
          new Error(
            `Authentication failed: ${message.error || 'Unknown error'}`,
          ),
        );
      }
    };

    ws.addEventListener('message', handleMessage);
  });
};

const generateAuthPayloadURI = async (auth_payload: AUTH_PAYLOAD) => {
  const auth_payload_base64 = Buffer.from(
    JSON.stringify(auth_payload),
  ).toString('base64');
  const auth_payload_uri = `has://auth_req/${auth_payload_base64}`;
  return auth_payload_uri as AUTH_PAYLOAD_URI;
};

const HASUtils = {
  authenticate,
  connect,
  generateAuthPayloadURI,
};

export default HASUtils;
