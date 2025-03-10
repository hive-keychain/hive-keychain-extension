import { EvmDeprecatedMethods } from '@background/evm/evm-methods/evm-deprecated-methods.list';
import {
  doesMethodExist,
  EvmMethodPermissionMap,
  EvmNeedPermissionMethods,
  EvmRequestMethod,
  EvmRestrictedMethods,
  EvmUnrestrictedMethods,
} from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { evmRequestWithConfirmation } from '@background/evm/requests/logic/evm-request-with-confirmation.logic';
import { evmRequestWithoutConfirmation } from '@background/evm/requests/logic/evm-request-without-confirmation.logic';
import { handleDeprecatedMethods } from '@background/evm/requests/logic/handle-deprecated-methods.logic';
import { handleEvmError } from '@background/evm/requests/logic/handle-evm-error.logic';
import { handleNonExistingMethod } from '@background/evm/requests/logic/handle-non-existing-methods.logic';
import MkModule from '@background/hive/modules/mk.module';
import {
  initializeWallet,
  unlockWallet,
} from '@background/hive/requests/logic';
import {
  EvmDappInfo,
  EvmRequest,
  getEvmProviderRpcFullError,
} from '@interfaces/evm-provider.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { DappRequestUtils } from 'src/utils/dapp-request.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const initEvmRequestHandler = async (
  request: EvmRequest,
  tab: number | undefined,
  dappInfo: EvmDappInfo,
  requestHandler: EvmRequestHandler,
) => {
  Logger.info('Initializing EVM request logic');

  console.log({ request });

  if (await DappRequestUtils.isDappLocked(dappInfo.domain)) {
    const providerError = getEvmProviderRpcFullError('userReject');
    handleEvmError(
      requestHandler,
      requestHandler.data.tab!,
      request,
      providerError,
      providerError.message,
      [],
    );
  } else if (EvmDeprecatedMethods.includes(request.method)) {
    handleDeprecatedMethods(requestHandler, tab!, request, dappInfo);
  } else if (!doesMethodExist(request.method)) {
    handleNonExistingMethod(requestHandler, tab!, request, dappInfo);
  } else if (EvmUnrestrictedMethods.includes(request.method)) {
    evmRequestWithoutConfirmation(requestHandler, tab!, request, dappInfo);
  } else if (
    EvmRestrictedMethods.includes(request.method) ||
    EvmNeedPermissionMethods.includes(request.method)
  ) {
    const mk = await MkModule.getMk();
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
      initializeWallet(requestHandler, tab!, request);
    } else if (!mk) {
      unlockWallet(
        requestHandler,
        tab!,
        request,
        dappInfo,
        DialogCommand.UNLOCK_EVM,
      );
    } else if (EvmNeedPermissionMethods.includes(request.method)) {
      const hasPermission = await EvmWalletUtils.hasPermission(
        dappInfo.domain,
        EvmMethodPermissionMap[request.method]!,
      );
      if (hasPermission) {
        evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
      } else {
        // return error ?
        console.log('return error ? (Init L82)');
      }
    } else if (EvmRestrictedMethods.includes(request.method)) {
      if (request.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
        if (
          await EvmWalletUtils.hasPermission(
            dappInfo.domain,
            EvmRequestPermission.ETH_ACCOUNTS,
          )
        ) {
          evmRequestWithoutConfirmation(
            requestHandler,
            tab!,
            request,
            dappInfo,
          );
        } else {
          evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
        }
      } else {
        evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
      }
    }
  } else {
    console.log('no case ??');
  }

  requestHandler.saveInLocalStorage();
};
