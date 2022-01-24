import { getRequestHandler } from '@background/requests';
import { removeWindow } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { addAccount } from '@background/requests/operations/ops/add-account';
import {
  broadcastAddAccountAuthority,
  broadcastAddKeyAuthority,
  broadcastRemoveAccountAuthority,
  broadcastRemoveKeyAuthority,
} from '@background/requests/operations/ops/authority';
import { broadcastOperations } from '@background/requests/operations/ops/broadcast';
import { convert } from '@background/requests/operations/ops/convert';
import { broadcastCreateClaimedAccount } from '@background/requests/operations/ops/create-claimed-account';
import { broadcastCustomJson } from '@background/requests/operations/ops/custom-json';
import { decodeMessage } from '@background/requests/operations/ops/decode-memo';
import { broadcastDelegation } from '@background/requests/operations/ops/delegation';
import { encodeMessage } from '@background/requests/operations/ops/encode-memo';
import { broadcastPost } from '@background/requests/operations/ops/post';
import {
  broadcastPowerDown,
  broadcastPowerUp,
} from '@background/requests/operations/ops/power';
import {
  broadcastCreateProposal,
  broadcastRemoveProposal,
  broadcastUpdateProposalVote,
} from '@background/requests/operations/ops/proposals';
import { broadcastProxy } from '@background/requests/operations/ops/proxy';
import { recurrentTransfer } from '@background/requests/operations/ops/recurrent-transfer';
import { broadcastSendToken } from '@background/requests/operations/ops/send-token';
import { signBuffer } from '@background/requests/operations/ops/sign-buffer';
import { signTx } from '@background/requests/operations/ops/sign-tx';
import { broadcastTransfer } from '@background/requests/operations/ops/transfer';
import { broadcastVote } from '@background/requests/operations/ops/vote';
import { broadcastWitnessVote } from '@background/requests/operations/ops/witness-vote';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import Logger from 'src/utils/logger.utils';
import { addToWhitelist } from 'src/utils/preferences.utils';

export const performOperation = async (
  data: KeychainRequest,
  tab: number,
  domain: string,
  no_confirm: boolean,
) => {
  let message = null;
  try {
    Logger.info('-- PERFORMING TRANSACTION --');
    Logger.log(data);
    switch (data.type) {
      case KeychainRequestTypes.addAccount:
        message = await addAccount(data);
        break;
      case KeychainRequestTypes.custom:
        message = await broadcastCustomJson(data);
        break;
      case KeychainRequestTypes.vote:
        message = await broadcastVote(data);
        break;
      case KeychainRequestTypes.transfer:
        message = await broadcastTransfer(data);
        break;
      case KeychainRequestTypes.post:
        message = await broadcastPost(data);
        break;
      case KeychainRequestTypes.addAccountAuthority:
        message = await broadcastAddAccountAuthority(data);
        break;
      case KeychainRequestTypes.removeAccountAuthority:
        message = await broadcastRemoveAccountAuthority(data);
        break;
      case KeychainRequestTypes.addKeyAuthority:
        message = await broadcastAddKeyAuthority(data);
        break;
      case KeychainRequestTypes.removeKeyAuthority:
        message = await broadcastRemoveKeyAuthority(data);
        break;
      case KeychainRequestTypes.broadcast:
        message = await broadcastOperations(data);
        break;
      case KeychainRequestTypes.createClaimedAccount:
        message = await broadcastCreateClaimedAccount(data);
        break;

      case KeychainRequestTypes.delegation:
        message = await broadcastDelegation(data);
        break;
      case KeychainRequestTypes.witnessVote:
        message = await broadcastWitnessVote(data);
        break;
      case KeychainRequestTypes.proxy:
        message = await broadcastProxy(data);
        break;
      case KeychainRequestTypes.powerUp:
        message = await broadcastPowerUp(data);
        break;
      case KeychainRequestTypes.powerDown:
        message = await broadcastPowerDown(data);
        break;
      case KeychainRequestTypes.sendToken:
        message = await broadcastSendToken(data);
        break;
      case KeychainRequestTypes.createProposal:
        message = await broadcastCreateProposal(data);
        break;
      case KeychainRequestTypes.updateProposalVote:
        message = await broadcastUpdateProposalVote(data);
        break;
      case KeychainRequestTypes.removeProposal:
        message = await broadcastRemoveProposal(data);
        break;
      case KeychainRequestTypes.decode:
        message = await decodeMessage(data);
        break;
      case KeychainRequestTypes.encode:
        message = await encodeMessage(data);
        break;
      case KeychainRequestTypes.signBuffer:
        message = await signBuffer(data);
        break;
      case KeychainRequestTypes.signTx:
        message = await signTx(data);
        break;
      case KeychainRequestTypes.convert:
        message = await convert(data);
        break;
      case KeychainRequestTypes.recurrentTransfer:
        message = await recurrentTransfer(data);
        break;
    }
    chrome.tabs.sendMessage(tab, message);
  } catch (e) {
    Logger.error(e);
    sendErrors(
      tab,
      e + '',
      chrome.i18n.getMessage('unknown_error'),
      chrome.i18n.getMessage('unknown_error'),
      data,
    );
  } finally {
    if (no_confirm) {
      addToWhitelist(data.username!, domain, data.type);
      if (!!getRequestHandler().windowId) {
        removeWindow(getRequestHandler().windowId!);
      }
    } else chrome.runtime.sendMessage(message);
    getRequestHandler().reset();
  }
};
