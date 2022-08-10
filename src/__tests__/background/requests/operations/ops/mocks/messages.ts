import { TransactionConfirmation } from '@hiveio/dhive';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export default {
  error: {
    hasAuthority: (datas: any, request_id: number) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('Already has authority'),
          result: undefined,
          data: datas,
          message: `${chrome.i18n.getMessage(
            'bgd_ops_error',
          )} : Already has authority`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    keyBuffer: (datas: any, request_id: number) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new TypeError(),
          result: undefined,
          data: datas,
          message: `${chrome.i18n.getMessage(
            'bgd_ops_error',
          )} : private key should be a Buffer`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
  },
  success: {
    addAuth: (
      result: TransactionConfirmation,
      datas: any,
      cloneData: any,
      request_id: number,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: result,
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_add_auth', [
            cloneData.role.toLowerCase(),
            cloneData.authorizedUsername,
            cloneData.username,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
  },
};
