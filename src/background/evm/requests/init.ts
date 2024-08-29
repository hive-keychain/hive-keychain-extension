import { EvmRequest } from '@background/evm/provider/evm-provider.interface';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import MkModule from '@background/hive/modules/mk.module';
import {
  initializeWallet,
  unlockWallet,
} from '@background/hive/requests/logic';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const initEvmRequestHandler = async (
  request: EvmRequest,
  tab: number | undefined,
  domain: string,
  requestHandler: EvmRequestHandler,
) => {
  const mk = await MkModule.getMk();
  Logger.info('Initializing EVM request logic');
  const accounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );

  if (!accounts) {
    initializeWallet(requestHandler, tab!, request);
  } else if (!mk) {
    unlockWallet(requestHandler, tab!, request, domain);
  }

  // Logic.requestWithConfirmation(
  //   requestHandler,
  //   tab!,
  //   req,
  //   domain,
  //   rpc,
  // );

  requestHandler.saveInLocalStorage();
};
