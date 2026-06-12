import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Screen } from '@interfaces/screen.interface';
import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { AccountCreationMode } from '@popup/hive/utils/account-creation.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React from 'react';
import { Provider } from 'react-redux';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateWAccountsWActiveAccountStore,
} from 'src/__tests__/utils-for-testing/initial-states';
import { CreateAccountStepOneComponent } from 'src/popup/hive/pages/app-container/settings/accounts/create-account/create-account-step-one/create-account-step-one.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyPricesUtils from 'src/popup/hive/utils/currency-prices.utils';
import HiveUtils from 'src/popup/hive/utils/hive.utils';
import { EvmTokensUtils } from 'src/popup/evm/utils/evm-tokens.utils';

describe('CreateAccountStepOneComponent', () => {
  const hiveChain = defaultChainList.find(
    (chain) => chain.type === ChainType.HIVE,
  )!;
  const evmChain = {
    name: 'Telos',
    type: ChainType.EVM,
    logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
    chainId: '40',
    mainToken: 'TLOS',
    rpcs: [{ url: 'https://rpc.telos.example' }],
    defaultTransactionType: '0x2',
  } as EvmChain;
  const evmAccount = {
    id: 0,
    seedId: 1,
    nickname: 'TLOS',
    wallet: { address: '0x1111111111111111111111111111111111111111' },
  } as EvmAccount;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(HiveUtils, 'getAccountPrice').mockResolvedValue(3);
    jest.spyOn(CurrencyPricesUtils, 'getPrices').mockResolvedValue({
      bitcoin: {},
      hive: { usd: 1 },
      hive_dollar: {},
    });
    jest.spyOn(AccountUtils, 'getExtendedAccount').mockResolvedValue({
      pending_claimed_accounts: 0,
      balance: '10.000 HIVE',
    } as any);
    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([
      hiveChain,
      evmChain,
    ]);
    jest.spyOn(EvmTokensUtils, 'getTokenBalances').mockImplementation(
      async (_walletAddress, _chain, tokenMetadata: EvmSmartContractInfo[]) =>
        tokenMetadata.map((tokenInfo) => {
          const balanceInteger = tokenInfo.symbol === 'SMOL' ? 1 : 10;
          return {
            tokenInfo,
            balance: BigInt(balanceInteger),
            balanceInteger,
            formattedBalance: String(balanceInteger),
            shortFormattedBalance: String(balanceInteger),
          };
        }) as any,
    );
    jest
      .spyOn(EvmLightNodeUtils, 'getDiscoveredTokensForAllRegisteredChains')
      .mockResolvedValue({
        address: evmAccount.wallet.address,
        chains: [
          {
            chainId: 40,
            catchupStatus: 'DONE',
            pricingStatus: 'READY',
            chain: {
              chainId: 40,
              name: 'Telos',
              logoUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
              backgroundColor: null,
              nativeToken: 'TLOS',
              explorerBaseUrl: null,
              testnet: false,
              isPopular: true,
            },
            tokens: [
              {
                kind: 'NATIVE',
                chainId: '40',
                contractAddress: '0x0000000000000000000000000000000000000000',
                name: 'Telos',
                symbol: 'TLOS',
                decimals: 18,
                logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
                possibleSpam: false,
                verifiedContract: true,
                balance: '0',
                formattedBalance: '0',
                priceUsd: 0.5,
                isNativeWrapped: false,
              },
              {
                type: 'ERC20',
                chainId: '40',
                contractAddress: '0x00000000000000000000000000000000000000aa',
                name: 'Too Small',
                symbol: 'SMOL',
                decimals: 18,
                logo: '',
                possibleSpam: false,
                verifiedContract: true,
                balance: '1',
                formattedBalance: '1',
                priceUsd: 0.1,
                balanceUsd: '0.1',
                isNativeWrapped: false,
              },
            ],
          },
        ],
      } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('selects the first Hive account when no active Hive account is available', async () => {
    renderStepOne({
      ...initialStateWAccountsWActiveAccountStore,
      chain: hiveChain,
      hive: {
        ...initialStateWAccountsWActiveAccountStore.hive,
        activeAccount: {
          ...initialStateWAccountsWActiveAccountStore.hive.activeAccount,
          name: undefined,
        },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText(`@${localAccounts.user1.name}`),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText('@undefined')).not.toBeInTheDocument();
    expect(AccountUtils.getExtendedAccount).toHaveBeenCalledWith(
      localAccounts.user1.name,
    );
  });

  it('shows Hive and EVM account choices in default mode', async () => {
    const { container } = renderStepOne({
      ...initialStateWAccountsWActiveAccountStore,
      chain: hiveChain,
      evm: {
        ...initialEmptyStateStore.evm,
        accounts: [evmAccount],
      },
    });

    expect(await screen.findByText(`@${localAccounts.user1.name}`)).toBeInTheDocument();

    fireEvent.click(container.querySelector('.react-dropdown-select')!);

    await waitFor(() => {
      expect(screen.getByText('TLOS')).toBeInTheDocument();
    });
  });

  it('filters paid-backend creation to EVM accounts and payable tokens', async () => {
    const { container } = renderStepOne({
      ...initialStateWAccountsWActiveAccountStore,
      chain: hiveChain,
      navigation: {
        params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
        stack: [
          {
            currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
            params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
          },
        ],
      },
      hive: {
        ...initialStateWAccountsWActiveAccountStore.hive,
        currencyPrices: {
          bitcoin: {},
          hive: { usd: 1 },
          hive_dollar: {},
        },
      },
      evm: {
        ...initialEmptyStateStore.evm,
        accounts: [evmAccount],
      },
    });

    expect(await screen.findByText('TLOS')).toBeInTheDocument();
    expect(screen.queryByText(`@${localAccounts.user1.name}`)).not.toBeInTheDocument();
    expect(await screen.findByText('$3')).toBeInTheDocument();

    fireEvent.click(container.querySelectorAll('.react-dropdown-select')[1]);

    expect(
      await screen.findByTestId('custom-select-item-evm-payment-token-40-native'),
    ).toHaveTextContent('Telos');
    expect(screen.queryByText('SMOL')).not.toBeInTheDocument();
  });

  it('uses chain-level native token discovery when native is not in the token list', async () => {
    jest
      .spyOn(EvmLightNodeUtils, 'getDiscoveredTokensForAllRegisteredChains')
      .mockResolvedValueOnce({
        address: evmAccount.wallet.address,
        chains: [
          {
            chainId: 40,
            catchupStatus: 'DONE',
            pricingStatus: 'READY',
            chain: {
              chainId: 40,
              name: 'Telos',
              logoUrl:
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
              backgroundColor: null,
              nativeToken: 'TLOS',
              explorerBaseUrl: null,
              testnet: false,
              isPopular: true,
            },
            nativeToken: {
              kind: 'NATIVE',
              chainId: '40',
              name: 'Telos',
              symbol: 'TLOS',
              logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
              balance: '10',
              priceUsd: 0.5,
            },
            tokens: [
              {
                type: 'ERC20',
                chainId: '40',
                contractAddress: '0x00000000000000000000000000000000000000aa',
                name: 'Too Small',
                symbol: 'SMOL',
                decimals: 18,
                logo: '',
                possibleSpam: false,
                verifiedContract: true,
                balance: '1',
                formattedBalance: '1',
                priceUsd: 0.1,
                balanceUsd: '0.1',
                isNativeWrapped: false,
              },
            ],
          },
        ],
      } as any);

    const { container } = renderPaidBackendStepOne();

    expect(await screen.findByText('TLOS')).toBeInTheDocument();

    fireEvent.click(container.querySelectorAll('.react-dropdown-select')[1]);

    expect(
      await screen.findByTestId('custom-select-item-evm-payment-token-40-native'),
    ).toHaveTextContent('Telos');
    expect(screen.queryByText('SMOL')).not.toBeInTheDocument();
  });

  it('omits payment tokens from custom or unselected setup chains', async () => {
    const customEvmChain = {
      ...evmChain,
      name: 'Custom Local',
      chainId: '0x539',
      mainToken: 'ETH',
      isCustom: true,
    } as EvmChain;

    jest.spyOn(ChainUtils, 'getSetupChains').mockResolvedValue([
      hiveChain,
      evmChain,
      customEvmChain,
    ]);
    jest
      .spyOn(EvmLightNodeUtils, 'getDiscoveredTokensForAllRegisteredChains')
      .mockResolvedValueOnce({
        address: evmAccount.wallet.address,
        chains: [
          {
            chainId: 40,
            catchupStatus: 'DONE',
            pricingStatus: 'READY',
            chain: {
              chainId: 40,
              name: 'Telos',
              logoUrl:
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
              backgroundColor: null,
              nativeToken: 'TLOS',
              explorerBaseUrl: null,
              testnet: false,
              isPopular: true,
            },
            tokens: [
              {
                kind: 'NATIVE',
                chainId: '40',
                contractAddress: '0x0000000000000000000000000000000000000000',
                name: 'Telos',
                symbol: 'TLOS',
                decimals: 18,
                logo: '',
                possibleSpam: false,
                verifiedContract: true,
                balance: '10',
                formattedBalance: '10',
                priceUsd: 0.5,
                isNativeWrapped: false,
              },
            ],
          },
          {
            chainId: 1337,
            catchupStatus: 'DONE',
            pricingStatus: 'READY',
            chain: {
              chainId: 1337,
              name: 'Custom Local',
              logoUrl: null,
              backgroundColor: null,
              nativeToken: 'ETH',
              explorerBaseUrl: null,
              testnet: false,
              isPopular: false,
            },
            tokens: [
              {
                kind: 'NATIVE',
                chainId: '1337',
                contractAddress: '0x0000000000000000000000000000000000000000',
                name: 'Custom Local',
                symbol: 'ETH',
                decimals: 18,
                logo: '',
                possibleSpam: false,
                verifiedContract: true,
                balance: '100',
                formattedBalance: '100',
                priceUsd: 1,
                isNativeWrapped: false,
              },
            ],
          },
          {
            chainId: 137,
            catchupStatus: 'DONE',
            pricingStatus: 'READY',
            chain: {
              chainId: 137,
              name: 'Polygon',
              logoUrl: null,
              backgroundColor: null,
              nativeToken: 'POL',
              explorerBaseUrl: null,
              testnet: false,
              isPopular: true,
            },
            tokens: [
              {
                kind: 'NATIVE',
                chainId: '137',
                contractAddress: '0x0000000000000000000000000000000000000000',
                name: 'Polygon',
                symbol: 'POL',
                decimals: 18,
                logo: '',
                possibleSpam: false,
                verifiedContract: true,
                balance: '100',
                formattedBalance: '100',
                priceUsd: 1,
                isNativeWrapped: false,
              },
            ],
          },
        ],
      } as any);

    const { container } = renderPaidBackendStepOne();

    expect(await screen.findByText('TLOS')).toBeInTheDocument();

    fireEvent.click(container.querySelectorAll('.react-dropdown-select')[1]);

    expect(
      await screen.findByTestId('custom-select-item-evm-payment-token-40-native'),
    ).toHaveTextContent('Telos');
    expect(
      screen.queryByTestId('custom-select-item-evm-payment-token-1337-native'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('custom-select-item-evm-payment-token-137-native'),
    ).not.toBeInTheDocument();
  });
});

const renderPaidBackendStepOne = () =>
  renderStepOne({
    ...initialStateWAccountsWActiveAccountStore,
    chain: defaultChainList.find((chain) => chain.type === ChainType.HIVE)!,
    navigation: {
      params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
      stack: [
        {
          currentPage: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
          params: { mode: AccountCreationMode.PAID_BACKEND_CREATION },
        },
      ],
    },
    hive: {
      ...initialStateWAccountsWActiveAccountStore.hive,
      currencyPrices: {
        bitcoin: {},
        hive: { usd: 1 },
        hive_dollar: {},
      },
    },
    evm: {
      ...initialEmptyStateStore.evm,
      accounts: [
        {
          id: 0,
          seedId: 1,
          nickname: 'TLOS',
          wallet: { address: '0x1111111111111111111111111111111111111111' },
        } as EvmAccount,
      ],
    },
  });

const renderStepOne = (state: any) => {
  const store = getFakeStore(state);
  return render(
    <Provider store={store}>
      <CreateAccountStepOneComponent />
    </Provider>,
  );
};
