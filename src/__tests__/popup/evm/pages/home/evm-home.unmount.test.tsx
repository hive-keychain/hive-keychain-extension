import { Screen } from '@interfaces/screen.interface';
import {
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import '@testing-library/jest-dom';
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { EvmHomeComponent } from 'src/popup/evm/pages/home/evm-home.component';
import { EvmScreen } from 'src/popup/evm/reference-data/evm-screen.enum';
import { SurveyUtils } from 'src/popup/hive/utils/survey.utils';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
jest.mock(
  'src/common-ui/_containers/homepage-container/homepage-container.component',
  () => ({
    HomepageContainer: ({ children, datatestId }: any) => {
      const React = require('react');
      return React.createElement(
        'div',
        { 'data-testid': datatestId },
        children,
      );
    },
  }),
);

jest.mock('src/common-ui/_containers/top-bar/top-bar.component', () => ({
  TopBarComponent: ({ accountSelector }: any) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, accountSelector);
  },
}));

jest.mock('src/common-ui/account-selector/account-selector.component', () => ({
  AccountSelectorComponent: () => {
    const React = require('react');
    return React.createElement('div', {
      'data-testid': 'evm-account-selector',
    });
  },
}));

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

jest.mock(
  '@popup/evm/pages/home/evm-dapp-status/evm-dapp-status.component',
  () => ({
    EvmDappStatusComponent: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'evm-dapp-status' });
    },
  }),
);

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
    I18nUtils.getMessage = jest.fn((key: string) => key);
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
    jest
      .spyOn(SurveyUtils, 'getSurvey')
      .mockReturnValue(surveyDeferred.promise);
    jest
      .spyOn(EvmRpcUtils, 'getActiveRpc')
      .mockResolvedValue(initialRpc as any);
    jest.spyOn(EvmRpcUtils, 'checkRpcStatus').mockResolvedValue(false);
    jest.spyOn(EvmRpcUtils, 'getSwitchRpcAuto').mockResolvedValue(false);
    jest
      .spyOn(EvmRpcUtils, 'switchToWorkingRpc')
      .mockReturnValue(switchRpcDeferred.promise);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key: LocalStorageKeyEnum) => {
        switch (key) {
          case LocalStorageKeyEnum.LAST_VERSION_UPDATE:
            return '0.9';
          default:
            return undefined;
        }
      });
    jest
      .spyOn(VersionLogUtils, 'getLastVersion')
      .mockReturnValue(versionLogDeferred.promise);

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

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

  it('opens a pending transaction result with the stored display item', async () => {
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;
    const displayItem = {
      pageTitle: 'popup_html_transfer_funds',
      type: EvmUserHistoryItemType.TRANSFER_OUT,
      blockNumber: 0,
      transactionHash: '0xpending',
      transactionIndex: 0,
      timestamp: 123,
      label: 'Pending transfer display',
      nonce: 5,
      receiverAddress: '0x0000000000000000000000000000000000000001',
      detailFields: [
        {
          label: 'popup_html_transfer_amount',
          value: '1 ETH',
          type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
        },
      ],
    };

    jest
      .spyOn(EvmTransactionsUtils, 'hasPendingTransaction')
      .mockResolvedValue({
        hasPending: true,
        pendingTransactionsCount: 1,
        queuedTransactionsCount: 0,
        pendingTransactionDetails: {
          nonce: 5,
          title: 'evm_one_pending_transaction',
          label: 'Pending transfer display',
          transactionResponse: {
            hash: '0xpending',
            nonce: 5,
            from: wallet.address,
            to: '0x0000000000000000000000000000000000000001',
            value: 1000000000000000000n,
            data: '0x',
            gasLimit: 21000n,
            maxFeePerGas: 100n,
          } as any,
          displayItem,
        },
      });
    jest.spyOn(SurveyUtils, 'getSurvey').mockResolvedValue(undefined);
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
      url: 'https://rpc.example',
      isDefault: true,
    } as any);
    jest.spyOn(EvmRpcUtils, 'checkRpcStatus').mockResolvedValue(true);
    jest.spyOn(EvmRpcUtils, 'getSwitchRpcAuto').mockResolvedValue(false);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);

    const { store } = customRender(<EvmHomeComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
          logo: '',
          rpcs: [{ url: 'https://rpc.example', isDefault: true }],
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

    await waitFor(() =>
      expect(
        screen.getByText('evm_one_pending_transaction'),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('evm_one_pending_transaction'));

    expect(store.getState().navigation.stack[0].currentPage).toBe(
      EvmScreen.EVM_TRANSFER_RESULT_PAGE,
    );
    expect(store.getState().navigation.params).toMatchObject({
      transactionResponse: expect.objectContaining({ hash: '0xpending' }),
      displayItem,
      detailFields: displayItem.detailFields,
      amount: '1 ETH',
    });
  });

  it('passes the pending nonce through the home cancel fallback flow', async () => {
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
      signingKey: {},
    } as any;
    const gasFee = {
      gasLimit: 21000,
      type: EvmTransactionType.EIP_1559,
    } as any;
    const sendSpy = jest
      .spyOn(EvmTransactionsUtils, 'send')
      .mockResolvedValue({ hash: '0xcancel' } as any);

    jest
      .spyOn(EvmTransactionsUtils, 'hasPendingTransaction')
      .mockResolvedValue({
        hasPending: true,
        pendingTransactionsCount: 1,
        queuedTransactionsCount: 0,
        pendingTransactionDetails: {
          nonce: 7,
          title: 'evm_pending_queued_transactions',
          label: 'Pending fallback',
        },
      });
    jest.spyOn(SurveyUtils, 'getSurvey').mockResolvedValue(undefined);
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
      url: 'https://rpc.example',
      isDefault: true,
    } as any);
    jest.spyOn(EvmRpcUtils, 'checkRpcStatus').mockResolvedValue(true);
    jest.spyOn(EvmRpcUtils, 'getSwitchRpcAuto').mockResolvedValue(false);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);

    const { store } = customRender(<EvmHomeComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
          logo: '',
          rpcs: [{ url: 'https://rpc.example', isDefault: true }],
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

    await waitFor(() =>
      expect(
        screen.getByText('evm_pending_queued_transactions'),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('evm_pending_queued_transactions'));

    const confirmationParams = store.getState().navigation.params;
    expect(store.getState().navigation.stack[0].currentPage).toBe(
      Screen.CONFIRMATION_PAGE,
    );

    await act(async () => {
      await confirmationParams.afterConfirmAction(gasFee);
    });

    expect(sendSpy).toHaveBeenCalledWith(
      wallet,
      expect.objectContaining({
        nonce: 7,
      }),
      gasFee,
      '1',
      7,
    );
    expect(store.getState().navigation.stack[0].currentPage).toBe(
      EvmScreen.EVM_TRANSFER_RESULT_PAGE,
    );
  });

  it('refreshes the pending banner when an EVM transaction resolves', async () => {
    const wallet = {
      address: '0x1234567890123456789012345678901234567890',
    } as any;
    let runtimeMessageListener: ((message: any) => void) | undefined;

    chrome.runtime.onMessage.addListener = jest.fn((listener) => {
      runtimeMessageListener = listener;
    }) as any;
    chrome.runtime.onMessage.removeListener = jest.fn() as any;

    const hasPendingSpy = jest
      .spyOn(EvmTransactionsUtils, 'hasPendingTransaction')
      .mockResolvedValueOnce({
        hasPending: true,
        pendingTransactionsCount: 1,
        queuedTransactionsCount: 0,
        pendingTransactionDetails: {
          nonce: 5,
          title: 'evm_one_pending_transaction',
          label: 'Pending transfer',
        },
      })
      .mockResolvedValueOnce({
        hasPending: false,
        pendingTransactionsCount: 0,
        queuedTransactionsCount: 0,
        pendingTransactionDetails: {
          nonce: 5,
          title: 'evm_one_pending_transaction',
          label: 'Pending transfer',
        },
      });

    jest.spyOn(SurveyUtils, 'getSurvey').mockResolvedValue(undefined);
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
      url: 'https://rpc.example',
      isDefault: true,
    } as any);
    jest.spyOn(EvmRpcUtils, 'checkRpcStatus').mockResolvedValue(true);
    jest.spyOn(EvmRpcUtils, 'getSwitchRpcAuto').mockResolvedValue(false);
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(
      undefined,
    );

    customRender(<EvmHomeComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        chain: {
          ...initialEmptyStateStore.chain,
          type: ChainType.EVM,
          chainId: '1',
          name: 'Ethereum',
          logo: '',
          rpcs: [{ url: 'https://rpc.example', isDefault: true }],
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

    await waitFor(() =>
      expect(screen.getByText('evm_one_pending_transaction')).toBeInTheDocument(),
    );

    await act(async () => {
      runtimeMessageListener?.({
        command: BackgroundCommand.EVM_TRANSACTION_RESOLVED,
        value: {
          chainId: '1',
          from: wallet.address,
          hash: '0xpending',
        },
      });
    });

    await waitFor(() => {
      expect(hasPendingSpy).toHaveBeenCalledTimes(2);
      expect(
        screen.queryByText('evm_one_pending_transaction'),
      ).not.toBeInTheDocument();
    });
  });
});
