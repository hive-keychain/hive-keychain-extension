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
import { broadcastSavings } from '@background/hive/requests/operations/ops/savings';
import { broadcastSendToken } from '@background/hive/requests/operations/ops/send-token';
import { signBuffer } from '@background/hive/requests/operations/ops/sign-buffer';
import { signTx } from '@background/hive/requests/operations/ops/sign-tx';
import { broadcastSwap } from '@background/hive/requests/operations/ops/swap';
import { broadcastTransfer } from '@background/hive/requests/operations/ops/transfer';
import { broadcastVote } from '@background/hive/requests/operations/ops/vote';
import { broadcastWitnessVote } from '@background/hive/requests/operations/ops/witness-vote';
import sendErrors from '@background/multichain/errors';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';
import { addToWhitelist } from 'src/utils/preferences.utils';

export const performHiveOperation = async (
  requestHandler: HiveRequestsHandler,
  request: KeychainRequest,
  tab: number,
  domain: string,
  no_confirm: boolean,
  options?: TransactionOptions,
) => {
  let message = null;
  try {
    Logger.info('-- PERFORMING HIVE TRANSACTION --');
    Logger.log(request);
    switch (request.type) {
      case KeychainRequestTypes.addAccount:
        message = await addAccount(requestHandler, request);
        break;
      case KeychainRequestTypes.custom:
        message = await broadcastCustomJson(requestHandler, request, options);
        break;
      case KeychainRequestTypes.vote:
        message = await broadcastVote(requestHandler, request, options);
        break;
      case KeychainRequestTypes.transfer:
        message = await broadcastTransfer(requestHandler, request, options);
        break;
      case KeychainRequestTypes.savings:
        message = await broadcastSavings(requestHandler, request, options);
        break;
      case KeychainRequestTypes.post:
        message = await broadcastPost(requestHandler, request, options);
        break;
      case KeychainRequestTypes.addAccountAuthority:
        message = await broadcastAddAccountAuthority(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.removeAccountAuthority:
        message = await broadcastRemoveAccountAuthority(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.addKeyAuthority:
        message = await broadcastAddKeyAuthority(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.removeKeyAuthority:
        message = await broadcastRemoveKeyAuthority(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.broadcast:
        message = await broadcastOperations(requestHandler, request, options);
        break;
      case KeychainRequestTypes.createClaimedAccount:
        message = await broadcastCreateClaimedAccount(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.delegation:
        message = await broadcastDelegation(requestHandler, request, options);
        break;
      case KeychainRequestTypes.witnessVote:
        message = await broadcastWitnessVote(requestHandler, request, options);
        break;
      case KeychainRequestTypes.proxy:
        message = await broadcastProxy(requestHandler, request, options);
        break;
      case KeychainRequestTypes.powerUp:
        message = await broadcastPowerUp(requestHandler, request, options);
        break;
      case KeychainRequestTypes.powerDown:
        message = await broadcastPowerDown(requestHandler, request, options);
        break;
      case KeychainRequestTypes.sendToken:
        message = await broadcastSendToken(requestHandler, request, options);
        break;
      case KeychainRequestTypes.createProposal:
        message = await broadcastCreateProposal(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.updateProposalVote:
        message = await broadcastUpdateProposalVote(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.removeProposal:
        message = await broadcastRemoveProposal(
          requestHandler,
          request,
          options,
        );
        break;
      case KeychainRequestTypes.decode:
        message = await decodeMessage(requestHandler, request);
        break;
      case KeychainRequestTypes.encode:
        message = await encodeMessage(requestHandler, request);
        break;
      case KeychainRequestTypes.encodeWithKeys:
        message = await encodeWithKeys(requestHandler, request);
        break;
      case KeychainRequestTypes.signBuffer:
        message = await signBuffer(requestHandler, request);
        break;
      case KeychainRequestTypes.signTx:
        message = await signTx(requestHandler, request);
        break;
      case KeychainRequestTypes.convert:
        message = await convert(requestHandler, request, options);
        break;
      case KeychainRequestTypes.recurrentTransfer:
        message = await recurrentTransfer(requestHandler, request, options);
        break;
      case KeychainRequestTypes.swap:
        message = await broadcastSwap(requestHandler, request, options);
        break;
    }
    if (message) {
      if (no_confirm) {
        message.command = DialogCommand.SEND_HIVE_RESPONSE;
      }
      CommunicationUtils.tabsSendMessage(tab, message);
      if (!no_confirm) {
        await requestHandler.removeRequestById(request.request_id, tab);
      }
    }
  } catch (e) {
    Logger.error(e);
    sendErrors(
      tab,
      e + '',
      await chrome.i18n.getMessage('unknown_error'),
      await chrome.i18n.getMessage('unknown_error'),
      request,
    );
    if (!no_confirm) {
      await requestHandler.removeRequestById(request.request_id, tab);
    }
  } finally {
    if (no_confirm) {
      addToWhitelist(request.username!, domain, request.type);
    } else if (message) CommunicationUtils.runtimeSendMessage(message);
  }
};
