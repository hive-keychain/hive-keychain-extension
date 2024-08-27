import { EvmRequest } from '@background/evm/provider/evm-provider.interface';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import MkModule from '@background/hive/modules/mk.module';
import Logger from 'src/utils/logger.utils';

export const initEvmRequestHandler = async (
  request: EvmRequest,
  tab: number | undefined,
  domain: string,
  requestHandler: EvmRequestHandler,
) => {
  const mk = await MkModule.getMk();
  Logger.info('Initializing request logic');

  // Logic.requestWithConfirmation(
  //   requestHandler,
  //   tab!,
  //   req,
  //   domain,
  //   rpc,
  // );

  requestHandler.saveInLocalStorage();
};
