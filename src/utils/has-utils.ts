import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
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
  CHALLENGE_ACK,
  CHALLENGE_ACK_DATA,
  CHALLENGE_NACK,
  CHALLENGE_REQ,
  CHALLENGE_REQ_DATA,
  CHALLENGE_WAIT,
  HAS_CMD,
  SIGN_ACK,
  SIGN_NACK,
  SIGN_REQ,
  SIGN_REQ_DATA,
  SIGN_WAIT,
} from '@interfaces/has.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import {
  KeylessAuthData,
  KeylessRequest,
} from '@interfaces/keyless-keychain.interface';
import { KeyType } from '@interfaces/keys.interface';
import { ConversionType } from '@popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { AccountCreationUtils } from '@popup/hive/utils/account-creation.utils';
import { BloggingUtils } from '@popup/hive/utils/blogging.utils';
import { ConversionUtils } from '@popup/hive/utils/conversion.utils';
import { CustomJsonUtils } from '@popup/hive/utils/custom-json.utils';
import { DelegationUtils } from '@popup/hive/utils/delegation.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { PowerUtils } from '@popup/hive/utils/power.utils';
import ProposalUtils from '@popup/hive/utils/proposal.utils';
import ProxyUtils from '@popup/hive/utils/proxy.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import TransferUtils from '@popup/hive/utils/transfer.utils';
import WitnessUtils from '@popup/hive/utils/witness.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { KeychainKeyTypes, RequestSignBuffer } from 'hive-keychain-commons';
import Config from 'src/config';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { DynamicGlobalPropertiesUtils } from 'src/popup/hive/utils/dynamic-global-properties.utils';
import Logger from 'src/utils/logger.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';

let ws: WebSocket | null = null;
let reconnectInterval = 1000;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;

const setupWebSocketHandlers = (
  resolve: () => void,
  reject: (error: any) => void,
) => {
  if (!ws) return;

  ws.onopen = () => {
    reconnectInterval = 1000; // Reset the reconnection delay
    connectionAttempts = 0; // Reset connection attempts on successful connection
    resolve();
  };

  ws.onmessage = (event) => {
    // console.log('Message from server:', event.data);
  };

  ws.onclose = async (event) => {
    connectionAttempts++;

    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      // Send ANSWER_REQUEST message after 5 failed attempts
      chrome.runtime.sendMessage({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          message: await chrome.i18n.getMessage(
            'dialog_hiveauth_connection_failed',
          ),
          error: 'connection_failed',
        },
      });
      return; // Stop trying to reconnect
    }

    setTimeout(connect, reconnectInterval); // Attempt to reconnect
    reconnectInterval = Math.min(reconnectInterval * 2, 30000); // Exponential backoff, max 30 seconds
  };

  ws.onerror = (error) => {
    reject(error);
  };
};

const connect = (): Promise<void> => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    ws = new WebSocket(Config.keyless.host);
    setupWebSocketHandlers(resolve, reject);
  });
};

const sendMessage = (message: any) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket is not connected');
  }
  ws.send(JSON.stringify(message));
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
    challenge:
      keylessRequest.request.type === 'signBuffer'
        ? {
            challenge: (keylessRequest.request as RequestSignBuffer).message,
            key_type: (
              (keylessRequest.request as RequestSignBuffer).method as string
            ).toLowerCase(),
          }
        : undefined,
  };
  // Note: the auth_req_data does not need to be converted to base64 before encryption as
  // it will be converted to base64 by the encryption.
  const auth_req_data_string = JSON.stringify(auth_req_data);
  const auth_req_data_encrypted = await EncryptUtils.encryptNoIV(
    auth_req_data_string,
    keylessRequest.authKey,
  );
  const auth_req: AUTH_REQ = {
    cmd: HAS_CMD.AUTH_REQ,
    account: keylessRequest.request.username,
    data: auth_req_data_encrypted,
  };

  // Send the authentication request
  sendMessage(auth_req);

  // Return a promise that resolves with the AUTH_WAIT message
  return new Promise<AUTH_WAIT>((resolve, reject) => {
    if (!ws) {
      reject(new Error('WebSocket is not connected'));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.cmd === HAS_CMD.AUTH_WAIT) {
        // AUTH_WAIT received
        ws?.removeEventListener('message', handleMessage);
        resolve(message as AUTH_WAIT);
      } else if (
        message.cmd === HAS_CMD.AUTH_NACK ||
        message.cmd === 'auth_err'
      ) {
        // Authentication failed or error
        ws?.removeEventListener('message', handleMessage);
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
  requestHandler: RequestsHandler,
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

  if (!ws) {
    throw new Error('WebSocket is not connected');
  }

  // Start listening for messages immediately
  const handleMessage = async (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      Logger.log('listenToAuthAck message:', { message });
      if (message.cmd === HAS_CMD.AUTH_ACK) {
        ws?.removeEventListener('message', handleMessage);
        try {
          await handleAuthAck(
            requestHandler,
            username,
            keylessRequest,
            message as AUTH_ACK,
            tab,
          );
        } catch (error) {
          Logger.error('Error handling auth ack:', error);
          throw error;
        }
      } else if (
        message.cmd === HAS_CMD.AUTH_NACK ||
        message.cmd === 'auth_err'
      ) {
        ws?.removeEventListener('message', handleMessage);
        try {
          await handleAuthNack(username, message as AUTH_NACK);
        } catch (error) {
          Logger.error('Error handling auth nack:', error);
          throw error;
        }
      }
    } catch (error) {
      Logger.error('Error processing message:', error);
      throw error;
    }
  };

  ws.addEventListener('message', handleMessage);

  // Return immediately without waiting
  return Promise.resolve();
};

interface AuthAckError extends Error {
  code: string;
}

class AuthAckError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthAckError';
  }
}

const validateAuthAckData = (
  auth_ack: AUTH_ACK,
  keylessRequest: KeylessRequest,
): AUTH_ACK_DATA => {
  if (!auth_ack?.data) {
    throw new AuthAckError('Invalid auth acknowledgement data', 'INVALID_DATA');
  }

  const auth_ack_data: AUTH_ACK_DATA =
    typeof auth_ack.data === 'string'
      ? JSON.parse(
          EncryptUtils.decryptNoIV(auth_ack.data, keylessRequest.authKey),
        )
      : auth_ack.data;

  if (!auth_ack_data?.expire) {
    throw new AuthAckError(
      'Missing expiration in auth acknowledgement data',
      'MISSING_EXPIRATION',
    );
  }

  if (keylessRequest.uuid !== auth_ack.uuid) {
    throw new AuthAckError(
      'Invalid auth acknowledgement data',
      'UUID_MISMATCH',
    );
  }

  return auth_ack_data;
};

const updateKeylessRequestData = (
  keylessRequest: KeylessRequest,
  auth_ack_data: AUTH_ACK_DATA,
): KeylessAuthData => {
  keylessRequest.expire = auth_ack_data.expire;
  keylessRequest.token = auth_ack_data.token;

  return {
    uuid: keylessRequest.uuid,
    appName: keylessRequest.appName,
    authKey: keylessRequest.authKey,
    expire: keylessRequest.expire,
    token: keylessRequest.token,
  };
};

const handleSignBufferRequest = async (
  keylessRequest: KeylessRequest,
  auth_ack_data: AUTH_ACK_DATA,
  tab: number,
): Promise<void> => {
  const message = await createMessage(
    null,
    auth_ack_data.challenge.challenge,
    keylessRequest.request,
    await chrome.i18n.getMessage('bgd_ops_sign_success'),
    null,
    auth_ack_data.challenge.pubkey,
  );

  await Promise.all([
    chrome.runtime.sendMessage(message),
    chrome.tabs.sendMessage(tab, message),
  ]);
};

const handleSignRequest = async (
  requestHandler: RequestsHandler,
  keylessRequest: KeylessRequest,
  tab: number,
): Promise<void> => {
  const sign_wait = await signRequest(
    requestHandler,
    requestHandler.data.request!,
    keylessRequest.appName,
    tab,
  );

  if (!ws) {
    throw new Error('WebSocket is not connected');
  }

  const signResponse = await new Promise<SIGN_ACK>((resolve) => {
    const handleSignMessage = (event: MessageEvent) => {
      const response = JSON.parse(event.data) as SIGN_ACK;
      if (response.cmd === HAS_CMD.SIGN_ACK) {
        ws?.removeEventListener('message', handleSignMessage);
        resolve(response);
      }
    };
    ws?.addEventListener('message', handleSignMessage);
  });

  const message = await createMessage(
    null,
    signResponse,
    requestHandler.data.request!,
    await chrome.i18n.getMessage('bgd_ops_sign_success'),
    null,
    null,
  );

  await Promise.all([
    chrome.runtime.sendMessage(message),
    chrome.tabs.sendMessage(tab, message),
  ]);
};

const handleEncodeDecodeRequest = async (
  requestHandler: RequestsHandler,
  keylessRequest: KeylessRequest,
  tab: number,
): Promise<void> => {
  await challengeRequest(
    requestHandler,
    requestHandler.data.request!,
    keylessRequest.appName,
    tab,
  );
};

const handleAuthAck = async (
  requestHandler: RequestsHandler,
  username: string,
  keylessRequest: KeylessRequest,
  auth_ack: AUTH_ACK,
  tab: number,
): Promise<void> => {
  try {
    const auth_ack_data = validateAuthAckData(auth_ack, keylessRequest);

    const keylessAuthData = updateKeylessRequestData(
      keylessRequest,
      auth_ack_data,
    );
    await KeylessKeychainUtils.storeKeylessAuthData(username, keylessAuthData);

    // Add delay before proceeding
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Send success message for authentication
    chrome.runtime.sendMessage({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        message: 'Keyless Authentication Success',
      },
    });

    // Handle different request types
    if (requestHandler.data.request?.type === KeychainRequestTypes.signBuffer) {
      await handleSignBufferRequest(keylessRequest, auth_ack_data, tab);
    } else if (
      requestHandler.data.request?.type === KeychainRequestTypes.encode ||
      requestHandler.data.request?.type === KeychainRequestTypes.decode
    ) {
      await handleEncodeDecodeRequest(requestHandler, keylessRequest, tab);
    } else {
      await handleSignRequest(requestHandler, keylessRequest, tab);
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const message = await createMessage(
      error,
      null,
      requestHandler.data.request!,
      null,
      errorMessage,
      null,
    );

    await Promise.all([
      chrome.runtime.sendMessage(message),
      chrome.tabs.sendMessage(tab, message),
    ]);

    throw new AuthAckError(
      `Failed to update keyless auth data: ${errorMessage}`,
      error instanceof AuthAckError ? error.code : 'UNKNOWN_ERROR',
    );
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
    case KeychainRequestTypes.delegation:
      const delegatedVests = await calculateVests(
        request.amount + ' ' + request.unit,
        request.unit,
      );
      return DelegationUtils.getDelegationOperation(
        request.delegatee!,
        request.username!,
        delegatedVests,
      );
    case KeychainRequestTypes.witnessVote:
      return WitnessUtils.getWitnessVoteOperation(
        request.vote,
        request.username!,
        request.witness!,
      );
    case KeychainRequestTypes.powerUp:
      return PowerUtils.getPowerUpOperation(
        request.username!,
        request.recipient!,
        request.hive + ' ' + 'HIVE',
      );
    case KeychainRequestTypes.powerDown:
      const vestingShares = await calculateVests(request.hive_power, 'HP');
      return PowerUtils.getPowerDownOperation(request.username!, vestingShares);
    case KeychainRequestTypes.recurrentTransfer:
      return TransferUtils.getRecurrentTransferOperation(
        request.username!,
        request.to!,
        request.amount + ' ' + request.currency,
        request.memo,
        request.recurrence,
        request.executions,
      );
    case KeychainRequestTypes.proxy:
      return ProxyUtils.getSetProxyOperation(request.proxy!, request.username!);
    case KeychainRequestTypes.createProposal:
      return ProposalUtils.getCreateProposalOperation(
        request.username!,
        request.receiver!,
        request.start!,
        request.end!,
        request.daily_pay!,
        request.subject!,
        request.permlink!,
        request.extensions!,
      );
    case KeychainRequestTypes.updateProposalVote:
      return ProposalUtils.getUpdateProposalVoteOperation(
        typeof request.proposal_ids === 'string'
          ? JSON.parse(request.proposal_ids)
          : request.proposal_ids,
        request.approve!,
        request.username!,
      );
    case KeychainRequestTypes.removeProposal:
      return ProposalUtils.getRemoveProposalOperation(
        request.username!,
        typeof request.proposal_ids === 'string'
          ? JSON.parse(request.proposal_ids)
          : request.proposal_ids,
        typeof request.extensions === 'string'
          ? JSON.parse(request.extensions)
          : request.extensions,
      );
    case KeychainRequestTypes.sendToken:
      return TokensUtils.getSendTokenOperation(
        request.currency,
        request.to!,
        request.amount + ' ' + request.currency,
        request.memo,
        request.username!,
      );
    case KeychainRequestTypes.convert:
      return ConversionUtils.getConvertOperation(
        request.username!,
        request.request_id,
        request.amount + ' ' + (request.collaterized ? 'HIVE' : 'HBD'),
        request.collaterized
          ? ConversionType.CONVERT_HIVE_TO_HBD
          : ConversionType.CONVERT_HBD_TO_HIVE,
      );
    case KeychainRequestTypes.createClaimedAccount:
      return AccountCreationUtils.getCreateClaimedAccountOperation(
        {
          owner: JSON.parse(request.owner!),
          active: JSON.parse(request.active!),
          posting: JSON.parse(request.posting!),
          memo_key: request.memo!,
        },
        request.new_account!,
        request.username!,
      );
    case KeychainRequestTypes.addAccountAuthority:
      const addAuthUserAccount = await AccountUtils.getExtendedAccount(
        request.username!,
      );
      const { active: addActive, posting: addPosting } =
        await AccountUtils.processAuthorityUpdate(
          addAuthUserAccount,
          request.role!.toLowerCase() as 'posting' | 'active',
          request.authorizedUsername!,
          request.weight,
        );
      return AccountUtils.getUpdateAccountOperation(
        request.username!,
        addActive,
        addPosting,
        addAuthUserAccount.memo_key,
        addAuthUserAccount.json_metadata,
      );
    case KeychainRequestTypes.removeAccountAuthority:
      const removeAuthUserAccount = await AccountUtils.getExtendedAccount(
        request.username!,
      );
      const { active: removeActive, posting: removePosting } =
        await AccountUtils.processAuthorityRemoval(
          removeAuthUserAccount,
          request.role!.toLowerCase() as 'posting' | 'active',
          request.authorizedUsername!,
        );
      return AccountUtils.getUpdateAccountOperation(
        request.username!,
        removeActive,
        removePosting,
        removeAuthUserAccount.memo_key,
        removeAuthUserAccount.json_metadata,
      );
    case KeychainRequestTypes.addKeyAuthority:
      const addKeyUserAccount = await AccountUtils.getExtendedAccount(
        request.username!,
      );
      const { active: addKeyActive, posting: addKeyPosting } =
        await AccountUtils.processKeyAuthorityUpdate(
          addKeyUserAccount,
          request.role!.toLowerCase() as 'posting' | 'active',
          request.authorizedKey!,
          request.weight,
        );
      return AccountUtils.getUpdateAccountOperation(
        request.username!,
        addKeyActive,
        addKeyPosting,
        addKeyUserAccount.memo_key,
        addKeyUserAccount.json_metadata,
      );
    case KeychainRequestTypes.removeKeyAuthority:
      const removeKeyUserAccount = await AccountUtils.getExtendedAccount(
        request.username!,
      );
      const { active: removeKeyActive, posting: removeKeyPosting } =
        await AccountUtils.processKeyAuthorityRemoval(
          removeKeyUserAccount,
          request.role!.toLowerCase() as 'posting' | 'active',
          request.authorizedKey!,
        );
      return AccountUtils.getUpdateAccountOperation(
        request.username!,
        removeKeyActive,
        removeKeyPosting,
        removeKeyUserAccount.memo_key,
        removeKeyUserAccount.json_metadata,
      );
    case KeychainRequestTypes.custom:
      return CustomJsonUtils.getCustomJsonOperation(
        request.json,
        request.username!,
        request.method === KeychainKeyTypes.posting
          ? KeyType.POSTING
          : KeyType.ACTIVE,
      );

    default:
      return null;
  }
};

const signRequest = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  domain: string,
  tab: number,
): Promise<void> => {
  if (!request.username) {
    throw new Error('Username is required');
  }

  if (!ws) {
    throw new Error('WebSocket is not connected');
  }

  let op = null;
  const keyType = getRequiredWifType(request);
  op = await getRequestOperation(request);
  op = sanitizeOperation(op);
  const sign_req_data: SIGN_REQ_DATA = {
    key_type: keyType,
    ops: op,
    broadcast: true,
    nonce: Date.now(),
  };
  const { encryptedHiveAuthRequestData, keylessAuthData } =
    await KeylessKeychainUtils.encryptHiveAuthRequestData(
      request.username,
      domain,
      sign_req_data,
    );
  const sign_req: SIGN_REQ = {
    cmd: HAS_CMD.SIGN_REQ,
    account: request.username,
    data: encryptedHiveAuthRequestData,
    token: keylessAuthData.token,
  };
  sendMessage(sign_req);

  // Wait for the sign response and handle it through handleSignWait
  const signWaitHandler = async (event: MessageEvent) => {
    const response = JSON.parse(event.data) as SIGN_WAIT;
    if (response.cmd === HAS_CMD.SIGN_WAIT) {
      ws?.removeEventListener('message', signWaitHandler);
      await handleSignWait(request, domain, tab, response, keylessAuthData);
    }
  };

  ws.addEventListener('message', signWaitHandler);
};

const handleSignWait = async (
  request: KeychainRequest,
  domain: string,
  tab: number,
  sign_wait: SIGN_WAIT,
  keylessAuthData: KeylessAuthData,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (!ws) {
      reject(new Error('WebSocket is not connected'));
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data) as SIGN_ACK | SIGN_NACK;

        if (
          response.cmd === HAS_CMD.SIGN_ACK &&
          response.uuid === sign_wait.uuid
        ) {
          // Remove the event listener since we got our response
          ws?.removeEventListener('message', handleMessage);

          // Handle the successful sign ack
          await sendResponseToDapp(request, domain, tab, response, false);

          // Send success message to runtime
          chrome.runtime.sendMessage({
            command: DialogCommand.ANSWER_REQUEST,
            msg: {
              success: true,
              message: await chrome.i18n.getMessage('bgd_ops_sign_success'),
              result: response,
            },
          });
          resolve();
        } else if (
          response.cmd === HAS_CMD.SIGN_NACK &&
          response.uuid === sign_wait.uuid
        ) {
          // Remove the event listener since we got our response
          ws?.removeEventListener('message', handleMessage);

          // Handle the failed sign ack
          const errorResponse: SIGN_ACK = {
            cmd: HAS_CMD.SIGN_ACK,
            uuid: response.uuid,
            broadcast: false,
            data: response.data || '',
          };
          const error = new Error(response.data || 'Sign request was rejected');

          // Send error message to both runtime and tab
          await sendResponseToDapp(request, domain, tab, errorResponse, error);

          // Send message to runtime
          chrome.runtime.sendMessage({
            command: DialogCommand.ANSWER_REQUEST,
            msg: {
              success: false,
              message: error.message,
              error: error.message,
            },
          });
          reject(error);
        }
      } catch (error) {
        reject(error);
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
      ws?.removeEventListener('message', handleMessage);
      reject(new Error('Sign wait request expired'));
    }, timeout);

    // Clean up on promise resolution
    const cleanup = () => {
      clearTimeout(expirationTimer);
      ws?.removeEventListener('message', handleMessage);
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

const challengeRequest = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  domain: string,
  tab: number,
) => {
  if (!ws) {
    throw new Error('WebSocket is not connected');
  }

  const challenge_req_data: CHALLENGE_REQ_DATA = {
    key_type: getRequiredWifType(request).toLowerCase(),
    challenge: (request as RequestSignBuffer).message,
    decrypt: request.type === KeychainRequestTypes.decode,
    nonce: Date.now(),
  };
  const { encryptedHiveAuthRequestData, keylessAuthData } =
    await KeylessKeychainUtils.encryptHiveAuthRequestData(
      request.username!,
      domain,
      challenge_req_data,
    );
  const challenge_req: CHALLENGE_REQ = {
    cmd: HAS_CMD.CHALLENGE_REQ,
    account: request.username!,
    data: encryptedHiveAuthRequestData,
    token: keylessAuthData.token,
  };
  sendMessage(challenge_req);

  return new Promise<CHALLENGE_WAIT>((resolve, reject) => {
    const challengeWaitHandler = async (event: MessageEvent) => {
      const response = JSON.parse(event.data) as CHALLENGE_WAIT;
      if (response.cmd === HAS_CMD.CHALLENGE_WAIT) {
        ws?.removeEventListener('message', challengeWaitHandler);
        await handleChallengeWait(
          requestHandler,
          request,
          domain,
          tab,
          response,
          keylessAuthData,
        );
        resolve(response as CHALLENGE_WAIT);
      } else if (
        response.cmd === HAS_CMD.CHALLENGE_NACK ||
        response.cmd === 'challenge_err'
      ) {
        ws?.removeEventListener('message', challengeWaitHandler);
        reject(new Error('Challenge request failed'));
      }
    };

    ws?.addEventListener('message', challengeWaitHandler);

    // Add timeout to prevent infinite waiting
    setTimeout(() => {
      ws?.removeEventListener('message', challengeWaitHandler);
      reject(new Error('Challenge wait timeout'));
    }, 30000); // 30 second timeout
  });
};

const handleChallengeWait = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  domain: string,
  tab: number,
  challenge_wait: CHALLENGE_WAIT,
  keylessAuthData: KeylessAuthData,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (!ws) {
      reject(new Error('WebSocket is not connected'));
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      try {
        const challenge_ack = JSON.parse(event.data) as
          | CHALLENGE_ACK
          | CHALLENGE_NACK;
        if (challenge_ack.cmd === HAS_CMD.CHALLENGE_ACK) {
          if (challenge_wait.uuid === challenge_ack.uuid) {
            // Remove the event listener since we got our response
            ws?.removeEventListener('message', handleMessage);
            await handleChallengeAck(
              requestHandler,
              request,
              domain,
              tab,
              challenge_ack,
              keylessAuthData,
            );
            resolve();
          }
        } else if (challenge_ack.cmd === HAS_CMD.CHALLENGE_NACK) {
          // Remove the event listener since we got an error response
          ws?.removeEventListener('message', handleMessage);
          await handleChallengeNack(
            requestHandler,
            request,
            domain,
            tab,
            challenge_ack,
          );
          reject(new Error('Challenge request failed'));
        }
      } catch (error) {
        reject(error);
      }
    };

    // Add the event listener
    ws?.addEventListener('message', handleMessage);

    // Set up expiration timeout
    const timeout = challenge_wait.expire - Date.now();
    if (timeout <= 0) {
      ws?.removeEventListener('message', handleMessage);
      reject(new Error('Challenge wait request has already expired'));
      return;
    }

    const expirationTimer = setTimeout(() => {
      ws?.removeEventListener('message', handleMessage);
      reject(new Error('Challenge wait request expired'));
    }, timeout);

    // Clean up on promise resolution
    const cleanup = () => {
      clearTimeout(expirationTimer);
      ws?.removeEventListener('message', handleMessage);
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

const sanitizeOperation = (op: any) => {
  try {
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

const sendResponseToDapp = async (
  request: KeychainRequest,
  domain: string,
  tab: number,
  response: SIGN_ACK | SIGN_NACK | CHALLENGE_ACK_DATA | CHALLENGE_NACK,
  error?: any,
) => {
  // Determine if the operation was successful
  const success =
    !error && ('broadcast' in response ? response.broadcast === true : true);

  const message = await createMessage(
    error,
    'challenge' in response && response.challenge
      ? response.challenge
      : response,
    request,
    success
      ? await chrome.i18n.getMessage('bgd_ops_keyless_broadcast_success')
      : error?.message || 'Operation failed',
    error?.message || null,
    'challenge' in response && response.challenge ? response.pubkey : null,
  );

  chrome.tabs.sendMessage(tab, message);
};

/**
 * Calculates the vesting shares for a given amount in HP or VESTS.
 * @param amount The amount as a string (e.g., '10.000').
 * @param unit The unit of the amount ('HP' or 'VESTS').
 * @returns The calculated vesting shares as a string with 6 decimals and ' VESTS' suffix (e.g., '123.456789 VESTS').
 */
const calculateVests = async (
  amount: string,
  unit: string,
): Promise<string> => {
  if (unit === 'HP') {
    const global =
      await DynamicGlobalPropertiesUtils.getDynamicGlobalProperties();
    const totalHive = global.total_vesting_fund_hive
      ? Number((global.total_vesting_fund_hive as string).split(' ')[0])
      : Number(global.total_vesting_fund_hive.split(' ')[0]);
    const totalVests = Number(
      (global.total_vesting_shares as string).split(' ')[0],
    );
    const vests = (parseFloat(amount) * totalVests) / totalHive;
    return vests.toFixed(6) + ' VESTS';
  } else {
    const value = amount.includes('VESTS') ? amount : amount + ' VESTS';
    const numericValue = parseFloat(value);
    return numericValue.toFixed(6) + ' VESTS';
  }
};

const handleChallengeAck = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  domain: string,
  tab: number,
  challenge_ack: CHALLENGE_ACK,
  keylessAuthData: KeylessAuthData,
): Promise<void> => {
  try {
    const challenge_ack_data: CHALLENGE_ACK_DATA =
      typeof challenge_ack.data === 'string'
        ? JSON.parse(
            EncryptUtils.decryptNoIV(
              challenge_ack.data,
              keylessAuthData.authKey,
            ),
          )
        : challenge_ack.data;
    sendResponseToDapp(request, domain, tab, challenge_ack_data);

    // Send message to runtime if request is anonymous
    if (
      requestHandler.data.isAnonymous ||
      request.type === KeychainRequestTypes.encode ||
      request.type === KeychainRequestTypes.decode
    ) {
      chrome.runtime.sendMessage({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          message: await chrome.i18n.getMessage('bgd_ops_challenge_success', [
            request.type.charAt(0).toUpperCase() +
              request.type.slice(1).toLowerCase(),
          ]),
          result: challenge_ack_data,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

const handleChallengeNack = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  domain: string,
  tab: number,
  challenge_nack: CHALLENGE_NACK,
) => {
  const error = new Error(challenge_nack.data || 'Challenge request failed');
  sendResponseToDapp(request, domain, tab, challenge_nack, error);

  // Send message to runtime if request is anonymous
  if (requestHandler.data.isAnonymous) {
    chrome.runtime.sendMessage({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        message: error.message,
        error: error.message,
      },
    });
  }
};

const HASUtils = {
  authenticate,
  connect,
  generateAuthPayloadURI,
  listenToAuthAck,
  signRequest,
  challengeRequest,
};

export default HASUtils;
