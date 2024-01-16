import getMessage from '@background/utils/i18n.utils';
import { KeychainRequestData, RequestId } from '@interfaces/keychain.interface';
import { Key } from '@interfaces/keys.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const createMessage = (
  err: any,
  result: any,
  datas: KeychainRequestData & RequestId,
  success_message: string | null,
  fail_message?: string | null,
  publicKey?: Key,
) => {
  let message;
  if (result.isUsingMultisig) {
    message = getMessage('multisig_transaction_sent_to_signers');
  } else {
    message = !err ? success_message : fail_message;
  }
  const { request_id, ...data } = datas;
  return {
    command: DialogCommand.ANSWER_REQUEST,
    msg: {
      success: !err,
      error: err,
      result: result,
      data: data,
      message: message,
      request_id,
      publicKey,
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
    return await chrome.i18n.getMessage('unknown_error');
  return `${await chrome.i18n.getMessage('bgd_ops_error')} : ${error}`;
};
