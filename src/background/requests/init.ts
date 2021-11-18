import MkModule from '@background/mk.module';
import RequestsModule from '@background/requests';
import {
  KeychainRequest,
  KeychainRequestTypes,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { Key, LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  anonymous_requests,
  getRequiredWifType,
  hasNoConfirm,
} from 'src/utils/requests.utils';
import * as Logic from './logic';

export default async (
  request: KeychainRequest,
  tab: number | undefined,
  domain: string,
) => {
  const items: {
    accounts: string;
    current_rpc: Rpc;
    no_confirm: string;
  } = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.ACCOUNTS,
    LocalStorageKeyEnum.NO_CONFIRM,
    LocalStorageKeyEnum.CURRENT_RPC,
  ]);
  const { username, type } = request;
  if (!items.accounts && type !== KeychainRequestTypes.addAccount) {
    // Wallet not initialized
    Logic.initializeWallet(tab!, request);
  } else if (!items.accounts && !MkModule.getMk()) {
    // Wallet not initialized for adding first account
    Logic.addAccountToEmptyWallet(tab!, request, domain);
  } else if (!MkModule.getMk()) {
    // if locked
    Logic.unlockWallet(tab!, request, domain);
  } else {
    console.log(items.accounts, MkModule.getMk());
    const accounts = EncryptUtils.decryptToJson(
      items.accounts,
      MkModule.getMk()!,
    ).list as LocalAccount[];
    console.log(accounts);
    RequestsModule.initializeParams(
      accounts,
      items.current_rpc,
      JSON.parse(items.no_confirm || '[]'),
    );

    let account = accounts.find((e) => e.name === username);
    if (type === KeychainRequestTypes.addAccount) {
      Logic.addAccountRequest(tab!, request, domain, account);
    } else if (type === KeychainRequestTypes.transfer) {
      Logic.transferRequest(
        tab!,
        request as RequestTransfer,
        domain,
        accounts,
        items.current_rpc,
        account,
      );
    } else if (anonymous_requests.includes(type) && !username) {
      // if no username specified for anonymous requests
      Logic.anonymousRequests(
        tab!,
        request,
        domain,
        accounts,
        items.current_rpc,
      );
    } else {
      // Default case
      if (!account) {
        Logic.missingUser(tab!, request, username!);
      } else {
        let typeWif = getRequiredWifType(request);
        let req = request;
        req.key = typeWif;

        if (!account.keys[typeWif]) {
          Logic.missingKey(tab!, request, username!, typeWif);
        } else {
          //@ts-ignore
          const publicKey: Key = account.keys[`${typeWif}Pubkey`]!;
          const key = account.keys[typeWif];
          RequestsModule.setKeys(key!, publicKey!);

          if (!hasNoConfirm(items.no_confirm, req, domain, items.current_rpc)) {
            Logic.requestWithConfirmation(tab!, req, domain, items.current_rpc);
          } else {
            Logic.requestWithoutConfirmation(tab!, req);
          }
        }
      }
    }
  }
};
