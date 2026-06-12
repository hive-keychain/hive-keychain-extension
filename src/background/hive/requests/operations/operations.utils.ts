import {
  AnswerDialogMessage,
  DialogMessage,
} from '@background/multichain/background-message.interface';
import { KeychainRequestData, RequestId } from '@interfaces/keychain.interface';
import { Key } from '@interfaces/keys.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

import { I18nUtils } from 'src/utils/i18n.utils';

export namespace OperationsUtils {
  export type FeedbackI18n = {
    key: string;
    params?: string[];
  };

  export type FeedbackPlain = {
    plain: string;
  };

  export type FeedbackContent = FeedbackI18n | FeedbackPlain;
}

export const feedbackI18n = (
  key: string,
  params?: string[],
): OperationsUtils.FeedbackI18n => ({
  key,
  ...(params?.length ? { params } : {}),
});

export const feedbackPlain = (plain: string): OperationsUtils.FeedbackPlain => ({
  plain,
});

const isPlainFeedback = (
  content: OperationsUtils.FeedbackContent,
): content is OperationsUtils.FeedbackPlain => {
  return 'plain' in content;
};

const resolveFeedback = async (
  content: OperationsUtils.FeedbackContent | null | undefined,
) => {
  if (!content) {
    return { message: '' };
  }

  if (isPlainFeedback(content)) {
    return { message: content.plain };
  }

  const message = await I18nUtils.getMessage(content.key, content.params);
  // Unknown keys fall back to the key string; render those as plain text in the dialog.
  if (message === content.key) {
    return { message };
  }

  return {
    messageKey: content.key,
    messageParams: content.params,
    message,
  };
};

export const createMessage = async (
  err: any,
  result: any,
  datas: KeychainRequestData & RequestId,
  tab: number,
  success_message: OperationsUtils.FeedbackContent | null,
  fail_message?: OperationsUtils.FeedbackContent | null,
  publicKey?: Key,
): Promise<DialogMessage> => {
  const feedback =
    result?.isUsingMultisig && result?.tx_id?.length === 0
      ? await resolveFeedback(
          feedbackI18n('multisig_transaction_sent_to_signers'),
        )
      : await resolveFeedback(!err ? success_message : fail_message);

  const { request_id, ...data } = datas;
  return {
    command: DialogCommand.ANSWER_REQUEST,
    msg: {
      success: !err,
      error: err,
      result: result,
      data: data,
      message: feedback.message,
      messageKey: feedback.messageKey,
      messageParams: feedback.messageParams,
      request_id,
      publicKey,
      tab: tab,
    },
  };
};

export const createEvmMessage = async (
  err: any,
  result: any,
  datas: any, // TODO change type
  tabId: number,
  success_message: OperationsUtils.FeedbackContent | null,
  fail_message?: OperationsUtils.FeedbackContent | null,
  publicKey?: Key,
): Promise<AnswerDialogMessage> => {
  const feedback = await resolveFeedback(!err ? success_message : fail_message);
  const { request_id, ...data } = datas;
  return {
    command: DialogCommand.ANSWER_EVM_REQUEST,
    msg: {
      success: !err,
      error: err,
      result: result,
      data: data,
      message: feedback.message,
      messageKey: feedback.messageKey,
      messageParams: feedback.messageParams,
      request_id,
      publicKey,
      tab: tabId,
    },
  };
};

export const beautifyErrorMessage = async (err: any) => {
  if (!err) return null;
  let error = '';
  if (err.message.indexOf('xception:') !== -1) {
    error = err.message.split('xception:').pop().replace('.rethrow', '.');
  } else if (err.message.indexOf(':') !== -1) {
    error = err.message.split(':').pop();
  } else {
    error = err.message;
  }
  if (error.replace(' ', '') === '')
    return await I18nUtils.getMessage('unknown_error');
  return `${await I18nUtils.getMessage('bgd_ops_error')} : ${error}`;
};

export const OperationsUtils = {
  feedbackI18n,
  feedbackPlain,
  createMessage,
  createEvmMessage,
  beautifyErrorMessage,
};
