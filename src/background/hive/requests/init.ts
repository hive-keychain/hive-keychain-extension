import MkModule from '@background/hive/modules/mk.module';
import {
  HiveRequestLocator,
  HiveRequestsHandler,
} from '@background/hive/requests/hive-request-handler';
import {
  KeychainRequest,
  KeychainRequestTypes,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
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
import * as Logic from './logic';

export const initHiveRequestHandler = async (
  request: KeychainRequest,
  tab: number,
  domain: string,
  requestHandler: HiveRequestsHandler,
  source?: PendingRequestSource,
) => {
  const requestSource = source ?? {
    tab,
    frameId: 0,
    origin: domain,
  };
  const locator: HiveRequestLocator | undefined =
    request.request_id != null
      ? { requestId: request.request_id, ...requestSource }
      : undefined;
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
    Logic.initializeWallet(requestHandler, tab, request, requestSource);
  } else if (!items.accounts && !mk && !items.KEYLESS_KEYCHAIN_ENABLED) {
    // Wallet not initialized for adding first account
    Logic.addAccountToEmptyWallet(
      requestHandler,
      tab,
      request,
      domain,
      requestSource,
    );
  } else if (!mk) {
    // if locked
    Logic.unlockWallet(
      requestHandler,
      tab!,
      request,
      domain,
      DialogCommand.UNLOCK,
    );
  } else if (items.KEYLESS_KEYCHAIN_ENABLED) {
    Logic.keylessKeychainRequest(
      requestHandler,
      tab,
      request,
      domain,
      requestSource,
    );
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

    if (locator) {
      await requestHandler.initializeParameters(
        accounts,
        rpc,
        items.no_confirm || [],
        locator,
      );
    } else {
      requestHandler.accounts = accounts;
    }

    let account = accounts.find((e) => e.name === username);
    if (type === KeychainRequestTypes.addAccount) {
      Logic.addAccountRequest(
        requestHandler,
        tab,
        request,
        domain,
        account,
        requestSource,
      );
    } else if (type === KeychainRequestTypes.transfer) {
      Logic.transferRequest(
        requestHandler,
        tab,
        request as RequestTransfer,
        domain,
        accounts,
        rpc,
        account,
        requestSource,
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
        requestSource,
      );
    } else {
      // Default case
      if (!account) {
        Logic.missingUser(
          requestHandler,
          tab,
          request,
          username!,
          requestSource,
        );
      } else {
        let typeWif = getRequiredWifType(request);
        let req = request;
        req.key = typeWif;

        if (!account.keys[typeWif]) {
          Logic.missingKey(
            requestHandler,
            tab,
            request,
            username!,
            typeWif,
            requestSource,
          );
        } else {
          //@ts-ignore
          const publicKey: Key = account.keys[`${typeWif}Pubkey`]!;
          const key = account.keys[typeWif];
          if (locator) {
            requestHandler.setKeys(key!, publicKey!, locator);
          }
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
              requestSource,
            );
          } else {
            Logic.requestWithoutConfirmation(
              requestHandler,
              tab,
              req,
              domain,
              requestSource,
            );
          }
        }
      }
    }
  }
  await requestHandler.saveInLocalStorage();
};
