import { BackgroundMessage } from '@background/background-message.interface';
import MkModule from '@background/mk.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import { SignedTransaction } from '@hiveio/dhive';
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
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainKeyTypes, KeychainKeyTypesLC } from 'hive-keychain-commons';
import { Socket, io } from 'socket.io-client';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

let socket: Socket;

let connectedPublicKeys: SignerConnectMessage[] = [];

const start = async () => {
  Logger.info(`Starting multisig`);

  socket = io('http://localhost:5000', {
    transports: ['websocket'],
    reconnection: true,
  });

  const multisigConfig: MultisigConfig =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.MULTISIG_CONFIG,
    );

  if (
    Object.values(multisigConfig).some(
      (config) =>
        config.isEnabled &&
        (config.active.isEnabled || config.posting.isEnabled),
    )
  ) {
    Logger.info('Some accounts need connection');
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
        requestSignatures(data, true);
      }
    },
  );
};

const requestSignatures = async (
  data: MultisigRequestSignatures,
  useRuntimeMessages?: boolean,
) => {
  const message = await getRequestSignatureMessage(data);
  try {
    const emit = socket.volatile.emit(
      SocketMessageCommand.REQUEST_SIGNATURE,
      message,
      withTimeout(
        (message: string) => {
          Logger.log(message);
          if (useRuntimeMessages) {
            chrome.runtime.sendMessage({
              command: BackgroundCommand.MULTISIG_REQUEST_SIGNATURES_RESPONSE,
              value: {
                message: 'multisig_signature_request_sent',
              },
            });
          } else {
            return 'multisig_signature_request_sent';
          }
        },
        () => {
          console.log('timeout');
        },
      ),
    );
    console.log(emit);
  } catch (err) {
    console.log(err);
  }
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
  socket.on('connect', () => {
    keepAlive();
    initAccountsConnections(multisigConfig);
  });
  socket.on('error', (err) => {
    Logger.error('Error in socket', err);
  });
  socket.on('disconnect', (ev) => {
    Logger.info('Disconnected from socket');
  });

  socket.on(
    SocketMessageCommand.REQUEST_SIGN_TRANSACTION,
    async (signatureRequest: SignatureRequest) => {
      const signer = signatureRequest.signers.find((signer: Signer) => {
        return signer.publicKey === signatureRequest.targetedPublicKey;
      });

      if (!signer) {
        return;
      }

      const signedTransaction = await MultisigModule.processSignatureRequest(
        signatureRequest,
        signer,
      );

      chrome.runtime.sendMessage({
        command: BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP,
        value: {
          multisigStep: MultisigStep.SIGN_TRANSACTION_FEEDBACK,
          data: {
            message: 'multisig_dialog_transaction_signed_successfully',
            success: true,
            signer: signer,
          } as MultisigDisplayMessageData,
        },
      } as BackgroundMessage);

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
                } as NotifyTxBroadcastedMessage,
                () => {
                  Logger.info(`Notified`);

                  openWindow({
                    multisigStep: MultisigStep.NOTIFY_TRANSACTION_BROADCASTED,
                    data: {
                      message: 'multisig_dialog_transaction_broadcasted',
                      success: true,
                      signer: signer,
                    } as MultisigDisplayMessageData,
                  });
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
    (signatureRequest: SignatureRequest) => {
      Logger.log(`signature request ${signatureRequest.id} was broadcasted`);
    },
  );

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
  Logger.info(
    `Trying to connect @${accountName} to the multisig backend server`,
  );
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
  }, 20 * 1000);
};

const getRequestSignatureMessage = async (
  data: MultisigRequestSignatures,
): Promise<RequestSignatureMessage> => {
  return new Promise(async (resolve, reject) => {
    const potentialSigners = await MultisigUtils.getPotentialSigners(
      data.initiatorAccount,
      data.key,
      data.method,
    );

    const signers: RequestSignatureSigner[] = [];
    for (const [receiverPubKey, weight] of potentialSigners) {
      signers.push({
        encryptedTransaction: await encodeTransaction(
          data.transaction,
          data.key!.toString(),
          receiverPubKey,
        ),
        publicKey: receiverPubKey,
        weight: weight.toString(),
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
      mk = await unlockWallet();
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
    } else return;
  }
};

const unlockWallet = async () => {
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
                command: BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP,
                value: {
                  multisigStep: MultisigStep.UNLOCK_WALLET,
                  data: { feedback: 'wrong_password' },
                },
              });
            }
          } catch (err) {
            chrome.runtime.sendMessage({
              command: BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP,
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
      data: {} as MultisigDataType,
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
        backgroundMessage.command === BackgroundCommand.MULTISIG_ACCEPT_RESPONSE
      ) {
        if (backgroundMessage.value) {
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
        command: BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP,
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

const notifyTransactionBroadcasted = (signatureRequest: SignatureRequest) => {};

const openWindow = (data: MultisigData): void => {
  chrome.windows.getCurrent(async (currentWindow) => {
    const win: chrome.windows.CreateData = {
      url: chrome.runtime.getURL('multisig-dialog.html'),
      type: 'popup',
      height: 600,
      width: 435,
      left: currentWindow.width! - 350 + currentWindow.left!,
      top: currentWindow.top,
    };
    // Except on Firefox
    //@ts-ignore
    if (typeof InstallTrigger === undefined) win.focused = true;
    const window = await chrome.windows.create(win);

    setTimeout(() => {
      chrome.runtime.sendMessage({
        command: BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP,
        value: data,
      } as BackgroundMessage);
    }, 250);
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

export const MultisigModule = {
  start,
  processSignatureRequest,
  requestSignatures,
};
