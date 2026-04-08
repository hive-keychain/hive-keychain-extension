import '@testing-library/jest-dom';
import { act, cleanup } from '@testing-library/react';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { EvmHomeComponent } from 'src/popup/evm/pages/home/evm-home.component';
import { SurveyUtils } from 'src/popup/hive/utils/survey.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';

jest.mock(
  'src/common-ui/_containers/homepage-container/homepage-container.component',
  () => ({
    HomepageContainer: ({ children, datatestId }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': datatestId }, children);
    },
  }),
);

jest.mock('src/common-ui/_containers/top-bar/top-bar.component', () => ({
  TopBarComponent: ({ accountSelector }: any) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, accountSelector);
  },
}));

jest.mock(
  '@popup/evm/pages/home/evm-select-account-section/evm-select-account-section.component',
  () => ({
    EvmSelectAccountSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'evm-account-selector',
      });
    },
  }),
);

jest.mock(
  '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section.component',
  () => ({
    EvmWalletInfoSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'evm-wallet-info-section',
      });
    },
  }),
);

jest.mock('@popup/evm/pages/home/evm-dapp-status/evm-dapp-status.component', () => ({
  EvmDappStatusComponent: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'evm-dapp-status' });
  },
}));

jest.mock(
  'src/common-ui/estimated-account-value-section/estimated-account-value-section.component',
  () => ({
    EstimatedAccountValueSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'estimated-account-value-section',
      });
    },
  }),
);

jest.mock(
  'src/popup/hive/pages/app-container/home/actions-section/actions-section.component',
  () => ({
    ActionsSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'actions-section' });
    },
  }),
);

jest.mock(
  'src/popup/hive/pages/app-container/home/voting-section/proposal-voting-section/proposal-voting-section.component',
  () => ({
    ProposalVotingSectionComponent: () => {
      const React = require('react');
      return React.createElement('div', {
        'data-testid': 'proposal-voting-section',
      });
    },
  }),
);

jest.mock(
  '@popup/hive/pages/app-container/tutorial-popup/tutorial-popup.component',
  () => ({
    TutorialPopupComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'tutorial-popup' });
    },
  }),
);

jest.mock('src/popup/hive/pages/app-container/survey/survey.component', () => ({
  SurveyComponent: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'survey' });
  },
}));

jest.mock(
  'src/popup/hive/pages/app-container/whats-new/whats-new.component',
  () => ({
    WhatsNewComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'whats-new-popup' });
    },
  }),
);

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('evm-home unmount behavior', () => {
  const hasUnmountedStateUpdateWarning = (
    consoleError: jest.SpyInstance<void, any[]>,
  ) =>
    consoleError.mock.calls.some((call) =>
      call.some(
        (arg) =>
          typeof arg === 'string' &&
          arg.includes(
            "Can't perform a React state update on an unmounted component",
          ),
      ),
    );

  beforeEach(() => {
    chrome.i18n.getMessage = jest.fn((key: string) => key);
    chrome.runtime.getManifest = jest.fn(() => ({
      version: '1.0.0',
      name: 'Hive Keychain',
    })) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('does not update local state after async initializers resolve post-unmount', async () => {
    const pendingTransactionsDeferred = createDeferred<any>();
    const surveyDeferred = createDeferred<any>();
    const switchRpcDeferred = createDeferred<any>();
    const versionLogDeferred = createDeferred<any>();
    const initialRpc = { url: 'https://rpc.example', isDefault: true };
    const backupRpc = { url: 'https://backup-rpc.example', isDefault: false };
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;

    jest
      .spyOn(EvmTransactionsUtils, 'hasPendingTransaction')
      .mockReturnValue(pendingTransactionsDeferred.promise);
    jest.spyOn(SurveyUtils, 'getSurvey').mockReturnValue(surveyDeferred.promise);
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue(initialRpc as any);
    jest.spyOn(EvmRpcUtils, 'checkRpcStatus').mockResolvedValue(false);
    jest.spyOn(EvmRpcUtils, 'getSwitchRpcAuto').mockResolvedValue(false);
    jest
      .spyOn(EvmRpcUtils, 'switchToWorkingRpc')
      .mockReturnValue(switchRpcDeferred.promise);
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockImplementation(
      async (key: LocalStorageKeyEnum) => {
        switch (key) {
          case LocalStorageKeyEnum.LAST_VERSION_UPDATE:
            return '0.9';
          default:
            return undefined;
        }
      },
    );
    jest
      .spyOn(VersionLogUtils, 'getLastVersion')
      .mockReturnValue(versionLogDeferred.promise);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = customRender(<EvmHomeComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
          logo: '',
          rpcs: [initialRpc],
          mainToken: 'ETH',
          defaultTransactionType: EvmTransactionType.EIP_1559,
        },
        evm: {
          ...initialEmptyStateStore.evm,
          accounts: [
            {
              id: 0,
              path: "m/44'/60'/0'/0/0",
              seedId: 1,
              seedNickname: 'Main seed',
              nickname: 'Account 1',
              wallet,
            },
          ],
          activeAccount: {
            ...initialEmptyStateStore.evm.activeAccount,
            address: wallet.address,
            wallet,
            isReady: true,
            nativeAndErc20Tokens: {
              value: [
                {
                  formattedBalance: '1',
                  shortFormattedBalance: '1',
                  balance: 1000000000000000000n,
                  balanceInteger: 1,
                  tokenInfo: {
                    name: 'Ether',
                    symbol: 'ETH',
                    logo: '',
                    chainId: '1',
                    backgroundColor: '#000000',
                    coingeckoId: 'ethereum',
                    priceUsd: 3000,
                    createdAt: '',
                    categories: [],
                    type: EVMSmartContractType.NATIVE,
                  },
                },
              ],
              loading: false,
            },
          },
        },
      },
    });

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    await act(async () => {
      pendingTransactionsDeferred.resolve({
        hasPending: false,
        pendingTransactionsCount: 0,
        queuedTransactionsCount: 0,
        pendingTransactionDetails: {
          nonce: 0,
          title: 'pending',
          label: 'pending',
        },
      });
      surveyDeferred.resolve(undefined);
      versionLogDeferred.resolve({
        version: '1.0',
        features: { en: [] },
        url: 'https://example.com',
      });
      switchRpcDeferred.resolve(backupRpc);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });
});
