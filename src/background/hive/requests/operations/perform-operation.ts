import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { addAccount } from '@background/hive/requests/operations/ops/add-account';
import {
  broadcastAddAccountAuthority,
  broadcastAddKeyAuthority,
  broadcastRemoveAccountAuthority,
  broadcastRemoveKeyAuthority,
} from '@background/hive/requests/operations/ops/authority';
import { broadcastOperations } from '@background/hive/requests/operations/ops/broadcast';
import { convert } from '@background/hive/requests/operations/ops/convert';
import { broadcastCreateClaimedAccount } from '@background/hive/requests/operations/ops/create-claimed-account';
import { broadcastCustomJson } from '@background/hive/requests/operations/ops/custom-json';
import { decodeMessage } from '@background/hive/requests/operations/ops/decode-memo';
import { broadcastDelegation } from '@background/hive/requests/operations/ops/delegation';
import { encodeMessage } from '@background/hive/requests/operations/ops/encode-memo';
import { encodeWithKeys } from '@background/hive/requests/operations/ops/encode-with-keys';
import { broadcastPost } from '@background/hive/requests/operations/ops/post';
import {
  broadcastPowerDown,
  broadcastPowerUp,
} from '@background/hive/requests/operations/ops/power';
import {
  broadcastCreateProposal,
  broadcastRemoveProposal,
  broadcastUpdateProposalVote,
} from '@background/hive/requests/operations/ops/proposals';
import { broadcastProxy } from '@background/hive/requests/operations/ops/proxy';
import { recurrentTransfer } from '@background/hive/requests/operations/ops/recurrent-transfer';
import { broadcastSendToken } from '@background/hive/requests/operations/ops/send-token';
import { signBuffer } from '@background/hive/requests/operations/ops/sign-buffer';
import { signTx } from '@background/hive/requests/operations/ops/sign-tx';
import { broadcastSwap } from '@background/hive/requests/operations/ops/swap';
import { broadcastTransfer } from '@background/hive/requests/operations/ops/transfer';
import { broadcastVote } from '@background/hive/requests/operations/ops/vote';
import { broadcastWitnessVote } from '@background/hive/requests/operations/ops/witness-vote';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import Logger from 'src/utils/logger.utils';
import { addToWhitelist } from 'src/utils/preferences.utils';

export const performHiveOperation = async (
  requestHandler: HiveRequestsHandler,
  data: KeychainRequest,
  tab: number,
  domain: string,
  no_confirm: boolean,
) => {
  let message = null;
  try {
    Logger.info('-- PERFORMING HIVE TRANSACTION --');
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
      case KeychainRequestTypes.encodeWithKeys:
        message = await encodeWithKeys(requestHandler, data);
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
      case KeychainRequestTypes.swap:
        message = await broadcastSwap(requestHandler, data);
        break;
    }
    chrome.tabs.sendMessage(tab, message);
  } catch (e) {
    Logger.error(e);
    sendErrors(
      requestHandler,
      tab,
      e + '',
      await chrome.i18n.getMessage('unknown_error'),
      await chrome.i18n.getMessage('unknown_error'),
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
