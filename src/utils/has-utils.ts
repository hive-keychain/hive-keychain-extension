import { createMessage } from '@background/requests/operations/operations.utils';
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
  HAS_CMD,
  SIGN_ACK,
  SIGN_REQ,
  SIGN_REQ_DATA,
  SIGN_WAIT,
} from '@interfaces/has.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import { BloggingUtils } from '@popup/hive/utils/blogging.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import TransferUtils from '@popup/hive/utils/transfer.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { RequestSignBuffer } from 'hive-keychain-commons';
import Config from 'src/config';
import Logger from 'src/utils/logger.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';

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
    ws = new WebSocket(Config.keyless.host);
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
    challenge: {
      challenge: (keylessRequest.request as RequestSignBuffer).message,
      key_type: (
        (keylessRequest.request as RequestSignBuffer).method as string
      ).toLowerCase(),
    },
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
    cmd: HAS_CMD.AUTH_REQ,
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

      if (message.cmd === HAS_CMD.AUTH_WAIT) {
        // AUTH_WAIT received
        console.log('AUTH_WAIT received:', { message });
        ws.removeEventListener('message', handleMessage);
        resolve(message as AUTH_WAIT);
      } else if (
        message.cmd === HAS_CMD.AUTH_NACK ||
        message.cmd === 'auth_err'
      ) {
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
  keylessRequest: KeylessRequest,
  tab: number,
): Promise<void> => {
  Logger.log('listenToAuthAck');
  if (!username || !keylessRequest) {
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
      if (message.cmd === HAS_CMD.AUTH_ACK) {
        ws.removeEventListener('message', handleMessage);
        handleAuthAck(username, keylessRequest, message as AUTH_ACK, tab)
          .then(() => {})
          .catch((error) => {
            console.error('Failed to handle auth ack:', error);
          });
      } else if (
        message.cmd === HAS_CMD.AUTH_NACK ||
        message.cmd === 'auth_err'
      ) {
        ws.removeEventListener('message', handleMessage);
        handleAuthNack(username, message as AUTH_NACK)
          .then(() => {})
          .catch((error) => {
            console.error('Failed to handle auth nack:', error);
          });
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  };

  ws.addEventListener('message', handleMessage);

  // Return immediately without waiting
  return Promise.resolve();
};

const handleAuthAck = async (
  username: string,
  keylessRequest: KeylessRequest,
  auth_ack: AUTH_ACK,
  tab: number,
): Promise<void> => {
  let message = null;
  try {
    if (!auth_ack?.data) {
      throw new Error('Invalid auth acknowledgement data');
    }

    const auth_ack_data: AUTH_ACK_DATA =
      typeof auth_ack.data === 'string'
        ? JSON.parse(
            EncryptUtils.decryptNoIV(auth_ack.data, keylessRequest.authKey),
          )
        : auth_ack.data;

    if (!auth_ack_data?.expire) {
      throw new Error('Missing expiration in auth acknowledgement data');
    }
    if (keylessRequest.uuid !== auth_ack.uuid) {
      throw new Error('Invalid auth acknowledgement data');
    }
    keylessRequest.expire = auth_ack_data.expire;
    keylessRequest.token = auth_ack_data.token;
    const keylessAuthData = {
      uuid: keylessRequest.uuid,
      appName: keylessRequest.appName,
      authKey: keylessRequest.authKey,
      expire: keylessRequest.expire,
      token: keylessRequest.token,
    };
    await KeylessKeychainUtils.storeKeylessAuthData(username, keylessAuthData);

    message = await createMessage(
      null,
      auth_ack_data.challenge.challenge,
      keylessRequest.request,
      await chrome.i18n.getMessage('bgd_ops_sign_success'),
      null,
      auth_ack_data.challenge.pubkey,
    );
    chrome.tabs.sendMessage(tab, message);
  } catch (error) {
    throw new Error(`Failed to update keyless auth data: ${error}`);
  } finally {
    chrome.runtime.sendMessage(message);
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

const getRequestOperation = async (request: KeychainRequest) => {
  switch (request.type) {
    case KeychainRequestTypes.vote:
      return BloggingUtils.getVoteOperation(
        request.username,
        request.author,
        request.permlink,
        +request.weight,
      );
    case KeychainRequestTypes.transfer:
      return TransferUtils.getTransferOperation(
        request.username!,
        request.to,
        request.amount + ' ' + request.currency,
        request.memo,
      );
    case KeychainRequestTypes.signTx:
      return request.tx.operations;
    case KeychainRequestTypes.post:
      if (request.parent_username) {
        return BloggingUtils.getCommentOperation(
          request.parent_username || '',
          request.parent_perm,
          request.username,
          request.permlink,
          request.title || '',
          request.body,
          request.json_metadata,
          request.comment_options || '',
        );
      } else {
        return BloggingUtils.getPostOperation(
          request.parent_username || '',
          request.parent_perm,
          request.username,
          request.permlink,
          request.title || '',
          request.body,
          request.json_metadata,
        );
      }
    case KeychainRequestTypes.broadcast:
      return request.operations;
    default:
      return null;
  }
};

const signRequest = async (
  request: KeychainRequest,
  domain: string,
  tab: number,
): Promise<SIGN_WAIT> => {
  if (!request.username) {
    throw new Error('Username is required');
  }

  let op = null;

  const keyType = getRequiredWifType(request);
  op = await getRequestOperation(request);
  op = sanitizeOperation(op);
  console.log('signRequest op:', { op });
  const sign_req_data: SIGN_REQ_DATA = {
    key_type: keyType,
    ops: op,
    broadcast: true,
    nonce: Date.now(),
  };
  const { encryptedSignRequestData, token } =
    await KeylessKeychainUtils.encryptSignRequestData(
      request.username,
      domain,
      sign_req_data,
    );
  const sign_req: SIGN_REQ = {
    cmd: HAS_CMD.SIGN_REQ,
    account: request.username,
    data: encryptedSignRequestData,
    token,
  };
  ws.send(JSON.stringify(sign_req));
  return new Promise<SIGN_WAIT>((resolve, reject) => {
    const signWaitHandler = async (event: MessageEvent) => {
      const response = JSON.parse(event.data);
      if (response.cmd === HAS_CMD.SIGN_WAIT) {
        ws.removeEventListener('message', signWaitHandler);
        try {
          await handleSignWait(request, domain, tab, response);
          resolve(response as SIGN_WAIT);
        } catch (error) {
          reject(error);
        }
      }
    };

    ws.addEventListener('message', signWaitHandler);

    // Add timeout to prevent infinite waiting
    setTimeout(() => {
      ws.removeEventListener('message', signWaitHandler);
      reject(new Error('Sign wait timeout'));
    }, 30000); // 30 second timeout
  });
};

const sanitizeOperation = (op: any) => {
  try {
    console.log('sanitizeOperation op:', { op });
    if (!op) {
      throw new Error('Invalid request type');
    }
    if (!Array.isArray(op)) {
      throw new Error('Operation must be an array');
    }

    if (op.length === 0) {
      throw new Error('Operation array cannot be empty');
    }

    if (op.length >= 1 && Array.isArray(op[0])) {
      return op;
    }

    return [op];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid operation format');
  }
};

const handleSignWait = async (
  request: KeychainRequest,
  domain: string,
  tab: number,
  sign_wait: SIGN_WAIT,
) => {
  return new Promise<void>((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data);

        if (
          response.cmd === HAS_CMD.SIGN_ACK &&
          response.uuid === sign_wait.uuid
        ) {
          // Remove the event listener since we got our response
          ws.removeEventListener('message', handleMessage);

          // Handle the successful sign ack
          sendResponseToDapp(request, domain, tab, response, false)
            .then(() => resolve())
            .catch((error) => reject(error));
        } else if (
          response.cmd === HAS_CMD.SIGN_NACK &&
          response.uuid === sign_wait.uuid
        ) {
          // Remove the event listener since we got our response
          ws.removeEventListener('message', handleMessage);

          // Handle the failed sign ack
          sendResponseToDapp(
            request,
            domain,
            tab,
            response,
            new Error('Sign request was rejected'),
          )
            .then(() => reject(new Error('Sign request was rejected')))
            .catch((error) => reject(error));
        }
      } catch (error) {
        console.error('Error processing sign message:', error);
      }
    };

    // Add the event listener
    ws.addEventListener('message', handleMessage);

    // Set up expiration timeout
    const timeout = sign_wait.expire - Date.now();
    if (timeout <= 0) {
      ws.removeEventListener('message', handleMessage);
      reject(new Error('Sign wait request has already expired'));
      return;
    }

    const expirationTimer = setTimeout(() => {
      ws.removeEventListener('message', handleMessage);
      reject(new Error('Sign wait request expired'));
    }, timeout);

    // Clean up on promise resolution
    const cleanup = () => {
      clearTimeout(expirationTimer);
      ws.removeEventListener('message', handleMessage);
    };

    // Ensure cleanup happens whether we resolve or reject
    resolve = ((originalResolve) => {
      return (...args) => {
        cleanup();
        return originalResolve(...args);
      };
    })(resolve);

    reject = ((originalReject) => {
      return (...args) => {
        cleanup();
        return originalReject(...args);
      };
    })(reject);
  });
};

const sendResponseToDapp = async (
  request: KeychainRequest,
  domain: string,
  tab: number,
  response: SIGN_ACK,
  error?: any,
) => {
  const result = {
    id: response.uuid,
    tx_id: response.data,
  };
  console.log('sendResponseToDapp result:', { result });
  // Determine if the operation was successful
  const success = !error && response.broadcast === true;

  const message = await createMessage(
    error,
    result,
    request,
    success
      ? await chrome.i18n.getMessage('bgd_ops_keyless_broadcast_success')
      : error?.message || 'Operation failed',
    error?.message || null,
  );

  console.log('sendResponseToDapp message:', { message });
  chrome.tabs.sendMessage(tab, message);
};

const HASUtils = {
  authenticate,
  connect,
  generateAuthPayloadURI,
  listenToAuthAck,
  signRequest,
};

export default HASUtils;
