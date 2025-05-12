import MkModule from '@background/hive/modules/mk.module';
import BgdAccountsUtils from '@background/hive/utils/accounts.utils';
import {
  BackgroundMessage,
  MultisigDialogMessage,
} from '@background/multichain/background-message.interface';
import { waitUntilDialogIsReady } from '@background/utils/window.utils';
import type { SignedTransaction } from '@hiveio/dhive';
import { TransactionOptionsMetadata } from '@interfaces/keys.interface';
import {
  ConnectDisconnectMessage,
  MultisigAcceptRejectTxData,
  MultisigAccountConfig,
  MultisigConfig,
  MultisigData,
  MultisigDataType,
  MultisigDisplayMessageData,
  MultisigRequestSignatures,
  MultisigStep,
  NotifyTxBroadcastedMessage,
  RequestSignatureMessage,
  RequestSignatureSigner,
  SignTransactionMessage,
  SignatureRequest,
  Signer,
  SignerConnectMessage,
  SignerConnectResponse,
  SocketMessageCommand,
} from '@interfaces/multisig.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import MkUtils from '@popup/hive/utils/mk.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  DialogCommand,
  MultisigDialogCommand,
} from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainKeyTypes, KeychainKeyTypesLC } from 'hive-keychain-commons';
import { Socket, io } from 'socket.io-client';
import Config from 'src/config';
import { AsyncUtils } from 'src/utils/async.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
const signature = require('@hiveio/hive-js/lib/auth/ecc');

let socket: Socket;
let shouldReconnectSocket: boolean = false;
let connectedPublicKeys: SignerConnectMessage[] = [];
const lockedRequests: number[] = [];

const start = async () => {
  Logger.info(`Starting multisig`);

  socket = io(Config.multisig.baseURL, {
    transports: ['websocket'],
    reconnection: true,
    autoConnect: false,
  });

  const multisigConfig: MultisigConfig =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.MULTISIG_CONFIG,
    );

  if (
    multisigConfig &&
    Object.values(multisigConfig).some(
      (config) =>
        config.isEnabled &&
        (config.active.isEnabled || config.posting.isEnabled),
    )
  ) {
    Logger.info('Some accounts need connection');
    shouldReconnectSocket = true;
    if (!socket.connected) socket.connect();
    connectSocket(multisigConfig);
  } else {
    Logger.info('Multisig hasnt been enabled for any account');
  }

  setupPopupListener();
  setupRefreshConnections();
};

const setupRefreshConnections = () => {
  chrome.runtime.onMessage.addListener(
    async (
      backgroundMessage: BackgroundMessage,
      sender: chrome.runtime.MessageSender,
      sendResp: (response?: any) => void,
    ) => {
      if (
        backgroundMessage.command ===
        BackgroundCommand.MULTISIG_REFRESH_CONNECTIONS
      ) {
        const value = backgroundMessage.value as ConnectDisconnectMessage;
        const multisigConfig: MultisigConfig =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.MULTISIG_CONFIG,
          );
        const accountMultisigConfig = multisigConfig[value.account];
        if (value.connect) {
          if (!socket.connected) socket.connect();
          await AsyncUtils.sleep(1000);
          connectSocket(multisigConfig);
          shouldReconnectSocket = true;
          connectToBackend(value.account, accountMultisigConfig);
        } else {
          if (value.publicKey && value.publicKey.length > 0) {
            disconnectFromBackend(value.account, value.publicKey);
          } else {
            disconnectFromBackend(
              value.account,
              accountMultisigConfig.active.publicKey,
            );
            disconnectFromBackend(
              value.account,
              accountMultisigConfig.posting.publicKey,
            );
          }
        }
      }
    },
  );
};

const setupPopupListener = () => {
  chrome.runtime.onMessage.addListener(
    async (
      backgroundMessage: BackgroundMessage,
      sender: chrome.runtime.MessageSender,
      sendResp: (response?: any) => void,
    ) => {
      if (
        backgroundMessage.command ===
        BackgroundCommand.MULTISIG_REQUEST_SIGNATURES
      ) {
        const data = backgroundMessage.value as MultisigRequestSignatures;
        await createConnectionIfNeeded(data);
        requestSignatures(data, true);
      }
    },
  );
};

// When the socket has not been initialized because multisig is not enabled for any account
// this allows to create a connection on the go to wait for a multisig response
const createConnectionIfNeeded = async (data: MultisigRequestSignatures) => {
  if (!socket.connected) {
    shouldReconnectSocket = true;
    socket.connect();
    connectSocket({});
    await AsyncUtils.sleep(1000);
  }
  const config: MultisigConfig =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.MULTISIG_CONFIG,
    )) || {};
  if (
    !config[data.initiatorAccount.name]?.[
      data.method?.toLowerCase() as 'posting' | 'active'
    ].isEnabled
  ) {
    const config = {
      isEnabled: true,
      posting:
        data.method.toLowerCase() === 'posting'
          ? {
              isEnabled: true,
              publicKey: KeysUtils.getPublicKeyFromPrivateKeyString(data.key!)!,
              message: signMessage(
                data.initiatorAccount.name!,
                data.key?.toString()!,
              ),
            }
          : { isEnabled: false, message: '', publicKey: '' },
      active:
        data.method.toLowerCase() === 'active'
          ? {
              isEnabled: true,
              publicKey: KeysUtils.getPublicKeyFromPrivateKeyString(data.key!)!,
              message: signMessage(
                data.initiatorAccount.name!,
                data.key?.toString()!,
              ),
            }
          : { isEnabled: false, message: '', publicKey: '' },
    };
    await connectToBackend(data.initiatorAccount.name, config);

    await AsyncUtils.sleep(1000);
  }
};

const requestSignatures = async (
  data: MultisigRequestSignatures,
  useRuntimeMessages?: boolean,
) => {
  return new Promise(async (resolve, reject) => {
    await createConnectionIfNeeded(data);
    const message = await getRequestSignatureMessage(data);
    try {
      socket.volatile.emit(
        SocketMessageCommand.REQUEST_SIGNATURE,
        message,
        withTimeout(
          async (message: string) => {
            Logger.log({ multisigRequestSignatureResponse: message });
            if (useRuntimeMessages) {
              chrome.runtime.sendMessage({
                command: BackgroundCommand.MULTISIG_REQUEST_SIGNATURES_RESPONSE,
                value: {
                  message: 'multisig_transaction_sent_to_signers',
                },
              });
            } else {
              // resolve('multisig_transaction_sent_to_signers');
              // in this case try to wait for broadcast notification
              try {
                const { txId, id } = (await waitForBroadcastToBeDone()) as {
                  txId: string;
                  id: number;
                };
                if (!lockedRequests.includes(id)) {
                  lockedRequests.push(id);
                  resolve(txId);
                }
              } catch (err: any) {
                chrome.runtime.sendMessage({
                  command: DialogCommand.SEND_DIALOG_ERROR,
                  msg: { display_msg: await chrome.i18n.getMessage(err) },
                });
                resolve({ error: { message: err } });
              }
            }
          },
          () => {
            Logger.info('timeout in socketio');
          },
        ),
      );
    } catch (err) {
      Logger.error({ err });
    }
  });
};

const initAccountsConnections = async (multisigConfig: MultisigConfig) => {
  for (const accountName of Object.keys(multisigConfig)) {
    const multisigAccountConfig = multisigConfig[accountName];
    if (multisigAccountConfig && multisigAccountConfig.isEnabled) {
      connectToBackend(accountName, multisigAccountConfig);
    }
  }
};

const connectSocket = (multisigConfig: MultisigConfig) => {
  socket.removeAllListeners(SocketMessageCommand.REQUEST_SIGN_TRANSACTION);
  socket.removeAllListeners(
    SocketMessageCommand.TRANSACTION_BROADCASTED_NOTIFICATION,
  );
  socket.removeAllListeners(
    SocketMessageCommand.TRANSACTION_ERROR_NOTIFICATION,
  );
  socket.removeAllListeners('connect');
  socket.removeAllListeners('error');
  socket.removeAllListeners('disconnect');

  socket.on('connect', () => {
    Logger.info('Connected to socket');

    keepAlive();
    initAccountsConnections(multisigConfig);
  });
  socket.on('error', (err: any) => {
    Logger.error('Error in socket', err);
  });
  socket.on('disconnect', (ev: any) => {
    Logger.info('Disconnected from socket');
    socket.connect();
  });
  socket.on(
    SocketMessageCommand.REQUEST_SIGN_TRANSACTION,
    async (signatureRequest: SignatureRequest) => {
      const signerIndex = signatureRequest.signers.findIndex(
        (signer: Signer) => {
          return signer.publicKey === signatureRequest.targetedPublicKey;
        },
      );

      if (signerIndex === -1) {
        return;
      }
      const signer = signatureRequest.signers[signerIndex];
      await AsyncUtils.sleep(800 * (signerIndex + 2));

      const signedTransaction = await MultisigModule.processSignatureRequest(
        signatureRequest,
        signer,
      );

      chrome.runtime.sendMessage({
        command: MultisigDialogCommand.MULTISIG_SEND_DATA_TO_POPUP,
        value: {
          multisigStep: MultisigStep.SIGN_TRANSACTION_FEEDBACK,
          data: {
            message: 'multisig_dialog_transaction_signed_successfully',
            success: true,
            signer: signer,
          } as MultisigDisplayMessageData,
        },
      } as MultisigDialogMessage);

      if (signedTransaction) {
        socket.emit(
          SocketMessageCommand.SIGN_TRANSACTION,
          {
            signature: signedTransaction.signatures[0],
            signerId: signer.id,
            signatureRequestId: signatureRequest.id,
          } as SignTransactionMessage,
          async (signatures: string[]) => {
            Logger.info(
              `Should try to broadcast ${JSON.stringify(signedTransaction)}`,
            );
            const txResult =
              await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
                {
                  expiration: signedTransaction.expiration,
                  extensions: signedTransaction.extensions,
                  operations: signedTransaction.operations,
                  ref_block_num: signedTransaction.ref_block_num,
                  ref_block_prefix: signedTransaction.ref_block_prefix,
                },
                signatures,
                true,
              );
            if (txResult?.confirmed) {
              socket.emit(
                SocketMessageCommand.NOTIFY_TRANSACTION_BROADCASTED,
                {
                  signatureRequestId: signatureRequest.id,
                  txId: txResult.tx_id,
                } as NotifyTxBroadcastedMessage,
                () => {
                  Logger.info(`Notified`);
                },
              );
            }
          },
        );
      } else {
        //TODO  check if need to return if no rejected
      }
    },
  );

  socket.on(
    SocketMessageCommand.TRANSACTION_BROADCASTED_NOTIFICATION,
    async (signatureRequest: SignatureRequest, txId: string) => {
      Logger.log(
        `signature request ${signatureRequest.id} was broadcasted`,
        txId,
      );
      const transaction = await HiveTxUtils.getTransaction(txId);
      delete transaction.signatures;
      if (!lockedRequests.includes(signatureRequest.id)) {
        lockedRequests.push(signatureRequest.id);
        openWindow({
          multisigStep: MultisigStep.NOTIFY_TRANSACTION_BROADCASTED,
          data: {
            message: 'multisig_dialog_transaction_broadcasted',
            success: true,
            txId: txId,
            transaction: transaction,
          } as MultisigDisplayMessageData,
        });
      }
    },
  );
  socket.on(SocketMessageCommand.TRANSACTION_ERROR_NOTIFICATION, async (e) => {
    await AsyncUtils.sleep(200);
    if (!lockedRequests.includes(e.signatureRequest.id)) {
      lockedRequests.push(e.signatureRequest.id);
      openWindow({
        multisigStep: MultisigStep.NOTIFY_ERROR,
        data: {
          message: e.error.message,
          success: false,
        } as MultisigDisplayMessageData,
      });
    }
  });

  if (socket) {
    socket.connect();
  }
};

const disconnectFromBackend = async (
  accountName: string,
  publicKey: string,
) => {
  Logger.info(
    `Trying to disconnect @${accountName} (${publicKey}) from backend`,
  );
  connectedPublicKeys = connectedPublicKeys.filter(
    (pk) => pk.username === accountName && pk.publicKey === publicKey,
  );
  socket.emit(SocketMessageCommand.SIGNER_DISCONNECT, publicKey);
};

const connectToBackend = async (
  accountName: string,
  accountConfig: MultisigAccountConfig,
) => {
  Logger.info(`Connecting @${accountName} to the multisig backend server`);
  const signerConnectMessages: SignerConnectMessage[] = [];
  if (
    accountConfig.active?.isEnabled &&
    !connectedPublicKeys
      .map((cpk) => cpk.publicKey)
      .includes(accountConfig.active?.publicKey?.toString())
  ) {
    signerConnectMessages.push({
      username: accountName,
      publicKey: accountConfig.active.publicKey,
      message: accountConfig.active.message,
    });
  }
  if (
    accountConfig.posting?.isEnabled &&
    !connectedPublicKeys
      .map((cpk) => cpk.publicKey)
      .includes(accountConfig.posting?.publicKey?.toString())
  ) {
    signerConnectMessages.push({
      username: accountName,
      publicKey: accountConfig.posting.publicKey,
      message: accountConfig.posting.message,
    });
  }
  socket.emit(
    SocketMessageCommand.SIGNER_CONNECT,
    signerConnectMessages,
    (signerConnectResponse: SignerConnectResponse) => {
      for (const signer of signerConnectMessages) {
        if (
          !(
            signerConnectResponse.errors &&
            Object.keys(signerConnectResponse.errors).includes(signer.publicKey)
          )
        ) {
          connectedPublicKeys.push(signer);
        }
      }
    },
  );
};

const keepAlive = () => {
  const keepAliveIntervalId = setInterval(() => {
    if (socket) {
      socket.emit('ping');
    } else {
      clearInterval(keepAliveIntervalId);
    }
  }, 10 * 1000);
};

const getRequestSignatureMessage = async (
  data: MultisigRequestSignatures,
): Promise<RequestSignatureMessage> => {
  return new Promise(async (resolve, reject) => {
    const potentialSigners = await MultisigUtils.getPotentialSigners(
      data.transactionAccount,
      data.key,
      data.method,
    );

    const signers: RequestSignatureSigner[] = [];
    for (const [receiverPubKey, weight] of potentialSigners) {
      const metaData: TransactionOptionsMetadata = data.options?.metaData ?? {};
      const usernames = await KeysUtils.getKeyReferences([receiverPubKey]);
      let twoFACodes = {};
      if (data.options?.metaData?.twoFACodes) {
        twoFACodes = {
          [usernames[0]]: await encodeMetadata(
            data.options?.metaData?.twoFACodes[usernames[0]],
            data.key!.toString(),
            receiverPubKey,
          ),
        };
      }

      signers.push({
        encryptedTransaction: await encodeTransaction(
          data.transaction,
          data.key!.toString(),
          receiverPubKey,
        ),
        publicKey: receiverPubKey,
        weight: weight.toString(),
        metaData: { ...metaData, twoFACodes: twoFACodes },
      });
    }

    const publicKey = KeysUtils.getPublicKeyFromPrivateKeyString(
      data.key!.toString(),
    )!;

    const keyAuths =
      data.method === KeychainKeyTypes.active
        ? data.initiatorAccount.active.key_auths
        : data.initiatorAccount.posting.key_auths;

    const keyAuth = keyAuths.find(
      ([key, weight]) => key.toString() === publicKey.toString(),
    );

    const transactionAccountThreshold =
      data.method === KeychainKeyTypes.active
        ? data.initiatorAccount.active.weight_threshold
        : data.initiatorAccount.posting.weight_threshold;

    const request: RequestSignatureMessage = {
      initialSigner: {
        publicKey: publicKey,
        signature: data.signature,
        username: data.initiatorAccount.name,
        weight: keyAuth![1],
      },
      signatureRequest: {
        expirationDate: data.transaction.expiration,
        keyType: data.method,
        signers: signers,
        threshold: transactionAccountThreshold,
      },
    };

    resolve(request);
  });
};

const processSignatureRequest = async (
  signatureRequest: SignatureRequest,
  signer: Signer,
): Promise<SignedTransaction | undefined> => {
  if (signer) {
    const username = connectedPublicKeys.find(
      (c) => c.publicKey === signer.publicKey,
    )?.username;

    let mk = await MkModule.getMk();
    let openNewWindow = true;
    if (!mk) {
      mk = await unlockWallet(signer);
      openNewWindow = false;
    }

    const localAccounts = await BgdAccountsUtils.getAccountsFromLocalStorage(
      mk,
    );
    const localAccount = localAccounts.find((la) => la.name === username);
    const key =
      localAccount?.keys[
        signatureRequest.keyType.toLowerCase() as KeychainKeyTypesLC
      ]?.toString()!;
    const decodedTransaction = await decryptRequest(signer, key);
    if (decodedTransaction) {
      const signedTransaction = await requestSignTransactionFromUser(
        decodedTransaction,
        signer,
        signatureRequest,
        key,
        openNewWindow,
      );
      return signedTransaction;
    } else {
      return;
    }
  }
};

const unlockWallet = async (signer: Signer) => {
  return new Promise((resolve, reject) => {
    const onReceiveMK = async (
      backgroundMessage: BackgroundMessage,
      sender: chrome.runtime.MessageSender,
      sendResp: (response?: any) => void,
    ) => {
      if (
        backgroundMessage.command === BackgroundCommand.MULTISIG_UNLOCK_WALLET
      ) {
        if (backgroundMessage.value) {
          try {
            if (await MkUtils.login(backgroundMessage.value)) {
              resolve(backgroundMessage.value);
              chrome.runtime.onMessage.removeListener(onReceiveMK);
            } else {
              chrome.runtime.sendMessage({
                command: MultisigDialogCommand.MULTISIG_SEND_DATA_TO_POPUP,
                value: {
                  multisigStep: MultisigStep.UNLOCK_WALLET,
                  data: { feedback: 'wrong_password' },
                },
              });
            }
          } catch (err) {
            chrome.runtime.sendMessage({
              command: MultisigDialogCommand.MULTISIG_SEND_DATA_TO_POPUP,
              value: {
                multisigStep: MultisigStep.UNLOCK_WALLET,
                data: { feedback: 'wrong_password' },
              },
            });
          }
        } else {
          resolve(undefined);
        }
      }
    };
    chrome.runtime.onMessage.addListener(onReceiveMK);

    openWindow({
      multisigStep: MultisigStep.UNLOCK_WALLET,
      data: { signer: signer } as MultisigDataType,
    });
  });
};

const requestSignTransactionFromUser = (
  decodedTransaction: any,
  signer: Signer,
  signatureRequest: SignatureRequest,
  key: string,
  openNewWindow?: boolean,
): Promise<SignedTransaction | undefined> => {
  return new Promise(async (resolve, reject) => {
    const onReceivedMultisigAcceptResponse = async (
      backgroundMessage: BackgroundMessage,
      sender: chrome.runtime.MessageSender,
      sendResp: (response?: any) => void,
    ) => {
      if (
        backgroundMessage.command ===
          BackgroundCommand.MULTISIG_ACCEPT_RESPONSE &&
        backgroundMessage.value?.multisigData.data.signer.id === signer.id
      ) {
        if (backgroundMessage.value.accepted) {
          const signedTransaction = await HiveTxUtils.signTransaction(
            decodedTransaction,
            key,
          );
          resolve(signedTransaction as SignedTransaction);
          chrome.runtime.onMessage.removeListener(
            onReceivedMultisigAcceptResponse,
          );
        } else {
          resolve(undefined);
        }
      }
    };
    chrome.runtime.onMessage.addListener(onReceivedMultisigAcceptResponse);
    const usernames = await KeysUtils.getKeyReferences([signer.publicKey]);

    if (openNewWindow) {
      openWindow({
        multisigStep: MultisigStep.ACCEPT_REJECT_TRANSACTION,
        data: {
          username: usernames[0],
          signer,
          signatureRequest,
          decodedTransaction,
        } as MultisigAcceptRejectTxData,
      });
    } else {
      chrome.runtime.sendMessage({
        command: MultisigDialogCommand.MULTISIG_SEND_DATA_TO_POPUP,
        value: {
          multisigStep: MultisigStep.ACCEPT_REJECT_TRANSACTION,
          data: {
            username: usernames[0],
            signer,
            signatureRequest,
            decodedTransaction,
          } as MultisigAcceptRejectTxData,
        },
      });
    }
  });
};

const decryptRequest = async (signer: Signer, key: string) => {
  return await MultisigUtils.decodeTransaction(
    signer.encryptedTransaction,
    key,
  );
};

const encodeTransaction = async (
  transaction: any,
  key: string,
  receiverPublicKey: string,
): Promise<string> => {
  return await MultisigUtils.encodeTransaction(
    transaction,
    key,
    receiverPublicKey,
  );
};

const encodeMetadata = async (
  metaData: any,
  key: string,
  receiverPublicKey: string,
): Promise<string> => {
  return await MultisigUtils.encodeMetadata(metaData, key, receiverPublicKey);
};

const openWindow = (data: MultisigData): void => {
  chrome.windows.getCurrent(async (currentWindow) => {
    const win: chrome.windows.CreateData = {
      url: chrome.runtime.getURL('multisig-dialog.html'),
      type: 'popup',
      height: 600,
      width: 435,
      left: currentWindow.width! - 350 + currentWindow.left!,
      top: currentWindow.top!,
      focused: true,
    };
    // Except on Firefox
    //@ts-ignore
    if (typeof InstallTrigger === undefined) win.focused = true;
    chrome.windows.create(win, (window) => {
      waitUntilDialogIsReady(100, MultisigDialogCommand.READY_MULTISIG, () => {
        chrome.runtime.sendMessage({
          command: MultisigDialogCommand.MULTISIG_SEND_DATA_TO_POPUP,
          value: data,
        } as MultisigDialogMessage);
      });
    });
  });
};

const withTimeout = (
  onSuccess: any,
  onTimeout: any,
  timeout: number = 5000,
) => {
  let called = false;

  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);

  return (...args: any) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
  };
};

const waitForBroadcastToBeDone = async () => {
  return new Promise((resolve, reject) => {
    const broadcastedListener = async (
      signatureRequest: SignatureRequest,
      txId: string,
    ) => {
      socket.off(
        SocketMessageCommand.TRANSACTION_ERROR_NOTIFICATION,
        notifyError,
      );
      socket.off(
        SocketMessageCommand.TRANSACTION_BROADCASTED_NOTIFICATION,
        broadcastedListener,
      );
      resolve({ txId, id: signatureRequest.id });
    };

    const notifyError = async (res: any) => {
      socket.off(
        SocketMessageCommand.TRANSACTION_ERROR_NOTIFICATION,
        notifyError,
      );
      socket.off(
        SocketMessageCommand.TRANSACTION_BROADCASTED_NOTIFICATION,
        broadcastedListener,
      );
      if (!lockedRequests.includes(res.signatureRequest.id)) {
        lockedRequests.push(res.signatureRequest.id);
        reject(res.error.message);
      }
    };
    socket.on(
      SocketMessageCommand.TRANSACTION_BROADCASTED_NOTIFICATION,
      broadcastedListener,
    );
    socket.on(SocketMessageCommand.TRANSACTION_ERROR_NOTIFICATION, notifyError);
  });
};

setInterval(() => {
  if (shouldReconnectSocket && (!socket || !socket.connected)) {
    Logger.log('Restarting the socket');
    start();
  }
}, 60 * 1000);

const signMessage = (message: string, privateKey: string) => {
  let buf;
  try {
    const o = JSON.parse(message, (k, v) => {
      if (
        v !== null &&
        typeof v === 'object' &&
        'type' in v &&
        v.type === 'Buffer' &&
        'data' in v &&
        Array.isArray(v.data)
      ) {
        return Buffer.from(v.data);
      }
      return v;
    });
    if (Buffer.isBuffer(o)) {
      buf = o;
    } else {
      buf = message;
    }
  } catch (e) {
    buf = message;
  }
  return signature.Signature.signBuffer(buf, privateKey).toHex();
};

export const MultisigModule = {
  start,
  processSignatureRequest,
  requestSignatures,
  encodeMetadata,
};
