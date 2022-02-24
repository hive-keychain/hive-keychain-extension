import { RequestsHandler } from '@background/requests';
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
  requestHandler: RequestsHandler,
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
        message = await addAccount(requestHandler, data);
        break;
      case KeychainRequestTypes.custom:
        message = await broadcastCustomJson(requestHandler, data);
        break;
      case KeychainRequestTypes.vote:
        message = await broadcastVote(requestHandler, data);
        break;
      case KeychainRequestTypes.transfer:
        message = await broadcastTransfer(requestHandler, data);
        break;
      case KeychainRequestTypes.post:
        message = await broadcastPost(requestHandler, data);
        break;
      case KeychainRequestTypes.addAccountAuthority:
        message = await broadcastAddAccountAuthority(requestHandler, data);
        break;
      case KeychainRequestTypes.removeAccountAuthority:
        message = await broadcastRemoveAccountAuthority(requestHandler, data);
        break;
      case KeychainRequestTypes.addKeyAuthority:
        message = await broadcastAddKeyAuthority(requestHandler, data);
        break;
      case KeychainRequestTypes.removeKeyAuthority:
        message = await broadcastRemoveKeyAuthority(requestHandler, data);
        break;
      case KeychainRequestTypes.broadcast:
        message = await broadcastOperations(requestHandler, data);
        break;
      case KeychainRequestTypes.createClaimedAccount:
        message = await broadcastCreateClaimedAccount(requestHandler, data);
        break;

      case KeychainRequestTypes.delegation:
        message = await broadcastDelegation(requestHandler, data);
        break;
      case KeychainRequestTypes.witnessVote:
        message = await broadcastWitnessVote(requestHandler, data);
        break;
      case KeychainRequestTypes.proxy:
        message = await broadcastProxy(requestHandler, data);
        break;
      case KeychainRequestTypes.powerUp:
        message = await broadcastPowerUp(requestHandler, data);
        break;
      case KeychainRequestTypes.powerDown:
        message = await broadcastPowerDown(requestHandler, data);
        break;
      case KeychainRequestTypes.sendToken:
        message = await broadcastSendToken(requestHandler, data);
        break;
      case KeychainRequestTypes.createProposal:
        message = await broadcastCreateProposal(requestHandler, data);
        break;
      case KeychainRequestTypes.updateProposalVote:
        message = await broadcastUpdateProposalVote(requestHandler, data);
        break;
      case KeychainRequestTypes.removeProposal:
        message = await broadcastRemoveProposal(requestHandler, data);
        break;
      case KeychainRequestTypes.decode:
        message = await decodeMessage(requestHandler, data);
        break;
      case KeychainRequestTypes.encode:
        message = await encodeMessage(requestHandler, data);
        break;
      case KeychainRequestTypes.signBuffer:
        message = await signBuffer(requestHandler, data);
        break;
      case KeychainRequestTypes.signTx:
        message = await signTx(requestHandler, data);
        break;
      case KeychainRequestTypes.convert:
        message = await convert(requestHandler, data);
        break;
      case KeychainRequestTypes.recurrentTransfer:
        message = await recurrentTransfer(requestHandler, data);
        break;
    }
    chrome.tabs.sendMessage(tab, message);
  } catch (e) {
    Logger.error(e);
    sendErrors(
      requestHandler,
      tab,
      e + '',
      chrome.i18n.getMessage('unknown_error'),
      chrome.i18n.getMessage('unknown_error'),
      data,
    );
  } finally {
    if (no_confirm) {
      addToWhitelist(data.username!, domain, data.type);
      if (!!requestHandler.data.windowId) {
        removeWindow(requestHandler.data.windowId!);
      }
    } else chrome.runtime.sendMessage(message);
    requestHandler.reset(false);
  }
};
