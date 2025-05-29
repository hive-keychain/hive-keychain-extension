import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { handleEvmError } from '@background/evm/requests/logic/handle-evm-error.logic';
import { decryptMessage } from '@background/evm/requests/operations/ops/decrypt-message';
import { getEncryptionKey } from '@background/evm/requests/operations/ops/get-encryption-key';
import { personalSign } from '@background/evm/requests/operations/ops/personal-sign';
import { sendEvmTransaction } from '@background/evm/requests/operations/ops/send-transaction';
import { signData } from '@background/evm/requests/operations/ops/sign-data';
import {
  EvmRequest,
  getErrorFromEtherJS,
} from '@interfaces/evm-provider.interface';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';

export const performEvmOperation = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  tab: number,
  domain: string,
  extraData: any,
) => {
  let message = null;
  let result = null;

  Logger.info('Perform evm operation');

  try {
    switch (request.method) {
      case EvmRequestMethod.ETH_SIGN_DATA_4: {
        message = await signData(
          requestHandler,
          request,
          SignTypedDataVersion.V4,
        );
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.ETH_SIGN_DATA_3: {
        message = await signData(
          requestHandler,
          request,
          SignTypedDataVersion.V3,
        );
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.ETH_SIGN_DATA: {
        message = await signData(
          requestHandler,
          request,
          SignTypedDataVersion.V1,
        );
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.PERSONAL_SIGN: {
        message = await personalSign(requestHandler, request);
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.GET_ENCRYPTION_KEY: {
        message = await getEncryptionKey(requestHandler, request);
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.ETH_DECRYPT: {
        message = await decryptMessage(requestHandler, request);
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.SEND_TRANSACTION: {
        message = await sendEvmTransaction(requestHandler, request, extraData);
        result = message?.msg.result;
        break;
      }
    }
    chrome.tabs.sendMessage(tab, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: { requestId: request.request_id, result: result },
    });
  } catch (err) {
    const error = err as any;

    const etherJSError = getErrorFromEtherJS(error.code);
    handleEvmError(
      requestHandler,
      requestHandler.data.tab!,
      request,
      etherJSError,
      etherJSError.message,
      [],
    );
  }
};
