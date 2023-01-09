import { TransactionConfirmation } from '@hiveio/dhive';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { AssertionError } from 'assert';
//TODO refactor and try to re-use code here
//  Needed:
//  answer: success & error.
export default {
  error: {
    hasAuthority: (
      datas: any,
      request_id: number,
      error?: any,
      message?: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: error ?? new Error('Already has authority'),
          result: undefined,
          data: datas,
          message:
            message ??
            `${chrome.i18n.getMessage(
              'bgd_ops_error',
            )} : Already has authority`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    keyBuffer: (
      datas: any,
      request_id: number,
      error?: Error | TypeError,
      message?: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: error ?? new TypeError('private key should be a Buffer'),
          result: undefined,
          data: datas,
          message:
            message ??
            `${chrome.i18n.getMessage(
              'bgd_ops_error',
            )} : private key should be a Buffer`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    nothingToRemove: (
      datas: any,
      request_id: number,
      error?: any,
      message?: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: error ?? new Error('Nothing to remove'),
          result: undefined,
          data: datas,
          message:
            message ??
            `${chrome.i18n.getMessage('bgd_ops_error')} : Nothing to remove`,
          request_id,
          publicKey: undefined,
        },
      };
    },
    missingAuthority: (
      datas: any,
      request_id: number,
      error?: any,
      message?: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: error ?? new Error('Missing authority'),
          result: undefined,
          data: datas,
          message:
            message ??
            `${chrome.i18n.getMessage('bgd_ops_error')} : Missing authority`,
          request_id,
          publicKey: undefined,
        },
      };
    },
    parsedFailed: (
      datas: any,
      request_id: number,
      error?: SyntaxError,
      message?: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error:
            error ??
            new SyntaxError('Unexpected token / in JSON at position 0'),
          result: undefined,
          data: datas,
          message:
            message ??
            `${chrome.i18n.getMessage(
              'bgd_ops_error',
            )} : Unexpected token / in JSON at position 0`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    notIterable: (
      datas: any,
      request_id: number,
      error?: TypeError,
      message?: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: error ?? new TypeError('operations is not iterable'),
          result: undefined,
          data: datas,
          message:
            message ??
            `${chrome.i18n.getMessage(
              'bgd_ops_error',
            )} : operations is not iterable`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    receiverMemoKey: (datas: any, request_id: number) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('Failed to load receiver memo key'),
          result: undefined,
          data: datas,
          message: `${chrome.i18n.getMessage(
            'bgd_ops_error',
          )} : Failed to load receiver memo key`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    missingKey: (
      datas: any,
      request_id: number,
      keyName: KeychainKeyTypesLC,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error(`Failed to load user ${keyName} key`),
          result: undefined,
          data: datas,
          message: `${chrome.i18n.getMessage(
            'bgd_ops_error',
          )} : Failed to load user ${keyName} key`,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    /**
     * @param error
     * Note: AssertionError {expected: true,operator: '==',message: errorTitle,}
     */
    answerError: (
      error: AssertionError | TypeError | SyntaxError,
      datas: any,
      request_id: number,
      message: string,
      result: any,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: error,
          result: result,
          data: datas,
          message: message,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
  },
  success: {
    addAuth: (
      result: TransactionConfirmation | boolean,
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
    removedAuth: (
      result: TransactionConfirmation | boolean,
      datas: any,
      request_id: number,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: result,
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_remove_auth', [
            datas.role.toLowerCase(),
            datas.authorizedUsername,
            datas.username,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    addKey: (
      result: TransactionConfirmation | boolean,
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
          message: chrome.i18n.getMessage('bgd_ops_add_key_auth', [
            datas.authorizedKey,
            chrome.i18n.getMessage(datas.role.toLowerCase()),
            datas.username,
            datas.weight + '',
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    removedKey: (
      result: TransactionConfirmation | boolean,
      datas: any,
      request_id: number,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: result,
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_remove_key_auth', [
            datas.authorizedKey,
            chrome.i18n.getMessage(datas.role.toLowerCase()),
            datas.username,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    broadcast: (
      result: TransactionConfirmation | boolean,
      datas: any,
      request_id: number,
      message: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: result,
          data: datas,
          message: message,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    convert: (
      result: TransactionConfirmation | Boolean,
      datas: any,
      request_id: number,
      collateralized: boolean,
    ) => {
      const keyMsg = collateralized
        ? 'bgd_ops_convert_collaterized'
        : 'bgd_ops_convert';
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: result,
          data: datas,
          message: chrome.i18n.getMessage(keyMsg, [
            datas.amount,
            datas.username,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    decoded: (
      result: string,
      datas: any,
      request_id: number,
      message: string,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: null,
          result: result,
          data: datas,
          message: message,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
    answerSucess: (
      result: any,
      datas: any,
      request_id: number,
      message: string,
      error: undefined | null,
    ) => {
      return {
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: error,
          result: result,
          data: datas,
          message: message,
          request_id: request_id,
          publicKey: undefined,
        },
      };
    },
  },
};
