import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import sendErrors from '@background/multichain/errors';
import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import Logger from 'src/utils/logger.utils';

export const performEvmOperation = async (
  requestHandler: EvmRequestHandler,
  data: EvmRequest,
  tab: number,
  domain: string,
) => {
  let message = null;

  console.log(requestHandler, data, tab, domain);

  Logger.info('Perform evm operation');

  try {
    switch (data.method) {
      case EvmRequestMethod.ETH_SIGN_DATA_4: {
        // TODO integrate MM signing library
      }
    }
  } catch (error) {
    Logger.error(error);
    sendErrors(
      requestHandler,
      tab,
      error + '',
      await chrome.i18n.getMessage('unknown_error'),
      await chrome.i18n.getMessage('unknown_error'),
      data,
    );
  }
};
