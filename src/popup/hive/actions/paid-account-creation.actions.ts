import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@interfaces/screen.interface';
import { setAccounts } from '@popup/hive/actions/account.actions';
import { loadActiveAccount } from '@popup/hive/actions/active-account.actions';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import {
  ChainType,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { PaidAccountCreationNotificationsUtils } from 'src/popup/hive/utils/paid-account-creation-notifications.utils';
import {
  PaidAccountCreationSynchronizationResult,
  PaidAccountCreationSyncUtils,
} from 'src/utils/paid-account-creation-sync.utils';
import Logger from 'src/utils/logger.utils';

export type {
  PaidAccountCreationSynchronizationOutcome,
  PaidAccountCreationSynchronizationResult,
} from 'src/utils/paid-account-creation-sync.utils';

export interface CompletePaidHiveAccountCreationOptions {
  activateCreatedAccount?: boolean;
  navigateToHomeAfterActivation?: boolean;
  showSuccessMessage?: boolean;
  showBrowserNotification?: boolean;
}

const resolveHiveChain = async (): Promise<HiveChain | undefined> => {
  const setupHiveChains =
    await ChainUtils.getAllSetupChainsForType<HiveChain>(ChainType.HIVE);
  if (setupHiveChains[0]) {
    return setupHiveChains[0];
  }
  const defaultChains = await ChainUtils.getDefaultChains();
  return defaultChains.find((chain) => chain.type === ChainType.HIVE) as
    | HiveChain
    | undefined;
};

export const completePaidHiveAccountCreation =
  (
    account: LocalAccount,
    options: CompletePaidHiveAccountCreationOptions = {},
  ): AppThunk =>
  async (dispatch) => {
    const {
      activateCreatedAccount = false,
      navigateToHomeAfterActivation = false,
      showSuccessMessage = true,
    } = options;

    if (activateCreatedAccount) {
      const hiveChain = await resolveHiveChain();
      if (!hiveChain) {
        throw new Error('Unable to find Hive chain.');
      }

      await dispatch(setChain(hiveChain));
      dispatch(setActiveAccountType(ChainType.HIVE));
      try {
        await dispatch(loadActiveAccount(account));
      } catch (error) {
        Logger.error('Unable to activate created Hive account', error);
      }
      if (navigateToHomeAfterActivation) {
        dispatch(navigateTo(Screen.HOME_PAGE, true));
      }
    }

    if (showSuccessMessage) {
      dispatch(setSuccessMessage('html_popup_create_account_successful'));
    }
  };

export const synchronizePendingHiveAccountCreation =
  (
    requestId: string,
  ): AppThunk<Promise<PaidAccountCreationSynchronizationResult>> =>
  async (dispatch, getState) => {
    const { mk } = getState();
    return PaidAccountCreationSyncUtils.synchronizePendingHiveAccountCreationRequest(
      requestId,
      mk,
      getState().hive.accounts as LocalAccount[],
      async (updatedAccounts) => {
        await AccountUtils.saveAccounts(updatedAccounts, mk);
        dispatch(setAccounts(updatedAccounts));
      },
    );
  };

export const synchronizePendingHiveAccountCreations =
  (): AppThunk<Promise<PaidAccountCreationSynchronizationResult[]>> =>
  async (dispatch, getState) => {
    const { mk } = getState();

    try {
      return await PaidAccountCreationSyncUtils.synchronizePendingHiveAccountCreationRequests(
        mk,
        () => getState().hive.accounts as LocalAccount[],
        async (updatedAccounts) => {
          await AccountUtils.saveAccounts(updatedAccounts, mk);
          dispatch(setAccounts(updatedAccounts));
        },
        (requestId, error) => {
          Logger.error(
            `Unable to synchronize pending Hive account creation ${requestId}`,
            error,
          );
        },
      );
    } catch (error) {
      Logger.error('Unable to load pending Hive account creations', error);
      return [];
    }
  };

export const handleCompletedPaidHiveAccountCreations =
  (
    results: PaidAccountCreationSynchronizationResult[],
    options: CompletePaidHiveAccountCreationOptions = {},
  ): AppThunk =>
  async (dispatch) => {
    for (const result of results) {
      if (
        (result.outcome !== 'imported' &&
          result.outcome !== 'already_imported') ||
        !result.account
      ) {
        continue;
      }

      await dispatch(completePaidHiveAccountCreation(result.account, options));

      if (
        options.showBrowserNotification &&
        result.request?.requestId &&
        result.account
      ) {
        await PaidAccountCreationNotificationsUtils.showAccountCreatedNotification(
          result.account.name,
          result.request.requestId,
        );
      }
    }
  };

export const PaidAccountCreationActions = {
  isTerminalPaidAccountCreationFailure:
    PaidAccountCreationSyncUtils.isTerminalPaidAccountCreationFailure,
  synchronizePendingHiveAccountCreation,
  synchronizePendingHiveAccountCreations,
  completePaidHiveAccountCreation,
  handleCompletedPaidHiveAccountCreations,
};
