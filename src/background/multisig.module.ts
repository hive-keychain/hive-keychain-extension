import { BackgroundMessage } from '@background/background-message.interface';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import { SignedTransaction } from '@hiveio/dhive';
import {
  MultisigAcceptRejectTxData,
  MultisigAccountConfig,
  MultisigConfig,
  MultisigData,
  MultisigDisplayMessageData,
  MultisigStep,
  NotifyTxBroadcastedMessage,
  SignTransactionMessage,
  SignatureRequest,
  Signer,
  SignerConnectMessage,
  SignerConnectResponse,
  SocketMessageCommand,
} from '@interfaces/multisig.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import MkUtils from '@popup/hive/utils/mk.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import { Socket, io } from 'socket.io-client';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { MultisigUtils } from 'src/utils/multisig.utils';

let socket: Socket;

const connectedPublicKeys: SignerConnectMessage[] = [];

const start = async () => {
  Logger.info(`Starting multisig`);

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
  socket = io('http://localhost:5000', {
    transports: ['websocket'],
    reconnection: false,
  });

  socket.on('connect', () => {
    console.log('connect');
    keepAlive();
    initAccountsConnections(multisigConfig);
  });
  socket.on('error', (err) => {
    console.log('error', err);
  });
  socket.on('disconnect', (ev) => {
    console.log('disconnect', ev);
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
        command: BackgroundCommand.MULTISIG_ACK_ACCEPT_RESPONSE,
        value: {
          multisigStep: MultisigStep.NOTIFY_TRANSACTION_BROADCASTED,
          data: {
            message: 'multisig_dialog_transaction_signed_successfully',
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
                  chrome.runtime.sendMessage({
                    command: BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP,
                    value: {
                      data: {
                        multisigStep:
                          MultisigStep.NOTIFY_TRANSACTION_BROADCASTED,
                        message:
                          'multisig_dialog_transaction_signed_successfully',
                      } as MultisigDisplayMessageData,
                    },
                  } as BackgroundMessage);
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

const connectToBackend = async (
  accountName: string,
  accountConfig: MultisigAccountConfig,
) => {
  Logger.info(
    `Trying to connect @${accountName} to the multisig backend server`,
  );
  const signerConnectMessages: SignerConnectMessage[] = [];
  if (accountConfig.active?.isEnabled) {
    signerConnectMessages.push({
      username: accountName,
      publicKey: accountConfig.active.publicKey,
      message: accountConfig.active.message,
    });
  }
  if (accountConfig.posting?.isEnabled) {
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
      console.log(signerConnectResponse);
      for (const signer of signerConnectMessages) {
        if (
          !(
            signerConnectResponse.errors &&
            Object.keys(signerConnectResponse.errors).includes(signer.publicKey)
          )
        )
          connectedPublicKeys.push(signer);
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

const requestSignatures = () => {
  //TODO to implement
};

const processSignatureRequest = async (
  signatureRequest: SignatureRequest,
  signer: Signer,
): Promise<SignedTransaction | undefined> => {
  if (signer) {
    const username = connectedPublicKeys.find(
      (c) => c.publicKey === signer.publicKey,
    )?.username;

    const mk = await MkUtils.getMkFromLocalStorage();
    const localAccounts = await BgdAccountsUtils.getAccountsFromLocalStorage(
      mk,
    );
    const localAccount = localAccounts.find((la) => la.name === username);
    const key =
      localAccount?.keys[
        signatureRequest.keyType.toLowerCase() as KeychainKeyTypesLC
      ]?.toString()!;

    const decodedTransaction = await decryptRequest(signer, key);
    // TODO add check
    if (decodedTransaction) {
      const signedTransaction = await requestSignTransactionFromUser(
        decodedTransaction,
        signer,
        signatureRequest,
        key,
      );
      return signedTransaction;
    } else return;
  }
};

const requestSignTransactionFromUser = (
  decodedTransaction: any,
  signer: Signer,
  signatureRequest: SignatureRequest,
  key: string,
): Promise<SignedTransaction | undefined> => {
  return new Promise((resolve, reject) => {
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

    openWindow({
      multisigStep: MultisigStep.ACCEPT_REJECT_TRANSACTION,
      data: {
        signer,
        signatureRequest,
        decodedTransaction,
      } as MultisigAcceptRejectTxData,
    });
  });
};

const decryptRequest = async (signer: Signer, key: string) => {
  console.log(`trying to decrypt for signer ${signer.publicKey}`);

  return await MultisigUtils.decodeTransaction(
    signer.encryptedTransaction,
    key,
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
    }, 1000);
  });
};

export const MultisigModule = {
  start,
  processSignatureRequest,
};
