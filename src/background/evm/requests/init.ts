import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { EvmUnrestrictedMethods } from '@background/evm/requests/evm-unrestricted-methods.list';
import { evmRequestWithConfirmation } from '@background/evm/requests/logic/evm-request-with-confirmation.logic';
import { evmRequestWithoutConfirmation } from '@background/evm/requests/logic/evm-request-without-confirmation.logic';
import MkModule from '@background/hive/modules/mk.module';
import {
  initializeWallet,
  unlockWallet,
} from '@background/hive/requests/logic';
import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
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

  if (mk) {
    const rebuiltAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    requestHandler.accounts = rebuiltAccounts;
    requestHandler.saveInLocalStorage();
  }

  if (!accounts) {
    console.log('initialize wallet');
    initializeWallet(requestHandler, tab!, request);
  } else if (!mk) {
    console.log('no mk', request);
    unlockWallet(
      requestHandler,
      tab!,
      request,
      domain,
      DialogCommand.UNLOCK_EVM,
    );
  } else if (EvmUnrestrictedMethods.includes(request.method)) {
    console.log('unrestricted method', request);
    if (
      request.method === EvmRequestMethod.REQUEST_ACCOUNTS ||
      request.method === EvmRequestMethod.GET_ACCOUNTS
    ) {
      const connectedWallets = await EvmWalletUtils.getConnectedWallets(domain);
      console.log(connectedWallets);
      if (connectedWallets.length === 0) {
        evmRequestWithConfirmation(requestHandler, tab!, request, domain);
      } else {
        evmRequestWithoutConfirmation(requestHandler, tab!, request, domain);
      }
    } else {
      console.log('not request/get accounts', request);
      evmRequestWithoutConfirmation(requestHandler, tab!, request, domain);
    }
  } else {
    console.log('restricted function', request);
    evmRequestWithConfirmation(requestHandler, tab!, request, domain);
  }

  requestHandler.saveInLocalStorage();
};
