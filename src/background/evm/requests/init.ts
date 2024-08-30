import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { evmRequestWithConfirmation } from '@background/evm/requests/logic/evmRequestWithConfirmation.logic';
import MkModule from '@background/hive/modules/mk.module';
import {
  initializeWallet,
  unlockWallet,
} from '@background/hive/requests/logic';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
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

  console.log({ request, tab, domain, requestHandler });

  if (!accounts) {
    initializeWallet(requestHandler, tab!, request);
  } else if (!mk) {
    unlockWallet(
      requestHandler,
      tab!,
      request,
      domain,
      DialogCommand.UNLOCK_EVM,
    );
  } else {
    const rebuiltAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    console.log('in init', { requestHandler });
    requestHandler.accounts = rebuiltAccounts.map(
      (account) => account.wallet.address,
    );
    console.log('evnRequestWithConfirmatio');
    evmRequestWithConfirmation(requestHandler, tab!, request, domain);
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
