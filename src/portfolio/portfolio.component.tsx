import { EVMConfirmationPageParams } from '@common-ui/confirmation-page/confirmation-page.interface';
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
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioAccountAvatar } from 'src/portfolio/ui/portfolio-account-avatar.component';
import { PortfolioNavIcon } from 'src/portfolio/ui/portfolio-nav-icon.enum';
import { PortfolioOverlayListSelect } from 'src/portfolio/ui/portfolio-overlay-list-select.component';
import { PortfolioSidebarNavIcon } from 'src/portfolio/ui/portfolio-sidebar-nav-icon.component';
import {
  canonicalAssetToTokenIdentityProps,
  PortfolioTokenIdentity,
  portfolioRowToTokenIdentityProps,
} from 'src/portfolio/ui/portfolio-token-identity.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import {
  PortfolioCanonicalAsset,
  PortfolioHistoryItem,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteResponse,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';
import { PortfolioApiUtils } from 'src/portfolio/portfolio-api.utils';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
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
  decimals?: number;
  logoUrl?: string | null;
  networkLogoUrl?: string | null;
  hiveAccountName?: string;
  chainId?: string | null;
  isTestnet?: boolean;
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

const TO_ASSET_UNFILTERED_MAX = 50;
const TO_ASSET_FILTERED_MAX = 200;

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
  const decimals =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? Number((token.tokenInfo as EvmSmartContractInfoErc20).decimals)
      : 18;

  return {
    key: `${rowChainId}:${token.tokenInfo.symbol}:${contractAddress}`,
    symbol: token.tokenInfo.symbol,
    network: resolvedChain?.name ?? '',
    balance: token.formattedBalance,
    usdValue: getEvmTokenUsdValue(token),
    priceUsd,
    decimals,
    logoUrl: token.tokenInfo.logo ?? null,
    networkLogoUrl: resolvedChain?.logo ?? null,
    chainId: rowChainId || null,
    isTestnet: resolvedChain?.testnet ?? false,
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

const hasRequiredQuoteAssets = (options: {
  mode: PortfolioMode;
  fromAssetId?: string;
  toAssetId?: string;
}): boolean => {
  const hasFromAssetId = Boolean(options.fromAssetId);
  const hasToAssetId = Boolean(options.toAssetId);

  switch (options.mode) {
    case 'buy':
      return hasToAssetId;
    case 'sell':
      return hasFromAssetId;
    case 'swap':
    case 'bridge':
      return hasFromAssetId && hasToAssetId;
    default:
      return false;
  }
};

const logPortfolioFlowDebug = (message: string, payload: unknown) => {
  Logger.debug(`${message} ${JSON.stringify(payload, null, 2)}`);
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
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isFlowLoading, setIsFlowLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenFilter, setTokenFilter] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [toAssetFilter, setToAssetFilter] = useState('');
  const [toAssetChainFilter, setToAssetChainFilter] = useState('');
  const [setupEvmChains, setSetupEvmChains] = useState<EvmChain[]>([]);
  const [defaultEvmChains, setDefaultEvmChains] = useState<EvmChain[]>([]);
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

  const toAssetEvmChains = useMemo(() => {
    const chainById = buildEvmPortfolioChainByIdMap(setupEvmChains);
    for (const chain of defaultEvmChains) {
      for (const key of getEvmPortfolioChainKeys(chain)) {
        if (!chainById.has(key)) {
          chainById.set(key, chain);
        }
      }
    }

    return [...new Set(chainById.values())];
  }, [defaultEvmChains, setupEvmChains]);

  const fromAssetOptions = useMemo(() => {
    const rowResolutionDetails = rows.map((row) => {
      const canonicalAssetId =
        PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
          row,
          assets,
          toAssetEvmChains,
        );
      const hasPositiveBalance =
        PortfolioFlowUtils.hasPositivePortfolioBalance(row.balance);

      return {
        key: row.key,
        symbol: row.symbol,
        network: row.network,
        chainId: row.chainId ?? null,
        balance: row.balance,
        isTestnet: row.isTestnet ?? false,
        hasPositiveBalance,
        canonicalAssetId: canonicalAssetId ?? null,
        includedInFromOptions:
          Boolean(canonicalAssetId) && hasPositiveBalance && !row.isTestnet,
      };
    });

    const rowsWithCanonicalAsset = rows.filter((row) =>
      Boolean(
        PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
          row,
          assets,
          toAssetEvmChains,
        ),
      ),
    );

    const options = PortfolioFlowUtils.buildPortfolioFromSelectOptions(
      rowsWithCanonicalAsset,
    );

    logPortfolioFlowDebug('[Portfolio flow] build fromAssetOptions', {
      selectedAccountKey,
      inputRowCount: rows.length,
      canonicalAssetCount: assets.length,
      rowsWithCanonicalAssetCount: rowsWithCanonicalAsset.length,
      fromAssetOptionsCount: options.length,
      rowResolutionDetails,
      fromAssetOptions: options.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    });

    return options;
  }, [assets, rows, selectedAccountKey, toAssetEvmChains]);

  const toAssetOptions = useMemo(() => {
    const options = PortfolioFlowUtils.buildCanonicalAssetSelectOptions(
      assets,
      toAssetEvmChains,
    );

    logPortfolioFlowDebug('[Portfolio flow] build toAssetOptions', {
      canonicalAssetCount: assets.length,
      toAssetEvmChainCount: toAssetEvmChains.length,
      toAssetOptionsCount: options.length,
      toAssetOptionsPreview: options.slice(0, 25).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    });

    return options;
  }, [assets, toAssetEvmChains]);

  const toAssetChainFilterOptions = useMemo(
    () =>
      PortfolioFlowUtils.buildCanonicalAssetChainFilterOptions(
        assets,
        toAssetEvmChains,
      ),
    [assets, toAssetEvmChains],
  );

  const hasToAssetFilters = Boolean(
    toAssetFilter.trim() || toAssetChainFilter,
  );

  const filteredToAssetResult = useMemo(
    () =>
      PortfolioFlowUtils.filterCanonicalAssets(assets, {
        textFilter: toAssetFilter,
        chainFilter: toAssetChainFilter,
        maxResults: hasToAssetFilters
          ? TO_ASSET_FILTERED_MAX
          : TO_ASSET_UNFILTERED_MAX,
      }),
    [assets, hasToAssetFilters, toAssetChainFilter, toAssetFilter],
  );

  const filteredToAssetOptions = useMemo(() => {
    const options = PortfolioFlowUtils.buildCanonicalAssetSelectOptions(
      filteredToAssetResult.assets,
      toAssetEvmChains,
    );

    logPortfolioFlowDebug('[Portfolio flow] build filteredToAssetOptions', {
      section,
      toAssetFilter,
      toAssetChainFilter,
      hasToAssetFilters,
      totalMatches: filteredToAssetResult.totalMatches,
      filteredAssetCount: filteredToAssetResult.assets.length,
      filteredToAssetOptionsCount: options.length,
      truncatedCount: filteredToAssetResult.totalMatches - options.length,
      filteredToAssetOptionsPreview: options.slice(0, 25).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    });

    return options;
  }, [
    filteredToAssetResult.assets,
    filteredToAssetResult.totalMatches,
    hasToAssetFilters,
    section,
    toAssetChainFilter,
    toAssetEvmChains,
    toAssetFilter,
  ]);

  const toAssetChainSelectOptions = useMemo<OptionItem[]>(
    () => [
      getAllNetworksOption(),
      ...toAssetChainFilterOptions.map((option) => ({
        key: option.key,
        label: option.label,
        value: option.value,
        img: option.img,
        imgChip: option.imgChip,
      })),
    ],
    [toAssetChainFilterOptions],
  );

  const toAssetTruncatedCount =
    filteredToAssetResult.totalMatches - filteredToAssetResult.assets.length;

  const selectedToAssetChainOption =
    toAssetChainSelectOptions.find(
      (option) => option.value === toAssetChainFilter,
    ) ?? getAllNetworksOption();

  const portfolioRowByKey = useMemo(
    () => new Map(rows.map((row) => [row.key, row])),
    [rows],
  );

  const canonicalAssetById = useMemo(
    () => new Map(assets.map((asset) => [asset.assetId, asset])),
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

  const renderFromAssetIdentity = (rowKey: string) => {
    const row = portfolioRowByKey.get(rowKey);
    if (!row) {
      return rowKey;
    }

    return (
      <PortfolioTokenIdentity
        {...portfolioRowToTokenIdentityProps(row)}
        balance={PortfolioFlowUtils.formatPortfolioTokenBalance(row.balance)}
      />
    );
  };

  const renderToAssetIdentity = (assetId: string) => {
    const asset = canonicalAssetById.get(assetId);
    if (!asset) {
      return assetId;
    }

    return (
      <PortfolioTokenIdentity
        {...canonicalAssetToTokenIdentityProps(asset, toAssetEvmChains)}
      />
    );
  };

  const visibleRows = useMemo(() => {
    const filter = tokenFilter.trim().toLowerCase();
    const filteredRows = [...rows]
      .filter((row) => !selectedNetwork || row.network === selectedNetwork)
      .filter(
        (row) =>
          !filter ||
          row.symbol.toLowerCase().includes(filter) ||
          row.network.toLowerCase().includes(filter),
      );

    if (selectedAccount?.type === ChainType.HIVE) {
      return filteredRows.sort(
        PortfolioUtils.compareHivePortfolioItemsByDisplayOrder,
      );
    }

    return filteredRows.sort(
      (left, right) => (right.usdValue ?? -1) - (left.usdValue ?? -1),
    );
  }, [rows, selectedNetwork, tokenFilter, selectedAccount?.type]);

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
  }, []);

  useEffect(() => {
    if (!selectedAccountKey) return;

    const account = accountOptions.find((item) => item.key === selectedAccountKey);
    if (!account) return;

    void initializePortfolioData();
  }, [selectedAccountKey]);

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
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDefaultEvmChains = async () => {
      try {
        const chains = await ChainUtils.getDefaultChains();
        if (!cancelled) {
          setDefaultEvmChains(
            chains.filter(
              (chain): chain is EvmChain => chain.type === ChainType.EVM,
            ),
          );
        }
      } catch (error) {
        Logger.error('Unable to load portfolio default chains', error);
        if (!cancelled) {
          setDefaultEvmChains([]);
        }
      }
    };

    void loadDefaultEvmChains();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFromAssetId('');
    setToAssetId('');
    setToAssetFilter('');
    setToAssetChainFilter('');
  }, [selectedAccountKey]);

  useEffect(() => {
    if (!fromAssetOptions.length) {
      if (fromAssetId) {
        logPortfolioFlowDebug('[Portfolio flow] clear fromAssetId (no from options)', {
          previousFromAssetId: fromAssetId,
        });
        setFromAssetId('');
      }
      return;
    }

    if (!fromAssetOptions.some((option) => option.value === fromAssetId)) {
      const nextFromAssetId = fromAssetOptions[0].value;
      logPortfolioFlowDebug('[Portfolio flow] auto-select fromAssetId', {
        previousFromAssetId: fromAssetId,
        nextFromAssetId,
      });
      setFromAssetId(nextFromAssetId);
    }
  }, [fromAssetOptions, fromAssetId]);

  useEffect(() => {
    if (!toAssetOptions.length) {
      if (toAssetId) {
        logPortfolioFlowDebug('[Portfolio flow] clear toAssetId (no to options)', {
          previousToAssetId: toAssetId,
        });
        setToAssetId('');
      }
      return;
    }

    if (!toAssetOptions.some((option) => option.value === toAssetId)) {
      const nextToAssetId = toAssetOptions[0].value;
      logPortfolioFlowDebug('[Portfolio flow] auto-select toAssetId', {
        previousToAssetId: toAssetId,
        nextToAssetId,
      });
      setToAssetId(nextToAssetId);
    }
  }, [toAssetOptions, toAssetId]);

  useEffect(() => {
    setQuoteResponse(undefined);
    setSelectedQuoteId('');
    if (section === 'portfolio') {
      setSelectedNetwork('');
    }
    if (section !== 'buy' && section !== 'swap' && section !== 'bridge') {
      setToAssetFilter('');
      setToAssetChainFilter('');
    }
  }, [section]);

  const loadAssets = async () => {
    try {
      const loadedAssets = await PortfolioApiUtils.listAssets();
      logPortfolioFlowDebug('[Portfolio flow] loadAssets completed', {
        selectedAccountKey,
        assetCount: loadedAssets.length,
        assetsPreview: loadedAssets.slice(0, 25).map((asset) => ({
          assetId: asset.assetId,
          symbol: asset.symbol,
          ecosystem: asset.ecosystem,
          chainId: asset.chainId,
        })),
      });
      setAssets(loadedAssets);
    } catch (error) {
      Logger.error('Unable to load portfolio assets', error);
    }
  };

  const loadPortfolio = async (options?: { clearRows?: boolean }) => {
    const clearRows = options?.clearRows ?? false;
    const accountKey = selectedAccountKey;
    if (!accountKey) return;

    const account = accountOptions.find((item) => item.key === accountKey);
    if (!account) return;

    logPortfolioFlowDebug('[Portfolio flow] loadPortfolio started', {
      accountKey,
      accountType: account.type,
      clearRows,
    });

    setIsPortfolioLoading(true);
    if (clearRows) {
      setStatusMessage('');
      setStatusMessageParams(undefined);
      setRows([]);
    }

    if (account.type === ChainType.HIVE) {
      try {
        const extendedAccounts = await AccountUtils.getExtendedAccounts([
          account.account.name,
        ]);
        const [portfolio] = (await PortfolioUtils.getPortfolio(
          extendedAccounts,
        )) as [UserPortfolio[], string[]];
        if (selectedAccountKey !== accountKey) return;
        const sortedBalances = PortfolioUtils.sortHivePortfolioBalancesByDisplayOrder(
          portfolio[0]?.balances ?? [],
        );
        const hiveTokens = await TokensUtils.getAllTokens();
        if (selectedAccountKey !== accountKey) return;
        const nextRows = sortedBalances.map((balance) => ({
          key: `hive:${balance.symbol}`,
          symbol: balance.symbol,
          network: 'Hive',
          balance: balance.balance.toString(),
          usdValue: balance.usdValue,
          priceUsd:
            balance.balance > 0 ? balance.usdValue / balance.balance : null,
          decimals: PortfolioFlowUtils.resolveHiveTokenDecimals(
            balance.symbol,
            hiveTokens,
          ),
          hiveAccountName: account.account.name,
          chainId: null,
          isTestnet: false,
          isHive: true,
        }));
        logPortfolioFlowDebug('[Portfolio flow] loadPortfolio hive rows loaded', {
          accountKey,
          rowCount: nextRows.length,
          rowsPreview: nextRows.map((row) => ({
            key: row.key,
            symbol: row.symbol,
            balance: row.balance,
          })),
        });
        setRows(nextRows);
      } catch (error) {
        if (selectedAccountKey !== accountKey) return;
        Logger.error('Unable to load portfolio balances', error);
        setStatusMessage('portfolio_load_error');
        setStatusMessageParams(undefined);
        setRows([]);
      } finally {
        if (selectedAccountKey === accountKey) {
          setIsPortfolioLoading(false);
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
        setIsPortfolioLoading(false);
        return;
      }

      let finishedChains = 0;

      const markPortfolioChainLoadFinished = () => {
        finishedChains++;
        if (selectedAccountKey !== accountKey) return;
        if (finishedChains !== totalChains) return;

        setIsPortfolioLoading(false);
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
            logPortfolioFlowDebug('[Portfolio flow] loadPortfolio evm chain ready', {
              accountKey,
              chainId: chain.chainId,
              chainName: chain.name,
              tokenCount: tokens.length,
              tokensPreview: tokens.map((token) => ({
                symbol: token.tokenInfo.symbol,
                chainId: token.tokenInfo.chainId,
                balance: token.formattedBalance,
              })),
            });
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
      setIsPortfolioLoading(false);
    }
  };

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    setStatusMessage('');
    try {
      setHistory(await PortfolioApiUtils.listHistory());
    } catch (error) {
      Logger.error('Unable to load portfolio history', error);
      setStatusMessage('portfolio_load_error');
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const initializePortfolioData = async () => {
    if (!selectedAccountKey) return;

    const account = accountOptions.find((item) => item.key === selectedAccountKey);
    if (!account) return;

    logPortfolioFlowDebug('[Portfolio flow] initializePortfolioData started', {
      selectedAccountKey,
      accountType: account.type,
    });

    await Promise.all([
      loadPortfolio({ clearRows: true }),
      loadAssets(),
      loadHistory(),
    ]);
  };

  const handleRefreshPortfolioData = async () => {
    if (!selectedAccountKey || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        loadPortfolio({ clearRows: true }),
        loadAssets(),
        loadHistory(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getQuotes = async () => {
    if (!selectedAccount || !amount) return;
    const mode = section as PortfolioMode;
    const resolvedFromAssetId =
      mode === 'buy'
        ? undefined
        : PortfolioFlowUtils.resolveFromRowKeyToCanonicalAssetId(
            fromAssetId,
            rows,
            assets,
            toAssetEvmChains,
          );
    const resolvedToAssetId = mode === 'sell' ? undefined : toAssetId || undefined;
    if (
      !hasRequiredQuoteAssets({
        mode,
        fromAssetId: resolvedFromAssetId,
        toAssetId: resolvedToAssetId,
      })
    ) {
      logPortfolioFlowDebug('[Portfolio flow] getQuotes skipped (missing required assets)', {
        mode,
        fromAssetId,
        resolvedFromAssetId,
        toAssetId,
        resolvedToAssetId,
        amount,
      });
      return;
    }

    logPortfolioFlowDebug('[Portfolio flow] getQuotes requested', {
      mode,
      fromAssetId,
      resolvedFromAssetId,
      toAssetId,
      resolvedToAssetId,
      amount,
      selectedAccountKey,
    });

    setIsFlowLoading(true);
    setStatusMessage('');
    try {
      const address =
        selectedAccount.type === ChainType.EVM
          ? selectedAccount.account.wallet.address
          : selectedAccount.account.name;
      const formattedFromAmount = PortfolioFlowUtils.formatPortfolioQuoteFromAmount(
        amount,
        PortfolioFlowUtils.resolvePortfolioQuoteFromAmountDecimals({
          mode,
          fromAssetId,
          rows,
          assets,
          chains: toAssetEvmChains,
        }),
      );

      const response = await PortfolioApiUtils.getQuotes({
        mode,
        fromAssetId: resolvedFromAssetId,
        toAssetId: resolvedToAssetId,
        fromAmount: formattedFromAmount,
        fromAddress: address,
        toAddress: address,
        countryCode: mode === 'buy' || mode === 'sell' ? countryCode : undefined,
        fiatCurrency: mode === 'buy' || mode === 'sell' ? fiatCurrency : undefined,
        paymentMethod:
          mode === 'buy' || mode === 'sell' ? paymentMethod || undefined : undefined,
      });
      setQuoteResponse(response);
      setSelectedQuoteId(response.quotes[0]?.quoteId ?? '');
    } catch (error) {
      Logger.error('Unable to load portfolio quotes', error);
      setStatusMessage(getStatusMessageKey(error, 'portfolio_load_error'));
    } finally {
      setIsFlowLoading(false);
    }
  };

  const executeQuote = async (quote: PortfolioQuote) => {
    if (!selectedAccount || !quoteResponse) return;
    setIsFlowLoading(true);
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
      setIsFlowLoading(false);
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
    const canUseAsFrom =
      PortfolioFlowUtils.hasPositivePortfolioBalance(row.balance) &&
      !row.isTestnet;
    setFromAssetId(mode === 'buy' || !canUseAsFrom ? '' : row.key);
    setToAssetId(
      mode === 'sell'
        ? ''
        : PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
            row,
            assets,
            toAssetEvmChains,
          ) ?? '',
    );
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
                {...portfolioRowToTokenIdentityProps({
                  ...row,
                  isHive: selectedAccount?.type === ChainType.HIVE,
                })}
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
    const resolvedFromAssetId =
      mode === 'buy'
        ? undefined
        : PortfolioFlowUtils.resolveFromRowKeyToCanonicalAssetId(
            fromAssetId,
            rows,
            assets,
            toAssetEvmChains,
          );
    const resolvedToAssetId = mode === 'sell' ? undefined : toAssetId || undefined;
    const canRequestQuotes =
      Boolean(amount) &&
      hasRequiredQuoteAssets({
        mode,
        fromAssetId: resolvedFromAssetId,
        toAssetId: resolvedToAssetId,
      });
    const selectedQuote = quoteResponse?.quotes.find(
      (quote) => quote.quoteId === selectedQuoteId,
    );
    const canExecuteSelectedQuote =
      selectedQuote?.executionType === 'in_app'
        ? selectedQuote.provider === 'lifi'
        : Boolean(selectedQuote?.redirectUrl) ||
          selectedQuote?.provider === 'stealthex';

    return (
      <div className="portfolio-flow">
          {(mode === 'swap' || mode === 'bridge') &&
            accountOptions.length > 0 &&
            selectedAccount && (
              <PortfolioOverlayListSelect
                id="portfolio-flow-account"
                label={I18nUtils.getMessage('portfolio_account')}
                value={selectedAccountKey}
                onChange={handleSelectedAccountChange}
                options={overlayAccountOptions}
                renderDisplay={renderAccountRow}
                renderOption={renderAccountRow}
              />
            )}
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
          {mode !== 'buy' &&
            (mode === 'swap' ||
              mode === 'bridge' ||
              fromAssetOptions.length > 0) && (
            <PortfolioOverlayListSelect
              id="portfolio-from-asset"
              label={I18nUtils.getMessage('portfolio_from_asset')}
              options={fromAssetOptions}
              value={fromAssetId}
              onChange={setFromAssetId}
              renderOption={renderFromAssetIdentity}
              renderDisplay={renderFromAssetIdentity}
              disabled={fromAssetOptions.length === 0}
              listFooter={
                fromAssetOptions.length === 0
                  ? I18nUtils.getMessage('portfolio_no_matching_assets')
                  : undefined
              }
            />
          )}
          <InputComponent
            label="popup_html_transfer_amount"
            type={InputType.NUMBER}
            value={amount}
            min={0}
            onChange={setAmount}
          />
          {mode !== 'sell' && toAssetOptions.length > 0 && (
            <PortfolioOverlayListSelect
              id="portfolio-to-asset"
              label={I18nUtils.getMessage('portfolio_to_asset')}
              options={filteredToAssetOptions}
              value={toAssetId}
              onChange={setToAssetId}
              renderOption={renderToAssetIdentity}
              renderDisplay={renderToAssetIdentity}
              listHeader={
                <div
                  className="portfolio-overlay-select__filters"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}>
                  <div className="portfolio-overlay-select__filters-field portfolio-overlay-select__filters-token">
                    <label htmlFor="portfolio-to-asset-filter">
                      {I18nUtils.getMessage('portfolio_symbol_filter')}
                    </label>
                    <input
                      id="portfolio-to-asset-filter"
                      type="text"
                      placeholder={I18nUtils.getMessage('portfolio_symbol_filter')}
                      value={toAssetFilter}
                      onChange={(event) => setToAssetFilter(event.target.value)}
                    />
                  </div>
                  <div className="portfolio-overlay-select__filters-field portfolio-overlay-select__filters-network">
                    <ComplexeCustomSelect
                      label="portfolio_network"
                      options={toAssetChainSelectOptions}
                      selectedItem={selectedToAssetChainOption}
                      setSelectedItem={(item) =>
                        setToAssetChainFilter(item.value)
                      }
                      showOverlay
                    />
                  </div>
                </div>
              }
              listFooter={
                filteredToAssetOptions.length === 0 ? (
                  I18nUtils.getMessage('portfolio_no_matching_assets')
                ) : hasToAssetFilters && toAssetTruncatedCount > 0 ? (
                  I18nUtils.getMessage(
                    'portfolio_to_asset_results_truncated',
                    [String(toAssetTruncatedCount)],
                  )
                ) : !hasToAssetFilters &&
                  filteredToAssetResult.totalMatches >
                    TO_ASSET_UNFILTERED_MAX ? (
                  I18nUtils.getMessage('portfolio_to_asset_filter_hint')
                ) : undefined
              }
            />
          )}
          <ButtonComponent
            label="portfolio_get_quotes"
            disabled={!canRequestQuotes || isFlowLoading}
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
      isPortfolioLoading && section === 'portfolio' && rows.length > 0;

    const showInitialPortfolioSpinner =
      isPortfolioLoading && rows.length === 0 && section !== 'history';

    const showHistorySpinner =
      isHistoryLoading && history.length === 0 && section === 'history';

    if (showInitialPortfolioSpinner || showHistorySpinner) {
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
              <div className="portfolio-page-header__title">
                <h1>{I18nUtils.getMessage(`portfolio_section_${section}`)}</h1>
                <button
                  aria-label={I18nUtils.getMessage('portfolio_refresh')}
                  className="portfolio-refresh-button"
                  disabled={isPortfolioLoading || isHistoryLoading || isRefreshing}
                  onClick={() => void handleRefreshPortfolioData()}
                  title={I18nUtils.getMessage('portfolio_refresh')}
                  type="button">
                  <SVGIcon
                    className={`portfolio-refresh-icon ${
                      isRefreshing || isPortfolioLoading ? 'rotate' : ''
                    }`}
                    icon={SVGIcons.SWAPS_HISTORY_REFRESH}
                  />
                </button>
              </div>
              <p>{I18nUtils.getMessage('portfolio_page_description')}</p>
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
