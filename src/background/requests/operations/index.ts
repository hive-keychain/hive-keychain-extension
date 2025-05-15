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
import { encodeWithKeys } from '@background/requests/operations/ops/encode-with-keys';
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
import { broadcastSwap } from '@background/requests/operations/ops/swap';
import { broadcastTransfer } from '@background/requests/operations/ops/transfer';
import { broadcastVote } from '@background/requests/operations/ops/vote';
import { vscCallContract } from '@background/requests/operations/ops/vsc-call-contract';
import { vscDeposit } from '@background/requests/operations/ops/vsc-deposit';
import { vscStaking } from '@background/requests/operations/ops/vsc-staking';
import { vscTransfer } from '@background/requests/operations/ops/vsc-transfer';
import { vscWithdrawal } from '@background/requests/operations/ops/vsc-withdrawal';
import { broadcastWitnessVote } from '@background/requests/operations/ops/witness-vote';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import Logger from 'src/utils/logger.utils';
import { addToWhitelist } from 'src/utils/preferences.utils';

export const performOperation = async (
  requestHandler: RequestsHandler,
  data: KeychainRequest,
  tab: number,
  domain: string,
  no_confirm: boolean,
  options?: TransactionOptions,
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
        message = await broadcastCustomJson(requestHandler, data, options);
        break;
      case KeychainRequestTypes.vote:
        message = await broadcastVote(requestHandler, data, options);
        break;
      case KeychainRequestTypes.transfer:
        message = await broadcastTransfer(requestHandler, data, options);
        break;
      case KeychainRequestTypes.post:
        message = await broadcastPost(requestHandler, data, options);
        break;
      case KeychainRequestTypes.addAccountAuthority:
        message = await broadcastAddAccountAuthority(
          requestHandler,
          data,
          options,
        );
        break;
      case KeychainRequestTypes.removeAccountAuthority:
        message = await broadcastRemoveAccountAuthority(
          requestHandler,
          data,
          options,
        );
        break;
      case KeychainRequestTypes.addKeyAuthority:
        message = await broadcastAddKeyAuthority(requestHandler, data, options);
        break;
      case KeychainRequestTypes.removeKeyAuthority:
        message = await broadcastRemoveKeyAuthority(
          requestHandler,
          data,
          options,
        );
        break;
      case KeychainRequestTypes.broadcast:
        message = await broadcastOperations(requestHandler, data, options);
        break;
      case KeychainRequestTypes.createClaimedAccount:
        message = await broadcastCreateClaimedAccount(
          requestHandler,
          data,
          options,
        );
        break;
      case KeychainRequestTypes.delegation:
        message = await broadcastDelegation(requestHandler, data, options);
        break;
      case KeychainRequestTypes.witnessVote:
        message = await broadcastWitnessVote(requestHandler, data, options);
        break;
      case KeychainRequestTypes.proxy:
        message = await broadcastProxy(requestHandler, data, options);
        break;
      case KeychainRequestTypes.powerUp:
        message = await broadcastPowerUp(requestHandler, data, options);
        break;
      case KeychainRequestTypes.powerDown:
        message = await broadcastPowerDown(requestHandler, data, options);
        break;
      case KeychainRequestTypes.sendToken:
        message = await broadcastSendToken(requestHandler, data, options);
        break;
      case KeychainRequestTypes.createProposal:
        message = await broadcastCreateProposal(requestHandler, data, options);
        break;
      case KeychainRequestTypes.updateProposalVote:
        message = await broadcastUpdateProposalVote(
          requestHandler,
          data,
          options,
        );
        break;
      case KeychainRequestTypes.removeProposal:
        message = await broadcastRemoveProposal(requestHandler, data, options);
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
        message = await convert(requestHandler, data, options);
        break;
      case KeychainRequestTypes.recurrentTransfer:
        message = await recurrentTransfer(requestHandler, data, options);
        break;
      case KeychainRequestTypes.swap:
        message = await broadcastSwap(requestHandler, data, options);
        break;
      case KeychainRequestTypes.vscCallContract:
        message = await vscCallContract(requestHandler, data);
        break;
      case KeychainRequestTypes.vscDeposit:
        message = await vscDeposit(requestHandler, data);
        break;
      case KeychainRequestTypes.vscWithdrawal:
        message = await vscWithdrawal(requestHandler, data);
        break;
      case KeychainRequestTypes.vscTransfer:
        message = await vscTransfer(requestHandler, data);
        break;
      case KeychainRequestTypes.vscStaking:
        message = await vscStaking(requestHandler, data);
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
