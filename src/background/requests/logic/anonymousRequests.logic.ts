import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { getRequiredWifType } from 'src/utils/requests.utils';

export const anonymousRequests = (
  tab: number,
  request: KeychainRequest,
  domain: string,
  accounts: LocalAccount[],
  current_rpc: Rpc,
) => {
  const filterKey = getRequiredWifType(request);
  const account_candidates = accounts
    .filter((e) => !!e.keys[filterKey])
    .map((e) => e.name);
  if (!account_candidates.length) {
    createPopup(() => {
      sendErrors(
        tab!,
        'user_cancel',
        chrome.i18n.getMessage('bgd_auth_canceled'),
        chrome.i18n.getMessage('bgd_auth_no_active'),
        request,
      );
    });
  } else {
    const callback = () => {
      chrome.runtime.sendMessage({
        command: 'sendDialogConfirm',
        data: request,
        domain,
        accounts: account_candidates,
        tab,
        testnet: current_rpc.testnet,
      });
    };
    createPopup(callback);
  }
};
