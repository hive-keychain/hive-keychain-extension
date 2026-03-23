import MkModule from '@background/mk.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequest,
  KeychainRequestTypes,
  RequestId,
  RequestSignTx,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { isWhitelisted } from 'src/utils/preferences.utils';
import {
  anonymousRequests,
  getRequiredWifType,
} from 'src/utils/requests.utils';
import { validateSignTxTransaction } from 'src/utils/sign-tx.utils';
import * as Logic from './logic';

const validateIncomingSignTx = async (tx: unknown) => {
  const now = new Date();
  let validation = validateSignTxTransaction(tx, { now });

  if (!validation.ok) {
    return validation;
  }

  try {
    const props = await DynamicGlobalPropertiesUtils.getDynamicGlobalProperties();
    validation = validateSignTxTransaction(validation.value.transaction, {
      now,
      currentHeadBlockNumber: props.head_block_number,
    });
  } catch (_error) {
    Logger.warn('Skipping signTx head block freshness check');
  }

  return validation;
};

export default async (
  request: KeychainRequest,
  tab: number | undefined,
  domain: string,
  requestHandler: RequestsHandler,
) => {
  const items: {
    accounts: string;
    current_rpc?: Rpc;
    no_confirm: NoConfirm;
    KEYLESS_KEYCHAIN_ENABLED: boolean;
  } = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.ACCOUNTS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.CURRENT_RPC,
    LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
  ]);
  let rpc = items.current_rpc || Config.rpc.DEFAULT;
  if (request.rpc) {
    const override_rpc = await RpcUtils.findRpc(request.rpc);
    if (override_rpc) {
      rpc = override_rpc;
    }
  }
  const { username, type } = request;
  const mk = await MkModule.getMk();
  Logger.info('Initializing request logic');
  if (
    !items.accounts &&
    type !== KeychainRequestTypes.addAccount &&
    !items.KEYLESS_KEYCHAIN_ENABLED
  ) {
    // Wallet not initialized
    Logic.initializeWallet(requestHandler, tab!, request);
  } else if (!items.accounts && !mk && !items.KEYLESS_KEYCHAIN_ENABLED) {
    // Wallet not initialized for adding first account
    Logic.addAccountToEmptyWallet(requestHandler, tab!, request, domain);
  } else if (!mk) {
    // if locked
    Logic.unlockWallet(requestHandler, tab!, request, domain);
  } else if (items.KEYLESS_KEYCHAIN_ENABLED) {
    Logic.keylessKeychainRequest(requestHandler, tab!, request, domain);
  } else {
    const decryptedAccounts = items.accounts
      ? await EncryptUtils.decryptToJson(items.accounts, mk!)
      : null;
    const accounts = (decryptedAccounts?.list as LocalAccount[]) || [];

    if (
      decryptedAccounts &&
      items.accounts &&
      !EncryptUtils.isEncryptedJsonV2(items.accounts)
    ) {
      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACCOUNTS,
        await EncryptUtils.encryptJson({ list: accounts }, mk!),
      );
    }

    await requestHandler.initializeParameters(
      accounts,
      rpc,
      items.no_confirm || [],
    );

    let account = accounts.find((e) => e.name === username);
    if (type === KeychainRequestTypes.addAccount) {
      Logic.addAccountRequest(requestHandler, tab!, request, domain, account);
    } else if (type === KeychainRequestTypes.transfer) {
      Logic.transferRequest(
        requestHandler,
        tab!,
        request as RequestTransfer,
        domain,
        accounts,
        rpc,
        account,
      );
    } else if (anonymousRequests.includes(type) && !username) {
      // if no username specified for anonymous requests
      Logic.anonymousRequests(
        requestHandler,
        tab!,
        request,
        domain,
        accounts,
        rpc,
      );
    } else {
      // Default case
      if (!account) {
        Logic.missingUser(requestHandler, tab!, request, username!);
      } else {
        if (type === KeychainRequestTypes.signTx) {
          const signTxRequest = request as RequestSignTx & RequestId;
          const validation = await validateIncomingSignTx(signTxRequest.tx);
          if (!validation.ok) {
            chrome.tabs.sendMessage(
              tab!,
              await createMessage(
                'invalid_transaction',
                undefined,
                signTxRequest,
                null,
                validation.error.message,
              ),
            );
            requestHandler.reset(false);
            return;
          }

          signTxRequest.tx = validation.value.transaction;
        }

        let typeWif = getRequiredWifType(request);
        let req = request;
        req.key = typeWif;

        if (!account.keys[typeWif]) {
          Logic.missingKey(requestHandler, tab!, request, username!, typeWif);
        } else {
          //@ts-ignore
          const publicKey: Key = account.keys[`${typeWif}Pubkey`]!;
          const key = account.keys[typeWif];
          requestHandler.setKeys(key!, publicKey!);

          if (
            !isWhitelisted(items.no_confirm, req, domain, rpc) ||
            KeysUtils.requireManualConfirmation(key!)
          ) {
            Logic.requestWithConfirmation(
              requestHandler,
              tab!,
              req,
              domain,
              rpc,
            );
          } else {
            Logic.requestWithoutConfirmation(requestHandler, tab!, req);
          }
        }
      }
    }
  }
  requestHandler.saveInLocalStorage();
};
