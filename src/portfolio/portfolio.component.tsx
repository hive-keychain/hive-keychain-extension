import { FormContainer } from '@common-ui/_containers/form-container/form-container.component';
import { EVMConfirmationPageParams } from '@common-ui/confirmation-page/confirmation-page.interface';
import { ChainLogo } from '@common-ui/chain-logo/chain-logo.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { Screen } from '@interfaces/screen.interface';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmSmartContractInfoErc20 } from '@popup/evm/interfaces/evm-tokens.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccountTokensLoadUtils } from '@popup/evm/utils/evm-account-tokens-load.utils';
import { evmChainIdToDecimalPathSegment } from '@popup/evm/utils/evm-light-node.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { navigateTo, navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, { ButtonType } from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioAccountAvatar } from 'src/portfolio/ui/portfolio-account-avatar.component';
import { PortfolioNavIcon } from 'src/portfolio/ui/portfolio-nav-icon.enum';
import { PortfolioOverlayListSelect } from 'src/portfolio/ui/portfolio-overlay-list-select.component';
import { PortfolioSidebarNavIcon } from 'src/portfolio/ui/portfolio-sidebar-nav-icon.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import {
  PortfolioCanonicalAsset,
  PortfolioHistoryItem,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteResponse,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioApiUtils } from 'src/portfolio/portfolio-api.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { ColorsUtils } from 'src/utils/colors.utils';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';
import { UserPortfolio } from 'src/portfolio/portfolio.interface';

import { I18nUtils } from 'src/utils/i18n.utils';
import { ethers } from 'ethers';

type PortfolioSection = 'portfolio' | PortfolioMode | 'history';
type AccountOption =
  | {
      key: string;
      type: ChainType.HIVE;
      label: string;
      value: string;
      account: LocalAccount;
    }
  | {
      key: string;
      type: ChainType.EVM;
      label: string;
      value: string;
      ensName?: string;
      account: EvmAccount;
    };
type PortfolioRow = {
  key: string;
  symbol: string;
  network: string;
  balance: string;
  usdValue: number | null;
  priceUsd: number | null;
  logoUrl?: string | null;
  networkLogoUrl?: string | null;
  hiveAccountName?: string;
};

const sectionIcons: Record<PortfolioSection, PortfolioNavIcon> = {
  portfolio: PortfolioNavIcon.PORTFOLIO,
  buy: PortfolioNavIcon.BUY,
  sell: PortfolioNavIcon.SELL,
  swap: PortfolioNavIcon.SWAP,
  bridge: PortfolioNavIcon.BRIDGE,
  history: PortfolioNavIcon.HISTORY,
};

const sections: PortfolioSection[] = [
  'portfolio',
  'buy',
  'sell',
  'swap',
  'bridge',
  'history',
];

const getEmptyAssetOption = (): OptionItem => ({
  label: I18nUtils.getMessage('portfolio_select_asset'),
  value: '',
  key: 'empty-asset',
});

const getAllNetworksOption = (): OptionItem => ({
  label: I18nUtils.getMessage('portfolio_all_networks'),
  value: '',
  key: 'all-networks',
});

const resolveDefaultPortfolioAccountKey = (
  accountOptions: AccountOption[],
  activeAccountType: ChainType,
  activeEvmAccountAddress: string | undefined,
  activeHiveAccountName: string | undefined,
): string => {
  if (activeAccountType === ChainType.EVM) {
    const normalizedEvmAddress = activeEvmAccountAddress?.toLowerCase();
    if (normalizedEvmAddress) {
      const activeEvmKey = `evm:${normalizedEvmAddress}`;
      if (accountOptions.some((account) => account.key === activeEvmKey)) {
        return activeEvmKey;
      }
    }

    const firstEvmAccount = accountOptions.find(
      (account) => account.type === ChainType.EVM,
    );
    if (firstEvmAccount) {
      return firstEvmAccount.key;
    }
  }

  if (activeHiveAccountName) {
    const activeHiveKey = `hive:${activeHiveAccountName}`;
    if (accountOptions.some((account) => account.key === activeHiveKey)) {
      return activeHiveKey;
    }
  }

  const firstMatchingTypeAccount = accountOptions.find(
    (account) => account.type === activeAccountType,
  );
  if (firstMatchingTypeAccount) {
    return firstMatchingTypeAccount.key;
  }

  return accountOptions[0]?.key ?? '';
};

const getHiveTokenIcon = (symbol: string): SVGIcons | undefined => {
  switch (symbol.toUpperCase()) {
    case 'HBD':
      return SVGIcons.WALLET_HBD_LOGO;
    case 'HIVE':
      return SVGIcons.WALLET_HIVE_LOGO;
    case 'HP':
      return SVGIcons.WALLET_HP_LOGO;
    default:
      return undefined;
  }
};

const buildEvmPortfolioChainByIdMap = (
  chains: EvmChain[],
): Map<string, EvmChain> => {
  const chainById = new Map<string, EvmChain>();

  for (const chain of chains) {
    chainById.set(chain.chainId.toLowerCase(), chain);
    chainById.set(evmChainIdToDecimalPathSegment(chain.chainId), chain);
  }

  return chainById;
};

const getEvmPortfolioChainKeys = (chain: EvmChain): Set<string> =>
  new Set([
    chain.chainId.toLowerCase(),
    evmChainIdToDecimalPathSegment(chain.chainId),
  ]);

const resolveEvmPortfolioChain = (
  chainById: Map<string, EvmChain>,
  chainId: string | undefined,
  fallbackChain?: EvmChain,
): EvmChain | null => {
  if (fallbackChain) {
    return fallbackChain;
  }

  if (!chainId) {
    return null;
  }

  const normalizedChainId = chainId.toLowerCase();
  return (
    chainById.get(normalizedChainId) ??
    chainById.get(evmChainIdToDecimalPathSegment(chainId)) ??
    null
  );
};

const getEvmTokenUsdValue = (token: NativeAndErc20Token): number | null => {
  const priceUsd = token.tokenInfo.priceUsd;
  if (
    priceUsd === null ||
    priceUsd === undefined ||
    !Number.isFinite(priceUsd) ||
    priceUsd === 0
  ) {
    return null;
  }

  const decimals =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? Number((token.tokenInfo as EvmSmartContractInfoErc20).decimals)
      : 18;
  const balance = Number(ethers.formatUnits(token.balance, decimals));

  return Number.isFinite(balance) ? priceUsd * balance : null;
};

const mapEvmTokenToPortfolioRow = (
  token: NativeAndErc20Token,
  chainById: Map<string, EvmChain>,
  chain?: EvmChain,
): PortfolioRow => {
  const resolvedChain = resolveEvmPortfolioChain(
    chainById,
    token.tokenInfo.chainId,
    chain,
  );
  const priceUsd =
    token.tokenInfo.priceUsd !== null &&
    token.tokenInfo.priceUsd !== undefined &&
    Number.isFinite(token.tokenInfo.priceUsd)
      ? token.tokenInfo.priceUsd
      : null;
  const contractAddress =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? (token.tokenInfo as EvmSmartContractInfoErc20).contractAddress
      : 'native';
  const rowChainId = resolvedChain?.chainId ?? token.tokenInfo.chainId ?? '';

  return {
    key: `${rowChainId}:${token.tokenInfo.symbol}:${contractAddress}`,
    symbol: token.tokenInfo.symbol,
    network: resolvedChain?.name ?? '',
    balance: token.formattedBalance,
    usdValue: getEvmTokenUsdValue(token),
    priceUsd,
    logoUrl: token.tokenInfo.logo ?? null,
    networkLogoUrl: resolvedChain?.logo ?? null,
  };
};

const mergeEvmPortfolioRowsForChain = (
  currentRows: PortfolioRow[],
  chain: EvmChain,
  tokens: NativeAndErc20Token[],
  chainById: Map<string, EvmChain>,
): PortfolioRow[] => {
  const chainKeys = getEvmPortfolioChainKeys(chain);
  const nextRows = tokens.map((token) =>
    mapEvmTokenToPortfolioRow(token, chainById, chain),
  );

  return [
    ...currentRows.filter((row) => {
      const rowChainId = row.key.split(':')[0]?.toLowerCase() ?? '';
      return !chainKeys.has(rowChainId);
    }),
    ...nextRows,
  ];
};

const formatUsd = (value: number | null): string =>
  value === null ? '—' : `$${FormatUtils.formatCurrencyValue(value, 2)}`;

const formatPrice = (value: number | null): string => {
  if (value === null) {
    return '—';
  }
  if (value >= 1) {
    return formatUsd(value);
  }
  return `$${value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')}`;
};

const formatTokenAmount = (value: string): string => {
  const amount = Number(value.replace(/,/g, ''));
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 8 })
    : value;
};

const getStatusMessageKey = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message.startsWith('portfolio_')
    ? error.message
    : fallback;

interface PortfolioTokenIdentityProps {
  row: PortfolioRow;
  isHive: boolean;
}

const PortfolioTokenIdentity = ({ row, isHive }: PortfolioTokenIdentityProps) => {
  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(ColorsUtils.stringToColor(row.symbol));
  }, [row.symbol]);

  const hiveIcon = isHive ? getHiveTokenIcon(row.symbol) : undefined;

  return (
    <div className="portfolio-token-identity">
      <div className="portfolio-token-logo-wrap">
        {hiveIcon ? (
          <SVGIcon icon={hiveIcon} className="currency-icon" />
        ) : row.logoUrl ? (
          <PreloadedImage
            className="currency-icon"
            src={row.logoUrl}
            alt=""
            placeholder="/assets/images/hive-engine.svg"
          />
        ) : (
          <span
            className="portfolio-token-avatar"
            style={{
              backgroundColor: `${color}2b`,
              color,
            }}>
            {row.symbol.slice(0, 1)}
          </span>
        )}
        {row.networkLogoUrl ? (
          <ChainLogo
            chainName={row.network}
            logoUri={row.networkLogoUrl}
            className="portfolio-network-badge"
          />
        ) : null}
      </div>
      <span>
        <strong>{row.symbol}</strong>
        <small>{row.network}</small>
      </span>
    </div>
  );
};

export const Portfolio = ({
  hiveAccounts,
  evmAccounts,
  activeHiveAccountName,
  activeEvmAccountAddress,
  activeAccountType,
  navigateTo,
  navigateToWithParams,
  setErrorMessage,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [section, setSection] = useState<PortfolioSection>('portfolio');
  const [selectedAccountKey, setSelectedAccountKey] = useState('');
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [assets, setAssets] = useState<PortfolioCanonicalAsset[]>([]);
  const [history, setHistory] = useState<PortfolioHistoryItem[]>([]);
  const [fromAssetId, setFromAssetId] = useState('');
  const [toAssetId, setToAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [quoteResponse, setQuoteResponse] = useState<PortfolioQuoteResponse>();
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusMessageParams, setStatusMessageParams] = useState<string[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenFilter, setTokenFilter] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [setupEvmChains, setSetupEvmChains] = useState<EvmChain[]>([]);
  const hasUserSelectedAccountRef = useRef(false);

  const accountOptions = useMemo<AccountOption[]>(() => {
    const seenEvmAddresses = new Set<string>();
    return [
      ...hiveAccounts.map((account) => ({
        key: `hive:${account.name}`,
        type: ChainType.HIVE as const,
        label: `@${account.name}`,
        value: account.name,
        account,
      })),
      ...evmAccounts
        .filter((account) => {
          const address = account.wallet.address.toLowerCase();
          if (seenEvmAddresses.has(address)) return false;
          seenEvmAddresses.add(address);
          return true;
        })
        .map((account) => ({
          key: `evm:${account.wallet.address.toLowerCase()}`,
          type: ChainType.EVM as const,
          label: account.nickname || account.wallet.address,
          value: account.wallet.address,
          ensName: account.nickname,
          account,
        })),
    ];
  }, [evmAccounts, hiveAccounts]);

  const selectedAccount =
    accountOptions.find((account) => account.key === selectedAccountKey) ??
    accountOptions[0];

  const overlayAccountOptions = useMemo(
    () =>
      accountOptions.map((account) => ({
        value: account.key,
        label: account.label,
      })),
    [accountOptions],
  );

  const assetOptions = useMemo<OptionItem[]>(
    () =>
      assets.map((asset) => ({
        key: asset.assetId,
        label: `${asset.symbol} - ${asset.name}`,
        value: asset.assetId,
      })),
    [assets],
  );

  const networkSelectOptions = useMemo<OptionItem[]>(
    () => [
      getAllNetworksOption(),
      ...setupEvmChains.map((chain) => ({
        key: chain.chainId,
        label: chain.name,
        value: chain.name,
        img: chain.logo,
        imgChip: chain.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
      })),
    ],
    [setupEvmChains],
  );

  const selectedNetworkOption =
    networkSelectOptions.find((option) => option.value === selectedNetwork) ??
    getAllNetworksOption();

  const selectedFromAsset =
    assetOptions.find((asset) => asset.value === fromAssetId) ??
    getEmptyAssetOption();

  const selectedToAsset =
    assetOptions.find((asset) => asset.value === toAssetId) ??
    getEmptyAssetOption();

  const visibleRows = useMemo(() => {
    const filter = tokenFilter.trim().toLowerCase();
    return [...rows]
      .filter((row) => !selectedNetwork || row.network === selectedNetwork)
      .filter(
        (row) =>
          !filter ||
          row.symbol.toLowerCase().includes(filter) ||
          row.network.toLowerCase().includes(filter),
      )
      .sort((left, right) => (right.usdValue ?? -1) - (left.usdValue ?? -1));
  }, [rows, selectedNetwork, tokenFilter]);

  const totalUsd = visibleRows.reduce(
    (total, row) => total + (row.usdValue ?? 0),
    0,
  );
  const hasKnownValue = visibleRows.some((row) => row.usdValue !== null);

  useEffect(() => {
    setTitleContainerProperties({
      title: '',
      isCloseButtonDisabled: true,
    });
    void loadAssets();
  }, []);

  useEffect(() => {
    if (!accountOptions.length) return;

    const nextAccountKey = resolveDefaultPortfolioAccountKey(
      accountOptions,
      activeAccountType,
      activeEvmAccountAddress,
      activeHiveAccountName,
    );
    if (!nextAccountKey) return;

    setSelectedAccountKey((currentAccountKey) => {
      if (hasUserSelectedAccountRef.current) {
        return accountOptions.some((account) => account.key === currentAccountKey)
          ? currentAccountKey
          : nextAccountKey;
      }

      return nextAccountKey;
    });
  }, [
    accountOptions,
    activeAccountType,
    activeEvmAccountAddress,
    activeHiveAccountName,
  ]);

  const handleSelectedAccountChange = (accountKey: string) => {
    hasUserSelectedAccountRef.current = true;
    setSelectedAccountKey(accountKey);
  };

  useEffect(() => {
    let cancelled = false;

    const loadSetupEvmChains = async () => {
      if (selectedAccount?.type !== ChainType.EVM) {
        setSetupEvmChains([]);
        return;
      }

      try {
        const chains = await ChainUtils.getAllSetupChainsForType<EvmChain>(
          ChainType.EVM,
        );
        if (!cancelled) {
          setSetupEvmChains(chains);
        }
      } catch (error) {
        Logger.error('Unable to load portfolio setup chains', error);
        if (!cancelled) {
          setSetupEvmChains([]);
        }
      }
    };

    void loadSetupEvmChains();

    return () => {
      cancelled = true;
    };
  }, [selectedAccount?.type, selectedAccountKey]);

  useEffect(() => {
    if (!selectedAccountKey) return;

    setQuoteResponse(undefined);
    setStatusMessage('');
    setStatusMessageParams(undefined);
    setSelectedNetwork('');
    setRows([]);
    if (section === 'portfolio' && selectedAccount) void loadPortfolio();
    if (section === 'history') void loadHistory();
  }, [section, selectedAccountKey]);

  const loadAssets = async () => {
    try {
      setAssets(await PortfolioApiUtils.listAssets());
    } catch (error) {
      Logger.error('Unable to load portfolio assets', error);
    }
  };

  const loadPortfolio = async () => {
    const accountKey = selectedAccountKey;
    if (!accountKey) return;

    const account = accountOptions.find((item) => item.key === accountKey);
    if (!account) return;

    setIsLoading(true);
    setStatusMessage('');
    setStatusMessageParams(undefined);
    setRows([]);

    if (account.type === ChainType.HIVE) {
      try {
        const extendedAccounts = await AccountUtils.getExtendedAccounts([
          account.account.name,
        ]);
        const [portfolio] = (await PortfolioUtils.getPortfolio(
          extendedAccounts,
        )) as [UserPortfolio[], string[]];
        if (selectedAccountKey !== accountKey) return;
        setRows(
          (portfolio[0]?.balances ?? []).map((balance) => ({
            key: `hive:${balance.symbol}`,
            symbol: balance.symbol,
            network: 'Hive',
            balance: balance.balance.toString(),
            usdValue: balance.usdValue,
            priceUsd:
              balance.balance > 0 ? balance.usdValue / balance.balance : null,
            hiveAccountName: account.account.name,
          })),
        );
      } catch (error) {
        if (selectedAccountKey !== accountKey) return;
        Logger.error('Unable to load portfolio balances', error);
        setStatusMessage('portfolio_load_error');
        setStatusMessageParams(undefined);
        setRows([]);
      } finally {
        if (selectedAccountKey === accountKey) {
          setIsLoading(false);
        }
      }
      return;
    }

    void loadEvmPortfolioRows(accountKey, account);
  };

  const loadEvmPortfolioRows = async (
    accountKey: string,
    account: Extract<AccountOption, { type: ChainType.EVM }>,
  ) => {
    const failedChainNames: string[] = [];

    try {
      const chains = await ChainUtils.getAllSetupChainsForType<EvmChain>(
        ChainType.EVM,
      );
      if (selectedAccountKey !== accountKey) return;

      const chainById = buildEvmPortfolioChainByIdMap(chains);
      const walletAddress = account.account.wallet.address;
      const totalChains = chains.length;

      if (totalChains === 0) {
        setRows([]);
        setIsLoading(false);
        return;
      }

      let finishedChains = 0;

      const markPortfolioChainLoadFinished = () => {
        finishedChains++;
        if (selectedAccountKey !== accountKey) return;
        if (finishedChains !== totalChains) return;

        setIsLoading(false);
        if (failedChainNames.length === 0) {
          return;
        }

        if (failedChainNames.length === totalChains) {
          setStatusMessage('portfolio_load_error');
          setStatusMessageParams(undefined);
          return;
        }

        setStatusMessage('portfolio_partial_load_error');
        setStatusMessageParams([failedChainNames.join(', ')]);
      };

      void EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains(
        chains,
        walletAddress,
        {
          maxRetries: EvmAccountTokensLoadUtils.DEFAULT_MAX_LOAD_MORE_RETRIES,
          onChainReady: (chain, tokens) => {
            if (selectedAccountKey !== accountKey) return;
            setRows((previousRows) =>
              mergeEvmPortfolioRowsForChain(
                previousRows,
                chain,
                tokens,
                chainById,
              ),
            );
          },
          onChainError: (chain, error) => {
            if (selectedAccountKey !== accountKey) return;
            Logger.error(
              `Unable to load portfolio balances for ${chain.name}`,
              error,
            );
            if (!failedChainNames.includes(chain.name)) {
              failedChainNames.push(chain.name);
            }
          },
          onChainFinished: () => {
            markPortfolioChainLoadFinished();
          },
        },
      );
    } catch (error) {
      if (selectedAccountKey !== accountKey) return;
      Logger.error('Unable to load portfolio balances', error);
      setStatusMessage('portfolio_load_error');
      setStatusMessageParams(undefined);
      setRows([]);
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    setIsLoading(true);
    setStatusMessage('');
    try {
      setHistory(await PortfolioApiUtils.listHistory());
    } catch (error) {
      Logger.error('Unable to load portfolio history', error);
      setStatusMessage('portfolio_load_error');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuotes = async () => {
    if (!selectedAccount || !amount) return;
    setIsLoading(true);
    setStatusMessage('');
    try {
      const address =
        selectedAccount.type === ChainType.EVM
          ? selectedAccount.account.wallet.address
          : selectedAccount.account.name;
      const response = await PortfolioApiUtils.getQuotes({
        mode: section as PortfolioMode,
        fromAssetId:
          section === 'buy' ? undefined : fromAssetId || undefined,
        toAssetId: section === 'sell' ? undefined : toAssetId || undefined,
        fromAmount: amount,
        fromAddress: address,
        toAddress: address,
        countryCode:
          section === 'buy' || section === 'sell' ? countryCode : undefined,
        fiatCurrency:
          section === 'buy' || section === 'sell' ? fiatCurrency : undefined,
        paymentMethod:
          section === 'buy' || section === 'sell'
            ? paymentMethod || undefined
            : undefined,
      });
      setQuoteResponse(response);
      setSelectedQuoteId(response.quotes[0]?.quoteId ?? '');
    } catch (error) {
      Logger.error('Unable to load portfolio quotes', error);
      setStatusMessage(getStatusMessageKey(error, 'portfolio_load_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuote = async (quote: PortfolioQuote) => {
    if (!selectedAccount || !quoteResponse) return;
    setIsLoading(true);
    setStatusMessage('');
    try {
      const address =
        selectedAccount.type === ChainType.EVM
          ? selectedAccount.account.wallet.address
          : selectedAccount.account.name;
      const execution = await PortfolioApiUtils.createExecution(
        quote,
        quoteResponse.request,
        address,
      );

      if (quote.executionType === 'in_app' && quote.provider === 'lifi') {
        if (selectedAccount.type !== ChainType.EVM) {
          throw new Error('portfolio_native_execution_requires_evm');
        }
        const payload = await PortfolioApiUtils.prepareInAppExecution(
          execution.id,
          address,
        );
        await openNativeConfirmation(selectedAccount.account, execution.id, payload);
        return;
      }

      if (quote.redirectUrl) {
        chrome.tabs.create({ url: quote.redirectUrl });
        setStatusMessage('portfolio_provider_opened');
        return;
      }

      const redirectOrder = await PortfolioApiUtils.createRedirectOrder(
        execution.id,
      );
      if (redirectOrder.redirectUrl) {
        chrome.tabs.create({ url: redirectOrder.redirectUrl });
        setStatusMessage('portfolio_provider_opened');
      } else if (redirectOrder.deposit) {
        setStatusMessage(
          `${redirectOrder.deposit.expectedAmount} ${redirectOrder.deposit.symbol} -> ${redirectOrder.deposit.address}`,
        );
      }
    } catch (error) {
      Logger.error('Unable to execute portfolio quote', error);
      setStatusMessage(getStatusMessageKey(error, 'portfolio_execution_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const openNativeConfirmation = async (
    account: EvmAccount,
    executionId: string,
    payload: Awaited<ReturnType<typeof PortfolioApiUtils.prepareInAppExecution>>,
  ) => {
    const chainId = `0x${payload.chainId.toString(16)}`;
    const chain = await ChainUtils.getChain<EvmChain>(chainId);
    if (!chain) {
      throw new Error('portfolio_chain_not_setup');
    }

    const transactionData = {
      from: account.wallet.address,
      to: payload.transaction.to,
      data: payload.transaction.data,
      value: payload.transaction.value,
      type: chain.defaultTransactionType ?? EvmTransactionType.EIP_1559,
      chain,
      gasLimit: payload.transaction.gasLimit
        ? Number(payload.transaction.gasLimit)
        : undefined,
    };
    const activeAccountOverride: EvmActiveAccount = {
      address: account.wallet.address,
      wallet: account.wallet,
      nativeAndErc20Tokens: { value: [], loading: false },
      nfts: { value: [], loading: false, initialized: false },
      history: {
        value: { events: [], nextCursor: null, fullyFetch: false },
        loading: false,
        initialized: false,
      },
      isReady: true,
    };

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: I18nUtils.getMessage('portfolio_native_confirmation_message'),
      fields: [
        { label: 'portfolio_provider', value: payload.provider },
        { label: 'popup_html_transfer_from', value: account.wallet.address },
        { label: 'popup_html_transfer_to', value: payload.transaction.to },
        { label: 'popup_html_transfer_amount', value: payload.fromAmount },
      ],
      title: 'portfolio',
      hasGasFee: true,
      wallet: account.wallet,
      chainOverride: chain,
      activeAccountOverride,
      transactionData,
      afterConfirmAction: async (gasFee) => {
        try {
          const transactionResponse = await EvmTransactionsUtils.send(
            account.wallet,
            { ...transactionData, type: Number(transactionData.type) },
            gasFee as GasFeeEstimationBase,
            chain.chainId,
          );
          await PortfolioApiUtils.markSubmitted(
            executionId,
            transactionResponse.hash,
          );
          navigateTo(MultichainScreen.PORTFOLIO_PAGE, true);
        } catch (error) {
          Logger.error('Portfolio transaction failed', error);
          setErrorMessage('portfolio_execution_error');
        }
      },
    } as EVMConfirmationPageParams);
  };

  const openFlowForRow = (row: PortfolioRow, mode: PortfolioMode) => {
    const matchingAsset = assets.find(
      (asset) => asset.symbol.toLowerCase() === row.symbol.toLowerCase(),
    );
    setFromAssetId(mode === 'buy' ? '' : matchingAsset?.assetId ?? '');
    setToAssetId(mode === 'sell' ? '' : matchingAsset?.assetId ?? '');
    setSection(mode);
  };

  const getRowActions = (): PortfolioMode[] =>
    selectedAccount?.type === ChainType.HIVE
      ? ['swap']
      : ['buy', 'sell', 'swap', 'bridge'];

  const renderAccountRow = (accountKey: string) => {
    const account = accountOptions.find((item) => item.key === accountKey);
    if (!account) {
      return '—';
    }
    if (account.type === ChainType.EVM) {
      return (
        <div className="portfolio-account-row">
          <PortfolioAccountAvatar
            kind="evm"
            address={account.value}
            className="portfolio-account-row__avatar"
          />
          <div className="portfolio-account-row__text">
            {account.ensName ? (
              <span className="portfolio-account-row__ens">{account.ensName}</span>
            ) : null}
            <span className="portfolio-account-row__address">{account.value}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="portfolio-account-row">
        <PortfolioAccountAvatar
          kind="hive"
          username={account.value}
          className="portfolio-account-row__avatar"
        />
        <div className="portfolio-account-row__text">
          <span className="portfolio-account-row__address">@{account.value}</span>
        </div>
      </div>
    );
  };

  const renderRowActions = (row: PortfolioRow) => (
    <div className="portfolio-row-actions">
      {getRowActions().map((action) => (
        <button
          aria-label={I18nUtils.getMessage(`portfolio_section_${action}`)}
          key={`${row.key}:${action}`}
          onClick={() => openFlowForRow(row, action)}
          title={I18nUtils.getMessage(`portfolio_section_${action}`)}
          type="button">
          <PortfolioSidebarNavIcon
            icon={sectionIcons[action]}
            className="portfolio-row-action-icon"
          />
        </button>
      ))}
    </div>
  );

  const renderPortfolio = (isLoadingMoreChains = false) => (
    <div className="portfolio-card-body">
      {accountOptions.length > 0 && selectedAccount ? (
        <div className="portfolio-sticky-menu-bar">
          <div className="portfolio-header-row">
            <PortfolioOverlayListSelect
              id="portfolio-account"
              label={I18nUtils.getMessage('portfolio_account')}
              value={selectedAccountKey}
              onChange={handleSelectedAccountChange}
              options={overlayAccountOptions}
              renderDisplay={renderAccountRow}
              renderOption={renderAccountRow}
            />
            {selectedAccount.type === ChainType.EVM &&
              setupEvmChains.length > 0 && (
                <ComplexeCustomSelect
                  label="portfolio_network"
                  options={networkSelectOptions}
                  selectedItem={selectedNetworkOption}
                  setSelectedItem={(item) => setSelectedNetwork(item.value)}
                />
              )}
          </div>
          <div className="portfolio-token-filter">
            <label htmlFor="portfolio-token-filter">
              {I18nUtils.getMessage('portfolio_token_filter')}
            </label>
            <input
              id="portfolio-token-filter"
              type="text"
              placeholder={I18nUtils.getMessage('portfolio_token_filter')}
              value={tokenFilter}
              onChange={(event) => setTokenFilter(event.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="portfolio-empty">
          {I18nUtils.getMessage('portfolio_no_assets')}
        </div>
      )}

      <div className="portfolio-table-wrap">
        <div className="portfolio-table-head">
          <span>{I18nUtils.getMessage('portfolio_token')}</span>
          <span>{I18nUtils.getMessage('portfolio_actions')}</span>
          <span>{I18nUtils.getMessage('popup_html_transfer_amount')}</span>
          <span>{I18nUtils.getMessage('portfolio_price')}</span>
          <span>{I18nUtils.getMessage('portfolio_value')}</span>
        </div>
        {visibleRows.length === 0 ? (
          <div className="portfolio-empty">
            {I18nUtils.getMessage('portfolio_no_assets')}
          </div>
        ) : (
          visibleRows.map((row) => (
            <div className="portfolio-table-row" key={row.key}>
              <PortfolioTokenIdentity
                row={row}
                isHive={selectedAccount?.type === ChainType.HIVE}
              />
              {renderRowActions(row)}
              <span className="portfolio-number amount">
                {formatTokenAmount(row.balance)}
              </span>
              <span className="portfolio-number">
                {formatPrice(row.priceUsd)}
              </span>
              <strong className="portfolio-number">
                {formatUsd(row.usdValue)}
              </strong>
            </div>
          ))
        )}
      </div>

      <div className="portfolio-total">
        <span>{I18nUtils.getMessage('portfolio_total_value_usd')}</span>
        <strong>{hasKnownValue ? formatUsd(totalUsd) : '—'}</strong>
      </div>
      {isLoadingMoreChains ? (
        <div className="portfolio-loading-more">
          <RotatingLogoComponent />
        </div>
      ) : null}
    </div>
  );

  const renderFlow = () => {
    const mode = section as PortfolioMode;
    const selectedQuote = quoteResponse?.quotes.find(
      (quote) => quote.quoteId === selectedQuoteId,
    );
    const canExecuteSelectedQuote =
      selectedQuote?.executionType === 'in_app'
        ? selectedQuote.provider === 'lifi'
        : Boolean(selectedQuote?.redirectUrl) ||
          selectedQuote?.provider === 'stealthex';

    return (
      <FormContainer onSubmit={() => void getQuotes()}>
        <div className="portfolio-flow">
          {(mode === 'buy' || mode === 'sell') && (
            <>
              <InputComponent
                label="portfolio_country_code"
                type={InputType.TEXT}
                value={countryCode}
                onChange={(value: string) =>
                  setCountryCode(value.toUpperCase().slice(0, 2))
                }
              />
              <InputComponent
                label="portfolio_fiat_currency"
                type={InputType.TEXT}
                value={fiatCurrency}
                onChange={(value: string) =>
                  setFiatCurrency(value.toUpperCase().slice(0, 10))
                }
              />
              <InputComponent
                label="portfolio_payment_method"
                type={InputType.TEXT}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </>
          )}
          {mode !== 'buy' && (
            <ComplexeCustomSelect
              label="portfolio_from_asset"
              options={[getEmptyAssetOption(), ...assetOptions]}
              selectedItem={selectedFromAsset}
              setSelectedItem={(item) => setFromAssetId(item.value)}
            />
          )}
          {mode !== 'sell' && (
            <ComplexeCustomSelect
              label="portfolio_to_asset"
              options={[getEmptyAssetOption(), ...assetOptions]}
              selectedItem={selectedToAsset}
              setSelectedItem={(item) => setToAssetId(item.value)}
            />
          )}
          <InputComponent
            label="popup_html_transfer_amount"
            type={InputType.NUMBER}
            value={amount}
            min={0}
            onChange={setAmount}
          />
          <ButtonComponent
            label="portfolio_get_quotes"
            disabled={!amount}
            onClick={() => void getQuotes()}
          />
          {quoteResponse?.quotes.map((quote) => (
            <div
              key={quote.quoteId}
              role="button"
              tabIndex={0}
              className={`portfolio-quote-card ${
                selectedQuoteId === quote.quoteId ? 'selected' : ''
              }`}
              onClick={() => setSelectedQuoteId(quote.quoteId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setSelectedQuoteId(quote.quoteId);
                }
              }}>
              <div className="quote-details">
                <strong>{quote.provider.replace(/_/g, ' ')}</strong>
                <small>{quote.executionType.replace(/_/g, ' ')}</small>
              </div>
              <strong>{quote.estimatedToAmount}</strong>
            </div>
          ))}
          {quoteResponse?.quotes.length === 0 && (
            <div className="portfolio-status">
              {I18nUtils.getMessage('portfolio_no_quotes')}
            </div>
          )}
          {selectedQuoteId && (
            <ButtonComponent
              label="portfolio_continue"
              type={ButtonType.ALTERNATIVE}
              disabled={!canExecuteSelectedQuote}
              onClick={() => {
                if (selectedQuote && canExecuteSelectedQuote) {
                  void executeQuote(selectedQuote);
                }
              }}
            />
          )}
          {selectedQuote && !canExecuteSelectedQuote && (
            <div className="portfolio-status">
              {I18nUtils.getMessage('portfolio_provider_execution_unavailable')}
            </div>
          )}
        </div>
      </FormContainer>
    );
  };

  const renderHistory = () => (
    <div className="portfolio-table-wrap portfolio-history-table">
      <div className="portfolio-table-head">
        <span>{I18nUtils.getMessage('portfolio_mode')}</span>
        <span>{I18nUtils.getMessage('portfolio_provider')}</span>
        <span>{I18nUtils.getMessage('portfolio_status')}</span>
        <span>{I18nUtils.getMessage('portfolio_date')}</span>
      </div>
      {history.length === 0 ? (
        <div className="portfolio-empty">
          {I18nUtils.getMessage('portfolio_no_history')}
        </div>
      ) : (
        history.map((item) => (
          <div className="portfolio-table-row" key={item.id}>
            <strong>{item.mode}</strong>
            <span>{item.provider.replace(/_/g, ' ')}</span>
            <span>{item.displayStatus}</span>
            <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
          </div>
        ))
      )}
    </div>
  );

  const renderSectionContent = () => {
    const isLoadingPortfolioWithRows =
      isLoading && section === 'portfolio' && rows.length > 0;

    if (isLoading && !isLoadingPortfolioWithRows) {
      return (
        <div className="rotating-logo-wrapper">
          <RotatingLogoComponent />
        </div>
      );
    }
    if (section === 'portfolio') {
      return renderPortfolio(isLoadingPortfolioWithRows);
    }
    if (section === 'history') return renderHistory();
    return renderFlow();
  };

  return (
    <div className="portfolio-app-shell" data-testid="portfolio-page">
      <aside className="portfolio-sidebar">
        <div className="portfolio-brand">
          <img
            src="/assets/images/keychain-round-logo.svg"
            alt=""
            width={40}
            height={40}
          />
          <span>{I18nUtils.getMessage('portfolio')}</span>
        </div>
        <nav>
          {sections.map((item) => (
            <button
              key={item}
              className={item === section ? 'active' : ''}
              onClick={() => setSection(item)}
              title={I18nUtils.getMessage(`portfolio_section_${item}`)}
              type="button">
              <PortfolioSidebarNavIcon
                icon={sectionIcons[item]}
                className="portfolio-sidebar-nav-icon"
              />
              <span>{I18nUtils.getMessage(`portfolio_section_${item}`)}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="portfolio-column">
        <main className="portfolio-main">
          <section className="portfolio-page-frame">
            <header className="portfolio-page-header">
              <div>
                <h1>{I18nUtils.getMessage(`portfolio_section_${section}`)}</h1>
                <p>{I18nUtils.getMessage('portfolio_page_description')}</p>
              </div>
            </header>

            <div className="portfolio-card">
              <h2>{I18nUtils.getMessage(`portfolio_section_${section}`)}</h2>
              {renderSectionContent()}
            </div>

            {statusMessage && (
              <div className="portfolio-status">
                {I18nUtils.getMessage(statusMessage, statusMessageParams)}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  hiveAccounts: state.hive.accounts,
  evmAccounts: state.evm.accounts,
  activeHiveAccountName: state.hive.activeAccount?.account?.name,
  activeEvmAccountAddress: state.evm.activeAccount?.wallet?.address,
  activeAccountType: state.activeAccountType,
});

const connector = connect(mapStateToProps, {
  navigateTo,
  navigateToWithParams,
  setErrorMessage,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PortfolioComponent = connector(Portfolio);
