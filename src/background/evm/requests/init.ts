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
import { handleNonExistingMethod } from '@background/evm/requests/logic/handle-non-existing-methods.logic';
import MkModule from '@background/hive/modules/mk.module';
import {
  initializeWallet,
  unlockWallet,
} from '@background/hive/requests/logic';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const initEvmRequestHandler = async (
  request: EvmRequest,
  tab: number | undefined,
  dappInfo: EvmDappInfo,
  requestHandler: EvmRequestHandler,
) => {
  Logger.info('Initializing EVM request logic');

  if (EvmDeprecatedMethods.includes(request.method)) {
    console.log('case 1');
    handleDeprecatedMethods(requestHandler, tab!, request, dappInfo);
  } else if (!doesMethodExist(request.method)) {
    console.log('case 2');
    handleNonExistingMethod(requestHandler, tab!, request, dappInfo);
  } else if (EvmUnrestrictedMethods.includes(request.method)) {
    console.log('case 3');
    evmRequestWithoutConfirmation(requestHandler, tab!, request, dappInfo);
  } else if (
    EvmRestrictedMethods.includes(request.method) ||
    EvmNeedPermissionMethods.includes(request.method)
  ) {
    console.log('case 4');
    const mk = await MkModule.getMk();
    const accounts = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_ACCOUNTS,
    );
    if (mk) {
      console.log('case 4-1');
      const rebuiltAccounts =
        await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
      requestHandler.accounts = rebuiltAccounts;
      requestHandler.saveInLocalStorage();
    }
    if (!accounts) {
      console.log('case 4-2');
      initializeWallet(requestHandler, tab!, request);
    } else if (!mk) {
      console.log('case 4-3');
      unlockWallet(
        requestHandler,
        tab!,
        request,
        dappInfo.domain,
        DialogCommand.UNLOCK_EVM,
      );
    } else if (EvmNeedPermissionMethods.includes(request.method)) {
      console.log('case 4-4');
      const hasPermission = await EvmWalletUtils.hasPermission(
        dappInfo.domain,
        EvmMethodPermissionMap[request.method]!,
      );
      if (hasPermission) {
        console.log('case 4-4-1');
        evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
      } else {
        console.log('case 4-4-2');
        // return error ?
      }
    } else if (EvmRestrictedMethods.includes(request.method)) {
      console.log('case 4-5');
      if (request.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
        console.log('case 4-5-1');

        if (
          await EvmWalletUtils.hasPermission(
            dappInfo.domain,
            EvmRequestPermission.ETH_ACCOUNTS,
          )
        ) {
          console.log('case 4-5-1-1');
          evmRequestWithoutConfirmation(
            requestHandler,
            tab!,
            request,
            dappInfo,
          );
        } else {
          console.log('case 4-5-1-2');
          evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
        }
      } else {
        console.log('case 4-5-2');
        evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
      }
    }
  } else {
    console.log('no case ??');
  }

  // if (!accounts) {
  //   initializeWallet(requestHandler, tab!, request);
  // } else if (!mk) {
  //   if (EvmUnrestrictedMethods.includes(request.method)) {
  //     evmRequestWithoutConfirmation(requestHandler, tab!, request, dappInfo);
  //   } else {
  //     unlockWallet(
  //       requestHandler,
  //       tab!,
  //       request,
  //       dappInfo,
  //       DialogCommand.UNLOCK_EVM,
  //     );
  //   }
  // } else if (!doesMethodExist(request.method)) {
  //   handleNonExistingMethod(requestHandler, tab!, request, dappInfo);
  // } else if (EvmDeprecatedMethods.includes(request.method)) {
  //   handleDeprecatedMethods(requestHandler, tab!, request, dappInfo);
  // } else if (EvmUnrestrictedMethods.includes(request.method)) {
  //   if (
  //     request.method === EvmRequestMethod.REQUEST_ACCOUNTS ||
  //     request.method === EvmRequestMethod.GET_ACCOUNTS
  //   ) {
  //     const connectedWallets = await EvmWalletUtils.getConnectedWallets(dappInfo);
  //     if (connectedWallets.length === 0) {
  //       evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
  //     } else {
  //       evmRequestWithoutConfirmation(requestHandler, tab!, request, dappInfo);
  //     }
  //   } else {
  //     evmRequestWithoutConfirmation(requestHandler, tab!, request, dappInfo);
  //   }
  // } else {
  //   evmRequestWithConfirmation(requestHandler, tab!, request, dappInfo);
  // }

  requestHandler.saveInLocalStorage();
};
