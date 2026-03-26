import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import Logger from 'src/utils/logger.utils';
import { addToWhitelist } from 'src/utils/preferences.utils';
import { removeWindow } from './dialog-lifecycle';
import { RequestsHandler } from './request-handler';

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
import { broadcastSavings } from '@background/hive/requests/operations/ops/savings';
import { broadcastSendToken } from '@background/hive/requests/operations/ops/send-token';
import { signBuffer } from '@background/hive/requests/operations/ops/sign-buffer';
import { signTx } from '@background/hive/requests/operations/ops/sign-tx';
import { broadcastSwap } from '@background/hive/requests/operations/ops/swap';
import { broadcastTransfer } from '@background/hive/requests/operations/ops/transfer';
import { broadcastVote } from '@background/hive/requests/operations/ops/vote';
import { broadcastWitnessVote } from '@background/hive/requests/operations/ops/witness-vote';

export const performOperation = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  tab: number,
  domain: string,
  noConfirm: boolean,
  options?: TransactionOptions,
) => {
  Logger.info('-- PERFORMING TRANSACTION --');
  Logger.log(request);

  let message: any = null;

  switch (request.type) {
    case KeychainRequestTypes.addAccount:
      message = await addAccount(requestHandler as any, request as any);
      break;
    case KeychainRequestTypes.custom:
      message = await broadcastCustomJson(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.vote:
      message = await broadcastVote(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.transfer:
      message = await broadcastTransfer(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.savings:
      message = await broadcastSavings(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.post:
      message = await broadcastPost(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.addAccountAuthority:
      message = await broadcastAddAccountAuthority(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.removeAccountAuthority:
      message = await broadcastRemoveAccountAuthority(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.addKeyAuthority:
      message = await broadcastAddKeyAuthority(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.removeKeyAuthority:
      message = await broadcastRemoveKeyAuthority(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.broadcast:
      message = await broadcastOperations(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.createClaimedAccount:
      message = await broadcastCreateClaimedAccount(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.delegation:
      message = await broadcastDelegation(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.witnessVote:
      message = await broadcastWitnessVote(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.proxy:
      message = await broadcastProxy(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.powerUp:
      message = await broadcastPowerUp(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.powerDown:
      message = await broadcastPowerDown(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.sendToken:
      message = await broadcastSendToken(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.createProposal:
      message = await broadcastCreateProposal(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.updateProposalVote:
      message = await broadcastUpdateProposalVote(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.removeProposal:
      message = await broadcastRemoveProposal(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.decode:
      message = await decodeMessage(requestHandler as any, request as any);
      break;
    case KeychainRequestTypes.encode:
      message = await encodeMessage(requestHandler as any, request as any);
      break;
    case KeychainRequestTypes.encodeWithKeys:
      message = await encodeWithKeys(requestHandler as any, request as any);
      break;
    case KeychainRequestTypes.signBuffer:
      message = await signBuffer(requestHandler as any, request as any);
      break;
    case KeychainRequestTypes.signTx:
      message = await signTx(requestHandler as any, request as any);
      break;
    case KeychainRequestTypes.convert:
      message = await convert(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.recurrentTransfer:
      message = await recurrentTransfer(requestHandler as any, request as any, options);
      break;
    case KeychainRequestTypes.swap:
      message = await broadcastSwap(requestHandler as any, request as any, options);
      break;
  }

  if (message) {
    chrome.tabs.sendMessage(tab, message);
    if (!noConfirm) {
      chrome.runtime.sendMessage(message);
    }
  }

  if (noConfirm) {
    await addToWhitelist(request.username!, domain, request.type);
  }

  if (requestHandler.data.windowId !== undefined) {
    removeWindow(requestHandler.data.windowId);
  }

  requestHandler.reset(false);
};
