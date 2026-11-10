import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Screen } from '@interfaces/screen.interface';
import { AccountCreationMode } from '@popup/hive/utils/account-creation.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import {
  LoadingValuesConfiguration,
} from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';
import { defaultChainList } from 'src/popup/multichain/reference-data/chains.list';
import { MultichainScreen } from 'src/popup/multichain/reference-data/multichain-screen.enum';
import { ChainRouterComponent } from 'src/popup/multichain/chain-router.component';
import { ChainUtils } from 'src/popup/multichain/utils/chain.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';
import { EvmOnlyHivePromotionUtils } from 'src/utils/evm-only-hive-promotion.utils';

jest.mock('@popup/evm/evm-app.component', () => ({
  EvmAppComponent: () => <div data-testid="evm-app" />,
}));

jest.mock('@popup/hive/hive-app.component', () => ({
  HiveAppComponent: () => <div data-testid="hive-app" />,
}));

describe('ChainRouter EVM-only Hive promotion', () => {
  const mk = 'test-master-key';
  const evmChain = defaultChainList.find(
    (chain) => chain.type === ChainType.EVM,
  )!;
  const hiveChain = defaultChainList.find(
    (chain) => chain.type === ChainType.HIVE,
  )!;

  beforeEach(() => {
    LoadingValuesConfiguration.set();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.spyOn(LedgerUtils, 'isLedgerSupported').mockResolvedValue(false);
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(mk);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED) return false;
        if (key === LocalStorageKeyEnum.HAS_FINISHED_SIGNUP) return true;
        return undefined;
      });
    jest
      .spyOn(EvmOnlyHivePromotionUtils, 'getEvmOnlyHivePromotionEligibility')
      .mockResolvedValue(true);
    jest
      .spyOn(EvmOnlyHivePromotionUtils, 'setEvmOnlyHivePromotionLastShown')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens the promotion modal through the eligibility helper', async () => {
    renderChainRouter();

    await waitFor(() => {
      expect(
        screen.getByTestId('evm-only-hive-promotion-popup'),
      ).toBeInTheDocument();
    });
    expect(
      EvmOnlyHivePromotionUtils.getEvmOnlyHivePromotionEligibility,
    ).toHaveBeenCalledWith({
      mk,
      walletUnlocked: true,
      sensitiveFlowActive: false,
    });
    expect(
      EvmOnlyHivePromotionUtils.setEvmOnlyHivePromotionLastShown,
    ).toHaveBeenCalledTimes(1);
  });

  it('routes the CTA to paid Hive account creation', async () => {
    jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([hiveChain]);
    const addChainSpy = jest
      .spyOn(ChainUtils, 'addChainToSetupChains')
      .mockResolvedValue(undefined);
    const { fakeStore } = renderChainRouter();

    await userEvent.click(
      await screen.findByTestId('evm-only-hive-promotion-create-account'),
    );

    await waitFor(() => {
      expect(fakeStore.getState().chain).toEqual(hiveChain);
      expect(fakeStore.getState().navigation).toEqual({
        params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
        stack: [
          {
            currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
            params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
          },
        ],
      });
    });
    expect(addChainSpy).toHaveBeenCalledWith(hiveChain);
  });

  it('snoozes the promotion when Maybe later is clicked', async () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-04-28T00:00:00.000Z').getTime());
    const snoozeSpy = jest
      .spyOn(EvmOnlyHivePromotionUtils, 'snoozeEvmOnlyHivePromotion')
      .mockResolvedValue(undefined);

    renderChainRouter();

    await userEvent.click(
      await screen.findByTestId('evm-only-hive-promotion-maybe-later'),
    );

    expect(snoozeSpy).toHaveBeenCalledWith(
      new Date('2026-05-05T00:00:00.000Z'),
    );
    await waitFor(() => {
      expect(
        screen.queryByTestId('evm-only-hive-promotion-popup'),
      ).not.toBeInTheDocument();
    });
  });

  it('permanently dismisses the promotion when Don’t show again is clicked', async () => {
    const dismissSpy = jest
      .spyOn(
        EvmOnlyHivePromotionUtils,
        'dismissEvmOnlyHivePromotionPermanently',
      )
      .mockResolvedValue(undefined);

    renderChainRouter();

    await userEvent.click(
      await screen.findByTestId('evm-only-hive-promotion-dont-show-again'),
    );

    expect(dismissSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(
        screen.queryByTestId('evm-only-hive-promotion-popup'),
      ).not.toBeInTheDocument();
    });
  });

  const renderChainRouter = () => {
    const fakeStore = getFakeStore({
      ...initialEmptyStateStore,
      chain: evmChain,
      hasFinishedSignup: true,
      mk,
      navigation: {
        params: {},
        stack: [{ currentPage: MultichainScreen.HOME_PAGE }],
      },
    });

    return {
      ...render(
        <Provider store={fakeStore}>
          <ChainRouterComponent screen={undefined as any} />
        </Provider>,
      ),
      fakeStore,
    };
  };
});
