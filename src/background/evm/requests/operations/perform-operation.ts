import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { personalSign } from '@background/evm/requests/operations/ops/personal-sign';
import { signV4 } from '@background/evm/requests/operations/ops/sign-v4';
import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';

export const performEvmOperation = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  tab: number,
  domain: string,
) => {
  let message = null;
  let result = null;

  Logger.info('Perform evm operation');

  try {
    switch (request.method) {
      case EvmRequestMethod.ETH_SIGN_DATA_4: {
        message = await signV4(requestHandler, request);
        result = message?.msg.result;
        break;
      }
      case EvmRequestMethod.PERSONAL_SIGN: {
        message = await personalSign(requestHandler, request);
        result = message?.msg.result;
        break;
      }
    }
    chrome.tabs.sendMessage(tab, {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: { requestId: request.request_id, result: result },
    });
  } catch (error) {
    Logger.error(error);
    // sendErrors(
    //   requestHandler,
    //   tab,
    //   error + '',
    //   await chrome.i18n.getMessage('unknown_error'),
    //   await chrome.i18n.getMessage('unknown_error'),
    //   request,
    // );
  } finally {
    chrome.runtime.sendMessage(message);
  }
};
