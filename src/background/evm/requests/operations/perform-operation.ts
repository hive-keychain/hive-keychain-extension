import { EvmRequest } from '@background/evm/provider/evm-provider.interface';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import sendErrors from '@background/multichain/errors';
import Logger from 'src/utils/logger.utils';

export const performEvmOperation = async (
  requestHandler: EvmRequestHandler,
  data: EvmRequest,
  tab: number,
  domain: string,
) => {
  let message = null;
  Logger.info('Perform evm operation');
  try {
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
