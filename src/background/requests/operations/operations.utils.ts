import { KeychainRequestData, RequestId } from '@interfaces/keychain.interface';

export const createMessage = (
  err: any,
  result: any,
  datas: KeychainRequestData & RequestId,
  success_message: string | null,
  fail_message: string | null,
  publicKey?: string,
) => {
  const { request_id, ...data } = datas;
  return {
    command: 'answerRequest',
    msg: {
      success: !err,
      error: err,
      result: result,
      data: data,
      message: !err ? success_message : fail_message,
      request_id,
      publicKey,
    },
  };
};

export const beautifyErrorMessage = (err: any) => {
  console.log(err);
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
    return chrome.i18n.getMessage('unknown_error');
  return `${chrome.i18n.getMessage('bgd_ops_error')} : ${error}`;
};
