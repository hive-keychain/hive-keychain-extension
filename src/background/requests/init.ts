import MkModule from '@background/mk.module';
import { getRequestHandler } from '@background/requests';
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
import RpcUtils from 'src/utils/rpc.utils';
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
  let rpc = items.current_rpc;
  if (request.rpc) {
    const override_rpc = await RpcUtils.findRpc(request.rpc);
    if (override_rpc) {
      rpc = override_rpc;
    }
  }
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
    const accounts = items.accounts
      ? (EncryptUtils.decryptToJson(items.accounts, MkModule.getMk()!)
          .list as LocalAccount[])
      : [];
    getRequestHandler().initializeParameters(
      accounts,
      rpc,
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
        rpc,
        account,
      );
    } else if (anonymous_requests.includes(type) && !username) {
      // if no username specified for anonymous requests
      Logic.anonymousRequests(tab!, request, domain, accounts, rpc);
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
          getRequestHandler().setKeys(key!, publicKey!);

          if (!hasNoConfirm(items.no_confirm, req, domain, rpc)) {
            Logic.requestWithConfirmation(tab!, req, domain, rpc);
          } else {
            Logic.requestWithoutConfirmation(tab!, req);
          }
        }
      }
    }
  }
};
