import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { personalSign } from '@background/evm/requests/operations/ops/personal-sign';
import { signV4 } from '@background/evm/requests/operations/ops/sign-v4';
import sendErrors from '@background/multichain/errors';
import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import { sendEvmResponseToServiceWorker } from 'src/content-scripts/hive/web-interface/response.logic';
import Logger from 'src/utils/logger.utils';

export const performEvmOperation = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  tab: number,
  domain: string,
) => {
  let message = null;

  Logger.info('Perform evm operation');

  try {
    switch (request.method) {
      case EvmRequestMethod.ETH_SIGN_DATA_4: {
        message = await signV4(requestHandler, request);
        break;
      }
      case EvmRequestMethod.PERSONAL_SIGN: {
        message = await personalSign(requestHandler, request);
        break;
      }
    }
    // console.log({ message, chrome, tab }, 'in perform operation');
    sendEvmResponseToServiceWorker(request, message, chrome);
    chrome.tabs.sendMessage(tab, message);
  } catch (error) {
    Logger.error(error);
    sendErrors(
      requestHandler,
      tab,
      error + '',
      await chrome.i18n.getMessage('unknown_error'),
      await chrome.i18n.getMessage('unknown_error'),
      request,
    );
  }
};
