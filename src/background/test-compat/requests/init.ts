import MkModule from '@background/hive/modules/mk.module';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
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
import { RequestsHandler } from './request-handler';

type TransferKeychainRequest = Extract<
  KeychainRequest,
  { type: KeychainRequestTypes.transfer }
>;

export default async function init(
  request: KeychainRequest,
  tab: number | undefined,
  domain: string,
  requestHandler: RequestsHandler,
) {
  const items: {
    accounts: string;
    current_rpc?: Rpc;
    no_confirm: NoConfirm;
    KEYLESS_KEYCHAIN_ENABLED?: boolean;
  } = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.ACCOUNTS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.CURRENT_RPC,
    LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
  ]);

  let rpc = items.current_rpc || Config.rpc.DEFAULT;
  if (request.rpc) {
    const overrideRpc = await RpcUtils.findRpc(request.rpc);
    if (overrideRpc) {
      rpc = overrideRpc;
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
    Logic.initializeWallet(requestHandler, tab!, request);
  } else if (!items.accounts && !mk && !items.KEYLESS_KEYCHAIN_ENABLED) {
    Logic.addAccountToEmptyWallet(requestHandler, tab!, request, domain);
  } else if (!mk) {
    Logic.unlockWallet(requestHandler, tab!, request, domain);
  } else if (items.KEYLESS_KEYCHAIN_ENABLED) {
    await Logic.keylessKeychainRequest(requestHandler, tab!, request, domain);
  } else {
    const decryptedAccounts = items.accounts
      ? await EncryptUtils.decryptToJson(items.accounts, mk!)
      : null;
    const accounts = (decryptedAccounts?.list as LocalAccount[]) || [];

    await requestHandler.initializeParameters(
      accounts,
      rpc,
      items.no_confirm || ({} as NoConfirm),
      request.request_id,
    );

    const account = accounts.find((entry) => entry.name === username);
    if (type === KeychainRequestTypes.addAccount) {
      Logic.addAccountRequest(requestHandler, tab!, request, domain, account);
    } else if (type === KeychainRequestTypes.transfer) {
      Logic.transferRequest(
        requestHandler,
        tab!,
        request as TransferKeychainRequest,
        domain,
        accounts,
        rpc,
        account,
      );
    } else if (anonymousRequests.includes(type) && !username) {
      Logic.anonymousRequests(
        requestHandler,
        tab!,
        request,
        domain,
        accounts,
        rpc,
      );
    } else if (!account) {
      Logic.missingUser(requestHandler, tab!, request, username!);
    } else {
      const typeWif = getRequiredWifType(request);
      if (!account.keys[typeWif]) {
        Logic.missingKey(requestHandler, tab!, request, username!, typeWif);
      } else {
        const publicKey = account.keys[`${typeWif}Pubkey`];
        requestHandler.setKeys(account.keys[typeWif]!, publicKey!, request.request_id);
        if (
          !isWhitelisted(items.no_confirm, request, domain, rpc) ||
          KeysUtils.requireManualConfirmation(account.keys[typeWif]!)
        ) {
          Logic.requestWithConfirmation(
            requestHandler,
            tab!,
            request,
            domain,
            rpc,
          );
        } else {
          await Logic.requestWithoutConfirmation(requestHandler, tab!, request);
        }
      }
    }
  }

  await requestHandler.saveInLocalStorage();
}
