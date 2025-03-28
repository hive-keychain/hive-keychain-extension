import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  RequestCreateProposal,
  RequestId,
  RequestRemoveProposal,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import ProposalUtils from 'src/popup/hive/utils/proposal.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastCreateProposal = async (
  requestHandler: RequestsHandler,
  data: RequestCreateProposal & RequestId,
  options?: TransactionOptions,
) => {
  let err, result, err_message;
  const key = requestHandler.data.key;
  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await ProposalUtils.getCreateProposalTransaction(
          data.username,
          data.receiver,
          data.start,
          data.end,
          data.daily_pay,
          data.subject,
          data.permlink,
          data.extensions,
        );
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await ProposalUtils.createProposal(
          data.username,
          data.receiver,
          data.start,
          data.end,
          data.daily_pay,
          data.subject,
          data.permlink,
          data.extensions,
          key!,
        );
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_proposal_create'),
      err_message,
    );
    return message;
  }
};

export const broadcastUpdateProposalVote = async (
  requestHandler: RequestsHandler,
  data: RequestUpdateProposalVote & RequestId,
  options?: TransactionOptions,
) => {
  const key = requestHandler.data.key;
  let result, err, err_message;
  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await ProposalUtils.getUpdateProposalVoteTransaction(
          typeof data.proposal_ids === 'string'
            ? JSON.parse(data.proposal_ids)
            : data.proposal_ids,
          data.username!,
          data.approve,
        );
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await ProposalUtils.updateProposalVotes(
          typeof data.proposal_ids === 'string'
            ? JSON.parse(data.proposal_ids)
            : data.proposal_ids,
          data.username!,
          data.approve,
          key!,
          options,
        );
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    let messageText = '';
    const ids =
      typeof data.proposal_ids === 'string'
        ? JSON.parse(data.proposal_ids)
        : data.proposal_ids;
    if (data.approve) {
      if (ids.length === 1)
        messageText = await chrome.i18n.getMessage('bgd_ops_proposal_vote', [
          ids[0],
        ]);
      else {
        messageText = await chrome.i18n.getMessage('bgd_ops_proposal_votes', [
          ids.join(', #'),
        ]);
      }
    } else {
      if (ids.length === 1)
        messageText = await chrome.i18n.getMessage('bgd_ops_proposal_unvote', [
          ids[0],
        ]);
      else
        messageText = await chrome.i18n.getMessage('bgd_ops_proposal_unvotes', [
          ids.join(', #'),
        ]);
    }
    const message = await createMessage(
      err,
      result,
      data,
      messageText,
      err_message,
    );
    return message;
  }
};

export const broadcastRemoveProposal = async (
  requestHandler: RequestsHandler,
  data: RequestRemoveProposal & RequestId,
  options?: TransactionOptions,
) => {
  let err, result, ids, err_message;
  const key = requestHandler.data.key;
  try {
    ids =
      typeof data.proposal_ids === 'string'
        ? JSON.parse(data.proposal_ids)
        : data.proposal_ids;

    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await ProposalUtils.getRemoveProposalTransaction(
          data.username,
          ids,
          data.extensions,
        );
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await ProposalUtils.removeProposal(
          data.username,
          ids,
          data.extensions,
          key!,
          options,
        );
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_proposal_remove', [ids]),
      err_message,
    );
    return message;
  }
};
