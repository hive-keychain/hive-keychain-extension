import KeylessKeychainUtils from '@background/utils/keylessKeychain.utils';
import {
  AUTH_ACK,
  AUTH_ACK_DATA,
  AUTH_NACK,
  AUTH_PAYLOAD,
  AUTH_PAYLOAD_URI,
  AUTH_REQ,
  AUTH_REQ_DATA,
  AUTH_WAIT,
} from '@interfaces/has.interface';
import {
  KeylessAuthData,
  KeylessRequest,
} from '@interfaces/keyless-keychain.interface';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import Logger from 'src/utils/logger.utils';

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
  // Note: the auth_req_data does not need to be converted to base64 before encryption as
  // it will be converted to base64 by the encryption.
  const auth_req_data_string = JSON.stringify(auth_req_data);
  console.log('auth_req_data_string:', { auth_req_data_string });
  const auth_req_data_encrypted = await EncryptUtils.encryptNoIV(
    auth_req_data_string,
    keylessRequest.authKey,
  );
  console.log('auth_req_data_encrypted:', { auth_req_data_encrypted });
  const auth_req: AUTH_REQ = {
    cmd: 'auth_req',
    account: keylessRequest.request.username,
    data: auth_req_data_encrypted,
  };
  console.log('auth_req:', { auth_req });

  // Send the authentication request

  console.log('Sending authentication request:', { auth_req });
  ws.send(JSON.stringify(auth_req));

  // Return a promise that resolves with the AUTH_WAIT message
  return new Promise<AUTH_WAIT>((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.cmd === 'auth_wait') {
        // AUTH_WAIT received
        console.log('AUTH_WAIT received:', { message });
        ws.removeEventListener('message', handleMessage);
        resolve(message as AUTH_WAIT);
      } else if (message.cmd === 'auth_nack' || message.cmd === 'auth_err') {
        // Authentication failed or error
        console.log('AUTH_NACK received:', { message });
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

const listenToAuthAck = (
  username: string,
  keylessAuthData: KeylessAuthData,
): Promise<void> => {
  Logger.log('listenToAuthAck');
  if (!username || !keylessAuthData) {
    Logger.log(
      'listenToAuthAck error: Username and keyless auth data are required',
    );
    throw new Error('Username and keyless auth data are required');
  }

  // Start listening for messages immediately
  const handleMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      Logger.log('listenToAuthAck message:', { message });
      if (message.cmd === 'auth_ack') {
        ws.removeEventListener('message', handleMessage);
        handleAuthAck(username, keylessAuthData, message as AUTH_ACK)
          .then(() => {})
          .catch((error) => {
            console.error('Failed to handle auth ack:', error);
          });
      } else if (message.cmd === 'auth_nack' || message.cmd === 'auth_err') {
        ws.removeEventListener('message', handleMessage);
        handleAuthNack(username, message as AUTH_NACK)
          .then(() => {})
          .catch((error) => {
            console.error('Failed to handle auth nack:', error);
          });
      }
    } catch (error: any) {
      console.error('Failed to process message:', error);
    }
  };

  ws.addEventListener('message', handleMessage);

  // Return immediately without waiting
  return Promise.resolve();
};

const handleAuthAck = async (
  username: string,
  keylessAuthData: KeylessAuthData,
  auth_ack: AUTH_ACK,
): Promise<void> => {
  try {
    if (!auth_ack?.data) {
      throw new Error('Invalid auth acknowledgement data');
    }

    console.log({ auth_ack });
    const auth_ack_data: AUTH_ACK_DATA =
      typeof auth_ack.data === 'string'
        ? JSON.parse(
            EncryptUtils.decryptNoIV(auth_ack.data, keylessAuthData.authKey),
          )
        : auth_ack.data;

    console.log({ auth_ack_data });
    if (!auth_ack_data?.expire) {
      throw new Error('Missing expiration in auth acknowledgement data');
    }

    keylessAuthData.expire = auth_ack_data.expire;
    await KeylessKeychainUtils.storeKeylessAuthData(username, keylessAuthData);
    chrome.runtime.sendMessage({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        message: 'Keyless authentication successful',
      },
    });
  } catch (error) {
    throw new Error(`Failed to update keyless auth data: ${error}`);
  }
};

const handleAuthNack = async (username: string, auth_nack: AUTH_NACK) => {
  await KeylessKeychainUtils.removeKeylessAuthData(username, auth_nack.uuid);
  chrome.runtime.sendMessage({
    command: DialogCommand.ANSWER_REQUEST,
    msg: {
      success: false,
      message: 'Keyless authentication failed',
    },
  });
};

const HASUtils = {
  authenticate,
  connect,
  generateAuthPayloadURI,
  listenToAuthAck,
};

export default HASUtils;
